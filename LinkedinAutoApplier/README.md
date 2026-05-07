# LinkedIn Auto Applier Pro 🚀

> Uma extensão inteligente do Chrome projetada para varrer automaticamente a página de vagas do LinkedIn, comparar descrições de vagas com as palavras-chave do seu currículo e iniciar o processo de *Candidatura Simplificada* (Easy Apply) para as vagas compatíveis.

## 🛠️ Tecnologias Utilizadas
- **Manifest V3**
- **Vanilla JavaScript** (Sem frameworks pesados)
- **HTML/CSS** para a interface do Popup

## 📂 Estrutura do Projeto

```
/
├── src/                # Scripts principais
│   ├── background.js   # Service Worker (Background tasks)
│   └── content.js      # Script de injeção de DOM no LinkedIn
├── popup/              # Interface Gráfica
│   ├── popup.html      # UI (Design focado na identidade do LinkedIn)
│   └── popup.js        # Lógica de interface e captura de palavras-chave
└── manifest.json       # Configuração da extensão
```

## 🚀 Próximos Passos (Fase de Desenvolvimento)
- [ ] Mapear as classes dinâmicas do LinkedIn (Lista de vagas, Título, Descrição).
- [ ] Criar o algoritmo de "Match" de palavras-chave.
- [ ] Implementar a automação de clique no botão "Candidatura Simplificada".
- [ ] Automatizar o preenchimento/clique de envio nos modais do LinkedIn.
