<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Customer, CreateCustomerPayload } from '~/core/customer-management'

const toast = useToast()

const {
    customers,
    selectedCustomer,
    pagination,
    loading,
    error,
    totalPages,
    fetchCustomers,
    getCustomerDetail,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    clearSelectedCustomer,
} = useCustomer()

// Modal states
const detailModalOpen = ref(false)
const formModalOpen = ref(false)
const deleteModalOpen = ref(false)
const isEditing = ref(false)
const customerToDelete = ref<Customer | null>(null)

// Form state
const formData = ref<CreateCustomerPayload>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
})

// Table data with explicit actions field to force column generation
const tableData = computed(() => {
    return customers.value.map(customer => ({
        ...customer,
        actions: ''
    }))
})

// Fetch customers on mount
onMounted(() => {
    fetchCustomers()
})

// Handle row click for detail modal
async function handleRowClick(customer: Customer) {
    await getCustomerDetail(customer.id)
    detailModalOpen.value = true
}

// Handle pagination
function handlePageChange(page: number) {
    fetchCustomers({ page })
}

// Open add modal
function openAddModal() {
    isEditing.value = false
    formData.value = {
        full_name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active',
    }
    formModalOpen.value = true
}

// Open edit modal
function openEditModal(customer: Customer) {
    isEditing.value = true
    formData.value = {
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
    }
    getCustomerDetail(customer.id)
    formModalOpen.value = true
}

// Handle form submit
async function handleFormSubmit() {
    if (isEditing.value && selectedCustomer.value) {
        const result = await updateCustomer({
            id: selectedCustomer.value.id,
            ...formData.value,
        })
        if (result) {
            toast.add({ title: 'Success', description: 'Customer updated successfully', color: 'success' })
            formModalOpen.value = false
        } else {
            toast.add({ title: 'Error', description: error.value || 'Failed to update customer', color: 'error' })
        }
    } else {
        const result = await createCustomer(formData.value)
        if (result) {
            toast.add({ title: 'Success', description: 'Customer created successfully', color: 'success' })
            formModalOpen.value = false
        } else {
            toast.add({ title: 'Error', description: error.value || 'Failed to create customer', color: 'error' })
        }
    }
}

// Open delete confirmation
function openDeleteModal(customer: Customer) {
    customerToDelete.value = customer
    deleteModalOpen.value = true
}

// Handle delete
async function handleDelete() {
    if (customerToDelete.value) {
        const success = await deleteCustomer(customerToDelete.value.id)
        if (success) {
            toast.add({ title: 'Success', description: 'Customer deleted successfully', color: 'success' })
        } else {
            toast.add({ title: 'Error', description: error.value || 'Failed to delete customer', color: 'error' })
        }
        deleteModalOpen.value = false
        customerToDelete.value = null
    }
}

// Format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<template>
    <div class="space-y-4">
        <!-- Header with Add Button -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold">Customers</h2>
                <p class="text-gray-400 text-sm">Manage your customer database</p>
            </div>
            <UButton 
                icon="i-lucide-plus" 
                label="Add Customer"
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
                <template #status-cell="{ row }">
                    <UBadge 
                        :color="row.original.status === 'Active' ? 'success' : 'neutral'"
                        variant="subtle"
                    >
                        {{ row.original.status }}
                    </UBadge>
                </template>

                <template #join_date-cell="{ row }">
                    {{ formatDate(row.original.join_date) }}
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
                        Showing {{ customers.length }} of {{ pagination.total }} customers
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
                <UCard v-if="selectedCustomer">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Customer Details</h3>
                            <UButton 
                                icon="i-lucide-x" 
                                color="neutral" 
                                variant="ghost" 
                                size="sm"
                                @click="detailModalOpen = false" 
                            />
                        </div>
                    </template>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <UAvatar 
                                :alt="selectedCustomer.full_name" 
                                size="xl"
                            />
                            <div>
                                <h4 class="text-xl font-bold">{{ selectedCustomer.full_name }}</h4>
                                <UBadge 
                                    :color="selectedCustomer.status === 'Active' ? 'success' : 'neutral'"
                                >
                                    {{ selectedCustomer.status }}
                                </UBadge>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm text-gray-400">ID</label>
                                <p class="font-medium">{{ selectedCustomer.id }}</p>
                            </div>
                            <div>
                                <label class="text-sm text-gray-400">Email</label>
                                <p class="font-medium">{{ selectedCustomer.email }}</p>
                            </div>
                            <div>
                                <label class="text-sm text-gray-400">Phone</label>
                                <p class="font-medium">{{ selectedCustomer.phone }}</p>
                            </div>
                            <div>
                                <label class="text-sm text-gray-400">Join Date</label>
                                <p class="font-medium">{{ formatDate(selectedCustomer.join_date) }}</p>
                            </div>
                        </div>

                        <div>
                            <label class="text-sm text-gray-400">Address</label>
                            <p class="font-medium">{{ selectedCustomer.address }}</p>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex gap-2 justify-end">
                            <UButton 
                                label="Edit" 
                                icon="i-lucide-pencil"
                                @click="openEditModal(selectedCustomer); detailModalOpen = false"
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
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                {{ isEditing ? 'Edit Customer' : 'Add Customer' }}
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
                        <UFormField label="Full Name" required>
                            <UInput 
                                v-model="formData.full_name" 
                                placeholder="Enter full name"
                            />
                        </UFormField>

                        <UFormField label="Email" required>
                            <UInput 
                                v-model="formData.email" 
                                type="email"
                                placeholder="Enter email address"
                            />
                        </UFormField>

                        <UFormField label="Phone" required>
                            <UInput 
                                v-model="formData.phone" 
                                placeholder="Enter phone number"
                            />
                        </UFormField>

                        <UFormField label="Address" required>
                            <UTextarea 
                                v-model="formData.address" 
                                placeholder="Enter address"
                                :rows="3"
                            />
                        </UFormField>

                        <UFormField label="Status">
                            <USelect
                                v-model="formData.status"
                                :items="[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Inactive', label: 'Inactive' },
                                ]"
                            />
                        </UFormField>
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
                            <h3 class="text-lg font-semibold">Delete Customer</h3>
                        </div>
                    </template>

                    <p class="text-gray-300">
                        Are you sure you want to delete 
                        <span class="font-bold">{{ customerToDelete?.full_name }}</span>? 
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
