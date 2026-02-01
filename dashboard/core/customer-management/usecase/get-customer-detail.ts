/**
 * Get Customer Detail Use Case
 * Business logic for fetching single customer
 */

import type { Customer } from '../entity';
import type { ICustomerRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IGetCustomerDetailUseCase {
    execute(id: string): Promise<Result<Customer>>;
}

export class GetCustomerDetailUseCase implements IGetCustomerDetailUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(id: string): Promise<Result<Customer>> {
        // Validate id
        if (!id || id.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Customer ID is required');
        }

        return this.customerRepository.getCustomerById(id);
    }
}
