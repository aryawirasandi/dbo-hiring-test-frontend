/**
 * Customer Remote Datasource
 * Handles API communication for customer management
 */

import type { AxiosInstance } from 'axios';
import type {
    Customer,
    CreateCustomerPayload,
    UpdateCustomerPayload
} from '../entity';
import { type Result, success, failure, ErrorCodes, type PaginatedResponse, type PaginationParams } from '../../common';


export interface ICustomerRemoteDataSource {
    getCustomers(params: PaginationParams): Promise<Result<PaginatedResponse<Customer>>>;
    getCustomerById(id: string): Promise<Result<Customer>>;
    createCustomer(payload: CreateCustomerPayload): Promise<Result<Customer>>;
    updateCustomer(payload: UpdateCustomerPayload): Promise<Result<Customer>>;
    deleteCustomer(id: string): Promise<Result<void>>;
}

export class CustomerRemoteDataSource implements ICustomerRemoteDataSource {
    constructor(private readonly httpClient: AxiosInstance) { }

    async getCustomers(params: PaginationParams): Promise<Result<PaginatedResponse<Customer>>> {
        try {
            const response = await this.httpClient.get<Customer[]>('/customers');
            const allCustomers = response.data;

            // Implement client-side pagination (JSON Server supports _page and _limit)
            const startIndex = (params.page - 1) * params.pageSize;
            const endIndex = startIndex + params.pageSize;
            const paginatedData = allCustomers.slice(startIndex, endIndex);

            return success({
                data: paginatedData,
                total: allCustomers.length,
                page: params.page,
                pageSize: params.pageSize,
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getCustomerById(id: string): Promise<Result<Customer>> {
        try {
            const response = await this.httpClient.get<Customer>(`/customers/${id}`);
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async createCustomer(payload: CreateCustomerPayload): Promise<Result<Customer>> {
        try {
            // Dummy URL - won't connect to real API
            const response = await this.httpClient.post<Customer>('/customers', {
                ...payload,
                id: `C-${Date.now()}`,
                join_date: new Date().toISOString().split('T')[0],
                status: payload.status || 'Active',
            });
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateCustomer(payload: UpdateCustomerPayload): Promise<Result<Customer>> {
        try {
            const { id, ...updateData } = payload;
            // Dummy URL - won't connect to real API
            const response = await this.httpClient.patch<Customer>(`/customers/${id}`, updateData);
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async deleteCustomer(id: string): Promise<Result<void>> {
        try {
            // Dummy URL - won't connect to real API
            await this.httpClient.delete(`/customers/${id}`);
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
                return failure(ErrorCodes.NOT_FOUND, 'Customer not found');
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
