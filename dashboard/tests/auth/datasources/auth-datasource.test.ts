/**
 * Auth Remote DataSource Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthRemoteDataSource } from '../../../core/auth';
import { ErrorCodes } from '../../../core/common';
import type { AxiosInstance, AxiosError } from 'axios';

describe('AuthRemoteDataSource', () => {
    let mockAxios: AxiosInstance;
    let authDataSource: AuthRemoteDataSource;

    const mockDbResponse = {
        "user": {
            "id": 1,
            "name": "Admin Super",
            "email": "admin@company.com",
            "role": "Super Admin"
        },
        "token": "mock-jwt-token-12345"
    };

    beforeEach(() => {
        mockAxios = {
            post: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        } as unknown as AxiosInstance;
        authDataSource = new AuthRemoteDataSource(mockAxios);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should login successfully and return auth response', async () => {
            vi.mocked(mockAxios.get).mockResolvedValue({ data: mockDbResponse });

            const result = await authDataSource.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.user.email).toBe('admin@company.com');
                expect(result.data.token).toBe('mock-jwt-token-12345');
            }
        });

        it('should call correct API endpoint', async () => {
            vi.mocked(mockAxios.get).mockResolvedValue({ data: mockDbResponse });

            await authDataSource.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(mockAxios.get).toHaveBeenCalledWith('/auth');
        });
    });

    describe('Failure Scenarios', () => {
        it('should return UNAUTHORIZED error for 401 response', async () => {
            const axiosError = {
                isAxiosError: true,
                response: { status: 401, data: { message: 'Invalid credentials' } },
            } as AxiosError;
            vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

            const result = await authDataSource.login({
                username: 'wrong@email.com',
                password: 'wrongpass',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED);
            }
        });

        it('should return NOT_FOUND error for 404 response', async () => {
            const axiosError = {
                isAxiosError: true,
                response: { status: 404 },
            } as AxiosError;
            vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

            const result = await authDataSource.login({
                username: 'notfound@email.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });

        it('should return SERVER_ERROR for 500 response', async () => {
            const axiosError = {
                isAxiosError: true,
                response: { status: 500 },
            } as AxiosError;
            vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

            const result = await authDataSource.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
            }
        });

        it('should return UNKNOWN_ERROR when no response and no network error', async () => {
            const axiosError = {
                isAxiosError: true,
                response: undefined,
                request: {},
            } as AxiosError;
            vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

            const result = await authDataSource.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.UNKNOWN_ERROR);
            }
        });

        it('should return NETWORK_ERROR for network error', async () => {
            const networkError = new Error('Network Error');
            vi.mocked(mockAxios.get).mockRejectedValue(networkError);

            const result = await authDataSource.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NETWORK_ERROR);
            }
        });
    });
});
