# DBO Admin Dashboard Project

Welcome to the DBO Admin Dashboard repository. This project is a modern web application designed for managing business operations, including customer and order management.

## 📁 Project Structure

This repository is organized as a monorepo containing two main components:

-   **`dashboard/`**: The frontend application built with **Nuxt 3**, **Nuxt UI**, and Clean Architecture.
-   **`mock-api/`**: A lightweight backend server using **JSON Server** to provide mock data.

## 📖 Key Documentation

We have prepared detailed guides to help you get started:

### 🚀 Getting Started

-   **[Local Development Guide](./LOCAL_RUN_GUIDE.md)**:
    Follow this if you want to run the project manually on your machine (npm run dev).
    
-   **[Docker Setup Guide](./DOCKER_GUIDE.md)**:
    Follow this if you prefer using Docker containers to run the full stack with one command.

### 📚 Technical Documentation

-   **[Project Architecture](./dashboard/README.md)**:
    Deep dive into the Clean Architecture principles, folder structure, and tech stack used in the dashboard.

-   **[Mock Authentication Guide](./MOCK_AUTH_GUIDE.md)**:
    Explanation of how the mock login system works (since we don't use a real backend for this task).

## ⚡ Quick Start (Docker)

If you have Docker installed, the fastest way to run the project is:

```bash
docker-compose up --build -d
```

Then access:
-   **Dashboard**: http://localhost:3000
-   **API**: http://localhost:4200

## 🧪 Tech Stack

-   **Framework**: Nuxt 3 (Vue.js)
-   **UI Library**: Nuxt UI (TailwindCSS)
-   **Language**: TypeScript
-   **Testing**: Vitest
-   **Architecture**: Clean Architecture (Entities, Use Cases, Repositories, Datasources)
