/**
 * Delete Supplier Usecase
 */

import type { ISupplierRepository } from '../repository';
import { type Result, failure, ErrorCodes } from '../../common';

export class DeleteSupplierUseCase {
    constructor(private readonly repository: ISupplierRepository) { }

    async execute(id: string): Promise<Result<void>> {
        if (!id) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Supplier ID is required');
        }

        return this.repository.deleteSupplier(id);
    }
}
