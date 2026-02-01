/**
 * Auth Repository Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthRepository, type IAuthRemoteDataSource } from '../../../core/auth';
import { success, failure, ErrorCodes } from '../../../core/common';

describe('AuthRepository', () => {
    let mockDataSource: IAuthRemoteDataSource;
    let authRepository: AuthRepository;

    const mockAuthResponse = {
        user: {
            id: 1,
            name: 'Admin Super',
            email: 'admin@company.com',
            role: 'Super Admin',
        },
        token: 'mock-jwt-token-12345',
    };

    beforeEach(() => {
        mockDataSource = {
            login: vi.fn(),
        };
        authRepository = new AuthRepository(mockDataSource);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should delegate login to datasource and return success', async () => {
            vi.mocked(mockDataSource.login).mockResolvedValue(success(mockAuthResponse));

            const result = await authRepository.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.user.email).toBe('admin@company.com');
            }
            expect(mockDataSource.login).toHaveBeenCalledWith({
                username: 'admin@company.com',
                password: 'password123',
            });
        });
    });

    describe('Failure Scenarios', () => {
        it('should propagate unauthorized error from datasource', async () => {
            vi.mocked(mockDataSource.login).mockResolvedValue(
                failure(ErrorCodes.UNAUTHORIZED, 'Invalid credentials')
            );

            const result = await authRepository.login({
                username: 'wrong@email.com',
                password: 'wrongpass',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED);
            }
        });

        it('should propagate network error from datasource', async () => {
            vi.mocked(mockDataSource.login).mockResolvedValue(
                failure(ErrorCodes.NETWORK_ERROR, 'Unable to connect')
            );

            const result = await authRepository.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NETWORK_ERROR);
            }
        });

        it('should propagate server error from datasource', async () => {
            vi.mocked(mockDataSource.login).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await authRepository.login({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
            }
        });
    });
});
