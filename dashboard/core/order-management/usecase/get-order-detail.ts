/**
 * Get Order Detail Use Case
 * Business logic for fetching single order with items
 */

import type { Order } from '../entity';
import type { IOrderRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IGetOrderDetailUseCase {
    execute(id: string): Promise<Result<Order>>;
}

export class GetOrderDetailUseCase implements IGetOrderDetailUseCase {
    constructor(private readonly orderRepository: IOrderRepository) { }

    async execute(id: string): Promise<Result<Order>> {
        // Validate id
        if (!id || id.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Order ID is required');
        }

        return this.orderRepository.getOrderById(id);
    }
}
