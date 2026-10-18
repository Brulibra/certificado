// script.js — lógica do formulário e geração do PDF.
// Depende de: jsPDF e html2canvas (CDN) e assets.js (ASSET_LOGO, ASSET_ORNAMENTO), carregados antes no index.html.

const container = document.getElementById("cursos");
const erro = document.getElementById("erro");
const certificado = document.getElementById("certificado");

// ---------- Linhas de curso do formulário ----------
function atualizarRemover() {
  const linhas = container.querySelectorAll(".linha-curso");
  linhas.forEach(function (linha) {
    linha.querySelector("button").hidden = linhas.length === 1;
  });
}

function adicionarCurso() {
  const linha = document.createElement("div");
  linha.className = "linha-curso";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "curso";
  input.className = "t14";
  input.required = true;
  input.setAttribute("aria-label", "Nome do Curso");

  const remover = document.createElement("button");
  remover.type = "button";
  remover.textContent = "Remover";
  remover.addEventListener("click", function () {
    linha.remove();
    atualizarRemover();
  });

  linha.append(input, remover);
  container.appendChild(linha);
  atualizarRemover();
  input.focus();
}

document.getElementById("adicionar").addEventListener("click", adicionarCurso);
adicionarCurso();

// ---------- Imagens do certificado (vêm do assets.js) ----------
// O formulário é montado ANTES desta etapa: se o assets.js não carregar, a página continua funcionando
// e o erro aparece como aviso, em vez de travar o script inteiro.
const MSG_ASSETS =
  "Não foi possível carregar o assets.js (logo e ornamento do certificado). Confira se o arquivo foi enviado junto com os outros.";
const imagensCarregadas =
  typeof ASSET_LOGO !== "undefined" && typeof ASSET_ORNAMENTO !== "undefined";
if (imagensCarregadas) {
  document.getElementById("logo").src = ASSET_LOGO;
  document.getElementById("ornamento").src = ASSET_ORNAMENTO;
} else {
  erro.textContent = MSG_ASSETS;
}

// Deixa o formulário vazio (com uma única linha de curso) para o próximo certificado
function limparFormulario() {
  document.getElementById("formulario").reset();
  container.innerHTML = "";
  adicionarCurso();
}

// ---------- Texto do certificado ----------
// Junta os nomes: "A e B", "A, B e C", "A, B, C e D"
function juntarCursos(nomes) {
  if (nomes.length === 1) return nomes[0];
  return nomes.slice(0, -1).join(", ") + " e " + nomes[nomes.length - 1];
}

// Monta a frase principal por concatenação de texto
function montarTextoCurso(aluno, cursos) {
  const artigo = cursos.length === 1 ? "do Curso de " : "dos Cursos de ";
  return (
    "Conferido a " + aluno + " pela conclusão " + artigo + juntarCursos(cursos)
  );
}

// Monta a data: "São Paulo, 05 de Outubro de 2026"
function montarData(dia, mes, ano) {
  return "São Paulo, " + dia + " de " + mes + " de " + ano;
}

function definir(id, texto) {
  document.getElementById(id).textContent = texto;
}

// Diminui a letra (em pt) até o texto caber, sem passar do mínimo
function reduzirAteCaber(el, maximoPt, minimoPt, cabe) {
  let tamanho = maximoPt;
  el.style.fontSize = tamanho + "pt";
  while (!cabe(el) && tamanho > minimoPt) {
    tamanho -= 0.5;
    el.style.fontSize = tamanho + "pt";
  }
}

function preencherCertificado(d) {
  definir("c-texto", montarTextoCurso(d.aluno, d.cursos));
  definir("c-data", montarData(d.dia, d.mes, d.ano));
  definir("c-presidente", d.presidente);
  definir("c-professor", d.professor);
  definir("c-dirigente", d.dirigente);

  // O texto corrido só diminui se não couber na área entre o título e a data
  const texto = document.getElementById("c-texto");
  const area = texto.parentElement;
  reduzirAteCaber(texto, 14, 8, function (el) {
    return el.getBoundingClientRect().height <= area.clientHeight;
  });
}

// ---------- Gerar o PDF ----------
document
  .getElementById("formulario")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    erro.textContent = "";

    if (!imagensCarregadas) {
      erro.textContent = MSG_ASSETS;
      return;
    }

    if (!window.jspdf || !window.html2canvas) {
      erro.textContent =
        "Não foi possível carregar o jsPDF/html2canvas. Verifique sua conexão com a internet.";
      return;
    }

    const valor = function (id) {
      return document.getElementById(id).value.trim();
    };
    preencherCertificado({
      cursos: Array.from(container.querySelectorAll('[name="curso"]')).map(
        function (i) {
          return i.value.trim();
        },
      ),
      aluno: valor("aluno"),
      professor: valor("professor"),
      presidente: valor("presidente"),
      dirigente: valor("dirigente"),
      dia: String(document.getElementById("dia").value).padStart(2, "0"),
      mes: document.getElementById("mes").value,
      ano: String(document.getElementById("ano").value),
    });

    try {
      await document.fonts.ready; // fontes locais (pasta Fonts) prontas antes de gerar a imagem
      const canvas = await html2canvas(certificado, {
        scale: window.innerWidth < 600 ? 2 : 3, // celulares têm menos memória
        windowWidth: 1200, // evita que as regras de tela pequena alterem o certificado
        backgroundColor: "#ffffff",
        logging: false,
        onclone: function (doc) {
          const area = doc.getElementById("area-pdf");
          area.style.left = "0";
        },
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        841.89,
        595.28,
        undefined,
        "FAST",
      );
      pdf.save("certificado.pdf");
      limparFormulario();
    } catch (falha) {
      erro.textContent = "Não foi possível gerar o PDF: " + falha.message;
    }
  });
