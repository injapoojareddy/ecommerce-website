import { Heart, Plus } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/currency';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({
  product,
  isSaved,
  onToggleSave,
  onSelectProduct,
  onQuickAdd,
}: ProductCardProps) {
  return (
    <article className="group flex flex-col bg-white border border-[#E5E2DC] rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(24,24,27,0.12)]">
      {/* Image Stage: 4:3 uniform aspect ratio */}
      <div className="relative aspect-[4/3] w-full bg-[#F3F1ED] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="block w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B4332]"
          aria-label={`View details for ${product.name}`}
        >
          <ResilientImage
            src={product.image}
            alt={product.name}
            fallbackTitle={product.name}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </button>

        {/* Save / Wishlist Action */}
        <button
          type="button"
          onClick={() => onToggleSave(product.id)}
          aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
          aria-pressed={isSaved}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-md bg-white/90 backdrop-blur-sm border border-[#E5E2DC] text-[#18181B] transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-[#1B4332] text-[#1B4332]' : 'text-[#52525B]'
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Subtle Quick Add CTA on bottom-right */}
        <button
          type="button"
          onClick={() => onQuickAdd(product)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#18181B]/90 backdrop-blur-sm rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity duration-150 hover:bg-[#1B4332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Quick Add</span>
        </button>
      </div>

      {/* Card Body: consistent field order across all cards */}
      <div className="flex flex-col flex-1 justify-between p-5 gap-3">
        <div>
          {/* Clean unboxed metadata with middle dot separator */}
          <div className="flex items-center gap-2 text-xs text-[#52525B] mb-1.5">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.material}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="text-left focus-visible:outline-none focus-visible:underline"
          >
            <h3 className="text-base font-semibold text-[#18181B] leading-snug group-hover:text-[#1B4332] transition-colors">
              {product.name}
            </h3>
          </button>
        </div>

        <div className="flex items-baseline justify-between pt-3 border-t border-[#E5E2DC]/70">
          <span className="font-mono-tabular text-[15px] font-medium text-[#18181B]">
            {formatINR(product.price)}
          </span>
          <span className="text-xs text-[#52525B] whitespace-nowrap shrink-0">
            {product.availability}
          </span>
        </div>
      </div>
    </article>
  );
}
