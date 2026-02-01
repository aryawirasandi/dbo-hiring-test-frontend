/**
 * Create Customer Use Case
 * Business logic for creating a new customer
 */

import type { Customer, CreateCustomerPayload } from '../entity';
import type { ICustomerRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface ICreateCustomerUseCase {
    execute(payload: CreateCustomerPayload): Promise<Result<Customer>>;
}

export class CreateCustomerUseCase implements ICreateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(payload: CreateCustomerPayload): Promise<Result<Customer>> {
        // Validate required fields
        if (!payload.full_name || payload.full_name.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Full name is required');
        }

        if (!payload.email || payload.email.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Email is required');
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Invalid email format');
        }

        if (!payload.phone || payload.phone.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Phone is required');
        }

        if (!payload.address || payload.address.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Address is required');
        }

        return this.customerRepository.createCustomer(payload);
    }
}
