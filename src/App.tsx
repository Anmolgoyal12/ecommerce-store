import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

type Currency = 'INR' | 'USD';
type ThemeMode = 'cyberpunk' | 'matrix' | 'synthwave' | 'studio';

const USD_RATE = 85;

const THEMES: { id: ThemeMode; label: string; icon: string; color: string }[] = [
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '⚡', color: '#00f0ff' },
  { id: 'matrix', label: 'Matrix OLED', icon: '🟢', color: '#10b981' },
  { id: 'synthwave', label: 'Synthwave', icon: '🌆', color: '#ff2a85' },
  { id: 'studio', label: 'Studio Light', icon: '☀️', color: '#2563eb' }
];

const formatPrice = (amountINR: number, currency: Currency) => {
  if (currency === 'USD') {
    const usd = Math.round(amountINR / USD_RATE);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(usd);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountINR);
};

type Review = {
  author: string;
  rating: number;
  comment: string;
  date: string;
};

type Product = {
  id: number;
  name: string;
  brand: string;
  category: 'Audio' | 'Wearables' | 'VR & Gaming' | 'Displays' | 'Computing';
  price: number;
  originalPrice: number;
  discount: string;
  image: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  description: string;
  specs: Record<string, string>;
  reviews: Review[];
};

type CartItem = Product & {
  quantity: number;
};

type Order = {
  id: string;
  date: string;
  items: CartItem[];
  totalINR: number;
  status: string;
  courier: string;
  trackingStep: number;
};

