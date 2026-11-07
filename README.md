# Nunes & Pinheiro Advogados - site institucional responsivo

Site de página única do escritório Nunes & Pinheiro Advogados, de Porto Velho/RO, construído para funcionar bem em qualquer tamanho de tela, do celular dobrável ao monitor 2K.

**Site no ar:** https://sanmaraleticia.github.io/site-nunes-pinheiro/

O projeto faz parte do Trabalho de Conclusão de Curso *Design responsivo na prática: desenvolvimento e avaliação de um site institucional para escritório de advocacia*, do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas do IFRO, Campus Porto Velho Calama.

- **Autora:** Sanmara Letícia Nunes de Souza
- **Orientação:** Leandro Ferrarezi Valiante

## Tecnologias

- HTML5, CSS3 e JavaScript
- [Bootstrap 5.3.3](https://getbootstrap.com/) e [Bootstrap Icons 1.11.3](https://icons.getbootstrap.com/), carregados por CDN com verificação de integridade (`integrity`)
- Google Fonts: Cormorant Garamond e Manrope
- Google Maps incorporado na seção de contato
- [Playwright](https://playwright.dev/) (Python) nos testes de responsividade

## Responsividade

| Recurso | Como foi feito |
|---|---|
| CSS *mobile first* | Regras do celular primeiro; ajustes com `@media (min-width: 576px / 768px / 992px)` |
| *Grid* | Colunas do Bootstrap (`col-md-6 col-lg-4`, `col-6 col-lg-3`...) |
| Menu | `navbar-expand-lg`: botão ☰ abaixo de 992 px, *links* em linha a partir daí |
| Tipografia e espaços fluidos | `clamp()` em títulos e espaçamentos das seções |
| Imagens responsivas | Duas larguras de cada foto, com `srcset` e `sizes`; `loading="lazy"` abaixo da primeira tela |
| Fundo do topo | Versão de 800 px no celular e de 1600 px a partir de 768 px |
| Alvos de toque | Altura mínima de 44 px (`--alvo-toque: 2.75rem`) |
| Celular na horizontal | `@media (orientation: landscape) and (max-height: 500px)` reduz o cabeçalho fixo |
| Acessibilidade | *Link* "Pular para o conteúdo", `prefers-reduced-motion`, ícones decorativos com `aria-hidden` e `aria-label` no botão flutuante do WhatsApp |

No código, todos os pontos de responsividade estão marcados com `[RESPONSIVO]` (use Ctrl+F).

## Estrutura de pastas

```
site-nunes-pinheiro/
├── index.html          estrutura e textos da página (12 seções numeradas)
├── css/
│   └── style.css       visual; a parte 8 reúne as media queries
├── js/
│   └── script.js       WhatsApp, menu do celular, cabeçalho, animações
├── img/                logotipo, ícones e fotos em duas larguras
└── testes/
    ├── auditoria.py    teste automático dos 5 critérios em 16 telas
    ├── README.md       como rodar os testes
    └── versao-antes/   o site antes dos ajustes, para comparação
```

O número no nome de cada foto é a largura dela em *pixels* (`foto-topo-600.jpg`, `foto-topo-1000.jpg`). O navegador escolhe sozinho a menor versão que fica nítida na tela do aparelho.

## Como abrir no computador

Baixe o projeto (botão **Code → Download ZIP**), descompacte e dê dois cliques em `index.html`. É preciso internet, porque o Bootstrap, os ícones, as fontes e o mapa vêm de servidores externos.

No VS Code, a extensão **Live Server** abre o site e recarrega a página sempre que um arquivo é salvo.

## Testes

A pasta [`testes`](testes/) tem o programa que mede a responsividade do site em 16 tamanhos de tela: rolagem horizontal, menor texto, alvos de toque, altura do cabeçalho e volume de imagens. Ele funciona tanto com os arquivos do computador quanto com o site publicado. O passo a passo está em [`testes/README.md`](testes/README.md).

A versão de antes dos ajustes também está publicada, para comparação: https://sanmaraleticia.github.io/site-nunes-pinheiro/testes/versao-antes/

## Manutenção

| Quero mudar... | Onde |
|---|---|
| Textos | `index.html` (cada seção tem um comentário numerado) |
| Número do WhatsApp | `js/script.js`, objeto `CONFIG` |
| Cores e fontes | `css/style.css`, parte 1 (variáveis) |
| Como o site muda em cada tela | `css/style.css`, parte 8, e as classes `col-*` do `index.html` |
| Local do mapa | `index.html`, seção 10 (instruções no comentário) |

Para trocar uma foto, prepare a imagem nova em duas larguras (600 e 1200 px; no topo, 600 e 1000 px), salve com os mesmos nomes e, se a proporção mudar, ajuste `width` e `height` da tag `<img>`. O [Squoosh](https://squoosh.app/) redimensiona e comprime pelo navegador.

## Direitos

Os textos, as fotografias, o nome e o logotipo pertencem ao escritório Nunes & Pinheiro Advogados e são usados com autorização. Não reutilize esse conteúdo sem permissão do escritório.
