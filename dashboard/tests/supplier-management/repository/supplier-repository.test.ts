/**
 * Supplier Repository Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupplierRepository, type ISupplierRemoteDataSource, type Supplier } from '../../../core/supplier-management';
import { success, failure, ErrorCodes } from '../../../core/common';

describe('SupplierRepository', () => {
    let mockDataSource: ISupplierRemoteDataSource;
    let repository: SupplierRepository;

    const mockSupplier: Supplier = {
        id: 'S-001',
        company_name: 'PT Sumber Makmur Jaya',
        contact_name: 'Andi Wijaya',
        email: 'andi@sumbermakmur.co.id',
        phone: '+62811999888',
        address: 'Jl. Industri No. 12, Bekasi',
        status: 'Active',
        join_date: '2022-11-01',
    };

    beforeEach(() => {
        mockDataSource = {
            getSuppliers: vi.fn(),
            getSupplierById: vi.fn(),
            createSupplier: vi.fn(),
            updateSupplier: vi.fn(),
            deleteSupplier: vi.fn(),
        };
        repository = new SupplierRepository(mockDataSource);
    });

    describe('getSuppliers', () => {
        it('should delegate to datasource', async () => {
            vi.mocked(mockDataSource.getSuppliers).mockResolvedValue(success({ data: [mockSupplier], total: 1, page: 1, pageSize: 10 }));

            const result = await repository.getSuppliers({ page: 1, pageSize: 10 });

            expect(result.success).toBe(true);
            expect(mockDataSource.getSuppliers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
        });
    });

    describe('getSupplierById', () => {
        it('should delegate to datasource', async () => {
            vi.mocked(mockDataSource.getSupplierById).mockResolvedValue(success(mockSupplier));

            const result = await repository.getSupplierById('S-001');

            expect(result.success).toBe(true);
            expect(mockDataSource.getSupplierById).toHaveBeenCalledWith('S-001');
        });
    });

    describe('createSupplier', () => {
        it('should delegate to datasource', async () => {
            vi.mocked(mockDataSource.createSupplier).mockResolvedValue(success(mockSupplier));

            const result = await repository.createSupplier({
                company_name: 'PT Baru',
                contact_name: 'Budi',
                email: 'budi@baru.com',
                phone: '08123',
                address: 'Jl. Baru',
                status: 'Active',
            });

            expect(result.success).toBe(true);
            expect(mockDataSource.createSupplier).toHaveBeenCalled();
        });
    });

    describe('updateSupplier', () => {
        it('should delegate to datasource', async () => {
            vi.mocked(mockDataSource.updateSupplier).mockResolvedValue(success(mockSupplier));

            const result = await repository.updateSupplier({
                id: 'S-001',
                company_name: 'PT Update',
            });

            expect(result.success).toBe(true);
            expect(mockDataSource.updateSupplier).toHaveBeenCalled();
        });
    });

    describe('deleteSupplier', () => {
        it('should delegate to datasource', async () => {
            vi.mocked(mockDataSource.deleteSupplier).mockResolvedValue(success(undefined));

            const result = await repository.deleteSupplier('S-001');

            expect(result.success).toBe(true);
            expect(mockDataSource.deleteSupplier).toHaveBeenCalledWith('S-001');
        });
    });
});
