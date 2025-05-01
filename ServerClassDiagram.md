# Server-Side Class Diagrams for SQL Chat Assistant

Based on the server structure and backend requirements, here are the key server-side classes for the SQL Chat Assistant system.

## 1. APIServer Class

```
+-------------------------------+
|         APIServer             |
+-------------------------------+
| - port: Integer               |
| - host: String                |
| - middlewares: Middleware[]   |
| - routes: Route[]             |
| - authManager: AuthManager    |
+-------------------------------+
| + initialize(): void          |
| + registerRoutes(): void      |
| + applyMiddleware(): void     |
| + start(): void               |
| + stop(): void                |
| + handleError(): void         |
+-------------------------------+
```

## 2. DatabaseController Class

```
+-------------------------------------+
|        DatabaseController           |
+-------------------------------------+
| - connectionManager: ConnManager    |
| - schemaCache: Map<String, Schema>  |
+-------------------------------------+
| + getConnections(userId): Conn[]    |
| + addConnection(conn): String       |
| + testConnection(conn): Boolean     |
| + deleteConnection(id): Boolean     |
| + getSchema(connId): Schema         |
| + refreshSchema(connId): Schema     |
| + validateCredentials(conn): Boolean|
+-------------------------------------+
```

## 3. ChatController Class

```
+-------------------------------------+
|         ChatController              |
+-------------------------------------+
| - sessionManager: SessionManager    |
| - messageRepository: MessageRepo    |
+-------------------------------------+
| + getSessions(userId): Session[]    |
| + getSessionById(id): Session       |
| + createSession(session): String    |
| + updateSession(id, data): Boolean  |
| + deleteSession(id): Boolean        |
| + getMessages(sessionId): Message[] |
| + addMessage(message): String       |
+-------------------------------------+
```

## 4. TextToSQLProcessor Class

```
+-------------------------------------+
|       TextToSQLProcessor            |
+-------------------------------------+
| - apiKey: String                    |
| - pipeline: Pipeline                |
| - validator: QueryValidator         |
| - generator: GeminiSQLGenerator     |
| - verifier: QueryVerifier           |
+-------------------------------------+
| + initialize(): void                |
| + processQuery(query, schema): SQL  |
| + validateQuery(query): Boolean     |
| + generateSQL(query, schema): String|
| + verifySQL(sql, query): Boolean    |
| + buildPipeline(): Pipeline         |
+-------------------------------------+
```

## 5. QueryExecutorService Class

```
+------------------------------------------+
|         QueryExecutorService             |
+------------------------------------------+
| - connectionPool: Map<String, Pool>      |
| - queryTimeout: Integer                  |
| - logger: QueryLogger                    |
+------------------------------------------+
| + executeQuery(connId, sql): Result      |
| + getConnectionFromPool(connId): Conn    |
| + formatResults(rawResults): Object      |
| + handleQueryError(error): Error         |
| + cleanSQLQuery(query): String           |
| + trackExecutionTime(id): Stats          |
+------------------------------------------+
```

## 6. AuthService Class

```
+------------------------------------------+
|            AuthService                   |
+------------------------------------------+
| - userRepository: UserRepository         |
| - jwtSecret: String                      |
| - privateKey: String                     |
| - publicKey: String                      |
| - tokenExpiry: Integer                   |
+------------------------------------------+
| + registerUser(userData): User           |
| + loginUser(credentials): Token          |
| + verifyToken(token): Payload            |
| + generateToken(userId): Token           |
| + refreshToken(token): Token             |
| + hashPassword(password): String         |
| + comparePasswords(hash, pwd): Boolean   |
| + signJWT(payload): String               |
| + verifyJWT(token): Payload              |
+------------------------------------------+
```

## 7. SchemaService Class

```
+------------------------------------------+
|           SchemaService                  |
+------------------------------------------+
| - dbConnector: DatabaseConnector         |
| - schemaCache: Map<String, Schema>       |
| - cacheTimeout: Integer                  |
+------------------------------------------+
| + getSchema(connId): Schema              |
| + extractSchema(connection): Schema      |
| + cacheSchema(connId, schema): void      |
| + invalidateCache(connId): void          |
| + getTableDetails(connId, table): Table  |
| + getForeignKeys(connId): Relations[]    |
| + getPrimaryKeys(connId): Keys[]         |
+------------------------------------------+
```

## 8. UserService Class

```
+------------------------------------------+
|             UserService                  |
+------------------------------------------+
| - userRepository: UserRepository         |
| - settingsRepository: SettingsRepository |
+------------------------------------------+
| + createUser(userData): User             |
| + getUserById(id): User                  |
| + getUserByEmail(email): User            |
| + updateUser(id, data): Boolean          |
| + deleteUser(id): Boolean                |
| + getUserSettings(userId): Settings      |
| + updateSettings(userId, data): Boolean  |
| + validateUserData(data): Boolean        |
+------------------------------------------+
```

## 9. LoggingService Class

```
+------------------------------------------+
|           LoggingService                 |
+------------------------------------------+
| - logRepository: LogRepository           |
| - logLevel: String                       |
| - retention: Integer                     |
+------------------------------------------+
| + logQuery(queryData): String            |
| + logError(error): String                |
| + logAccess(accessData): String          |
| + getQueryLogs(userId): Log[]            |
| + getErrorLogs(): Log[]                  |
| + getAccessLogs(userId): Log[]           |
| + cleanupOldLogs(): void                 |
| + exportLogs(options): File              |
+------------------------------------------+
```

## 10. NLPService Class

```
+------------------------------------------+
|              NLPService                  |
+------------------------------------------+
| - geminiClient: GeminiClient             |
| - apiKey: String                         |
| - models: Map<String, Model>             |
+------------------------------------------+
| + configureAPI(apiKey): void             |
| + generateContent(prompt): Response      |
| + analyzeQuery(query): Analysis          |
| + generateNaturalResponse(data): String  |
| + removeMarkdown(text): String           |
| + handleAPIError(error): Error           |
| + optimizePrompt(prompt): String         |
+------------------------------------------+
``` 