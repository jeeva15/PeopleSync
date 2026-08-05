# Employee Management API

Production-oriented Java 17 / Spring Boot 3 REST API built with Gradle, a locally installed MySQL server, Flyway, JPA, DTO validation, and a strict controller-service-model/repository separation.

## Architecture

- `controller`: HTTP routing and transport-level validation only.
- `service`: business rules and transaction boundaries.
- `dto`: validated request contracts and persistence-independent responses.
- `model` and `repository`: relational entities and database access.
- `error`: one non-leaking error contract for validation, business, persistence, and unexpected failures.

All routes are under `/api/v1`. Swagger UI is available at `/swagger-ui.html`; the OpenAPI document is at `/v3/api-docs`.

## Secure local setup

Prerequisites: Java 17 and MySQL 8.x installed and running locally. A Gradle 8.14.3 wrapper is committed, so a system Gradle installation is not required. Docker is not used by this project.

1. Create the local database and a least-privilege application account in MySQL. Replace the example password before running these statements:

   ```bash
   mysql -u root -p
   ```

   ```sql
   CREATE DATABASE people_sync CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   CREATE USER 'people_sync_app'@'localhost' IDENTIFIED BY 'replace-with-a-long-random-password';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
       ON people_sync.* TO 'people_sync_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. From the repository root, copy the environment template and set `DB_PASSWORD` to the same password. `.env` is git-ignored; never commit it.

   ```bash
   cp backend/.env.example backend/.env
   ```

3. Export the application credentials without printing them to logs, then run:

   ```bash
   cd backend
   set -a
   source .env
   set +a
   ./gradlew bootRun
   ```

The JDBC pool is HikariCP (Spring Boot's default) and is configurable with `DB_POOL_MAX_SIZE` and `DB_POOL_MIN_IDLE`. Local connection settings come from `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD`. Set `DB_USE_SSL=true` when the MySQL server is configured for TLS.

No username or password has a default in application configuration. Production secrets should come from the deployment platform's secret manager, and database permissions should be limited to this schema.

## API behavior

Employee endpoints:

- `POST /api/v1/employees`
- `GET /api/v1/employees/{id}`
- `PUT /api/v1/employees/{id}`
- `DELETE /api/v1/employees/{id}`
- `GET /api/v1/employees?page=1&pageSize=20&search=tan&departmentId=3&status=ACTIVE&sort=joiningDate&direction=desc`

Pages use the required `{items, page, pageSize, totalItems, totalPages}` shape. Pages are one-based, `pageSize` is limited to 100, searches cover full name and email, and accepted sort fields are `id`, `fullName`, `email`, `jobTitle`, `status`, `joiningDate`, `createdAt`, and `updatedAt`.

Department endpoints:

- `GET /api/v1/departments` (optionally `?activeOnly=true` for selector data)
- `GET /api/v1/departments/{id}`

New and updated employee assignments require an active department. Department deletion is intentionally not exposed. At the database layer, `ON DELETE RESTRICT` prevents deletion while employees refer to a department. This preserves employee history and avoids accidental cascades; a future department-management service should deactivate departments and explicitly reject physical deletion when referenced.

`DELETE /employees/{id}` is status-based deactivation and is idempotent: the employee remains available for audit/reporting and its email remains reserved. This is simpler and safer than a hidden soft-delete flag, though privacy-driven erasure would require a separately authorized anonymization workflow.

Statuses are stored as strings. To add `PROBATION`, add the enum constant and a Flyway migration replacing the employee status check constraint; API and persistence mappings need no redesign.

## Errors and logging

Errors consistently contain `timestamp`, `status`, `code`, `message`, `path`, and `errors`. Responses never include stack traces or database details. Logs are structured as JSON-like single-line records; request bodies, credentials, emails, and other employee details are not logged.

## Tests

Tests require Java 17 only. Repository tests use an in-process H2 database and do not require a local MySQL server:

```bash
./gradlew test
```

The suite contains JUnit 5/Mockito service tests, MVC validation/error-contract tests, and H2-backed repository tests. Flyway migrations are applied against local MySQL when the application starts. For a full clean verification:

```bash
./gradlew clean check
```

The application does not start or manage MySQL. Use your operating system's MySQL service commands when you need to start or stop the local database server.
