import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, X, Menu, Facebook, Twitter, Instagram, Plus, Minus, Trash2, Coffee, Zap, Flame, ArrowLeft, ShoppingBag, ShieldCheck, Truck, Filter, ChevronDown, SlidersHorizontal, Lock, LogOut, Edit, PlusCircle, Save, Image as ImageIcon, RefreshCw, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  features: string[];
  quantity: number;
}

// Interactive Background Shapes Component
const FloatingShapes = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const shapes = [
    // Chainsaw Blades
    { id: 1, type: 'saw', size: 50, color: "text-electric-blue", initialPos: { top: '10%', left: '5%' } },
    { id: 2, type: 'saw', size: 70, color: "text-neon-pink", initialPos: { top: '25%', left: '85%' } },
    { id: 3, type: 'saw', size: 40, color: "text-electric-blue", initialPos: { top: '70%', left: '15%' } },
    { id: 4, type: 'saw', size: 60, color: "text-neon-pink", initialPos: { top: '85%', left: '75%' } },
    
    // Bubbles
    { id: 5, type: 'bubble', size: 20, color: "text-lavender", initialPos: { top: '40%', left: '30%' } },
    { id: 6, type: 'bubble', size: 35, color: "text-neon-pink", initialPos: { top: '15%', left: '60%' } },
    { id: 7, type: 'bubble', size: 25, color: "text-electric-blue", initialPos: { top: '65%', left: '45%' } },
    { id: 8, type: 'bubble', size: 45, color: "text-lavender", initialPos: { top: '50%', left: '10%' } },
    { id: 9, type: 'bubble', size: 15, color: "text-neon-pink", initialPos: { top: '90%', left: '40%' } },
    
    // Bombs
    { id: 10, type: 'bomb', size: 55, color: "text-electric-blue", initialPos: { top: '5%', left: '45%' } },
    { id: 11, type: 'bomb', size: 40, color: "text-neon-pink", initialPos: { top: '75%', left: '90%' } },
  ];

  const getPath = (type: string) => {
    switch (type) {
      case 'saw':
        return "M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2z";
      case 'bomb':
        return "M12 2v2M12 18v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M18 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41";
      case 'bubble':
        return "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-15">
      {shapes.map((shape) => {
        // Attraction effect: move towards cursor
        // We use a small factor to make it subtle
        const attractionStrength = 0.08;
        const x = (mousePos.x - (window.innerWidth * parseFloat(shape.initialPos.left) / 100)) * attractionStrength;
        const y = (mousePos.y - (window.innerHeight * parseFloat(shape.initialPos.top) / 100)) * attractionStrength;

        return (
          <motion.div
            key={shape.id}
            style={{ 
              position: 'absolute',
              ...shape.initialPos,
            }}
            animate={{ 
              x, 
              y,
              rotate: (mousePos.x + mousePos.y) * 0.05 + (shape.id * 30)
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 40 }}
          >
            <svg 
              width={shape.size} 
              height={shape.size} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={shape.color}
            >
              <path d={getPath(shape.type)} />
              {shape.type === 'bubble' && <circle cx="12" cy="12" r="10" />}
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};

// Spark Effect Component
const SparkEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-neon-pink rounded-full"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 120,
            scale: [0, 2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: Math.random() * 0.3,
          }}
          style={{
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </div>
  );
};

// Animated Button Component
const AnimatedButton = ({ children, onClick, className = "", variant = "primary", type = "button", loading = false }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: "primary" | "secondary" | "danger", type?: "button" | "submit" | "reset", loading?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: "bg-neon-pink text-white hover:bg-pink-600 shadow-[0_0_15px_rgba(255,0,255,0.4)]",
    secondary: "bg-electric-blue text-deep-purple hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.4)]",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <motion.button
      type={type}
      disabled={loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={loading ? {} : { scale: 1.05 }}
      whileTap={loading ? {} : { scale: 0.95 }}
      className={`relative px-6 py-2.5 rounded-full font-bold transition-all duration-200 cursor-pointer overflow-visible ${variants[variant]} ${className} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        )}
        <span className="relative z-10">{children}</span>
      </div>
      {isHovered && !loading && <SparkEffect />}
    </motion.button>
  );
};

export default function App() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{id: number, name: string, price: number, image: string, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminVerifying, setIsAdminVerifying] = useState(true);
  const [user, setUser] = useState<{email: string, name: string, address?: string, phone?: string, avatar?: string} | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAdminVerifying(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/verify-admin', {
          headers: { 'Authorization': token }
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setIsAdminVerifying(false);
      }
    };
    verifyAdminStatus();
  }, []);

  const CheckoutPage = () => {
    const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
      city: '',
      phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'bKash' | 'Nagad' | 'Rocket' | 'COD'>('Stripe');
    const [transactionId, setTransactionId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          address: user.address || prev.address,
          phone: user.phone || prev.phone
        }));
      }
    }, [user]);

    useEffect(() => {
      if (cart.length === 0) {
        navigate('/');
      }
    }, [cart]);

    const handleShippingSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setStep('payment');
      window.scrollTo(0, 0);
    };

    const handleFinalPayment = async () => {
      if (['bKash', 'Nagad', 'Rocket'].includes(paymentMethod) && !transactionId) {
        alert("Please enter the Transaction ID for verification.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            total: cartTotal, 
            itemsCount: cartItemCount,
            email: formData.email || user?.email || 'Guest',
            items: cart.map(item => ({ 
              id: item.id, 
              name: item.name, 
              price: item.price, 
              quantity: item.quantity,
              image: item.image 
            })),
            shipping: formData,
            paymentMethod,
            transactionId: ['bKash', 'Nagad', 'Rocket'].includes(paymentMethod) ? transactionId : null
          })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Checkout failed');
        }

        const data = await res.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else if (data.success) {
          setCheckoutSuccess(true);
          setCart([]);
          navigate('/order-success');
        }
      } catch (err: any) {
        console.error("Checkout failed", err);
        alert(`Deployment Failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen py-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-16 space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'shipping' ? 'text-neon-pink' : 'text-lavender/40'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step === 'shipping' ? 'border-neon-pink bg-neon-pink/10' : 'border-lavender/20'}`}>1</div>
              <span className="text-xs uppercase font-bold tracking-widest">Shipping</span>
            </div>
            <div className="w-16 h-[1px] bg-lavender/10"></div>
            <div className={`flex items-center space-x-2 ${step === 'payment' ? 'text-neon-pink' : 'text-lavender/40'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step === 'payment' ? 'border-neon-pink bg-neon-pink/10' : 'border-lavender/20'}`}>2</div>
              <span className="text-xs uppercase font-bold tracking-widest">Payment</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'shipping' ? (
              <motion.div 
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-8 md:p-12"
              >
                <h2 className="text-4xl font-distorted text-white mb-10 tracking-widest">DEPLOYMENT COORDINATES</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Deployment Address</label>
                    <textarea 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-6 py-4 rounded-3xl bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none h-32 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">City</label>
                      <input 
                        required
                        type="text" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Phone</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                      />
                    </div>
                  </div>
                  <div className="pt-8">
                    <AnimatedButton type="submit" className="w-full py-5 text-xl">
                      CONFIRM DEPLOYMENT
                    </AnimatedButton>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-8 md:p-12">
                  <h2 className="text-4xl font-distorted text-white mb-10 tracking-widest">ARSENAL REVIEW</h2>
                  <div className="space-y-6 mb-10">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <img src={item.image} className="w-16 h-16 rounded-2xl object-cover border border-lavender/10" />
                          <div>
                            <p className="text-white font-bold">{item.name}</p>
                            <p className="text-lavender/40 text-xs uppercase font-bold tracking-widest">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-lavender/10 pt-8 space-y-4">
                    <div className="flex justify-between text-lavender/40 text-xs uppercase font-bold tracking-widest">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lavender/40 text-xs uppercase font-bold tracking-widest">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                    <div className="flex justify-between text-2xl font-distorted text-neon-pink pt-4">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-8 md:p-12">
                  <h3 className="text-2xl font-distorted text-white mb-6 uppercase tracking-widest">Select Payment Method</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { id: 'Stripe', label: 'Card / Stripe' },
                      { id: 'bKash', label: 'bKash' },
                      { id: 'Nagad', label: 'Nagad' },
                      { id: 'Rocket', label: 'Rocket' },
                      { id: 'COD', label: 'Cash on Delivery' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-4 rounded-2xl border-2 transition-all text-xs font-bold uppercase tracking-widest ${
                          paymentMethod === method.id 
                            ? 'border-neon-pink bg-neon-pink/10 text-white shadow-[0_0_15px_rgba(255,0,255,0.2)]' 
                            : 'border-lavender/10 text-lavender/40 hover:border-lavender/30'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {['bKash', 'Nagad', 'Rocket'].includes(paymentMethod) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-6 bg-lavender/5 border border-lavender/10 rounded-3xl"
                    >
                      <p className="text-lavender/60 text-sm italic mb-4">
                        Please send <span className="text-neon-pink font-bold">${cartTotal.toFixed(2)}</span> to our merchant number <span className="text-electric-blue font-bold">+880 1XXX-XXXXXX</span> and enter the Transaction ID below.
                      </p>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Transaction ID</label>
                        <input 
                          type="text" 
                          placeholder="e.g. TRN12345678"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full px-6 py-4 rounded-full bg-lavender/10 border border-lavender/20 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'COD' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-6 bg-lavender/5 border border-lavender/10 rounded-3xl"
                    >
                      <p className="text-lavender/60 text-sm italic">
                        You will pay <span className="text-neon-pink font-bold">${cartTotal.toFixed(2)}</span> in cash upon delivery of your arsenal.
                      </p>
                    </motion.div>
                  )}

                  <h3 className="text-2xl font-distorted text-white mb-6">PAYMENT SYSTEM</h3>
                  <p className="text-lavender/60 italic mb-8">
                    {paymentMethod === 'Stripe' 
                      ? 'You will be redirected to our secure encrypted payment gateway to finalize the transaction.'
                      : 'Confirm your details to finalize your acquisition request.'}
                  </p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => setStep('shipping')}
                      className="flex-1 py-5 rounded-full border border-lavender/10 text-lavender/40 font-bold uppercase tracking-widest hover:bg-lavender/5 transition-all"
                    >
                      Back to Coordinates
                    </button>
                    <AnimatedButton 
                      onClick={handleFinalPayment} 
                      loading={loading}
                      className="flex-[2] py-5 text-xl shadow-[0_0_30px_rgba(255,0,255,0.3)]"
                    >
                      {paymentMethod === 'Stripe' ? 'AUTHORIZE PAYMENT' : 'FINALIZE ACQUISITION'}
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      if (sessionId) {
        verifyPayment();
      } else {
        setVerifying(false);
      }
    }, [sessionId]);

    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/checkout/success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        if (res.ok) {
          setCart([]); // Clear cart on success
          setVerifying(false);
        } else {
          setError(true);
          setVerifying(false);
        }
      } catch (err) {
        setError(true);
        setVerifying(false);
      }
    };

    if (verifying) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full mb-8"
          />
          <h2 className="text-2xl font-distorted text-white tracking-widest uppercase">Verifying Acquisition...</h2>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-4xl font-distorted text-white mb-4">ACQUISITION FAILED</h2>
          <p className="text-lavender/60 mb-10 text-center max-w-md">There was an issue verifying your payment. Please contact Public Safety support.</p>
          <AnimatedButton onClick={() => navigate('/cart')}>RETURN TO CART</AnimatedButton>
        </div>
      );
    }

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 bg-neon-pink rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,0,255,0.5)]"
        >
          <CheckCircle className="h-16 w-16 text-white" />
        </motion.div>
        <h2 className="text-5xl font-distorted text-white mb-6 tracking-tighter">MISSION ACCOMPLISHED</h2>
        <p className="text-lavender/60 text-xl italic mb-12 text-center max-w-lg">Your arsenal has been secured and is being prepared for immediate deployment.</p>
        <div className="flex flex-col sm:flex-row gap-6">
          <AnimatedButton onClick={() => navigate('/profile')}>VIEW MY ARSENAL</AnimatedButton>
          <button 
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-lavender/5 hover:bg-lavender/10 text-lavender font-bold uppercase tracking-widest rounded-full border border-lavender/10 transition-all"
          >
            CONTINUE SCOUTING
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchProducts();
    if (user?.email) {
      refreshUser();
    }
  }, []);

  const refreshUser = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/user/profile?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Products data is not an array:", data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
    }
  };

  const categories = ["All", "Figures", "Plushies", "Apparel", "Manga", "Accessories", "Props"];

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Scroll to top on route change
  const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    return null;
  };

  const Navbar = () => (
    <nav className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#0a0510] via-deep-purple to-[#2d1b4d] backdrop-blur-md border-b border-lavender/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Branding Section */}
          <Link 
            to="/" 
            onClick={() => {
              setSelectedCategory("All");
              setSortBy("Newest");
            }}
            className="flex-shrink-0 flex items-center cursor-pointer group"
          >
            <div className="flex flex-col">
              <h1 className="text-4xl font-distorted text-neon-pink tracking-[0.2em] leading-none drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
                REZE'S CAFE
              </h1>
              <div className="flex items-center mt-3">
                <span className="text-[11px] uppercase tracking-[0.4em] text-electric-blue font-bold">
                  Chains • Explosions • Artistry
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Find your favorite anime gear..." 
                className="w-full pl-12 pr-4 py-2.5 rounded-full bg-deep-purple border border-lavender/20 text-lavender placeholder-lavender/40 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent transition-all"
              />
              <Search className="absolute left-4 top-3 h-5 w-5 text-lavender/40" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            {/* Latest Products Dropdown (Desktop) */}
            <div className="relative group hidden lg:block">
              <button className="flex items-center space-x-2 text-lavender hover:text-neon-pink transition-colors cursor-pointer py-2">
                <Zap className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Latest Drops</span>
                <div className="absolute -top-1 -right-2 bg-neon-pink text-[8px] px-1 rounded animate-pulse shadow-[0_0_5px_rgba(255,0,255,0.8)]">NEW</div>
              </button>
              
              {/* Dropdown Content */}
              <div className="absolute right-0 mt-2 w-72 bg-[#1a0b2e]/95 backdrop-blur-xl border border-lavender/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-50 p-5">
                <div className="flex items-center justify-between mb-4 border-b border-lavender/10 pb-2">
                  <h3 className="text-[10px] font-bold text-electric-blue uppercase tracking-[0.2em]">New Arrivals</h3>
                  <Flame className="h-3 w-3 text-neon-pink animate-bounce" />
                </div>
                <div className="space-y-4">
                  {Array.isArray(products) && products.slice(-3).reverse().map(product => (
                    <Link key={product.id} to={`/product/${product.id}`} className="flex items-center space-x-4 group/item">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-lavender/10 bg-deep-purple">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate group-hover/item:text-neon-pink transition-colors leading-tight">{product.name}</p>
                        <p className="text-xs text-electric-blue font-distorted mt-1">${product.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link 
                  to="/" 
                  onClick={() => {
                    setSelectedCategory("All");
                    setSortBy("Newest");
                  }}
                  className="block text-center mt-5 text-[10px] font-bold text-lavender/40 hover:text-neon-pink transition-colors uppercase tracking-[0.3em] border-t border-lavender/5 pt-3"
                >
                  View Full Arsenal
                </Link>
              </div>
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-lavender hover:text-neon-pink transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-7 w-7" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-neon-pink rounded-full shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="hidden md:flex items-center space-x-4 border-l border-lavender/10 pl-6">
              {user ? (
                <Link to="/profile" className="text-lavender/60 hover:text-neon-pink transition-colors">
                  <ShieldCheck className="h-6 w-6" />
                </Link>
              ) : (
                <Link to="/login" className="text-lavender/60 hover:text-neon-pink transition-colors">
                  <Lock className="h-6 w-6" />
                </Link>
              )}
              <Link to="/admin" className="text-lavender/60 hover:text-neon-pink transition-colors">
                <SlidersHorizontal className="h-6 w-6" />
              </Link>
            </div>
            
            <button 
              className="md:hidden p-2 text-lavender cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-deep-purple/95 backdrop-blur-xl border-b border-lavender/10 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-8">
              {/* Featured in Mobile */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold text-electric-blue uppercase tracking-[0.2em]">Latest Drops</h3>
                  <Zap className="h-3 w-3 text-neon-pink" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(products) && products.slice(-2).reverse().map(product => (
                    <Link 
                      key={product.id} 
                      to={`/product/${product.id}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col space-y-2 group"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-lavender/10">
                        <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <p className="text-[10px] font-bold text-white truncate px-1">{product.name}</p>
                      <p className="text-[10px] text-neon-pink font-distorted px-1">${product.price.toFixed(2)}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Search */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search arsenal..." 
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-lavender/5 border border-lavender/10 text-lavender text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-lavender/40" />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileMenuOpen(false);
                      document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      selectedCategory === cat 
                        ? 'bg-neon-pink text-white shadow-[0_0_10px_rgba(255,0,255,0.4)]' 
                        : 'bg-lavender/5 text-lavender/60 border border-lavender/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );

  const Footer = () => (
    <footer className="bg-deep-purple/80 backdrop-blur-xl border-t border-lavender/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          <div>
            <h3 className="text-3xl font-distorted text-neon-pink mb-6">REZE'S CAFE</h3>
            <p className="text-lavender/60 leading-relaxed italic">
              "Chains, Explosions, Artistry. We don't just sell merchandise; we provide the tools for your own story. Stay explosive."
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-electric-blue mb-6 uppercase tracking-widest">Devil Hunter HQ</h4>
            <ul className="space-y-4 text-lavender/60">
              <li className="flex items-center space-x-3">
                <span>Public Safety Sector 4, Tokyo</span>
              </li>
              <li>Email: caughtuscrolling@gmail.com</li>
              <li>Support: 24/7 Devil Hunting</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold text-neon-pink mb-6 uppercase tracking-widest">Join the Hunt</h4>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="w-full px-6 py-3 rounded-full bg-deep-purple border border-lavender/20 text-lavender focus:outline-none focus:ring-2 focus:ring-neon-pink"
              />
              <button type="submit" className="absolute right-2 top-1.5 bg-neon-pink text-white p-1.5 rounded-full hover:bg-pink-600 transition-colors">
                <Flame className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-lavender/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lavender/30 text-[10px] tracking-widest uppercase">
            <p>&copy; {new Date().getFullYear()} REZE'S CAFE. THE ULTIMATE ANIME MERCHANT EXPERIENCE.</p>
          </div>
          <Link to="/admin" className="text-lavender/10 hover:text-neon-pink/40 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold">
            Sector 4 Access
          </Link>
        </div>
      </div>
    </footer>
  );

  const Home = () => {
    const filteredProducts = (Array.isArray(products) ? products : [])
      .filter(p => selectedCategory === "All" || p.category === selectedCategory)
      .sort((a, b) => {
        if (sortBy === "Price: Low to High") return a.price - b.price;
        if (sortBy === "Price: High to Low") return b.price - a.price;
        return 0; // Default "Newest" (original order)
      });

    return (
      <>
        {/* ================= HERO SECTION ================= */}
        <section className="relative py-24 lg:py-40 flex flex-col items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center space-x-2 bg-neon-pink/10 border border-neon-pink/20 px-4 py-1 rounded-full mb-6">
              <Flame className="h-4 w-4 text-neon-pink" />
              <span className="text-sm font-medium text-neon-pink uppercase tracking-widest">Premium Anime Merchant</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-distorted text-white mb-8 tracking-normal leading-tight">
              UNLEASH&nbsp;&nbsp; THE <br /> <span className="text-electric-blue">DEVIL&nbsp;&nbsp; WITHIN</span>
            </h1>
            <p className="text-xl md:text-2xl text-lavender/80 max-w-2xl mb-12 italic">
              "The finest collection of Chainsaw Man gear and anime essentials. Don't let the spark fade."
            </p>
            <AnimatedButton 
              onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xl px-12 py-4 shadow-[0_0_20px_rgba(255,0,255,0.3)]"
            >
              EXPLORE THE ARSENAL
            </AnimatedButton>
          </motion.div>
          
          {/* Floating elements */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 opacity-20 hidden lg:block"
          >
            <Zap className="h-24 w-24 text-electric-blue" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 opacity-20 hidden lg:block"
          >
            <Flame className="h-24 w-24 text-neon-pink" />
          </motion.div>
        </section>

        {/* ================= PRODUCT GRID SECTION ================= */}
        <main id="products-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-4xl md:text-5xl font-distorted text-electric-blue mb-4">LIMITED DROPS</h2>
            <div className="h-1 w-32 bg-neon-pink rounded-full shadow-[0_0_10px_rgba(255,0,255,0.8)]"></div>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap justify-center items-center mb-12 gap-4">
            {/* Category Dropdown */}
            <div className="relative group">
              <div className="flex items-center space-x-2 bg-deep-purple/40 border border-lavender/10 px-4 py-1.5 rounded-full text-lavender/60 hover:border-neon-pink/30 transition-colors">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest mr-1">Category:</span>
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer text-lavender appearance-none pr-5"
                >
                  {categories.map(cat => (
                    <option key={cat} className="bg-deep-purple" value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 absolute right-4 pointer-events-none opacity-50" />
              </div>
            </div>

            {/* Sorting Dropdown */}
            <div className="relative group">
              <div className="flex items-center space-x-2 bg-deep-purple/40 border border-lavender/10 px-4 py-1.5 rounded-full text-lavender/60 hover:border-neon-pink/30 transition-colors">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest mr-1">Sort:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer text-lavender appearance-none pr-5"
                >
                  <option className="bg-deep-purple" value="Newest">Newest</option>
                  <option className="bg-deep-purple" value="Price: Low to High">Price: Low to High</option>
                  <option className="bg-deep-purple" value="Price: High to Low">Price: High to Low</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 absolute right-4 pointer-events-none opacity-50" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-deep-purple/40 backdrop-blur-sm rounded-3xl p-2 border border-lavender/10 hover:border-neon-pink/50 transition-all duration-500 group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-deep-purple">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-purple to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-neon-pink text-white text-[10px] font-bold px-2 py-1 rounded-md transform rotate-3 shadow-lg">
                      HOT ITEM
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-blue transition-colors h-14 line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-neon-pink font-distorted text-2xl">${product.price.toFixed(2)}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${product.quantity > 0 ? 'bg-electric-blue/10 text-electric-blue' : 'bg-red-500/10 text-red-500'}`}>
                      {product.quantity > 0 ? `${product.quantity} In Stock` : 'Out of Stock'}
                    </span>
                  </div>
                  <AnimatedButton 
                    variant="secondary"
                    onClick={() => product.quantity > 0 && addToCart(product)}
                    className={`w-full !py-3 text-sm ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {product.quantity > 0 ? 'ACQUIRE' : 'DEPLETED'}
                  </AnimatedButton>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-2xl italic text-lavender/40">No items found in this category...</p>
            </div>
          )}
        </main>
      </>
    );
  };

  const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = products.find(p => p.id === Number(id));

    if (!product) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-4xl font-distorted text-neon-pink mb-8">PRODUCT LOST IN THE VOID</h2>
        <AnimatedButton onClick={() => navigate('/')}>RETURN TO HQ</AnimatedButton>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Link 
          to="/"
          className="flex items-center space-x-2 text-lavender/60 hover:text-neon-pink transition-colors mb-12 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-sm">Back to Arsenal</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-3xl overflow-hidden border border-lavender/10 shadow-2xl"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto object-cover aspect-square"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-purple/40 to-transparent pointer-events-none" />
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <span className="text-electric-blue font-bold uppercase tracking-[0.3em] text-xs mb-4 block">{product.category}</span>
              <h1 className="text-4xl md:text-6xl font-distorted text-white mb-6 leading-tight">{product.name}</h1>
              <div className="flex items-center space-x-6 mb-8">
                <p className="text-4xl font-distorted text-neon-pink">${product.price.toFixed(2)}</p>
                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${product.quantity > 0 ? 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {product.quantity > 0 ? `${product.quantity} Units Available` : 'Depleted Arsenal'}
                </span>
              </div>
              <p className="text-lavender/70 text-lg leading-relaxed mb-10 italic">
                "{product.description}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
              {product.features?.map((feature, i) => (
                <div key={i} className="flex items-center space-x-3 text-lavender/60">
                  <Zap className="h-4 w-4 text-electric-blue" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <AnimatedButton 
                onClick={() => product.quantity > 0 && addToCart(product)}
                className={`flex-1 py-5 text-xl ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {product.quantity > 0 ? 'ADD TO ARSENAL' : 'OUT OF STOCK'}
              </AnimatedButton>
              {product.quantity > 0 && (
                <AnimatedButton 
                  variant="secondary"
                  className="flex-1 py-5 text-xl"
                  onClick={() => {
                    addToCart(product);
                    setIsCartOpen(true);
                  }}
                >
                  DETONATE NOW
                </AnimatedButton>
              )}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-lavender/10 pt-12">
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck className="h-6 w-6 text-electric-blue" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-lavender/40">Authentic Gear</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck className="h-6 w-6 text-electric-blue" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-lavender/40">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <ShoppingBag className="h-6 w-6 text-electric-blue" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-lavender/40">Secure Acquisition</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error("Failed to parse JSON response:", text);
          throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
        }
        
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          setIsAdmin(true);
          navigate('/admin');
        } else {
          setError(data.message || data.error || "Access Denied");
        }
      } catch (err: any) {
        console.error("Admin login error:", err);
        setError(`Connection error: ${err.message || 'Please try again'}`);
      }
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-deep-purple/80 backdrop-blur-xl border border-lavender/10 p-10 rounded-[2.5rem] shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-neon-pink/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-neon-pink" />
            </div>
            <h2 className="text-3xl font-distorted text-white">ADMIN ACCESS</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink"
                placeholder="admin@rezescafe.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Access Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center font-bold uppercase tracking-widest">{error}</p>}
            <AnimatedButton type="submit" className="w-full py-4 text-lg">UNLEASH PANEL</AnimatedButton>
          </form>
        </motion.div>
      </div>
    );
  };

  const CustomerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      const url = isLogin ? '/api/auth/customer-login' : '/api/auth/signup';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error("Failed to parse JSON response:", text);
          throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
        }

        if (res.ok) {
          if (isLogin) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/profile');
          } else {
            setIsLogin(true);
            alert("Signup successful! Please login.");
          }
        } else {
          setError(data.error || data.message || 'Authentication failed');
        }
      } catch (err: any) {
        console.error("Login fetch error:", err);
        setError(`Connection error: ${err.message || 'Please try again'}`);
      }
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-deep-purple/80 backdrop-blur-xl border border-lavender/10 p-10 rounded-[2.5rem] shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-distorted text-white mb-2">{isLogin ? 'WELCOME BACK' : 'JOIN THE ARSENAL'}</h2>
            <p className="text-lavender/40 text-[10px] uppercase font-bold tracking-widest">
              {isLogin ? 'Access your explosive orders' : 'Start your devil hunting journey'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink"
                  placeholder="Denji Hayakawa"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink"
                placeholder="denji@chainsaw.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center font-bold uppercase tracking-widest">{error}</p>}
            <AnimatedButton type="submit" className="w-full py-4 text-lg">
              {isLogin ? 'UNLEASH PROFILE' : 'CREATE ACCOUNT'}
            </AnimatedButton>
          </form>
          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-bold text-lavender/40 hover:text-neon-pink uppercase tracking-widest transition-colors"
            >
              {isLogin ? "Don't have an account? Join now" : "Already a member? Login here"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const CustomerProfile = ({ refreshUser }: { refreshUser: () => void }) => {
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatar: user?.avatar || ''
    });
    const navigate = useNavigate();

    useEffect(() => {
      if (!user) {
        navigate('/login');
        return;
      }
      fetchOrders();
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
    }, [user]);

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(user?.email || '')}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setUserOrders(data);
        } else {
          console.error("Orders data is not an array:", data);
          setUserOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setUserOrders([]);
      } finally {
        setLoading(false);
      }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user?.email, ...editData })
        });
        if (res.ok) {
          refreshUser();
          setIsEditing(false);
        }
      } catch (err) {
        console.error("Update failed", err);
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    };

    if (!user) return null;

    return (
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-8">
            <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6 group">
                <div className="absolute inset-0 bg-neon-pink rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt={user.name}
                  className="relative w-full h-full rounded-full object-cover border-2 border-lavender/20"
                />
              </div>
              <h2 className="text-2xl font-distorted text-white mb-1">{user.name}</h2>
              <p className="text-lavender/40 text-[10px] uppercase font-bold tracking-widest">{user.email}</p>
              
              <div className="mt-8 space-y-2">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full py-4 px-6 rounded-2xl text-left flex items-center space-x-4 transition-all ${activeTab === 'orders' ? 'bg-neon-pink text-white shadow-[0_0_20px_rgba(255,0,255,0.3)]' : 'text-lavender/40 hover:bg-lavender/5'}`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">My Arsenal</span>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full py-4 px-6 rounded-2xl text-left flex items-center space-x-4 transition-all ${activeTab === 'settings' ? 'bg-neon-pink text-white shadow-[0_0_20px_rgba(255,0,255,0.3)]' : 'text-lavender/40 hover:bg-lavender/5'}`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 px-6 rounded-2xl text-left flex items-center space-x-4 text-red-500/60 hover:bg-red-500/5 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                </button>
              </div>
            </div>

            <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-bold text-lavender/40 uppercase tracking-widest mb-4">Account Status</h3>
              <div className="flex items-center space-x-3 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Active Hunter</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'orders' ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-4xl font-distorted text-electric-blue">ORDER LOGS</h2>
                  <button onClick={fetchOrders} className="p-2 text-lavender/40 hover:text-electric-blue transition-colors">
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading ? (
                  <div className="py-24 text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-neon-pink border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lavender/40 uppercase tracking-widest text-xs font-bold">Scanning database...</p>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-16 text-center">
                    <Flame className="h-16 w-16 text-lavender/20 mx-auto mb-6" />
                    <h3 className="text-2xl font-distorted text-white mb-4">NO DROPS DETECTED</h3>
                    <Link to="/">
                      <AnimatedButton variant="secondary">START ACQUISITION</AnimatedButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.map(order => (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-8"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] font-bold text-neon-pink uppercase tracking-widest">Order #{order.id}</span>
                            <p className="text-white font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'Paid' ? 'bg-green-500/20 text-green-500' : 
                            order.status === 'Processing' ? 'bg-electric-blue/20 text-electric-blue' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                        
                        <div className="mb-6 flex flex-wrap gap-4">
                          <div className="bg-lavender/5 border border-lavender/10 px-4 py-2 rounded-xl">
                            <span className="text-[10px] text-lavender/40 uppercase font-bold tracking-widest block mb-1">Payment Method</span>
                            <span className="text-white text-xs font-bold uppercase">{order.payment_method || 'Stripe'}</span>
                          </div>
                          {order.transaction_id && (
                            <div className="bg-lavender/5 border border-lavender/10 px-4 py-2 rounded-xl">
                              <span className="text-[10px] text-lavender/40 uppercase font-bold tracking-widest block mb-1">Transaction ID</span>
                              <span className="text-electric-blue text-xs font-mono font-bold">{order.transaction_id}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-lavender/60">{item.quantity}x {item.name}</span>
                              <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-lavender/10 flex justify-between items-end">
                          <div className="text-[10px] text-lavender/40 uppercase font-bold tracking-widest">
                            Deployment Total
                          </div>
                          <div className="text-2xl font-distorted text-electric-blue">
                            ${order.total.toFixed(2)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className="text-4xl font-distorted text-electric-blue mb-8">HUNTER SETTINGS</h2>
                
                <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-[2.5rem] p-10">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Full Name</label>
                        <input 
                          type="text" 
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Phone Number</label>
                        <input 
                          type="tel" 
                          value={editData.phone}
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Profile Photo</label>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <input 
                            type="url" 
                            value={editData.avatar}
                            onChange={(e) => setEditData({...editData, avatar: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <label className="cursor-pointer flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-lavender/10 border border-lavender/10 text-white hover:bg-lavender/20 transition-all">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload File</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditData({...editData, avatar: reader.result as string});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Deployment Address</label>
                      <textarea 
                        value={editData.address}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        className="w-full px-6 py-4 rounded-3xl bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink outline-none h-32 resize-none"
                      />
                    </div>
                    <div className="pt-4">
                      <AnimatedButton type="submit" className="w-full md:w-auto px-12 py-4">
                        SAVE CHANGES
                      </AnimatedButton>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const AdminPanel = () => {
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'orders'>('products');
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [adminOrders, setAdminOrders] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      if (activeTab === 'analytics') {
        fetchAnalytics();
      } else if (activeTab === 'orders') {
        fetchAdminOrders();
      }
    }, [activeTab]);

    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };

    const fetchAdminOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        setAdminOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    const updateOrderStatus = async (orderId: number, status: string) => {
      try {
        await fetch(`/api/admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        fetchAdminOrders();
      } catch (err) {
        console.error("Failed to update status", err);
      }
    };

    const deleteOrder = async (orderId: number) => {
      if (window.confirm("Are you sure you want to delete this order?")) {
        try {
          await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
          fetchAdminOrders();
          fetchAnalytics(); // Update stats too
        } catch (err) {
          console.error("Failed to delete order", err);
        }
      }
    };

    if (isAdminVerifying) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-neon-pink border-t-transparent rounded-full mb-4"></div>
          <p className="text-lavender/40 uppercase tracking-widest text-xs font-bold">Verifying Credentials...</p>
        </div>
      );
    }

    if (!isAdmin) return <Navigate to="/admin/login" />;

    const handleLogout = () => {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      navigate('/');
    };

    const handleDelete = async (id: number) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
        await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      }
    };

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSaving) return;
      
      setIsSaving(true);
      
      try {
        const method = editingProduct?.id ? 'PUT' : 'POST';
        const url = editingProduct?.id ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
        
        // Ensure all required fields are present and correctly typed
        const payload = {
          name: editingProduct?.name || '',
          price: Number(editingProduct?.price) || 0,
          image: editingProduct?.image || '',
          description: editingProduct?.description || '',
          category: editingProduct?.category || 'Figures',
          quantity: Number(editingProduct?.quantity) || 0,
          features: editingProduct?.features || []
        };

        console.log("Saving product with payload:");
        console.table(payload);

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save product');
        }
        
        setIsFormOpen(false);
        setEditingProduct(null);
        await fetchProducts();
        alert("Arsenal updated successfully!");
      } catch (err: any) {
        console.error("Failed to save product", err);
        alert(`CRITICAL ERROR: ${err.message}`);
      } finally {
        setIsSaving(false);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingProduct({ ...editingProduct, image: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div>
            <h1 className="text-5xl font-distorted text-electric-blue mb-2">ADMIN ARSENAL</h1>
            <p className="text-lavender/40 uppercase tracking-[0.3em] text-xs font-bold">Manage your explosive inventory</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex bg-lavender/5 p-1 rounded-full border border-lavender/10">
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-neon-pink text-white shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'text-lavender/40 hover:text-lavender'}`}
              >
                Products
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-neon-pink text-white shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'text-lavender/40 hover:text-lavender'}`}
              >
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-neon-pink text-white shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'text-lavender/40 hover:text-lavender'}`}
              >
                Analytics
              </button>
            </div>
            <div className="flex space-x-4">
              {activeTab === 'products' && (
                <AnimatedButton onClick={() => { setEditingProduct({ features: [], category: 'Figures', quantity: 0, price: 0 }); setIsFormOpen(true); }} variant="secondary" className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>NEW DROP</span>
                </AnimatedButton>
              )}
              <button onClick={handleLogout} className="p-3 text-lavender/40 hover:text-red-500 transition-colors">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 gap-6">
            {Array.isArray(products) && products.map(product => (
              <motion.div 
                key={product.id}
                className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-8 group hover:border-neon-pink/30 transition-all"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-lavender/10">
                  <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <p className="text-electric-blue font-distorted text-lg">${product.price.toFixed(2)}</p>
                    <span className="text-[10px] font-bold text-lavender/40 uppercase tracking-widest border border-lavender/10 px-2 py-0.5 rounded">Qty: {product.quantity}</span>
                  </div>
                  <p className="text-lavender/40 text-xs uppercase tracking-widest mt-2">{product.category}</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                    className="p-3 bg-lavender/5 hover:bg-lavender/10 text-lavender rounded-xl transition-all"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-distorted text-white">ORDER LOGS</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={fetchAdminOrders}
                  className="px-6 py-2 bg-lavender/5 hover:bg-lavender/10 text-lavender text-[10px] font-bold uppercase tracking-widest rounded-full border border-lavender/10 transition-all"
                >
                  Refresh
                </button>
                {adminOrders.length > 0 && (
                  <button 
                    onClick={async () => {
                      if (window.confirm("WARNING: This will delete ALL orders. Proceed?")) {
                        await fetch('/api/admin/orders/clear', { method: 'POST' });
                        fetchAdminOrders();
                        fetchAnalytics();
                      }
                    }}
                    className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20 transition-all"
                  >
                    Wipe All Orders
                  </button>
                )}
              </div>
            </div>
            {adminOrders.length === 0 ? (
              <div className="text-center py-20 bg-deep-purple/20 rounded-3xl border border-lavender/5">
                <p className="text-lavender/40 uppercase tracking-[0.3em] text-xs font-bold">No orders found in the arsenal</p>
              </div>
            ) : adminOrders.map(order => (
              <div key={order.id} className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 rounded-3xl p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">Order #{order.id}</h3>
                    <p className="text-lavender/40 text-xs uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()} • {order.customer_email}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <span className="text-[10px] font-bold text-lavender/60 uppercase tracking-widest bg-lavender/5 px-3 py-1 rounded-full border border-lavender/10">
                        {order.payment_method || 'Stripe'}
                      </span>
                      {order.transaction_id && (
                        <span className="text-[10px] font-bold text-electric-blue uppercase tracking-widest bg-electric-blue/5 px-3 py-1 rounded-full border border-electric-blue/10 font-mono">
                          TX: {order.transaction_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'Delivered' ? 'bg-green-500/20 text-green-500' : 
                      order.status === 'Processing' ? 'bg-electric-blue/20 text-electric-blue' : 
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {order.status}
                    </span>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="bg-lavender/5 border border-lavender/10 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full focus:outline-none focus:ring-1 focus:ring-neon-pink"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button 
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-all"
                      title="Delete Order"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {(() => {
                    try {
                      const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
                      return items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-lavender/60">{item.name} x {item.quantity}</span>
                          <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ));
                    } catch (e) {
                      return <p className="text-red-500 text-xs">Error parsing items</p>;
                    }
                  })()}
                  <div className="pt-4 border-t border-lavender/10 flex justify-between items-center">
                    <span className="text-lavender uppercase text-[10px] font-bold tracking-widest">Total Revenue</span>
                    <span className="text-electric-blue font-distorted text-xl">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {analyticsData ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 p-8 rounded-[2rem] text-center">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-lavender/40 mb-2">Total Arsenal</p>
                    <p className="text-4xl font-distorted text-white">{analyticsData.stats.products}</p>
                    <p className="text-[10px] text-electric-blue mt-2 uppercase tracking-widest">Active Items</p>
                  </div>
                  <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 p-8 rounded-[2rem] text-center">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-lavender/40 mb-2">Acquisitions</p>
                    <p className="text-4xl font-distorted text-neon-pink">{analyticsData.stats.orders}</p>
                    <p className="text-[10px] text-electric-blue mt-2 uppercase tracking-widest">Total Orders</p>
                  </div>
                  <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 p-8 rounded-[2rem] text-center">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-lavender/40 mb-2">Total Revenue</p>
                    <p className="text-4xl font-distorted text-electric-blue">${analyticsData.stats.revenue.toFixed(2)}</p>
                    <p className="text-[10px] text-neon-pink mt-2 uppercase tracking-widest">Explosive Growth</p>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 p-8 rounded-[2rem]">
                    <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-lavender/40 mb-8">Sales Trajectory (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.salesOverTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d1b4d" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#8E9299" 
                            fontSize={10} 
                            tickFormatter={(val) => val.split('-').slice(1).join('/')}
                          />
                          <YAxis stroke="#8E9299" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a0b2e', border: '1px solid rgba(230, 230, 250, 0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#FF00FF', fontSize: '12px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#FF00FF" 
                            strokeWidth={3} 
                            dot={{ fill: '#FF00FF', strokeWidth: 2 }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-deep-purple/40 backdrop-blur-sm border border-lavender/10 p-8 rounded-[2rem]">
                    <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-lavender/40 mb-8">Arsenal Distribution</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.categoryStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d1b4d" vertical={false} />
                          <XAxis dataKey="category" stroke="#8E9299" fontSize={10} />
                          <YAxis stroke="#8E9299" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a0b2e', border: '1px solid rgba(230, 230, 250, 0.1)', borderRadius: '12px' }}
                            cursor={{ fill: 'rgba(0, 255, 255, 0.05)' }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {analyticsData.categoryStats.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00FFFF' : '#FF00FF'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-neon-pink border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lavender/40 uppercase tracking-widest text-xs font-bold">Scanning Sector 4 Data...</p>
              </div>
            )}
          </div>
        )}

        {/* Product Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setIsFormOpen(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-2xl bg-deep-purple border border-lavender/20 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-8 border-b border-lavender/10 flex justify-between items-center">
                  <h2 className="text-2xl font-distorted text-neon-pink">{editingProduct?.id ? 'EDIT DROP' : 'NEW DROP'}</h2>
                  <button onClick={() => setIsFormOpen(false)} className="text-lavender/40 hover:text-white"><X className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSave} className="p-8 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={editingProduct?.name || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Price ($)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={editingProduct?.price || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setEditingProduct({...editingProduct, price: isNaN(val) ? 0 : val});
                        }}
                        className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Category</label>
                      <select 
                        value={editingProduct?.category || 'Figures'}
                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink appearance-none"
                      >
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Quantity in Stock</label>
                      <input 
                        required
                        type="number" 
                        value={editingProduct?.quantity || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setEditingProduct({...editingProduct, quantity: isNaN(val) ? 0 : val});
                        }}
                        className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Product Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="product-image-upload"
                          />
                          <label 
                            htmlFor="product-image-upload"
                            className="flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-full bg-neon-pink/10 border border-dashed border-neon-pink/30 text-neon-pink hover:bg-neon-pink/20 transition-all cursor-pointer"
                          >
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload from Device</span>
                          </label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-[10px] font-bold text-lavender/20 uppercase">OR URL</span>
                          </div>
                          <input 
                            type="text" 
                            placeholder="https://..."
                            value={editingProduct?.image || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                            className="w-full pl-16 pr-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink text-xs"
                          />
                        </div>
                      </div>
                      {editingProduct?.image && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-lavender/10 bg-black/20">
                          <img src={editingProduct.image} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => setEditingProduct({...editingProduct, image: ''})}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Description</label>
                    <textarea 
                      required
                      value={editingProduct?.description || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="w-full px-6 py-4 rounded-3xl bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink h-32 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-lavender/40 ml-4">Features (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={editingProduct?.features?.join(', ') || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, features: e.target.value.split(',').map(f => f.trim()).filter(f => f !== '')})}
                      placeholder="e.g. 1/7 Scale, Premium PVC, Collector's Box"
                      className="w-full px-6 py-3 rounded-full bg-lavender/5 border border-lavender/10 text-white focus:ring-2 focus:ring-neon-pink"
                    />
                  </div>
                  <div className="pt-4">
                    <AnimatedButton type="submit" loading={isSaving} className="w-full py-4 text-xl flex items-center justify-center space-x-2">
                      <Save className="h-6 w-6" />
                      <span>SAVE ARSENAL DROP</span>
                    </AnimatedButton>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen cafe-texture font-serif text-lavender selection:bg-neon-pink selection:text-white">
        <FloatingShapes />
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/login" element={<CustomerAuth />} />
          <Route path="/profile" element={<CustomerProfile refreshUser={refreshUser} />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>

        <Footer />

        {/* ================= CART SIDEBAR ================= */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-deep-purple/80 backdrop-blur-sm z-50"
                onClick={() => setIsCartOpen(false)}
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-deep-purple border-l border-lavender/10 shadow-2xl flex flex-col"
              >
                <div className="px-8 py-6 border-b border-lavender/10 flex items-center justify-between">
                  <h2 className="text-2xl font-distorted text-neon-pink tracking-widest">
                    YOUR ARSENAL ({cartItemCount})
                  </h2>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 text-lavender hover:text-white hover:bg-lavender/10 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-lavender/40 space-y-6">
                      <Flame className="h-20 w-20 opacity-20" />
                      <p className="text-xl italic">The arsenal is empty...</p>
                      <AnimatedButton onClick={() => setIsCartOpen(false)} variant="secondary">
                        Go Back
                      </AnimatedButton>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {cart.map((item) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          className="flex gap-6 items-center"
                        >
                          <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl border border-lavender/10" referrerPolicy="no-referrer" />
                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <h3 className="text-lg font-bold text-white">{item.name}</h3>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-lavender/40 hover:text-neon-pink transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-electric-blue font-distorted text-xl">${item.price.toFixed(2)}</p>
                              <div className="flex items-center bg-lavender/5 rounded-full border border-lavender/10">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:text-neon-pink"><Minus className="h-4 w-4" /></button>
                                <span className="px-4 font-bold text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:text-neon-pink"><Plus className="h-4 w-4" /></button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-8 bg-lavender/5 border-t border-lavender/10">
                    <div className="flex justify-between text-2xl font-distorted text-white mb-6">
                      <p>TOTAL</p>
                      <p className="text-neon-pink">${cartTotal.toFixed(2)}</p>
                    </div>
                    <AnimatedButton 
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/checkout');
                      }}
                      className="w-full py-4 text-xl shadow-[0_0_30px_rgba(255,0,255,0.2)]"
                    >
                      DETONATE CHECKOUT
                    </AnimatedButton>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}

