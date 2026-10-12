// script.js — lógica do formulário e geração do PDF.
// Depende de: jsPDF (CDN) e assets.js (FUNDO_UM_CURSO, FUNDO_MUITOS_CURSOS), carregados antes no index.html.

const container = document.getElementById("cursos");
const erro = document.getElementById("erro");

// Open Sans (mesma fonte do certificado). É baixada da internet ao abrir a página.
function urlsFonte(arquivo) {
  return [
    "https://cdn.jsdelivr.net/gh/googlefonts/opensans@bd7e37632246368c60fdcbd374dbf9bad11969b6/fonts/ttf/" +
      arquivo,
    "https://raw.githubusercontent.com/googlefonts/opensans/bd7e37632246368c60fdcbd374dbf9bad11969b6/fonts/ttf/" +
      arquivo,
  ];
}

function paraBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let texto = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    texto += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(texto);
}

async function baixarFonte(arquivo) {
  for (const url of urlsFonte(arquivo)) {
    try {
      const resposta = await fetch(url);
      if (resposta.ok) return paraBase64(await resposta.arrayBuffer());
    } catch (e) {
      /* tenta o próximo endereço */
    }
  }
  return null;
}

const fontesPromessa = Promise.all([
  baixarFonte("OpenSans-Regular.ttf"),
  baixarFonte("OpenSans-Bold.ttf"),
]);

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

// Deixa o formulário vazio (com uma única linha de curso) para o próximo certificado
function limparFormulario() {
  document.getElementById("formulario").reset();
  container.innerHTML = "";
  adicionarCurso();
}

// Posição dos campos, em pontos (mesmas coordenadas dos modelos SVG)
const ASSINATURAS = { presidente: 134.1, professor: 342.2, dirigente: 550.4 };
const LARGURA_ASSINATURA = 157;
const Y_ASSINATURA = 492.6;

function ajustar(doc, texto, largura, maximo, minimo) {
  let tamanho = maximo;
  doc.setFontSize(tamanho);
  while (doc.getTextWidth(texto) > largura - 4 && tamanho > minimo) {
    tamanho -= 0.5;
    doc.setFontSize(tamanho);
  }
}

function escreverCentro(doc, texto, x, y, largura, altura, maximo) {
  ajustar(doc, texto, largura, maximo || 14, 8);
  doc.text(texto, x + largura / 2, y + altura * 0.78, { align: "center" });
}

// Junta os nomes: "A e B", "A, B e C", "A, B, C e D"
function juntarCursos(nomes) {
  if (nomes.length === 1) return nomes[0];
  return nomes.slice(0, -1).join(", ") + " e " + nomes[nomes.length - 1];
}

// Distribui os cursos nas duas linhas do modelo "muitos cursos"
function distribuirCursos(doc, texto, l1, l2) {
  for (let tamanho = 14; tamanho >= 8; tamanho -= 0.5) {
    doc.setFontSize(tamanho);
    const palavras = texto.split(" ");
    let primeira = "";
    let i = 0;
    while (i < palavras.length) {
      const tentativa = primeira ? primeira + " " + palavras[i] : palavras[i];
      if (doc.getTextWidth(tentativa) > l1 - 4) break;
      primeira = tentativa;
      i++;
    }
    if (i < palavras.length && primeira.endsWith(" e")) {
      primeira = primeira.slice(0, -2);
      i--;
    }
    const segunda = palavras.slice(i).join(" ");
    if (!segunda || doc.getTextWidth(segunda) <= l2 - 4) {
      return { tamanho: tamanho, primeira: primeira, segunda: segunda };
    }
  }
  doc.setFontSize(8);
  return { tamanho: 8, primeira: texto, segunda: "" };
}

document
  .getElementById("formulario")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    erro.textContent = "";

    if (!window.jspdf) {
      erro.textContent =
        "Não foi possível carregar o jsPDF. Verifique sua conexão com a internet.";
      return;
    }

    const cursos = Array.from(container.querySelectorAll('[name="curso"]')).map(
      function (input) {
        return input.value.trim();
      },
    );
    const aluno = document.getElementById("aluno").value.trim();
    const dia = String(document.getElementById("dia").value).padStart(2, "0");
    const mes = document.getElementById("mes").value;
    const ano = String(document.getElementById("ano").value).slice(-2);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const umCurso = cursos.length === 1;

    const [regular, negrito] = await fontesPromessa;
    let familia = "helvetica";
    if (regular && negrito) {
      doc.addFileToVFS("OpenSans-Regular.ttf", regular);
      doc.addFont("OpenSans-Regular.ttf", "OpenSans", "normal");
      doc.addFileToVFS("OpenSans-Bold.ttf", negrito);
      doc.addFont("OpenSans-Bold.ttf", "OpenSans", "bold");
      familia = "OpenSans";
    } else {
      erro.textContent =
        "Não foi possível carregar a fonte Open Sans (verifique a internet). O PDF foi gerado com uma fonte padrão.";
    }

    doc.addImage(
      umCurso ? FUNDO_UM_CURSO : FUNDO_MUITOS_CURSOS,
      "PNG",
      0,
      0,
      841.89,
      595.28,
      undefined,
      "FAST",
    );
    doc.setFont(familia, "bold");
    doc.setTextColor(61, 59, 58);

    if (umCurso) {
      escreverCentro(doc, aluno, 285.5, 297.5, 325.4, 17, 14);
      escreverCentro(doc, cursos[0], 372, 333.5, 283, 17, 14);
    } else {
      escreverCentro(doc, aluno, 285.5, 274.5, 325.4, 17, 14);
      const r = distribuirCursos(doc, juntarCursos(cursos), 267, 470.5);
      doc.setFontSize(r.tamanho);
      doc.text(r.primeira, 388.9 + 267 / 2, 310.5 + 17 * 0.78, {
        align: "center",
      });
      if (r.segunda)
        doc.text(r.segunda, 185.5 + 470.5 / 2, 346.5 + 17 * 0.78, {
          align: "center",
        });
    }

    escreverCentro(doc, dia, 361, 422.7, 29.3, 17, 14);
    escreverCentro(doc, mes, 414.8, 422.7, 89.8, 17, 14);
    escreverCentro(doc, ano, 553.4, 422.7, 28.3, 17, 14);

    ["presidente", "professor", "dirigente"].forEach(function (campo) {
      const nome = document.getElementById(campo).value.trim();
      doc.setFont(familia, "normal");
      escreverCentro(
        doc,
        nome,
        ASSINATURAS[campo],
        Y_ASSINATURA,
        LARGURA_ASSINATURA,
        13.7,
        12,
      );
    });

    doc.save("certificado.pdf");
    limparFormulario();
  });
