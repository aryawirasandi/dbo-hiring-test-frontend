/**
 * Create Supplier Usecase Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSupplierUseCase, type ISupplierRepository } from '../../../core/supplier-management';
import { success, ErrorCodes } from '../../../core/common';

describe('CreateSupplierUseCase', () => {
    let mockRepository: ISupplierRepository;
    let useCase: CreateSupplierUseCase;

    beforeEach(() => {
        mockRepository = {
            getSuppliers: vi.fn(),
            getSupplierById: vi.fn(),
            createSupplier: vi.fn(),
            updateSupplier: vi.fn(),
            deleteSupplier: vi.fn(),
        };
        useCase = new CreateSupplierUseCase(mockRepository);
    });

    it('should create supplier when payload is valid', async () => {
        vi.mocked(mockRepository.createSupplier).mockResolvedValue(success({} as any));

        const result = await useCase.execute({
            company_name: 'PT Valid',
            contact_name: 'Valid Name',
            email: 'valid@email.com',
            phone: '08123',
            address: 'Valid Address',
            status: 'Active',
        });

        expect(result.success).toBe(true);
    });

    it('should return VALIDATION_ERROR when company_name is missing', async () => {
        const result = await useCase.execute({
            company_name: '',
            contact_name: 'Valid Name',
            email: 'valid@email.com',
            phone: '08123',
            address: 'Valid Address',
            status: 'Active',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        }
    });
});
