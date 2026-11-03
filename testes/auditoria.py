"""
TESTES DE RESPONSIVIDADE DO TCC
Sanmara Letícia Nunes de Souza — IFRO Campus Porto Velho Calama

O que este script faz
  Abre o site em 16 tamanhos de tela, usando o navegador Chromium
  controlado pela biblioteca Playwright, e mede os 5 critérios do TCC:
    C1. rolagem horizontal
    C2. menor tamanho de texto
    C3. alvos de toque (links e botões) menores que 44 px
    C4. altura do cabeçalho fixo
    C5. volume de imagens baixadas (em 5 cenários de tela e densidade)

Como usar (Windows, no terminal do VS Code)
  1. Instale o Python 3 (python.org) e, no terminal:
         pip install playwright
         python -m playwright install chromium
  2. Entre na pasta deste arquivo (a pasta "testes").
  3. Teste o site publicado, pelo endereço:
         python auditoria.py https://sanmaraleticia.github.io/site-nunes-pinheiro/
         python auditoria.py https://sanmaraleticia.github.io/site-nunes-pinheiro/testes/versao-antes/
     ou os arquivos do computador, pelo caminho do index.html:
         python auditoria.py ..\\index.html
         python auditoria.py versao-antes\\index.html
  É preciso estar conectada à internet: o Bootstrap, os ícones e as
  fontes vêm das CDNs. Os resultados aparecem na tela e são salvos em
  um arquivo .csv (abre no Excel).
"""
import asyncio
import csv
import os
import pathlib
import sys
from urllib.parse import urlparse
from urllib.request import url2pathname

EXTENSOES_IMAGEM = ('.jpg', '.jpeg', '.png', '.svg', '.webp', '.avif', '.gif')

from playwright.async_api import async_playwright

# ---------------------------------------------------------------
# 1. AS 16 TELAS (largura, altura, nome)
# ---------------------------------------------------------------
TELAS = [
    (280, 653, 'Celular dobrável fechado'),
    (320, 568, 'Celular pequeno (iPhone SE 1ª geração)'),
    (360, 740, 'Celular Android comum'),
    (375, 667, 'iPhone SE'),
    (390, 844, 'iPhone 12 a 15'),
    (414, 896, 'iPhone Plus'),
    (768, 1024, 'iPad em pé'),
    (820, 1180, 'iPad Air em pé'),
    (1024, 768, 'iPad na horizontal'),
    (1280, 800, 'Notebook'),
    (1366, 768, 'Notebook comum'),
    (1440, 900, 'MacBook'),
    (1920, 1080, 'Monitor Full HD'),
    (2560, 1440, 'Monitor 2K'),
    (844, 390, 'Celular na horizontal'),
    (667, 375, 'iPhone SE na horizontal'),
]

# Cenários do critério C5: (nome, largura, altura, densidade de pixels, é celular?)
CENARIOS_IMAGENS = [
    ('Notebook 1366 px (1x)', 1366, 768, 1, False),
    ('iPhone 390 px (3x)', 390, 844, 3, True),
    ('Android 360 px (2x)', 360, 740, 2, True),
    ('iPad 768 px (2x)', 768, 1024, 2, True),
    ('MacBook 1440 px (2x)', 1440, 900, 2, False),
]

# ---------------------------------------------------------------
# 2. O QUE É MEDIDO DENTRO DA PÁGINA (código JavaScript)
#    Roda dentro do navegador, depois que a página carrega.
# ---------------------------------------------------------------
MEDIR = r'''
() => {
  const larguraTela = document.documentElement.clientWidth;
  const visivel = el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  const nome = el => (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 25);

  // C1. Rolagem horizontal: a página ou algum elemento passa da largura da tela?
  const fora = [];
  document.querySelectorAll('body *').forEach(el => {
    if (!visivel(el) || getComputedStyle(el).position === 'fixed') return;
    if (el.closest('.navbar-collapse:not(.show)')) return;   // menu recolhido não conta
    const r = el.getBoundingClientRect();
    if (r.right > larguraTela + 1 || r.left < -1) fora.push(el.tagName.toLowerCase());
  });
  const rolagem = document.documentElement.scrollWidth > larguraTela || fora.length > 0;

  // C2. Menor tamanho de texto visível
  let menorFonte = 99;
  document.querySelectorAll('body *').forEach(el => {
    if (!visivel(el)) return;
    const temTexto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (temTexto) menorFonte = Math.min(menorFonte, parseFloat(getComputedStyle(el).fontSize));
  });

  // C3. Alvos de toque menores que 44 x 44 px
  //     O link "Pular para o conteúdo" fica de fora: ele é invisível até receber o foco do teclado.
  const pequenos = [];
  document.querySelectorAll('a, button').forEach(el => {
    if (!visivel(el) || el.classList.contains('pular-conteudo')) return;
    if (el.closest('.navbar-collapse:not(.show)')) return;
    const r = el.getBoundingClientRect();
    if (r.height < 44 || r.width < 44) pequenos.push(`${nome(el)} (${Math.round(r.width)}x${Math.round(r.height)})`);
  });

  // C4. Altura do cabeçalho fixo
  const cabecalho = Math.round(document.querySelector('.cabecalho').getBoundingClientRect().height);

  return { rolagem, menorFonte, pequenos, cabecalho,
           menuRecolhido: getComputedStyle(document.querySelector('.navbar-toggler')).display !== 'none' };
}
'''


def preparar(pagina):
    """Ponto de ajuste opcional (por exemplo, para testar sem internet). Por padrão, não faz nada."""
    return None


