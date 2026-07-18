import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  try {
    const target = "https://sudamericaplay.sbs/canal_8112/tvla1es.html";
    let html = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://sudamericaplay.sbs/",
        "Accept": "text/html"
      }
    }).then(r => r.text());

    // LIMPIEZA: quitamos popups y el detector de sandbox que te manda al 404
    html = html
      .replace(/<script src="https:\/\/arisefeistyleery\.com[^>]*><\/script>/gi, "")
      .replace(/<script[^>]*llvpn\.com[^>]*>.*?<\/script>/gis, "")
      .replace(/<script[^>]*histats\.com[^>]*>.*?<\/script>/gis, "")
      .replace(/<script[^>]*cloudflareinsights\.com[^>]*>.*?<\/script>/gis, "")
      // Este es el que detecta el sandbox y te manda a /block.html
      .replace(/!function\(\)\{try\{var t=\["sandbox".*?e\(\)\}catch\(n\)\{\}\}\(\);/gis, "<script>console.log('anti-sandbox removido')</script>");

    res.set('Content-Type', 'text/html');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(html);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

app.listen(PORT, () => console.log("Proxy listo en puerto " + PORT));
