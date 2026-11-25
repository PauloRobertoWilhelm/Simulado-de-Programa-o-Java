/*
  Arquivo: js/revisao.js
  Papel no sistema: desenha a parte "Revisão" de cada matéria, para a véspera da prova.

  O conteúdo fica em materias/*.json, no campo "revisao", com:
  - intro: o texto do começo;
  - secoes: uma por assunto, com titulo, tema (para o botão Treinar), blocos, pegadinhas e perguntas.
  Cada bloco tem um "tipo": texto, lista, passos, tabela ou codigo.

  A caixinha "Já sei" de cada assunto fica salva no navegador.
*/

// A função roda uma vez e guarda só montar() em window.Revisao.
window.Revisao = (() => {
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
  // Parâmetros: classe, texto e aoClicar (a função).
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

  // desenharBloco() transforma um bloco do JSON em elemento da página.
  // Parâmetro: bloco. Tipo desconhecido vira texto vazio, sem travar a tela.
  function desenharBloco(bloco) {
    // Parágrafo.
    if (bloco.tipo === 'texto') return criar('p', 'rev-texto', bloco.texto);
    // Lista com marcadores ou passos numerados: muda só a etiqueta.
    if (bloco.tipo === 'lista' || bloco.tipo === 'passos') {
      // ol numera; ul põe pontinhos.
      const lista = criar(bloco.tipo === 'passos' ? 'ol' : 'ul', 'rev-lista');
      // Um item para cada texto.
      bloco.itens.forEach((item) => lista.append(criar('li', '', item)));
      // Devolve a lista.
      return lista;
    }
    // Código: usa as cores de js/visual.js, que já protege os sinais < e >.
    if (bloco.tipo === 'codigo') {
      // Caixa de código, a mesma das perguntas.
      const codigo = criar('pre', 'code');
      // Coloca o código colorido.
      codigo.innerHTML = window.Visual.colorirJava(bloco.texto);
      // Devolve a caixa.
      return codigo;
    }
    // Tabela.
    if (bloco.tipo === 'tabela') {
      // A moldura deixa a tabela rolar de lado no celular sem empurrar a página.
      const moldura = criar('div', 'rev-tabela');
      // A tabela.
      const tabela = criar('table');
      // Linha do cabeçalho.
      const topo = criar('tr');
      // Uma célula para cada título.
      bloco.cabecalho.forEach((titulo) => topo.append(criar('th', '', titulo)));
      // Coloca o cabeçalho na tabela.
      tabela.append(topo);
      // Uma linha para cada lista de células.
      bloco.linhas.forEach((celulas) => {
        // Cria a linha.
        const linha = criar('tr');
        // Cria as células.
        celulas.forEach((celula) => linha.append(criar('td', '', celula)));
        // Coloca a linha na tabela.
        tabela.append(linha);
      });
      // Coloca a tabela na moldura.
      moldura.append(tabela);
      // Devolve a moldura.
      return moldura;
    }
    // Tipo que o app não conhece.
    return criar('p', 'rev-texto', '');
  }

  // montar() desenha a revisão inteira.
  // Parâmetros: container (onde desenhar), revisao (do JSON), idMateria e treinar (função que abre a prova de um tema).
  function montar(container, revisao, idMateria, treinar) {
    // Limpa o que havia antes.
    container.replaceChildren();
    // Matéria sem revisão: nada a desenhar.
    if (!revisao || !revisao.secoes) return;
    // Nome onde o navegador guarda os assuntos marcados.
    const chave = `unipar_${idMateria}_revisao`;

    // lerMarcados() devolve a lista de títulos já marcados com "Já sei".
    function lerMarcados() {
      // try/catch: um valor estragado não pode travar a tela.
      try {
        // Lê e converte o texto salvo.
        const lista = JSON.parse(localStorage.getItem(chave));
        // Só aceita lista.
        return Array.isArray(lista) ? lista : [];
      } catch (erro) {
        // Avisa no console e começa do zero.
        console.warn('Revisão: marcações ilegíveis.', erro);
        return [];
      }
    }

    // Marcados no momento em que a tela abre.
    let marcados = lerMarcados().filter((titulo) => revisao.secoes.some((secao) => secao.titulo === titulo));
    // Texto de abertura.
    container.append(criar('p', 'rev-intro', revisao.intro));

    // Barra de progresso da revisão.
    const progresso = criar('div', 'rev-progresso');
    // Texto "3 de 16 assuntos".
    const contagem = criar('strong', '');
    // Trilho da barra, com o mesmo visual do painel de estudo.
    const trilho = criar('div', 'painel-barra');
    // Parte preenchida.
    const cheio = criar('i', '');
    // Monta a barra.
    trilho.append(cheio);
    // Junta texto e barra.
    progresso.append(contagem, trilho);

    // atualizar() refaz a contagem e a barra.
    function atualizar() {
      // Escreve quantos já foram marcados.
      contagem.textContent = `${marcados.length} de ${revisao.secoes.length} assuntos que você já sabe`;
      // --pct vai de 0 a 1.
      cheio.style.setProperty('--pct', marcados.length / revisao.secoes.length);
    }

    // Botão do simulado geral: 20 perguntas, divididas entre os assuntos da revisão.
    const simulado = botao('btn', 'Simulado da revisão · 20 questões', () => treinar(null, 20));
    // Coloca tudo no topo.
    container.append(progresso, simulado);

    // Um bloco que abre e fecha para cada assunto.
    revisao.secoes.forEach((secao) => {
      // details abre e fecha sozinho, sem JavaScript.
      const caixa = criar('details', 'rev-secao');
      // Linha clicável com o título.
      caixa.append(criar('summary', '', secao.titulo));
      // Miolo do assunto.
      const miolo = criar('div', 'rev-miolo');
      // Desenha cada bloco.
      secao.blocos.forEach((bloco) => miolo.append(desenharBloco(bloco)));

      // Pegadinhas, numa caixa de destaque.
      if (secao.pegadinhas.length) {
        // Caixa.
        const alerta = criar('div', 'rev-pegadinhas');
        // Título da caixa.
        alerta.append(criar('strong', '', 'Cuidado na prova'));
        // Lista das pegadinhas.
        alerta.append(desenharBloco({ tipo: 'lista', itens: secao.pegadinhas }));
        // Coloca no miolo.
        miolo.append(alerta);
      }

      // Perguntas rápidas: a resposta só aparece ao tocar.
      secao.perguntas.forEach((item) => {
        // Cartão da pergunta.
        const cartao = criar('details', 'rev-pergunta');
        // Pergunta visível e resposta escondida até tocar.
        cartao.append(criar('summary', '', item.pergunta), criar('p', '', item.resposta));
        // Coloca no miolo.
        miolo.append(cartao);
      });

      // Linha de ações: treinar e marcar.
      const acoes = criar('div', 'rev-acoes');
      // Abre uma prova de 10 perguntas do tema do assunto.
      acoes.append(botao('btn btn-ghost', 'Treinar 10 perguntas', () => treinar(secao.tema, 10)));
      // Rótulo com a caixinha "Já sei".
      const rotulo = criar('label', 'rev-ja-sei');
      // A caixinha.
      const caixinha = criar('input', '');
      // Tipo de marcar.
      caixinha.type = 'checkbox';
      // Já vem marcada se estava salva.
      caixinha.checked = marcados.includes(secao.titulo);
      // Assunto marcado ganha um sinal de certo no título (CSS).
      caixa.classList.toggle('feito', caixinha.checked);
      // Ao marcar ou desmarcar, salva e atualiza a barra.
      caixinha.addEventListener('change', () => {
        // Tira o título da lista e põe de volta se foi marcado.
        marcados = marcados.filter((titulo) => titulo !== secao.titulo).concat(caixinha.checked ? [secao.titulo] : []);
        // try/catch: o navegador pode recusar gravar (modo privado).
        try { localStorage.setItem(chave, JSON.stringify(marcados)); } catch (erro) { console.warn('Revisão: não deu para salvar.', erro); }
        // Muda o sinal no título.
        caixa.classList.toggle('feito', caixinha.checked);
        // Refaz a barra.
        atualizar();
      });
      // Monta o rótulo.
      rotulo.append(caixinha, ' Já sei este assunto');
      // Coloca o rótulo na linha de ações.
      acoes.append(rotulo);
      // Junta tudo.
      miolo.append(acoes);
      caixa.append(miolo);
      container.append(caixa);
    });
    // Primeira contagem.
    atualizar();
  }

  // Só montar() fica visível para o resto do app.
  return { montar };
})();
