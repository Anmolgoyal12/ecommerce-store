import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Formatter for Indian Rupees
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

function Home({ products, addToCart, searchQuery }: { products: Product[], addToCart: (p: Product) => void, searchQuery: string }) {
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-header">
          <h1>Trending <span className="text-gradient">Electronics</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover the latest innovations in India.</p>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card glass">
              <div className="product-img-wrapper">
                <img src={product.image} alt={product.name} className="product-img" />
              </div>
              <div className="product-info">
                <span className="product-brand">{product.brand}</span>
                <h3 className="product-name" title={product.name}>{product.name}</h3>
                <div className="product-price-row">
                  <span className="product-price">{formatINR(product.price)}</span>
                  <span className="product-original-price">{formatINR(product.originalPrice)}</span>
                  <span className="discount-tag">{product.discount}</span>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>No products found for "{searchQuery}".</p>
          )}
        </div>
      </div>
    </main>
  );
}

function Checkout({ cart, totalPrice, onComplete }: { cart: CartItem[], totalPrice: number, onComplete: () => void }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Mock payment delay
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
      alert('Payment successful! Your order has been placed.');
      navigate('/');
    }, 2000);
  };

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
        <h1 style={{ marginBottom: '2rem' }}>Checkout securely</h1>
        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary ({cart.length} items)</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>{item.quantity}x {item.name}</span>
              <span>{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span>Total Amount:</span>
            <span className="text-accent">{formatINR(totalPrice)}</span>
          </div>

          <form onSubmit={handlePayment} style={{ marginTop: '3rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Payment Details</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" className="search-input" placeholder="Card Number" required style={{ flex: 2 }} />
              <input type="text" className="search-input" placeholder="MM/YY" required style={{ flex: 1 }} />
              <input type="text" className="search-input" placeholder="CVV" required style={{ flex: 1 }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }} disabled={isProcessing}>
              {isProcessing ? 'Processing Payment...' : `Pay ${formatINR(totalPrice)}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  
  // Persisted state using lazy initialization
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<{name: string, email: string} | null>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Fetch products from backend
  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to fetch products", err));
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }, [user]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const email = target.email.value;
    const password = target.password.value;
    
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
      } else {
        const err = await res.json();
        alert(err.error);
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
      } else {
        const err = await res.json();
        alert(err.error);
      }
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <BrowserRouter>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="nav-logo" onClick={() => setIsCartOpen(false)}>NEXUS<span className="text-accent">.</span></Link>
          
          <div className="search-bar">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="nav-actions">
            {!user ? (
              <button 
                className="login-btn" 
                onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              >
                Login
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>Hi, {user.name}</span>
                <button className="login-btn" onClick={() => setUser(null)} style={{ fontSize: '0.8rem' }}>Logout</button>
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
        <Route path="/" element={<Home products={products} addToCart={addToCart} searchQuery={searchQuery} />} />
        <Route path="/checkout" element={<Checkout cart={cart} totalPrice={totalPrice} onComplete={() => setCart([])} />} />
      </Routes>

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
                  <div className="cart-item-price">{formatINR(item.price * item.quantity)}</div>
                  
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
              <span>{formatINR(totalPrice)}</span>
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
