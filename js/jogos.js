/*
  Arquivo: js/jogos.js
  Papel no sistema: desenha a parte "Jogos" de cada matéria.

  Existem dois tipos de jogo, escolhidos pelo campo "tipo" no JSON:
  - "classificar": aparece um item por vez e a pessoa escolhe a categoria;
  - "ordenar": a pessoa toca nos itens na sequência certa.

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

  function montar(container, jogos) {
    function mostrarLista() {
      container.replaceChildren();

      if (!jogos.length) {
        container.append(criar('p', 'activity-empty', 'Esta matéria ainda não tem jogos.'));
        return;
      }

      const lista = criar('div', 'activity-list');
      jogos.forEach((jogo) => {
        const cartao = criar('button', 'activity-card');
        cartao.type = 'button';
        cartao.append(criar('strong', '', jogo.nome), criar('span', '', jogo.instrucao));
        cartao.addEventListener('click', () => iniciar(jogo));
        lista.append(cartao);
      });
      container.append(lista);
    }

    function iniciar(jogo) {
      if (jogo.tipo === 'ordenar') jogarOrdenar(jogo);
      else jogarClassificar(jogo, embaralhar(jogo.itens), 0, 0);
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
