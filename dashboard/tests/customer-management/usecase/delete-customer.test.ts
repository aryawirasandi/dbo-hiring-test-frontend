/**
 * DeleteCustomer Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCustomerUseCase, type ICustomerRepository } from '../../../core/customer-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('DeleteCustomerUseCase', () => {
    let mockRepository: ICustomerRepository;
    let deleteCustomerUseCase: DeleteCustomerUseCase;

    beforeEach(() => {
        mockRepository = {
            getCustomers: vi.fn(),
            getCustomerById: vi.fn(),
            createCustomer: vi.fn(),
            updateCustomer: vi.fn(),
            deleteCustomer: vi.fn(),
        };
        deleteCustomerUseCase = new DeleteCustomerUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should delete customer successfully', async () => {
            vi.mocked(mockRepository.deleteCustomer).mockResolvedValue(success(undefined));

            const result = await deleteCustomerUseCase.execute('C-001');

            expect(result.success).toBe(true);
            expect(mockRepository.deleteCustomer).toHaveBeenCalledWith('C-001');
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when id is empty', async () => {
            const result = await deleteCustomerUseCase.execute('');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Customer ID is required');
            }
            expect(mockRepository.deleteCustomer).not.toHaveBeenCalled();
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate not found error from repository', async () => {
            vi.mocked(mockRepository.deleteCustomer).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Customer not found')
            );

            const result = await deleteCustomerUseCase.execute('C-999');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });

        it('should propagate unauthorized error from repository', async () => {
            vi.mocked(mockRepository.deleteCustomer).mockResolvedValue(
                failure(ErrorCodes.UNAUTHORIZED, 'Not authorized to delete')
            );

            const result = await deleteCustomerUseCase.execute('C-001');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED);
            }
        });
    });
});
