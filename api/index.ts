import { createServer } from '../server';

let cachedApp: any = null;

export default async (req: any, res: any) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  
  if (req.url === '/api/test') {
    return res.json({ 
      message: "API is working", 
      env: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      timestamp: new Date().toISOString()
    });
  }

  try {
    if (!cachedApp) {
      console.log("Creating new server instance...");
      cachedApp = await createServer();
      console.log("Server instance created successfully");
    }
    
    // Express app is a function (req, res) => void
    return cachedApp(req, res);
  } catch (err: any) {
    console.error("Vercel Function Error:", err);
    return res.status(500).json({ 
      error: "SERVER_INITIALIZATION_FAILED", 
      message: err.message,
      stack: err.stack,
      hint: "Check your Supabase URL and Key in Vercel Environment Variables."
    });
  }
};
