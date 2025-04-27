# NestJS RPG Battle API

## Overview

This project is a proof-of-concept backend API for managing characters in a role-playing game, developed using NestJS and TypeScript. It serves as the foundational backend system, focusing on character management and battle simulation logic. The state is managed entirely in-memory, without relying on an external database.

## Features

* **Character Management**: Create, list (with cursor-based pagination), and view detailed character information.
* **Battle System**: Simulate turn-based battles between two characters, calculate damage, track health, determine a winner, and generate a battle log.

## Architecture & Best Practices

This project adheres to modern software design principles and best practices:

* **Modular Monolith**: Structured into distinct modules (`character`, `battle`, `shared`) for separation of concerns and maintainability.
* **Clean Architecture**: Organizes code into distinct layers (Domain, Application, Infrastructure, Presentation) ensuring that core business logic is independent of frameworks and external concerns.
* **Domain-Driven Design (DDD)**: Emphasizes the core domain logic using concepts like Entities, Value Objects, and the Repository pattern within each bounded context.
* **Command Query Responsibility Segregation (CQRS)**: Separates operations that change state (Commands) from operations that only read state (Queries) within the Application layer. This is implemented using dedicated Command Handlers and Query Handlers, making the intent of each operation explicit and organizing the application logic more clearly.
* **Dependency Injection**: Leverages NestJS's built-in DI container.
* **Testing**: Includes comprehensive unit tests (Jest) for domain and application logic, and integration tests (Jest + Supertest) focused on the presentation layer (controllers, DTO validation, exception filters) to verify API behavior.
* **Exception Handling**: Uses a global `HttpExceptionFilter` for standardized error responses and defines domain-specific errors.
* **API Documentation**: Automatically generates OpenAPI (Swagger) documentation.
* **Validation**: Uses `class-validator` and `class-transformer` for request DTO validation.

## Tech Stack

* Framework: NestJS (with Fastify Adapter)
* Language: TypeScript
* Testing: Jest
* Validation: class-validator, class-transformer
* API Documentation: Swagger (OpenAPI)

## Project Structure

```plaintext
src/
├── app.module.ts         # Root application module
├── main.ts               # Application entry point & bootstrap
└── modules/
    ├── battle/           # Battle feature module
    │   ├── application/  # Application layer (commands, factories)
    │   ├── domain/       # Domain layer (entities, services, errors, VOs)
    │   └── presentation/ # Presentation layer (controller, DTOs)
    ├── character/        # Character feature module
    │   ├── application/  # Application layer (commands, queries, services, DTOs)
    │   ├── domain/       # Domain layer (entities, enums, errors, VOs)
    │   ├── infra/        # Infrastructure layer (repository implementation)
    │   └── presentation/ # Presentation layer (controller, DTOs)
    └── shared/           # Shared components module
        ├── application/  # Shared application logic (filters, helpers, DTOs)
        ├── config/       # Shared configuration (CORS, Swagger)
        └── domain/       # Shared domain logic (interfaces, errors)
```

## Getting Started

### Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory by copying `.env.example`:

Modify the `.env` file as needed. Key variables include:

* `NODE_ENV`: Application environment (e.g., development, production).
* `API_PORT`: Port the application runs on (default: 3000).
* `API_PREFIX`: Global prefix for API routes (default: /api/v1).
* `CORS_ORIGIN`: Allowed origins for CORS (comma-separated or *).
* `SWAGGER_PREFIX`: Path for Swagger documentation (default: /docs).

### Installation

Install dependencies:

```bash
npm install
```

### Running the Application

To start the application in development mode:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1` (or the port/prefix configured via environment variables).

### API Documentation (Swagger)

Once the application is running, access the Swagger UI for interactive API documentation at:

`http://localhost:3000/api/v1/docs`

## Testing

Run the different test suites:

```bash
# Run all tests
npm test

# Generate test coverage report
npm run test:cov

# Run tests in watch mode (for development)
npm run test:watch
```
