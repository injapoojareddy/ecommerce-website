import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Lock, Truck, X } from 'lucide-react';
import {
  CartItem,
  OrderRecord,
  PaymentMethod,
  Product,
  ShippingDetails,
} from '../types';
import { formatINR } from '../utils/currency';
import { FLAT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from './CartDrawer';
import { ResilientImage } from './ResilientImage';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  products: Product[];
  promoCode: string | null;
  onClose: () => void;
  onPlaceOrder: (order: OrderRecord) => void;
}

const INITIAL_SHIPPING: ShippingDetails = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
};

export function CheckoutModal({
  isOpen,
  items,
  products,
  promoCode,
  onClose,
  onPlaceOrder,
}: CheckoutModalProps) {
  const [shipping, setShipping] = useState<ShippingDetails>(INITIAL_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmedOrder(null);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const detailedItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      const variant =
        product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
      return { ...item, product, variant };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const subtotal = detailedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = promoCode === 'WELCOME10' ? subtotal * 0.1 : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingCost =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = discountedSubtotal + shippingCost;

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!shipping.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!shipping.email.trim() || !shipping.email.includes('@')) {
      nextErrors.email = 'Valid email address is required.';
    }
    if (!shipping.phone.trim() || shipping.phone.trim().length < 7) {
      nextErrors.phone = 'Valid contact phone is required.';
    }
    if (!shipping.address.trim()) nextErrors.address = 'Street address is required.';
    if (!shipping.city.trim()) nextErrors.city = 'City is required.';
    if (!shipping.postalCode.trim()) nextErrors.postalCode = 'Postal code is required.';

    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\s+/g, '');
      if (digits.length < 12) nextErrors.cardNumber = 'Enter a valid card number.';
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        nextErrors.cardExpiry = 'Use MM/YY format.';
      }
      if (cardCvc.trim().length < 3) nextErrors.cardCvc = 'Enter 3–4 digits.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || detailedItems.length === 0) return;

    const orderNumber = `KG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'Confirmed — Preparing Shipment',
      paymentMethod,
      shipping: { ...shipping },
      items: detailedItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        variantLabel: item.variant.label,
        unitPrice: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
      subtotal,
      discount,
      shippingCost,
      total,
      promoCode,
    };

    setConfirmedOrder(newOrder);
    onPlaceOrder(newOrder);
  };

  const formatCardInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#18181B]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-heading"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white border border-[#E5E2DC] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#E5E2DC] bg-[#FAF9F6]">
          <h2 id="checkout-heading" className="font-display text-xl sm:text-2xl font-semibold text-[#18181B]">
            {confirmedOrder ? 'Order Confirmation' : 'Checkout'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#52525B] hover:text-[#18181B] hover:bg-[#F3F1ED] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="p-6 sm:p-10 space-y-8">
            <div className="flex items-start gap-4 pb-6 border-b border-[#E5E2DC]">
              <CheckCircle2 className="w-7 h-7 text-[#1B4332] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-mono-tabular text-xs font-medium text-[#1B4332]">
                  Order #{confirmedOrder.orderNumber} {confirmedOrder.status}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#18181B] mt-1">
                  Thank you, {confirmedOrder.shipping.fullName}
                </h3>
                <p className="text-sm text-[#52525B] mt-1">
                  A confirmation receipt has been recorded for {confirmedOrder.shipping.email}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="p-5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg space-y-2">
                <p className="text-xs font-semibold text-[#52525B]">Shipping Destination</p>
                <p className="font-medium text-[#18181B]">{confirmedOrder.shipping.fullName}</p>
                <p className="text-[#52525B]">{confirmedOrder.shipping.address}</p>
                <p className="text-[#52525B]">
                  {confirmedOrder.shipping.city}, {confirmedOrder.shipping.postalCode}
                </p>
                <p className="text-[#52525B]">{confirmedOrder.shipping.phone}</p>
              </div>

              <div className="p-5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg space-y-2">
                <p className="text-xs font-semibold text-[#52525B]">Payment &amp; Totals</p>
                <p className="font-medium text-[#18181B]">
                  {confirmedOrder.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : 'Credit / Debit Card'}
                </p>
                <div className="pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-[#52525B]">
                    <span>Subtotal</span>
                    <span className="font-mono-tabular">{formatINR(confirmedOrder.subtotal)}</span>
                  </div>
                  {confirmedOrder.discount > 0 && (
                    <div className="flex justify-between text-[#1B4332]">
                      <span>Discount</span>
                      <span className="font-mono-tabular">
                        -{formatINR(confirmedOrder.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#52525B]">
                    <span>Shipping</span>
                    <span className="font-mono-tabular">
                      {confirmedOrder.shippingCost === 0
                        ? 'Free'
                        : formatINR(confirmedOrder.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm text-[#18181B] pt-1.5 border-t border-[#E5E2DC]">
                    <span>Total Paid / Due</span>
                    <span className="font-mono-tabular">{formatINR(confirmedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#52525B]">Items in Order</h4>
              <div className="divide-y divide-[#E5E2DC] border border-[#E5E2DC] rounded-lg">
                {confirmedOrder.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantLabel}`}
                    className="flex items-center justify-between p-4 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded bg-[#F3F1ED] overflow-hidden shrink-0">
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#18181B] truncate">{item.name}</p>
                        <p className="text-xs text-[#52525B]">
                          {item.variantLabel} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-sm font-medium text-[#18181B] shrink-0">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#E5E2DC]">
              <div>
                <h3 className="text-sm font-semibold text-[#18181B] mb-4">
                  1. Delivery Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="chk-name" className="block text-xs font-medium text-[#52525B] mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="chk-name"
                      type="text"
                      value={shipping.fullName}
                      onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                      placeholder="Ananya Rao"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-700 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="chk-email" className="block text-xs font-medium text-[#52525B] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="chk-email"
                      type="email"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      placeholder="ananya@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                    />
                    {errors.email && <p className="text-xs text-red-700 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="chk-phone" className="block text-xs font-medium text-[#52525B] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="chk-phone"
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                    />
                    {errors.phone && <p className="text-xs text-red-700 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="chk-address" className="block text-xs font-medium text-[#52525B] mb-1.5">
                      Street Address
                    </label>
                    <input
                      id="chk-address"
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      placeholder="42 Indiranagar 100ft Road"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                    />
                    {errors.address && (
                      <p className="text-xs text-red-700 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="chk-city" className="block text-xs font-medium text-[#52525B] mb-1.5">
                      City
                    </label>
                    <input
                      id="chk-city"
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                    />
                    {errors.city && <p className="text-xs text-red-700 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="chk-postal" className="block text-xs font-medium text-[#52525B] mb-1.5">
                      Postal Code
                    </label>
                    <input
                      id="chk-postal"
                      type="text"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      placeholder="560038"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-red-700 mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-[#E5E2DC]">
                <h3 className="text-sm font-semibold text-[#18181B] mb-3">2. Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center gap-3 p-3.5 rounded-md border text-left transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#18181B]'
                        : 'border-[#E5E2DC] text-[#52525B] hover:border-[#18181B]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="block text-xs font-semibold">Credit / Debit Card</span>
                      <span className="block text-[11px] text-[#52525B]">Instant checkout</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-3 p-3.5 rounded-md border text-left transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#18181B]'
                        : 'border-[#E5E2DC] text-[#52525B] hover:border-[#18181B]'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="block text-xs font-semibold">Cash on Delivery</span>
                      <span className="block text-[11px] text-[#52525B]">Pay upon arrival</span>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="grid grid-cols-2 gap-3 p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-md">
                    <div className="col-span-2">
                      <label htmlFor="chk-card" className="block text-xs font-medium text-[#52525B] mb-1">
                        Card Number
                      </label>
                      <input
                        id="chk-card"
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                      />
                      {errors.cardNumber && (
                        <p className="text-xs text-red-700 mt-1">{errors.cardNumber}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="chk-exp" className="block text-xs font-medium text-[#52525B] mb-1">
                        Expiry
                      </label>
                      <input
                        id="chk-exp"
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="08/28"
                        className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                      />
                      {errors.cardExpiry && (
                        <p className="text-xs text-red-700 mt-1">{errors.cardExpiry}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="chk-cvc" className="block text-xs font-medium text-[#52525B] mb-1">
                        Security Code
                      </label>
                      <input
                        id="chk-cvc"
                        type="text"
                        maxLength={4}
                        inputMode="numeric"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#1B4332]"
                      />
                      {errors.cardCvc && (
                        <p className="text-xs text-red-700 mt-1">{errors.cardCvc}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#52525B] p-4 bg-[#FAF9F6] border border-[#E5E2DC] rounded-md">
                    Pay <strong className="font-mono-tabular text-[#18181B]">{formatINR(total)}</strong> in cash or UPI upon courier arrival. Orders over {formatINR(FREE_SHIPPING_THRESHOLD)} include complimentary shipping.
                  </p>
                )}
              </div>
            </div>

            {/* Right Order Summary */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#FAF9F6] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#18181B]">Order Summary</h3>
                <div className="divide-y divide-[#E5E2DC] max-h-64 overflow-y-auto pr-1">
                  {detailedItems.map(({ product, variant, quantity }) => (
                    <div key={`${product.id}-${variant.id}`} className="py-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-white border border-[#E5E2DC] overflow-hidden shrink-0">
                        <ResilientImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#18181B] truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-[#52525B]">
                          {variant.label} · Qty {quantity}
                        </p>
                      </div>
                      <span className="font-mono-tabular text-xs font-medium text-[#18181B]">
                        {formatINR(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <dl className="space-y-2 pt-4 border-t border-[#E5E2DC] text-sm">
                  <div className="flex justify-between text-[#52525B]">
                    <dt>Subtotal</dt>
                    <dd className="font-mono-tabular text-[#18181B]">{formatINR(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#1B4332]">
                      <dt>Promo ({promoCode})</dt>
                      <dd className="font-mono-tabular">-{formatINR(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-[#52525B]">
                    <dt>Shipping</dt>
                    <dd className="font-mono-tabular text-[#18181B]">
                      {shippingCost === 0 ? 'Free' : formatINR(shippingCost)}
                    </dd>
                  </div>
                  <div className="flex justify-between font-semibold text-[#18181B] pt-3 border-t border-[#E5E2DC]">
                    <dt>Total</dt>
                    <dd className="font-mono-tabular text-base">{formatINR(total)}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2.5">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4332]"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  <span className="font-mono-tabular">Place Order · {formatINR(total)}</span>
                </button>
                <p className="text-[11px] text-center text-[#52525B]">
                  Simulated assignment checkout — no real charge is processed.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
