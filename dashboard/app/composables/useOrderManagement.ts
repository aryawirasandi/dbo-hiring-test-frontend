/**
 * useOrderManagement Composable
 * Provides order management functionality for Vue components
 */

import { ref, computed } from 'vue';
import { axios } from '../../infrastructure';

import {
    GetOrdersUseCase,
    GetOrderDetailUseCase,
    CreateOrderUseCase,
    UpdateOrderUseCase,
    DeleteOrderUseCase,
    OrderRemoteDataSource,
    OrderRepository,
    type Order,
    type CreateOrderPayload,
    type UpdateOrderPayload,
} from '../../core/order-management';

import type {
    PaginatedResponse,
    PaginationParams,
} from '../../core/common';


export function useOrderManagement() {
    const orders = ref<Order[]>([]);
    const selectedOrder = ref<Order | null>(null);
    const pagination = ref({
        total: 0,
        page: 1,
        pageSize: 10,
    });
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Create repository with dependency injection
    const createRepository = () => {
        const datasource = new OrderRemoteDataSource(axios);
        return new OrderRepository(datasource);
    };

    async function fetchOrders(params?: Partial<PaginationParams>): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new GetOrdersUseCase(repository);

            const result = await useCase.execute({
                page: params?.page || pagination.value.page,
                pageSize: params?.pageSize || pagination.value.pageSize,
            });

            if (result.success) {
                orders.value = result.data.data;
                pagination.value = {
                    total: result.data.total,
                    page: result.data.page,
                    pageSize: result.data.pageSize,
                };
                return true;
            } else {
                error.value = result.error.message;
                return false;
            }
        } catch (e) {
            error.value = 'Failed to fetch orders';
            return false;
        } finally {
            loading.value = false;
        }
    }

    async function getOrderDetail(id: string): Promise<Order | null> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new GetOrderDetailUseCase(repository);
            const result = await useCase.execute(id);

            if (result.success) {
                selectedOrder.value = result.data;
                return result.data;
            } else {
                error.value = result.error.message;
                return null;
            }
        } catch (e) {
            error.value = 'Failed to fetch order detail';
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function createOrder(payload: CreateOrderPayload): Promise<Order | null> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new CreateOrderUseCase(repository);
            const result = await useCase.execute(payload);

            if (result.success) {
                // Refresh list after creation
                await fetchOrders();
                return result.data;
            } else {
                error.value = result.error.message;
                return null;
            }
        } catch (e) {
            error.value = 'Failed to create order';
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function updateOrder(payload: UpdateOrderPayload): Promise<Order | null> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new UpdateOrderUseCase(repository);
            const result = await useCase.execute(payload);

            if (result.success) {
                // Refresh list after update
                await fetchOrders();
                return result.data;
            } else {
                error.value = result.error.message;
                return null;
            }
        } catch (e) {
            error.value = 'Failed to update order';
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function deleteOrder(id: string): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new DeleteOrderUseCase(repository);
            const result = await useCase.execute(id);

            if (result.success) {
                // Refresh list after deletion
                await fetchOrders();
                return true;
            } else {
                error.value = result.error.message;
                return false;
            }
        } catch (e) {
            error.value = 'Failed to delete order';
            return false;
        } finally {
            loading.value = false;
        }
    }

    // Helper function to format currency
    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    }

    // Helper function to get status color
    function getStatusColor(status: Order['status']): string {
        const colors: Record<Order['status'], string> = {
            Paid: 'success',
            Pending: 'warning',
            Failed: 'error',
            Refunded: 'info',
        };
        return colors[status] || 'neutral';
    }

    function clearError(): void {
        error.value = null;
    }

    function clearSelectedOrder(): void {
        selectedOrder.value = null;
    }

    return {
        orders: computed(() => orders.value),
        selectedOrder: computed(() => selectedOrder.value),
        pagination: computed(() => pagination.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        totalPages: computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize)),
        fetchOrders,
        getOrderDetail,
        createOrder,
        updateOrder,
        deleteOrder,
        formatCurrency,
        getStatusColor,
        clearError,
        clearSelectedOrder,
    };
}
