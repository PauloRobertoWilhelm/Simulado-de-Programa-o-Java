/*
  Arquivo: ferramentas/validar-questoes.js
  Papel: confere o conteúdo de todas as matérias antes de usar no app.

  Como rodar (na pasta do projeto):  node ferramentas/validar-questoes.js

  O que ele confere:
  - cada pergunta tem 4 opções diferentes e um "correct" válido;
  - o tema ("topic") existe em materias/index.json;
  - nenhuma pergunta se repete e nenhuma resposta certa se repete na mesma matéria;
  - a resposta certa NÃO é visivelmente maior que as outras (mais de 10% maior
    que a maior errada), porque isso entrega a resposta;
  - em cada matéria, a certa não pode ser a opção mais longa em mais de 35% das
    perguntas (o acaso, com 4 opções, dá 25%);
  - histórias têm exatamente uma opção certa por cena, e a certa também não pode
    ser visivelmente maior que as erradas;
  - jogos, termos e práticas têm os campos necessários.

  Erros fazem o programa terminar com código 1. Avisos só aparecem na tela.
*/

// fs lê arquivos do disco; path monta caminhos que funcionam no Windows e no Linux.
const fs = require('fs');
const path = require('path');

// pasta é a pasta materias/, ao lado desta pasta ferramentas/.
const pasta = path.join(__dirname, '..', 'materias');

// LIMITE: quanto a certa pode passar da maior errada. 1.10 = até 10% maior.
// Diminuir deixa a regra mais rígida; aumentar deixa passar respostas mais compridas.
const LIMITE = 1.10;

// erros e avisos guardam as mensagens encontradas.
const erros = [];
const avisos = [];

