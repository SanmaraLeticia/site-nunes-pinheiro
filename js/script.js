/* ==============================================================
   SCRIPT DO SITE — NUNES & PINHEIRO ADVOGADOS
   ==============================================================

   O QUE É ESTE ARQUIVO?
   É o JavaScript: a parte que faz o site REAGIR. O HTML é o
   esqueleto, o CSS é a roupa e o JavaScript é o movimento.
   Aqui ele faz 6 coisas:
     • monta os links do WhatsApp com o número do escritório;
     • escurece o cabeçalho quando a página rola;
     • fecha o menu do celular depois que um link é tocado;
     • faz os blocos aparecerem suavemente ao rolar;
     • faz os números "contarem" de 0 até o valor;
     • escreve o ano atual no rodapé.

   IMPORTANTE PARA O TCC
   A responsividade do site (adaptar ao tamanho da tela) é feita
   pelo HTML (classes do Bootstrap) e pelo CSS (media queries).
   O JavaScript NÃO é usado para isso. A única parte ligada ao
   celular é o item 4 (menu do celular), marcada com [RESPONSIVO].

   PALAVRAS QUE APARECEM MUITO
   const      → cria uma "caixinha" com um nome para guardar um
                valor que não muda. Ex.: const nome = 'Ana';
   function   → um bloco de instruções com um nome. Só roda
                quando é "chamado": nomeDaFuncao();
   document   → a página inteira (o HTML que está aberto).
   document.querySelector('.classe')
              → procura na página o PRIMEIRO elemento com aquela classe.
   document.querySelectorAll('.classe')
              → procura TODOS os elementos com aquela classe.
   addEventListener('evento', função)
              → "quando acontecer tal coisa (clique, rolagem...),
                rode esta função".
   classList.add('x') / classList.remove('x')
              → coloca / tira uma classe do elemento. O CSS então
                muda o visual, porque tem regras para aquela classe.
   if (condição) { ... }
              → "se a condição for verdadeira, faça isto".
   // texto   → comentário de uma linha (o navegador ignora).

   ÍNDICE
     1. Configurações (número do WhatsApp)  ← mude aqui
     2. Links do WhatsApp
     3. Cabeçalho que escurece ao rolar
     4. Menu do celular                     [RESPONSIVO]
     5. Blocos que aparecem ao rolar
     6. Números que contam
     7. Ano atual no rodapé
     8. Início: liga tudo
   ============================================================== */


/* ==============================================================
   1. CONFIGURAÇÕES
   ============================================================== */

// CONFIG é um "objeto": uma caixinha com várias informações,
// cada uma com um nome (whatsapp, mensagemPadrao).
const CONFIG = {
  // Número com 55 (Brasil) + DDD + número. Só algarismos, sem espaço.
  whatsapp: '5569993799550',

  // Texto que já aparece escrito quando a pessoa abre o WhatsApp
  mensagemPadrao: 'Olá! Vim pelo site e gostaria de falar sobre o meu caso.',
};

// Pergunta ao sistema se a pessoa pediu para "reduzir movimento"
// (opção de acessibilidade do celular/computador).
// O resultado é true (sim) ou false (não).
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ==============================================================
   2. LINKS DO WHATSAPP
   --------------------------------------------------------------
   No HTML, todo botão de WhatsApp tem o atributo data-whatsapp.
   Esta parte procura todos eles e coloca o endereço do WhatsApp
   com o número do CONFIG. Assim o número fica escrito num lugar só.

     <a data-whatsapp>             → usa a mensagem padrão
     <a data-whatsapp="Olá, ...">  → usa a mensagem escrita ali
   ============================================================== */

// Recebe uma mensagem e devolve o endereço completo do WhatsApp.
// encodeURIComponent troca espaços e acentos por códigos que um
// endereço de internet aceita (ex.: espaço vira %20).
// O texto entre crases `...` permite misturar texto com ${variáveis}.
function montarLinkWhatsApp(mensagem) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

function configurarLinksWhatsApp() {
  // Todos os elementos que têm o atributo data-whatsapp
  const links = document.querySelectorAll('[data-whatsapp]');

  // forEach = "para cada um deles, faça..."
  links.forEach((link) => {
    // link.dataset.whatsapp lê o texto do atributo data-whatsapp.
    // O || significa "ou": se estiver vazio, usa a mensagem padrão.
    const mensagem = link.dataset.whatsapp || CONFIG.mensagemPadrao;

    link.href = montarLinkWhatsApp(mensagem); // o endereço do link
    link.target = '_blank';                   // abre em outra aba
    link.rel = 'noopener noreferrer';         // segurança ao abrir outra aba
  });
}


/* ==============================================================
   3. CABEÇALHO QUE ESCURECE AO ROLAR
   --------------------------------------------------------------
   No topo da página o cabeçalho é transparente (aparece a foto
   de fundo). Depois que a pessoa rola 40px, ele ganha fundo
   escuro, para o menu continuar legível sobre o resto do site.
   ============================================================== */
function configurarCabecalho() {
  const cabecalho = document.querySelector('.cabecalho');
  if (!cabecalho) return; // se não achar o cabeçalho, para aqui

  function atualizar() {
    // window.scrollY = quantos pixels a página já rolou.
    // classList.toggle(classe, condição):
    //   condição verdadeira → coloca a classe
    //   condição falsa      → tira a classe
    cabecalho.classList.toggle('cabecalho--rolado', window.scrollY > 40);
  }

  atualizar(); // confere logo ao abrir (a página pode abrir já rolada)

  // Toda vez que a página rolar, roda atualizar().
  // passive: true avisa ao navegador que não vamos travar a rolagem
  // (deixa a rolagem mais suave, principalmente no celular).
  window.addEventListener('scroll', atualizar, { passive: true });
}


