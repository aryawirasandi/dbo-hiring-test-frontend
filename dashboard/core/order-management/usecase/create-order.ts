/**
 * Create Order Use Case
 * Business logic for creating a new order
 */

import type { Order, CreateOrderPayload } from '../entity';
import type { IOrderRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface ICreateOrderUseCase {
    execute(payload: CreateOrderPayload): Promise<Result<Order>>;
}

export class CreateOrderUseCase implements ICreateOrderUseCase {
    constructor(private readonly orderRepository: IOrderRepository) { }

    async execute(payload: CreateOrderPayload): Promise<Result<Order>> {
        // Validate required fields
        if (!payload.customerId || payload.customerId.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Customer ID is required');
        }

        if (!payload.customer_name || payload.customer_name.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Customer name is required');
        }

        if (!payload.items || payload.items.length === 0) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'At least one item is required');
        }

        // Validate each item
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

        if (!payload.payment_method || payload.payment_method.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Payment method is required');
        }

        return this.orderRepository.createOrder(payload);
    }
}
