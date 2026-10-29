// script.js — lógica do formulário e geração do certificado em PDF.
// Depende de: jsPDF e html2canvas (CDN) e assets.js (ASSETS), carregados antes no index.html.

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const CAMPOS_CERTIFICADO = [
  "c-texto",
  "c-data",
  "c-presidente",
  "c-professor",
  "c-dept",
];

const formulario = document.getElementById("formulario");
const listaCursos = document.getElementById("cursos");
const certificado = document.getElementById("certificado");

// Dados do certificado: guardados em variáveis só durante a geração do PDF e descartados em seguida.
// Os cursos ficam numa lista, porque o aluno pode ter feito mais de um.
let nomeAluno = "";
let nomeProfessor = "";
let nomePresidente = "";
let nomeDeptEnsino = "";
let nomesCursos = [];
let dia = "";
let mes = "";
let ano = "";

// ---------- Formulário ----------
function atualizarRemover() {
  const linhas = listaCursos.querySelectorAll(".linha-curso");
  linhas.forEach((linha) => {
    linha.querySelector("button").hidden = linhas.length === 1;
  });
}

function adicionarCurso(focar = false) {
  const linha = document.createElement("div");
  linha.className = "linha-curso";

  const campo = document.createElement("input");
  campo.type = "text";
  campo.name = "curso";
  campo.required = true;
  campo.setAttribute("aria-label", "Nome do Curso");

  const botaoRemover = document.createElement("button");
  botaoRemover.type = "button";
  botaoRemover.textContent = "Remover";
  botaoRemover.addEventListener("click", () => {
    linha.remove();
    atualizarRemover();
  });

  linha.append(campo, botaoRemover);
  listaCursos.appendChild(linha);
  atualizarRemover();
  if (focar) campo.focus();
}

function preencherDataAtual() {
  const hoje = new Date();
  document.getElementById("dia").value = hoje.getDate();
  document.getElementById("mes").value = MESES[hoje.getMonth()];
  document.getElementById("ano").value = hoje.getFullYear();
}

// Deixa o formulário pronto para o próximo certificado: uma linha de curso vazia e a data de hoje
function limparFormulario() {
  formulario.reset();
  listaCursos.innerHTML = "";
  adicionarCurso();
  preencherDataAtual();
}

const seletorMes = document.getElementById("mes");
MESES.forEach((nome) => seletorMes.add(new Option(nome, nome)));
document
  .getElementById("adicionar")
  .addEventListener("click", () => adicionarCurso(true));
adicionarCurso();
preencherDataAtual();

// ---------- Imagens do certificado (caminhos definidos no assets.js) ----------
const assetsCarregado = typeof ASSETS !== "undefined";
if (assetsCarregado) {
  document.getElementById("logo").src = ASSETS.logo;
  document.getElementById("ornamento").src = ASSETS.adorno;
}

async function aguardarImagens() {
  const imagens = [
    document.getElementById("logo"),
    document.getElementById("ornamento"),
  ];
  await Promise.all(imagens.map((img) => img.decode().catch(() => {})));
  if (imagens.some((img) => img.naturalWidth === 0)) {
    throw new Error(
      "as imagens do certificado não foram encontradas (pasta assets)",
    );
  }
}

// ---------- Textos do certificado (concatenação com template string) ----------
// "A", "A e B", "A, B e C"
function juntarCursos(cursos) {
  if (cursos.length === 1) return cursos[0];
  return `${cursos.slice(0, -1).join(", ")} e ${cursos[cursos.length - 1]}`;
}

function montarTextoCurso(aluno, cursos) {
  const curso = cursos.length === 1 ? "do Curso" : "dos Cursos";
  return `Conferido a ${aluno} pela conclusão ${curso} de ${juntarCursos(cursos)}`;
}

function montarData(diaCertificado, mesCertificado, anoCertificado) {
  return `São Paulo, ${diaCertificado} de ${mesCertificado} de ${anoCertificado}`;
}

function definir(id, texto) {
  document.getElementById(id).textContent = texto;
}

// Diminui a letra (em pt) até o texto caber na caixa, sem passar do mínimo
function reduzirAteCaber(el, maximoPt, minimoPt) {
  let tamanho = maximoPt;
  el.style.fontSize = `${tamanho}pt`;
  while (el.scrollHeight > el.clientHeight + 1 && tamanho > minimoPt) {
    tamanho -= 0.5;
    el.style.fontSize = `${tamanho}pt`;
  }
}

function preencherCertificado() {
  definir("c-texto", montarTextoCurso(nomeAluno, nomesCursos));
  definir("c-data", montarData(dia, mes, ano));
  definir("c-presidente", nomePresidente);
  definir("c-professor", nomeProfessor);
  definir("c-dept", nomeDeptEnsino);
  reduzirAteCaber(document.getElementById("c-texto"), 14, 8);
}

// ---------- Captura e descarte dos dados ----------
function valorDe(id) {
  return document.getElementById(id).value.trim();
}

function capturarDados() {
  nomeAluno = valorDe("aluno");
  nomeProfessor = valorDe("professor");
  nomePresidente = valorDe("presidente");
  nomeDeptEnsino = valorDe("dept-ensino");
  nomesCursos = [...listaCursos.querySelectorAll('[name="curso"]')].map(
    (campo) => campo.value.trim(),
  );
  dia = String(document.getElementById("dia").value).padStart(2, "0");
  mes = document.getElementById("mes").value;
  ano = String(document.getElementById("ano").value);
}

function descartarDados() {
  nomeAluno = nomeProfessor = nomePresidente = nomeDeptEnsino = "";
  nomesCursos = [];
  dia = mes = ano = "";
  CAMPOS_CERTIFICADO.forEach((id) => definir(id, ""));
}

// ---------- Gerar o PDF ----------
function temConexao() {
  return (
    navigator.onLine && Boolean(window.jspdf) && Boolean(window.html2canvas)
  );
}

function dicaDoErro(falha) {
  if (falha.name === "SecurityError") {
    return "O navegador bloqueou as imagens. Abra o site pelo GitHub Pages ou por um servidor local (Live Server), e não direto do disco.";
  }
  return falha.message;
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!temConexao()) {
    alert(
      "Não é possível gerar o PDF por falta de conectividade. Verifique sua conexão com a internet: ela é necessária para o jsPDF e o html2canvas funcionarem.",
    );
    return;
  }
  if (!assetsCarregado) {
    alert(
      "Falha no download do certificado: o arquivo assets.js não foi carregado.",
    );
    return;
  }

  capturarDados();
  try {
    preencherCertificado();
    await aguardarImagens();
    await document.fonts.ready;

    const canvas = await html2canvas(certificado, {
      scale: window.innerWidth < 600 ? 2 : 3, // celulares têm menos memória
      windowWidth: 1200, // evita que as regras de tela pequena alterem o certificado
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      onclone: (documentoClonado) => {
        documentoClonado.getElementById("area-pdf").style.left = "0";
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
    console.error(falha);
    alert(`Falha no download do certificado. ${dicaDoErro(falha)}`);
  } finally {
    descartarDados();
  }
});
