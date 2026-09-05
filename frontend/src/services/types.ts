/**
 * Types mirroring the existing Mongoose schemas exactly.
 * Source of truth: mediflow-backend/src/models/*.js
 * Do not add fields the backend does not return.
 */

export interface Timestamped {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export type Role = "Admin" | "User";

export interface User extends Timestamped {
  name: string;
  email: string;
  role: Role;
}

export interface Product extends Timestamped {
  productName: string;
  sku: string;
  category: string;
  brand: string;
  supplier: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minimumStock: number;
  unit: string;
  productImage: string;
}

export type Gender = "Male" | "Female" | "Other";
export type AddressType = "Home" | "Work" | "Other";

export interface Customer extends Timestamped {
  customerId: string;
  customerName: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  gstNumber: string;
  addressType: AddressType;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

export type PaymentMethod = "Cash" | "UPI" | "Card" | "Net Banking";
export type PaymentStatus = "Pending" | "Paid" | "Failed";
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

/** Order list populates only a subset; detail populates the full documents. */
export interface OrderItem {
  _id?: string;
  product: Pick<Product, "_id" | "productName" | "sku"> | Product | null;
  quantity: number;
  price: number;
}

export interface Order extends Timestamped {
  orderNumber: string;
  customer:
    | Pick<Customer, "_id" | "customerId" | "customerName">
    | Customer
    | null;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  discount: number;
  shippingCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
}

/* --- envelope shapes returned by the controllers --- */

export interface ListResponse<T> {
  success: true;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: T[];
}

export interface ItemResponse<T> {
  success: true;
  data: T;
}

/** Create/update/delete return only a message and sometimes an id. */
export interface MutationResponse {
  success: true;
  message: string;
  id?: string;
}
