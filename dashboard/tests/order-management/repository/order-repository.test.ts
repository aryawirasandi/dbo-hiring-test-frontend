/**
 * Order Repository Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderRepository, type IOrderRemoteDataSource, type Order } from '../../../core/order-management';
import { success, failure, ErrorCodes } from '../../../core/common';

describe('OrderRepository', () => {
    let mockDataSource: IOrderRemoteDataSource;
    let orderRepository: OrderRepository;

    const mockOrder: Order = {
        id: 'TRX-2024-001',
        customerId: 'C-001',
        customer_name: 'Budi Santoso',
        total_amount: 150000,
        status: 'Paid',
        items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
        payment_method: 'GoPay',
        created_at: '2024-01-20T10:00:00Z',
    };

    beforeEach(() => {
        mockDataSource = {
            getOrders: vi.fn(),
            getOrderById: vi.fn(),
            createOrder: vi.fn(),
            updateOrder: vi.fn(),
            deleteOrder: vi.fn(),
        };
        orderRepository = new OrderRepository(mockDataSource);
    });

    describe('getOrders', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.getOrders).mockResolvedValue(
                success({ data: [mockOrder], total: 1, page: 1, pageSize: 10 })
            );

            const result = await orderRepository.getOrders({ page: 1, pageSize: 10 });

            expect(result.success).toBe(true);
            expect(mockDataSource.getOrders).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
        });

        it('should propagate error from datasource', async () => {
            vi.mocked(mockDataSource.getOrders).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await orderRepository.getOrders({ page: 1, pageSize: 10 });

            expect(result.success).toBe(false);
        });
    });

    describe('getOrderById', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.getOrderById).mockResolvedValue(success(mockOrder));

            const result = await orderRepository.getOrderById('TRX-2024-001');

            expect(result.success).toBe(true);
            expect(mockDataSource.getOrderById).toHaveBeenCalledWith('TRX-2024-001');
        });

        it('should propagate not found error from datasource', async () => {
            vi.mocked(mockDataSource.getOrderById).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Order not found')
            );

            const result = await orderRepository.getOrderById('TRX-INVALID');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });

    describe('createOrder', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.createOrder).mockResolvedValue(success(mockOrder));

            const result = await orderRepository.createOrder({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(true);
        });

        it('should propagate validation error from datasource', async () => {
            vi.mocked(mockDataSource.createOrder).mockResolvedValue(
                failure(ErrorCodes.VALIDATION_ERROR, 'Invalid data')
            );

            const result = await orderRepository.createOrder({
                customerId: '',
                customer_name: '',
                items: [],
                payment_method: '',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
            }
        });
    });

    describe('updateOrder', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.updateOrder).mockResolvedValue(success(mockOrder));

            const result = await orderRepository.updateOrder({
                id: 'TRX-2024-001',
                status: 'Paid',
            });

            expect(result.success).toBe(true);
        });

        it('should propagate not found error from datasource', async () => {
            vi.mocked(mockDataSource.updateOrder).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Order not found')
            );

            const result = await orderRepository.updateOrder({
                id: 'TRX-INVALID',
                status: 'Paid',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });

    describe('deleteOrder', () => {
        it('should delegate to datasource and return success', async () => {
            vi.mocked(mockDataSource.deleteOrder).mockResolvedValue(success(undefined));

            const result = await orderRepository.deleteOrder('TRX-2024-001');

            expect(result.success).toBe(true);
            expect(mockDataSource.deleteOrder).toHaveBeenCalledWith('TRX-2024-001');
        });

        it('should propagate not found error from datasource', async () => {
            vi.mocked(mockDataSource.deleteOrder).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Order not found')
            );

            const result = await orderRepository.deleteOrder('TRX-INVALID');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });
});
