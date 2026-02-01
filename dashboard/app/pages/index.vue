<script setup lang="ts">
const { user } = useAuth()
const { customers, fetchCustomers } = useCustomer()
const { orders, fetchOrders, formatCurrency } = useOrderManagement()

// Fetch data on mount
onMounted(async () => {
    await Promise.all([
        fetchCustomers({ page: 1, pageSize: 100 }),
        fetchOrders({ page: 1, pageSize: 100 }),
    ])
})

// Dashboard stats
const stats = computed(() => [
    {
        title: 'Total Customers',
        value: customers.value.length.toString(),
        icon: 'i-lucide-users',
        color: 'bg-blue-600',
    },
    {
        title: 'Total Orders',
        value: orders.value.length.toString(),
        icon: 'i-lucide-shopping-cart',
        color: 'bg-purple-600',
    },
    {
        title: 'Revenue',
        value: formatCurrency(orders.value.reduce((sum, o) => sum + o.total_amount, 0)),
        icon: 'i-lucide-dollar-sign',
        color: 'bg-green-600',
    },
    {
        title: 'Active Customers',
        value: customers.value.filter(c => c.status === 'Active').length.toString(),
        icon: 'i-lucide-user-check',
        color: 'bg-amber-600',
    },
])
</script>

<template>
    <div class="space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-gray-800 rounded-2xl p-6 md:p-8">
            <h1 class="text-2xl md:text-3xl font-bold text-white">
                Welcome back, {{ user?.name || 'Admin' }}! 👋
            </h1>
            <p class="text-blue-100 mt-2">
                Here's what's happening with your business today.
            </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <UCard 
                v-for="stat in stats" 
                :key="stat.title"
                class="relative overflow-hidden"
            >
                <div class="flex items-center gap-4">
                    <div 
                        :class="`p-3 rounded-xl ${stat.color}`"
                    >
                        <UIcon :name="stat.icon" class="text-2xl text-white" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-400">{{ stat.title }}</p>
                        <p class="text-2xl font-bold">{{ stat.value }}</p>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Quick Links -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Recent Customers -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold">Recent Customers</h3>
                        <UButton 
                            label="View All" 
                            variant="link" 
                            to="/customer-management"
                            trailing-icon="i-lucide-arrow-right"
                            size="sm"
                        />
                    </div>
                </template>

                <div class="space-y-3">
                    <div 
                        v-for="customer in customers.slice(0, 5)" 
                        :key="customer.id"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                        <UAvatar 
                            :alt="customer.full_name" 
                            size="sm"
                        />
                        <div class="flex-1 min-w-0">
                            <p class="font-medium truncate">{{ customer.full_name }}</p>
                            <p class="text-sm text-gray-400 truncate">{{ customer.email }}</p>
                        </div>
                        <UBadge 
                            :color="customer.status === 'Active' ? 'success' : 'neutral'"
                            variant="subtle"
                            size="xs"
                        >
                            {{ customer.status }}
                        </UBadge>
                    </div>

                    <div v-if="customers.length === 0" class="text-center py-4 text-gray-400">
                        No customers yet
                    </div>
                </div>
            </UCard>

            <!-- Recent Orders -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold">Recent Orders</h3>
                        <UButton 
                            label="View All" 
                            variant="link" 
                            to="/order-management"
                            trailing-icon="i-lucide-arrow-right"
                            size="sm"
                        />
                    </div>
                </template>

                <div class="space-y-3">
                    <div 
                        v-for="order in orders.slice(0, 5)" 
                        :key="order.id"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                        <div class="p-2 rounded-lg bg-gray-700">
                            <UIcon name="i-lucide-receipt" class="text-gray-400" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium truncate">{{ order.id }}</p>
                            <p class="text-sm text-gray-400 truncate">{{ order.customer_name }}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">{{ formatCurrency(order.total_amount) }}</p>
                            <UBadge 
                                :color="order.status === 'Paid' ? 'success' : order.status === 'Pending' ? 'warning' : 'error'"
                                variant="subtle"
                                size="xs"
                            >
                                {{ order.status }}
                            </UBadge>
                        </div>
                    </div>

                    <div v-if="orders.length === 0" class="text-center py-4 text-gray-400">
                        No orders yet
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>