/*
  Arquivo: js/livro.js
  Papel no sistema: desenha a parte "Livro" de cada matéria.

  Cada capítulo fica em materias/*.json, no campo "livro", com:
  - titulo e resumo;
  - paginas: uma lista de textos, um por página;
  - guardar: os pontos para lembrar no fim do capítulo.

  O botão "Ouvir o capítulo" lê uma página, vira sozinho e lê a próxima.
  Os capítulos lidos ficam marcados no navegador.
*/
window.Livro = (function () {
  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  function botao(classe, texto, aoClicar) {
    const elemento = criar('button', classe, texto);
    elemento.type = 'button';
    elemento.addEventListener('click', aoClicar);
    return elemento;
  }

  function montar(container, capitulos, idMateria) {
    const chave = `unipar_${idMateria}_livro`;

    function lidos() {
      try {
        return JSON.parse(localStorage.getItem(chave)) || [];
      } catch (erro) {
        return [];
      }
    }

    function marcarLido(indice) {
      const lista = lidos();
      if (!lista.includes(indice)) localStorage.setItem(chave, JSON.stringify([...lista, indice]));
    }

    function mostrarSumario() {
      window.Voz.parar();
      container.replaceChildren();

      if (!capitulos.length) {
        container.append(criar('p', 'activity-empty', 'Esta matéria ainda não tem livro.'));
        return;
      }

      const jaLidos = lidos();
      container.append(criar('p', 'activity-step', `${jaLidos.length} de ${capitulos.length} capítulos lidos`));

      const lista = criar('div', 'activity-list');
      capitulos.forEach((capitulo, indice) => {
        const cartao = botao('activity-card', '', () => mostrarPagina(indice, 0, false));
        const titulo = `Capítulo ${indice + 1}: ${capitulo.titulo}${jaLidos.includes(indice) ? ' ✓' : ''}`;
        cartao.append(criar('strong', '', titulo), criar('span', '', capitulo.resumo));
        lista.append(cartao);
      });
      container.append(lista);
    }

    function mostrarPagina(indice, pagina, ouvindo) {
      const capitulo = capitulos[indice];
      const ultima = pagina === capitulo.paginas.length - 1;
      const texto = capitulo.paginas[pagina];
      container.replaceChildren();

      const painel = criar('div', 'activity-panel');
      const titulo = criar('h2', 'activity-title', capitulo.titulo);
      titulo.tabIndex = -1;

      const avancar = () => {
        if (ultima) mostrarFim(indice, ouvindo);
        else mostrarPagina(indice, pagina + 1, ouvindo);
      };

      const controles = criar('div', 'book-controls');
      const ouvir = botao('activity-option', ouvindo ? '⏹ Parar de ouvir' : '🔊 Ouvir o capítulo', () => {
        if (ouvindo) {
          window.Voz.parar();
          mostrarPagina(indice, pagina, false);
        } else {
          mostrarPagina(indice, pagina, true);
        }
      });
      ouvir.classList.add('book-listen');
      controles.append(ouvir);

      const navegacao = criar('div', 'book-nav');
      const anterior = botao('btn btn-ghost', 'Página anterior', () => mostrarPagina(indice, pagina - 1, false));
      anterior.disabled = pagina === 0;
      navegacao.append(
        anterior,
        botao('btn', ultima ? 'Terminar capítulo' : 'Próxima página', () => {
          window.Voz.parar();
          if (ultima) mostrarFim(indice, false);
          else mostrarPagina(indice, pagina + 1, ouvindo);
        })
      );

      painel.append(
        titulo,
        criar('p', 'activity-step', `Página ${pagina + 1} de ${capitulo.paginas.length}`),
        criar('p', 'story-text', texto),
        controles,
        navegacao,
        botao('btn btn-ghost', 'Voltar ao sumário', mostrarSumario)
      );
      container.append(painel);
      titulo.focus();

      if (ouvindo) window.Voz.falar(texto, avancar);
      else window.Voz.lerSeAtivo(texto);
    }

    function mostrarFim(indice, ouvindo) {
      const capitulo = capitulos[indice];
      marcarLido(indice);
      container.replaceChildren();

      const painel = criar('div', 'activity-panel');
      const titulo = criar('h2', 'activity-title', 'Para guardar');
      titulo.tabIndex = -1;

      const lista = criar('ul', 'book-list');
      capitulo.guardar.forEach((item) => lista.append(criar('li', '', item)));

      painel.append(titulo, lista);
      if (indice < capitulos.length - 1) {
        painel.append(botao('btn', 'Próximo capítulo', () => mostrarPagina(indice + 1, 0, false)));
      }
      painel.append(botao('btn btn-ghost', 'Voltar ao sumário', mostrarSumario));
      container.append(painel);
      titulo.focus();

      const resumo = `Para guardar. ${capitulo.guardar.join('. ')}`;
      if (ouvindo) window.Voz.falar(resumo);
      else window.Voz.lerSeAtivo(resumo);
    }

    mostrarSumario();
  }

  return { montar };
})();
