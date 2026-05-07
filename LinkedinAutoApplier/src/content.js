// Content script injected into LinkedIn Jobs page

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Banco de Dados da Inteligência Artificial (Melhores Respostas do Mercado)
const SmartAnswersDB = [
  // Vistos e Autorizações
  { keywords: ['sponsor', 'visto', 'patrocínio', 'visa'], answer: 'não' },
  { keywords: ['authorized', 'autorizado', 'legalmente', 'legally', 'work in'], answer: 'sim' },
  
  // Educação e Formação
  { keywords: ['bachelor', 'bacharel', 'graduação', 'degree', 'formado', 'diploma'], answer: 'sim' },
  
  // Idiomas
  { keywords: ['english', 'inglês', 'idioma', 'language'], answer: 'fluente' }, 
  { keywords: ['espanhol', 'spanish'], answer: 'avançado' },
  
  // Salário (Algumas vagas exigem decimal explicitly, como 18000.0)
  { keywords: ['salári', 'pretensão', 'salary', 'compensation'], answer: '18000.0' },
  
  // Modelos de contratação e Tecnologias que não domino
  { keywords: ['pj', 'clt', 'modelo', 'contratação'], answer: 'sim' },
  { keywords: ['abap', 's/4hana', 'sap'], answer: 'não' },
  
  // Tempo e Disponibilidade
  { keywords: ['disponibilidade', 'notice period', 'início', 'começar'], answer: 'Imediato' },
  
  // Experiência (Anos - Ajustado para IT Manager)
  { keywords: ['anos', 'years', 'experiência', 'experience'], answer: '10.0' },
  
  // Questões EEO (Igualdade)
  { keywords: ['deficiência', 'disability', 'veteran', 'veterano'], answer: 'não' },
];

function getBestAnswerFromDB(labelText) {
  for (let entry of SmartAnswersDB) {
    if (entry.keywords.some(kw => labelText.includes(kw))) {
      return entry.answer;
    }
  }
  return null;
}

// Hack para contornar o React do LinkedIn e forçar ele a reconhecer que o campo foi preenchido
function setReactInputValue(element, value) {
  element.focus && element.focus();
  element.dispatchEvent(new Event('focus', { bubbles: true }));
  
  // Define o valor visualmente antes do hack do React
  element.value = value;
  
  const isSelect = element.tagName === 'SELECT';
  const proto = isSelect ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) {
    setter.call(element, value);
  }
  
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

// Preenche os formulários extras usando o Banco de Dados
function fillAdditionalQuestions() {
  console.log("🧠 IA Consultando Banco de Dados de Perguntas...");
  
  const formGroups = document.querySelectorAll('.pb4, .jobs-easy-apply-form-section__item');
  
  formGroups.forEach(group => {
    const label = group.querySelector('label, span[aria-hidden="true"]');
    const labelText = label ? label.innerText.toLowerCase() : '';
    if (!labelText) return;

    const bestAnswer = getBestAnswerFromDB(labelText);

    // 1. Campos de Texto ou Número
    const input = group.querySelector('input[type="text"], input[type="number"]');
    if (input && !input.value) {
      const valueToInject = bestAnswer ? bestAnswer : '10.0'; // Fallback forte com decimal
      setReactInputValue(input, valueToInject);
    }

    // 2. Caixas de Seleção Nativas (Dropdowns)
    const select = group.querySelector('select');
    if (select && (!select.value || select.value.includes('Selecione'))) {
      const options = Array.from(select.options);
      
      let targetOption = null;
      if (bestAnswer) {
        targetOption = options.find(opt => {
          const text = opt.text.toLowerCase();
          const ans = bestAnswer.toLowerCase();
          if (ans === 'não' && (text.includes('não') || text.includes('no') || text.includes('nao'))) return true;
          if (ans === 'sim' && (text.includes('sim') || text.includes('yes'))) return true;
          return text.includes(ans);
        });
      }
      
      if (!targetOption) {
        targetOption = options.find(opt => opt.text.toLowerCase().includes('sim') || opt.text.toLowerCase().includes('yes'));
      }

      if (targetOption) {
        setReactInputValue(select, targetOption.value);
      } else if (options.length > 1) {
        setReactInputValue(select, options[1].value);
      }
    }

    // 3. Botões de Rádio (Múltipla escolha)
    const radios = Array.from(group.querySelectorAll('input[type="radio"]'));
    if (radios.length > 0) {
      const isAnyChecked = radios.some(r => r.checked);
      if (!isAnyChecked) {
        let targetRadio = null;
        
        if (bestAnswer) {
          targetRadio = radios.find(r => {
            const rLabel = group.querySelector(`label[for="${r.id}"]`);
            return rLabel && rLabel.innerText.toLowerCase().includes(bestAnswer.toLowerCase());
          });
        }

        if (!targetRadio) {
          targetRadio = radios.find(r => {
            const rLabel = group.querySelector(`label[for="${r.id}"]`);
            return rLabel && (rLabel.innerText.toLowerCase().includes('sim') || rLabel.innerText.toLowerCase().includes('yes'));
          });
        }
        
        if (targetRadio) {
          targetRadio.click();
        } else {
          radios[0].click(); 
        }
      }
    }
  });
}

