/**
 * useCustomer Composable
 * Provides customer management functionality for Vue components
 */

import { ref, computed } from 'vue';
import { axios } from '../../infrastructure';

import {
    GetCustomersUseCase,
    GetCustomerDetailUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    CustomerRemoteDataSource,
    CustomerRepository,
    type Customer,
    type CreateCustomerPayload,
    type UpdateCustomerPayload,
} from '../../core/customer-management';

import type {
    PaginatedResponse,
    PaginationParams,
} from '../../core/common';


export function useCustomer() {
    const customers = ref<Customer[]>([]);
    const selectedCustomer = ref<Customer | null>(null);
    const pagination = ref({
        total: 0,
        page: 1,
        pageSize: 10,
    });
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Create repository with dependency injection
    const createRepository = () => {
        const datasource = new CustomerRemoteDataSource(axios);
        return new CustomerRepository(datasource);
    };

    async function fetchCustomers(params?: Partial<PaginationParams>): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new GetCustomersUseCase(repository);

            const result = await useCase.execute({
                page: params?.page || pagination.value.page,
                pageSize: params?.pageSize || pagination.value.pageSize,
            });

            if (result.success) {
                customers.value = result.data.data;
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
            error.value = 'Failed to fetch customers';
            return false;
        } finally {
            loading.value = false;
        }
    }

    async function getCustomerDetail(id: string): Promise<Customer | null> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new GetCustomerDetailUseCase(repository);
            const result = await useCase.execute(id);

            if (result.success) {
                selectedCustomer.value = result.data;
                return result.data;
            } else {
                error.value = result.error.message;
                return null;
            }
        } catch (e) {
            error.value = 'Failed to fetch customer detail';
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function createCustomer(payload: CreateCustomerPayload): Promise<Customer | null> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new CreateCustomerUseCase(repository);
            const result = await useCase.execute(payload);

            if (result.success) {
                // Refresh list after creation
                await fetchCustomers();
                return result.data;
            } else {
                error.value = result.error.message;
                return null;
            }
        } catch (e) {
            error.value = 'Failed to create customer';
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function updateCustomer(payload: UpdateCustomerPayload): Promise<Customer | null> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new UpdateCustomerUseCase(repository);
            const result = await useCase.execute(payload);

            if (result.success) {
                // Refresh list after update
                await fetchCustomers();
                return result.data;
            } else {
                error.value = result.error.message;
                return null;
            }
        } catch (e) {
            error.value = 'Failed to update customer';
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function deleteCustomer(id: string): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const repository = createRepository();
            const useCase = new DeleteCustomerUseCase(repository);
            const result = await useCase.execute(id);

            if (result.success) {
                // Refresh list after deletion
                await fetchCustomers();
                return true;
            } else {
                error.value = result.error.message;
                return false;
            }
        } catch (e) {
            error.value = 'Failed to delete customer';
            return false;
        } finally {
            loading.value = false;
        }
    }

    function clearError(): void {
        error.value = null;
    }

    function clearSelectedCustomer(): void {
        selectedCustomer.value = null;
    }

    return {
        customers: computed(() => customers.value),
        selectedCustomer: computed(() => selectedCustomer.value),
        pagination: computed(() => pagination.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        totalPages: computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize)),
        fetchCustomers,
        getCustomerDetail,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        clearError,
        clearSelectedCustomer,
    };
}
