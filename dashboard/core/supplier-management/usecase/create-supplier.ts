/**
 * Create Supplier Usecase
 */

import type { Supplier, CreateSupplierPayload } from '../entity';
import type { ISupplierRepository } from '../repository';
import { type Result, failure, ErrorCodes } from '../../common';

export class CreateSupplierUseCase {
    constructor(private readonly repository: ISupplierRepository) { }

    async execute(payload: CreateSupplierPayload): Promise<Result<Supplier>> {
        if (!payload.company_name) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Company name is required');
        }
        if (!payload.email) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Email is required');
        }
        if (!payload.phone) {
            return failure(ErrorCodes.VALIDATION_ERROR, 'Phone number is required');
        }

        return this.repository.createSupplier(payload);
    }
}
