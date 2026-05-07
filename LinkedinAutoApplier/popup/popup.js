document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const keywordsInput = document.getElementById('keywords');
  const resumeNameInput = document.getElementById('resumeName');
  const statusDiv = document.getElementById('status');

  // Load saved keywords and resume name
  chrome.storage.local.get(['linkedin_keywords', 'linkedin_resume_name'], (result) => {
    if (result.linkedin_keywords) {
      keywordsInput.value = result.linkedin_keywords;
    }
    if (result.linkedin_resume_name) {
      resumeNameInput.value = result.linkedin_resume_name;
    }
  });

  startBtn.addEventListener('click', async () => {
    const keywords = keywordsInput.value.trim();
    const resumeName = resumeNameInput.value.trim();
    
    if (!keywords) {
      statusDiv.textContent = '⚠️ Por favor, insira algumas palavras-chave primeiro.';
      statusDiv.style.color = '#d93025';
      return;
    }

    // Save keywords and resume name
    chrome.storage.local.set({ 
      linkedin_keywords: keywords,
      linkedin_resume_name: resumeName
    });

    statusDiv.textContent = '🚀 Iniciando busca de vagas...';
    statusDiv.style.color = '#0a66c2';

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && (tab.url.includes('linkedin.com/jobs/search') || tab.url.includes('linkedin.com/jobs/collections'))) {
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'START_AUTO_APPLY',
        keywords: keywords.split(',').map(k => k.trim().toLowerCase()),
        resumeName: resumeName
      });
    } else {
      statusDiv.textContent = '⚠️ Abra a página de busca ou coleções de vagas do LinkedIn primeiro!';
      statusDiv.style.color = '#d93025';
    }
  });
});
