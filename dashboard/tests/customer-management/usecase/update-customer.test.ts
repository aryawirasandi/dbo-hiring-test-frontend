/**
 * UpdateCustomer Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCustomerUseCase, type ICustomerRepository, type Customer } from '../../../core/customer-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('UpdateCustomerUseCase', () => {
    let mockRepository: ICustomerRepository;
    let updateCustomerUseCase: UpdateCustomerUseCase;

    const mockUpdatedCustomer: Customer = {
        id: 'C-001',
        full_name: 'Updated Name',
        email: 'updated@example.com',
        phone: '+628123456789',
        address: 'Jakarta Updated',
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
        updateCustomerUseCase = new UpdateCustomerUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should update customer successfully', async () => {
            vi.mocked(mockRepository.updateCustomer).mockResolvedValue(success(mockUpdatedCustomer));

            const result = await updateCustomerUseCase.execute({
                id: 'C-001',
                full_name: 'Updated Name',
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.full_name).toBe('Updated Name');
            }
        });

        it('should allow partial updates', async () => {
            vi.mocked(mockRepository.updateCustomer).mockResolvedValue(success(mockUpdatedCustomer));

            const result = await updateCustomerUseCase.execute({
                id: 'C-001',
                status: 'Inactive',
            });

            expect(result.success).toBe(true);
            expect(mockRepository.updateCustomer).toHaveBeenCalledWith({
                id: 'C-001',
                status: 'Inactive',
            });
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when id is empty', async () => {
            const result = await updateCustomerUseCase.execute({
                id: '',
                full_name: 'Updated Name',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Customer ID is required');
            }
        });

        it('should fail when email is invalid', async () => {
            const result = await updateCustomerUseCase.execute({
                id: 'C-001',
                email: 'invalid-email',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Invalid email format');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate not found error from repository', async () => {
            vi.mocked(mockRepository.updateCustomer).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Customer not found')
            );

            const result = await updateCustomerUseCase.execute({
                id: 'C-999',
                full_name: 'Updated Name',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });
});
