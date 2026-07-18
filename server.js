import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

const DEFAULT_UA = 'Ha3ia3USGXTgFNnuUUQzGT0MWjqaR7jA1DiQP46crrTm5e34HZF2Ayu3MjVWwMWg0hbkTTbmz7PTJSrBKWva1TybW2WQSqAKgyg2PccShf5DAhBm4d3VBU1C0TLJMAipi4LDdESmi0Q2wpRzYUg';

app.use(cors({ origin: '*' }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`<h2>Proxy OK</h2><pre>/proxy?url=http://nffthex0kzt.xyz/rk/KYueQkWJhwrHVH/9Xu5JzN88Y/417.m3u8&ua=${DEFAULT_UA}</pre>`);
});

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  const userAgent = req.query.ua || DEFAULT_UA;
  if (!targetUrl) return res.status(400).send('Falta ?url=');

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': userAgent,
        'Referer': 'http://nffthex0kzt.xyz/',
        'Origin': 'http://nffthex0kzt.xyz',
      }
    });

    const contentType = upstream.headers.get('content-type') || '';
    const isM3U8 = targetUrl.includes('.m3u8') || contentType.includes('mpegurl');

    if (isM3U8) {
      let text = await upstream.text();
      const urlObj = new URL(targetUrl);
      const baseOrigin = `${urlObj.protocol}//${urlObj.host}`;
      const basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

      const rewritten = text.split('\n').map(line => {
        let l = line.trim();
        if (!l || l.startsWith('#')) return l;
        let fullUrl = l;
        if (l.startsWith('/')) {
          fullUrl = baseOrigin + l; // resuelve /nk7t4f7d8w7r68h0kt/417_3044.ts
        } else if (!l.startsWith('http')) {
          fullUrl = basePath + l;
        }
        return `${req.protocol}://${req.get('host')}/proxy?url=${encodeURIComponent(fullUrl)}&ua=${encodeURIComponent(userAgent)}`;
      }).join('\n');

      res.set({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache',
      });
      return res.send(rewritten);
    } else {
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType || 'video/mp2t',
      });
      upstream.body.pipe(res);
    }
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.listen(PORT, () => console.log(`Proxy en puerto ${PORT}`));
