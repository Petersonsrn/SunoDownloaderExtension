function startDownload(url, filename) {
    chrome.storage.local.get(['historicoSuno'], (result) => {
        let historico = result.historicoSuno || [];
        
        // Se a música já estiver no banco de dados da extensão, ela PULA e não baixa de novo!
        if (historico.includes(url)) {
            console.log("Música repetida ignorada! Já foi baixada antes:", filename);
            return;
        }

        // Faz uma verificação rápida do arquivo antes de iniciar o download
        fetch(url, { method: 'HEAD' })
          .then(response => {
            const contentType = response.headers.get('content-type') || '';
            
            // Se a resposta for um arquivo XML (erro de servidor) ou der erro 403, ELE IGNORA!
            if (response.ok && !contentType.includes('xml') && !contentType.includes('html')) {
                // Só baixa se for realmente uma música válida
                chrome.downloads.download({
                  url: url,
                  filename: `Suno_Musicas/${filename}`, 
                  saveAs: false 
                }, (downloadId) => {
                  if (chrome.runtime.lastError) {
                      console.error("Erro no download:", chrome.runtime.lastError);
                  } else {
                      // Baixou com sucesso? Salva no banco de dados para nunca mais baixar!
                      historico.push(url);
                      // Mantém as últimas 2000 músicas na memória para não pesar o PC
                      if (historico.length > 2000) historico = historico.slice(-2000);
                      chrome.storage.local.set({ 'historicoSuno': historico });
                  }
                });
            } else {
                console.log("Bloqueado XML:", url);
            }
          })
          .catch(err => console.error("Erro ao verificar a música:", err));
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_song") {
    startDownload(request.url, request.filename);
  } else if (request.action === "download_all") {
    // Roda os downloads direto no Background (assim se a janelinha fechar, o Chrome continua baixando!)
    request.songs.forEach((song, index) => {
        setTimeout(() => {
            startDownload(song.url, song.filename);
        }, index * 150); // Acelerado para 150ms (termina as 50 em 7 segundos, evitando que o Chrome durma!)
    });
  }
});