type SupportTicket = {
  id: string;
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  date: string;
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Quantum X1 Wireless Headphones',
    brand: 'NEXUS',
    category: 'Audio',
    price: 24999,
    originalPrice: 29999,
    discount: '16% off',
    image: '/headphones.jpg',
    badge: 'FLAGSHIP',
    rating: 4.9,
    reviewsCount: 384,
    description: 'Flagship studio-grade wireless over-ear headphones featuring neural adaptive noise cancellation, 45mm graphene drivers, and ultra-low latency spatial audio.',
    specs: {
      'Acoustic Driver': '45mm Custom Graphene',
      'Active Noise Cancellation': 'Hybrid Adaptive ANC (-45dB)',
      'Battery Life': '65 Hours (ANC Off) / 45 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.4, LDAC, USB-C Lossless',
      'Microphones': '6 AI Beamforming Mics for voice isolation'
    },
    reviews: [
      { author: 'Rahul S.', rating: 5, comment: 'Mind-blowing spatial audio separation. The ANC blocks out traffic completely.', date: '2 days ago' },
      { author: 'Vikram M.', rating: 5, comment: 'Battery lasts more than a week of full workdays. Premium build quality.', date: '1 week ago' }
    ]
  },
  {
    id: 2,
    name: 'Titanium Smartwatch Pro Max',
    brand: 'NEXUS',
    category: 'Wearables',
    price: 39999,
    originalPrice: 49999,
    discount: '20% off',
    image: '/smartwatch.jpg',
    badge: 'BESTSELLER',
    rating: 4.8,
    reviewsCount: 512,
    description: 'Forged from aerospace-grade titanium with an ultra-bright sapphire AMOLED display. Features real-time AI biometrics, medical ECG, and multi-band dual GPS.',
    specs: {
      'Chassis': 'Aerospace Grade 5 Titanium',
      'Display': '1.96" LTPO AMOLED, 2200 Nits Peak',
      'Water Resistance': '10 ATM (100 meters dive proof)',
      'Sensors': 'Optical Heart, Medical ECG, SpO2, Skin Temp',
      'Battery': 'Up to 14 Days Normal / 48h Dual-GPS'
    },
    reviews: [
      { author: 'Priya K.', rating: 5, comment: 'Sleek cyberpunk aesthetic on the wrist. GPS tracking is pinpoint accurate on trails.', date: '3 days ago' },
      { author: 'Aditya P.', rating: 4.8, comment: 'Titanium casing feels bulletproof. Easily the best smartwatch on the market.', date: '5 days ago' }
    ]
  },
  {
    id: 3,
    name: 'Nexus Neural Glass AR Pro',
    brand: 'NEXUS',
    category: 'Wearables',
    price: 59999,
    originalPrice: 69999,
    discount: '14% off',
    image: '/ar_glasses.jpg',
    badge: 'AI OPTICS',
    rating: 4.9,
    reviewsCount: 420,
    description: 'Lightweight titanium augmented reality frames with dual Micro-LED waveguide displays, on-device Claude computer vision, and directional bone-conduction acoustics.',
    specs: {
      'Optics': 'Dual Micro-LED Waveguide (1080p per eye, 3000 Nits)',
      'Vision AI': 'On-device Claude Computer Vision Coprocessor',
      'Weight': '48g Featherlight Aerospace Titanium',
      'Battery': '18 Hours Active AR / Magnetic Quick-Snap Charger',
      'Acoustics': 'Stereo Bone Conduction + Dual Beamforming Mics'
    },
    reviews: [
      { author: 'Rohan D.', rating: 5, comment: 'The HUD visual overlay is crystal clear even in direct sunlight. Feels like Tony Stark gear.', date: '1 day ago' },
      { author: 'Ananya M.', rating: 5, comment: 'Claude vision instantly identifies components and reads code in front of my eyes.', date: '3 days ago' }
    ]
  },
  {
    id: 4,
    name: 'CyberDeck Terminal X7',
    brand: 'CYBERCORP',
    category: 'Computing',
    price: 89999,
    originalPrice: 99999,
    discount: '10% off',
    image: '/cyberdeck.jpg',
    badge: 'DEV SPECIAL',
    rating: 4.9,
    reviewsCount: 215,
    description: 'Ruggedized modular handheld developer terminal with mechanical ortholinear keyboard, 7" sunlight-readable display, hardware SDR radio, and dual NVMe slots.',
    specs: {
      'CPU': 'Octa-Core RISC-V + AI NPU (32 TOPS)',
      'Memory': '32GB LPDDR5X + 2TB PCIe 4.0 NVMe SSD',
      'Keyboard': 'Ortholinear Hot-Swappable Mechanical (Kailh Choc)',
      'Chassis': 'CNC Milled Aluminum 6061 with Cyber-Armor',
      'Battery': '16,000mAh Hot-Swappable Dual Cell (12h Run Time)'
    },
    reviews: [
      { author: 'Sameer V.', rating: 5, comment: 'The ultimate field terminal for debugging edge models and running terminals anywhere.', date: '4 days ago' },
      { author: 'Kunal P.', rating: 4.9, comment: 'Mechanical switches on a portable terminal is an absolute dream to type on.', date: '1 week ago' }
    ]
  },
  {
    id: 5,
    name: 'Synapse AI Neural Accelerator Hub',
    brand: 'NEXUS',
    category: 'Computing',
    price: 145000,
    originalPrice: 175000,
    discount: '17% off',
    image: '/ai_hub.jpg',
    badge: 'ENTERPRISE',
    rating: 5.0,
    reviewsCount: 64,
    description: 'Compact desktop neural computing server capable of running 70B parameter LLMs locally at 45 tokens/sec. Liquid cooled with whisper-quiet 18dB acoustics.',
    specs: {
      'Neural Compute': '128 TOPS Matrix Tensor Accelerator',
      'VRAM': '64GB Unified High-Bandwidth VRAM (800 GB/s)',
      'Thermal System': 'Closed-Loop Vapor Matrix Cooling (< 18dB)',
      'Connectivity': 'Dual 10GbE + Dual Thunderbolt 5 Ports',
      'Power Efficiency': '220W Peak (3x more efficient than GPUs)'
    },
    reviews: [
      { author: 'Dr. Aris Thorne', rating: 5, comment: 'Running local Claude checkpoints and code models directly on my desk with zero cloud latency.', date: '5 days ago' }
    ]
  },
  {
    id: 6,
    name: 'HoloLens VR Headset v2',
    brand: 'VIRTUAL',
    category: 'VR & Gaming',
    price: 74999,
    originalPrice: 89999,
    discount: '16% off',
    image: '/headphones.jpg',
    badge: 'NEW GEN',
    rating: 4.7,
    reviewsCount: 128,
    description: 'Next-generation spatial computing headset featuring dual 4K Micro-OLED panels, sub-millimeter hand tracking, and 12ms ultra-low latency color passthrough.',
    specs: {
      'Display Panels': 'Dual 4K Micro-OLED (4096 x 2160 per eye)',
      'Refresh Rate': '120Hz Smooth Motion',
      'Tracking': '6-DoF Optical + Neural Hand Gesture Recognition',
      'Field of View': '115° Ultra-Wide Immersive FOV',
      'Audio': 'Integrated 3D Spatial Sound Array'
    },
    reviews: [
      { author: 'Karan T.', rating: 5, comment: 'Passthrough fidelity feels like you are actually looking through clear glass. Stunning.', date: '4 days ago' }
    ]
  },
  {
    id: 7,
    name: 'CyberFit Fitness Tracker',
    brand: 'NEXUS',
    category: 'Wearables',
    price: 9999,
    originalPrice: 14999,
    discount: '33% off',
    image: '/smartwatch.jpg',
    badge: 'HOT DEAL',
    rating: 4.6,
    reviewsCount: 890,
    description: 'Featherlight 18-gram smart health band with continuous heart rate monitoring, sleep staging algorithms, and 3-week battery life on a single charge.',
    specs: {
      'Weight': '18g Featherweight',
      'Battery Life': '21 Days continuous use',
      'Waterproof': '5 ATM (50m swimproof)',
      'Fitness Modes': '30+ Dedicated Sports & Workout Profiles'
    },
    reviews: [
      { author: 'Meera N.', rating: 5, comment: 'You forget you are wearing it. Sleep tracking insights are remarkably detailed.', date: '6 days ago' }
    ]
  },
  {
    id: 8,
    name: 'SonicBoom Noise Cancelling Earbuds',
    brand: 'AUDIOX',
    category: 'Audio',
    price: 12999,
    originalPrice: 18999,
    discount: '31% off',
    image: '/headphones.jpg',
    badge: 'POPULAR',
    rating: 4.8,
    reviewsCount: 432,
    description: 'Pocket-sized true wireless earbuds with deep 48dB active noise cancellation, aptX Lossless audio codec, and wireless charging case.',
    specs: {
      'ANC Depth': '-48dB Ultra-Silence Active Noise Control',
      'Battery': '8 Hours Buds / 40 Hours Total with Qi Case',
      'Gaming Latency': '35ms Ultra-Low Latency Mode',
      'Water Resistance': 'IPX7 Sweat & Rain Proof'
    },
    reviews: [
      { author: 'Devendra B.', rating: 5, comment: 'Bass is tight and deep without distorting mids. Very comfortable for long calls.', date: '1 week ago' }
    ]
  },
  {
    id: 9,
    name: 'Aero Watch Active',
    brand: 'VIRTUAL',
    category: 'Wearables',
    price: 19999,
    originalPrice: 24999,
    discount: '20% off',
    image: '/smartwatch.jpg',
    badge: 'TRENDING',
    rating: 4.5,
    reviewsCount: 210,
    description: 'Sport-optimized smartwatch featuring curved Corning Gorilla Glass, fluoroelastomer breathable sports band, and built-in AI workout voice coach.',
    specs: {
      'Display': '1.75" Curved Super AMOLED',
      'Weight': '32g Lightweight Aluminum',
      'Battery Life': '7 Days with Heavy Tracking',
      'Connectivity': 'Bluetooth 5.3, NFC Tap-to-Pay'
    },
    reviews: [
      { author: 'Sneha G.', rating: 4.5, comment: 'Ideal for runners. Heart rate zones alerts keep workouts right in tempo.', date: '2 weeks ago' }
    ]
  },
  {
    id: 10,
    name: 'Smart TV 4K OLED 65"',
    brand: 'VISION',
    category: 'Displays',
    price: 120000,
    originalPrice: 150000,
    discount: '20% off',
    image: '/smartwatch.jpg',
    badge: 'PREMIUM',
    rating: 4.9,
    reviewsCount: 95,
    description: 'Infinite contrast Quantum-Dot OLED panel powered by Neural AI 4K scaling, 144Hz variable refresh rate for gaming, and Dolby Atmos 60W front speakers.',
    specs: {
      'Display': '65" QD-OLED (3840 x 2160)',
      'Refresh Rate': '144Hz VRR / FreeSync Premium Pro',
      'Audio': '60W 4.2 Channel Dolby Atmos',
      'Processor': 'Cognitive Neural Processor 4K'
    },
    reviews: [
      { author: 'Amit C.', rating: 5, comment: 'Blacks are true inky black. Playing games at 144Hz on a 65 inch OLED is unmatched.', date: '3 weeks ago' }
    ]
  },
  {
    id: 11,
    name: 'NextGen Gaming Console',
    brand: 'PLAYTECH',
    category: 'VR & Gaming',
    price: 49999,
    originalPrice: 54999,
    discount: '9% off',
    image: '/headphones.jpg',
    badge: 'HARD TO FIND',
    rating: 4.9,
    reviewsCount: 780,
    description: 'Ultimate living room powerhouse delivering native 4K 120FPS gaming, ray-tracing hardware acceleration, and blazing-fast 2TB NVMe PCIe Gen 4 storage.',
    specs: {
      'Compute Power': '14.2 TFLOPs Custom RDNA 3 GPU',
      'Storage': '2TB High-Speed NVMe SSD (7GB/s)',
      'Video Output': 'HDMI 2.1 Native 4K 120Hz / 8K HDR',
      'Controller': 'Haptic Dual-Actuator with Adaptive Resistance'
    },
    reviews: [
      { author: 'Tanmay V.', rating: 5, comment: 'Loads massive games in 3 seconds flat. Quiet cooling even after 6 hour sessions.', date: '1 month ago' }
    ]
  }
];

