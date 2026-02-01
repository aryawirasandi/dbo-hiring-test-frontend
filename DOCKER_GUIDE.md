# Docker Setup Guide

This guide provides instructions on how to build and run the DBO Dashboard application using Docker and Docker Compose.

## Prerequisites

- **Docker Desktop**: Ensure Docker Desktop is installed and running on your machine.
- **Git**: To clone the repository (if you haven't already).

## Project Architecture

The project consists of two main services defined in `docker-compose.yml`:

1.  **dashboard**: The Nuxt 3 frontend application (running on port `3000`).
2.  **mock-api**: A JSON Server providing mock data (running on port `4200`).

## Running with Docker Compose (Recommended)

The easiest way to run the entire application stack is using Docker Compose.

### 1. Build and Start Services

Open your terminal in the root directory of the project (where `docker-compose.yml` is located) and run:

```bash
docker-compose up --build -d
```

- `--build`: Forces building of images before starting containers.
- `-d`: Detached mode (runs containers in the background).

### 2. Verify Status

Check if the containers are running:

```bash
docker-compose ps
```

You should see:
- `dbo-dashboard` (Up)
- `dbo-mock-api` (Up)

### 3. Access the Application

- **Dashboard**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Mock API**: Open [http://localhost:4200](http://localhost:4200) to see the API root.

### 4. Stop Services

To stop and remove the containers:

```bash
docker-compose down
```

## Running Individual Services (Manual)

If you need to build and run services individually (not recommended as you have to manage networks manually), you can do so using standard Docker commands.

### Build and Run Mock API

1.  **Build Image**:
    ```bash
    docker build -t dbo-mock-api ./mock-api
    ```

2.  **Run Container**:
    ```bash
    docker run -d -p 4200:4200 --name dbo-mock-api dbo-mock-api
    ```

### Build and Run Dashboard

1.  **Build Image**:
    ```bash
    docker build -t dbo-dashboard ./dashboard
    ```

2.  **Run Container**:
    Note: You must link it to the API. If running locally without a docker network, the dashboard inside the container cannot easily reach `localhost:4200` of the host unless configured properly. This is why **Docker Compose** is highly recommended.

    If you must run it manually and the API is running on your host machine at port 4200, you might need to use `host.docker.internal` (Windows/Mac) or the host user IP:
    
    ```bash
    docker run -d -p 3000:3000 --env NUXT_PUBLIC_API_BASE=http://host.docker.internal:4200 --name dbo-dashboard dbo-dashboard
    ```

## TroubleShooting

-   **Port Conflicts**: If port `3000` or `4200` is in use, modify the `ports` mapping in `docker-compose.yml`.
    Example: change `"3000:3000"` to `"8080:3000"` to access the dashboard on port 8080.

-   **Database Persistence**: The mock database is mounted as a volume. Changes made via the API will persist to `./mock-api/db.json` on your host machine.
