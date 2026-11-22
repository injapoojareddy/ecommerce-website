import { useEffect, useState } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, Product } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  products: Product[];
  promoCode: string | null;
  onClose: () => void;
  onUpdateQuantity: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onClearCart: () => void;
  onApplyPromo: (code: string) => { ok: boolean; message: string };
  onRemovePromo: () => void;
  onProceedToCheckout: () => void;
}

export const FREE_SHIPPING_THRESHOLD = 3000;
export const FLAT_SHIPPING_FEE = 199;

export function CartDrawer({
  isOpen,
  items,
  products,
  promoCode,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyPromo,
  onRemovePromo,
  onProceedToCheckout,
}: CartDrawerProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ ok: boolean; text: string } | null>(null);

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
      return {
        ...item,
        product,
        variant,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const subtotal = detailedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = promoCode === 'WELCOME10' ? subtotal * 0.1 : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingCost =
    detailedItems.length === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : FLAT_SHIPPING_FEE;
  const total = discountedSubtotal + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
  const shippingProgress = Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promoInput.trim();
    if (!trimmed) return;
    const res = onApplyPromo(trimmed);
    setPromoFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setPromoInput('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#18181B]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md bg-white h-full flex flex-col border-l border-[#E5E2DC] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E2DC]">
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display text-xl font-semibold text-[#18181B]">Your Bag</h2>
            <span className="font-mono-tabular text-xs text-[#52525B]">
              ({detailedItems.reduce((acc, i) => acc + i.quantity, 0)} items)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#52525B] hover:text-[#18181B] hover:bg-[#F3F1ED] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {detailedItems.length > 0 && (
          <div className="px-6 py-3.5 bg-[#FAF9F6] border-b border-[#E5E2DC]">
            <p className="text-xs text-[#18181B] mb-2">
              {amountToFreeShipping === 0 ? (
                <span>Complimentary express shipping unlocked.</span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="font-mono-tabular font-semibold">
                    {formatINR(amountToFreeShipping)}
                  </strong>{' '}
                  more for complimentary shipping.
                </span>
              )}
            </p>
            <div className="h-1.5 w-full bg-[#E5E2DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B4332] transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-[#E5E2DC]">
          {detailedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-full bg-[#F3F1ED] flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5 text-[#52525B]" aria-hidden="true" />
              </div>
              <p className="font-display text-lg font-medium text-[#18181B] mb-1">
                Your bag is empty
              </p>
              <p className="text-sm text-[#52525B] max-w-xs mb-6">
                Explore lighting, stoneware ceramics, and solid walnut workspace objects.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            detailedItems.map(({ product, variant, quantity }) => (
              <div key={`${product.id}-${variant.id}`} className="py-4 first:pt-0 flex gap-4">
                <div className="w-20 h-20 rounded-md bg-[#F3F1ED] border border-[#E5E2DC] overflow-hidden shrink-0">
                  <ResilientImage
                    src={product.image}
                    alt={product.name}
                    fallbackTitle={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#18181B] truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#52525B] mt-0.5">{variant.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id, variant.id)}
                      aria-label={`Remove ${product.name}`}
                      className="p-1.5 text-[#71717A] hover:text-[#18181B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center border border-[#E5E2DC] rounded-md">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, variant.id, -1)}
                        aria-label={`Decrease quantity of ${product.name}`}
                        className="w-8 h-8 flex items-center justify-center text-[#52525B] hover:text-[#18181B] hover:bg-[#F3F1ED] transition-colors"
                      >
                        <Minus className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center font-mono-tabular text-xs font-medium text-[#18181B]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, variant.id, 1)}
                        aria-label={`Increase quantity of ${product.name}`}
                        className="w-8 h-8 flex items-center justify-center text-[#52525B] hover:text-[#18181B] hover:bg-[#F3F1ED] transition-colors"
                      >
                        <Plus className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>

                    <span className="font-mono-tabular text-sm font-medium text-[#18181B]">
                      {formatINR(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals & Checkout */}
        {detailedItems.length > 0 && (
          <div className="p-6 bg-[#FAF9F6] border-t border-[#E5E2DC] space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handlePromoSubmit} className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code (try WELCOME10)"
                  aria-label="Promo code"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#E5E2DC] rounded-md text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:border-[#1B4332]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#18181B] bg-white border border-[#E5E2DC] hover:border-[#18181B] rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  Apply
                </button>
              </div>
              {promoFeedback && (
                <p
                  className={`text-xs ${
                    promoFeedback.ok ? 'text-[#1B4332]' : 'text-red-700'
                  }`}
                >
                  {promoFeedback.text}
                </p>
              )}
              {promoCode && (
                <div className="flex items-center justify-between text-xs text-[#1B4332]">
                  <span>Code {promoCode} applied (10% off)</span>
                  <button
                    type="button"
                    onClick={() => {
                      onRemovePromo();
                      setPromoFeedback(null);
                    }}
                    className="underline hover:text-[#143326]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Price Breakdown */}
            <dl className="space-y-1.5 text-sm pt-2 border-t border-[#E5E2DC]">
              <div className="flex justify-between text-[#52525B]">
                <dt>Subtotal</dt>
                <dd className="font-mono-tabular text-[#18181B]">{formatINR(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#1B4332]">
                  <dt>Discount ({promoCode})</dt>
                  <dd className="font-mono-tabular">-{formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-[#52525B]">
                <dt>Shipping</dt>
                <dd className="font-mono-tabular text-[#18181B]">
                  {shippingCost === 0 ? 'Free' : formatINR(shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between font-semibold text-[#18181B] pt-2 border-t border-[#E5E2DC]">
                <dt>Total</dt>
                <dd className="font-mono-tabular text-base">{formatINR(total)}</dd>
              </div>
            </dl>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4332]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onClearCart}
                className="w-full py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] transition-colors"
              >
                Clear Bag
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
