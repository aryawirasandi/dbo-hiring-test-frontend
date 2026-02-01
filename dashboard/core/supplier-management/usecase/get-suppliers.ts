/**
 * Get Suppliers Usecase
 */

import type { Supplier } from '../entity';
import type { ISupplierRepository } from '../repository';
import { type Result, failure, ErrorCodes, type PaginatedResponse, type PaginationParams } from '../../common';

export class GetSuppliersUseCase {
    constructor(private readonly repository: ISupplierRepository) { }

    async execute(params: PaginationParams): Promise<Result<PaginatedResponse<Supplier>>> {
        if (params.page < 1) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Page must be greater than 0');
        }
        if (params.pageSize < 1 || params.pageSize > 100) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Page size must be between 1 and 100');
        }

        return this.repository.getSuppliers(params);
    }
}
