import { createServer } from '../server';

let cachedApp: any = null;

export default async (req: any, res: any) => {
  if (req.url === '/api/test') {
    return res.json({ message: "API is working" });
  }
  if (!cachedApp) {
    console.log("Creating new server instance in Vercel...");
    try {
      cachedApp = await createServer();
    } catch (err: any) {
      console.error("Failed to create server:", err.message);
      return res.status(500).json({ 
        error: "A SERVER ERROR OCCURRED", 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
  return cachedApp(req, res);
};
