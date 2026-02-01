/**
 * Update Supplier Usecase
 */

import type { Supplier, UpdateSupplierPayload } from '../entity';
import type { ISupplierRepository } from '../repository';
import { type Result, failure, ErrorCodes } from '../../common';

export class UpdateSupplierUseCase {
    constructor(private readonly repository: ISupplierRepository) { }

    async execute(payload: UpdateSupplierPayload): Promise<Result<Supplier>> {
        if (!payload.id) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Supplier ID is required');
        }

        if (Object.keys(payload).length <= 1) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'At least one field to update is required');
        }

        return this.repository.updateSupplier(payload);
    }
}
