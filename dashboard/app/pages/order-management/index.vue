<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Order, CreateOrderPayload, OrderItem } from '~/core/order-management'

const toast = useToast()

const {
    orders,
    selectedOrder,
    pagination,
    loading,
    error,
    totalPages,
    fetchOrders,
    getOrderDetail,
    createOrder,
    updateOrder,
    deleteOrder,
    formatCurrency,
    getStatusColor,
    clearSelectedOrder,
} = useOrderManagement()

// Modal states
const detailModalOpen = ref(false)
const formModalOpen = ref(false)
const deleteModalOpen = ref(false)
const isEditing = ref(false)
const orderToDelete = ref<Order | null>(null)

// Form state
const formData = ref<CreateOrderPayload>({
    customerId: '',
    customer_name: '',
    items: [{ product: '', qty: 1, price: 0 }],
    payment_method: 'Cash',
    status: 'Pending',
})

// Table columns removed to follow pattern
// Table data with explicit actions field to force column generation
const tableData = computed(() => {
    return orders.value.map(order => ({
        ...order,
        actions: ''
    }))
})

// Payment methods
const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GoPay', label: 'GoPay' },
    { value: 'OVO', label: 'OVO' },
    { value: 'Dana', label: 'Dana' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Credit Card', label: 'Credit Card' },
]

// Status options
const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Refunded', label: 'Refunded' },
]

// Fetch orders on mount
onMounted(() => {
    fetchOrders()
})

// Handle row click for detail modal
async function handleRowClick(order: Order) {
    await getOrderDetail(order.id)
    detailModalOpen.value = true
}

// Handle pagination
function handlePageChange(page: number) {
    fetchOrders({ page })
}

// Open add modal
function openAddModal() {
    isEditing.value = false
    formData.value = {
        customerId: '',
        customer_name: '',
        items: [{ product: '', qty: 1, price: 0 }],
        payment_method: 'Cash',
        status: 'Pending',
    }
    formModalOpen.value = true
}

// Open edit modal
function openEditModal(order: Order) {
    isEditing.value = true
    formData.value = {
        customerId: order.customerId,
        customer_name: order.customer_name,
        items: [...order.items],
        payment_method: order.payment_method,
        status: order.status,
    }
    getOrderDetail(order.id)
    formModalOpen.value = true
}

// Add item to order
function addItem() {
    formData.value.items.push({ product: '', qty: 1, price: 0 })
}

// Remove item from order
function removeItem(index: number) {
    if (formData.value.items.length > 1) {
        formData.value.items.splice(index, 1)
    }
}

// Calculate total
const formTotal = computed(() => {
    return formData.value.items.reduce((sum, item) => sum + (item.qty * item.price), 0)
})

// Handle form submit
async function handleFormSubmit() {
    if (isEditing.value && selectedOrder.value) {
        const result = await updateOrder({
            id: selectedOrder.value.id,
            items: formData.value.items,
            payment_method: formData.value.payment_method,
            status: formData.value.status,
        })
        if (result) {
            toast.add({ title: 'Success', description: 'Order updated successfully', color: 'success' })
            formModalOpen.value = false
        } else {
            toast.add({ title: 'Error', description: error.value || 'Failed to update order', color: 'error' })
        }
    } else {
        const result = await createOrder(formData.value)
        if (result) {
            toast.add({ title: 'Success', description: 'Order created successfully', color: 'success' })
            formModalOpen.value = false
        } else {
            toast.add({ title: 'Error', description: error.value || 'Failed to create order', color: 'error' })
        }
    }
}

// Open delete confirmation
function openDeleteModal(order: Order) {
    orderToDelete.value = order
    deleteModalOpen.value = true
}

// Handle delete
async function handleDelete() {
    if (orderToDelete.value) {
        const success = await deleteOrder(orderToDelete.value.id)
        if (success) {
            toast.add({ title: 'Success', description: 'Order deleted successfully', color: 'success' })
        } else {
            toast.add({ title: 'Error', description: error.value || 'Failed to delete order', color: 'error' })
        }
        deleteModalOpen.value = false
        orderToDelete.value = null
    }
}

// Format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Get status badge color
function getStatusBadgeColor(status: Order['status']): string {
    const colors: Record<Order['status'], 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
        Paid: 'success',
        Pending: 'warning',
        Failed: 'error',
        Refunded: 'info',
    }
    return colors[status] || 'neutral'
}
</script>

