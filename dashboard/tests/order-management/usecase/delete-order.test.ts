/**
 * DeleteOrder Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteOrderUseCase, type IOrderRepository } from '../../../core/order-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('DeleteOrderUseCase', () => {
    let mockRepository: IOrderRepository;
    let deleteOrderUseCase: DeleteOrderUseCase;

    beforeEach(() => {
        mockRepository = {
            getOrders: vi.fn(),
            getOrderById: vi.fn(),
            createOrder: vi.fn(),
            updateOrder: vi.fn(),
            deleteOrder: vi.fn(),
        };
        deleteOrderUseCase = new DeleteOrderUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should delete order successfully', async () => {
            vi.mocked(mockRepository.deleteOrder).mockResolvedValue(success(undefined));

            const result = await deleteOrderUseCase.execute('TRX-2024-001');

            expect(result.success).toBe(true);
            expect(mockRepository.deleteOrder).toHaveBeenCalledWith('TRX-2024-001');
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when id is empty', async () => {
            const result = await deleteOrderUseCase.execute('');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Order ID is required');
            }
            expect(mockRepository.deleteOrder).not.toHaveBeenCalled();
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate not found error from repository', async () => {
            vi.mocked(mockRepository.deleteOrder).mockResolvedValue(
                failure(ErrorCodes.NOT_FOUND, 'Order not found')
            );

            const result = await deleteOrderUseCase.execute('TRX-INVALID');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
            }
        });

        it('should propagate unauthorized error from repository', async () => {
            vi.mocked(mockRepository.deleteOrder).mockResolvedValue(
                failure(ErrorCodes.UNAUTHORIZED, 'Not authorized to delete')
            );

            const result = await deleteOrderUseCase.execute('TRX-2024-001');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.UNAUTHORIZED);
            }
        });
    });
});
