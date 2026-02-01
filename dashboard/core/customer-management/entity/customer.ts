/**
 * Customer Entity Types
 */

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive';
    join_date: string;
}

export interface CreateCustomerPayload {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    status?: 'Active' | 'Inactive';
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {
    id: string;
}

// Pagination types imported from common module
