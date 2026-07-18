import express from 'express';
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<style>body{margin:0;background:#000;overflow:hidden} #player{width:100vw;height:100vh}</style>
<script>
// 1. Mata popups antes de que carguen
window.open = function(){ return null; };
Window.prototype.open = function(){ return null; };
// 2. Mata los scripts de publicidad antes de que se creen
const _create = Document.prototype.createElement;
Document.prototype.createElement = function(tag){
  const el = _create.call(this, tag);
  if(tag.toLowerCase() === 'script'){
    const _set = el.setAttribute.bind(el);
    el.setAttribute = function(k,v){
      if(k==='src' && (v.includes('arisefeistyleery') || v.includes('llvpn') || v.includes('histats') || v.includes('cloudflareinsights'))){
        console.log('Popup bloqueado:', v);
        return;
      }
      _set(k,v);
    }
  }
  return el;
}
</script>
</head>
<body>
<div id="cont">Cargando La 1...</div>
<script>
(async()=>{
  const target = "https://capo8play.com/capo.php?player=desktop&live=mltv";
  // Usamos un cors proxy que no esta bloqueado, solo para traer el html
  const proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(target);
  try{
    let html = await fetch(proxy).then(r=>r.text());
    // Limpieza final
    html = html.replace(/<script src="https:\\/\\/arisefeistyleery\\.com[^>]*><\\/script>/gi,"")
               .replace(/llvpn\\.com\\/tag\\.min\\.js/gi,"")
               .replace(/!function\\(\\)\\{try\\{var t=\\["sandbox".*?e\\(\\)\\}catch\\(n\\)\\{\\}\\}\\(\);/gs,"");
    
    document.getElementById('cont').innerHTML = html;
    
    // Re-ejecutar los scripts del player (bitmovin)
    const scripts = document.getElementById('cont').querySelectorAll('script');
    scripts.forEach(old=>{
      if(old.src && old.src.includes('bitmovin')) return;
      if(!old.src){
        const s = document.createElement('script');
        s.textContent = old.textContent;
        document.body.appendChild(s);
      }
    });
  }catch(e){
    document.getElementById('cont').innerHTML = "Error cargando: " + e + "<br>Abriendo directo...<iframe src='"+target+"' style='width:100vw;height:100vh;border:0' allowfullscreen></iframe>";
  }
})();
</script>
</body>
</html>
  `);
});

app.listen(PORT, ()=>console.log("Listo en "+PORT));
