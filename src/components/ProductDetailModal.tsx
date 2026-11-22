import { useEffect, useState } from 'react';
import { Check, Heart, Minus, Plus, X } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  product: Product | null;
  isSaved: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, variantId: string, quantity: number) => void;
  onToggleSave: (productId: string) => void;
}

export function ProductDetailModal({
  product,
  isSaved,
  onClose,
  onAddToCart,
  onToggleSave,
}: ProductDetailModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants[0]?.id ?? '');
      setQuantity(1);
      setJustAdded(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const handleAdd = () => {
    if (!activeVariant) return;
    onAddToCart(product.id, activeVariant.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#18181B]/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-[#E5E2DC] rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-md bg-white/90 border border-[#E5E2DC] text-[#18181B] hover:bg-[#F3F1ED] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Left Column: Product Image & Technical Specs */}
        <div className="bg-[#F3F1ED] p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-white border border-[#E5E2DC]">
            <ResilientImage
              src={product.image}
              alt={product.name}
              fallbackTitle={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E2DC] text-xs">
            <div>
              <dt className="text-[#52525B] mb-1">Dimensions</dt>
              <dd className="font-medium text-[#18181B]">{product.dimensions}</dd>
            </div>
            <div>
              <dt className="text-[#52525B] mb-1">Origin</dt>
              <dd className="font-medium text-[#18181B]">{product.origin}</dd>
            </div>
            <div>
              <dt className="text-[#52525B] mb-1">Material</dt>
              <dd className="font-medium text-[#18181B]">{product.material}</dd>
            </div>
            <div>
              <dt className="text-[#52525B] mb-1">Catalog Reference</dt>
              <dd className="font-mono-tabular font-medium text-[#18181B]">{product.sku}</dd>
            </div>
          </dl>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="pr-10">
              <div className="flex items-center gap-2 text-xs text-[#52525B] mb-2">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.availability}</span>
              </div>
              <h2
                id="pdp-title"
                className="font-display text-2xl sm:text-3xl font-semibold text-[#18181B] leading-tight"
              >
                {product.name}
              </h2>
              <p className="font-mono-tabular text-xl font-medium text-[#18181B] mt-3">
                {formatINR(product.price)}
              </p>
            </div>

            <p className="text-sm sm:text-[15px] leading-relaxed text-[#52525B]">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-medium text-[#18181B]">Finish</span>
                <span className="text-[#52525B]">{activeVariant?.label}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant) => {
                  const isActive = variant.id === activeVariant?.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
                        isActive
                          ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#18181B]'
                          : 'border-[#E5E2DC] bg-white text-[#52525B] hover:border-[#18181B]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: variant.swatchHex }}
                        aria-hidden="true"
                      />
                      <span>{variant.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div>
              <span className="block text-xs font-medium text-[#18181B] mb-2">Quantity</span>
              <div className="inline-flex items-center border border-[#E5E2DC] rounded-md bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-[#52525B] hover:text-[#18181B] hover:bg-[#F3F1ED] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
                >
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <span className="w-10 text-center font-mono-tabular text-sm font-medium text-[#18181B]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-[#52525B] hover:text-[#18181B] hover:bg-[#F3F1ED] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="pt-5 border-t border-[#E5E2DC] space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4332] whitespace-nowrap"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <span className="font-mono-tabular">
                    Add to Bag — {formatINR(product.price * quantity)}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onToggleSave(product.id)}
                aria-label={isSaved ? 'Remove from saved items' : 'Save item'}
                aria-pressed={isSaved}
                className="h-11 px-4 inline-flex items-center justify-center gap-2 border border-[#E5E2DC] rounded-md text-sm font-medium text-[#18181B] hover:bg-[#F3F1ED] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] whitespace-nowrap shrink-0"
              >
                <Heart
                  className={`w-4 h-4 ${isSaved ? 'fill-[#1B4332] text-[#1B4332]' : 'text-[#52525B]'}`}
                  aria-hidden="true"
                />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
            <p className="text-xs text-[#52525B]">
              Complimentary shipping over ₹3,000 · 30-day home trial included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
