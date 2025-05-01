# Key Object Classes for SQL Chat Assistant

Based on the SRS document, here are the key object classes identified in the system, along with their attributes and methods using standard UML notation.

## 1. User Class

```
+------------------------+
|         User           |
+------------------------+
| - id: String           |
| - name: String         |
| - email: String        |
| - passwordHash: String |
| - createdAt: Date      |
| - lastLogin: Date      |
| - isActive: Boolean    |
| - role: String         |
+------------------------+
| + register(): Boolean  |
| + login(): Token       |
| + logout(): Boolean    |
| + resetPassword(): Bool|
| + updateProfile(): Bool|
| + changePassword(): Bool|
+------------------------+
```

## 2. DatabaseConnection Class

```
+-------------------------------+
|      DatabaseConnection       |
+-------------------------------+
| - id: String                  |
| - userId: String              |
| - name: String                |
| - type: String                |
| - connectionString: String    |
| - isActive: Boolean           |
| - lastUsed: Date              |
| - createdAt: Date             |
| - updatedAt: Date             |
+-------------------------------+
| + testConnection(): Boolean   |
| + connect(): Connection       |
| + disconnect(): Boolean       |
| + getSchema(): Schema         |
| + save(): Boolean             |
| + update(): Boolean           |
| + delete(): Boolean           |
+-------------------------------+
```

## 3. ChatSession Class

```
+--------------------------------+
|         ChatSession            |
+--------------------------------+
| - id: String                   |
| - userId: String               |
| - connectionId: String         |
| - title: String                |
| - createdAt: Date              |
| - updatedAt: Date              |
+--------------------------------+
| + create(): Boolean            |
| + getMessages(): Message[]     |
| + addMessage(): Boolean        |
| + updateTitle(): Boolean       |
| + delete(): Boolean            |
| + export(): File               |
+--------------------------------+
```

## 4. ChatMessage Class

```
+--------------------------------+
|         ChatMessage            |
+--------------------------------+
| - id: String                   |
| - sessionId: String            |
| - role: String                 |
| - content: String              |
| - sqlQuery: String             |
| - createdAt: Date              |
+--------------------------------+
| + save(): Boolean              |
| + delete(): Boolean            |
| + generateResponse(): String   |
+--------------------------------+
```

## 5. UserSettings Class

```
+--------------------------------+
|         UserSettings           |
+--------------------------------+
| - userId: String               |
| - queryTimeout: Integer        |
| - autoDisconnect: Boolean      |
| - showSqlQueries: Boolean      |
| - theme: String                |
| - createdAt: Date              |
| - updatedAt: Date              |
+--------------------------------+
| + save(): Boolean              |
| + update(): Boolean            |
| + getSettings(): Settings      |
+--------------------------------+
```

## 6. QueryProcessor Class

```
+----------------------------------+
|        QueryProcessor            |
+----------------------------------+
| - apiKey: String                 |
| - queryValidator: QueryValidator |
| - sqlGenerator: SQLGenerator     |
+----------------------------------+
| + processQuery(query): SQL       |
| + validateQuery(): Boolean       |
| + generateSQL(): String          |
| + verifySQL(): Boolean           |
| + optimizeQuery(): String        |
+----------------------------------+
```

## 7. QueryExecutor Class

```
+--------------------------------+
|        QueryExecutor           |
+--------------------------------+
| - connectionId: String         |
| - sql: String                  |
| - timeout: Integer             |
+--------------------------------+
| + execute(): Result            |
| + validateSyntax(): Boolean    |
| + formatResults(): Object      |
| + trackPerformance(): Stats    |
| + handleError(): Error         |
+--------------------------------+
```

## 8. SchemaVisualizer Class

```
+--------------------------------+
|       SchemaVisualizer         |
+--------------------------------+
| - connectionId: String         |
| - tables: Table[]              |
| - relationships: Relation[]    |
+--------------------------------+
| + fetchSchema(): Schema        |
| + renderTables(): Component    |
| + showRelationships(): Comp    |
| + getTableDetails(): Table     |
| + updateSchema(): Boolean      |
+--------------------------------+
```

## 9. AuthenticationManager Class

```
+----------------------------------+
|     AuthenticationManager        |
+----------------------------------+
| - jwtSecret: String              |
| - refreshTokens: Map<String>     |
| - tokenExpiry: Integer           |
+----------------------------------+
| + generateToken(): Token         |
| + verifyToken(): Boolean         |
| + refreshToken(): Token          |
| + revokeToken(): Boolean         |
| + hashPassword(): String         |
| + verifyPassword(): Boolean      |
+----------------------------------+
```

## 10. QueryLogger Class

```
+------------------------------+
|        QueryLogger           |
+------------------------------+
| - id: String                 |
| - userId: String             |
| - connectionId: String       |
| - query: String              |
| - executionTime: Integer     |
| - status: String             |
| - errorMessage: String       |
| - createdAt: Date            |
+------------------------------+
| + logQuery(): Boolean        |
| + getStats(): Statistics     |
| + searchLogs(): Log[]        |
| + exportLogs(): File         |
+------------------------------+
``` 