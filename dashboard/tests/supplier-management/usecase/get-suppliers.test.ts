/**
 * Get Suppliers Usecase Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSuppliersUseCase, type ISupplierRepository } from '../../../core/supplier-management';
import { success, ErrorCodes } from '../../../core/common';

describe('GetSuppliersUseCase', () => {
    let mockRepository: ISupplierRepository;
    let useCase: GetSuppliersUseCase;

    beforeEach(() => {
        mockRepository = {
            getSuppliers: vi.fn(),
            getSupplierById: vi.fn(),
            createSupplier: vi.fn(),
            updateSupplier: vi.fn(),
            deleteSupplier: vi.fn(),
        };
        useCase = new GetSuppliersUseCase(mockRepository);
    });

    it('should return suppliers when params are valid', async () => {
        vi.mocked(mockRepository.getSuppliers).mockResolvedValue(success({ data: [], total: 0, page: 1, pageSize: 10 }));

        const result = await useCase.execute({ page: 1, pageSize: 10 });

        expect(result.success).toBe(true);
    });

    it('should return VALIDATION_ERROR when page < 1', async () => {
        const result = await useCase.execute({ page: 0, pageSize: 10 });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        }
    });

    it('should return VALIDATION_ERROR when pageSize is invalid', async () => {
        const result = await useCase.execute({ page: 1, pageSize: 0 });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        }
    });
});
