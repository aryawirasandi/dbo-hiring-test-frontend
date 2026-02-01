# Mock Authentication Guide

This guide describes how the authentication is mocked in the DBO Dashboard application using `json-server`.

## 🧠 Concept

Since `json-server` is primarily a REST API mock for data resources (GET/POST/PUT/DELETE entities) and does not inherently support authentication logic (like comparing passwords), we simulate the login process.

**Strategy**: "The Token Retrieval Pattern"
1.  We store a "valid user session" object in our mock database.
2.  The frontend requests this object via a simple `GET /auth` request.
3.  The frontend "pretends" to validate the credentials or simply accepts the token returned.

## 🛠️ Implementation

### 1. Database Setup (`db.json`)

We define a static `auth` object that acts as our successful login response.

```json
{
  "auth": {
    "user": {
      "id": 1,
      "name": "Admin Super",
      "email": "admin@company.com",
      "role": "Super Admin"
    },
    "token": "mock-jwt-token-12345"
  }
}
```

### 2. Frontend Logic (`AuthRemoteDataSource`)

In `dashboard/core/auth/datasources/auth-datasource.ts`, we perform the "login":

```typescript
// 1. We make a GET request instead of POST
const response = await this.httpClient.get<AuthResponse>('/auth');

// 2. We receive the mock user and token
const authData = response.data;

// 3. (Optional) We can simulate validation logic client-side
if (payload.username === authData.user.email) {
    return success(authData);
}

// Currently, the system accepts ANY credentials for demo purposes
return success(authData);
```

## 🧪 Testing Different Scenarios

### How to Simulate Login Failure?

Since the server always returns the `auth` object (200 OK), you can simulate errors in two ways:

1.  **Stop the JSON Server**: This will trigger a `Network Error` handling in the frontend.
2.  **Modify Code**: Temporarily change the `AuthRemoteDataSource` logic to reject specific emails.
    ```typescript
    if (payload.username !== 'admin@company.com') {
         return failure(ErrorCodes.UNAUTHORIZED, 'Invalid credentials');
    }
    ```

## 🚀 Advanced Mocking (Future Improvements)

If you need a more realistic simulation (e.g., actual POST request validation), you would need to:

1.  Create a custom `server.js` for json-server.
2.  Add a middleware to intercept `POST /login`.
3.  Check `req.body.username` and `req.body.password`.
4.  Return 200 or 401 accordingly.

*For this project, the simplified GET approach is sufficient for UI and flow testing.*
