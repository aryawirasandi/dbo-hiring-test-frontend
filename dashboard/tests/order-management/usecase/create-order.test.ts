/**
 * CreateOrder Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateOrderUseCase, type IOrderRepository, type Order } from '../../../core/order-management';
import { ErrorCodes, success, failure } from '../../../core/common';

describe('CreateOrderUseCase', () => {
    let mockRepository: IOrderRepository;
    let createOrderUseCase: CreateOrderUseCase;

    const mockCreatedOrder: Order = {
        id: 'TRX-2024-011',
        customerId: 'C-001',
        customer_name: 'Budi Santoso',
        total_amount: 85000,
        status: 'Pending',
        items: [
            { product: 'Kopi Susu', qty: 2, price: 25000 },
            { product: 'Sandwich', qty: 1, price: 35000 },
        ],
        payment_method: 'Cash',
        created_at: '2024-01-30T10:00:00Z',
    };

    beforeEach(() => {
        mockRepository = {
            getOrders: vi.fn(),
            getOrderById: vi.fn(),
            createOrder: vi.fn(),
            updateOrder: vi.fn(),
            deleteOrder: vi.fn(),
        };
        createOrderUseCase = new CreateOrderUseCase(mockRepository);
    });

    describe('Success Scenarios (Resolved)', () => {
        it('should create order successfully', async () => {
            vi.mocked(mockRepository.createOrder).mockResolvedValue(success(mockCreatedOrder));

            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [
                    { product: 'Kopi Susu', qty: 2, price: 25000 },
                    { product: 'Sandwich', qty: 1, price: 35000 },
                ],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.customer_name).toBe('Budi Santoso');
                expect(result.data.total_amount).toBe(85000);
            }
        });
    });

    describe('Failure Scenarios (Validation Errors)', () => {
        it('should fail when customerId is empty', async () => {
            const result = await createOrderUseCase.execute({
                customerId: '',
                customer_name: 'Budi Santoso',
                items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Customer ID is required');
            }
        });

        it('should fail when customer_name is empty', async () => {
            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: '',
                items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Customer name is required');
            }
        });

        it('should fail when items is empty', async () => {
            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('At least one item is required');
            }
        });

        it('should fail when item product name is empty', async () => {
            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [{ product: '', qty: 2, price: 25000 }],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Product name is required for all items');
            }
        });

        it('should fail when item quantity is less than 1', async () => {
            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [{ product: 'Kopi Susu', qty: 0, price: 25000 }],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Quantity must be at least 1');
            }
        });

        it('should fail when item price is negative', async () => {
            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [{ product: 'Kopi Susu', qty: 2, price: -100 }],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Price cannot be negative');
            }
        });

        it('should fail when payment_method is empty', async () => {
            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
                payment_method: '',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
                expect(result.error.message).toBe('Payment method is required');
            }
        });
    });

    describe('Failure Scenarios (Repository Errors)', () => {
        it('should propagate server error from repository', async () => {
            vi.mocked(mockRepository.createOrder).mockResolvedValue(
                failure(ErrorCodes.SERVER_ERROR, 'Internal server error')
            );

            const result = await createOrderUseCase.execute({
                customerId: 'C-001',
                customer_name: 'Budi Santoso',
                items: [{ product: 'Kopi Susu', qty: 2, price: 25000 }],
                payment_method: 'Cash',
                status: 'Pending',
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe(ErrorCodes.SERVER_ERROR);
            }
        });
    });
});