// normalizar() tira acentos, maiúsculas e pontuação, para comparar textos.
function normalizar(texto) {
  // Converte para texto, minúsculas e separa os acentos das letras.
  return String(texto).toLowerCase().normalize('NFD')
    // Remove os acentos que ficaram separados.
    .replace(/[̀-ͯ]/g, '')
    // Troca tudo que não é letra ou número por espaço e tira espaços das pontas.
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

// exato() compara sem mudar o conteúdo: só minúsculas e espaços das pontas.
// Serve para respostas onde a pontuação importa, como "/25" e "25" ou "::1" e ":::1".
function exato(texto) {
  // Converte para texto, deixa em minúsculas e tira espaços das pontas.
  return String(texto).toLowerCase().trim();
}

// textoVisivel() tira as marcações <b> para medir só o texto que aparece.
function textoVisivel(texto) {
  // Remove qualquer etiqueta HTML do texto.
  return String(texto).replace(/<[^>]+>/g, '');
}

// lerJson() lê um arquivo JSON e avisa qual arquivo quebrou, se der erro.
function lerJson(arquivo) {
  // try/catch: se o JSON estiver mal escrito, registra o erro em vez de travar.
  try {
    // Lê o texto do arquivo e transforma em objeto JavaScript.
    return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  } catch (erro) {
    // Guarda a mensagem com o nome do arquivo para facilitar o conserto.
    erros.push(`${path.basename(arquivo)}: JSON inválido (${erro.message})`);
    // Devolve null para quem chamou saber que não deu.
    return null;
  }
}

// Lê a lista de matérias.
const lista = lerJson(path.join(pasta, 'index.json')) || [];

// Confere cada matéria da lista.
for (const materia of lista) {
  // Abre o arquivo da matéria, por exemplo materias/redes.json.
  const dados = lerJson(path.join(pasta, `${materia.id}.json`));
  // Se não abriu, passa para a próxima matéria.
  if (!dados) continue;

  // temas guarda os ids de tema válidos dessa matéria.
  const temas = new Set(materia.temas.map((tema) => tema.id));
  // Conjuntos para achar enunciados e respostas certas repetidos.
  const enunciados = new Set();
  const certas = new Map();
  // Contador de quantas vezes a certa é a opção mais longa.
  let certaMaisLonga = 0;
  // Contador de perguntas por tema, para o resumo.
  const porTema = {};

  // Perguntas trazidas de outro app (campo "origem"), contadas por tipo de problema.
  // Elas entram sem mudar o texto; fora do padrão viram um aviso só, para revisar depois.
  const foraDoPadrao = {};
  // Confere cada pergunta.
  (dados.questoes || []).forEach((q, i) => {
    // rotulo identifica a pergunta nas mensagens.
    const rotulo = `${materia.id} #${i + 1} "${String(q.statement).slice(0, 50)}"`;
    // Pergunta importada? (tem o campo "origem", como "plataforma-estudos").
    const importada = Boolean(q.origem);
    // falha(): problema de padrão. Na pergunta normal é erro; na importada só conta para o aviso.
    // Parâmetros: tipo (nome curto do problema, para contar) e mensagem (texto do erro).
    const falha = (tipo, mensagem) => {
      if (importada) foraDoPadrao[tipo] = (foraDoPadrao[tipo] || 0) + 1;
      else erros.push(mensagem);
    };
    // Conta a pergunta no tema dela.
    porTema[q.topic] = (porTema[q.topic] || 0) + 1;

    // Precisa de exatamente 4 opções (importada: aceita de 2 a 6, como no app de origem).
    const qtdOpcoes = Array.isArray(q.options) ? q.options.length : 0;
    if (importada ? (qtdOpcoes < 2 || qtdOpcoes > 6) : qtdOpcoes !== 4) erros.push(`${rotulo}: número de opções inválido (${qtdOpcoes})`);
    else if (importada && qtdOpcoes !== 4) foraDoPadrao['sem 4 opções'] = (foraDoPadrao['sem 4 opções'] || 0) + 1;
    // O índice da certa precisa existir.
    if (!(q.correct >= 0 && q.correct < (q.options || []).length)) erros.push(`${rotulo}: "correct" fora das opções`);
    // O tema precisa existir em index.json.
    if (!temas.has(q.topic)) erros.push(`${rotulo}: tema "${q.topic}" não existe em index.json`);
    // Tema com conteúdos ("assuntos"): a pergunta precisa dizer de qual é, senão ela some da escolha.
    const temaDela = materia.temas.find((tema) => tema.id === q.topic);
    if (temaDela && temaDela.assuntos && !temaDela.assuntos.some((a) => a.id === q.assunto)) erros.push(`${rotulo}: sem "assunto" válido do tema ${q.topic}`);

    // As 4 opções precisam ser diferentes entre si.
    if (new Set((q.options || []).map(exato)).size !== (q.options || []).length) falha('opções repetidas', `${rotulo}: opções repetidas`);
    // Toda pergunta precisa de explicação.
    if (!q.explain) erros.push(`${rotulo}: falta "explain"`);

    // Enunciado repetido (mesmo texto e mesmo código) é erro.
    const chave = normalizar(q.statement) + '|' + normalizar(q.code || '');
    if (enunciados.has(chave)) falha('enunciado repetido', `${rotulo}: pergunta repetida`);
    enunciados.add(chave);

    // Resposta certa repetida na mesma matéria é erro.
    const certa = (q.options || [])[q.correct];
    const chaveCerta = exato(certa);
    if (certas.has(chaveCerta)) falha('resposta certa repetida', `${rotulo}: resposta certa igual à da pergunta ${certas.get(chaveCerta)}`);
    certas.set(chaveCerta, i + 1);

    // Medida de tamanho: a certa contra as erradas.
    const tamanhoCerta = textoVisivel(certa).length;
    const tamanhosErradas = (q.options || []).filter((_, j) => j !== q.correct).map((o) => textoVisivel(o).length);
    const maiorErrada = Math.max(...tamanhosErradas);
    // Conta quando a certa é a mais longa de todas.
    if (tamanhoCerta > maiorErrada) certaMaisLonga++;
    // Se a certa passa de 10% a maior errada, ela fica visível demais: é erro.
    // A diferença mínima de 3 letras evita barrar respostas curtas, como "22" contra "8".
    if (tamanhoCerta > maiorErrada * LIMITE && tamanhoCerta - maiorErrada > 3) {
      falha('certa visivelmente maior', `${rotulo}: a resposta certa é visivelmente maior (${tamanhoCerta} contra ${maiorErrada} letras)`);
    }

    // Aviso: palavra longa da certa aparece no enunciado e em nenhuma errada.
    const palavrasEnunciado = new Set(normalizar(q.statement).split(' '));
    const palavrasErradas = new Set((q.options || []).filter((_, j) => j !== q.correct).flatMap((o) => normalizar(o).split(' ')));
    const dica = normalizar(certa).split(' ').find((p) => p.length >= 7 && palavrasEnunciado.has(p) && !palavrasErradas.has(p));
    if (dica && !importada) avisos.push(`${rotulo}: a palavra "${dica}" do enunciado só aparece na resposta certa`);
  });

  // Um aviso só, por matéria, com o resumo das perguntas importadas fora do padrão.
  const tiposFora = Object.entries(foraDoPadrao);
  if (tiposFora.length) avisos.push(`${materia.id}: perguntas importadas fora do padrão, para revisar depois: ${tiposFora.map(([t, n]) => `${t} ${n}`).join(', ')}`);

  // Confere as histórias: uma opção certa por cena.
  (dados.historias || []).forEach((h) => {
    (h.cenas || []).forEach((cena, c) => {
      const certasCena = (cena.opcoes || []).filter((o) => o.certa).length;
      if (certasCena !== 1) erros.push(`${materia.id} história "${h.titulo}" cena ${c + 1}: precisa de 1 opção certa`);
      if (!(cena.opcoes || []).every((o) => o.retorno)) erros.push(`${materia.id} história "${h.titulo}" cena ${c + 1}: opção sem retorno`);
      // Tamanho da escolha certa contra a maior errada, com a mesma regra das perguntas.
      const certaCena = (cena.opcoes || []).find((o) => o.certa);
      const maiorErradaCena = Math.max(...(cena.opcoes || []).filter((o) => !o.certa).map((o) => textoVisivel(o.texto).length));
      if (certaCena && textoVisivel(certaCena.texto).length > maiorErradaCena * LIMITE && textoVisivel(certaCena.texto).length - maiorErradaCena > 3) {
        erros.push(`${materia.id} história "${h.titulo}" cena ${c + 1}: a escolha certa é visivelmente maior (${textoVisivel(certaCena.texto).length} contra ${maiorErradaCena} letras)`);
      }
    });
    if (!h.fim) erros.push(`${materia.id} história "${h.titulo}": falta "fim"`);
  });

  // Confere os jogos.
  (dados.jogos || []).forEach((j) => {
    if (j.tipo === 'classificar') {
      // Cada item precisa cair numa categoria que existe.
      j.itens.forEach((item) => {
        if (!j.categorias.includes(item.categoria)) erros.push(`${materia.id} jogo "${j.nome}": "${item.texto}" com categoria inexistente`);
      });
      // Cada categoria precisa ter pelo menos um item.
      j.categorias.forEach((cat) => {
        if (!j.itens.some((item) => item.categoria === cat)) erros.push(`${materia.id} jogo "${j.nome}": categoria "${cat}" sem itens`);
      });
    } else if (j.tipo === 'ordenar') {
      // Os passos da sequência precisam ser diferentes.
      if (new Set(j.sequencia).size !== j.sequencia.length) erros.push(`${materia.id} jogo "${j.nome}": passos repetidos`);
    } else {
      erros.push(`${materia.id} jogo "${j.nome}": tipo "${j.tipo}" desconhecido`);
    }
  });

  // Confere os termos de voz e as práticas de digitar.
  (dados.termos || []).forEach((t) => {
    if (!t.termo || !t.pergunta || !(t.aceitas || []).length || !t.explicacao) erros.push(`${materia.id} termo "${t.termo}": campo faltando`);
  });
  (dados.praticas || []).forEach((p) => {
    if (!p.enunciado || !(p.aceitas || []).length || !p.explicacao) erros.push(`${materia.id} prática "${String(p.enunciado).slice(0, 40)}": campo faltando`);
  });
  (dados.livro || []).forEach((cap) => {
    if (!cap.titulo || !(cap.paginas || []).length || !(cap.guardar || []).length) erros.push(`${materia.id} capítulo "${cap.titulo}": campo faltando`);
  });

  // Confere a aba Revisão: tema existente, blocos conhecidos e perguntas com resposta.
  ((dados.revisao || {}).secoes || []).forEach((secao) => {
    // "bim2" junta o bimestre inteiro, então também vale como tema.
    // "c:tema.assunto" aponta para conteúdos: cada um precisa ter pergunta.
    if (secao.tema.startsWith('c:')) {
      secao.tema.slice(2).split('+').forEach((c) => { if (!(dados.questoes || []).some((q) => `${q.topic}.${q.assunto}` === c)) erros.push(`${materia.id} revisão "${secao.titulo}": conteúdo "${c}" sem perguntas`); });
    } else if (secao.tema !== 'bim2' && !temas.has(secao.tema)) erros.push(`${materia.id} revisão "${secao.titulo}": tema "${secao.tema}" não existe`);
    // Cada bloco precisa ser de um tipo que js/revisao.js sabe desenhar; tabela com o mesmo número de colunas em todas as linhas.
    secao.blocos.forEach((b) => {
      if (!['texto', 'lista', 'passos', 'tabela', 'codigo'].includes(b.tipo)) erros.push(`${materia.id} revisão "${secao.titulo}": bloco "${b.tipo}" desconhecido`);
      if (b.tipo === 'tabela' && b.linhas.some((linha) => linha.length !== b.cabecalho.length)) erros.push(`${materia.id} revisão "${secao.titulo}": tabela com colunas diferentes`);
    });
    // Pergunta sem resposta não ajuda ninguém.
    if (!(secao.perguntas || []).length || secao.perguntas.some((q) => !q.pergunta || !q.resposta)) erros.push(`${materia.id} revisão "${secao.titulo}": pergunta ou resposta faltando`);
  });

  // Resumo da matéria.
  const total = (dados.questoes || []).length;
  const pct = total ? Math.round((certaMaisLonga / total) * 100) : 0;
  // Se a certa costuma ser a mais longa, chutar "a maior" vira estratégia: é erro.
  if (pct > 35) erros.push(`${materia.id}: a certa é a opção mais longa em ${pct}% das perguntas (máximo 35%)`);
  console.log(`${materia.id.padEnd(12)} perguntas ${String(total).padStart(3)} | certa é a mais longa em ${pct}% | livro ${(dados.livro || []).length} | termos ${(dados.termos || []).length} | práticas ${(dados.praticas || []).length} | histórias ${(dados.historias || []).length} | jogos ${(dados.jogos || []).length}`);
  console.log(`             temas: ${JSON.stringify(porTema)}`);
}

// Mostra avisos e erros no fim.
if (avisos.length) console.log(`\nAVISOS (${avisos.length}):\n- ` + avisos.join('\n- '));
if (erros.length) console.log(`\nERROS (${erros.length}):\n- ` + erros.join('\n- '));
console.log(`\n${erros.length ? 'FALHOU' : 'OK'}: ${erros.length} erros, ${avisos.length} avisos`);
// Código de saída 1 quando há erros, para quem chamou saber que falhou.
process.exit(erros.length ? 1 : 0);
