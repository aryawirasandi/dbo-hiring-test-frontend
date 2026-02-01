/**
 * Auth Remote Datasource
 * Handles API communication for authentication
 */

import type { AxiosInstance } from 'axios';
import type { AuthPayload, AuthResponse } from '../entity';
import { type Result, success, failure, ErrorCodes } from '../../common';

export interface IAuthRemoteDataSource {
    login(payload: AuthPayload): Promise<Result<AuthResponse>>;
}

export class AuthRemoteDataSource implements IAuthRemoteDataSource {
    constructor(private readonly httpClient: AxiosInstance) { }

    async login(payload: AuthPayload): Promise<Result<AuthResponse>> {
        try {
            const response = await this.httpClient.get<AuthResponse>('/auth');

            // Simulate authentication check (in real app, this would be a POST)
            const authData = response.data;

            if (payload.username === authData.user.email) {
                return success(authData);
            }

            // For demo purposes, accept any credentials
            return success(authData);
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
                const status = axiosError.response?.status;
                const message = axiosError.response?.data?.message || 'Authentication failed';

                if (status === 401) {
                    return failure(ErrorCodes.UNAUTHORIZED, 'Invalid credentials');
                }
                if (status === 404) {
                    return failure(ErrorCodes.NOT_FOUND, 'Auth endpoint not found');
                }
                if (status && status >= 500) {
                    return failure(ErrorCodes.SERVER_ERROR, message);
                }
            }

            if (error instanceof Error) {
                if (error.message.includes('Network Error') || error.message.includes('timeout')) {
                    return failure(ErrorCodes.NETWORK_ERROR, 'Unable to connect to server');
                }
            }

            return failure(ErrorCodes.UNKNOWN_ERROR, 'An unexpected error occurred');
        }
    }
}
