/**
 * Get Supplier Detail Usecase
 */

import type { Supplier } from '../entity';
import type { ISupplierRepository } from '../repository';
import { type Result, failure, ErrorCodes } from '../../common';

export class GetSupplierDetailUseCase {
    constructor(private readonly repository: ISupplierRepository) { }

    async execute(id: string): Promise<Result<Supplier>> {
        if (!id) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Supplier ID is required');
        }

        return this.repository.getSupplierById(id);
    }
}
