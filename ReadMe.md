# Gerador de Certificados em PDF

Site simples, feito com HTML, CSS e JavaScript puro, que permite preencher um formulário e baixar um **certificado em PDF** direto do navegador, sem servidor próprio e sem instalação. O certificado é desenhado em **HTML e CSS** (com base em design feito no Canva) e convertido em PDF com [html2canvas](https://html2canvas.hertzen.com/) e [jsPDF](https://github.com/parallax/jsPDF).

O layout do certificado segue os modelos do **Centro Espírita João Silva** (Departamento de Ensino).

## Link de Acesso

Conheça o site

[Gerador de certificados Centro João Silva](https://brulibra.github.io/certificado/)

## Funcionalidades

- Formulário com nome do curso, aluno, Professor, Presidente, responsável pelo Departamento de Ensino e data.
- Botão **Adicionar outro curso** para incluir mais cursos no mesmo certificado (e **Remover** para tirar uma linha).
- Texto do certificado montado automaticamente: `Conferido a {aluno} pela conclusão do Curso de {curso}` ou, com vários, `dos Cursos de {cursos}`.
- Lista de cursos escrita de forma natural: `Filosofia e Reforma Íntima` ou `Filosofia, Reforma Íntima e Aprendizes do Evangelho`.
- Data no formato `São Paulo, 05 de Outubro de 2026`, com dia, mês (por extenso) e ano. Os campos já vêm com a data de hoje e podem ser editados.
- Texto corrido e responsivo: ele ocupa só o espaço de que precisa, sem caixas de tamanho fixo. A letra só diminui se o texto for muito longo.
- Formulário limpo automaticamente depois de cada download, pronto para o próximo certificado.
- Página responsiva (mobile first), para uso no celular.
- Alerta quando não há conexão com a internet (necessária para o jsPDF e o html2canvas) e quando o download do PDF falha.
- Os nomes digitados são lidos em variáveis só durante a geração do PDF e descartados em seguida.

## Estrutura do projeto

```
certificado/
├── index.html   # Estrutura da página
├── style.css    # Estilo da página
├── script.js    # Lógica do formulário e geração do PDF
├── assets.js    # Caminhos das imagens do certificado
├── assets/
│   ├── logo.jpg     # Logo da instituição
│   ├── adorno.png   # Adorno do centro do certificado
│   └── fonts/
│       ├── AbrilFatface-Regular.ttf
│       └── OpenSans-VariableFont_wdth,wght.ttf
└── README.md
```

O `index.html` carrega os scripts nesta ordem, que **não deve ser alterada**:

1. jsPDF (via CDN)
2. html2canvas (via CDN)
3. `assets.js`
4. `script.js`

## Como usar

1. Mantenha os quatro arquivos (`index.html`, `style.css`, `script.js` e `assets.js`) e a pasta `assets` (com as imagens e as fontes) juntos, na mesma pasta.
2. Abra o site pelo **GitHub Pages** ou por um **servidor local** (no VS Code, a extensão Live Server). Abrir o `index.html` com duplo clique (`file://`) não funciona para gerar o PDF: o navegador bloqueia as imagens e o download falha.
3. Preencha o formulário.
4. Clique em **Baixar PDF**. O arquivo `certificado.pdf` será baixado e o formulário ficará vazio.

## Requisitos

- Um navegador atual (Chrome, Edge, Firefox, Opera, etc.).
- **Conexão com a internet**, usada só para carregar as bibliotecas jsPDF e html2canvas (cdnjs).
- As fontes **Abril Fatface** e **Open Sans** vêm da pasta `assets/fonts`, sem baixar nada da internet.
- As imagens (`assets/logo.jpg` e `assets/adorno.png`) são carregadas pelos caminhos definidos no `assets.js`.

## Tipografia do certificado

| Elemento                                                          | Fonte         | Tamanho |
| ----------------------------------------------------------------- | ------------- | ------- |
| Título (Centro Espírita João Silva)                               | Abril Fatface | 22      |
| Subtítulos                                                        | Abril Fatface | 8,5     |
| "Certificado"                                                     | Abril Fatface | 42,5    |
| Aluno, cursos e data                                              | Open Sans     | 14      |
| Nomes (presidente, professor e responsável pelo Depto. de Ensino) | Open Sans     | 10      |
| Cargos (Presidente, Professor(a), Depto. de Ensino)               | Open Sans     | 10      |

## Tecnologias

- HTML, CSS e JavaScript
- [jsPDF](https://github.com/parallax/jsPDF) 2.5.1
- [html2canvas](https://html2canvas.hertzen.com/) 1.4.1
