# Blog Post API

A RESTful API for managing blog posts built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Features

- User authentication and authorization
- CRUD operations for blog posts
- TypeScript for type safety
- Prisma ORM for database operations
- PostgreSQL database
- Docker support for development and production

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker and Docker Compose
- PostgreSQL

## 🛠️ Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/edwin2236/blog-post-api.git
    cd blog-post-api
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env && pnpx auth secret
    ```

4. Start the development environment:

    ```bash
    docker compose up --build -d
    ```

5. Run generate prisma client

    ```bash
    pnpm prisma:generate
    ```

6. Run database migrations:

    ```bash
    pnpm prisma:migrate
    ```

## 🏃‍♂️ Development

Start the development server:

```bash
pnpm dev
```

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

## 🚀 Production

Build the application:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## 📦 Project Structure

```text
├── .vscode/
│   ├── launch.json
│   └── settings.json
├── compose/
│   ├── .dockerignore
│   ├── docker-compose.yml
│   └── Dockerfile
├── logs/
│   ├── error.log
│   └── combined.log
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   │       ├── controllers/
│   │   │       ├── dtos/
│   │   │       └── auth.router.ts
│   │   ├── users/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   │   └── repositories/
│   │   │   │       └── user-repository.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── mappers/
│   │   │   │       └── user.mapper.ts
│   │   │   └── presentation/
│   │   │       ├── controllers/
│   │   │       │   └── user.controller.ts
│   │   │       ├── dtos/
│   │   │       └── user.router.ts
│   │   ├── posts/
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   └── index.ts
│   ├── shared/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   ├── prisma/
│   │   │   │   │   ├── generated/
│   │   │   │   │   ├── migrations/
│   │   │   │   │   └── schema.prisma
│   │   │   │   └── prisma-client.ts
│   │   │   └── repositories/
│   │   │       └── base-repository.ts
│   │   └── utils/
│   │       ├── loadEnvs.ts
│   │       └── logger.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── eslint.config.js
├── nodemon.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

### Directory Structure Explanation

- **src/**: Source code of the application
  - **features/**: Feature-based modules following clean architecture
    - **auth/**: Authentication and authorization features
    - **users/**: User management features
    - **posts/**: Blog post management features
    - Each feature follows the clean architecture pattern:
      - **application/**: Application services and use cases
      - **domain/**: Domain entities, value objects, and repository interfaces
      - **infrastructure/**: External adapters (database, APIs, etc.)
      - **presentation/**: Controllers, DTOs, and route definitions
  - **shared/**: Shared code across features
    - **domain/**: Shared domain objects
    - **infrastructure/**: Shared infrastructure components (database, repositories)
    - **utils/**: Shared utilities and helpers

- **compose/**: Docker-related files
- **logs/**: Application log files

[Rest of the README remains the same...]
