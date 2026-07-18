import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

// Lista de espejos, prueba uno por uno
const MIRRORS = [
  "https://sudamericaplay.live/canal_8112/tvla1es.html",
  "https://sudamericaplay.pro/canal_8112/tvla1es.html",
  "https://la12hd.com/canal_8112/tvla1es.html",
  "https://televisiongratis.live/canal_8112/tvla1es.html",
  "https://futbolibretv.pro/canal_8112/tvla1es.html"
];

app.get('/', async (req, res) => {
  let html = null;
  let lastError = "";

  for (const target of MIRRORS) {
    try {
      console.log("Probando:", target);
      const r = await fetch(target, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": "https://la12hd.com/",
          "Accept": "text/html"
        },
        timeout: 8000
      });
      const text = await r.text();
      
      // Si es el 404 feo, lo saltamos
      if (text.includes("does not exist") || text.includes("404") && text.length < 2000) {
        lastError = target + " -> 404";
        continue;
      }
      
      if (r.ok && text.includes("bitmovinplayer")) {
        html = text;
        console.log("Funciono con:", target);
        break;
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  if (!html) {
    return res.status(404).send(`<h1>Todos los espejos caidos</h1><p>Ultimo error: ${lastError}</p><p>Busca el nuevo dominio de tvla1es en Google y agregalo a MIRRORS</p>`);
  }

  // Limpieza de popups y del detector de sandbox
  html = html
    .replace(/<script src="https:\/\/arisefeistyleery\.com[^>]*><\/script>/gi, "")
    .replace(/<script[^>]*llvpn\.com[^>]*>.*?<\/script>/gis, "")
    .replace(/<script[^>]*histats\.com[^>]*>.*?<\/script>/gis, "")
    .replace(/<script[^>]*cloudflareinsights\.com[^>]*>.*?<\/script>/gis, "")
    .replace(/!function\(\)\{try\{var t=\["sandbox".*?e\(\)\}catch\(n\)\{\}\}\(\);/gis, "");

  res.set('Content-Type', 'text/html');
  res.set('Access-Control-Allow-Origin', '*');
  res.send(html);
});

app.listen(PORT, () => console.log("Proxy listo en " + PORT));
