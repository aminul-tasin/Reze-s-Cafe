import { createServer } from '../server';

let cachedApp: any = null;

export default async (req: any, res: any) => {
  if (!cachedApp) {
    console.log("Creating new server instance in Vercel...");
    cachedApp = await createServer();
  }
  return cachedApp(req, res);
};
