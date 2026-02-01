/**
 * Delete Customer Use Case
 * Business logic for deleting a customer
 */

import type { ICustomerRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IDeleteCustomerUseCase {
    execute(id: string): Promise<Result<void>>;
}

export class DeleteCustomerUseCase implements IDeleteCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(id: string): Promise<Result<void>> {
        // Validate ID
        if (!id || id.trim() === '') {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Customer ID is required');
        }

        return this.customerRepository.deleteCustomer(id);
    }
}
