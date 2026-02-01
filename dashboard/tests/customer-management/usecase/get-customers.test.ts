/**
 * GetCustomers Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCustomersUseCase, type ICustomerRepository, type Customer } from '../../../core/customer-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('GetCustomersUseCase', () => {
    let mockRepository: ICustomerRepository;
    let getCustomersUseCase: GetCustomersUseCase;

    const mockCustomers: Customer[] = [
        {
            id: 'C-001',
            full_name: 'Budi Santoso',
            email: 'budi.s@example.com',
            phone: '+628123456789',
            address: 'Jakarta',
            status: 'Active',
            join_date: '2023-01-15',
        },
        {
            id: 'C-002',
            full_name: 'Siti Aminah',
            email: 'siti.a@example.com',
            phone: '+62857123456',
            address: 'Bandung',
            status: 'Inactive',
            join_date: '2023-05-20',
        },
    ];

    beforeEach(() => {
        mockRepository = {
            getCustomers: vi.fn(),
            getCustomerById: vi.fn(),
            createCustomer: vi.fn(),
            updateCustomer: vi.fn(),
            deleteCustomer: vi.fn(),
        };
        getCustomersUseCase = new GetCustomersUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should return paginated customers successfully', async () => {
            vi.mocked(mockRepository.getCustomers).mockResolvedValue(
                success({ data: mockCustomers, total: 2, page: 1, pageSize: 10 })
            );

            const result = await getCustomersUseCase.execute({ page: 1, pageSize: 10 });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.data).toHaveLength(2);
                expect(result.data.total).toBe(2);
            }
        });

        it('should pass pagination params to repository', async () => {
            vi.mocked(mockRepository.getCustomers).mockResolvedValue(
                success({ data: [], total: 0, page: 2, pageSize: 5 })
            );

            await getCustomersUseCase.execute({ page: 2, pageSize: 5 });

            expect(mockRepository.getCustomers).toHaveBeenCalledWith({ page: 2, pageSize: 5 });
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when page is less than 1', async () => {
            const result = await getCustomersUseCase.execute({ page: 0, pageSize: 10 });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Page must be at least 1');
            }
        });

        it('should fail when pageSize is less than 1', async () => {
            const result = await getCustomersUseCase.execute({ page: 1, pageSize: 0 });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Page size must be between 1 and 100');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate server error from repository', async () => {
            vi.mocked(mockRepository.getCustomers).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await getCustomersUseCase.execute({ page: 1, pageSize: 10 });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
            }
        });
    });
});
