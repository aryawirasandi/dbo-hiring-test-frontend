/**
 * Order Remote Datasource
 * Handles API communication for order management
 */

import type { AxiosInstance } from 'axios';
import type {
    Order,
    CreateOrderPayload,
    UpdateOrderPayload
} from '../entity';
import { type Result, success, failure, ErrorCodes, type PaginatedResponse, type PaginationParams } from '../../common';


export interface IOrderRemoteDataSource {
    getOrders(params: PaginationParams): Promise<Result<PaginatedResponse<Order>>>;
    getOrderById(id: string): Promise<Result<Order>>;
    createOrder(payload: CreateOrderPayload): Promise<Result<Order>>;
    updateOrder(payload: UpdateOrderPayload): Promise<Result<Order>>;
    deleteOrder(id: string): Promise<Result<void>>;
}

export class OrderRemoteDataSource implements IOrderRemoteDataSource {
    constructor(private readonly httpClient: AxiosInstance) { }

    async getOrders(params: PaginationParams): Promise<Result<PaginatedResponse<Order>>> {
        try {
            const response = await this.httpClient.get<Order[]>('/orders');
            const allOrders = response.data;

            // Implement client-side pagination
            const startIndex = (params.page - 1) * params.pageSize;
            const endIndex = startIndex + params.pageSize;
            const paginatedData = allOrders.slice(startIndex, endIndex);

            return success({
                data: paginatedData,
                total: allOrders.length,
                page: params.page,
                pageSize: params.pageSize,
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getOrderById(id: string): Promise<Result<Order>> {
        try {
            const response = await this.httpClient.get<Order>(`/orders/${id}`);
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async createOrder(payload: CreateOrderPayload): Promise<Result<Order>> {
        try {
            const totalAmount = payload.items.reduce((sum, item) => sum + (item.qty * item.price), 0);

            // Dummy URL - won't connect to real API
            const response = await this.httpClient.post<Order>('/orders', {
                ...payload,
                id: `TRX-${new Date().getFullYear()}-${Date.now()}`,
                total_amount: totalAmount,
                status: payload.status || 'Pending',
                created_at: new Date().toISOString(),
            });
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateOrder(payload: UpdateOrderPayload): Promise<Result<Order>> {
        try {
            const { id, ...updateData } = payload;

            // Recalculate total if items changed
            if (updateData.items) {
                (updateData as Record<string, unknown>).total_amount = updateData.items.reduce(
                    (sum, item) => sum + (item.qty * item.price), 0
                );
            }

            // Dummy URL - won't connect to real API
            const response = await this.httpClient.patch<Order>(`/orders/${id}`, updateData);
            return success(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async deleteOrder(id: string): Promise<Result<void>> {
        try {
            // Dummy URL - won't connect to real API
            await this.httpClient.delete(`/orders/${id}`);
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
                return failure(ErrorCodes.NOT_FOUND, 'Order not found');
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
