/**
 * Customer Repository Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerRepository, type ICustomerRemoteDataSource, type Customer } from '../../../core/customer-management';
import { success, failure, ErrorCodes } from '../../../core/common';

describe('CustomerRepository', () => {
    let mockDataSource: ICustomerRemoteDataSource;
    let customerRepository: CustomerRepository;

    const mockCustomer: Customer = {
        id: 'C-001',
        full_name: 'Budi Santoso',
        email: 'budi.s@example.com',
        phone: '+628123456789',
        address: 'Jakarta',
        status: 'Active',
        join_date: '2023-01-15',
    };

    beforeEach(() => {
        mockDataSource = {
            getCustomers: vi.fn(),
            getCustomerById: vi.fn(),
            createCustomer: vi.fn(),
            updateCustomer: vi.fn(),
            deleteCustomer: vi.fn(),
        };
        customerRepository = new CustomerRepository(mockDataSource);
    });

    describe('getCustomers', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.getCustomers).mockResolvedValue(
                success({ data: [mockCustomer], total: 1, page: 1, pageSize: 10 })
            );

            const result = await customerRepository.getCustomers({ page: 1, pageSize: 10 });

            expect(result.success).toBe(true);
            expect(mockDataSource.getCustomers).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
        });

        it('should propagate error from datasource', async () => {
            vi.mocked(mockDataSource.getCustomers).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await customerRepository.getCustomers({ page: 1, pageSize: 10 });

            expect(result.success).toBe(false);
        });
    });

    describe('getCustomerById', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.getCustomerById).mockResolvedValue(success(mockCustomer));

            const result = await customerRepository.getCustomerById('C-001');

            expect(result.success).toBe(true);
            expect(mockDataSource.getCustomerById).toHaveBeenCalledWith('C-001');
        });

        it('should propagate not found error from datasource', async () => {
            vi.mocked(mockDataSource.getCustomerById).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Customer not found')
            );

            const result = await customerRepository.getCustomerById('C-999');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });

    describe('createCustomer', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.createCustomer).mockResolvedValue(success(mockCustomer));

            const result = await customerRepository.createCustomer({
                full_name: 'Budi Santoso',
                email: 'budi.s@example.com',
                phone: '+628123456789',
                address: 'Jakarta',
                status: 'Active',
            });

            expect(result.success).toBe(true);
        });

        it('should propagate validation error from datasource', async () => {
            vi.mocked(mockDataSource.createCustomer).mockResolvedValue(
                failure(ErrorCodes.VALIDATION_ERROR, 'Invalid data')
            );

            const result = await customerRepository.createCustomer({
                full_name: '',
                email: 'invalid',
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

    describe('updateCustomer', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.updateCustomer).mockResolvedValue(success(mockCustomer));

            const result = await customerRepository.updateCustomer({
                id: 'C-001',
                full_name: 'Updated Name',
            });

            expect(result.success).toBe(true);
        });

        it('should propagate not found error from datasource', async () => {
            vi.mocked(mockDataSource.updateCustomer).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Customer not found')
            );

            const result = await customerRepository.updateCustomer({
                id: 'C-999',
                full_name: 'Updated Name',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });

    describe('deleteCustomer', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.deleteCustomer).mockResolvedValue(success(undefined));

            const result = await customerRepository.deleteCustomer('C-001');

            expect(result.success).toBe(true);
            expect(mockDataSource.deleteCustomer).toHaveBeenCalledWith('C-001');
        });

        it('should propagate not found error from datasource', async () => {
            vi.mocked(mockDataSource.deleteCustomer).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Customer not found')
            );

            const result = await customerRepository.deleteCustomer('C-999');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });
});