async def abrir(navegador, url, largura, altura, densidade=1, celular=False):
    contexto = await navegador.new_context(
        viewport={'width': largura, 'height': altura},
        device_scale_factor=densidade,
        is_mobile=celular, has_touch=celular,   # celular: respeita a meta viewport e o toque
        reduced_motion='reduce',                # sem animações, para não atrapalhar as medidas
    )
    pagina = await contexto.new_page()
    r = preparar(pagina)
    if asyncio.iscoroutine(r):
        await r
    return contexto, pagina


async def rolar_ate_o_fim(pagina, altura):
    """Rola a página inteira, para carregar as imagens com loading="lazy"."""
    total = await pagina.evaluate('document.documentElement.scrollHeight')
    y = 0
    while y < total:
        await pagina.evaluate(f'window.scrollTo(0, {y})')
        await pagina.wait_for_timeout(80)
        y += altura // 2
    await pagina.evaluate('window.scrollTo(0, 0)')
    # Espera terminar o download das imagens que começaram a carregar
    # (no site online, a internet pode demorar um pouco mais).
    await pagina.evaluate('''Promise.all([...document.images].map(i => i.complete ? 1 :
        new Promise(ok => { i.onload = i.onerror = ok; })))''')
    await pagina.wait_for_timeout(300)


def endereco_e_nome(caminho):
    """Aceita um endereço da internet (https://...) ou o caminho de um index.html no computador.
    Devolve o endereço que o navegador vai abrir e um nome para o arquivo de resultados."""
    if caminho.startswith(('http://', 'https://')):
        partes = [p for p in urlparse(caminho).path.split('/') if p and p != 'index.html']
        nome = partes[-1] if partes else urlparse(caminho).netloc
        nome = ''.join(c if c.isalnum() or c in '._-' else '-' for c in nome)  # sem caracteres proibidos no Windows
        return caminho, nome + '-online'
    arquivo = pathlib.Path(caminho).resolve()
    return arquivo.as_uri(), arquivo.parent.name


def e_imagem(endereco):
    return urlparse(endereco).path.lower().endswith(EXTENSOES_IMAGEM)


async def principal(caminho):
    url, nome_resultados = endereco_e_nome(caminho)
    online = url.startswith('http')
    servidor = urlparse(url).netloc   # no site online, só contam as imagens do próprio site
    linhas = []
    async with async_playwright() as p:
        navegador = await p.chromium.launch()

        # ---------- Critérios C1 a C4 nas 16 telas ----------
        print(f'\nSite: {url}\n')
        print(f"{'Tela':<40}{'Tamanho':>12}{'Rolagem':>9}{'Fonte':>7}{'Alvos<44':>10}{'Cabeçalho':>11}")
        for largura, altura, nome in TELAS:
            celular = largura < 1024          # abaixo de 1024 px, emula um aparelho com toque
            contexto, pagina = await abrir(navegador, url, largura, altura, 1, celular)
            await pagina.goto(url)
            await pagina.evaluate('document.fonts.ready')
            await rolar_ate_o_fim(pagina, altura)
            m = await pagina.evaluate(MEDIR)
            await contexto.close()
            print(f"{nome:<40}{f'{largura}x{altura}':>12}{('SIM' if m['rolagem'] else 'não'):>9}"
                  f"{m['menorFonte']:>7.0f}{len(m['pequenos']):>10}{m['cabecalho']:>11}")
            linhas.append([nome, largura, altura, 'sim' if m['rolagem'] else 'não', m['menorFonte'],
                           len(m['pequenos']), '; '.join(m['pequenos']), m['cabecalho']])

        # ---------- Critério C5: volume de imagens ----------
        print('\nVolume de imagens baixadas (KB):')
        for nome, largura, altura, densidade, celular in CENARIOS_IMAGENS:
            contexto, pagina = await abrir(navegador, url, largura, altura, densidade, celular)
            arquivos = {}
            respostas = []

            def ao_terminar(req):
                # Arquivos do computador: o tamanho vem direto do disco
                u = req.url
                if u.startswith('file:') and e_imagem(u):
                    arq = url2pathname(urlparse(u).path)          # endereço file:// -> caminho no disco
                    arquivos[os.path.basename(arq)] = os.path.getsize(arq)

            def ao_responder(resp):
                # Site online: guarda as respostas das imagens do próprio site
                # (as imagens do Google Maps, por exemplo, ficam de fora)
                if urlparse(resp.url).netloc == servidor and e_imagem(resp.url) and resp.status == 200:
                    respostas.append(resp)

            pagina.on('requestfinished', ao_terminar)
            if online:
                pagina.on('response', ao_responder)
            await pagina.goto(url)
            await rolar_ate_o_fim(pagina, altura)
            for resp in respostas:
                corpo = await resp.body()                         # o arquivo recebido
                arquivos[os.path.basename(urlparse(resp.url).path)] = len(corpo)
            await contexto.close()
            kb = round(sum(arquivos.values()) / 1024)
            print(f'  {nome:<26}{kb:>7} KB   ({", ".join(sorted(arquivos))})')
            linhas.append([f'IMAGENS: {nome}', largura, altura, '', '', '', ', '.join(sorted(arquivos)), kb])

        await navegador.close()

    saida = pathlib.Path(__file__).with_name(f'resultados-{nome_resultados}.csv')
    with open(saida, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(['Tela/cenário', 'Largura', 'Altura', 'Rolagem horizontal', 'Menor fonte (px)',
                    'Alvos < 44 px', 'Detalhes', 'Cabeçalho (px) ou KB'])
        w.writerows(linhas)
    print(f'\nResultados salvos em: {saida}\n')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: python auditoria.py https://endereco-do-site/   ou   python auditoria.py caminho\\para\\index.html')
        sys.exit(1)
    asyncio.run(principal(sys.argv[1]))
