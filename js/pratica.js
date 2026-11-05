/*
  Arquivo: js/pratica.js
  Papel no sistema: desenha a parte "Praticar" de cada matéria.

  Existem dois treinos:
  - Falar os termos: o app pergunta em voz alta, você responde falando e ele
    corrige o termo técnico, ensina a pronúncia e explica para que serve;
  - Digitar a resposta: você completa código ou faz um cálculo e confere.

  Os dados ficam em materias/*.json, nos campos "termos" e "praticas".
*/
window.Pratica = (function () {
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

  function montar(container, termos, praticas) {
    function novoPainel(tituloTexto) {
      window.Voz.parar();
      container.replaceChildren();
      const painel = criar('div', 'activity-panel');
      const titulo = criar('h2', 'activity-title', tituloTexto);
      titulo.tabIndex = -1;
      painel.append(titulo);
      container.append(painel);
      return { painel, titulo };
    }

    function mostrarMenu() {
      window.Voz.parar();
      container.replaceChildren();

      if (!termos.length && !praticas.length) {
        container.append(criar('p', 'activity-empty', 'Esta matéria ainda não tem treinos.'));
        return;
      }

      const lista = criar('div', 'activity-list');
      if (termos.length) {
        const cartao = botao('activity-card', '', () => treinarTermo(embaralhar(termos), 0, []));
        cartao.append(
          criar('strong', '', `🎤 Falar os termos (${termos.length})`),
          criar('span', '', 'O app pergunta, você fala o termo técnico e ele corrige sua resposta.')
        );
        lista.append(cartao);
      }
      if (praticas.length) {
        const cartao = botao('activity-card', '', () => treinarDigitando(praticas, 0, 0));
        cartao.append(
          criar('strong', '', `⌨️ Digitar a resposta (${praticas.length})`),
          criar('span', '', 'Complete o código ou faça o cálculo, sem alternativas para ajudar.')
        );
        lista.append(cartao);
      }
      container.append(lista);
    }

    // ===== TREINO 1: FALAR OS TERMOS =====
    function treinarTermo(fila, indice, errados) {
      const item = fila[indice];
      const ultimo = indice === fila.length - 1;
      const { painel, titulo } = novoPainel('Falar os termos');
      let respondido = false;
      let repetindo = false;

      const pronuncia = item.pronuncia || item.termo;
      const situacao = criar('p', 'voice-status', '');
      situacao.setAttribute('aria-live', 'polite');
      const retorno = criar('div', 'activity-feedback');
      retorno.setAttribute('aria-live', 'polite');

      const proximo = botao('btn hidden', ultimo ? 'Ver resultado' : 'Próximo termo', () => {
        if (ultimo) mostrarResultadoTermos(fila.length, errados);
        else treinarTermo(fila, indice + 1, errados);
      });

      const falarBotao = botao('btn', '🎤 Falar a resposta', () => {
        falarBotao.disabled = true;
        situacao.textContent = 'Pode falar...';
        window.Voz.ouvir({
          aoOuvir: (opcoes) => {
            situacao.textContent = `Entendi: “${opcoes[0]}”`;
            analisar(opcoes);
          },
          aoErro: (codigo) => {
            situacao.textContent = window.Voz.mensagemDeErro(codigo);
          },
          aoFim: () => {
            falarBotao.disabled = false;
          }
        });
      });

      const campo = criar('input', 'practice-input');
      campo.type = 'text';
      campo.placeholder = 'Ou digite a resposta';
      campo.setAttribute('aria-label', 'Digite a resposta');
      campo.autocomplete = 'off';

      const conferir = botao('btn btn-ghost', 'Conferir', () => {
        if (campo.value.trim()) analisar([campo.value]);
      });
      campo.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') conferir.click();
      });

      function analisar(tentativas) {
        const resultado = window.Voz.confere(tentativas, item.aceitas);

        // Depois de errar, a pessoa repete o termo certo para treinar a fala.
        if (repetindo) {
          if (resultado === 'errado') {
            situacao.textContent = `Ainda não foi. Tente falar: ${pronuncia}`;
            som('wrong');
          } else {
            situacao.textContent = 'Boa, agora saiu certo.';
            som('correct');
            window.Voz.falar('Boa, agora saiu certo.');
            falarBotao.classList.add('hidden');
            proximo.focus();
          }
          return;
        }
        if (respondido) return;
        respondido = true;

        const pronunciaTexto = `Fala-se: ${pronuncia}.`;
        if (resultado === 'certo') {
          retorno.textContent = `Isso! ${item.termo}. ${item.explicacao}`;
          retorno.className = 'activity-feedback ok';
          som('correct');
          window.Voz.falar(`Isso! ${pronuncia}. ${item.explicacao}`);
          falarBotao.classList.add('hidden');
        } else {
          errados.push(item);
          const abertura = resultado === 'quase' ? 'Quase!' : 'Ainda não.';
          retorno.textContent = `${abertura} O termo certo é ${item.termo}. ${pronunciaTexto} ${item.explicacao}`;
          retorno.className = 'activity-feedback no';
          som('wrong');
          window.Voz.falar(`${abertura} O termo certo é ${pronuncia}. ${item.explicacao} Agora repita comigo: ${pronuncia}.`);
          repetindo = true;
          falarBotao.textContent = '🎤 Repetir o termo';
        }

        campo.disabled = true;
        conferir.disabled = true;
        proximo.classList.remove('hidden');
      }

      const entrada = criar('div', 'practice-row');
      entrada.append(campo, conferir);

      painel.append(
        criar('p', 'activity-step', `Termo ${indice + 1} de ${fila.length}`),
        criar('p', 'story-text', item.pergunta),
        botao('activity-option', '🔊 Ouvir a pergunta', () => window.Voz.falar(item.pergunta)),
        falarBotao,
        situacao,
        entrada,
        retorno,
        proximo,
        botao('btn btn-ghost', 'Sair do treino', mostrarMenu)
      );
      titulo.focus();
      window.Voz.falar(item.pergunta);
    }

    function mostrarResultadoTermos(total, errados) {
      const { painel, titulo } = novoPainel('Resultado');
      const acertos = total - errados.length;
      const resumo = `Você acertou de primeira ${acertos} de ${total} termos.`;
      painel.append(criar('p', 'activity-score', resumo));

      if (errados.length) {
        const lista = criar('ul', 'book-list');
        errados.forEach((item) => lista.append(criar('li', '', `${item.termo}: ${item.pronuncia || item.termo}`)));
        painel.append(
          criar('p', 'activity-step', 'Para treinar de novo:'),
          lista,
          botao('btn', 'Treinar só os que errei', () => treinarTermo(embaralhar(errados), 0, []))
        );
      }
      painel.append(botao('btn btn-ghost', 'Voltar aos treinos', mostrarMenu));
      titulo.focus();
      window.Voz.falar(resumo);
    }

    // ===== TREINO 2: DIGITAR A RESPOSTA =====
    // Os espaços não contam, mas maiúsculas sim: em Java, String e string são diferentes.
    function compacto(texto) {
      return String(texto).replace(/\s+/g, '');
    }

    function treinarDigitando(lista, indice, acertos) {
      const item = lista[indice];
      const ultimo = indice === lista.length - 1;
      const { painel, titulo } = novoPainel('Digitar a resposta');
      let tentativas = 0;

      const retorno = criar('div', 'activity-feedback');
      retorno.setAttribute('aria-live', 'polite');

      const proximo = botao('btn hidden', ultimo ? 'Ver resultado' : 'Próximo', () => {
        if (ultimo) mostrarResultadoDigitado(lista.length, acertos);
        else treinarDigitando(lista, indice + 1, acertos);
      });

      const campo = criar('input', 'practice-input code-input');
      campo.type = 'text';
      campo.placeholder = 'Sua resposta';
      campo.setAttribute('aria-label', 'Sua resposta');
      campo.autocomplete = 'off';
      campo.spellcheck = false;
      campo.setAttribute('autocapitalize', 'off');

      function encerrar() {
        campo.disabled = true;
        conferir.disabled = true;
        verResposta.classList.add('hidden');
        proximo.classList.remove('hidden');
        proximo.focus();
      }

      const conferir = botao('btn', 'Conferir', () => {
        const resposta = compacto(campo.value);
        if (!resposta) return;

        if (item.aceitas.some((aceita) => compacto(aceita) === resposta)) {
          if (tentativas === 0) acertos++;
          retorno.textContent = `Certo! ${item.explicacao}`;
          retorno.className = 'activity-feedback ok';
          som('correct');
          window.Voz.lerSeAtivo(`Certo! ${item.explicacao}`);
          encerrar();
        } else {
          tentativas++;
          retorno.textContent = `Ainda não. ${item.dica || 'Confira com calma e tente de novo.'}`;
          retorno.className = 'activity-feedback no';
          som('wrong');
          verResposta.classList.remove('hidden');
        }
      });

      const verResposta = botao('btn btn-ghost hidden', 'Ver a resposta', () => {
        retorno.textContent = `Resposta: ${item.aceitas[0]}. ${item.explicacao}`;
        retorno.className = 'activity-feedback no';
        encerrar();
      });

      campo.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') conferir.click();
      });

      painel.append(
        criar('p', 'activity-step', `Exercício ${indice + 1} de ${lista.length}`),
        criar('p', 'story-text', item.enunciado)
      );
      if (item.codigo) painel.append(criar('pre', 'code', item.codigo));
      painel.append(
        campo,
        conferir,
        retorno,
        verResposta,
        proximo,
        botao('btn btn-ghost', 'Sair do treino', mostrarMenu)
      );
      titulo.focus();
      window.Voz.lerSeAtivo(item.enunciado);
    }

    function mostrarResultadoDigitado(total, acertos) {
      const { painel, titulo } = novoPainel('Resultado');
      painel.append(
        criar('p', 'activity-score', `Você acertou de primeira ${acertos} de ${total}.`),
        botao('btn', 'Fazer de novo', () => treinarDigitando(praticas, 0, 0)),
        botao('btn btn-ghost', 'Voltar aos treinos', mostrarMenu)
      );
      titulo.focus();
    }

    mostrarMenu();
  }

  return { montar };
})();
