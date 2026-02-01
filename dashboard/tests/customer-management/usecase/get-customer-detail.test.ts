/**
 * GetCustomerDetail Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCustomerDetailUseCase, type ICustomerRepository, type Customer } from '../../../core/customer-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('GetCustomerDetailUseCase', () => {
    let mockRepository: ICustomerRepository;
    let getCustomerDetailUseCase: GetCustomerDetailUseCase;

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
        mockRepository = {
            getCustomers: vi.fn(),
            getCustomerById: vi.fn(),
            createCustomer: vi.fn(),
            updateCustomer: vi.fn(),
            deleteCustomer: vi.fn(),
        };
        getCustomerDetailUseCase = new GetCustomerDetailUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should return customer detail successfully', async () => {
            vi.mocked(mockRepository.getCustomerById).mockResolvedValue(success(mockCustomer));

            const result = await getCustomerDetailUseCase.execute('C-001');

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.id).toBe('C-001');
                expect(result.data.full_name).toBe('Budi Santoso');
            }
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when id is empty', async () => {
            const result = await getCustomerDetailUseCase.execute('');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Customer ID is required');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate not found error from repository', async () => {
            vi.mocked(mockRepository.getCustomerById).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Customer not found')
            );

            const result = await getCustomerDetailUseCase.execute('C-999');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });
});
