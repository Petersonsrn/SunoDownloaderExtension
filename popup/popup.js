let currentSongs = [];

function getFormattedUrl(url, format) {
    if (!url) return url;
    let urlParts = url.split('?');
    let baseUrl = urlParts[0].replace(/\.(mp3|m4a|wav)$/i, '');
    baseUrl += '.' + format;
    return urlParts.length > 1 ? baseUrl + '?' + urlParts[1] : baseUrl;
}

document.querySelectorAll('input[name="format"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if (currentSongs.length > 0) {
            renderSongs(currentSongs);
        }
    });
});

document.getElementById('scanBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Procurando músicas...';
  
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes("suno.com") && !tab.url.includes("suno.ai")) {
    statusEl.textContent = 'Erro: Você não está no site do Suno!';
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: "scan_songs" }, (response) => {
    if (chrome.runtime.lastError) {
      statusEl.textContent = 'Erro de conexão. Recarregue a página (F5).';
      return;
    }

    if (response && response.songs && response.songs.length > 0) {
      // Vamos ACUMULAR as músicas (caso o usuário role a página e aperte Escanear de novo)
      let seen = new Set(currentSongs.map(s => s.url));
      let newSongs = response.songs.filter(song => {
        let duplicate = seen.has(song.url);
        if (!duplicate) seen.add(song.url);
        return !duplicate;
      });
      
      currentSongs = currentSongs.concat(newSongs);

      statusEl.textContent = `Encontradas ${currentSongs.length} música(s)!`;
      document.getElementById('downloadAllBtn').style.display = 'block';
      renderSongs(currentSongs);
    } else {
      statusEl.textContent = 'Nenhuma música encontrada.';
      document.getElementById('downloadAllBtn').style.display = 'none';
    }
  });
});

document.getElementById('clearBtn').addEventListener('click', () => {
  chrome.storage.local.remove('historicoSuno', () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Memória zerada! Todas as músicas voltaram a ser INÉDITAS.';
    if (currentSongs.length > 0) {
      renderSongs(currentSongs);
    }
  });
});

document.getElementById('downloadAllBtn').addEventListener('click', () => {
  if(currentSongs.length === 0) return;
  
  chrome.storage.local.get(['historicoSuno'], (result) => {
      let historico = result.historicoSuno || [];
      
      let format = document.querySelector('input[name="format"]:checked').value;
      
      // Filtra APENAS as músicas que NÃO estão no histórico
      let unDownloadedSongs = currentSongs.filter(song => {
          let newUrl = getFormattedUrl(song.url, format);
          return !historico.includes(song.url) && !historico.includes(newUrl);
      });
      
      if (unDownloadedSongs.length === 0) return;
      
      const statusEl = document.getElementById('status');
      statusEl.textContent = `Enviando ${unDownloadedSongs.length} inéditas para o robô... Pode fechar!`;
      
      let songsToDownload = unDownloadedSongs.map((song, index) => {
          let cleanName = song.title.replace(/[^a-zA-Z0-9 ]/g, "").trim() || `Suno Track ${index}`;
          let paddedIndex = String(index + 1).padStart(2, '0');
          let newUrl = getFormattedUrl(song.url, format);
          return {
              url: newUrl,
              filename: `${paddedIndex} - ${cleanName}.${format}`
          };
      });
    
      chrome.runtime.sendMessage({
        action: "download_all",
        songs: songsToDownload
      });
      
      // Atualiza os botões visuais para "Na fila..." apenas nas que não foram baixadas
      currentSongs.forEach((song, index) => {
          let newUrl = getFormattedUrl(song.url, format);
          if (!historico.includes(song.url) && !historico.includes(newUrl)) {
              const btn = document.getElementById(`btn-${index}`);
              if(btn) {
                btn.textContent = 'Na fila...';
                btn.disabled = true;
              }
          }
      });
  });
});

function renderSongs(songs) {
  chrome.storage.local.get(['historicoSuno'], (result) => {
    let historico = result.historicoSuno || [];
    
    const list = document.getElementById('songList');
    list.innerHTML = '';
    
    let ineditasCount = 0;
    
    songs.forEach((song, index) => {
      const item = document.createElement('div');
      item.className = 'song-item';
      
      const title = document.createElement('div');
      title.className = 'song-title';
      title.textContent = song.title;
      title.title = song.title;
  
      const btn = document.createElement('button');
      btn.id = `btn-${index}`;
      btn.className = 'dl-btn';
      
      let format = document.querySelector('input[name="format"]:checked').value;
      let newUrl = getFormattedUrl(song.url, format);

      // Verifica se a música já existe no histórico
      if (historico.includes(song.url) || historico.includes(newUrl)) {
          btn.textContent = 'Já Baixado';
          btn.style.backgroundColor = '#555555';
          btn.style.color = '#aaaaaa';
          btn.disabled = true;
          item.style.opacity = '0.5'; // Deixa o item inteiro meio apagado
      } else {
          btn.textContent = 'Baixar';
          ineditasCount++; // Conta quantas são realmente inéditas
          btn.onclick = () => {
            let cleanName = song.title.replace(/[^a-zA-Z0-9 ]/g, "").trim() || `Suno Track ${index}`;
            let paddedIndex = String(index + 1).padStart(2, '0');
            
            chrome.runtime.sendMessage({
              action: "download_song",
              url: newUrl,
              filename: `${paddedIndex} - ${cleanName}.${format}`
            });
            btn.textContent = 'Na fila...';
            btn.disabled = true;
          };
      }
  
      item.appendChild(title);
      item.appendChild(btn);
      list.appendChild(item);
    });
    
    // Atualiza o botão vermelho principal para mostrar só as inéditas
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // Mostra o botão de limpar memória se tiver músicas
    if (songs.length > 0) {
        clearBtn.style.display = 'block';
    }
    
    if (ineditasCount > 0) {
        downloadAllBtn.textContent = `Baixar ${ineditasCount} INÉDITAS!`;
        downloadAllBtn.style.display = 'block';
    } else {
        downloadAllBtn.style.display = 'none';
    }
    
    const statusEl = document.getElementById('status');
    statusEl.textContent = `Listadas: ${songs.length} | Novas: ${ineditasCount}`;
  });
}
