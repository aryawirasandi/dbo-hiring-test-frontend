/**
 * GetOrders Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetOrdersUseCase, type IOrderRepository, type Order } from '../../../core/order-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('GetOrdersUseCase', () => {
    let mockRepository: IOrderRepository;
    let getOrdersUseCase: GetOrdersUseCase;

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
        mockRepository = {
            getOrders: vi.fn(),
            getOrderById: vi.fn(),
            createOrder: vi.fn(),
            updateOrder: vi.fn(),
            deleteOrder: vi.fn(),
        };
        getOrdersUseCase = new GetOrdersUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should return paginated orders successfully', async () => {
            vi.mocked(mockRepository.getOrders).mockResolvedValue(
                success({ data: mockOrders, total: 1, page: 1, pageSize: 10 })
            );

            const result = await getOrdersUseCase.execute({ page: 1, pageSize: 10 });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.data).toHaveLength(1);
                expect(result.data.data[0].id).toBe('TRX-2024-001');
            }
        });

        it('should pass pagination params to repository', async () => {
            vi.mocked(mockRepository.getOrders).mockResolvedValue(
                success({ data: [], total: 0, page: 2, pageSize: 5 })
            );

            await getOrdersUseCase.execute({ page: 2, pageSize: 5 });

            expect(mockRepository.getOrders).toHaveBeenCalledWith({ page: 2, pageSize: 5 });
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when page is less than 1', async () => {
            const result = await getOrdersUseCase.execute({ page: 0, pageSize: 10 });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Page must be at least 1');
            }
        });

        it('should fail when pageSize is less than 1', async () => {
            const result = await getOrdersUseCase.execute({ page: 1, pageSize: 0 });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Page size must be between 1 and 100');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate server error from repository', async () => {
            vi.mocked(mockRepository.getOrders).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await getOrdersUseCase.execute({ page: 1, pageSize: 10 });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
            }
        });
    });
});
