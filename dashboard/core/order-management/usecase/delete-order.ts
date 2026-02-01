/**
 * Delete Order Use Case
 * Business logic for deleting an order
 */

import type { IOrderRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IDeleteOrderUseCase {
    execute(id: string): Promise<Result<void>>;
}

export class DeleteOrderUseCase implements IDeleteOrderUseCase {
    constructor(private readonly orderRepository: IOrderRepository) { }

    async execute(id: string): Promise<Result<void>> {
        // Validate ID
        if (!id || id.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Order ID is required');
        }

        return this.orderRepository.deleteOrder(id);
    }
}
