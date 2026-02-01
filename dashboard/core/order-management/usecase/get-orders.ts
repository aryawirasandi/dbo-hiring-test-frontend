/**
 * Get Orders Use Case
 * Business logic for fetching paginated order list
 */

import type { Order, PaginatedResponse, PaginationParams } from '../entity';
import type { IOrderRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IGetOrdersUseCase {
    execute(params: PaginationParams): Promise<Result<PaginatedResponse<Order>>>;
}

export class GetOrdersUseCase implements IGetOrdersUseCase {
    constructor(private readonly orderRepository: IOrderRepository) { }

    async execute(params: PaginationParams): Promise<Result<PaginatedResponse<Order>>> {
        // Validate pagination params
        if (params.page < 1) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Page must be at least 1');
        }

        if (params.pageSize < 1 || params.pageSize > 100) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Page size must be between 1 and 100');
        }

        return this.orderRepository.getOrders(params);
    }
}
