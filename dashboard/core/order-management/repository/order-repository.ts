/**
 * Order Repository
 * Abstracts data source and provides clean interface for usecases
 */

import type {
    Order,
    CreateOrderPayload,
    UpdateOrderPayload
} from '../entity';
import type { IOrderRemoteDataSource } from '../datasources';
import type { Result, PaginatedResponse, PaginationParams } from '../../common';


export interface IOrderRepository {
    getOrders(params: PaginationParams): Promise<Result<PaginatedResponse<Order>>>;
    getOrderById(id: string): Promise<Result<Order>>;
    createOrder(payload: CreateOrderPayload): Promise<Result<Order>>;
    updateOrder(payload: UpdateOrderPayload): Promise<Result<Order>>;
    deleteOrder(id: string): Promise<Result<void>>;
}

export class OrderRepository implements IOrderRepository {
    constructor(private readonly remoteDataSource: IOrderRemoteDataSource) { }

    async getOrders(params: PaginationParams): Promise<Result<PaginatedResponse<Order>>> {
        return this.remoteDataSource.getOrders(params);
    }

    async getOrderById(id: string): Promise<Result<Order>> {
        return this.remoteDataSource.getOrderById(id);
    }

    async createOrder(payload: CreateOrderPayload): Promise<Result<Order>> {
        return this.remoteDataSource.createOrder(payload);
    }

    async updateOrder(payload: UpdateOrderPayload): Promise<Result<Order>> {
        return this.remoteDataSource.updateOrder(payload);
    }

    async deleteOrder(id: string): Promise<Result<void>> {
        return this.remoteDataSource.deleteOrder(id);
    }
}
