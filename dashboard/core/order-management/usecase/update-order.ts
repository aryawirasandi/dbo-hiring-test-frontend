/**
 * Update Order Use Case
 * Business logic for updating an order
 */

import type { Order, UpdateOrderPayload } from '../entity';
import type { IOrderRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IUpdateOrderUseCase {
    execute(payload: UpdateOrderPayload): Promise<Result<Order>>;
}

export class UpdateOrderUseCase implements IUpdateOrderUseCase {
    constructor(private readonly orderRepository: IOrderRepository) { }

    async execute(payload: UpdateOrderPayload): Promise<Result<Order>> {
        // Validate ID
        if (!payload.id || payload.id.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Order ID is required');
        }

        // Validate items if provided
        if (payload.items !== undefined) {
            if (payload.items.length === 0) {
                return failure(ErrorCodes.VALIDATION_ERROR, 'Order must have at least one item');
            }

            for (const item of payload.items) {
                if (!item.product || item.product.trim() === '') {
                    return failure(ErrorCodes.VALIDATION_ERROR, 'Product name is required for all items');
                }
                if (item.qty < 1) {
                    return failure(ErrorCodes.VALIDATION_ERROR, 'Quantity must be at least 1');
                }
                if (item.price < 0) {
                    return failure(ErrorCodes.VALIDATION_ERROR, 'Price cannot be negative');
                }
            }
        }

        // Validate status if provided
        const validStatuses = ['Paid', 'Pending', 'Failed', 'Refunded'];
        if (payload.status !== undefined && !validStatuses.includes(payload.status)) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Invalid order status');
        }

        return this.orderRepository.updateOrder(payload);
    }
}
