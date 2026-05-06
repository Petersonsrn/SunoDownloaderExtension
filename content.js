let globalSongsMap = new Map();

function extractSongs() {
  // 1. Tenta achar os links exatos das músicas na tela
  const songLinks = document.querySelectorAll('a[href*="/song/"]');
  songLinks.forEach(link => {
    const match = link.href.match(/\/song\/([a-f0-9\-]{36})/i);
    if (match) {
      const id = match[1];
      const title = link.textContent.trim() || `Suno Track ${id.substring(0,8)}`;
      const url = `https://cdn1.suno.ai/${id}.mp3`;
      if (title.length > 2 && !title.includes("suno.com")) {
        globalSongsMap.set(url, title);
      }
    }
  });

  // Se não achou os links diretos, tenta pegar do JSON no meio da página
  const htmlCode = document.documentElement.innerHTML;
  
  const regexAudioUrl = /"title":"([^"]+)".*?"audio_url":"(https:\/\/[^"]+)"/g;
  let match;
  while ((match = regexAudioUrl.exec(htmlCode)) !== null) {
    let title = match[1];
    let url = match[2];
    if (url.length > 10 && !globalSongsMap.has(url)) {
      globalSongsMap.set(url, title);
    }
  }

  const regexAudioUrl2 = /"audio_url":"(https:\/\/[^"]+)".*?"title":"([^"]+)"/g;
  while ((match = regexAudioUrl2.exec(htmlCode)) !== null) {
    let url = match[1];
    let title = match[2];
    if (url.length > 10 && !globalSongsMap.has(url)) {
      globalSongsMap.set(url, title);
    }
  }

  // Pegar qualquer outro UUID que tenha sobrado na página (Fallback final)
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const allUuids = [...new Set(htmlCode.match(uuidRegex) || [])];
  
  allUuids.forEach(id => {
    if(window.location.href.includes(id)) return;
    let url = `https://cdn1.suno.ai/${id}.mp3`;
    if (!globalSongsMap.has(url)) {
      globalSongsMap.set(url, `Suno Track - ${id.substring(0, 8)}`);
    }
  });
}

// Escaneia a página automaticamente a cada MEIO segundo (500ms)!
// Isso garante que se o usuário rolar a tela super rápido, a extensão não perde nenhuma música!
setInterval(extractSongs, 500);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scan_songs") {
    // Dá uma última escaneada pra garantir
    extractSongs();
    
    let finalSongs = [];
    globalSongsMap.forEach((title, url) => {
      if(url && url !== "null" && url !== "undefined") {
        finalSongs.push({ url: url, title: title });
      }
    });
    
    sendResponse({ songs: finalSongs });
  }
});
