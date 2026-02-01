# Local Development Guide

This guide describes how to run the DBO Dashboard application locally on your machine without Docker.

## Prerequisites

- **Node.js**: Version 18 or higher (v20 recommended).
- **npm**: Installed with Node.js.

## Project Structure

The project is split into two folders which need to be run simultaneously:

- `mock-api/`: The backend JSON server.
- `dashboard/`: The Nuxt 3 frontend application.

## Step-by-Step Instructions

You will need two terminal windows to keep both services running.

### 1. Start the Backend (Mock API)

1.  Open your first terminal.
2.  Navigate to the `mock-api` directory:
    ```bash
    cd mock-api
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    
    > The API will start at **[http://localhost:4200](http://localhost:4200)**.
    > Keep this terminal open.

### 2. Start the Frontend (Dashboard)

1.  Open a **new** terminal window (do not close the previous one).
2.  Navigate to the `dashboard` directory:
    ```bash
    cd dashboard
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    
    > The Dashboard will start at **[http://localhost:3000](http://localhost:3000)** (or the next available port).

### 3. Access the Application

Open your browser and verify the application:

- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:4200/customers](http://localhost:4200/customers) (should return JSON data).

## Configuration

The dashboard is configured to look for the API at `http://localhost:4200` by default via the `.env` file in the `dashboard` directory.

If you need to change the API URL:
1.  Open `dashboard/.env`.
2.  Update `BASE_URL` (or `NUXT_PUBLIC_API_BASE`).
3.  Restart the dashboard server (`Ctrl+C` then `npm run dev`).

## Troubleshooting

-   **Port 4200/3000 already in use**:
    -   **API**: Edit `mock-api/package.json` and change the `--port 4200` to another port.
    -   **Dashboard**: Nuxt will automatically try the next available port (e.g., 3001), but make sure to update the CORS/API configuration if needed.
