/**
 * GetOrderDetail Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetOrderDetailUseCase, type IOrderRepository, type Order } from '../../../core/order-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('GetOrderDetailUseCase', () => {
    let mockRepository: IOrderRepository;
    let getOrderDetailUseCase: GetOrderDetailUseCase;

    const mockOrder: Order = {
        id: 'TRX-2024-001',
        customerId: 'C-001',
        customer_name: 'Budi Santoso',
        total_amount: 150000,
        status: 'Paid',
        items: [
            { product: 'Kopi Susu', qty: 2, price: 25000 },
            { product: 'Sandwich', qty: 1, price: 35000 },
        ],
        payment_method: 'GoPay',
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
        getOrderDetailUseCase = new GetOrderDetailUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should return order detail successfully', async () => {
            vi.mocked(mockRepository.getOrderById).mockResolvedValue(success(mockOrder));

            const result = await getOrderDetailUseCase.execute('TRX-2024-001');

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.id).toBe('TRX-2024-001');
                expect(result.data.items).toHaveLength(2);
            }
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when id is empty', async () => {
            const result = await getOrderDetailUseCase.execute('');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Order ID is required');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate not found error from repository', async () => {
            vi.mocked(mockRepository.getOrderById).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Order not found')
            );

            const result = await getOrderDetailUseCase.execute('TRX-INVALID');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });
    });
});
