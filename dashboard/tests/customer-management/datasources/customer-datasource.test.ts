/**
 * Customer Remote DataSource Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerRemoteDataSource, type Customer } from '../../../core/customer-management';
import { ErrorCodes } from '../../../core/common';
import type { AxiosInstance, AxiosError } from 'axios';

describe('CustomerRemoteDataSource', () => {
    let mockAxios: AxiosInstance;
    let customerDataSource: CustomerRemoteDataSource;

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
        mockAxios = {
            post: vi.fn(),
            get: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
        } as unknown as AxiosInstance;
        customerDataSource = new CustomerRemoteDataSource(mockAxios);
    });

    describe('getCustomers', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should return paginated customers successfully', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockCustomers });

                const result = await customerDataSource.getCustomers({ page: 1, pageSize: 10 });

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.data.length).toBe(2);
                    expect(result.data.total).toBe(2);
                }
            });

            it('should call correct API endpoint', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockCustomers });

                await customerDataSource.getCustomers({ page: 1, pageSize: 10 });

                expect(mockAxios.get).toHaveBeenCalledWith('/customers');
            });

            it('should paginate data correctly', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockCustomers });

                const result = await customerDataSource.getCustomers({ page: 1, pageSize: 1 });

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.data.length).toBe(1);
                    expect(result.data.data[0].id).toBe('C-001');
                }
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

                const result = await customerDataSource.getCustomers({ page: 1, pageSize: 10 });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.UNKNOWN_ERROR);
                }
            });

            it('should return SERVER_ERROR for 500 response', async () => {
                const axiosError = {
                    isAxiosError: true,
                    response: { status: 500 },
                } as AxiosError;
                vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

                const result = await customerDataSource.getCustomers({ page: 1, pageSize: 10 });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
                }
            });

            it('should return NETWORK_ERROR for network error', async () => {
                const networkError = new Error('Network Error');
                vi.mocked(mockAxios.get).mockRejectedValue(networkError);

                const result = await customerDataSource.getCustomers({ page: 1, pageSize: 10 });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.NETWORK_ERROR);
                }
            });
        });
    });

    describe('getCustomerById', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should return customer detail successfully', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockCustomers[0] });

                const result = await customerDataSource.getCustomerById('C-001');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.id).toBe('C-001');
                }
            });
        });

        describe('Failure Scenarios', () => {
            it('should return NOT_FOUND for 404 response', async () => {
                const axiosError = {
                    isAxiosError: true,
                    response: { status: 404 },
                } as AxiosError;
                vi.mocked(mockAxios.get).mockRejectedValue(axiosError);

                const result = await customerDataSource.getCustomerById('C-999');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
                }
            });
        });
    });

    describe('createCustomer', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should create customer successfully', async () => {
                const newCustomer = { ...mockCustomers[0], id: 'C-003' };
                vi.mocked(mockAxios.post).mockResolvedValue({ data: newCustomer });

                const result = await customerDataSource.createCustomer({
                    full_name: 'New Customer',
                    email: 'new@example.com',
                    phone: '+628111222333',
                    address: 'Surabaya',
                    status: 'Active',
                });

                expect(result.success).toBe(true);
            });
        });

        describe('Failure Scenarios', () => {
            it('should return VALIDATION_ERROR for 400 response', async () => {
                const axiosError = {
                    isAxiosError: true,
                    response: { status: 400, data: { message: 'Invalid data' } },
                } as AxiosError;
                vi.mocked(mockAxios.post).mockRejectedValue(axiosError);

                const result = await customerDataSource.createCustomer({
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
    });

    describe('updateCustomer', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should update customer successfully', async () => {
                vi.mocked(mockAxios.patch).mockResolvedValue({ data: mockCustomers[0] });

                const result = await customerDataSource.updateCustomer({
                    id: 'C-001',
                    full_name: 'Updated Name',
                });

                expect(result.success).toBe(true);
            });

            it('should call PATCH endpoint with correct params', async () => {
                vi.mocked(mockAxios.patch).mockResolvedValue({ data: mockCustomers[0] });

                await customerDataSource.updateCustomer({
                    id: 'C-001',
                    full_name: 'Updated Name',
                });

                expect(mockAxios.patch).toHaveBeenCalledWith('/customers/C-001', {
                    full_name: 'Updated Name',
                });
            });
        });

        describe('Failure Scenarios', () => {
            it('should return NOT_FOUND for 404 response', async () => {
                const axiosError = {
                    isAxiosError: true,
                    response: { status: 404 },
                } as AxiosError;
                vi.mocked(mockAxios.patch).mockRejectedValue(axiosError);

                const result = await customerDataSource.updateCustomer({
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

    describe('deleteCustomer', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should delete customer successfully', async () => {
                vi.mocked(mockAxios.delete).mockResolvedValue({ data: {} });

                const result = await customerDataSource.deleteCustomer('C-001');

                expect(result.success).toBe(true);
            });
        });

        describe('Failure Scenarios', () => {
            it('should return NOT_FOUND for 404 response', async () => {
                const axiosError = {
                    isAxiosError: true,
                    response: { status: 404 },
                } as AxiosError;
                vi.mocked(mockAxios.delete).mockRejectedValue(axiosError);

                const result = await customerDataSource.deleteCustomer('C-999');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
                }
            });

            it('should return UNAUTHORIZED for 401 response', async () => {
                const axiosError = {
                    isAxiosError: true,
                    response: { status: 401 },
                } as AxiosError;
                vi.mocked(mockAxios.delete).mockRejectedValue(axiosError);

                const result = await customerDataSource.deleteCustomer('C-001');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED);
                }
            });
        });
    });
});
