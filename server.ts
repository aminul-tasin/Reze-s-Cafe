import express from "express";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import path from "path";
import fs from "fs";

// Handle potential typo in user's env vars (SUPERBASE instead of SUPABASE)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://yxavodckxdpyaezxegii.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YXZvZGNreGRweWFlenhlZ2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDU5MDQsImV4cCI6MjA4ODIyMTkwNH0.mDaCU6KpyOOTelDNofEefeCH5_OC5vQtRfl6-7oOnpU";

let supabase: any;
let stripe: any;

function getStripe() {
  if (!stripe) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
    if (stripeKey && stripeKey.length > 5) {
      stripe = new Stripe(stripeKey);
    }
  }
  return stripe;
}

export async function createServer() {
  console.log("createServer() started");
  const app = express();

  try {
    // Initialize Supabase lazily
    if (!supabase) {
      console.log("Initializing Supabase...");
      if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
        throw new Error("Invalid or missing SUPABASE_URL");
      }
      if (!supabaseKey || supabaseKey.length < 10) {
        throw new Error("Invalid or missing SUPABASE_ANON_KEY");
      }
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log("Supabase client initialized");
    }
  } catch (err: any) {
    console.error("Critical: Supabase initialization failed:", err.message);
  }

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      supabaseUrl: supabaseUrl.substring(0, 15) + "..."
    });
  });
  app.get("/api/products", async (req, res) => {
    try {
      const { data: products, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Supabase error fetching products:", error.message);
        return res.status(500).json({ error: error.message });
      }
      res.json(products);
    } catch (err: any) {
      console.error("Products fetch exception:", err.message);
      res.status(500).json({ error: "Internal server error fetching products" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { total, itemsCount, email, items, paymentMethod, transactionId } = req.body;
      console.log("Checkout request:", { email, total, itemsCount, paymentMethod });

      if (paymentMethod && paymentMethod !== 'Stripe') {
        // Manual payment (bKash, Nagad, Rocket, COD)
        const { error } = await supabase.from("orders").insert({
          total,
          items_count: itemsCount,
          customer_email: email || 'Guest',
          items: items || [],
          status: 'Pending',
          payment_method: paymentMethod,
          transaction_id: transactionId || null
        });
        if (error) throw error;
        return res.json({ success: true, message: "Order placed successfully" });
      }

      const stripeInstance = getStripe();
      if (!stripeInstance) {
        // Fallback if Stripe is not configured (for demo purposes)
        const { error } = await supabase.from("orders").insert({
          total,
          items_count: itemsCount,
          customer_email: email || 'Guest',
          items: items || [],
          status: 'Processing',
          payment_method: 'Stripe (Demo)'
        });
        if (error) throw error;
        return res.json({ success: true, message: "Order placed (Stripe not configured)" });
      }

      // Create Stripe Checkout Session
      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.headers.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart`,
        customer_email: email || undefined,
        metadata: {
          items: JSON.stringify(items.map((i: any) => ({ 
            id: i.id, 
            name: i.name, 
            price: i.price, 
            quantity: i.quantity 
          }))).substring(0, 500), // Stripe metadata limit
          total: total.toString(),
          itemsCount: itemsCount.toString()
        }
      });

      res.json({ success: true, url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Checkout failed" });
    }
  });

  // Webhook or Success endpoint to finalize order
  app.post("/api/checkout/success", async (req, res) => {
    try {
      const { sessionId } = req.body;
      const stripeInstance = getStripe();
      if (!stripeInstance) return res.status(400).json({ error: "Stripe not configured" });

      const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const email = session.customer_email || session.customer_details?.email || 'Guest';
        const total = parseFloat(session.metadata?.total || "0");
        const itemsCount = parseInt(session.metadata?.itemsCount || "0");
        const items = JSON.parse(session.metadata?.items || "[]");

        // Check if order already exists to prevent duplicates (within last 5 mins)
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: existing, error: searchError } = await supabase
          .from("orders")
          .select("id")
          .eq("customer_email", email)
          .eq("total", total)
          .eq("items_count", itemsCount)
          .gt("created_at", fiveMinsAgo)
          .maybeSingle();
        
        if (!existing && !searchError) {
          const { error: insertError } = await supabase.from("orders").insert({
            total,
            items_count: itemsCount,
            customer_email: email,
            items,
            status: 'Paid',
            payment_method: 'Stripe'
          });
          if (insertError) throw insertError;
          return res.json({ success: true });
        }
        return res.json({ success: true, message: "Order already recorded" });
      }
      res.status(400).json({ error: "Payment not verified" });
    } catch (error) {
      console.error("Success verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Customer Auth
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // 1. Register user in Supabase Auth (This populates the "Authentication" tab)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // 2. Also insert into our public.users table for profile data (address, phone, etc.)
      // We use the email as the link between Auth and our Profile table
      const { error: dbError } = await supabase.from("users").insert({
        email,
        password, // Stored for legacy compatibility, though Auth handles it now
        name
      });

      if (dbError && dbError.code !== '23505') {
        console.error("Profile creation warning:", dbError.message);
      }

      res.json({ success: true, user: authData.user });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/auth/customer-login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    
    try {
      // Check public.users table directly since user is managing their own table
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password) // Note: In production, passwords should be hashed
        .maybeSingle();

      if (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ error: "Database error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      res.json({ 
        success: true, 
        user: { 
          email: user.email, 
          name: user.name || 'User' 
        } 
      });
    } catch (err: any) {
      console.error("Login exception:", err.message);
      res.status(500).json({ error: "Internal server error during login" });
    }
  });

  app.get("/api/customer/orders", async (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "Email required" });
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(orders);
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      // Basic stats
      const { count: productsCount } = await supabase.from("products").select("*", { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from("orders").select("*", { count: 'exact', head: true });
      
      const { data: revenueData } = await supabase.from("orders").select("total");
      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      const { data: products } = await supabase.from("products").select("category");
      const categoryStatsMap = products?.reduce((acc: any, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});
      const categoryStats = Object.entries(categoryStatsMap || {}).map(([category, count]) => ({ category, count }));
      
      // Sales over time (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("total, created_at")
        .gt("created_at", sevenDaysAgo);

      const salesOverTimeMap = recentOrders?.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { date, revenue: 0, orders: 0 };
        acc[date].revenue += order.total;
        acc[date].orders += 1;
        return acc;
      }, {});
      const salesOverTime = Object.values(salesOverTimeMap || {}).sort((a: any, b: any) => a.date.localeCompare(b.date));

      res.json({
        stats: {
          products: productsCount || 0,
          orders: ordersCount || 0,
          revenue: totalRevenue
        },
        categoryStats,
        salesOverTime
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(orders);
  });

  app.put("/api/admin/orders/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.post("/api/admin/orders/clear", async (req, res) => {
    const { error } = await supabase.from("orders").delete().neq("id", 0); // Delete all
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      // Check public.users table directly
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

      if (error) {
        console.error("Admin Login DB Error:", error.message);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      // Check if admin (is_admin is int8 in Supabase, so 1 means true)
      const isAdmin = user.is_admin == 1 || user.is_admin === true || user.email === "asmaminultasin@gmail.com";

      if (isAdmin) {
        res.json({ 
          success: true, 
          adminEmail: email,
          token: Buffer.from(email + ":admin").toString('base64') 
        });
      } else {
        res.status(403).json({ success: false, message: "Access denied: You are not an admin." });
      }
    } catch (err: any) {
      console.error("Admin login exception:", err.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/auth/verify-admin", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ isAdmin: false });

    try {
      const email = Buffer.from(token, 'base64').toString().split(':')[0];
      const { data: user } = await supabase
        .from("users")
        .select("is_admin")
        .eq("email", email)
        .eq("is_admin", 1)
        .maybeSingle();

      res.json({ isAdmin: !!user });
    } catch (e) {
      res.json({ isAdmin: false });
    }
  });

  // Admin CRUD
  app.post("/api/admin/products", async (req, res) => {
    try {
      const { name, price, image, description, category, features, quantity } = req.body;
      if (!name || price === undefined || !image) {
        return res.status(400).json({ error: "Name, price, and image are required" });
      }

      const { data, error } = await supabase.from("products").insert({
        name,
        price,
        image,
        description,
        category,
        features: features || [],
        quantity: quantity || 0
      }).select().single();

      if (error) throw error;
      res.json({ id: data.id });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, image, description, category, features, quantity } = req.body;
      
      if (!name || price === undefined || !image) {
        return res.status(400).json({ error: "Name, price, and image are required" });
      }

      const { error } = await supabase.from("products").update({
        name,
        price,
        image,
        description,
        category,
        features: features || [],
        quantity: quantity || 0
      }).eq("id", id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Global error handler (should be last)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler caught:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // User Profile Endpoints
  app.get("/api/user/profile", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const { data: user, error } = await supabase
      .from("users")
      .select("email, name, address, phone, avatar")
      .eq("email", email)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  });

  app.post("/api/user/update", async (req, res) => {
    const { email, name, address, phone, avatar } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      const { error } = await supabase
        .from("users")
        .update({ name, address, phone, avatar })
        .eq("email", email);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update profile" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.VERCEL !== "1") {
    // Only serve static files if NOT on Vercel (Vercel handles this via rewrites/static build)
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
  }

  return app;
}

// Only start the server if this file is run directly and not on Vercel
if (process.env.VERCEL !== "1" && (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV === 'development')) {
  createServer().then(app => {
    const PORT = parseInt(process.env.PORT || "3000", 10);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default createServer;
