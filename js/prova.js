/*
  Arquivo: js/prova.js
  Papel no sistema: desenha a aba "Prova" de uma matéria, ao lado de Livro, Perguntas e Histórias.

  O que aparece:
  - a prova de recuperação (20, 30, 50 ou 100 questões, com todos os conteúdos das provas);
  - o botão que faz as questões oficiais em sequência, com cronômetro;
  - cada questão oficial, com as alternativas, a resposta e a explicação escondidas até tocar,
    e o botão "Treinar parecidas", que abre perguntas diferentes do mesmo conteúdo.

  Os dados vêm de materias/<arquivo de provas>.json (hoje provasprog.json). A matéria aponta para ele
  pelo campo "prova" em materias/index.json; o index.html junta tudo e chama montar().
*/

// A função roda uma vez e guarda só montar() em window.Prova.
window.Prova = (() => {
  // criar() faz um elemento da página.
  // Parâmetros: tag (tipo do elemento), classe (do CSS) e texto (opcional).
  function criar(tag, classe, texto) {
    // Cria o elemento.
    const elemento = document.createElement(tag);
    // Coloca a classe, se houver.
    if (classe) elemento.className = classe;
    // textContent impede que o texto vire código.
    if (texto !== undefined) elemento.textContent = texto;
    // Devolve o elemento pronto.
    return elemento;
  }

  // botao() faz um botão que executa uma função ao ser tocado.
  // Parâmetros: classe, texto e aoClicar (a função chamada no toque).
  function botao(classe, texto, aoClicar) {
    // Cria o botão.
    const elemento = criar('button', classe, texto);
    // type="button" impede envio de formulário.
    elemento.type = 'button';
    // Liga o toque à função.
    elemento.addEventListener('click', aoClicar);
    // Devolve o botão.
    return elemento;
  }

  // nomeDaProva() tira o nome curto da origem: "2ª prova oficial (27/11/2026)" vira "2ª prova".
  // Parâmetro: origem (texto). Sem número na frente, devolve "Prova".
  function nomeDaProva(origem) {
    // Procura "1ª prova", "2ª prova"... no começo do texto.
    const achado = String(origem).match(/^\d+ª prova/);
    // Devolve o nome achado ou um nome genérico.
    return achado ? achado[0] : 'Prova';
  }

  // quadroRecuperacao() faz o quadro com os botões 20, 30, 50 e 100.
  // Parâmetro: dados (o mesmo de montar()). Devolve o quadro ou null, se não houver prova de recuperação.
  function quadroRecuperacao(dados) {
    // Sem prova de recuperação: nada a desenhar.
    if (!dados.recuperacao) return null;
    // Caixa com borda na cor da matéria (css/estudo.css).
    const caixa = criar('div', 'picker picker-recuperacao');
    // Título vindo do JSON.
    caixa.append(criar('h3', '', dados.recuperacao.titulo));
    // Explicação curta.
    caixa.append(criar('p', 'picker-dica', 'Cai tudo das provas, com pelo menos uma pergunta de cada conteúdo. Só perguntas parecidas, nunca as mesmas da prova. Cada vez sai uma prova diferente.'));
    // Grade com o mesmo visual dos tamanhos de rodada (classe len-grid).
    const grade = criar('div', 'len-grid');
    // Um botão para cada tamanho.
    dados.recuperacao.tamanhos.forEach((quantas) => {
      // Botão com a classe "len" (mesmo visual em todos os temas de cor).
      const b = botao('len', '', () => dados.recuperar(quantas));
      // Número grande e a palavra embaixo.
      b.append(criar('span', 'n', String(quantas)), criar('span', 'l', 'questões'));
      // Coloca na grade.
      grade.append(b);
    });
    // Junta a grade na caixa.
    caixa.append(grade);
    // Devolve o quadro.
    return caixa;
  }

  // cartaoQuestao() faz o cartão de uma questão oficial.
  // Parâmetros: q (a questão), numero (a posição na prova) e dados (o mesmo de montar()).
  function cartaoQuestao(q, numero, dados) {
    // Cartão.
    const cartao = criar('article', 'prova-questao');
    // Conteúdo da matéria a que a questão pertence, como "c:prova-basico.if".
    const conteudo = `c:${dados.prefixo}${q.parecidas}`;
    // Linha de cima: número e nome do conteúdo.
    cartao.append(criar('p', 'prova-numero', `Questão ${numero} · ${dados.rotuloDe(conteudo)}`));
    // Enunciado.
    cartao.append(criar('p', 'prova-enunciado', q.statement));
    // Código, colorido como nas perguntas (js/visual.js já protege os sinais < e >).
    if (q.code) {
      // Caixa de código.
      const codigo = criar('pre', 'code');
      // Coloca o código colorido.
      codigo.innerHTML = window.Visual.colorirJava(q.code);
      // Põe no cartão.
      cartao.append(codigo);
    }
    // Alternativas com letra A, B, C... (type="A" faz a lista numerar com letras).
    const lista = criar('ol', 'prova-opcoes');
    lista.type = 'A';
    // Um item por alternativa.
    q.options.forEach((opcao) => lista.append(criar('li', '', opcao)));
    // Põe no cartão.
    cartao.append(lista);
    // Resposta escondida: details abre e fecha sozinho.
    const resposta = criar('details', 'prova-resposta');
    // Linha que abre a resposta.
    resposta.append(criar('summary', '', 'Ver a resposta'));
    // Letra certa: 65 é o código do "A"; somando a posição sai B, C...
    const letra = String.fromCharCode(65 + q.correct);
    // Texto da certa.
    resposta.append(criar('p', 'prova-certa', `Certa: ${letra}) ${q.options[q.correct]}`));
    // Explicação: vem do JSON do próprio app e usa <b>, por isso innerHTML (o mesmo que a tela da pergunta faz).
    const explica = criar('p', 'prova-explica');
    explica.innerHTML = q.explain;
    resposta.append(explica);
    // Põe no cartão.
    cartao.append(resposta);
    // Quantas perguntas parecidas existem desse conteúdo.
    const quantas = dados.quantasDe(conteudo);
    // Botão que abre até 10 parecidas (diferentes da oficial, do mesmo conteúdo).
    if (quantas) cartao.append(botao('btn btn-ghost prova-treinar', `Treinar parecidas (${quantas})`, () => dados.treinar(conteudo, 10)));
    // Devolve o cartão.
    return cartao;
  }

  // montar() desenha a aba Prova inteira.
  // Parâmetros: container (onde desenhar) e dados = { oficiais, prefixo, recuperacao, quantasDe(topic),
  // rotuloDe(topic), treinar(topic, quantas), recuperar(quantas) }. dados null = matéria sem prova.
  function montar(container, dados) {
    // Limpa o que havia antes.
    container.replaceChildren();
    // Matéria sem prova: nada a desenhar.
    if (!dados || !dados.oficiais.length) return;
    // Texto de abertura.
    container.append(criar('p', 'rev-intro', 'As questões que caíram nas provas, com a resposta e a explicação. Em cada uma, "Treinar parecidas" abre perguntas diferentes do mesmo assunto, para você não errar de novo.'));
    // Quadro da prova de recuperação (se houver).
    const quadro = quadroRecuperacao(dados);
    if (quadro) container.append(quadro);
    // Botão que faz todas as questões oficiais em sequência, com cronômetro e nota.
    container.append(botao('btn prova-todas', `Fazer as ${dados.oficiais.length} questões das provas`, () => dados.treinar(`${dados.prefixo}oficiais`, dados.oficiais.length)));
    // Agrupa por prova, na ordem em que aparecem no arquivo ("2ª prova", depois "1ª prova").
    const grupos = new Map();
    dados.oficiais.forEach((q) => {
      // Nome curto da prova desta questão.
      const nome = nomeDaProva(q.origem);
      // Cria o grupo na primeira vez.
      if (!grupos.has(nome)) grupos.set(nome, []);
      // Guarda a questão no grupo.
      grupos.get(nome).push(q);
    });
    // Um bloco que abre e fecha para cada prova.
    grupos.forEach((questoes, nome) => {
      // details: abre e fecha sem JavaScript; a primeira prova já vem aberta.
      const bloco = criar('details', 'rev-secao');
      bloco.open = container.querySelectorAll('.rev-secao').length === 0;
      // Título com quantas questões.
      bloco.append(criar('summary', '', `${nome} · ${questoes.length} questões`));
      // Miolo com os cartões.
      const miolo = criar('div', 'rev-miolo');
      // Um cartão por questão, numerado dentro da prova.
      questoes.forEach((q, i) => miolo.append(cartaoQuestao(q, i + 1, dados)));
      // Junta tudo.
      bloco.append(miolo);
      container.append(bloco);
    });
  }

  // Só montar() fica visível para o resto do app.
  return { montar };
})();
