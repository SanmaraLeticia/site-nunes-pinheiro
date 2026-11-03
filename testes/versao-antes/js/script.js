/* ==============================================================
   SCRIPT DO SITE — ESCRITÓRIO DE ADVOCACIA
   --------------------------------------------------------------
   Cada recurso do site está em uma função separada.
   No final do arquivo, a função iniciarSite() chama todas elas.

   ÍNDICE
     1. Configurações (número do WhatsApp)  ← altere aqui
     2. Links do WhatsApp
     3. Cabeçalho que muda ao rolar
     4. Menu do celular
     5. Animação ao rolar a página
     6. Contadores de números
     7. Ano atual no rodapé
     8. Inicialização
   ============================================================== */


/* ==============================================================
   1. CONFIGURAÇÕES
   ============================================================== */
const CONFIG = {
  // Número com código do país (55) + DDD + número. Só dígitos.
  whatsapp: '5569993799550',

  // Mensagem que já vem escrita quando a pessoa clica num botão
  mensagemPadrao: 'Olá! Vim pelo site e gostaria de falar sobre o meu caso.',
};

// true quando o usuário pediu "reduzir movimento" no sistema
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ==============================================================
   2. LINKS DO WHATSAPP
   Todo elemento com o atributo data-whatsapp vira um link para
   o WhatsApp. Assim o número fica em UM lugar só (CONFIG acima).

   Exemplos no HTML:
     <a data-whatsapp>              → usa a mensagem padrão
     <a data-whatsapp="Olá, ...">   → usa a mensagem escrita ali
   ============================================================== */

/**
 * Monta o endereço do WhatsApp com a mensagem.
 * encodeURIComponent troca espaços e acentos por códigos que a URL aceita.
 * @param {string} mensagem
 * @returns {string} link https://wa.me/...
 */
function montarLinkWhatsApp(mensagem) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

function configurarLinksWhatsApp() {
  const links = document.querySelectorAll('[data-whatsapp]');

  links.forEach((link) => {
    // dataset.whatsapp lê o valor do atributo data-whatsapp
    const mensagem = link.dataset.whatsapp || CONFIG.mensagemPadrao;

    link.href = montarLinkWhatsApp(mensagem);
    link.target = '_blank';            // abre em nova aba
    link.rel = 'noopener noreferrer';  // segurança ao abrir nova aba
  });
}


/* ==============================================================
   3. CABEÇALHO QUE MUDA AO ROLAR
   Depois de rolar 40px, o cabeçalho ganha fundo escuro.
   ============================================================== */
function configurarCabecalho() {
  const cabecalho = document.querySelector('.cabecalho');
  if (!cabecalho) return;

  function atualizar() {
    // classList.toggle(classe, condição) → coloca se true, tira se false
    cabecalho.classList.toggle('cabecalho--rolado', window.scrollY > 40);
  }

  atualizar(); // já confere ao abrir a página (ex.: ao recarregar no meio)
  window.addEventListener('scroll', atualizar, { passive: true });
}


/* ==============================================================
   4. MENU DO CELULAR
   - Dá fundo ao cabeçalho enquanto o menu está aberto
   - Fecha o menu depois que a pessoa toca em um link
   Usa eventos e a API JavaScript do Bootstrap.
   ============================================================== */
function configurarMenuCelular() {
  const menu = document.getElementById('menu-links');
  const cabecalho = document.querySelector('.cabecalho');
  if (!menu || typeof bootstrap === 'undefined') return;

  // Pega o "controle" do Collapse que o Bootstrap criou para o menu
  const collapse = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });

  // Eventos próprios do Bootstrap: show.bs.collapse e hidden.bs.collapse
  menu.addEventListener('show.bs.collapse', () => cabecalho.classList.add('cabecalho--aberto'));
  menu.addEventListener('hidden.bs.collapse', () => cabecalho.classList.remove('cabecalho--aberto'));

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('show')) collapse.hide();
    });
  });
}


/* ==============================================================
   5. ANIMAÇÃO AO ROLAR A PÁGINA
   O IntersectionObserver "observa" os elementos com a classe
   .revelar e avisa quando eles entram na tela. Nesse momento
   colocamos a classe .visivel (o CSS faz a animação).
   ============================================================== */
function configurarRevelar() {
  const elementos = document.querySelectorAll('.revelar');

  // Navegador antigo ou "reduzir movimento": mostra tudo direto
  if (!('IntersectionObserver' in window) || reduzirMovimento) {
    elementos.forEach((el) => el.classList.add('visivel'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target); // anima só uma vez
      }
    });
  }, {
    threshold: 0.15,               // 15% do elemento visível
    rootMargin: '0px 0px -40px 0px' // começa um pouco antes do fim da tela
  });

  elementos.forEach((el) => observador.observe(el));
}


/* ==============================================================
   6. CONTADORES DE NÚMEROS
   <span data-contador="600">600</span>
   Quando aparece na tela, conta de 0 até o valor.
   ============================================================== */

/**
 * Anima um número de 0 até o valor de data-contador.
 * requestAnimationFrame chama a função a cada quadro da tela (~60x por segundo).
 * @param {HTMLElement} elemento
 */
function contar(elemento) {
  const valorFinal = Number(elemento.dataset.contador);
  const duracao = 1600; // milissegundos
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1); // vai de 0 a 1
    const suavizado = 1 - Math.pow(1 - progresso, 3);            // desacelera no final
    elemento.textContent = Math.round(valorFinal * suavizado).toLocaleString('pt-BR');

    if (progresso < 1) requestAnimationFrame(passo);
  }

  requestAnimationFrame(passo);
}

function configurarContadores() {
  const contadores = document.querySelectorAll('[data-contador]');
  if (!('IntersectionObserver' in window) || reduzirMovimento) return; // mantém o número final

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        contar(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.8 });

  contadores.forEach((contador) => observador.observe(contador));
}


/* ==============================================================
   7. ANO ATUAL NO RODAPÉ
   ============================================================== */
function atualizarAno() {
  const ano = document.getElementById('ano-atual');
  if (ano) ano.textContent = new Date().getFullYear();
}


/* ==============================================================
   8. INICIALIZAÇÃO
   DOMContentLoaded = o HTML já foi todo lido pelo navegador.
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
