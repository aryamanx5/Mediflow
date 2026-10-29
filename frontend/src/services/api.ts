/**
 * Endpoint bindings. One function per existing backend route — nothing more.
 * Route inventory verified against mediflow-backend/src/routes/*.js
 */
import { request, query } from "./client";
import type {
  Customer,
  ItemResponse,
  ListResponse,
  MutationResponse,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  User,
} from "./types";

/* ---------------------------------------------------------------- auth --- */

export const auth = {
  /** POST /api/auth/login -> { token }. No user object is returned. */
  login: (email: string, password: string) =>
    request<{ success: true; message: string; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  /** POST /api/auth/register -> { id }. No token: the user must then sign in. */
  register: (body: {
    name: string;
    email: string;
    password: string;
  }) => request<MutationResponse>("/auth/register", { method: "POST", body }),

  /** GET /api/auth/demo -> instant token for the shared read-only demo account. */
  demo: () =>
    request<{ success: true; message: string; token: string; isDemo: boolean; readOnly: boolean; credentials: { email: string; password: string } }>("/auth/demo", {
      method: "GET",
    }),
};

/* --------------------------------------------------------------- users --- */

export const users = {
  /** The only way to learn the signed-in user's name and role. */
  profile: (signal?: AbortSignal) =>
    request<ItemResponse<User>>("/users/profile", { signal }),

  updateProfile: (body: Partial<Pick<User, "name" | "email">>) =>
    request<{ success: true; message: string; data: User }>("/users/profile", {
      method: "PUT",
      body,
    }),
};

/* ------------------------------------------------------------ products --- */

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
}

export type ProductInput = Pick<
  Product,
  | "productName"
  | "sku"
  | "category"
  | "brand"
  | "supplier"
  | "costPrice"
  | "sellingPrice"
  | "stockQuantity"
  | "minimumStock"
  | "unit"
> &
  Partial<Pick<Product, "description">>;

export const products = {
  list: (params: ProductQuery = {}, signal?: AbortSignal) =>
    request<ListResponse<Product>>(`/products${query({ ...params })}`, { signal }),

  get: (id: string, signal?: AbortSignal) =>
    request<ItemResponse<Product>>(`/products/${id}`, { signal }),

  create: (body: ProductInput) =>
    request<MutationResponse>("/products", { method: "POST", body }),

  update: (id: string, body: Partial<ProductInput>) =>
    request<MutationResponse>(`/products/${id}`, { method: "PUT", body }),

  remove: (id: string) =>
    request<MutationResponse>(`/products/${id}`, { method: "DELETE" }),
};

/* ----------------------------------------------------------- customers --- */

export interface CustomerQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export type CustomerInput = Pick<
  Customer,
  | "customerId"
  | "customerName"
  | "age"
  | "gender"
  | "phone"
  | "email"
  | "addressLine1"
  | "city"
  | "state"
  | "pinCode"
> &
  Partial<
    Pick<
      Customer,
      | "gstNumber"
      | "addressType"
      | "addressLine2"
      | "landmark"
      | "country"
    >
  >;

export const customers = {
  list: (params: CustomerQuery = {}, signal?: AbortSignal) =>
    request<ListResponse<Customer>>(`/customers${query({ ...params })}`, { signal }),

  get: (id: string, signal?: AbortSignal) =>
    request<ItemResponse<Customer>>(`/customers/${id}`, { signal }),

  create: (body: CustomerInput) =>
    request<MutationResponse>("/customers", { method: "POST", body }),

  update: (id: string, body: Partial<CustomerInput>) =>
    request<MutationResponse>(`/customers/${id}`, { method: "PUT", body }),

  remove: (id: string) =>
    request<MutationResponse>(`/customers/${id}`, { method: "DELETE" }),
};

/* -------------------------------------------------------------- orders --- */

export interface OrderQuery {
  search?: string;
  orderStatus?: OrderStatus | "";
  paymentStatus?: PaymentStatus | "";
  page?: number;
  limit?: number;
}

export interface OrderInput {
  customerId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  discount?: number;
  shippingCharge?: number;
}

export const orders = {
  list: (params: OrderQuery = {}, signal?: AbortSignal) =>
    request<ListResponse<Order>>(`/orders${query({ ...params })}`, { signal }),

  get: (id: string, signal?: AbortSignal) =>
    request<ItemResponse<Order>>(`/orders/${id}`, { signal }),

  create: (body: OrderInput) =>
    request<MutationResponse>("/orders", { method: "POST", body }),

  /** The only mutation the backend exposes on an existing order. */
  cancel: (id: string) =>
    request<MutationResponse>(`/orders/cancel/${id}`, { method: "PUT" }),
};
