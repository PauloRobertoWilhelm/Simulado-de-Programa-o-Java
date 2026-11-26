/*
  Arquivo: js/jogos.js
  Papel no sistema: desenha a parte "Jogos" de cada matéria.

  Existem dois tipos de jogo, escolhidos pelo campo "tipo" no JSON:
  - "classificar": aparece um item por vez e a pessoa escolhe a categoria;
  - "ordenar": a pessoa toca nos itens na sequência certa.

  E um terceiro, montado sozinho a partir das perguntas da matéria:
  - "Certo ou errado?": aparece a pergunta e UMA resposta. A pessoa diz se ela é a
    certa. Como só existe uma resposta na tela, não dá para chutar "a mais comprida".

  Cada matéria tem seus próprios jogos em materias/*.json, no campo "jogos".
  Para criar um jogo novo de um desses tipos, basta escrever no JSON.
*/
window.Jogos = (function () {
  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function som(tipo) {
    if (window.tocarSom) window.tocarSom(tipo);
  }

  // semEtiquetas() tira as marcações HTML (<b>, <code>) das explicações, para mostrar como texto puro.
  // Parâmetro: texto. Devolve o texto sem as etiquetas.
  function semEtiquetas(texto) {
    // Troca qualquer "<...>" por nada e depois desfaz os códigos &lt; &gt; &amp; (viram < > &).
    return String(texto || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }

  // montar() desenha a lista de jogos da matéria.
  // Parâmetros: container (onde desenhar), jogos (do JSON), questoes (perguntas da matéria)
  // e idMateria (para pedir contas sorteadas ao js/geradores.js).
  function montar(container, jogos, questoes = [], idMateria = '') {
    // O "Certo ou errado?" só aparece se houver pelo menos 10 perguntas para sortear.
    const certoErrado = questoes.length >= 10
      ? { tipo: 'certoerrado', nome: 'Certo ou errado?', instrucao: 'Aparece uma pergunta e só UMA resposta. Diga se ela é a certa. Sem alternativas, não dá para chutar pelo tamanho.' }
      : null;
    // Lista final: o jogo automático vem primeiro, depois os do JSON.
    const todos = certoErrado ? [certoErrado, ...jogos] : jogos;

    function mostrarLista() {
      container.replaceChildren();

      if (!todos.length) {
        container.append(criar('p', 'activity-empty', 'Esta matéria ainda não tem jogos.'));
        return;
      }

      const lista = criar('div', 'activity-list');
      todos.forEach((jogo) => {
        const cartao = criar('button', 'activity-card');
        cartao.type = 'button';
        cartao.append(criar('strong', '', jogo.nome), criar('span', '', jogo.instrucao));
        cartao.addEventListener('click', () => iniciar(jogo));
        lista.append(cartao);
      });
      container.append(lista);
    }

    function iniciar(jogo) {
      if (jogo.tipo === 'certoerrado') jogarCertoErrado(jogo, rodadaCertoErrado(), 0, 0);
      else if (jogo.tipo === 'ordenar') jogarOrdenar(jogo);
      else jogarClassificar(jogo, embaralhar(jogo.itens), 0, 0);
    }

    // rodadaCertoErrado() sorteia 10 cartas para o "Certo ou errado?".
    // Cada carta tem a pergunta, UMA resposta e se essa resposta é a certa.
    function rodadaCertoErrado() {
      // Em Redes, 3 das 10 cartas são contas com números novos (js/geradores.js).
      const contas = window.Geradores && window.Geradores.tem(idMateria) ? window.Geradores.gerar(idMateria, 3) : [];
      // O resto vem das perguntas fixas, sorteadas.
      const fixas = embaralhar(questoes).slice(0, 10 - contas.length);
      // Mistura as duas listas e transforma cada pergunta numa carta.
      return embaralhar([...fixas, ...contas]).map((q) => {
        // Metade das vezes mostra a certa; na outra metade, uma errada sorteada.
        const mostraCerta = Math.random() < 0.5;
        // Lista só com as erradas.
        const erradas = q.options.filter((_, i) => i !== q.correct);
        // Texto que vai aparecer como "Resposta:".
        const resposta = mostraCerta ? q.options[q.correct] : erradas[Math.floor(Math.random() * erradas.length)];
        // A carta guarda tudo o que a tela e o retorno precisam.
        // bloco: as afirmativas (I, II, III...) das perguntas no formato de prova; sem elas a pergunta não faz sentido.
        return { pergunta: q.statement, codigo: q.code, bloco: q.bloco, resposta, certa: mostraCerta, gabarito: q.options[q.correct], porque: semEtiquetas(q.explain) };
      });
    }

    // jogarCertoErrado() mostra uma carta e espera "É a certa" ou "Não é".
    // Parâmetros: jogo, cartas (as 10 da rodada), indice (carta atual) e acertos (até agora).
    function jogarCertoErrado(jogo, cartas, indice, acertos) {
      // Painel limpo com o título do jogo.
      const { painel, titulo } = abrirPainel(jogo);
      // Carta da vez.
      const carta = cartas[indice];
      // Última carta? Muda o texto do botão para "Ver resultado".
      const ultimo = indice === cartas.length - 1;

      // Contador e a pergunta (textContent: o texto aparece como texto, nunca como HTML).
      painel.append(criar('p', 'activity-step', `Carta ${indice + 1} de ${cartas.length}`), criar('p', 'game-item ce-pergunta', carta.pergunta));
      // Pergunta com código (Programação) mostra o código num bloco próprio.
      if (carta.codigo) painel.append(criar('pre', 'code', carta.codigo));
      // Pergunta no formato de prova: as afirmativas, uma por linha (mesmo visual da prova, css/niveis.css).
      if (Array.isArray(carta.bloco)) {
        // Caixa das afirmativas.
        const afirmativas = criar('div', 'q-bloco');
        // Cada afirmativa num parágrafo, sem marcações HTML.
        carta.bloco.forEach((linha) => afirmativas.append(criar('p', '', semEtiquetas(linha))));
        painel.append(afirmativas);
      }
      // Caixa da resposta que vai ser julgada.
      const caixa = criar('p', 'ce-resposta');
      caixa.append(criar('span', '', 'Resposta:'), document.createTextNode(carta.resposta));
      painel.append(caixa);

      // Os dois botões e a área do retorno.
      const opcoes = criar('div', 'game-categories');
      const retorno = criar('div', 'activity-feedback');
      // aria-live: leitores de tela anunciam o retorno quando ele aparece.
      retorno.setAttribute('aria-live', 'polite');
      const proximo = criar('button', 'btn hidden', ultimo ? 'Ver resultado' : 'Próxima carta');
      proximo.type = 'button';

      // Cria "✔ É a certa" (valor true) e "✘ Não é a certa" (valor false).
      [[true, '✔ É a certa'], [false, '✘ Não é a certa']].forEach(([valor, rotulo]) => {
        const botao = criar('button', 'activity-option', rotulo);
        botao.type = 'button';
        botao.addEventListener('click', () => {
          // Acertou se o que a pessoa disse bate com a carta.
          const acertou = valor === carta.certa;
          // Trava os dois botões e pinta o botão que era o correto (o 1º é "É a certa").
          opcoes.querySelectorAll('button').forEach((b, i) => {
            b.disabled = true;
            if ((i === 0) === carta.certa) b.classList.add('correct');
          });
          if (!acertou) botao.classList.add('wrong');
          if (acertou) acertos++;
          som(acertou ? 'correct' : 'wrong');
          // Quando a resposta mostrada era errada, o retorno ensina qual era a certa.
          const gabarito = carta.certa ? 'Essa é a certa.' : `A certa é: ${carta.gabarito}.`;
          retorno.textContent = `${acertou ? 'Acertou!' : 'Errou.'} ${gabarito} ${carta.porque}`;
          retorno.className = `activity-feedback ${acertou ? 'ok' : 'no'}`;
          proximo.classList.remove('hidden');
          proximo.focus();
        });
        opcoes.append(botao);
      });

      // Próxima carta, ou o placar no fim.
      proximo.addEventListener('click', () => {
        if (ultimo) mostrarFim(jogo, `Você acertou ${acertos} de ${cartas.length}.`, 'Jogue de novo: as cartas e as respostas mudam a cada rodada.');
        else jogarCertoErrado(jogo, cartas, indice + 1, acertos);
      });

      painel.append(opcoes, retorno, proximo);
      titulo.focus();
    }

    // abrirPainel() cria o painel com o título do jogo e devolve os dois elementos.
    function abrirPainel(jogo) {
      container.replaceChildren();
      const painel = criar('div', 'activity-panel');
      const titulo = criar('h2', 'activity-title', jogo.nome);
      titulo.tabIndex = -1;
      painel.append(titulo);
      container.append(painel);
      return { painel, titulo };
    }

    function jogarClassificar(jogo, itens, indice, acertos) {
      const { painel, titulo } = abrirPainel(jogo);
      const item = itens[indice];
      const ultimo = indice === itens.length - 1;

      painel.append(
        criar('p', 'activity-step', `Item ${indice + 1} de ${itens.length}`),
        criar('p', 'game-item', item.texto)
      );

      const opcoes = criar('div', 'game-categories');
      const retorno = criar('div', 'activity-feedback');
      retorno.setAttribute('aria-live', 'polite');
      const proximo = criar('button', 'btn hidden', ultimo ? 'Ver resultado' : 'Próximo');
      proximo.type = 'button';

      jogo.categorias.forEach((categoria) => {
        const botao = criar('button', 'activity-option', categoria);
        botao.type = 'button';
        botao.addEventListener('click', () => {
          const certo = categoria === item.categoria;
          opcoes.querySelectorAll('button').forEach((opcao) => {
            opcao.disabled = true;
            if (opcao.textContent === item.categoria) opcao.classList.add('correct');
          });
          if (!certo) botao.classList.add('wrong');
          if (certo) acertos++;
          som(certo ? 'correct' : 'wrong');

          retorno.textContent = `${certo ? 'Certo!' : `É ${item.categoria}.`} ${item.porque}`;
          retorno.className = `activity-feedback ${certo ? 'ok' : 'no'}`;
          proximo.classList.remove('hidden');
          proximo.focus();
        });
        opcoes.append(botao);
      });

      proximo.addEventListener('click', () => {
        if (ultimo) mostrarFim(jogo, `Você acertou ${acertos} de ${itens.length}.`);
        else jogarClassificar(jogo, itens, indice + 1, acertos);
      });

      painel.append(opcoes, retorno, proximo);
      titulo.focus();
    }

    function jogarOrdenar(jogo) {
      const { painel, titulo } = abrirPainel(jogo);
      const sequencia = jogo.sequencia;
      let colocados = 0;
      let erros = 0;

      painel.append(criar('p', 'activity-step', jogo.instrucao));

      // Uma linha numerada para cada posição da sequência.
      const lugares = criar('ol', 'game-slots');
      sequencia.forEach(() => lugares.append(criar('li', 'game-slot', '')));

      const pecas = criar('div', 'game-pieces');
      const retorno = criar('div', 'activity-feedback');
      retorno.setAttribute('aria-live', 'polite');

      embaralhar(sequencia).forEach((texto) => {
        const botao = criar('button', 'activity-option', texto);
        botao.type = 'button';
        botao.addEventListener('click', () => {
          if (texto === sequencia[colocados]) {
            lugares.children[colocados].textContent = texto;
            lugares.children[colocados].classList.add('filled');
            colocados++;
            botao.remove();
            retorno.textContent = '';
            retorno.className = 'activity-feedback';
            som('correct');

            if (colocados === sequencia.length) {
              const resumo = erros === 0
                ? 'Sequência perfeita, sem nenhum erro.'
                : `Sequência completa, com ${erros} ${erros === 1 ? 'erro' : 'erros'}.`;
              mostrarFim(jogo, resumo, jogo.explicacao);
            } else {
              pecas.querySelector('button').focus();
            }
          } else {
            erros++;
            retorno.textContent = `Ainda não. Procure o que vem na posição ${colocados + 1}.`;
            retorno.className = 'activity-feedback no';
            som('wrong');
          }
        });
        pecas.append(botao);
      });

      painel.append(lugares, pecas, retorno);
      titulo.focus();
    }

    function mostrarFim(jogo, resumo, explicacao) {
      const { painel, titulo } = abrirPainel(jogo);
      painel.append(criar('p', 'activity-score', resumo));
      if (explicacao) painel.append(criar('p', 'story-text', explicacao));

      const repetir = criar('button', 'btn', 'Jogar de novo');
      repetir.type = 'button';
      repetir.addEventListener('click', () => iniciar(jogo));

      const voltar = criar('button', 'btn btn-ghost', 'Voltar aos jogos');
      voltar.type = 'button';
      voltar.addEventListener('click', mostrarLista);

      painel.append(repetir, voltar);
      titulo.focus();
    }

    mostrarLista();
  }

  return { montar };
})();
