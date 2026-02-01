/**
 * CreateCustomer Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCustomerUseCase, type ICustomerRepository, type Customer } from '../../../core/customer-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('CreateCustomerUseCase', () => {
    let mockRepository: ICustomerRepository;
    let createCustomerUseCase: CreateCustomerUseCase;

    const mockCreatedCustomer: Customer = {
        id: 'C-003',
        full_name: 'New Customer',
        email: 'new@example.com',
        phone: '+628111222333',
        address: 'Surabaya',
        status: 'Active',
        join_date: '2024-01-20',
    };

    beforeEach(() => {
        mockRepository = {
            getCustomers: vi.fn(),
            getCustomerById: vi.fn(),
            createCustomer: vi.fn(),
            updateCustomer: vi.fn(),
            deleteCustomer: vi.fn(),
        };
        createCustomerUseCase = new CreateCustomerUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should create customer successfully', async () => {
            vi.mocked(mockRepository.createCustomer).mockResolvedValue(success(mockCreatedCustomer));

            const result = await createCustomerUseCase.execute({
                full_name: 'New Customer',
                email: 'new@example.com',
                phone: '+628111222333',
                address: 'Surabaya',
                status: 'Active',
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.full_name).toBe('New Customer');
            }
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when full_name is empty', async () => {
            const result = await createCustomerUseCase.execute({
                full_name: '',
                email: 'new@example.com',
                phone: '+628111222333',
                address: 'Surabaya',
                status: 'Active',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Full name is required');
            }
        });

        it('should fail when email is invalid', async () => {
            const result = await createCustomerUseCase.execute({
                full_name: 'New Customer',
                email: 'invalid-email',
                phone: '+628111222333',
                address: 'Surabaya',
                status: 'Active',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Invalid email format');
            }
        });

        it('should fail when phone is empty', async () => {
            const result = await createCustomerUseCase.execute({
                full_name: 'New Customer',
                email: 'new@example.com',
                phone: '',
                address: 'Surabaya',
                status: 'Active',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Phone is required');
            }
        });

        it('should fail when address is empty', async () => {
            const result = await createCustomerUseCase.execute({
                full_name: 'New Customer',
                email: 'new@example.com',
                phone: '+628111222333',
                address: '',
                status: 'Active',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Address is required');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate server error from repository', async () => {
            vi.mocked(mockRepository.createCustomer).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await createCustomerUseCase.execute({
                full_name: 'New Customer',
                email: 'new@example.com',
                phone: '+628111222333',
                address: 'Surabaya',
                status: 'Active',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
            }
        });
    });
});