<template>
    <div class="space-y-4">
        <!-- Header with Add Button -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold">Orders</h2>
                <p class="text-gray-400 text-sm">Manage your orders and transactions</p>
            </div>
            <UButton 
                icon="i-lucide-plus" 
                label="New Order"
                @click="openAddModal"
            />
        </div>

        <!-- Table Card -->
        <UCard class="overflow-hidden">
            <UTable
                :data="tableData"
                :loading="loading"
                class="w-full"
                @row-click="(row) => handleRowClick(row.original)"
            >
                <template #total_amount-cell="{ row }">
                    <span class="font-semibold">{{ formatCurrency(row.original.total_amount) }}</span>
                </template>

                <template #status-cell="{ row }">
                    <UBadge 
                        :color="getStatusBadgeColor(row.original.status)"
                        variant="subtle"
                    >
                        {{ row.original.status }}
                    </UBadge>
                </template>
                
                <template #items-cell="{ row }">
                    <UBadge
                        v-for="item in row.original.items"
                        :key="item.id"
                        variant="subtle"
                        class="mr-2"
                    >
                        {{ item.product }}
                    </UBadge>
                </template>

                <template #created_at-cell="{ row }">
                    {{ formatDate(row.original.created_at) }}
                </template>

                <template #actions-cell="{ row }">
                    <div class="flex gap-2" @click.stop>
                        <UButton
                            icon="i-lucide-eye"
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            @click="handleRowClick(row.original)"
                        />
                        <UButton
                            icon="i-lucide-pencil"
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            @click="openEditModal(row.original)"
                        />
                        <UButton
                            icon="i-lucide-trash-2"
                            size="xs"
                            color="error"
                            variant="ghost"
                            @click="openDeleteModal(row.original)"
                        />
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <template #footer>
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                    <p class="text-sm text-gray-400">
                        Showing {{ orders.length }} of {{ pagination.total }} orders
                    </p>
                    <UPagination
                        v-if="totalPages > 1"
                        :default-page="pagination.page"
                        :total="pagination.total"
                        :items-per-page="pagination.pageSize"
                        @update:page="handlePageChange"
                    />
                </div>
            </template>
        </UCard>

        <!-- Detail Modal -->
        <UModal v-model:open="detailModalOpen">
            <template #content>
                <UCard v-if="selectedOrder" class="max-h-[90vh] overflow-auto">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold">Order Details</h3>
                                <p class="text-sm text-gray-400">{{ selectedOrder.id }}</p>
                            </div>
                            <UButton 
                                icon="i-lucide-x" 
                                color="neutral" 
                                variant="ghost" 
                                size="sm"
                                @click="detailModalOpen = false" 
                            />
                        </div>
                    </template>

                    <div class="space-y-6">
                        <!-- Order Info -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label class="text-sm text-gray-400">Status</label>
                                <div class="mt-1">
                                    <UBadge 
                                        :color="getStatusBadgeColor(selectedOrder.status)"
                                        size="lg"
                                    >
                                        {{ selectedOrder.status }}
                                    </UBadge>
                                </div>
                            </div>
                            <div>
                                <label class="text-sm text-gray-400">Customer</label>
                                <p class="font-medium">{{ selectedOrder.customer_name }}</p>
                            </div>
                            <div>
                                <label class="text-sm text-gray-400">Payment</label>
                                <p class="font-medium">{{ selectedOrder.payment_method }}</p>
                            </div>
                            <div>
                                <label class="text-sm text-gray-400">Date</label>
                                <p class="font-medium">{{ formatDate(selectedOrder.created_at) }}</p>
                            </div>
                        </div>

                        <!-- Order Items -->
                        <div>
                            <h4 class="font-semibold mb-3">Order Items</h4>
                            <div class="bg-gray-800 rounded-lg overflow-hidden">
                                <table class="w-full">
                                    <thead class="bg-gray-700">
                                        <tr>
                                            <th class="text-left p-3 text-sm">Product</th>
                                            <th class="text-center p-3 text-sm">Qty</th>
                                            <th class="text-right p-3 text-sm">Price</th>
                                            <th class="text-right p-3 text-sm">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in selectedOrder.items" :key="index" class="border-t border-gray-700">
                                            <td class="p-3">{{ item.product }}</td>
                                            <td class="p-3 text-center">{{ item.qty }}</td>
                                            <td class="p-3 text-right">{{ formatCurrency(item.price) }}</td>
                                            <td class="p-3 text-right">{{ formatCurrency(item.qty * item.price) }}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="bg-gray-700">
                                        <tr>
                                            <td colspan="3" class="p-3 text-right font-semibold">Total:</td>
                                            <td class="p-3 text-right font-bold text-lg">
                                                {{ formatCurrency(selectedOrder.total_amount) }}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex gap-2 justify-end">
                            <UButton 
                                label="Edit" 
                                icon="i-lucide-pencil"
                                @click="openEditModal(selectedOrder); detailModalOpen = false"
                            />
                            <UButton 
                                label="Close" 
                                color="neutral" 
                                variant="outline"
                                @click="detailModalOpen = false"
                            />
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <!-- Form Modal (Add/Edit) -->
        <UModal v-model:open="formModalOpen">
            <template #content>
                <UCard class="max-h-[90vh] overflow-auto">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                {{ isEditing ? 'Edit Order' : 'New Order' }}
                            </h3>
                            <UButton 
                                icon="i-lucide-x" 
                                color="neutral" 
                                variant="ghost" 
                                size="sm"
                                @click="formModalOpen = false" 
                            />
                        </div>
                    </template>

                    <form class="space-y-4" @submit.prevent="handleFormSubmit">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <UFormField label="Customer ID" required>
                                <UInput 
                                    v-model="formData.customerId" 
                                    placeholder="e.g., C-001"
                                    :disabled="isEditing"
                                />
                            </UFormField>

                            <UFormField label="Customer Name" required>
                                <UInput 
                                    v-model="formData.customer_name" 
                                    placeholder="Enter customer name"
                                    :disabled="isEditing"
                                />
                            </UFormField>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <UFormField label="Payment Method" required>
                                <USelect
                                    v-model="formData.payment_method"
                                    :items="paymentMethods"
                                />
                            </UFormField>

                            <UFormField label="Status">
                                <USelect
                                    v-model="formData.status"
                                    :items="statusOptions"
                                />
                            </UFormField>
                        </div>

                        <!-- Order Items -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <label class="font-semibold">Order Items</label>
                                <UButton 
                                    icon="i-lucide-plus" 
                                    label="Add Item"
                                    size="xs"
                                    variant="outline"
                                    @click="addItem"
                                />
                            </div>

                            <div class="space-y-3">
                                <div 
                                    v-for="(item, index) in formData.items" 
                                    :key="index"
                                    class="flex gap-2 items-end bg-gray-800 p-3 rounded-lg"
                                >
                                    <UFormField label="Product" class="flex-1">
                                        <UInput 
                                            v-model="item.product" 
                                            placeholder="Product name"
                                        />
                                    </UFormField>
                                    <UFormField label="Qty" class="w-20">
                                        <UInput 
                                            v-model.number="item.qty" 
                                            type="number"
                                            min="1"
                                        />
                                    </UFormField>
                                    <UFormField label="Price" class="w-32">
                                        <UInput 
                                            v-model.number="item.price" 
                                            type="number"
                                            min="0"
                                        />
                                    </UFormField>
                                    <UButton 
                                        icon="i-lucide-trash-2" 
                                        color="error"
                                        variant="ghost"
                                        :disabled="formData.items.length <= 1"
                                        @click="removeItem(index)"
                                    />
                                </div>
                            </div>

                            <div class="mt-4 p-3 bg-gray-700 rounded-lg flex justify-between items-center">
                                <span class="font-semibold">Total:</span>
                                <span class="text-xl font-bold">{{ formatCurrency(formTotal) }}</span>
                            </div>
                        </div>
                    </form>

                    <template #footer>
                        <div class="flex gap-2 justify-end">
                            <UButton 
                                label="Cancel" 
                                color="neutral" 
                                variant="outline"
                                @click="formModalOpen = false"
                            />
                            <UButton 
                                :label="isEditing ? 'Update' : 'Create'"
                                :loading="loading"
                                @click="handleFormSubmit"
                            />
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <!-- Delete Confirmation Modal -->
        <UModal v-model:open="deleteModalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-red-500/10 rounded-lg">
                                <UIcon name="i-lucide-alert-triangle" class="text-red-500 text-xl" />
                            </div>
                            <h3 class="text-lg font-semibold">Delete Order</h3>
                        </div>
                    </template>

                    <p class="text-gray-300">
                        Are you sure you want to delete order 
                        <span class="font-bold">{{ orderToDelete?.id }}</span>? 
                        This action cannot be undone.
                    </p>

                    <template #footer>
                        <div class="flex gap-2 justify-end">
                            <UButton 
                                label="Cancel" 
                                color="neutral" 
                                variant="outline"
                                @click="deleteModalOpen = false"
                            />
                            <UButton 
                                label="Delete"
                                color="error"
                                :loading="loading"
                                @click="handleDelete"
                            />
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
