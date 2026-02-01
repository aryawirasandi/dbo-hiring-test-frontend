/**
 * Supplier Remote DataSource Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupplierRemoteDataSource, type Supplier } from '../../../core/supplier-management';
import { ErrorCodes } from '../../../core/common';
import type { AxiosInstance, AxiosError } from 'axios';

describe('SupplierRemoteDataSource', () => {
    let mockAxios: AxiosInstance;
    let supplierDataSource: SupplierRemoteDataSource;

    const mockSuppliers: Supplier[] = [
        {
            id: 'S-001',
            company_name: 'PT Sumber Makmur Jaya',
            contact_name: 'Andi Wijaya',
            email: 'andi@sumbermakmur.co.id',
            phone: '+62811999888',
            address: 'Jl. Industri No. 12, Bekasi',
            status: 'Active',
            join_date: '2022-11-01',
        },
    ];

    beforeEach(() => {
        mockAxios = {
            post: vi.fn(),
            get: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
        } as unknown as AxiosInstance;
        supplierDataSource = new SupplierRemoteDataSource(mockAxios);
    });

    describe('getSuppliers', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should return paginated suppliers successfully', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockSuppliers });

                const result = await supplierDataSource.getSuppliers({ page: 1, pageSize: 10 });

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.data.length).toBe(1);
                    expect(result.data.total).toBe(1);
                }
            });

            it('should call correct API endpoint', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockSuppliers });

                await supplierDataSource.getSuppliers({ page: 1, pageSize: 10 });

                expect(mockAxios.get).toHaveBeenCalledWith('/suppliers');
            });
        });

        describe('Failure Scenarios', () => {
            it('should return UNKNOWN_ERROR when no response', async () => {
                const axiosError = {
                    isAxiosError: true,
                    response: undefined,
                    request: {},
                } as AxiosError;
                vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

                const result = await supplierDataSource.getSuppliers({ page: 1, pageSize: 10 });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.UNKNOWN_ERROR);
                }
            });
        });
    });

    describe('getSupplierById', () => {
        it('should return supplier detail successfully', async () => {
            vi.mocked(mockAxios.get).mockResolvedValue({ data: mockSuppliers[0] });

            const result = await supplierDataSource.getSupplierById('S-001');

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.id).toBe('S-001');
            }
        });

        it('should return NOT_FOUND for 404', async () => {
            const axiosError = {
                isAxiosError: true,
                response: { status: 404 },
            } as AxiosError;
            vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

            const result = await supplierDataSource.getSupplierById('S-999');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });

    describe('createSupplier', () => {
        it('should create supplier successfully', async () => {
            vi.mocked(mockAxios.post).mockResolvedValue({ data: mockSuppliers[0] });

            const result = await supplierDataSource.createSupplier({
                company_name: 'PT Baru',
                contact_name: 'Budi',
                email: 'budi@baru.com',
                phone: '08123',
                address: 'Jl. Baru',
                status: 'Active',
            });

            expect(result.success).toBe(true);
        });

        it('should return VALIDATION_ERROR for 400', async () => {
            const axiosError = {
                isAxiosError: true,
                response: { status: 400, data: { message: 'Invalid data' } },
            } as AxiosError;
            vi.mocked(mockAxios.post).mockRejectedValue(axiosError);

            const result = await supplierDataSource.createSupplier({
                company_name: '',
                contact_name: '',
                email: '',
                phone: '',
                address: '',
                status: 'Active',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
            }
        });
    });

    describe('updateSupplier', () => {
        it('should update supplier successfully', async () => {
            vi.mocked(mockAxios.patch).mockResolvedValue({ data: mockSuppliers[0] });

            const result = await supplierDataSource.updateSupplier({
                id: 'S-001',
                company_name: 'PT Update',
            });

            expect(result.success).toBe(true);
        });
    });

    describe('deleteSupplier', () => {
        it('should delete supplier successfully', async () => {
            vi.mocked(mockAxios.delete).mockResolvedValue({ data: {} });

            const result = await supplierDataSource.deleteSupplier('S-001');

            expect(result.success).toBe(true);
        });
    });
});
