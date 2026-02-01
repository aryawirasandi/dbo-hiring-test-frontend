/**
 * Supplier Remote Datasource
 */

import type { AxiosInstance } from 'axios';
import type { Supplier, CreateSupplierPayload, UpdateSupplierPayload } from '../entity';
import { type Result, success, failure, ErrorCodes, type PaginatedResponse, type PaginationParams } from '../../common';

export interface ISupplierRemoteDataSource {
    getSuppliers(params: PaginationParams): Promise<Result<PaginatedResponse<Supplier>>>;
    getSupplierById(id: string): Promise<Result<Supplier>>;
    createSupplier(payload: CreateSupplierPayload): Promise<Result<Supplier>>;
    updateSupplier(payload: UpdateSupplierPayload): Promise<Result<Supplier>>;
    deleteSupplier(id: string): Promise<Result<void>>;
}

export class SupplierRemoteDataSource implements ISupplierRemoteDataSource {
    constructor(private readonly httpClient: AxiosInstance) { }

    async getSuppliers(params: PaginationParams): Promise<Result<PaginatedResponse<Supplier>>> {
        try {
            const response = await this.httpClient.get<Supplier[]>('/suppliers');
            const allSuppliers = response.data;

            // Client-side pagination
            const startIndex = (params.page - 1) * params.pageSize;
            const endIndex = startIndex + params.pageSize;
            const paginatedData = allSuppliers.slice(startIndex, endIndex);

            return success({
                data: paginatedData,
                total: allSuppliers.length,
                page: params.page,
                pageSize: params.pageSize,
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getSupplierById(id: string): Promise<Result<Supplier>> {
        try {
            const response = await this.httpClient.get<Supplier>(`/suppliers/${id}`);
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async createSupplier(payload: CreateSupplierPayload): Promise<Result<Supplier>> {
        try {
            const response = await this.httpClient.post<Supplier>('/suppliers', {
                ...payload,
                id: `S-${Date.now()}`,
                join_date: new Date().toISOString().split('T')[0],
                status: payload.status || 'Active',
            });
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateSupplier(payload: UpdateSupplierPayload): Promise<Result<Supplier>> {
        try {
            const { id, ...updateData } = payload;
            const response = await this.httpClient.patch<Supplier>(`/suppliers/${id}`, updateData);
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async deleteSupplier(id: string): Promise<Result<void>> {
        try {
            await this.httpClient.delete(`/suppliers/${id}`);
            return success(undefined);
        } catch (error) {
            return this.handleError(error);
        }
    }

    private handleError(error: unknown): Result<never> {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
            const status = axiosError.response?.status;
            const message = axiosError.response?.data?.message || 'Request failed';

            if (status === 401) {
                return failure(ErrorCodes.UNAUTHORIZED, 'Unauthorized access');
            }
            if (status === 404) {
                return failure(ErrorCodes.NOT_FOUND, 'Supplier not found');
            }
            if (status === 400) {
                return failure(ErrorCodes.VALIDATION_ERROR, message);
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
