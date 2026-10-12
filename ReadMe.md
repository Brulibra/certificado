# Gerador de Certificados em PDF

Site simples, feito com HTML, CSS e JavaScript puro, que permite preencher um formulário e baixar um **certificado em PDF** direto do navegador, sem servidor e sem instalação. O PDF é gerado com a biblioteca [jsPDF](https://github.com/parallax/jsPDF).

O layout do certificado segue os modelos do **Centro Espírita João Silva** (Departamento de Ensino).

## Funcionalidades

- Formulário com nome do curso, aluno, professor, presidente, dirigente e data.
- Botão **Adicionar outro curso** para incluir mais cursos no mesmo certificado (e **Remover** para tirar uma linha).
- Escolha automática do modelo: um modelo para **um curso** e outro para **vários cursos**.
- Lista de cursos escrita de forma natural: `Filosofia e Artes` ou `Filosofia, Direito e Artes`.
- Data no formato `São Paulo, 05 de Outubro de 2026`, com dia, mês (por extenso) e ano preenchidos pela pessoa.
- Ajuste automático do tamanho da letra quando um nome ou lista é longo demais para a caixa do modelo.
- Formulário limpo automaticamente depois de cada download, pronto para o próximo certificado.

## Estrutura do projeto

```
certificado/
├── index.html   # Estrutura da página
├── style.css    # Estilo da página
├── script.js    # Lógica do formulário e geração do PDF
├── assets.js    # Imagens de fundo do certificado (base64)
└── README.md
```

O `index.html` carrega os scripts nesta ordem, que **não deve ser alterada**:

1. jsPDF (via CDN)
2. `assets.js`
3. `script.js`

## Como usar

1. Mantenha os quatro arquivos (`index.html`, `style.css`, `script.js` e `assets.js`) na mesma pasta.
2. Abra o `index.html` no navegador (um duplo clique basta).
3. Preencha o formulário.
4. Clique em **Baixar PDF**. O arquivo `certificado.pdf` será baixado e o formulário ficará vazio.

## Requisitos

- Um navegador atual (Chrome, Edge, Firefox, Opera, etc.).
- **Conexão com a internet**, usada para carregar:
  - a biblioteca jsPDF (cdnjs);
  - a fonte **Open Sans**, embutida no PDF;
  - as fontes **Abril Fatface** e **Open Sans** da página (Google Fonts).

Se a Open Sans não carregar, o PDF ainda é gerado, com uma fonte padrão, e a página mostra um aviso.

## Tipografia do certificado

| Elemento | Fonte | Tamanho |
| --- | --- | --- |
| Título (Centro Espírita João Silva) | Abril Fatface | 22 |
| Subtítulos | Cooper BT | 8,5 |
| "Certificado" | Cooper BT | 42,5 |
| Aluno, cursos e data | Open Sans | 14 |
| Professor, presidente e dirigente | Open Sans | 12 |
| Cargos (Presidente, Professor(a), Depto. de Ensino) | Open Sans | 10 |

Os textos fixos (títulos, subtítulos e cargos) já fazem parte das imagens de fundo, em `assets.js`. A Cooper BT é uma fonte paga: na página ela só aparece se estiver instalada no computador, e no PDF isso não afeta nada.

## Tecnologias

- HTML, CSS e JavaScript
- [jsPDF](https://github.com/parallax/jsPDF) 2.5.1