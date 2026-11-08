import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const app = express();
const PORT = 3000;
const TARGET_HOST = 'https://nexuslearnings.ai.studio';

const BRAND_NAME = 'GB STUDY';
const TELEGRAM_URL = 'https://t.me/GBFreestudy';
const ICON_URL = 'https://i.ibb.co/Q3g9fGSt/1791541921524.png';
const OLD_ICON_URL = 'https://i.ibb.co/1fj76tZZ/1790916890122.png';
const OLD_TELEGRAM = 'https://t.me/NEXUS_Learningz';

// Enable CORS and preflight handling for all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static assets from public folder
const publicDir = path.resolve('public');
app.use(express.static(publicDir));

// Helper to replace branding in strings
function transformBranding(str: string): string {
  if (!str) return str;
  return str
    .replace(new RegExp(OLD_ICON_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ICON_URL)
    .replace(new RegExp(OLD_TELEGRAM.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), TELEGRAM_URL)
    .replace(/https:\/\/t\.me\/[A-Za-z0-9_-]+/g, TELEGRAM_URL)
    .replace(/NEXUS LEARNING/g, BRAND_NAME)
    .replace(/NEXUS Learning/g, BRAND_NAME)
    .replace(/Nexus Learning/g, BRAND_NAME);
}

// Proxy function for /api/* and fallback assets
async function handleProxy(req: Request, res: Response) {
  try {
    const upstreamUrl = `${TARGET_HOST}${req.originalUrl}`;
    const reqHeaders: Record<string, string> = {
      'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': (req.headers['accept'] as string) || '*/*',
      'Accept-Language': (req.headers['accept-language'] as string) || 'en-US,en;q=0.9',
      'Referer': TARGET_HOST,
      'Origin': TARGET_HOST,
    };

    if (req.headers['content-type']) {
      reqHeaders['Content-Type'] = req.headers['content-type'] as string;
    }

    const options: RequestInit = {
      method: req.method,
      headers: reqHeaders,
      redirect: 'follow',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const rawBody = await new Promise<Buffer>((resolve) => {
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(Buffer.from(c)));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      });
      if (rawBody.length > 0) {
        options.body = new Uint8Array(rawBody);
      }
    }

    const upstreamRes = await fetch(upstreamUrl, options);

    // Forward status
    res.status(upstreamRes.status);

    // Forward headers
    const contentType = upstreamRes.headers.get('content-type') || '';
    if (contentType) res.setHeader('Content-Type', contentType);
    const contentDisposition = upstreamRes.headers.get('content-disposition');
    if (contentDisposition) res.setHeader('Content-Disposition', contentDisposition);
    const cacheControl = upstreamRes.headers.get('cache-control');
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);

    // If it's a JSON response or plain text, transform any legacy brand strings
    if (contentType.includes('application/json') || contentType.includes('text/plain')) {
      const text = await upstreamRes.text();
      const transformed = transformBranding(text);
      return res.send(transformed);
    }

    // Binary / stream response (e.g. PDFs, images, octet-stream, audio/video)
    if (upstreamRes.body) {
      // @ts-ignore
      const nodeStream = Readable.fromWeb(upstreamRes.body);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error(`[Proxy Error] ${req.method} ${req.originalUrl}:`, err?.message || err);
    if (!res.headersSent) {
      res.status(502).json({ success: false, error: 'Proxy request failed', details: err?.message });
    }
  }
}

// Proxy all /api/* routes
app.use('/api', handleProxy);

// Helper to serve an HTML page from pages/ directory
function servePage(filename: string) {
  return (_req: Request, res: Response) => {
    const filePath = path.resolve('pages', filename);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.sendFile(filePath);
    }
    return res.status(404).send('Page not found');
  };
}

// Map portal routes
app.get('/', servePage('pw.html'));
app.get('/pw', servePage('pw.html'));
app.get('/pw/', servePage('pw.html'));
app.get('/pw/subjects', servePage('pw_subjects.html'));
app.get('/pw/topics', servePage('pw_topics.html'));
app.get('/pw/content', servePage('pw_content.html'));
app.get('/pw/player', servePage('pw_player.html'));
app.get('/pw/enroll', servePage('pw_enroll.html'));
app.get('/pw/demo_video', servePage('pw_demo_video.html'));
app.get('/pw/study', servePage('pw_study.html'));
app.get('/pw/test', servePage('pw_test.html'));
app.get('/pw/khazana', servePage('pw_khazana.html'));
app.get('/pw/mydoubts', servePage('pw_mydoubts.html'));
app.get('/pw/search', servePage('pw_search.html'));
app.get('/community', servePage('community.html'));
app.get('/announcements', servePage('announcements.html'));
app.get('/start-dpp-test', servePage('start_dpp_test.html'));
app.get('/start-dpp-test/', servePage('start_dpp_test.html'));
app.get('/start-test', servePage('start_test.html'));
app.get('/start-test/', servePage('start_test.html'));
app.get('/subjects', servePage('pw_subjects.html'));
app.get('/home', servePage('home.html'));

// Specific assets fallback
app.use('/assets', async (req: Request, res: Response, next: NextFunction) => {
  const localAssetPath = path.resolve('public/assets', req.path.replace(/^\//, ''));
  if (fs.existsSync(localAssetPath)) {
    return next();
  }
  // Proxy missing assets to upstream
  return handleProxy(req, res);
});

// Wildcard for any other /pw subpaths
app.get('/pw/*', servePage('pw.html'));

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite middleware initialization skipped:', e);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GB STUDY Portal running on http://0.0.0.0:${PORT}`);
  });
}

start();
