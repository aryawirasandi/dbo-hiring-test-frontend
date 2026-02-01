/**
 * Auth Entity Types
 */

export interface AuthPayload {
    username: string;
    password: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
