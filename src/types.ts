export type ProductCategory = 'Lighting' | 'Ceramics' | 'Workspace' | 'Textiles';

export interface ProductVariant {
  id: string;
  label: string;
  swatchHex: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  material: string;
  price: number;
  availability: 'In Stock' | 'Limited Run';
  featured: boolean;
  image: string;
  description: string;
  dimensions: string;
  origin: string;
  variants: ProductVariant[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export type PaymentMethod = 'card' | 'cod';

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface OrderRecord {
  orderNumber: string;
  createdAt: string;
  status: 'Confirmed — Preparing Shipment';
  paymentMethod: PaymentMethod;
  shipping: ShippingDetails;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  promoCode: string | null;
}
