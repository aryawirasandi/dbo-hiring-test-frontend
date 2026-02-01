/**
 * Login Use Case Tests
 * Tests for Login Use Case covering both success and failure scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase, type IAuthRepository } from '../../../core/auth';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('LoginUseCase', () => {
    let mockRepository: IAuthRepository;
    let loginUseCase: LoginUseCase;

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
        mockRepository = {
            login: vi.fn(),
        };
        loginUseCase = new LoginUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should login successfully with valid credentials', async () => {
            vi.mocked(mockRepository.login).mockResolvedValue(success(mockAuthResponse));

            const result = await loginUseCase.execute({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.user.email).toBe('admin@company.com');
                expect(result.data.token).toBe('mock-jwt-token-12345');
            }
            expect(mockRepository.login).toHaveBeenCalledWith({
                username: 'admin@company.com',
                password: 'password123',
            });
        });

        it('should pass credentials to repository correctly', async () => {
            vi.mocked(mockRepository.login).mockResolvedValue(success(mockAuthResponse));

            await loginUseCase.execute({
                username: 'test@example.com',
                password: 'testpass123',
            });

            expect(mockRepository.login).toHaveBeenCalledWith({
                username: 'test@example.com',
                password: 'testpass123',
            });
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when username is empty', async () => {
            const result = await loginUseCase.execute({
                username: '',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Username is required');
            }
            expect(mockRepository.login).not.toHaveBeenCalled();
        });

        it('should fail when username is only whitespace', async () => {
            const result = await loginUseCase.execute({
                username: '   ',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Username is required');
            }
        });

        it('should fail when password is empty', async () => {
            const result = await loginUseCase.execute({
                username: 'admin@company.com',
                password: '',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Password is required');
            }
        });

        it('should fail when password is too short', async () => {
            const result = await loginUseCase.execute({
                username: 'admin@company.com',
                password: '12345',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Password must be at least 6 characters');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate unauthorized error from repository', async () => {
            vi.mocked(mockRepository.login).mockResolvedValue(
                failure(ErrorCodes.UNAUTHORIZED, 'Invalid credentials')
            );

            const result = await loginUseCase.execute({
                username: 'wrong@email.com',
                password: 'wrongpassword',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED);
                expect(result.error.message).toBe('Invalid credentials');
            }
        });

        it('should propagate network error from repository', async () => {
            vi.mocked(mockRepository.login).mockResolvedValue(
                failure(ErrorCodes.NETWORK_ERROR, 'Unable to connect to server')
            );

            const result = await loginUseCase.execute({
                username: 'admin@company.com',
                password: 'password123',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NETWORK_ERROR);
            }
        });

        it('should propagate server error from repository', async () => {
            vi.mocked(mockRepository.login).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await loginUseCase.execute({
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