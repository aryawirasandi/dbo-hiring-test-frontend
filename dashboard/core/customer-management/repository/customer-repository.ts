/**
 * Customer Repository
 * Abstracts data source and provides clean interface for usecases
 */

import type {
    Customer,
    CreateCustomerPayload,
    UpdateCustomerPayload
} from '../entity';
import type { ICustomerRemoteDataSource } from '../datasources';
import type { Result, PaginatedResponse, PaginationParams } from '../../common';


export interface ICustomerRepository {
    getCustomers(params: PaginationParams): Promise<Result<PaginatedResponse<Customer>>>;
    getCustomerById(id: string): Promise<Result<Customer>>;
    createCustomer(payload: CreateCustomerPayload): Promise<Result<Customer>>;
    updateCustomer(payload: UpdateCustomerPayload): Promise<Result<Customer>>;
    deleteCustomer(id: string): Promise<Result<void>>;
}

export class CustomerRepository implements ICustomerRepository {
    constructor(private readonly remoteDataSource: ICustomerRemoteDataSource) { }

    async getCustomers(params: PaginationParams): Promise<Result<PaginatedResponse<Customer>>> {
        return this.remoteDataSource.getCustomers(params);
    }

    async getCustomerById(id: string): Promise<Result<Customer>> {
        return this.remoteDataSource.getCustomerById(id);
    }

    async createCustomer(payload: CreateCustomerPayload): Promise<Result<Customer>> {
        return this.remoteDataSource.createCustomer(payload);
    }

    async updateCustomer(payload: UpdateCustomerPayload): Promise<Result<Customer>> {
        return this.remoteDataSource.updateCustomer(payload);
    }

    async deleteCustomer(id: string): Promise<Result<void>> {
        return this.remoteDataSource.deleteCustomer(id);
    }
}
