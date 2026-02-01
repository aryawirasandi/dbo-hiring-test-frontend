/**
 * Order Remote DataSource Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderRemoteDataSource, type Order } from '../../../core/order-management';
import { ErrorCodes } from '../../../core/common';
import type { AxiosInstance, AxiosError } from 'axios';

describe('OrderRemoteDataSource', () => {
    let mockAxios: AxiosInstance;
    let orderDataSource: OrderRemoteDataSource;

    const mockOrders: Order[] = [
        {
            id: 'TRX-2024-001',
            customerId: 'C-001',
            customer_name: 'Budi Santoso',
            total_amount: 150000,
            status: 'Paid',
            items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
            payment_method: 'GoPay',
            created_at: '2024-01-20T10:00:00Z',
        },
    ];

    beforeEach(() => {
        mockAxios = {
            post: vi.fn(),
            get: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
        } as unknown as AxiosInstance;
        orderDataSource = new OrderRemoteDataSource(mockAxios);
    });

    describe('getOrders', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should return paginated orders successfully', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockOrders });

                const result = await orderDataSource.getOrders({ page: 1, pageSize: 10 });

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.data.length).toBe(1);
                    expect(result.data.total).toBe(1);
                }
            });

            it('should call correct API endpoint', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockOrders });

                await orderDataSource.getOrders({ page: 1, pageSize: 10 });

                expect(mockAxios.get).toHaveBeenCalledWith('/orders');
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

                const result = await orderDataSource.getOrders({ page: 1, pageSize: 10 });

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

                const result = await orderDataSource.getOrders({ page: 1, pageSize: 10 });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
                }
            });

            it('should return NETWORK_ERROR for network error', async () => {
                const networkError = new Error('Network Error');
                vi.mocked(mockAxios.get).mockRejectedValue(networkError);

                const result = await orderDataSource.getOrders({ page: 1, pageSize: 10 });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.NETWORK_ERROR);
                }
            });
        });
    });

    describe('getOrderById', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should return order detail successfully', async () => {
                vi.mocked(mockAxios.get).mockResolvedValue({ data: mockOrders[0] });

                const result = await orderDataSource.getOrderById('TRX-2024-001');

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.id).toBe('TRX-2024-001');
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

                const result = await orderDataSource.getOrderById('TRX-INVALID');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
                }
            });
        });
    });

    describe('createOrder', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should create order successfully', async () => {
                vi.mocked(mockAxios.post).mockResolvedValue({ data: mockOrders[0] });

                const result = await orderDataSource.createOrder({
                    customerId: 'C-001',
                    customer_name: 'Budi Santoso',
                    items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
                    payment_method: 'Cash',
                    status: 'Pending',
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

                const result = await orderDataSource.createOrder({
                    customerId: '',
                    customer_name: '',
                    items: [{ product: '', qty: 0, price: 0 }],
                    payment_method: '',
                    status: 'Pending',
                });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                }
            });
        });
    });

    describe('updateOrder', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should update order successfully', async () => {
                vi.mocked(mockAxios.patch).mockResolvedValue({ data: mockOrders[0] });

                const result = await orderDataSource.updateOrder({
                    id: 'TRX-2024-001',
                    status: 'Paid',
                });

                expect(result.success).toBe(true);
            });

            it('should call PATCH endpoint with correct params', async () => {
                vi.mocked(mockAxios.patch).mockResolvedValue({ data: mockOrders[0] });

                await orderDataSource.updateOrder({
                    id: 'TRX-2024-001',
                    status: 'Paid',
                });

                expect(mockAxios.patch).toHaveBeenCalledWith('/orders/TRX-2024-001', {
                    status: 'Paid',
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

                const result = await orderDataSource.updateOrder({
                    id: 'TRX-INVALID',
                    status: 'Paid',
                });

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
                }
            });
        });
    });

    describe('deleteOrder', () => {
        describe('Success Scenarios (Resolved)', () => {
            it('should delete order successfully', async () => {
                vi.mocked(mockAxios.delete).mockResolvedValue({ data: {} });

                const result = await orderDataSource.deleteOrder('TRX-2024-001');

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

                const result = await orderDataSource.deleteOrder('TRX-INVALID');

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

                const result = await orderDataSource.deleteOrder('TRX-2024-001');

                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED);
                }
            });
        });
    });
});