/* ==============================================================
   4. MENU DO CELULAR                                 [RESPONSIVO]
   --------------------------------------------------------------
   Abaixo de 992px o menu fica escondido atrás do botão ☰.
   Quem abre e fecha o menu é o próprio Bootstrap. Aqui só
   melhoramos duas coisas:
     a) enquanto o menu está aberto, o cabeçalho ganha fundo
        escuro (senão os links ficariam sobre a foto);
     b) quando a pessoa toca num link, o menu fecha sozinho
        (senão ele ficaria aberto cobrindo a página).
   ============================================================== */
function configurarMenuCelular() {
  const menu = document.getElementById('menu-links');   // o menu (id="menu-links")
  const cabecalho = document.querySelector('.cabecalho');

  // Se o menu não existir ou o Bootstrap não tiver carregado, para aqui
  if (!menu || typeof bootstrap === 'undefined') return;

  // Pega o "controle remoto" que o Bootstrap usa para abrir/fechar o menu
  const collapse = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });

  // a) O Bootstrap avisa quando o menu começa a abrir (show.bs.collapse)
  //    e quando termina de fechar (hidden.bs.collapse).
  menu.addEventListener('show.bs.collapse', () => cabecalho.classList.add('cabecalho--aberto'));
  menu.addEventListener('hidden.bs.collapse', () => cabecalho.classList.remove('cabecalho--aberto'));

  // b) Para cada link do menu: ao ser clicado, se o menu estiver
  //    aberto (classe "show"), manda fechar.
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('show')) collapse.hide();
    });
  });
}


/* ==============================================================
   5. BLOCOS QUE APARECEM AO ROLAR
   --------------------------------------------------------------
   Os elementos com class="revelar" aparecem suavemente quando
   entram na tela. Quem percebe que eles entraram na tela é o
   IntersectionObserver (um "vigia" do navegador). Ele avisa,
   e nós colocamos a classe "visivel". A animação em si está no
   CSS (seção 7.2).
   ============================================================== */
function configurarRevelar() {
  const elementos = document.querySelectorAll('.revelar');

  // Se o navegador for muito antigo, ou se a pessoa pediu para
  // reduzir movimento: mostra tudo de uma vez, sem animação.
  if (!('IntersectionObserver' in window) || reduzirMovimento) {
    elementos.forEach((el) => el.classList.add('visivel'));
    return;
  }

  // Cria o vigia. A função dentro dele roda sempre que algum
  // elemento vigiado entra ou sai da tela.
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {                 // entrou na tela?
        entrada.target.classList.add('visivel');    // mostra
        observador.unobserve(entrada.target);       // para de vigiar (anima só uma vez)
      }
    });
  }, {
    threshold: 0.15,                 // considera "na tela" quando 15% do bloco aparece
    rootMargin: '0px 0px -40px 0px', // e só depois de passar 40px da borda de baixo
  });

  // Manda o vigia observar cada elemento
  elementos.forEach((el) => observador.observe(el));
}


/* ==============================================================
   6. NÚMEROS QUE CONTAM
   --------------------------------------------------------------
   No HTML: <span data-contador="600">600</span>
   Quando o número aparece na tela, ele conta de 0 até 600.
   ============================================================== */

// Faz um número contar de 0 até o valor do data-contador.
function contar(elemento) {
  const valorFinal = Number(elemento.dataset.contador); // transforma o texto "600" no número 600
  const duracao = 1600;                                 // 1600 milissegundos = 1,6 segundo
  const inicio = performance.now();                     // "que horas são" agora, em milissegundos

  // Esta função roda a cada quadro da tela (cerca de 60 vezes por segundo)
  function passo(agora) {
    // Quanto do tempo já passou: 0 = começo, 1 = fim
    const progresso = Math.min((agora - inicio) / duracao, 1);
    // Deixa a contagem rápida no início e lenta no fim
    const suavizado = 1 - Math.pow(1 - progresso, 3);
    // Escreve o número atual na tela (toLocaleString('pt-BR') coloca ponto no milhar: 1.300)
    elemento.textContent = Math.round(valorFinal * suavizado).toLocaleString('pt-BR');

    // Se ainda não terminou, pede para rodar de novo no próximo quadro
    if (progresso < 1) requestAnimationFrame(passo);
  }

  requestAnimationFrame(passo); // começa
}

function configurarContadores() {
  const contadores = document.querySelectorAll('[data-contador]');

  // Sem vigia ou com "reduzir movimento": deixa o número final parado
  if (!('IntersectionObserver' in window) || reduzirMovimento) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        contar(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.8 }); // só conta quando 80% do número estiver visível

  contadores.forEach((contador) => observador.observe(contador));
}


/* ==============================================================
   7. ANO ATUAL NO RODAPÉ
   --------------------------------------------------------------
   Escreve o ano de hoje no "© 2026" do rodapé. Assim ele muda
   sozinho em janeiro, sem ninguém precisar editar o site.
   ============================================================== */
function atualizarAno() {
  const ano = document.getElementById('ano-atual');
  if (ano) ano.textContent = new Date().getFullYear();
}


/* ==============================================================
   8. INÍCIO: LIGA TUDO
   --------------------------------------------------------------
   As funções acima só existem; ninguém mandou rodar ainda.
   iniciarSite() chama uma por uma.
   DOMContentLoaded = "o navegador terminou de ler o HTML".
   Só então é seguro procurar elementos na página.
   ============================================================== */
function iniciarSite() {
  configurarLinksWhatsApp();
  configurarCabecalho();
  configurarMenuCelular();
  configurarRevelar();
  configurarContadores();
  atualizarAno();
}

document.addEventListener('DOMContentLoaded', iniciarSite);
