from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import re
import google.generativeai as genai
from haystack.nodes import BaseComponent
from haystack.pipelines import Pipeline
from sqlalchemy import create_engine, MetaData, text
import urllib.parse

# ---------- Utility Functions ----------

def remove_markdown_code_fence(sql_query: str) -> str:
    if sql_query.startswith("```"):
        lines = sql_query.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        sql_query = "\n".join(lines)
    return sql_query.strip()

def clean_sql_query(sql_query: str) -> str:
    cleaned = re.sub(r'[\n\t]', ' ', sql_query)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def get_db_schema(db_url: str) -> dict:
    engine = create_engine(db_url)
    metadata = MetaData()
    metadata.reflect(bind=engine)
    schema = {}
    for table in metadata.tables.values():
        columns = [col.name for col in table.columns]
        primary_key = [col.name for col in table.columns if col.primary_key]
        foreign_keys = {}
        for col in table.columns:
            for fk in col.foreign_keys:
                foreign_keys[col.name] = fk.target_fullname
        schema[table.name] = {
            "columns": columns,
            "primary_key": primary_key,
            "foreign_keys": foreign_keys
        }
    return schema

# ---------- Components ----------

class QueryValidator(BaseComponent):
    outgoing_edges = 1
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
    def run(self, query: str, table_structure: dict, **kwargs):
        prompt = (
            "Determine if the following natural language query is related to the provided table schema. "
            "Return 'true' if it is, and 'false' if it is not.\n\n"
            "Table Schema (JSON):\n"
            f"{json.dumps(table_structure, indent=2)}\n\n"
            "Query:\n"
            f"{query}\n"
        )
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        answer = response.text.strip().lower()
        is_valid = "true" in answer
        return {"is_valid": is_valid}, "output"
    def run_batch(self, queries: list, table_structures: list, **kwargs):
        results = []
        for query, table_structure in zip(queries, table_structures):
            result, _ = self.run(query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

class GeminiSQLGenerator(BaseComponent):
    outgoing_edges = 1
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
    def run(self, query: str, table_structure: dict, dialect: str = "generic SQL", **kwargs):
        system_prompt = (
            f"SQL Dialect: {dialect}\n\n"
            "System Prompt: SQL Table Structure (in JSON):\n"
            f"{json.dumps(table_structure, indent=2)}\n\n"
            "User Query:\n"
            f"{query}\n\n"
            "Generate the corresponding SQL query:"
        )
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(system_prompt)
        sql_query = response.text.strip()
        sql_query = remove_markdown_code_fence(sql_query)
        return {"sql_query": sql_query}, "output"
    def run_batch(self, queries: list, table_structures: list, **kwargs):
        results = []
        for query, table_structure in zip(queries, table_structures):
            result, _ = self.run(query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

class QueryVerifier(BaseComponent):
    outgoing_edges = 1
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
    def run(self, sql_query: str, user_query: str, table_structure: dict, dialect: str = "generic SQL", **kwargs):
        valid_count = 0
        for _ in range(3):
            prompt = (
                f"SQL Dialect: {dialect}\n\n"
                "Validate the following SQL query for correctness with respect to the provided natural language query "
                "and table schema. Return 'true' if the query is correct, and 'false' if it is not.\n\n"
                "Table Schema (JSON):\n"
                f"{json.dumps(table_structure, indent=2)}\n\n"
                "Natural Language Query:\n"
                f"{user_query}\n\n"
                "SQL Query:\n"
                f"{sql_query}\n"
            )
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            answer = response.text.strip().lower()
            if "false" in answer:
                return {"is_valid": False}, "output"
            elif "true" in answer:
                valid_count += 1
        is_valid = valid_count == 3
        return {"is_valid": is_valid}, "output"
    def run_batch(self, sql_queries: list, user_queries: list, table_structures: list, **kwargs):
        results = []
        for sql_query, user_query, table_structure in zip(sql_queries, user_queries, table_structures):
            result, _ = self.run(sql_query, user_query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

class AgenticSQLGenerator(BaseComponent):
    outgoing_edges = 1
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.sql_generator = GeminiSQLGenerator(api_key)
        self.query_verifier = QueryVerifier(api_key)
    def run(self, query: str, table_structure: dict, dialect: str = "generic SQL", **kwargs):
        max_attempts = 5
        attempt = 0
        valid_sql = None
        while attempt < max_attempts:
            result, _ = self.sql_generator.run(query, table_structure, dialect=dialect, **kwargs)
            generated_sql = result["sql_query"]
            verifier_result, _ = self.query_verifier.run(
                sql_query=generated_sql,
                user_query=query,
                table_structure=table_structure,
                dialect=dialect,
                **kwargs
            )
            if verifier_result["is_valid"]:
                valid_sql = generated_sql
                break
            attempt += 1
        if valid_sql is None:
            return {"sql_query": None, "message": "False: Unable to generate a valid SQL query after 5 attempts."}, "output"
        else:
            return {"sql_query": valid_sql, "message": "Generated SQL Query successfully."}, "output"
    def run_batch(self, queries: list, table_structures: list, **kwargs):
        results = []
        for query, table_structure in zip(queries, table_structures):
            result, _ = self.run(query, table_structure, **kwargs)
            results.append(result)
        return results, "output"

def build_pipeline(api_key: str) -> Pipeline:
    pipeline = Pipeline()
    validator_node = QueryValidator(api_key=api_key)
    agentic_node = AgenticSQLGenerator(api_key=api_key)
    pipeline.add_node(component=validator_node, name="QueryValidator", inputs=["Query"])
    pipeline.add_node(component=agentic_node, name="AgenticSQLGenerator", inputs=["Query"])
    return pipeline

# ----- CHANGED: Convert SQLAlchemy rows to dicts using row._mapping -----
def execute_sql_query(db_url: str, sql_query: str):
    """
    Execute the SQL query using SQLAlchemy and return the fetched data and column names.
    """
    sql_query = clean_sql_query(sql_query)
    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text(sql_query))
        data = [dict(row._mapping) for row in result.fetchall()]
        columns = list(result.keys())
    return columns, data

def generate_natural_language_response(user_query: str, columns, data):
    prompt = (
        "You are an expert data interpreter. Based on the following query results, provide a clear and detailed summary in bullet points. "
        "Include specific details and avoid mentioning SQL or technical details.\n\n"
        "Columns: " + ', '.join(columns) + ".\n"
        "Data: " + str(data) + ".\n"
        "User Request: " + user_query + "\n\n"
        "Provide your summary in a bullet point list format:"
    )
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()

# ---------- FastAPI Setup ----------

app = FastAPI()

class QueryRequest(BaseModel):
    query: str
    db_url: str
    dialect: str = "generic SQL"

@app.post("/generate")
async def generate_sql(req: QueryRequest):
    if not req.query:
        raise HTTPException(status_code=400, detail="Please enter a natural language query.")
    if not req.db_url:
        raise HTTPException(status_code=400, detail="Please provide a database connection string.")
    try:
        table_structure = get_db_schema(req.db_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving schema: {str(e)}")
    
    API_KEY = "AIzaSyD6w2zcsXw-F6KGmlCQBUTQpQ6F2a9qlWs"
    validator = QueryValidator(api_key=API_KEY)
    valid_result, _ = validator.run(query=req.query, table_structure=table_structure)
    if not valid_result["is_valid"]:
        raise HTTPException(status_code=400, detail="False: The query is not related to the provided table schema.")

    pipeline = build_pipeline(API_KEY)
    result = pipeline.run(
        query=req.query,
        params={
            "QueryValidator": {"table_structure": table_structure},
            "AgenticSQLGenerator": {"table_structure": table_structure, "dialect": req.dialect}
        }
    )
    
    if result["sql_query"] is None:
        raise HTTPException(status_code=400, detail=result["message"])
    sql_query = result["sql_query"]

    try:
        columns, data = execute_sql_query(req.db_url, sql_query)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error executing SQL query: {str(e)}")
    
    explanation = generate_natural_language_response(req.query, columns, data)
    return {
        "sql_query": sql_query,
        "columns": columns,
        "data": data,
        "explanation": explanation
    }

# ---------- New Endpoint: Return Database Schema ----------

@app.get("/schema")
async def schema_endpoint(db_url: str):
    if not db_url:
        raise HTTPException(status_code=400, detail="Please provide a database connection string.")
    try:
        schema = get_db_schema(db_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving schema: {str(e)}")
    return {"schema": schema}

