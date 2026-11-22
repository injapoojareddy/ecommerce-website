import { Product } from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_home_objects_1795186179850.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'cantilever-desk-lamp',
    sku: 'KG-LMP-01',
    name: 'Cantilever Architectural Desk Lamp',
    category: 'Lighting',
    material: 'Anodized Aluminum',
    price: 4990,
    availability: 'In Stock',
    featured: true,
    image: '/src/assets/images/product_desk_lamp_1795186179598.jpg',
    description:
      'Dual-articulated task lamp machined from bead-blasted aluminum with friction-locked steel joints and warm 3000K high-CRI LED illumination.',
    dimensions: '48 × 14 × 46 cm · 2.4 kg',
    origin: 'Designed in Copenhagen',
    variants: [
      { id: 'obsidian', label: 'Matte Obsidian', swatchHex: '#1F1F23' },
      { id: 'brushed-steel', label: 'Brushed Steel', swatchHex: '#A1A1AA' },
    ],
  },
  {
    id: 'stoneware-pourover-set',
    sku: 'KG-CER-02',
    name: 'Charcoal Stoneware Pour-Over Set',
    category: 'Ceramics',
    material: 'Kiln-Fired Stoneware',
    price: 2450,
    availability: 'In Stock',
    featured: true,
    image: '/src/assets/images/product_pourover_set_1795186179440.jpg',
    description:
      'Hand-thrown V-cone dripper and 600 ml server carafe crafted from iron-rich black clay. Interior spiral ribs regulate extraction pace for clean, balanced brews.',
    dimensions: '13 × 13 × 21 cm · 600 ml capacity',
    origin: 'Wheel-thrown in Mashiko',
    variants: [
      { id: 'matte-charcoal', label: 'Matte Charcoal', swatchHex: '#27272A' },
      { id: 'raw-sand', label: 'Raw Sand', swatchHex: '#D6D0C4' },
    ],
  },
  {
    id: 'walnut-valet-tray',
    sku: 'KG-WRK-03',
    name: 'Milled Solid Walnut Valet Tray',
    category: 'Workspace',
    material: 'American Black Walnut',
    price: 1890,
    availability: 'In Stock',
    featured: true,
    image: '/src/assets/images/product_walnut_tray_1795186179608.jpg',
    description:
      'CNC-milled from a single slab of kiln-dried walnut and hand-rubbed with plant-based tung oil. Dedicated channel keeps everyday pens and keys organized.',
    dimensions: '24 × 18 × 2.4 cm',
    origin: 'Crafted in Oregon',
    variants: [
      { id: 'oiled-walnut', label: 'Natural Oiled Walnut', swatchHex: '#5C4033' },
      { id: 'smoked-oak', label: 'Smoked Oak', swatchHex: '#3F342D' },
    ],
  },
  {
    id: 'belgian-linen-throw',
    sku: 'KG-TXT-04',
    name: 'Heavyweight Belgian Linen Throw',
    category: 'Textiles',
    material: '100% Flax Linen',
    price: 3490,
    availability: 'Limited Run',
    featured: true,
    image: '/src/assets/images/product_linen_throw_1795186180638.jpg',
    description:
      'Woven from long-staple European flax and stone-washed for breathable drape and textured loft. Finished with subtle selvedge edges.',
    dimensions: '140 × 200 cm · 420 gsm',
    origin: 'Woven in Flanders',
    variants: [
      { id: 'warm-slate', label: 'Warm Slate', swatchHex: '#7A7772' },
      { id: 'undyed-oat', label: 'Undyed Oat', swatchHex: '#DDD6C7' },
    ],
  },
  {
    id: 'speckled-stoneware-mugs',
    sku: 'KG-CER-05',
    name: 'Speckled Clay Mug Pair',
    category: 'Ceramics',
    material: 'Speckled Stoneware',
    price: 1290,
    availability: 'In Stock',
    featured: false,
    image: '/src/assets/images/product_stoneware_mugs_1795186180589.jpg',
    description:
      'Set of two everyday coffee mugs dipped in satin bone glaze over an exposed raw clay foot. Thick walls retain warmth without scorching hands.',
    dimensions: '8.5 × 9.5 cm · 310 ml each',
    origin: 'Small-batch studio kiln',
    variants: [
      { id: 'bone-speckle', label: 'Bone Speckle', swatchHex: '#E8E3D9' },
      { id: 'ash-grey', label: 'Ash Grey', swatchHex: '#9CA3AF' },
    ],
  },
  {
    id: 'saddle-leather-folio',
    sku: 'KG-WRK-06',
    name: 'Vegetable-Tanned A5 Notebook Folio',
    category: 'Workspace',
    material: 'Full-Grain Bridle Leather',
    price: 2790,
    availability: 'Limited Run',
    featured: false,
    image: '/src/assets/images/product_leather_folio_1795186180549.jpg',
    description:
      'Cut from full-grain vegetable-tanned hide that develops a deep patina with daily use. Includes a replaceable 192-page fountain-pen friendly A5 notebook.',
    dimensions: '22.5 × 16.5 × 2.2 cm',
    origin: 'Saddle-stitched in Florence',
    variants: [
      { id: 'espresso', label: 'Deep Espresso', swatchHex: '#3B2820' },
      { id: 'cognac', label: 'Natural Cognac', swatchHex: '#8B5A2B' },
    ],
  },
];
