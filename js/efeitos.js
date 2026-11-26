/*
  Arquivo: js/efeitos.js
  Papel no sistema: efeitos visuais da prova. Nada aqui muda perguntas, notas ou respostas.
  - confete(elemento): solta pedacinhos coloridos a partir do elemento (resposta certa);
  - aviso(caixa, texto, nivel, subiu): mostra a faixa "Subiu para o Médio" e esconde sozinha;
  - menosMovimento(): diz se a pessoa pediu menos animação (no sistema ou no próprio app).
  Os estilos estão em css/niveis.css.
*/

// A função roda uma vez e não deixa variáveis soltas na página.
(() => {
  // menosMovimento() devolve true quando o sistema pede menos movimento ou quando a pessoa escolheu "Menos animação".
  function menosMovimento() {
    // Pedido do sistema (Windows, Android, iPhone).
    const sistema = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Pedido feito no painel "Visual, pug e animações" (js/temas.js grava em data-movimento).
    const app = document.documentElement.dataset.movimento === 'menos';
    return sistema || app;
  }

  // cor() lê uma cor do visual atual. Parâmetro: nome da variável CSS, como "--primary".
  function cor(nome) {
    // Valor calculado no elemento raiz (já com a cor da matéria e do visual).
    return getComputedStyle(document.documentElement).getPropertyValue(nome).trim() || '#e8b94a';
  }

  // confete() solta 18 pedacinhos a partir do elemento, que sobem, giram e caem.
  // Parâmetro: elemento (a alternativa certa). Efeito: cria e apaga <span class="confete"> na página.
  function confete(elemento) {
    // Sem elemento, com menos movimento ou sem a função animate (navegador antigo): não faz nada.
    if (!elemento || menosMovimento() || !Element.prototype.animate) return;
    // Posição do elemento na tela.
    const caixa = elemento.getBoundingClientRect();
    // Ponto de saída: perto da letra da alternativa, na altura do meio.
    const x = caixa.left + Math.min(40, caixa.width / 2);
    const y = caixa.top + caixa.height / 2;
    // Cores do visual: principal, clara e a cor de acerto.
    const cores = [cor('--primary'), cor('--teal'), cor('--success'), '#ffffff'];
    for (let i = 0; i < 18; i++) {
      // Um pedacinho.
      const peca = document.createElement('span');
      // Classe do visual (posição fixa, sem receber toques).
      peca.className = 'confete';
      // Cor sorteada da lista.
      peca.style.background = cores[i % cores.length];
      // Metade quadrados, metade tirinhas.
      if (i % 2) { peca.style.width = '4px'; peca.style.height = '10px'; }
      // Enfeite: o leitor de tela ignora.
      peca.setAttribute('aria-hidden', 'true');
      // Entra na página.
      document.body.append(peca);
      // Direção sorteada: para os lados e para cima.
      const angulo = Math.random() * Math.PI - Math.PI;
      const forca = 60 + Math.random() * 90;
      const dx = Math.cos(angulo) * forca;
      const dy = Math.sin(angulo) * forca;
      // Animação: sobe até o alto da curva e depois cai girando, sumindo no fim.
      const voo = peca.animate([
        { transform: `translate(${x}px, ${y}px) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x + dx}px, ${y + dy}px) rotate(${200 + Math.random() * 200}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${x + dx * 1.25}px, ${y + dy + 120}px) rotate(${420 + Math.random() * 300}deg)`, opacity: 0 },
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
      // Terminou: apaga o pedacinho da página.
      voo.onfinish = () => peca.remove();
    }
  }

  // aviso() mostra a faixa de mudança de nível por 2,6 segundos.
  // Parâmetros: caixa (o elemento #aviso-nivel), texto, nivel (1, 2 ou 3) e subiu (true ou false).
  function aviso(caixa, texto, nivel, subiu) {
    // Sem a caixa na página: não faz nada.
    if (!caixa) return;
    // Escreve o texto. textContent impede que vire código.
    caixa.textContent = texto;
    // Cor do nível (css/niveis.css usa data-nivel).
    caixa.dataset.nivel = nivel;
    // Classe de subida ou descida, e mostra (tirar e pôr reinicia a animação de entrada).
    caixa.className = 'aviso-nivel';
    void caixa.offsetWidth;
    caixa.classList.add(subiu ? 'subiu' : 'desceu');
    // Cancela o relógio de um aviso anterior.
    clearTimeout(caixa.relogio);
    // Esconde depois de 2,6 segundos.
    caixa.relogio = setTimeout(() => caixa.classList.add('hidden'), 2600);
  }

  // Deixa as funções disponíveis para o index.html, o js/temas.js e o js/pug.js.
  window.Efeitos = { confete, aviso, menosMovimento };
})();
