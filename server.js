// Cloudflare Worker - Guarda como worker.js y despliega en Cloudflare Workers
// Soporta m3u8 y ts con User-Agent personalizado

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    const userAgent = url.searchParams.get('ua') || 'Ha3ia3USGXTgFNnuUUQzGT0MWjqaR7jA1DiQP46crrTm5e34HZF2Ayu3MjVWwMWg0hbkTTbmz7PTJSrBKWva1TybW2WQSqAKgyg2PccShf5DAhBm4d3VBU1C0TLJMAipi4LDdESmi0Q2wpRzYUg';

    if (!targetUrl) {
      return new Response('Falta ?url=', { status: 400 });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        }
      });
    }

    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          'User-Agent': userAgent,
          'Referer': 'http://nffthex0kzt.xyz/',
          'Origin': 'http://nffthex0kzt.xyz',
        }
      });

      let contentType = upstream.headers.get('Content-Type') || '';
      let body = await upstream.text();

      // Si es m3u8, reescribir URLs de los .ts para que también pasen por el proxy
      if (targetUrl.includes('.m3u8') || body.includes('#EXTM3U')) {
        const base = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const proxyBase = url.origin + url.pathname;
        
        body = body.split('\n').map(line => {
          line = line.trim();
          if (!line || line.startsWith('#')) return line;
          // es una url de segmento
          let full = line;
          if (line.startsWith('/')) {
             // /nk7t4f7d8w7r68h0kt/417_3044.ts -> http://nffthex0kzt.xyz/...
             full = 'http://nffthex0kzt.xyz' + line;
          } else if (!line.startsWith('http')) {
             full = base + line;
          }
          return `${proxyBase}?url=${encodeURIComponent(full)}&ua=${encodeURIComponent(userAgent)}`;
        }).join('\n');
        
        contentType = 'application/vnd.apple.mpegurl';
      }

      return new Response(body, {
        status: upstream.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        }
      });

    } catch (e) {
      return new Response('Error proxy: ' + e.message, { status: 500 });
    }
  }
}
