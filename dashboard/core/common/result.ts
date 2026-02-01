/**
 * Result type for handling success/failure scenarios
 * This is the base type used across all usecases and repositories
 */

export type Success<T> = {
    success: true;
    data: T;
};

export type Failure = {
    success: false;
    error: {
        code: string;
        message: string;
    };
};

export type Result<T> = Success<T> | Failure;

// Helper functions to create Result types
export function success<T>(data: T): Success<T> {
    return { success: true, data };
}

export function failure(code: string, message: string): Failure {
    return { success: false, error: { code, message } };
}

// Common error codes
export const ErrorCodes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Common Pagination Types
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
}

