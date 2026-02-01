/**
 * Auth Repository
 * Abstracts data source and provides clean interface for usecases
 */

import type { AuthPayload, AuthResponse } from '../entity';
import type { IAuthRemoteDataSource } from '../datasources';
import type { Result } from '../../common';

export interface IAuthRepository {
    login(payload: AuthPayload): Promise<Result<AuthResponse>>;
}

export class AuthRepository implements IAuthRepository {
    constructor(private readonly remoteDataSource: IAuthRemoteDataSource) { }

    async login(payload: AuthPayload): Promise<Result<AuthResponse>> {
        return this.remoteDataSource.login(payload);
    }
}
