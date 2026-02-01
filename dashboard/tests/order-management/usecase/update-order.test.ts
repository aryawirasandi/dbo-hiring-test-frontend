/**
 * UpdateOrder Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateOrderUseCase, type IOrderRepository, type Order } from '../../../core/order-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('UpdateOrderUseCase', () => {
    let mockRepository: IOrderRepository;
    let updateOrderUseCase: UpdateOrderUseCase;

    const mockUpdatedOrder: Order = {
        id: 'TRX-2024-001',
        customerId: 'C-001',
        customer_name: 'Budi Santoso',
        total_amount: 200000,
        status: 'Paid',
        items: [{ product: 'Steak', qty: 1, price: 200000 }],
        payment_method: 'Credit Card',
        created_at: '2024-01-20T10:00:00Z',
    };

    beforeEach(() => {
        mockRepository = {
            getOrders: vi.fn(),
            getOrderById: vi.fn(),
            createOrder: vi.fn(),
            updateOrder: vi.fn(),
            deleteOrder: vi.fn(),
        };
        updateOrderUseCase = new UpdateOrderUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should update order successfully', async () => {
            vi.mocked(mockRepository.updateOrder).mockResolvedValue(success(mockUpdatedOrder));

            const result = await updateOrderUseCase.execute({
                id: 'TRX-2024-001',
                status: 'Paid',
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe('Paid');
            }
        });

        it('should allow updating items', async () => {
            vi.mocked(mockRepository.updateOrder).mockResolvedValue(success(mockUpdatedOrder));

            const result = await updateOrderUseCase.execute({
                id: 'TRX-2024-001',
                items: [{ product: 'Steak', qty: 1, price: 200000 }],
            });

            expect(result.success).toBe(true);
            expect(mockRepository.updateOrder).toHaveBeenCalledWith({
                id: 'TRX-2024-001',
                items: [{ product: 'Steak', qty: 1, price: 200000 }],
            });
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when id is empty', async () => {
            const result = await updateOrderUseCase.execute({
                id: '',
                status: 'Paid',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Order ID is required');
            }
        });

        it('should fail when status is invalid', async () => {
            const result = await updateOrderUseCase.execute({
                id: 'TRX-2024-001',
                status: 'InvalidStatus' as any,
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Invalid order status');
            }
        });

        it('should fail when items array has invalid product', async () => {
            const result = await updateOrderUseCase.execute({
                id: 'TRX-2024-001',
                items: [{ product: '', qty: 1, price: 100 }],
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Product name is required for all items');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate not found error from repository', async () => {
            vi.mocked(mockRepository.updateOrder).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Order not found')
            );

            const result = await updateOrderUseCase.execute({
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
