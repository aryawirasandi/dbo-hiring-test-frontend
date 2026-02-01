/**
 * Supplier Entity Types
 */

export interface Supplier {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive';
    join_date: string;
}

export interface CreateSupplierPayload {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    status?: 'Active' | 'Inactive';
}

export interface UpdateSupplierPayload extends Partial<CreateSupplierPayload> {
    id: string;
}