function Home({ 
  products, 
  addToCart, 
  searchQuery, 
  currency, 
  onQuickView,
  onOpenAi
}: { 
  products: Product[], 
  addToCart: (p: Product) => void, 
  searchQuery: string, 
  currency: Currency,
  onQuickView: (p: Product) => void,
  onOpenAi: () => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [wishlist, setWishlist] = useState<number[]>(() => {
    const saved = localStorage.getItem('nexus_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('nexus_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const categories = [
    { label: 'All', icon: '⚡', count: products.length },
    { label: 'Wearables', icon: '🕶️', count: products.filter(p => p.category === 'Wearables').length },
    { label: 'Computing', icon: '💻', count: products.filter(p => p.category === 'Computing').length },
    { label: 'Audio', icon: '🎧', count: products.filter(p => p.category === 'Audio').length },
    { label: 'VR & Gaming', icon: '🥽', count: products.filter(p => p.category === 'VR & Gaming').length },
    { label: 'Displays', icon: '📺', count: products.filter(p => p.category === 'Displays').length }
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesName = p.name.toLowerCase().includes(query);
    const matchesBrand = p.brand.toLowerCase().includes(query);
    const matchesDesc = p.description.toLowerCase().includes(query);
    const matchesCat = p.category.toLowerCase().includes(query);
    
    const budgetMatch = query.match(/under\s*(\d+)/i);
    const matchesBudget = budgetMatch ? p.price <= parseInt(budgetMatch[1], 10) : true;

    return matchesCategory && (matchesName || matchesBrand || matchesDesc || matchesCat) && matchesBudget;
  });

  return (
    <main className="main-content">
      <div className="container">
        
        {/* Futuristic Hero Section */}
        <section className="hero-banner glass">
          <div className="hero-tag">
            <span>✨</span> NEXUS QUANTUM OS v2.4 • ON-DEVICE CLAUDE AI
          </div>
          <h1 className="hero-title">
            The Next Evolution of <span className="text-gradient">Intelligent Hardware</span>
          </h1>
          <p className="hero-desc">
            Engineered for developers, founders, and tech pioneers. Discover ultra-responsive neural computing, 
            spatial sensory AR gear, and on-device AI accelerators backed by 2-year express hardware replacement.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href="#catalog" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem' }}>
              ⚡ Explore Catalog
            </a>
            <button 
              className="btn" 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.85rem 1.8rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}
              onClick={onOpenAi}
            >
              🤖 Ask Claude Concierge
            </button>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-box">
              <span className="hero-stat-value">&lt; 10ms</span>
              <span className="hero-stat-label">Inference Latency</span>
            </div>
            <div className="hero-stat-box">
              <span className="hero-stat-value">2 Years</span>
              <span className="hero-stat-label">Nexus Shield Warranty</span>
            </div>
            <div className="hero-stat-box">
              <span className="hero-stat-value">Same-Day</span>
              <span className="hero-stat-label">Express Air Dispatch</span>
            </div>
            <div className="hero-stat-box">
              <span className="hero-stat-value">256-Bit</span>
              <span className="hero-stat-label">Zero-Trust Encrypted</span>
            </div>
          </div>
        </section>

        {/* Category Pills Bar */}
        <div id="catalog" className="category-filter-bar">
          {categories.map(cat => (
            <button
              key={cat.label}
              className={`category-pill ${selectedCategory === cat.label ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.label)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const isSaved = wishlist.includes(product.id);
            return (
              <div key={product.id} className="product-card glass">
                {product.badge && <span className="product-card-badge">{product.badge}</span>}
                
                {/* Wishlist Button */}
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 2,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isSaved ? 'var(--danger)' : 'var(--text-secondary)',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  {isSaved ? '♥' : '♡'}
                </button>

                <div className="product-img-wrapper">
                  <img src={product.image} alt={product.name} className="product-img" />
                  <button 
                    className="quick-view-overlay-btn"
                    onClick={() => onQuickView(product)}
                  >
                    👁️ Quick Specs
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <h3 
                    className="product-name" 
                    title={product.name} 
                    onClick={() => onQuickView(product)} 
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="product-rating-row">
                    <span>★ {product.rating}</span>
                    <span className="product-rating-count">({product.reviewsCount} reviews)</span>
                  </div>

                  <div className="stock-indicator">
                    <span className="stock-dot"></span>
                    <span>In Stock • Ready to Ship</span>
                  </div>

                  <div className="product-price-row">
                    <span className="product-price">{formatPrice(product.price, currency)}</span>
                    <span className="product-original-price">{formatPrice(product.originalPrice, currency)}</span>
                    <span className="discount-tag">{product.discount}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1 }}
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="btn" 
                      style={{ 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)', 
                        padding: '0.6rem 0.9rem',
                        color: 'var(--text-primary)'
                      }}
                      onClick={() => onQuickView(product)}
                      title="View Specs & Verified Reviews"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
              No products found for "{searchQuery}". Try searching for <em>"AR Glasses"</em>, <em>"CyberDeck"</em>, or <em>"AI Hub"</em>.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Checkout({ 
  cart, 
  currency, 
  onComplete 
}: { 
  cart: CartItem[], 
  currency: Currency, 
  onComplete: (order: Order) => void 
}) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const totalPriceINR = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      const newOrder: Order = {
        id: `NX-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: [...cart],
        totalINR: totalPriceINR,
        status: 'Dispatched via BlueDart Express',
        courier: 'BlueDart Air Express (Tracking #BD' + Math.floor(10000000 + Math.random() * 90000000) + ')',
        trackingStep: 2
      };
      setPlacedOrder(newOrder);
      onComplete(newOrder);
    }, 1800);
  };

  if (placedOrder) {
    return (
      <main className="main-content">
        <div className="container" style={{ maxWidth: '650px', textAlign: 'center', paddingTop: '3rem' }}>
          <div className="glass" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Order Placed!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your order <strong style={{ color: 'var(--text-primary)' }}>#{placedOrder.id}</strong> has been secured and routed to BlueDart Air.
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '10px', marginBottom: '2rem', textAlign: 'left', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
              <div>📦 <strong>Status:</strong> {placedOrder.status}</div>
              <div style={{ marginTop: '0.4rem' }}>🚚 <strong>Carrier:</strong> {placedOrder.courier}</div>
              <div style={{ marginTop: '0.4rem' }}>💰 <strong>Total Paid:</strong> {formatPrice(placedOrder.totalINR, currency)}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="main-content">
        <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <h2>Your cart is empty!</h2>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>Go Back to Shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '2rem' }}>Secure Checkout</h1>
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h3>Order Summary ({cart.length} items)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', background: 'rgba(0,240,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              🔒 256-Bit SSL Secured
            </span>
          </div>

          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />
                <span>{item.quantity}x {item.name}</span>
              </div>
              <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity, currency)}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '1.4rem', fontWeight: 'bold' }}>
            <span>Total Payable:</span>
            <span className="text-accent">{formatPrice(totalPriceINR, currency)}</span>
          </div>

          <form onSubmit={handlePayment} style={{ marginTop: '2.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Shipping & Payment Details</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" className="search-input" placeholder="Full Name" required style={{ flex: 1 }} defaultValue="Anmol Goyal" />
              <input type="email" className="search-input" placeholder="Contact Email" required style={{ flex: 1 }} defaultValue="founder@anmolnexus.in" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <input type="text" className="search-input" placeholder="Delivery Address (Street, City, PIN code)" required style={{ width: '100%' }} defaultValue="Tech Park, Sector 62, Noida, India" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <input type="text" className="search-input" placeholder="Card Number" required style={{ flex: 2 }} defaultValue="4532 •••• •••• 8892" />
              <input type="text" className="search-input" placeholder="MM/YY" required style={{ flex: 1 }} defaultValue="08/29" />
              <input type="text" className="search-input" placeholder="CVV" required style={{ flex: 1 }} defaultValue="382" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }} disabled={isProcessing}>
              {isProcessing ? 'Authorizing Payment via Gateway...' : `Pay ${formatPrice(totalPriceINR, currency)} Securely`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('nexus_theme') as ThemeMode) || 'cyberpunk';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('nexus_currency') as Currency) || 'INR';
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nexus_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'NX-94210',
        date: 'Oct 9, 2026',
        items: [{ ...INITIAL_PRODUCTS[0], quantity: 1 }],
        totalINR: 24999,
        status: 'Delivered',
        courier: 'BlueDart Express (Signed by Resident)',
        trackingStep: 4
      }
    ];
  });

  const [user, setUser] = useState<{name: string, email: string} | null>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportTab, setSupportTab] = useState<'ticket' | 'faq' | 'contact'>('ticket');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('nexus_tickets');
    return saved ? JSON.parse(saved) : [
      {
        id: 'NX-TCK-8921',
        name: 'Anmol Goyal',
        email: 'founder@anmolnexus.in',
        category: 'Hardware Warranty',
        priority: 'Normal',
        subject: 'Inquiry regarding Quantum X1 replacement earcups',
        description: 'Need extra ear cushion sets for studio mixing.',
        status: 'Resolved • Dispatched Replacement Set',
        date: 'Oct 10, 2026'
      }
    ];
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // AI Assistant state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ sender: 'bot' | 'user', text: string, suggestedProduct?: Product }[]>([
    {
      sender: 'bot',
      text: '👋 Greetings! I am Nexus AI Concierge, powered by Claude 3.5 Sonnet. How can I assist you with neural hardware specs, AR optics, or computing clusters today?'
    }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2800);
  };

  // Sync theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  // Fetch products from backend with graceful fallback
  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((d: any, idx: number) => ({
            ...INITIAL_PRODUCTS[idx % INITIAL_PRODUCTS.length],
            ...d
          }));
          setProducts(merged);
        }
      })
      .catch(() => {
        // Fallback to rich initial products
      });
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nexus_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('nexus_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nexus_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }, [user]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
    const found = THEMES.find(t => t.id === newTheme);
    showToast(`🎨 Switched to ${found?.label || newTheme} Theme`);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    showToast(`🛒 Added "${product.name}" to cart`);
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleOrderComplete = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    showToast(`🎉 Order #${newOrder.id} placed successfully!`);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newTicket: SupportTicket = {
      id: `NX-TCK-${Math.floor(10000 + Math.random() * 90000)}`,
      name: target.name.value,
      email: target.email.value,
      category: target.category.value,
      priority: target.priority.value,
      subject: target.subject.value,
      description: target.description.value,
      status: 'Investigating • Assigned to AI Engineering Pod',
      date: 'Just now'
    };
    setTickets(prev => [newTicket, ...prev]);
    showToast(`📨 Ticket #${newTicket.id} submitted! Expected reply in 15 mins.`);
    target.reset();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const email = target.email.value;
    const password = target.password.value;
    
    try {
      if (authMode === 'signup') {
        const name = target.fullName.value;
        const res = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name, email: data.email });
          setIsAuthModalOpen(false);
          showToast(`👋 Welcome to Nexus, ${data.name}!`);
          return;
        }
      } else {
        const res = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name, email: data.email });
          setIsAuthModalOpen(false);
          showToast(`👋 Welcome back, ${data.name}!`);
          return;
        }
      }
    } catch {
      // Offline fallback
    }
    const displayName = target.fullName ? target.fullName.value : email.split('@')[0];
    setUser({ name: displayName || 'Tech Founder', email });
    setIsAuthModalOpen(false);
    showToast(`👋 Logged in as ${displayName || 'Tech Founder'}`);
  };

  // AI Concierge response generator
  const handleAiSend = (queryText?: string) => {
    const text = (queryText || aiInput).trim();
    if (!text) return;

    const newMsgs = [...aiMessages, { sender: 'user' as const, text }];
    setAiMessages(newMsgs);
    setAiInput('');

    setTimeout(() => {
      const lower = text.toLowerCase();
      let botResponse = '';
      let suggested: Product | undefined;

      if (lower.includes('glass') || lower.includes('ar') || lower.includes('optics')) {
        suggested = INITIAL_PRODUCTS[2]; // Nexus Neural Glass
        botResponse = `The **Nexus Neural Glass AR Pro** is our breakthrough spatial computing wearable! Weighing only 48g, it projects dual 1080p Micro-LED waveguides and includes on-device Claude computer vision for live object detection and document analysis.`;
      } else if (lower.includes('cyberdeck') || lower.includes('terminal') || lower.includes('linux') || lower.includes('dev')) {
        suggested = INITIAL_PRODUCTS[3]; // CyberDeck Terminal X7
        botResponse = `The **CyberDeck Terminal X7** is the developer's ultimate portable rig. It features an ortholinear hot-swappable mechanical keyboard, 32GB RAM, octa-core RISC-V with AI NPU, and CNC-milled 6061 aluminum armor!`;
      } else if (lower.includes('server') || lower.includes('hub') || lower.includes('accelerator') || lower.includes('local llm')) {
        suggested = INITIAL_PRODUCTS[4]; // Synapse AI Neural Accelerator
        botResponse = `The **Synapse AI Neural Accelerator Hub** delivers 128 TOPS of local neural tensor performance. It runs 70B parameter models at 45 tokens/sec right on your desk with silent vapor-chamber liquid cooling!`;
      } else if (lower.includes('headphone') || lower.includes('quantum') || lower.includes('noise')) {
        suggested = INITIAL_PRODUCTS[0];
        botResponse = `The **Quantum X1 Wireless Headphones** are our top recommendation for acoustic precision with 65 hours of battery life and active hybrid noise cancellation (-45dB).`;
      } else if (lower.includes('fitness') || lower.includes('watch') || lower.includes('smartwatch')) {
        suggested = INITIAL_PRODUCTS[1];
        botResponse = `For serious athletics and biometric tracking, the **Titanium Smartwatch Pro Max** features aerospace grade 5 titanium, medical ECG, and multi-band dual GPS with a 14-day battery.`;
      } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('under') || lower.includes('deal')) {
        suggested = INITIAL_PRODUCTS[6]; // CyberFit
        botResponse = `Looking for the best value? The **CyberFit Fitness Tracker** is currently 33% off at ${formatPrice(9999, currency)}. It weighs only 18g and offers 21 days of continuous battery life!`;
      } else {
        suggested = INITIAL_PRODUCTS[2];
        botResponse = `Explore our flagship **Nexus Neural Glass AR Pro** or the **CyberDeck Terminal X7** for cutting-edge computing. All products are backed by our 2-Year Nexus Shield warranty and same-day air dispatch!`;
      }

      setAiMessages([...newMsgs, { sender: 'bot', text: botResponse, suggestedProduct: suggested }]);
    }, 600);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPriceINR = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const activeThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  const faqs = [
    {
      q: '🛡️ What is covered under the 2-Year Nexus Shield Warranty?',
      a: 'Nexus Shield provides full coverage against manufacturing defects, accidental sensor damage, and battery degradation below 80%. If your hardware develops an issue, our courier conducts an express doorstep hardware swap within 48 business hours.'
    },
    {
      q: '🤖 How does Claude AI work on Nexus Neural Hardware?',
      a: 'Nexus devices utilize dedicated low-power NPUs for sub-10ms edge inference. For heavy multi-modal reasoning, the hardware seamlessly falls back to Anthropic Claude 3.5 Sonnet cloud APIs via encrypted zero-trust tunnels.'
    },
    {
      q: '🚚 What are the delivery timelines across India and internationally?',
      a: 'Metro areas (Delhi-NCR, Mumbai, Bengaluru, Hyderabad) receive same-day or next-morning air express delivery via BlueDart. Other Indian regions receive delivery in 2 business days. Worldwide international shipping via DHL Express arrives in 3-5 days.'
    },
    {
      q: '🔄 What is the return and refund policy?',
      a: 'We offer a 30-day no-questions-asked refund guarantee. Simply initiate a return from the Support Portal, and our logistics partner will pick up the package with full prepaid insurance.'
    }
  ];

  return (
    <BrowserRouter>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-item">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="nav-logo" onClick={() => setIsCartOpen(false)}>
            <span>NEXUS</span><span className="text-accent">.</span>
          </Link>
          
          <div className="search-bar">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search AR glasses, cyberdeck, AI hub, specs, or 'under 30000'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="nav-actions">
            {/* Multiple Theme Mode Selector */}
            <div className="theme-picker-container">
              <button 
                className="theme-picker-btn"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                title="Change theme palette"
              >
                <span>{activeThemeObj.icon}</span>
                <span>{activeThemeObj.label}</span>
                <span style={{ fontSize: '0.65rem' }}>▼</span>
              </button>

              {isThemeMenuOpen && (
                <div className="theme-dropdown glass">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      className={`theme-option-btn ${theme === t.id ? 'active' : ''}`}
                      onClick={() => handleThemeChange(t.id)}
                    >
                      <span className="theme-color-dot" style={{ backgroundColor: t.color }}></span>
                      <span>{t.icon} {t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Switcher */}
            <button 
              className="currency-btn"
              onClick={() => {
                const next = currency === 'INR' ? 'USD' : 'INR';
                setCurrency(next);
                showToast(`💱 Currency changed to ${next}`);
              }}
              title="Click to toggle currency"
            >
              {currency === 'INR' ? '🇮🇳 ₹ INR' : '🇺🇸 $ USD'}
            </button>

            {/* Support Portal Button */}
            <button 
              className="orders-nav-btn"
              onClick={() => setIsSupportOpen(true)}
              title="Help Center, Warranty & Support"
            >
              🎧 Support
            </button>

            {/* Orders Button */}
            <button 
              className="orders-nav-btn"
              onClick={() => setIsOrdersOpen(true)}
              title="View placed orders & tracking"
            >
              📦 Orders {orders.length > 0 && <span style={{ color: 'var(--accent-color)' }}>({orders.length})</span>}
            </button>

            {!user ? (
              <button 
                className="login-btn" 
                onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              >
                Login
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--accent-color)', fontSize: '0.85rem' }}>Hi, {user.name}</span>
                <button 
                  className="login-btn" 
                  onClick={() => {
                    setUser(null);
                    showToast('Logged out');
                  }} 
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  Logout
                </button>
              </div>
            )}
            
            <button className="cart-icon-btn" onClick={() => setIsCartOpen(true)}>
              🛒 
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>
      </nav>

      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              products={products} 
              addToCart={addToCart} 
              searchQuery={searchQuery} 
              currency={currency}
              onQuickView={(p) => setSelectedProduct(p)}
              onOpenAi={() => setIsAiOpen(true)}
            />
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <Checkout 
              cart={cart} 
              currency={currency} 
              onComplete={handleOrderComplete} 
            />
          } 
        />
      </Routes>

      {/* Support & Help Portal Modal */}
      {isSupportOpen && (
        <div className="modal-overlay open" onClick={() => setIsSupportOpen(false)}>
          <div className="support-modal glass" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsSupportOpen(false)}>&times;</button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <h2>Nexus Engineering & Hardware Support</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Enterprise SLA: 15-Minute Guaranteed AI Response • 24/7 Dedicated Hardware Engineers
                </p>
              </div>
              <div style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-color)', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                ⚡ Systems Operational • 99.98% SLA
              </div>
            </div>

            <div className="support-nav-pills">
              <button 
                className={`support-pill-btn ${supportTab === 'ticket' ? 'active' : ''}`}
                onClick={() => setSupportTab('ticket')}
              >
                📝 Submit Ticket ({tickets.length})
              </button>
              <button 
                className={`support-pill-btn ${supportTab === 'faq' ? 'active' : ''}`}
                onClick={() => setSupportTab('faq')}
              >
                ❓ Knowledge Base & FAQs
              </button>
              <button 
                className={`support-pill-btn ${supportTab === 'contact' ? 'active' : ''}`}
                onClick={() => setSupportTab('contact')}
              >
                📞 Direct Founder Channels
              </button>
            </div>

            {supportTab === 'ticket' && (
              <div className="support-grid">
                <div>
                  <h3 style={{ marginBottom: '1rem' }}>Open an Engineering Ticket</h3>
                  <form onSubmit={handleTicketSubmit} className="support-card">
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Full Name</label>
                        <input type="text" name="name" className="form-input" required defaultValue={user ? user.name : "Anmol Goyal"} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Email Address</label>
                        <input type="email" name="email" className="form-input" required defaultValue={user ? user.email : "founder@anmolnexus.in"} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Category</label>
                        <select name="category" className="form-input" style={{ cursor: 'pointer' }}>
                          <option value="Hardware Warranty">🛡️ Hardware Warranty & Swap</option>
                          <option value="Order Logistics">🚚 Order Delivery & Logistics</option>
                          <option value="Claude AI SDK">🤖 Claude AI SDK & API Access</option>
                          <option value="Enterprise Purchase">🏢 Enterprise & Bulk Inquiries</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label">Priority</label>
                        <select name="priority" className="form-input" style={{ cursor: 'pointer' }}>
                          <option value="High">🔴 High (Production Critical)</option>
                          <option value="Normal">🟡 Normal (Standard Inquiries)</option>
                          <option value="Low">🟢 Low (General Feedback)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Subject / Issue Summary</label>
                      <input type="text" name="subject" className="form-input" placeholder="e.g. Firmware update guidance for Neural Glass AR" required />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                      <label className="form-label">Technical Details / Logs</label>
                      <textarea name="description" className="form-input" rows={3} placeholder="Describe what you observed or what assistance is required..." required style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      ⚡ Dispatch Ticket to Nexus Engineering
                    </button>
                  </form>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem' }}>Active Support Tickets</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                    {tickets.map(t => (
                      <div key={t.id} className="support-card" style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <strong style={{ color: 'var(--accent-color)' }}>{t.id}</strong>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{t.date}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>{t.subject}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>{t.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t.category}</span>
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>● {t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {supportTab === 'faq' && (
              <div className="faq-list">
                {faqs.map((f, fIdx) => (
                  <div key={fIdx} className="faq-item">
                    <div className="faq-question" onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}>
                      <span>{f.q}</span>
                      <span style={{ color: 'var(--accent-color)', fontSize: '1.2rem' }}>{activeFaq === fIdx ? '−' : '+'}</span>
                    </div>
                    {activeFaq === fIdx && (
                      <div className="faq-answer">
                        {f.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {supportTab === 'contact' && (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Direct escalations reach our executive engineering desk. For enterprise partnership, Claude API grants, or custom hardware runs, reach out via the channels below:
                </p>

                <div className="contact-channels-grid">
                  <a href="mailto:founder@anmolnexus.in" className="contact-channel-card">
                    <div style={{ fontSize: '1.8rem' }}>✉️</div>
                    <strong style={{ fontSize: '1.05rem' }}>Founder Direct Email</strong>
                    <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>founder@anmolnexus.in</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Direct inbox monitored by founder. PGP encrypted.</span>
                  </a>

                  <div className="contact-channel-card" style={{ cursor: 'pointer' }} onClick={() => { setIsSupportOpen(false); setIsAiOpen(true); }}>
                    <div style={{ fontSize: '1.8rem' }}>🤖</div>
                    <strong style={{ fontSize: '1.05rem' }}>Claude 3.5 AI Concierge</strong>
                    <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>Instant AI Hardware Diagnostics</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Real-time recommendation, compatibility, and troubleshooting.</span>
                  </div>

                  <a href="https://github.com/Anmolgoyal12/ecommerce-store/issues" target="_blank" rel="noreferrer" className="contact-channel-card">
                    <div style={{ fontSize: '1.8rem' }}>🐙</div>
                    <strong style={{ fontSize: '1.05rem' }}>GitHub Issue Tracker</strong>
                    <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>Anmolgoyal12 / ecommerce-store</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>File bugs, feature requests, and open-source contributions.</span>
                  </a>

                  <div className="contact-channel-card">
                    <div style={{ fontSize: '1.8rem' }}>🛡️</div>
                    <strong style={{ fontSize: '1.05rem' }}>Physical Lab Dispatch</strong>
                    <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>Sector 62, Noida, NCR, India</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Hardware quality inspection & cleanroom calibration facility.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Quick-View Modal */}
      {selectedProduct && (
        <div className="modal-overlay open" onClick={() => setSelectedProduct(null)}>
          <div className="quick-view-modal glass" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
            
            <div className="quick-view-grid">
              <div>
                <img src={selectedProduct.image} alt={selectedProduct.name} className="quick-view-img" />
                <div style={{ marginTop: '1rem', background: 'var(--bg-card)', padding: '0.9rem', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                  <div>🛡️ <strong>Official Warranty:</strong> 2 Years Nexus Shield Extended</div>
                  <div style={{ marginTop: '0.4rem' }}>🚚 <strong>Free Shipping:</strong> Same day dispatch via BlueDart Air</div>
                  <div style={{ marginTop: '0.4rem' }}>🔄 <strong>30-Day Hassle-Free Returns:</strong> No questions asked</div>
                </div>
              </div>

              <div>
                <span className="product-brand">{selectedProduct.brand}</span>
                <h2 style={{ margin: '0.4rem 0 0.8rem 0' }}>{selectedProduct.name}</h2>
                
                <div className="product-rating-row" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                  <span>★ {selectedProduct.rating}</span>
                  <span className="product-rating-count">({selectedProduct.reviewsCount} verified customer reviews)</span>
                </div>

                <div className="product-price-row" style={{ marginBottom: '1.2rem' }}>
                  <span className="product-price" style={{ fontSize: '2rem' }}>{formatPrice(selectedProduct.price, currency)}</span>
                  <span className="product-original-price">{formatPrice(selectedProduct.originalPrice, currency)}</span>
                  <span className="discount-tag">{selectedProduct.discount}</span>
                </div>

                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {selectedProduct.description}
                </p>

                <h4 style={{ marginTop: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  Technical Specifications
                </h4>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(selectedProduct.specs).map(([specKey, specVal]) => (
                      <tr key={specKey}>
                        <td>{specKey}</td>
                        <td>{specVal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  Add to Cart • {formatPrice(selectedProduct.price, currency)}
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
              <h4 style={{ marginBottom: '1rem' }}>Verified Customer Feedback ({selectedProduct.reviews.length} Featured)</h4>
              {selectedProduct.reviews.map((rev, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-header">
                    <strong>{rev.author} <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem' }}>✔ Verified Purchaser</span></strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{rev.date}</span>
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    {'★'.repeat(Math.floor(rev.rating))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tracking Modal */}
      {isOrdersOpen && (
        <div className="modal-overlay open" onClick={() => setIsOrdersOpen(false)}>
          <div className="orders-modal glass" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsOrdersOpen(false)}>&times;</button>
            <h2 style={{ marginBottom: '0.5rem' }}>Your Orders & Live Tracking</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Real-time delivery milestones managed by Nexus Logistics Engine.
            </p>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                No active orders found. Place your first order to view tracking!
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header-row">
                    <div>
                      <strong>Order #{order.id}</strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.8rem' }}>Placed on {order.date}</span>
                    </div>
                    <span className="order-tracking-badge">{order.status}</span>
                  </div>

                  {/* Tracking Steps Bar */}
                  <div className="tracking-steps">
                    {['Placed', 'Confirmed', 'Dispatched', 'Delivered'].map((stepName, sIdx) => (
                      <div key={stepName} className="tracking-step">
                        <div className={`step-dot ${sIdx <= order.trackingStep ? 'completed' : ''}`}>
                          {sIdx <= order.trackingStep ? '✓' : sIdx + 1}
                        </div>
                        <span>{stepName}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.8rem' }}>
                    🚚 <strong>Logistics Partner:</strong> {order.courier}
                  </div>

                  <div style={{ marginTop: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>{order.items.length} item(s)</span>
                    <strong style={{ color: 'var(--accent-color)' }}>{formatPrice(order.totalINR, currency)}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating AI Shopping Concierge Widget */}
      <button 
        className="ai-fab-btn" 
        onClick={() => setIsAiOpen(!isAiOpen)}
        title="Chat with Claude-powered Nexus AI Concierge"
      >
        <span>✨</span> Ask Nexus AI
      </button>

      {isAiOpen && (
        <div className="ai-chat-window glass">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <span>🤖</span> Nexus AI Concierge
              <span className="ai-claude-badge">Claude 3.5 Sonnet</span>
            </div>
            <button 
              className="close-cart-btn" 
              onClick={() => setIsAiOpen(false)}
              style={{ fontSize: '1.2rem', padding: '0.2rem' }}
            >
              &times;
            </button>
          </div>

          <div className="ai-chat-messages">
            {aiMessages.map((msg, mIdx) => (
              <div key={mIdx} className={`ai-msg ${msg.sender}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                {msg.suggestedProduct && (
                  <div className="ai-product-suggestion">
                    <img src={msg.suggestedProduct.image} alt={msg.suggestedProduct.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {msg.suggestedProduct.name}
                      </div>
                      <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 700 }}>
                        {formatPrice(msg.suggestedProduct.price, currency)}
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        if (msg.suggestedProduct) {
                          addToCart(msg.suggestedProduct);
                        }
                      }}
                    >
                      + Cart
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ai-prompt-chips">
            {[
              '🕶️ Nexus Neural Glass AR specs',
              '💻 CyberDeck Terminal X7',
              '🧠 Synapse AI Accelerator Hub',
              '💰 Best hardware under ₹30,000'
            ].map(prompt => (
              <button key={prompt} className="ai-chip" onClick={() => handleAiSend(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form 
            className="ai-chat-input-bar" 
            onSubmit={(e) => {
              e.preventDefault();
              handleAiSend();
            }}
          >
            <input 
              type="text" 
              className="ai-chat-input" 
              placeholder="Ask for recommendations, specs, or deals..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Auth Modal */}
      <div className={`modal-overlay ${isAuthModalOpen ? 'open' : ''}`} onClick={() => setIsAuthModalOpen(false)}>
        <div className="auth-modal glass" onClick={e => e.stopPropagation()}>
          <button className="close-modal-btn" onClick={() => setIsAuthModalOpen(false)}>&times;</button>
          
          <div className="auth-header">
            <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {authMode === 'login' ? 'Login to access your personalized experience.' : 'Join NEXUS for exclusive tech deals.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="fullName" className="form-input" placeholder="Enter your name" required />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input" placeholder="Enter your email" required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" placeholder="Enter your password" required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-toggle">
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button className="auth-toggle-btn" type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
              {authMode === 'login' ? 'Sign up here' : 'Login here'}
            </button>
          </div>
        </div>
      </div>

      {/* Cart Sidebar & Overlay */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart ({totalItems})</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>

        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div style={{ fontSize: '3rem', margin: '1rem 0' }}>🛒</div>
              <h3>Your cart is empty!</h3>
              <p>Add some tech gear to it now.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '2rem' }}
                onClick={() => setIsCartOpen(false)}
              >
                Shop Now
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.name}</h4>
                  <div className="cart-item-price">{formatPrice(item.price * item.quantity, currency)}</div>
                  
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>{formatPrice(totalPriceINR, currency)}</span>
            </div>
            <Link 
              to="/checkout" 
              className="btn btn-primary" 
              style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', display: 'flex' }}
              onClick={() => setIsCartOpen(false)}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
