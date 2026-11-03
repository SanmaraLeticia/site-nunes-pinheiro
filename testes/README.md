# Testes de responsividade

O `auditoria.py` abre o site no navegador Chromium, controlado pela biblioteca Playwright, simulando 16 tamanhos de tela (do celular dobrável de 280 px ao monitor 2K de 2560 px, incluindo dois celulares na horizontal). Em cada um, mede:

| Critério | O que é medido |
|---|---|
| C1 | Rolagem horizontal |
| C2 | Menor tamanho de texto visível |
| C3 | *Links* e botões menores que 44 × 44 px |
| C4 | Altura do cabeçalho fixo |
| C5 | Total de imagens baixadas, em 5 combinações de tela e densidade de *pixels* |

A pasta `versao-antes` guarda o site antes dos ajustes (com as fotos originais), para comparar os dois resultados.

## Instalação (uma vez só)

1. Instale o Python 3 em [python.org](https://www.python.org/downloads/). No Windows, marque **"Add Python to PATH"** na instalação.
2. No terminal (pode ser o do VS Code):

   ```
   pip install playwright
   python -m playwright install chromium
   ```

## Como rodar

Entre na pasta `testes` pelo terminal e escolha uma das formas abaixo. É preciso estar conectado à internet.

**Pelo site publicado:**

```
python auditoria.py https://sanmaraleticia.github.io/site-nunes-pinheiro/
python auditoria.py https://sanmaraleticia.github.io/site-nunes-pinheiro/testes/versao-antes/
```

**Pelos arquivos do computador:**

```
python auditoria.py ..\index.html
python auditoria.py versao-antes\index.html
```

Cada execução leva de 1 a 3 minutos, mostra os resultados no terminal e salva um arquivo `resultados-....csv` nesta pasta, que abre no Excel.

No site publicado, o programa conta só as imagens do próprio site. As imagens do mapa, que vêm do Google, ficam de fora.

## Resultados esperados

| Critério | Antes | Depois |
|---|---|---|
| Rolagem horizontal | nenhuma tela | nenhuma tela |
| Menor texto | 12 px | 12 px |
| Alvos menores que 44 px | 8 (telas abaixo de 992 px) e 7 (telas maiores) | 0 |
| Cabeçalho no celular na horizontal | 95 px | 63 px |
| Imagens no notebook 1366 px (1x) | 6.223 KB | 363 KB |
| Imagens nos celulares (2x e 3x) | 6.223 KB | 723 KB |
| Imagens no tablet e no MacBook (2x) | 6.223 KB | 788 KB |
