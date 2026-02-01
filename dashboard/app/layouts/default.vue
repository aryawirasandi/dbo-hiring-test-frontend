<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useMediaQuery } from '@vueuse/core'

const route = useRoute()
const { user, logout } = useAuth()

const isMobile = useMediaQuery('(max-width: 768px)')
const sidebarOpen = ref(!isMobile.value)

watch(isMobile, (mobile) => {
    sidebarOpen.value = !mobile
})

// Navigation items with routes
const items: NavigationMenuItem[] = [
    { 
        label: 'Dashboard', 
        icon: 'i-lucide-house', 
        to: '/',
        active: route.path === '/'
    },
    { 
        label: 'Customer Management', 
        icon: 'i-lucide-users',
        to: '/customer-management',
        active: route.path === '/customer-management'
    },
    { 
        label: 'Order Management', 
        icon: 'i-lucide-shopping-cart',
        to: '/order-management',
        active: route.path === '/order-management'
    },
]

// Update active state when route changes
watch(() => route.path, () => {
    items.forEach(item => {
        if ('to' in item) {
            item.active = route.path === item.to
        }
    })
})

// Get page title based on current route
const pageTitle = computed(() => {
    switch (route.path) {
        case '/':
            return 'Dashboard'
        case '/customer-management':
            return 'Customer Management'
        case '/order-management':
            return 'Order Management'
        default:
            return 'Dashboard'
    }
})
</script>

<template>
    <UDashboardGroup>
        <UDashboardSidebar v-model:open="sidebarOpen" :resizable="!isMobile" :overlay="isMobile">
            <template #resize-handle="{ onMouseDown, onTouchStart, onDoubleClick }">
                <UDashboardResizeHandle 
                    class="after:absolute after:inset-y-0 after:right-0 after:w-px hover:after:bg-(--ui-border-accented) after:transition" 
                    @mousedown="onMouseDown"
                    @touchstart="onTouchStart" 
                    @dblclick="onDoubleClick" 
                />
            </template>

            <template #header="{ collapsed }">
                <div class="flex items-center gap-2 p-2">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <UIcon name="i-lucide-layout-dashboard" class="text-white" />
                    </div>
                    <span v-if="!collapsed" class="font-bold text-lg">DBO Admin</span>
                </div>
            </template>

            <template #default="{ collapsed }">
                <UButton 
                    :label="collapsed ? undefined : 'Search...'" 
                    icon="i-lucide-search" 
                    color="neutral"
                    variant="outline" 
                    block 
                    :square="collapsed"
                >
                    <template v-if="!collapsed" #trailing>
                        <div class="flex items-center gap-0.5 ms-auto">
                            <UKbd value="meta" variant="subtle" />
                            <UKbd value="K" variant="subtle" />
                        </div>
                    </template>
                </UButton>

                <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
                
                <div class="mt-auto p-2">
                    <UButton 
                        icon="i-lucide-log-out" 
                        label="Logout" 
                        :square="collapsed"
                        variant="ghost" 
                        color="error" 
                        block 
                        class="justify-start" 
                        @click="logout" 
                    />
                </div>
            </template>

            <template #footer="{ collapsed }">
                <div class="flex items-center gap-2 p-2 border-t border-gray-700">
                    <UAvatar 
                        :alt="user?.name || 'User'" 
                        size="sm"
                        class="bg-gradient-to-br from-blue-600 to-purple-600"
                    />
                    <div v-if="!collapsed" class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate">{{ user?.name || 'User' }}</p>
                        <p class="text-xs text-gray-400 truncate">{{ user?.role || 'Admin' }}</p>
                    </div>
                </div>
            </template>
        </UDashboardSidebar>

        <!-- MAIN CONTENT -->
        <div class="flex flex-col flex-1 min-w-0">
            <header class="flex items-center gap-2 p-3 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
                <UButton 
                    v-if="isMobile" 
                    icon="i-lucide-menu" 
                    color="neutral" 
                    variant="ghost" 
                    square
                    @click="sidebarOpen = !sidebarOpen" 
                />
                <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
                
                <!-- Breadcrumb on larger screens -->
                <nav v-if="!isMobile" class="ml-4 text-sm text-gray-400">
                    <span>Home</span>
                    <span v-if="route.path !== '/'" class="mx-2">/</span>
                    <span v-if="route.path !== '/'" class="text-white">{{ pageTitle }}</span>
                </nav>
            </header>

            <main class="flex-1 overflow-auto p-4 md:p-6">
                <slot />
            </main>
        </div>
    </UDashboardGroup>
</template>
