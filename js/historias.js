/*
  Arquivo: js/historias.js
  Papel no sistema: desenha a parte "Histórias" de cada matéria.

  Como funciona:
  1) mostrarLista() exibe um cartão para cada história da matéria;
  2) mostrarCena() exibe o texto de uma cena e as opções de decisão;
  3) ao escolher, a pessoa vê o retorno e passa para a próxima cena;
  4) mostrarFim() fecha a história com a contagem de acertos.

  As histórias ficam nos arquivos materias/*.json, no campo "historias".
  Para criar uma história nova, basta escrever no JSON: este código não muda.
*/
window.Historias = (function () {
  // criar() monta um elemento HTML. Usa textContent, então o texto do JSON
  // nunca é interpretado como código.
  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  // embaralhar() muda a ordem das opções, para a certa não ficar sempre em cima.
  function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function montar(container, historias) {
    function mostrarLista() {
      container.replaceChildren();

      if (!historias.length) {
        container.append(criar('p', 'activity-empty', 'Esta matéria ainda não tem histórias.'));
        return;
      }

      const lista = criar('div', 'activity-list');
      historias.forEach((historia) => {
        const cartao = criar('button', 'activity-card');
        cartao.type = 'button';
        cartao.append(criar('strong', '', historia.titulo), criar('span', '', historia.resumo));
        cartao.addEventListener('click', () => mostrarCena(historia, 0, 0));
        lista.append(cartao);
      });
      container.append(lista);
    }

    function mostrarCena(historia, indice, acertos) {
      const cena = historia.cenas[indice];
      const ultima = indice === historia.cenas.length - 1;
      container.replaceChildren();

      const painel = criar('div', 'activity-panel');
      const titulo = criar('h2', 'activity-title', historia.titulo);
      titulo.tabIndex = -1;
      painel.append(
        titulo,
        criar('p', 'activity-step', `Cena ${indice + 1} de ${historia.cenas.length}`),
        criar('p', 'story-text', cena.texto),
        criar('h3', 'activity-question', cena.pergunta)
      );

      const opcoes = criar('div', 'activity-options');
      const retorno = criar('div', 'activity-feedback');
      retorno.setAttribute('aria-live', 'polite');
      const continuar = criar('button', 'btn hidden', ultima ? 'Ver o final' : 'Continuar');
      continuar.type = 'button';

      embaralhar(cena.opcoes).forEach((opcao) => {
        const botao = criar('button', 'activity-option', opcao.texto);
        botao.type = 'button';
        botao.dataset.certa = opcao.certa ? 'true' : 'false';
        botao.addEventListener('click', () => {
          opcoes.querySelectorAll('button').forEach((item) => {
            item.disabled = true;
            if (item.dataset.certa === 'true') item.classList.add('correct');
          });
          if (!opcao.certa) botao.classList.add('wrong');
          if (opcao.certa) acertos++;
          if (window.tocarSom) window.tocarSom(opcao.certa ? 'correct' : 'wrong');

          retorno.textContent = opcao.retorno;
          retorno.className = `activity-feedback ${opcao.certa ? 'ok' : 'no'}`;
          continuar.classList.remove('hidden');
          continuar.focus();
        });
        opcoes.append(botao);
      });

      continuar.addEventListener('click', () => {
        if (ultima) mostrarFim(historia, acertos);
        else mostrarCena(historia, indice + 1, acertos);
      });

      painel.append(opcoes, retorno, continuar);
      container.append(painel);
      titulo.focus();
    }

    function mostrarFim(historia, acertos) {
      container.replaceChildren();

      const painel = criar('div', 'activity-panel');
      const titulo = criar('h2', 'activity-title', historia.titulo);
      titulo.tabIndex = -1;

      const repetir = criar('button', 'btn', 'Ler de novo');
      repetir.type = 'button';
      repetir.addEventListener('click', () => mostrarCena(historia, 0, 0));

      const voltar = criar('button', 'btn btn-ghost', 'Voltar às histórias');
      voltar.type = 'button';
      voltar.addEventListener('click', mostrarLista);

      painel.append(
        titulo,
        criar('p', 'activity-score', `Você acertou ${acertos} de ${historia.cenas.length} decisões.`),
        criar('p', 'story-text', historia.fim),
        repetir,
        voltar
      );
      container.append(painel);
      titulo.focus();
    }

    mostrarLista();
  }

  return { montar };
})();
