/**
 * Get Customers Use Case
 * Business logic for fetching paginated customer list
 */

import type { Customer, PaginatedResponse, PaginationParams } from '../entity';
import type { ICustomerRepository } from '../repository';
import type { Result } from '../../common';
import { failure, ErrorCodes } from '../../common';

export interface IGetCustomersUseCase {
    execute(params: PaginationParams): Promise<Result<PaginatedResponse<Customer>>>;
}

export class GetCustomersUseCase implements IGetCustomersUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    async execute(params: PaginationParams): Promise<Result<PaginatedResponse<Customer>>> {
        // Validate pagination params
        if (params.page < 1) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Page must be at least 1');
        }

        if (params.pageSize < 1 || params.pageSize > 100) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Page size must be between 1 and 100');
        }

        return this.customerRepository.getCustomers(params);
    }
}
