/*
  Arquivo: ferramentas/inventario.js
  Papel: trava contra perda de conteúdo. Nada que o app já tem pode sumir sem querer.

  Como rodar (na pasta do projeto):
    node ferramentas/inventario.js              -> CONFERE: falha se alguma coisa diminuiu ou sumiu
    node ferramentas/inventario.js --atualizar  -> grava a contagem atual como nova base e atualiza
                                                   a tabela do CONTEUDO.md (só funciona se nada diminuiu)

  O que ele confere, comparando com ferramentas/inventario.json (a "base"):
  - nenhuma matéria sumiu;
  - perguntas (no simulado + guardadas em materias/arquivo/) não diminuíram;
  - capítulos do livro, histórias, jogos, termos e práticas não diminuíram;
  - nenhum tema sumiu;
  - nenhum elemento da tela (id no index.html) sumiu;
  - nenhum arquivo de js/, css/, materias/ ou ferramentas/ sumiu;
  - a quantidade de arquivos em material/ (PDFs e .md do Paulo, fora do GitHub) não caiu;
  - nenhum arquivo de material/ está vazio (0 byte).

  Para TIRAR uma pergunta do simulado sem perder: mova-a para materias/arquivo/<matéria>.json.
  Ela sai da prova, mas continua contando aqui.

  Roda sozinho antes de cada commit (.githooks/pre-commit).
*/

// fs lê e grava arquivos; path monta caminhos que funcionam no Windows.
const fs = require('fs');
const path = require('path');

// Pasta raiz do projeto (um nível acima desta pasta ferramentas/).
const raiz = path.join(__dirname, '..');
// Onde fica a base com a última contagem aprovada.
const arquivoBase = path.join(__dirname, 'inventario.json');
// Cartão de conteúdo lido pelo Paulo.
const arquivoCartao = path.join(raiz, 'CONTEUDO.md');
// Marcadores que delimitam a tabela gerada dentro do CONTEUDO.md.
const INICIO = '<!-- inventario:inicio -->';
const FIM = '<!-- inventario:fim -->';

// lerJson() lê um JSON; se o arquivo não existir, devolve o valor "padrao".
// Parâmetros: caminho do arquivo e valor padrão. Erro de JSON mal escrito é avisado e encerra.
function lerJson(caminho, padrao) {
  // Arquivo ausente: usa o padrão (ex.: matéria sem nada guardado no arquivo).
  if (!fs.existsSync(caminho)) return padrao;
  // try/catch: JSON quebrado é um problema real, então avisa qual arquivo e para.
  try {
    // Lê o texto e transforma em objeto.
    return JSON.parse(fs.readFileSync(caminho, 'utf8'));
  } catch (erro) {
    // Mensagem clara com o nome do arquivo.
    console.error(`JSON inválido em ${path.relative(raiz, caminho)}: ${erro.message}`);
    // Código 1 = falhou.
    process.exit(1);
  }
}

// listarArquivos() devolve todos os arquivos de uma pasta (e subpastas), com caminho relativo à raiz.
// Parâmetro: nome da pasta. Pasta ausente devolve lista vazia.
function listarArquivos(pasta) {
  // Caminho completo da pasta.
  const completo = path.join(raiz, pasta);
  // Sem a pasta, nada a listar.
  if (!fs.existsSync(completo)) return [];
  // Lista cada item; pastas são abertas recursivamente.
  return fs.readdirSync(completo, { withFileTypes: true }).flatMap((item) => {
    // Caminho relativo com barras normais (igual no Windows e no Linux).
    const relativo = `${pasta}/${item.name}`;
    // Pasta: entra nela. Arquivo: devolve o caminho.
    return item.isDirectory() ? listarArquivos(relativo) : [relativo];
  });
}

