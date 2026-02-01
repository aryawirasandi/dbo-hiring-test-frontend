/**
 * Update Customer Use Case
 * Business logic for updating a customer
 */

import type { Customer, UpdateCustomerPayload } from '../entity';
import type { ICustomerRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IUpdateCustomerUseCase {
    execute(payload: UpdateCustomerPayload): Promise<Result<Customer>>;
}

export class UpdateCustomerUseCase implements IUpdateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(payload: UpdateCustomerPayload): Promise<Result<Customer>> {
        // Validate ID
        if (!payload.id || payload.id.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Customer ID is required');
        }

        // Validate email if provided
        if (payload.email !== undefined) {
            if (payload.email.trim() === '') {
                return failure(ErrorCodes.VALIDATION_ERROR, 'Email cannot be empty');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                return failure(ErrorCodes.VALIDATION_ERROR, 'Invalid email format');
            }
        }

        // Validate full_name if provided
        if (payload.full_name !== undefined && payload.full_name.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Full name cannot be empty');
        }

        return this.customerRepository.updateCustomer(payload);
    }
}
