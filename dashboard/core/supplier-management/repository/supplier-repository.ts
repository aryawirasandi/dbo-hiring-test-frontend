/**
 * Supplier Repository
 */

import type { Supplier, CreateSupplierPayload, UpdateSupplierPayload } from '../entity';
import type { ISupplierRemoteDataSource } from '../datasources';
import type { Result, PaginatedResponse, PaginationParams } from '../../common';

export interface ISupplierRepository {
    getSuppliers(params: PaginationParams): Promise<Result<PaginatedResponse<Supplier>>>;
    getSupplierById(id: string): Promise<Result<Supplier>>;
    createSupplier(payload: CreateSupplierPayload): Promise<Result<Supplier>>;
    updateSupplier(payload: UpdateSupplierPayload): Promise<Result<Supplier>>;
    deleteSupplier(id: string): Promise<Result<void>>;
}

export class SupplierRepository implements ISupplierRepository {
    constructor(private readonly remoteDataSource: ISupplierRemoteDataSource) { }

    async getSuppliers(params: PaginationParams): Promise<Result<PaginatedResponse<Supplier>>> {
        return this.remoteDataSource.getSuppliers(params);
    }

    async getSupplierById(id: string): Promise<Result<Supplier>> {
        return this.remoteDataSource.getSupplierById(id);
    }

    async createSupplier(payload: CreateSupplierPayload): Promise<Result<Supplier>> {
        return this.remoteDataSource.createSupplier(payload);
    }

    async updateSupplier(payload: UpdateSupplierPayload): Promise<Result<Supplier>> {
        return this.remoteDataSource.updateSupplier(payload);
    }

    async deleteSupplier(id: string): Promise<Result<void>> {
        return this.remoteDataSource.deleteSupplier(id);
    }
}