// Função inteligente para navegar no formulário do LinkedIn
async function handleEasyApplyModal(resumeName) {
  console.log("🤖 Robô assumindo o controle do formulário...");
  
  let maxAttempts = 10; // Evita loop infinito
  let attempt = 0;

  while (attempt < maxAttempts) {
    await sleep(2000); // Esperar animações do modal
    
    // Auto-preenchimento de Perguntas Adicionais
    fillAdditionalQuestions();
    
    // Se o usuário definiu um currículo específico, o robô tenta forçar a seleção dele
    if (resumeName) {
      const allElements = Array.from(document.querySelectorAll('span, h3, div'));
      const targetResumeText = allElements.find(el => el.innerText && el.innerText.trim() === resumeName);
      
      if (targetResumeText) {
        // Pega o container inteiro (que é o que a gente consegue clicar)
        const clickableContainer = targetResumeText.closest('label') || targetResumeText.closest('.jobs-document-upload-rs-item') || targetResumeText.closest('div');
        if (clickableContainer) {
          // Só clica se tiver um input desmarcado dentro (evita clicar e desmarcar)
          const radioBtn = clickableContainer.querySelector('input[type="radio"], input[type="checkbox"]');
          if (radioBtn && !radioBtn.checked) {
            console.log(`📄 Selecionando o currículo preferencial: ${resumeName}`);
            clickableContainer.click();
            await sleep(500); 
          }
        }
      }
    }

    // Captura os botões primários do modal
    const buttons = Array.from(document.querySelectorAll('.artdeco-modal__actionbar button, .artdeco-modal button.artdeco-button--primary'));
    
    const nextBtn = buttons.find(b => b.innerText.includes('Avançar') || b.innerText.includes('Next'));
    const reviewBtn = buttons.find(b => b.innerText.includes('Revisar') || b.innerText.includes('Review'));
    const submitBtn = buttons.find(b => b.innerText.includes('Enviar candidatura') || b.innerText.includes('Submit'));
    
    if (submitBtn) {
      console.log("🚀 Botão FINAL encontrado! Enviando currículo...");
      submitBtn.click();
      
      // Espera enviar e procura o botão de fechar/concluído da tela de sucesso
      await sleep(3000);
      const doneBtns = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Concluído') || b.innerText.includes('Done'));
      if(doneBtns) doneBtns.click();
      
      const dismissBtn = document.querySelector('.artdeco-modal__dismiss');
      if(dismissBtn) dismissBtn.click();

      return "APPLIED";
    }

    if (reviewBtn) {
      console.log("⏩ Página de Revisão. Clicando em Revisar...");
      reviewBtn.click();
      attempt++;
      continue;
    }

    if (nextBtn) {
      console.log("⏩ Clicando em Avançar...");
      nextBtn.click();
      attempt++;
      continue;
    }

    // Verifica se há campos obrigatórios vazios que travaram o clique no "Avançar"
    const errorMsg = document.querySelector('.artdeco-inline-feedback--error');
    if (errorMsg) {
      console.warn("⚠️ O LinkedIn bloqueou o robô com uma pergunta nativa muito complexa. Pausando para intervenção humana.");
      return "MANUAL";
    }

    // Se não achou nenhum botão, quebra o loop
    break;
  }
  return "UNKNOWN";
}