// contar() faz a contagem atual de tudo o que o app tem.
function contar() {
  // Lista de matérias (abas).
  const lista = lerJson(path.join(raiz, 'materias', 'index.json'), []);
  // Resultado por matéria.
  const materias = {};
  for (const m of lista) {
    // Conteúdo da matéria e o que está guardado no arquivo.
    const dados = lerJson(path.join(raiz, 'materias', `${m.id}.json`), {});
    const guardado = lerJson(path.join(raiz, 'materias', 'arquivo', `${m.id}.json`), { questoes: [] });
    // Perguntas por tema.
    const porTema = {};
    (dados.questoes || []).forEach((q) => { porTema[q.topic] = (porTema[q.topic] || 0) + 1; });
    // Guarda todas as contagens da matéria.
    materias[m.id] = {
      aba: m.aba,
      perguntas: (dados.questoes || []).length,
      guardadas: (guardado.questoes || []).length,
      livro: (dados.livro || []).length,
      historias: (dados.historias || []).length,
      jogos: (dados.jogos || []).length,
      termos: (dados.termos || []).length,
      praticas: (dados.praticas || []).length,
      temas: (m.temas || []).map((t) => t.id),
      porTema
    };
  }
  // Todos os ids de elementos da tela (id="...") do index.html, em ordem alfabética.
  const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
  const ids = [...new Set([...html.matchAll(/\sid="([^"$]+)"/g)].map((r) => r[1]))].sort();
  // Arquivos das pastas que formam o app.
  const arquivos = ['js', 'css', 'materias', 'ferramentas'].flatMap(listarArquivos).sort();
  // Quantos arquivos há em material/ (PDFs e .md do Paulo). A pasta fica fora do GitHub,
  // então só a quantidade vai para a base, nunca os nomes.
  const arquivosMaterial = listarArquivos('material');
  const material = arquivosMaterial.length;
  // Quantos desses arquivos estão vazios. Em 20/11/2026, 43 PDFs foram gravados com 0 byte e
  // ninguém percebeu, porque só a quantidade era conferida. statSync().size é o tamanho em bytes.
  const materialVazio = arquivosMaterial.filter((a) => fs.statSync(path.join(raiz, a)).size === 0).length;
  // Devolve tudo junto.
  return { materias, ids, arquivos, material, materialVazio };
}

// conferir() compara a contagem atual com a base e devolve a lista de problemas.
// Parâmetros: atual (de contar()) e base (do inventario.json).
function conferir(atual, base) {
  // Lista de problemas encontrados.
  const problemas = [];
  // Campos que não podem diminuir.
  const campos = ['livro', 'historias', 'jogos', 'termos', 'praticas'];
  for (const [id, antes] of Object.entries(base.materias || {})) {
    // Matéria inteira sumiu.
    const agora = atual.materias[id];
    if (!agora) { problemas.push(`a matéria "${antes.aba}" sumiu`); continue; }
    // Perguntas: conta as do simulado mais as guardadas no arquivo.
    const totalAntes = antes.perguntas + (antes.guardadas || 0);
    const totalAgora = agora.perguntas + agora.guardadas;
    if (totalAgora < totalAntes) problemas.push(`${agora.aba}: perguntas caíram de ${totalAntes} para ${totalAgora} (para tirar do simulado, mova para materias/arquivo/${id}.json)`);
    // Livro, histórias, jogos, termos e práticas.
    campos.forEach((c) => { if (agora[c] < antes[c]) problemas.push(`${agora.aba}: ${c} caiu de ${antes[c]} para ${agora[c]}`); });
    // Temas que existiam e sumiram.
    (antes.temas || []).filter((t) => !agora.temas.includes(t)).forEach((t) => problemas.push(`${agora.aba}: o tema "${t}" sumiu`));
  }
  // Elementos da tela que sumiram do index.html.
  (base.ids || []).filter((i) => !atual.ids.includes(i)).forEach((i) => problemas.push(`index.html: o elemento id="${i}" sumiu`));
  // Arquivos que sumiram.
  (base.arquivos || []).filter((a) => !atual.arquivos.includes(a)).forEach((a) => problemas.push(`o arquivo ${a} sumiu`));
  // Material do Paulo (PDFs e .md em material/): a quantidade não pode cair.
  if ((base.material || 0) > atual.material) problemas.push(`material/: havia ${base.material} arquivos e agora há ${atual.material} (PDF ou .md do Paulo sumiu)`);
  // Arquivo vazio em material/ é o mesmo que arquivo perdido.
  if (atual.materialVazio) problemas.push(`material/: ${atual.materialVazio} arquivo(s) com 0 byte (conteúdo perdido)`);
  // Devolve a lista (vazia = tudo certo).
  return problemas;
}

// tabela() monta o texto Markdown da tabela de conteúdo para o CONTEUDO.md.
// Parâmetro: contagem atual.
function tabela(atual) {
  // Cabeçalho da tabela.
  const linhas = [
    '| Matéria | Perguntas no simulado | Guardadas (fora do simulado) | Livro | Histórias | Jogos | Termos | Práticas |',
    '|---|---|---|---|---|---|---|---|'
  ];
  // Uma linha por matéria.
  Object.values(atual.materias).forEach((m) => {
    linhas.push(`| ${m.aba} | ${m.perguntas} | ${m.guardadas} | ${m.livro} | ${m.historias} | ${m.jogos} | ${m.termos} | ${m.praticas} |`);
  });
  // Perguntas por tema, uma linha por matéria.
  linhas.push('', 'Perguntas por tema:', '');
  Object.values(atual.materias).forEach((m) => {
    linhas.push(`- **${m.aba}:** ${Object.entries(m.porTema).map(([t, n]) => `${t} ${n}`).join(', ')}`);
  });
  // Junta as linhas com quebra de linha.
  return linhas.join('\n');
}

// ===== EXECUÇÃO =====
// Contagem de agora e a base aprovada (sem base ainda: tudo vazio, nada a comparar).
const atual = contar();
const base = lerJson(arquivoBase, { materias: {}, ids: [], arquivos: [] });
// Problemas encontrados.
const problemas = conferir(atual, base);
// Pediu para atualizar a base?
const atualizar = process.argv.includes('--atualizar');

if (problemas.length) {
  // Algo diminuiu ou sumiu: mostra e falha, nos dois modos.
  console.error(`\nINVENTÁRIO: ${problemas.length} problema(s) — conteúdo diminuiu ou sumiu:\n- ` + problemas.join('\n- '));
  console.error('\nNada pode ser apagado sem o Paulo pedir. Desfaça a remoção ou mova o item para materias/arquivo/.');
  process.exit(1);
}

if (atualizar) {
  // Grava a nova base com a data de hoje (dd/mm/aaaa).
  const hoje = new Date().toLocaleDateString('pt-BR');
  fs.writeFileSync(arquivoBase, JSON.stringify({ atualizadoEm: hoje, ...atual }, null, 2) + '\n');
  // Atualiza a tabela entre os marcadores do CONTEUDO.md, se os marcadores existirem.
  if (fs.existsSync(arquivoCartao)) {
    const texto = fs.readFileSync(arquivoCartao, 'utf8');
    const i = texto.indexOf(INICIO), f = texto.indexOf(FIM);
    if (i >= 0 && f > i) {
      // Troca só o que está entre os marcadores.
      const novo = texto.slice(0, i + INICIO.length) + `\n_Contagem de ${hoje}, gerada por \`node ferramentas/inventario.js --atualizar\`._\n\n` + tabela(atual) + '\n' + texto.slice(f);
      fs.writeFileSync(arquivoCartao, novo);
    }
  }
  console.log(`INVENTÁRIO atualizado em ${hoje}: ${Object.keys(atual.materias).length} matérias, ${atual.ids.length} elementos de tela, ${atual.arquivos.length} arquivos, ${atual.material} arquivos em material/.`);
} else {
  // Só conferência: tudo certo.
  console.log('INVENTÁRIO OK: nada diminuiu nem sumiu.');
}
