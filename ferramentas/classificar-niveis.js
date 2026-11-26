/*
  Arquivo: ferramentas/classificar-niveis.js
  Papel: dá a cada pergunta o campo "nivel": 1 (Fácil), 2 (Médio) ou 3 (Difícil).
  O app usa o nível no modo Automático (sobe com 3 acertos seguidos, desce com 2 erros) e nos botões de nível.

  Como rodar (na pasta do projeto):
    node ferramentas/classificar-niveis.js            só mostra quantas ficariam em cada nível
    node ferramentas/classificar-niveis.js --gravar   grava o campo "nivel" em materias/<matéria>.json

  Como o nível é decidido:
  1) cada pergunta ganha pontos de dificuldade:
     + formato de prova (afirmativas, V ou F, associação): +3;
     + tem código para ler: +2 (e +1 se o código passar de 6 linhas, +1 se passar de 12);
     + pede a INCORRETA, a que NÃO é, EXCETO ou a FALSA (em maiúsculas): +2;
     + enunciado longo, de situação (mais de 140 letras): +1; muito longo (mais de 240): +1;
     + conta com números (sub-rede, hosts, resultado de laço...): +1;
     + alternativas longas (média acima de 60 letras): +1;
     - pergunta direta de definição ("O que é", "O que significa", "Para que serve"): -1;
  2) formato de prova é sempre Difícil;
  3) dentro de cada tema, as outras perguntas são postas em fila pelos pontos (empate: a mais comprida é
     a mais difícil) e divididas em 40% Fácil, 35% Médio e 25% Difícil. Assim todo tema tem os três níveis.
  Pergunta com "nivelFixo": true mantém o nível que tem (para ajustes feitos à mão).
  Rodar de novo dá sempre o mesmo resultado para os mesmos arquivos.
*/

// Módulos do Node para ler e gravar arquivos.
const fs = require('fs');
const path = require('path');

// Pasta das matérias.
const pasta = path.join(__dirname, '..', 'materias');
// --gravar na linha de comando: grava; sem ele, só mostra.
const gravar = process.argv.includes('--gravar');

// semEtiquetas() tira marcações HTML (<b>, <code>) para contar só as letras visíveis.
function semEtiquetas(texto) {
  return String(texto || '').replace(/<[^>]+>/g, '');
}

// pontos() calcula a dificuldade de uma pergunta pelas regras do cabeçalho. Parâmetro: q, a pergunta.
function pontos(q) {
  // Enunciado sem HTML, junto com as afirmativas do formato de prova.
  const enunciado = semEtiquetas(q.statement);
  const texto = enunciado + ' ' + (Array.isArray(q.bloco) ? q.bloco.join(' ') : '');
  // Soma começando do zero.
  let p = 0;
  // Formato de prova.
  if (q.estilo === 'prova' || Array.isArray(q.bloco)) p += 3;
  // Código para ler e o tamanho dele.
  if (q.code) {
    const linhas = String(q.code).split('\n').length;
    p += 2;
    if (linhas > 6) p += 1;
    if (linhas > 12) p += 1;
  }
  // Pedido pelo contrário, escrito em maiúsculas como nas provas.
  if (/\b(NÃO|INCORRETA|INCORRETO|EXCETO|FALSA|FALSO|ERRADA|ERRADO)\b/.test(enunciado)) p += 2;
  // Situação comprida.
  if (texto.length > 140) p += 1;
  if (texto.length > 240) p += 1;
  // Conta com números.
  if (/\d/.test(texto) && /(quant[oa]s|calcule|resultado|sub-?rede|hosts?|broadcast|máscara|imprime|valor final|soma|saída)/i.test(texto)) p += 1;
  // Alternativas longas.
  const media = (q.options || []).reduce((s, o) => s + semEtiquetas(o).length, 0) / Math.max(1, (q.options || []).length);
  if (media > 60) p += 1;
  // Definição direta.
  if (/^(o que (é|são|significa|faz|indica)|para que serve|como se chama|qual é o nome)/i.test(enunciado.trim())) p -= 1;
  return p;
}

// tamanho() mede a pergunta inteira (enunciado, afirmativas, código e alternativas), para desempatar.
function tamanho(q) {
  return semEtiquetas(q.statement).length + (Array.isArray(q.bloco) ? q.bloco.join('').length : 0) + String(q.code || '').length + (q.options || []).join('').length;
}

// classificarTema() dá o nível às perguntas de um tema. Parâmetro: lista das perguntas do tema.
function classificarTema(lista) {
  // Perguntas com nível feito à mão ficam como estão.
  const livres = lista.filter((q) => !q.nivelFixo);
  // Formato de prova: sempre Difícil.
  livres.filter((q) => q.estilo === 'prova').forEach((q) => { q.nivel = 3; });
  // As outras entram na fila pela dificuldade.
  const fila = livres.filter((q) => q.estilo !== 'prova')
    // Pontos, depois tamanho, depois o texto (para dar sempre o mesmo resultado).
    .sort((a, b) => pontos(a) - pontos(b) || tamanho(a) - tamanho(b) || String(a.statement).localeCompare(String(b.statement)));
  // Tema pequeno (menos de 6): usa os pontos direto, sem dividir em partes.
  if (fila.length < 6) {
    fila.forEach((q) => { const p = pontos(q); q.nivel = p <= 0 ? 1 : p <= 2 ? 2 : 3; });
    return;
  }
  // Tema maior: 40% Fácil, 35% Médio e 25% Difícil, pela posição na fila.
  fila.forEach((q, i) => {
    const parte = i / fila.length;
    q.nivel = parte < 0.40 ? 1 : parte < 0.75 ? 2 : 3;
  });
}

// Lista das matérias.
const materias = JSON.parse(fs.readFileSync(path.join(pasta, 'index.json'), 'utf8'));
// Totais gerais por nível, para o resumo final.
const geral = { 1: 0, 2: 0, 3: 0 };

for (const materia of materias) {
  // Arquivo da matéria.
  const arquivo = path.join(pasta, `${materia.id}.json`);
  const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  const questoes = dados.questoes || [];
  // Matéria sem perguntas: pula.
  if (!questoes.length) continue;
  // Separa as perguntas por tema e classifica cada tema.
  const porTema = {};
  questoes.forEach((q) => { (porTema[q.topic] = porTema[q.topic] || []).push(q); });
  Object.values(porTema).forEach(classificarTema);
  // Conta quantas ficaram em cada nível nesta matéria.
  const conta = { 1: 0, 2: 0, 3: 0 };
  questoes.forEach((q) => { conta[q.nivel]++; geral[q.nivel]++; });
  console.log(`${materia.id.padEnd(16)} Fácil ${String(conta[1]).padStart(4)} · Médio ${String(conta[2]).padStart(4)} · Difícil ${String(conta[3]).padStart(4)}`);
  // Com --gravar: salva no mesmo formato dos arquivos (2 espaços e uma linha em branco no fim).
  if (gravar) fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2) + '\n');
}
console.log(`${'TOTAL'.padEnd(16)} Fácil ${String(geral[1]).padStart(4)} · Médio ${String(geral[2]).padStart(4)} · Difícil ${String(geral[3]).padStart(4)}`);
console.log(gravar ? 'Gravado em materias/*.json.' : 'Só mostrou. Para gravar: node ferramentas/classificar-niveis.js --gravar');
