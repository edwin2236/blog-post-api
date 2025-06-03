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
    git clone <repository-url>
    cd blog-post-api
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env
    ```

4. Start the development environment:

    ```bash
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    ```

5. Run database migrations:

    ```bash
    pnpm prisma migrate dev
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
.vscode/
│   ├── launch.json
│   └── settings.json
├── compose/
│   ├── .dockerignore
│   ├── docker-compose.yml
│   └── Dockerfile
├── src/
│   ├── app/
│   │   ├── users/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── dtos/
│   │   │   └── user.router.ts
│   │   └── posts/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── dtos/
│   │   │   └── user.router.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   └── environment.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── loadEnvs.ts
│   │   │   ├── logger.ts
│   │   └── server.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── tests/
│   ├── integration/
│   └── unit/
├── .env.example
├── .gitignore
├── eslint.config.js
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

### Directory Structure Explanation

- **src/**: Source code of the application
  - **app/**: Feature-based modules
    - **users/**: User-related features
    - **posts/**: Blog post-related features
  - **config/**: Application configuration files
  - **middleware/**: Express middleware functions
  - **utils/**: Shared utilities and helpers

- **prisma/**: Database schema and migrations
- **tests/**: Test files
  - **integration/**: Integration tests
  - **unit/**: Unit tests
- **docker/**: Docker-related files
- **docker-compose.yml**: Base Docker composition
- **docker-compose.dev.yml**: Development-specific Docker overrides

[Rest of the README remains the same...]
