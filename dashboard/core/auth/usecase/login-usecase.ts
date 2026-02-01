/**
 * Login Use Case
 * Business logic for user authentication
 */

import type { AuthPayload, AuthResponse } from '../entity';
import type { IAuthRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface ILoginUseCase {
    execute(payload: AuthPayload): Promise<Result<AuthResponse>>;
}

export class LoginUseCase implements ILoginUseCase {
    constructor(private readonly authRepository: IAuthRepository) { }

    async execute(payload: AuthPayload): Promise<Result<AuthResponse>> {
        // Validate input
        if (!payload.username || payload.username.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Username is required');
        }

        if (!payload.password || payload.password.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Password is required');
        }

        if (payload.password.length < 6) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Password must be at least 6 characters');
        }

        // Execute login
        return this.authRepository.login(payload);
    }
}