async function startAutoApplier(keywords, resumeName) {
  console.log("🚀 Iniciando LinkedIn Auto Applier com as palavras:", keywords);
  if (resumeName) console.log("📄 Tentando usar o currículo:", resumeName);
  
  const jobCards = document.querySelectorAll('.job-card-container');
  
  if (jobCards.length === 0) {
    alert("Nenhuma vaga encontrada na tela. Certifique-se de estar na lista de vagas e role a página para carregar os itens.");
    return;
  }

  console.log(`Encontradas ${jobCards.length} vagas. Analisando...`);

  for (let i = 0; i < jobCards.length; i++) {
    const card = jobCards[i];
    
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.click();
    await sleep(2500); 

    const jobDescriptionElement = document.querySelector('.jobs-description-content__text, #job-details');
    if (!jobDescriptionElement) continue;

    const jobDescriptionText = jobDescriptionElement.innerText.toLowerCase();
    const hasMatch = keywords.some(keyword => jobDescriptionText.includes(keyword));

    if (hasMatch) {
      console.log(`✅ MATCH ENCONTRADO na vaga ${i + 1}!`);
      card.style.border = "3px solid #1db954"; 

      const applyButtons = Array.from(document.querySelectorAll('button'));
      const easyApplyBtn = applyButtons.find(btn => 
        btn.innerText.includes('Candidatura simplificada') || 
        btn.innerText.includes('Easy Apply')
      );

      if (easyApplyBtn) {
        console.log("👉 Iniciando Candidatura Simplificada...");
        easyApplyBtn.click();
        
        // Agora o robô tenta preencher o formulário sozinho
        const status = await handleEasyApplyModal(resumeName);
        
        if (status === "MANUAL") {
          alert("O LinkedIn fez uma pergunta específica na vaga que o robô não sabe responder.\n\nPreencha essa etapa manualmente, envie a vaga e depois inicie o robô novamente!");
          break; // Para o loop para o usuário responder
        } else if (status === "APPLIED") {
          console.log("🎉 Vaga aplicada com sucesso! Indo para a próxima em 3 segundos...");
          card.style.background = "rgba(29, 185, 84, 0.1)"; // Pinta o fundo de verdinho
          await sleep(3000); // Tempo para o modal sumir totalmente
        }
      } else {
        console.log("❌ Aplicação externa. Pulando...");
        card.style.border = "3px solid #ff4757"; 
      }
    } else {
      card.style.border = "3px solid #555"; 
    }

    await sleep(1500);
  }
  
  console.log("🏁 Varredura concluída desta página!");
  
  // Procurar o botão de Próxima Página (Avançar)
  // O LinkedIn usa aria-label="Avançar" ou "Next" ou classes específicas para a paginação
  const nextPageBtn = document.querySelector('button[aria-label="Avançar"], button[aria-label="Next"], button.artdeco-pagination__button--next');
  
  if (nextPageBtn && !nextPageBtn.disabled) {
    console.log("➡️ Indo para a próxima página de vagas...");
    nextPageBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(1000);
    nextPageBtn.click();
    
    // Esperar a nova página carregar na tela e reiniciar o ciclo infinitamente
    console.log("⏳ Aguardando nova página carregar...");
    await sleep(4000); 
    
    startAutoApplier(keywords, resumeName);
  } else {
    console.log("🛑 Fim da linha. Não há mais páginas de vagas para avançar.");
    alert("🎉 Varredura total concluída! O robô chegou ao fim de todas as páginas possíveis de vagas.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_AUTO_APPLY') {
    startAutoApplier(request.keywords, request.resumeName);
  }
});
