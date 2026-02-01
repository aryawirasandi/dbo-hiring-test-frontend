# DBO Admin Dashboard

A modern, responsive admin dashboard for managing detailed business operations (DBO), built with **Nuxt 3**, **Nuxt UI**, and **TailwindCSS**.

## 🏗️ Clean Architecture

This project strictly follows **Clean Architecture** principles to ensure scalability, maintainability, and testability. The code is organized to separate concerns (SoC), ensuring that business logic is independent of the UI and external frameworks.

### Architectural Layers

The codebase is vertically sliced by features (modules) within the `core/` directory, and horizontally layered within each module.

1.  **Domain Layer (Entities)**
    *   **Location**: `core/{module}/entity/`
    *   **Purpose**: Defines the core business objects and types. These are pure TypeScript interfaces/classes with no external dependencies.
    *   **Example**: `User`, `Customer`, `Order` interfaces.

2.  **Application Layer (Use Cases)**
    *   **Location**: `core/{module}/use-cases/`
    *   **Purpose**: Encapsulates specific business rules and application logic. Each Use Case represents a single action the user can perform.
    *   **Responsibility**: Orchestrates the flow of data between the Repository and the Entity, containing purely business logic.
    *   **Example**: `LoginUseCase`, `GetCustomersUseCase`.

3.  **Interface Adapters (Repositories)**
    *   **Location**: `core/{module}/repositories/`
    *   **Purpose**: Acts as a bridge between the Use Cases and the Data Sources.
    *   **Responsibility**: The `Repository` implementation decides *where* to get data from (API, Cache, LocalStorage) but exposes a clean interface to the Use Case. This allows swapping data sources without touching business logic.

4.  **Data Layer (Data Sources)**
    *   **Location**: `core/{module}/datasources/`
    *   **Purpose**: Handles the raw details of fetching data.
    *   **Responsibility**: Makes actual HTTP requests using Axios or queries a database. It maps raw API responses to domain Entities.

5.  **Presentation Layer (UI)**
    *   **Location**: `app/pages`, `app/composables`
    *   **Purpose**: The user interface built with Vue.js/Nuxt.
    *   **Interaction**: Vues components use **Composables** (e.g., `useAuth`) which act as the "Presentation Logic" or "Controller". The Composable instantiates the required Use Cases and Repositories, executing the business logic and updating the reactive state.

### Dependency Rule
Dependencies only point **inwards** or towards the center. The UI depends on Use Cases, Use Cases depend on Entities/Repositories. The Core layer knows nothing about the UI (Vue/Nuxt).

## 📂 Project Structure

```
dashboard/
├── app/                        # Nuxt 3 Frontend (Presentation Layer)
│   ├── composables/            # Logic to connect UI with Core (Controllers)
│   ├── layouts/                # App layouts
│   └── pages/                  # Vue components/Pages
│
├── core/                       # Core Business Logic (Domain & Data Layers)
│   ├── auth/                   # Auth Module
│   ├── customer-management/    # Customer Module
│   ├── order-management/       # Order Module
│   │   ├── datasources/        # API calls
│   │   ├── entity/             # Types/Models
│   │   ├── repositories/       # Data mediation
│   │   └── use-cases/          # Business actions
│   ├── common/                 # Shared types & utilities
│   └── supplier-management/    # Supplier Module
│
├── infrastructure/             # External Drivers (Frameworks, Libraries)
│   └── index.ts                # Axios instance configuration
│
├── mock-api/                   # Standalone JSON Server (Backend)
└── docker-compose.yml          # Container orchestration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation

```bash
npm install
```

### Running Locally

To run the full stack (Dashboard + Mock API), please refer to **[LOCAL_RUN_GUIDE.md](../LOCAL_RUN_GUIDE.md)** or use the command below if the API is already running:

```bash
npm run dev
```

The dashboard will be available at http://localhost:3000.

### Running with Docker

Please refer to **[DOCKER_GUIDE.md](../DOCKER_GUIDE.md)** for detailed container instructions.

## ✅ Testing

Unit tests are co-located or placed in `tests/` mirroring the core structure. Current test coverage focuses on Datasources and Business Logic.

```bash
npm test
```
