/*
  Arquivo: js/visual.js
  Papel no sistema: peças que só cuidam da aparência.
  - Visual.colorirJava(): deixa o código das perguntas colorido, como no NetBeans;
  - Visual.painel(): preenche o painel "já vistas, para revisar e melhor nota" da matéria;
  - Visual.marcarTema(): escreve no botão do tema quantas perguntas ele tem e quanto já foi visto.

  Nada aqui muda perguntas, notas ou respostas.
*/

// A função roda uma vez só e guarda tudo em window.Visual, sem criar variáveis soltas na página.
window.Visual = (() => {
  // Palavras reservadas do Java usadas nas aulas. Acrescentar uma palavra aqui faz ela ganhar cor.
  const PALAVRAS = 'public|private|class|static|void|int|double|float|char|boolean|long|new|return|if|else|switch|case|default|break|continue|for|while|do|import|true|false|null|this';

  // Receita que separa o código em pedaços, testando nesta ordem:
  // 1) comentário; 2) texto entre aspas; 3) palavra reservada; 4) número;
  // 5) nome que começa com maiúscula (classe); 6) nome seguido de parêntese (método).
  const PEDACOS = new RegExp(`(\\/\\/[^\\n]*)|("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')|\\b(${PALAVRAS})\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Z][A-Za-z0-9_]*)\\b|\\b([a-z][A-Za-z0-9_]*)(?=\\s*\\()`, 'g');

  // Nome da classe de CSS de cada pedaço, na mesma ordem dos parênteses da receita acima.
  const CLASSES = ['cod-com', 'cod-txt', 'cod-pal', 'cod-num', 'cod-cla', 'cod-met'];

  // escapar() troca os sinais que o navegador entenderia como HTML.
  // Parâmetro: texto. Devolve o texto seguro para colocar na página.
  function escapar(texto) {
    // & vem primeiro, para não estragar as trocas seguintes.
    return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // colorirJava() devolve o código com cada pedaço dentro de uma etiqueta <span> colorida.
  // Parâmetro: codigo, o texto puro que veio do JSON. Efeito: nenhum; só devolve o HTML pronto.
  function colorirJava(codigo) {
    // Texto puro do código.
    const texto = String(codigo);
    // Onde o último pedaço terminou.
    let fim = 0;
    // HTML que vai sendo montado.
    let html = '';
    // Passa por cada pedaço encontrado pela receita.
    for (const achado of texto.matchAll(PEDACOS)) {
      // O que fica entre um pedaço e outro entra sem cor.
      html += escapar(texto.slice(fim, achado.index));
      // Descobre qual dos 6 tipos foi encontrado (o primeiro que não está vazio).
      const tipo = achado.slice(1, 7).findIndex((parte) => parte !== undefined);
      // Coloca o pedaço dentro do <span> com a classe da cor dele.
      html += `<span class="${CLASSES[tipo]}">${escapar(achado[0])}</span>`;
      // Guarda onde este pedaço terminou.
      fim = achado.index + achado[0].length;
    }
    // Junta o resto do texto, depois do último pedaço.
    return html + escapar(texto.slice(fim));
  }

  // painel() preenche os números do painel de estudo.
  // Parâmetros: total de perguntas, quantas já foram vistas, quantas estão na lista de erros e a melhor nota (0 a 100).
  function painel({ total, vistas, erros, melhor }) {
    // Porcentagem já vista. Matéria vazia conta como 0, para não dividir por zero.
    const pct = total ? vistas / total : 0;
    // "Já vistas": por exemplo, 120 de 627.
    document.getElementById('est-vistas').textContent = `${vistas} de ${total}`;
    // Tamanho da barra (0 a 1), por uma variável que o CSS usa.
    document.getElementById('est-barra').style.setProperty('--pct', pct);
    // Quantas faltam acertar.
    document.getElementById('est-erros').textContent = erros;
    // Melhor nota, ou um traço se ainda não fez prova.
    document.getElementById('est-melhor').textContent = melhor ? `${melhor}%` : '–';
  }

  // marcarTema() acrescenta ao botão do tema a quantidade de perguntas e a barrinha do que já foi visto.
  // Parâmetros: botao, total de perguntas do tema e quantas já foram vistas.
  function marcarTema(botao, total, vistas) {
    // Tema sem lista fixa (contas sorteadas): não há o que contar.
    if (!total) return;
    // Número de perguntas, no canto direito do botão.
    const numero = document.createElement('span');
    // Classe que dá a cor apagada ao número.
    numero.className = 'tpick-n';
    // Texto do número.
    numero.textContent = total;
    // title aparece ao parar o mouse em cima.
    botao.title = `${vistas} de ${total} já vistas`;
    // --pct vai de 0 a 1 e diz o tamanho da barrinha.
    botao.style.setProperty('--pct', Math.min(1, vistas / total));
    // Coloca o número no botão.
    botao.append(numero);
  }

  // Só estas funções ficam visíveis para o resto do app.
  return { colorirJava, painel, marcarTema };
})();
