/**
 * Order Entity Types
 */

export interface OrderItem {
    product: string;
    qty: number;
    price: number;
}

export interface Order {
    id: string;
    customerId: string;
    customer_name: string;
    total_amount: number;
    status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
    items: OrderItem[];
    payment_method: string;
    created_at: string;
}

export interface CreateOrderPayload {
    customerId: string;
    customer_name: string;
    items: OrderItem[];
    payment_method: string;
    status?: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
}

export interface UpdateOrderPayload {
    id: string;
    status?: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
    payment_method?: string;
    items?: OrderItem[];
}

// Pagination types imported from common module
