# Suno Downloader Extension 🎵

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> Uma extensão de navegador para baixar suas músicas geradas no Suno de forma rápida e eficiente, garantindo que você tenha acesso offline às suas criações com a melhor qualidade.

## 🌟 Funcionalidades

- **Download Direto:** Baixa as músicas selecionadas no Suno.com em formato MP3 (e opções para WAV dependendo da configuração).
- **Interface Intuitiva:** Um popup limpo e focado no usuário, construído com foco em UX/UI.
- **Automação:** Identifica automaticamente os botões e links da página do Suno para extrair o áudio de forma silenciosa.
- **Controle de Progresso:** Feedback visual sobre o andamento dos downloads das músicas.

## 🚀 Como Instalar e Usar (Modo Desenvolvedor)

Como a extensão ainda está em desenvolvimento, você pode instalá-la localmente no seu Google Chrome:

1. Abra o navegador Google Chrome.
2. Digite `chrome://extensions/` na barra de endereços e pressione Enter.
3. No canto superior direito, ative a opção **"Modo do desenvolvedor"** (Developer mode).
4. Clique no botão **"Carregar sem compactação"** (Load unpacked) no canto superior esquerdo.
5. Selecione a pasta onde este repositório está salvo no seu computador.
6. Pronto! A extensão aparecerá na sua barra de extensões e está pronta para uso.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias web modernas:
- **JavaScript (ES6+)**: Lógica da extensão (background scripts, content scripts e popup).
- **HTML5 & CSS3**: Estrutura e estilização da interface da extensão, com foco em uma aparência profissional.
- **Chrome Extensions API**: Para integração profunda com o navegador (`chrome.downloads`, `chrome.scripting`, `chrome.tabs`, `chrome.storage`).

## 📁 Estrutura do Projeto

```
/
├── background.js       # Service worker responsável por gerenciar os downloads
├── content.js          # Script injetado na página do Suno para manipulação da DOM
├── manifest.json       # Arquivo de configuração principal da extensão (Manifest V3)
├── popup.html          # Interface gráfica principal da extensão
└── popup.js            # Lógica e interatividade do popup
```

## 🤝 Como Contribuir

Contribuições, problemas (issues) e pedidos de novas funcionalidades (feature requests) são muito bem-vindos!
Sinta-se à vontade para checar a página de [issues](../../issues) caso queira contribuir.

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/SuaFuncionalidade`)
3. Faça os Commits de suas alterações (`git commit -m 'feat: Adiciona uma nova funcionalidade incrível'`)
4. Faça o Push para a Branch (`git push origin feature/SuaFuncionalidade`)
5. Abra um Pull Request

## 📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---
*Desenvolvido com 💻 e ☕ por um programador focado em otimização.*
