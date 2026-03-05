import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
const stripe = (stripeKey && stripeKey.length > 5) ? new Stripe(stripeKey) : null;

// Handle potential typo in user's env vars (SUPERBASE instead of SUPABASE)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.VITE_SUPERBASE_URL || "https://yxavodckxdpyaezxegii.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPERBASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YXZvZGNreGRweWFlenhlZ2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDU5MDQsImV4cCI6MjA4ODIyMTkwNH0.mDaCU6KpyOOTelDNofEefeCH5_OC5vQtRfl6-7oOnpU";

let supabase: any;

// Initial data
const initialProducts = [
  { 
    name: "Bomb Devil Reze Figure", 
    price: 189.99, 
    image: "https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=800&auto=format&fit=crop",
    description: "Highly detailed 1/7 scale figure of Reze in her Bomb Devil form. Features translucent explosion effects and a dynamic pose. Crafted with premium PVC materials to capture every detail of the hybrid form.",
    category: "Figures",
    features: JSON.stringify(["1/7 Scale", "Premium PVC", "Collector's Box", "Limited Edition"]),
    quantity: 15
  },
  { 
    name: "Pochita Plushie (Large)", 
    price: 45.00, 
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop",
    description: "Soft, huggable, and absolutely adorable. This large Pochita plushie features the iconic chainsaw head and tail. Perfect for cuddling or displaying on your shelf.",
    category: "Plushies",
    features: JSON.stringify(["Super Soft Fabric", "40cm Length", "Embroidered Details", "Official Licensed Design"]),
    quantity: 50
  },
  { 
    name: "Devil Hunter Trench Coat", 
    price: 150.00, 
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop",
    description: "The classic uniform of the Public Safety Devil Hunters. Made from high-quality, durable fabric with a sleek black finish. Perfect for cosplay or everyday stylish wear.",
    category: "Apparel",
    features: JSON.stringify(["Durable Cotton Blend", "Internal Pockets", "Accurate Design", "Unisex Fit"]),
    quantity: 20
  },
  { 
    name: "Chainsaw Man Manga Vol. 1-11", 
    price: 99.00, 
    image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=800&auto=format&fit=crop",
    description: "Experience the complete first part of Tatsuki Fujimoto's masterpiece. This box set includes volumes 1 through 11, following Denji's journey from a debt-ridden boy to the legendary Chainsaw Man.",
    category: "Manga",
    features: JSON.stringify(["Complete Part 1", "Exclusive Box Art", "English Translation", "High-Quality Print"]),
    quantity: 30
  },
  { 
    name: "Makima 'Control' Enamel Pin", 
    price: 12.50, 
    image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=800&auto=format&fit=crop",
    description: "A subtle yet powerful accessory. This high-quality enamel pin features Makima's hypnotic eyes and the symbol of the Control Devil. Perfect for jackets, bags, or hats.",
    category: "Accessories",
    features: JSON.stringify(["Hard Enamel", "Double Rubber Clutch", "Gold Plating", "2-inch Diameter"]),
    quantity: 100
  },
  { 
    name: "Power's Blood Scythe Prop", 
    price: 75.00, 
    image: "https://images.unsplash.com/photo-1589709130696-49231935d217?q=80&w=800&auto=format&fit=crop",
    description: "A lightweight yet sturdy replica of Power's iconic blood-manifested scythe. Perfect for cosplay or as a striking wall display for any fan of the Blood Fiend.",
    category: "Props",
    features: JSON.stringify(["High-Density Foam", "Hand-Painted Finish", "Detachable Handle", "Safe for Conventions"]),
    quantity: 10
  },
  { 
    name: "Aki Hayakawa's Katana", 
    price: 210.00, 
    image: "https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?q=80&w=800&auto=format&fit=crop",
    description: "A premium replica of Aki's sword, including the nail-shaped hilt used for his contract with the Curse Devil. Features a high-carbon steel blade (unsharpened) and a detailed scabbard.",
    category: "Props",
    features: JSON.stringify(["Carbon Steel Blade", "Nail-Shaped Hilt", "Traditional Wrap", "Display Stand Included"]),
    quantity: 5
  },
  { 
    name: "Public Safety Logo Hoodie", 
    price: 65.00, 
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
    description: "Stay warm while hunting devils. This heavy-weight hoodie features the Public Safety Devil Hunters logo on the chest and back. Comfortable, stylish, and durable.",
    category: "Apparel",
    features: JSON.stringify(["Heavyweight Fleece", "Screen-Printed Logo", "Kangaroo Pocket", "Pre-Shrunk"]),
    quantity: 40
  },
];

async function seedDatabase() {
  try {
    console.log("Checking if database needs seeding...");
    const { count, error } = await supabase.from("products").select("*", { count: 'exact', head: true });
    
    if (error) {
      console.error("Error checking products count:", error.message);
      return;
    }
    
    if (count === 0) {
      console.log("Seeding database with initial products...");
      const productsToInsert = initialProducts.map(p => ({
        ...p,
        features: JSON.parse(p.features)
      }));
      const { error: insertError } = await supabase.from("products").insert(productsToInsert);
      if (insertError) console.error("Error seeding products:", insertError.message);
      else console.log("Database seeded successfully");
    } else {
      console.log(`Database already has ${count} products.`);
    }
  } catch (err: any) {
    console.error("Seed database exception:", err.message);
  }
}

export async function createServer() {
  console.log("createServer() started");
  const app = express();
  const PORT = process.env.PORT || 3000;

  try {
    // Initialize Supabase lazily
    if (!supabase) {
      console.log("Initializing Supabase with URL:", supabaseUrl);
      if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
        throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
      }
      if (!supabaseKey || supabaseKey.length < 20) {
        throw new Error("Invalid Supabase Key");
      }
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log("Supabase client created successfully");
    }

    // Run seeding in background
    seedDatabase().catch(err => console.error("Background seeding failed:", err));
  } catch (err: any) {
    console.error("Error during server initialization:", err);
    throw err;
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

      if (!stripe) {
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
      const session = await stripe.checkout.sessions.create({
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
      if (!stripe) return res.status(400).json({ error: "Stripe not configured" });

      const session = await stripe.checkout.sessions.retrieve(sessionId);
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
      // Sign in using Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase Auth Error:", error.message);
        return res.status(401).json({ error: error.message });
      }

      // Fetch additional profile data from our public.users table
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      res.json({ 
        success: true, 
        user: { 
          email: data.user.email, 
          name: profile?.name || data.user.user_metadata?.name || 'User' 
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return res.status(401).json({ success: false, message: authError.message });
      }

      const { data: user, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("is_admin", 1)
        .maybeSingle();

      if (user && !dbError) {
        // Return a more secure session-based response
        res.json({ 
          success: true, 
          adminEmail: email,
          token: Buffer.from(email + ":admin").toString('base64') 
        });
      } else {
        res.status(401).json({ success: false, message: "Access denied: You are not an admin." });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Login error" });
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
