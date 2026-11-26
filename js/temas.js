/*
  Arquivo: js/temas.js
  Papel no sistema: monta o painel "Visual, pug e animações" e guarda as escolhas no navegador.
  - Visual: Futurista (padrão), Ouro, Grafite, Neon e Claro. Quem liga e desliga os arquivos CSS é
    window.AplicarVisual, o script curto do <head> do index.html (roda antes de a página aparecer);
  - Mascote: pug 3D, pug desenho ou sem pug (js/pug.js);
  - Animações: normais ou menos (o CSS e os efeitos leem data-movimento no <html>).
  Chaves no navegador: unipar_visual, unipar_pug e unipar_movimento.
*/

// A função roda uma vez e não deixa variáveis soltas na página.
(() => {
  // Os cinco visuais: id, nome, explicação e as três cores da amostra (fundo, principal e clara).
  const VISUAIS = [
    { id: 'futurista', nome: 'Futurista', desc: 'Ouro, circuito, vidro e luz do mouse. O atual.', cores: ['#0b0a08', '#e8b94a', '#ffe7a3'] },
    { id: 'ouro', nome: 'Ouro', desc: 'O anterior: tecnologia em ouro, sem o vidro.', cores: ['#14120d', '#e8b94a', '#fff0bf'] },
    { id: 'grafite', nome: 'Grafite', desc: 'O de antes do ouro: cinza, na cor de cada matéria.', cores: ['#0c1017', '#5ea6f0', '#a3acb9'] },
    { id: 'neon', nome: 'Neon', desc: 'Rosa e ciano, lembrando o primeiro visual do app.', cores: ['#0b0716', '#ff4fd8', '#57f4ff'] },
    { id: 'claro', nome: 'Claro', desc: 'Papel creme, para estudar de dia.', cores: ['#f6f3ec', '#9a6400', '#ffffff'] },
  ];
  // As três opções de mascote.
  const PUGS = [
    { id: '3d', nome: 'Pug 3D', desc: 'O pug fofinho.', img: 'img/pug/3d-5.webp' },
    { id: 'desenho', nome: 'Pug desenho', desc: 'O pug de quadrinho.', img: 'img/pug/desenho-5.webp' },
    { id: 'desligado', nome: 'Sem pug', desc: 'Prova sem zoeira.', icone: '🚫' },
  ];
  // As duas opções de animação.
  const MOVIMENTOS = [
    { id: 'normal', nome: 'Animações normais', desc: 'Pug, confete e transições.', icone: '✨' },
    { id: 'menos', nome: 'Menos animação', desc: 'Quase tudo parado.', icone: '🐢' },
  ];

  // ler() busca uma escolha salva. Parâmetros: chave e valor padrão.
  function ler(chave, padrao) {
    // try/catch: modo privado pode recusar o acesso ao armazenamento.
    try { return localStorage.getItem(chave) || padrao; } catch (erro) { return padrao; }
  }

  // gravar() salva uma escolha. Parâmetros: chave e valor.
  function gravar(chave, valor) {
    // try/catch: sem gravar, a escolha vale só nesta visita.
    try { localStorage.setItem(chave, valor); } catch (erro) { console.warn('Não deu para salvar a escolha.', erro); }
  }

  // criarCartao() monta um botão de escolha. Parâmetros: item (da lista), grupo (nome do grupo) e ligado.
  function criarCartao(item, grupo, ligado) {
    // Botão comum (não envia formulário).
    const botao = document.createElement('button');
    botao.type = 'button';
    // Classe do visual (css/temas.css).
    botao.className = 'pv-cartao';
    // Guarda o grupo e a opção, para o clique saber o que mudar.
    botao.dataset.grupo = grupo;
    botao.dataset.valor = item.id;
    // aria-pressed diz ao leitor de tela qual está escolhido.
    botao.setAttribute('aria-pressed', ligado);
    // Topo do cartão: amostra de cores, foto do pug ou ícone.
    if (item.cores) {
      // Amostra: três faixas com as cores do visual.
      const amostra = document.createElement('span');
      amostra.className = 'pv-amostra';
      amostra.style.setProperty('--fundo', item.cores[0]);
      amostra.style.setProperty('--cor', item.cores[1]);
      amostra.style.setProperty('--clara', item.cores[2]);
      botao.append(amostra);
    } else if (item.img) {
      // Foto do pug (enfeite: alt vazio, o nome está escrito no cartão).
      const img = document.createElement('img');
      img.src = item.img;
      img.alt = '';
      // loading="lazy": a foto só baixa quando o painel abre.
      img.loading = 'lazy';
      botao.append(img);
    } else {
      // Ícone grande no lugar da foto.
      const icone = document.createElement('span');
      icone.className = 'pv-icone';
      icone.textContent = item.icone;
      botao.append(icone);
    }
    // Nome em negrito e explicação curta. textContent impede que o texto vire código.
    const nome = document.createElement('b');
    nome.textContent = item.nome;
    const desc = document.createElement('small');
    desc.textContent = item.desc;
    botao.append(nome, desc);
    return botao;
  }

  // criarGrupo() monta um título e a grade de cartões. Parâmetros: titulo, grupo, lista e valor atual.
  function criarGrupo(titulo, grupo, lista, atual) {
    // Título do grupo.
    const p = document.createElement('p');
    p.className = 'pv-titulo';
    p.textContent = titulo;
    // Grade dos cartões; role="group" junta os botões para o leitor de tela.
    const grade = document.createElement('div');
    grade.className = 'pv-grade';
    grade.setAttribute('role', 'group');
    grade.setAttribute('aria-label', titulo);
    // Um cartão para cada opção, marcado se for a atual.
    grade.append(...lista.map((item) => criarCartao(item, grupo, item.id === atual)));
    return [p, grade];
  }

  // marcar() atualiza qual cartão aparece escolhido num grupo. Parâmetros: grupo e valor.
  function marcar(grupo, valor) {
    document.querySelectorAll(`.pv-cartao[data-grupo="${grupo}"]`).forEach((b) => b.setAttribute('aria-pressed', b.dataset.valor === valor));
  }

  // trocarVisual() aplica o visual escolhido, com o círculo que cresce a partir do cartão tocado.
  // Parâmetros: id (do visual) e botao (o cartão, para saber de onde sai o círculo).
  function trocarVisual(id, botao) {
    // Centro do cartão: ponto de onde o círculo cresce (css/temas.css usa --vx e --vy).
    const caixa = botao.getBoundingClientRect();
    document.documentElement.style.setProperty('--vx', `${caixa.left + caixa.width / 2}px`);
    document.documentElement.style.setProperty('--vy', `${caixa.top + caixa.height / 2}px`);
    // Troca os arquivos CSS (função do <head>) e avisa os outros arquivos (o circuito muda de cor).
    const aplicar = () => {
      window.AplicarVisual(id);
      document.dispatchEvent(new CustomEvent('visual-trocado', { detail: id }));
    };
    // Navegador com transição de página e animação permitida: troca com o círculo. Senão, troca direto.
    const podeAnimar = document.startViewTransition && !(window.Efeitos && window.Efeitos.menosMovimento());
    if (podeAnimar) document.startViewTransition(aplicar); else aplicar();
    // Guarda e marca o cartão.
    gravar('unipar_visual', id);
    marcar('visual', id);
  }

  // montar() desenha o painel dentro de #visual-conteudo.
  function montar() {
    // Caixa do painel (index.html). Sem ela, não há o que montar.
    const caixa = document.getElementById('visual-conteudo');
    if (!caixa) return;
    // Os três grupos, com o valor atual de cada um marcado.
    caixa.replaceChildren(
      ...criarGrupo('Visual da página', 'visual', VISUAIS, document.documentElement.dataset.visual || 'futurista'),
      ...criarGrupo('Mascote', 'pug', PUGS, window.Pug ? window.Pug.estilo() : '3d'),
      ...criarGrupo('Animações', 'movimento', MOVIMENTOS, ler('unipar_movimento', 'normal')),
    );
    // Um ouvinte só para todos os cartões.
    caixa.addEventListener('click', (e) => {
      // Cartão tocado (ou nada, se tocou no vão).
      const botao = e.target.closest('.pv-cartao');
      if (!botao) return;
      // Grupo e valor escolhidos.
      const { grupo, valor } = botao.dataset;
      if (grupo === 'visual') trocarVisual(valor, botao);
      if (grupo === 'pug') {
        // Mascote: js/pug.js salva e mostra o pug novo.
        if (window.Pug) window.Pug.definirEstilo(valor);
        marcar('pug', valor);
      }
      if (grupo === 'movimento') {
        // Animações: o CSS e os efeitos leem data-movimento no <html>.
        if (valor === 'menos') document.documentElement.dataset.movimento = 'menos';
        else delete document.documentElement.dataset.movimento;
        gravar('unipar_movimento', valor);
        marcar('movimento', valor);
      }
    });
  }

  // Monta o painel quando o HTML terminar de carregar.
  document.addEventListener('DOMContentLoaded', montar);
})();
