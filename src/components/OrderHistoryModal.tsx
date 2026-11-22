import { useEffect } from 'react';
import { PackageCheck, X } from 'lucide-react';
import { OrderRecord } from '../types';
import { formatINR } from '../utils/currency';

interface OrderHistoryModalProps {
  isOpen: boolean;
  orders: OrderRecord[];
  onClose: () => void;
}

export function OrderHistoryModal({ isOpen, orders, onClose }: OrderHistoryModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#18181B]/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orders-heading"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white border border-[#E5E2DC] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E2DC] bg-[#FAF9F6]">
          <h2 id="orders-heading" className="font-display text-xl font-semibold text-[#18181B]">
            Order History
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order history"
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#52525B] hover:text-[#18181B] hover:bg-[#F3F1ED] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <PackageCheck className="w-8 h-8 mx-auto text-[#71717A] stroke-[1.5]" aria-hidden="true" />
              <p className="font-display text-lg font-medium text-[#18181B]">No orders placed yet</p>
              <p className="text-sm text-[#52525B]">
                Completed orders from your shopping bag will appear here for tracking.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderNumber}
                className="p-5 bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg space-y-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E5E2DC]">
                  <div>
                    <span className="font-mono-tabular text-sm font-semibold text-[#18181B]">
                      Order #{order.orderNumber}
                    </span>
                    <span className="mx-2 text-[#A1A1AA]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-xs text-[#52525B]">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#1B4332]">{order.status}</span>
                </div>

                <ul className="space-y-1.5 text-sm">
                  {order.items.map((item) => (
                    <li
                      key={`${order.orderNumber}-${item.productId}-${item.variantLabel}`}
                      className="flex justify-between gap-4 text-[#18181B]"
                    >
                      <span className="truncate">
                        {item.quantity} × {item.name}{' '}
                        <span className="text-xs text-[#52525B]">({item.variantLabel})</span>
                      </span>
                      <span className="font-mono-tabular text-xs font-medium shrink-0">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E2DC] text-xs text-[#52525B]">
                  <span>
                    Ship to {order.shipping.city}, {order.shipping.postalCode} ·{' '}
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                  </span>
                  <span className="font-mono-tabular text-sm font-semibold text-[#18181B]">
                    Total {formatINR(order.total)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
