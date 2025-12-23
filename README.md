# NestJS API Starter Template

A production-ready NestJS API starter template with pre-configured authentication, database connection, swagger documentation, and best practices.

## 🚀 Features

- **Framework**: [NestJS](https://nestjs.com/) (v11) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT Strategy & Bcrypt for hashing
- **Validation**: Class-validator & Class-transformer
- **Documentation**: Swagger (OpenAPI) & ReDoc
- **Storage**: Azure Storage integration
- **Linting & Formatting**: ESLint & Prettier
- **Environment**: Dotenv for configuration management
- **Testing**: Jest (Unit & E2E)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (Local or Cloud instance)

## 🛠️ Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/kumarsonu676/nestjs-starter-api-template.git
    cd nestjs-starter-api-template
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

## ⚙️ Configuration

1.  **Environment Setup**

    Create a `.env` file in the root directory by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  **Update Environment Variables**

    Open `.env` and fill in the necessary details, especially your database connection string and JWT secret.

    ```env
    # App
    PORT=3001
    NODE_ENV=development

    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"

    # JWT Authentication
    JWT_SECRET=your_super_secret_key_here
    JWT_EXPIRES_IN=30d

    # Azure Storage (Optional)
    AZURE_STORAGE_CONNECTION_STRING=...
    
    # SMTP (Optional)
    SMTP_HOST=...
    ```

3.  **Database Setup**

    Run the Prisma migrations to create the database tables:

    ```bash
    # Generate Prisma Client
    npm run generate_prisma_client

    # Run Migrations
    npm run update_database
    ```

## ▶️ Running the Application

-   **Development Mode**
    ```bash
    npm run start:dev
    ```

-   **Production Mode**
    ```bash
    npm run build
    npm run start:prod
    ```

The API will be available at `http://localhost:3001/api`.

## 📚 Documentation

The API documentation is automatically generated using Swagger.

-   **Swagger UI**: `http://localhost:3001/api/docs`
-   **JSON Spec**: `http://localhost:3001/api-json`

## 🧪 Testing

-   **Unit Tests**
    ```bash
    npm run test
    ```

-   **E2E Tests**
    ```bash
    npm run test:e2e
    ```

-   **Test Coverage**
    ```bash
    npm run test:cov
    ```

## 📂 Project Structure

```
src/
├── common/         # Shared resources (filters, guards, interceptors, pipes)
├── config/         # Configuration files
├── core/           # Core feature modules (Auth, User, etc.)
├── database/       # Database connection and providers
├── health/         # Health check module
├── main.ts         # Application entry point
└── ...
```

## 🔌 API Endpoints

### Authentication
- POST /api/auth/login: User login.
- POST /api/auth/register: User registration.
- POST /api/auth/logout: User logout.

```
POST /api/auth/login
```

```
POST /api/auth/register
```

```
POST /api/auth/logout
```

### Users
- GET /api/users/me: Get current logged in user.
- GET /api/users/:email: Get user by Email.
- POST /api/users: Create user with file upload (Profile Picture, Documents).
- PUT /api/users: Change password.

```
GET /api/users/me
```

```
GET /api/users/:email
```

```
POST /api/users
```

```
PUT /api/users
```

### Countries
- GET /api/countries: Get all countries.
- GET /api/countries/code/:code: Get country by Code.
- GET /api/countries/code-iso3/:codeIso3: Get country by ISO3 Code.

```
GET /api/countries
```

```
GET /api/countries/code/:code
```

```
GET /api/countries/code-iso3/:codeIso3
```

### Health Check
- GET /api/health/check: Check server health.

```
GET /api/health/check
```

## 🤝 Contributing


Contributions are welcome! Please feel free to submit a Pull Request.

##  Author

-   **Sonu Sharma**

## 📄 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [NestJS](https://nestjs.com/)
-   [Prisma](https://www.prisma.io/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [PostgreSQL](https://www.postgresql.org/)
-   [Passport](http://passportjs.org/)
-   [Swagger](https://swagger.io/)

