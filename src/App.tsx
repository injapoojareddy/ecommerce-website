import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Heart, Search, ShoppingBag, X } from 'lucide-react';
import { HERO_IMAGE, PRODUCTS } from './data/products';
import { CartItem, OrderRecord, Product, ProductCategory } from './types';
import { ResilientImage } from './components/ResilientImage';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';

type CategoryFilter = 'All' | ProductCategory;
type SortOption = 'featured' | 'price-asc' | 'price-desc';

const CATEGORIES: CategoryFilter[] = ['All', 'Lighting', 'Ceramics', 'Workspace', 'Textiles'];

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [showPromoBar, setShowPromoBar] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [savedOnly, setSavedOnly] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => loadStoredJson('kanso_cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => loadStoredJson('kanso_wishlist', []));
  const [orders, setOrders] = useState<OrderRecord[]>(() => loadStoredJson('kanso_orders', []));
  const [promoCode, setPromoCode] = useState<string | null>(() =>
    loadStoredJson<string | null>('kanso_promo', null)
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('kanso_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem('kanso_wishlist', JSON.stringify(wishlist));
    } catch {
      // Ignore storage quota issues
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      window.localStorage.setItem('kanso_orders', JSON.stringify(orders));
    } catch {
      // Ignore storage quota issues
    }
  }, [orders]);

  useEffect(() => {
    try {
      window.localStorage.setItem('kanso_promo', JSON.stringify(promoCode));
    } catch {
      // Ignore storage quota issues
    }
  }, [promoCode]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const totalBagCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((product) => {
      if (activeCategory !== 'All' && product.category !== activeCategory) return false;
      if (savedOnly && !wishlist.includes(product.id)) return false;
      if (query) {
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesMaterial = product.material.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesMaterial && !matchesCategory) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [activeCategory, savedOnly, searchQuery, sortBy, wishlist]);

  const handleAddToCart = (productId: string, variantId: string, quantity = 1) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId && item.variantId === variantId
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.min(20, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { productId, variantId, quantity }];
    });

    setToastMessage(`Added ${product.name} to bag`);
  };

  const handleQuickAdd = (product: Product) => {
    const defaultVariant = product.variants[0]?.id;
    if (!defaultVariant) return;
    handleAddToCart(product.id, defaultVariant, 1);
  };

  const handleUpdateQuantity = (productId: string, variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const handleToggleSave = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      const product = PRODUCTS.find((p) => p.id === productId);
      if (product) {
        setToastMessage(exists ? `Removed ${product.name} from saved` : `Saved ${product.name}`);
      }
      return next;
    });
  };

  const handleApplyPromo = (rawCode: string): { ok: boolean; message: string } => {
    const normalized = rawCode.trim().toUpperCase();
    if (normalized === 'WELCOME10') {
      setPromoCode('WELCOME10');
      return { ok: true, message: 'WELCOME10 applied — 10% off your order.' };
    }
    return { ok: false, message: 'Code not recognized. Try WELCOME10.' };
  };

  const handlePlaceOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setPromoCode(null);
  };

  const navigateToCategory = (category: CategoryFilter) => {
    setActiveCategory(category);
    setSavedOnly(false);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetCatalogFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSortBy('featured');
    setSavedOnly(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B]">
      {/* Slim Dismissible Promo Banner (non-sticky so mobile sticky height stays minimal) */}
      {showPromoBar && (
        <div className="bg-[#1B4332] text-white px-4 py-2 text-xs flex items-center justify-center relative">
          <p className="text-center pr-8 truncate">
            Free shipping on orders over ₹3,000 · Use code{' '}
            <span className="font-mono-tabular font-medium underline underline-offset-2">
              WELCOME10
            </span>{' '}
            for 10% off
          </p>
          <button
            type="button"
            onClick={() => setShowPromoBar(false)}
            aria-label="Dismiss announcement"
            className="absolute right-3 p-1 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Top Bar Contract: [Brand title, 1 line] — [4–5 nav links] — [1 primary action] */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E5E2DC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <a
            href="#top"
            className="font-display text-xl font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] rounded"
          >
            Kanso Goods
          </a>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52525B]"
          >
            <button
              type="button"
              onClick={() => navigateToCategory('All')}
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Shop All
            </button>
            <button
              type="button"
              onClick={() => navigateToCategory('Lighting')}
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Lighting
            </button>
            <button
              type="button"
              onClick={() => navigateToCategory('Ceramics')}
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ceramics
            </button>
            <a
              href="#craft"
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Craft
            </a>
            <button
              type="button"
              onClick={() => setIsOrdersOpen(true)}
              className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Orders{orders.length > 0 ? ` (${orders.length})` : ''}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping bag with ${totalBagCount} items`}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4332]"
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-mono-tabular">Bag ({totalBagCount})</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Section 1: Storefront Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-medium text-[#52525B] tracking-wide">
                  Autumn Studio Release · Direct from Maker
                </p>
                <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-semibold text-[#18181B] leading-[1.08] tracking-tight text-balance">
                  Objects built for quiet daily rituals.
                </h1>
                <p className="text-[15px] sm:text-base text-[#52525B] leading-relaxed max-w-md">
                  Architectural task lighting, wheel-thrown stoneware, and solid American walnut
                  deskware designed to age gracefully with everyday use.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4332]"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsOrdersOpen(true)}
                  className="px-4 py-3 text-sm font-medium text-[#18181B] hover:text-[#1B4332] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                >
                  Track Orders
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="h-full min-h-[260px] sm:min-h-[360px] aspect-[16/9] lg:aspect-auto rounded-xl overflow-hidden bg-[#F3F1ED] border border-[#E5E2DC]">
                <ResilientImage
                  src={HERO_IMAGE}
                  alt="Minimalist architectural study desk featuring matte charcoal lamp, ceramic carafe, and solid walnut organizer tray"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Product Catalog & Filter Controls */}
        <section
          id="catalog"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-[#E5E2DC]"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#18181B]">
                Curated Catalog
              </h2>
              <p className="text-sm text-[#52525B] mt-1">
                Showing {filteredProducts.length} of {PRODUCTS.length} studio objects
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[210px]">
                <Search
                  className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products or materials..."
                  aria-label="Search products"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md text-[#18181B] placeholder:text-[#71717A] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <label htmlFor="catalog-sort" className="sr-only">
                Sort products
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md text-[#18181B] focus:outline-none focus:border-[#1B4332]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Tabs + Saved Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div
              role="tablist"
              aria-label="Filter by category"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3F1ED] border border-[#E5E2DC] rounded-lg"
            >
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category && !savedOnly;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveCategory(category);
                      setSavedOnly(false);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
                      isActive
                        ? 'bg-white text-[#18181B] shadow-sm'
                        : 'text-[#52525B] hover:text-[#18181B]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSavedOnly((prev) => !prev)}
              aria-pressed={savedOnly}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
                savedOnly
                  ? 'border-[#1B4332] bg-[#1B4332]/10 text-[#18181B]'
                  : 'border-[#E5E2DC] bg-white text-[#52525B] hover:text-[#18181B]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  savedOnly ? 'fill-[#1B4332] text-[#1B4332]' : 'text-[#52525B]'
                }`}
                aria-hidden="true"
              />
              <span className="font-mono-tabular">Saved ({wishlist.length})</span>
            </button>
          </div>

          {/* 3-Column Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white border border-[#E5E2DC] rounded-lg space-y-3">
              <p className="font-display text-xl font-medium text-[#18181B]">
                No matching items found
              </p>
              <p className="text-sm text-[#52525B]">
                {savedOnly
                  ? 'Save items with the heart icon to build your shortlist.'
                  : 'Try adjusting your search keywords or category filter.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetCatalogFilters}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSaved={wishlist.includes(product.id)}
                  onToggleSave={handleToggleSave}
                  onSelectProduct={setSelectedProduct}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Craftsmanship & Store Standards */}
        <section
          id="craft"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 border-t border-[#E5E2DC]"
        >
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#18181B] text-balance">
              Honest materials, direct studio provenance.
            </h2>
            <p className="text-sm sm:text-[15px] text-[#52525B] mt-2 leading-relaxed">
              Every piece is produced in small batches with traceable timber, mineral glazes, and
              serviceable hardware meant to last for decades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#E5E2DC] rounded-lg space-y-2">
              <p className="font-mono-tabular text-xs text-[#52525B]">01. Materials</p>
              <h3 className="text-base font-semibold text-[#18181B]">Natural &amp; Uncoated</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Solid American walnut finished in food-safe tung oil, iron-rich Mashiko clay, and
                unbleached Belgian flax.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E5E2DC] rounded-lg space-y-2">
              <p className="font-mono-tabular text-xs text-[#52525B]">02. Shipping</p>
              <h3 className="text-base font-semibold text-[#18181B]">Complimentary Over ₹3,000</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Plastic-free molded pulp packaging dispatched within 48 hours, with Cash on Delivery
                and card checkout options.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E5E2DC] rounded-lg space-y-2">
              <p className="font-mono-tabular text-xs text-[#52525B]">03. Guarantee</p>
              <h3 className="text-base font-semibold text-[#18181B]">30-Day Home Trial</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Live with your pieces at home for 30 days. Unused or gently tested items qualify for
                prepaid return shipping.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Section 4: Footer */}
      <footer className="border-t border-[#E5E2DC] bg-[#F3F1ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="font-display text-lg font-semibold text-[#18181B]">Kanso Goods</span>
            <p className="text-xs text-[#52525B] mt-1">
              Curated Home Objects &amp; Everyday Deskware · Portland Studio
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#52525B]">
            <a href="#catalog" className="hover:text-[#18181B] transition-colors">
              Catalog
            </a>
            <a href="#craft" className="hover:text-[#18181B] transition-colors">
              Materials
            </a>
            <button
              type="button"
              onClick={() => setIsOrdersOpen(true)}
              className="hover:text-[#18181B] transition-colors"
            >
              Order History
            </button>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hover:text-[#18181B] transition-colors"
            >
              Shopping Bag ({totalBagCount})
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        isSaved={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleSave={handleToggleSave}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        products={PRODUCTS}
        promoCode={promoCode}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => {
          setCart([]);
          setPromoCode(null);
        }}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={() => setPromoCode(null)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        products={PRODUCTS}
        promoCode={promoCode}
        onClose={() => setIsCheckoutOpen(false)}
        onPlaceOrder={handlePlaceOrder}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        orders={orders}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-4 px-4 py-3 bg-[#18181B] text-white text-xs font-medium rounded-lg shadow-lg"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setIsCartOpen(true);
            }}
            className="underline underline-offset-2 text-white/90 hover:text-white whitespace-nowrap shrink-0"
          >
            View Bag
          </button>
        </div>
      )}
    </div>
  );
}
