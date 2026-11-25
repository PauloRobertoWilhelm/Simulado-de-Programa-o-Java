/*
  Arquivo: js/futuro.js
  Papel no sistema: efeitos do visual futurista. Nada aqui muda perguntas, notas ou respostas.
  - desenha no fundo um circuito com pulsos de luz correndo pelas trilhas;
  - faz a luz dos painéis seguir o mouse;
  - atualiza o núcleo (o anel ao lado do título) com a porcentagem já vista da matéria.

  Quem pede "menos movimento" no sistema vê o circuito parado.
*/

// A função roda uma vez e não deixa variáveis soltas na página.
(() => {
  // true quando a pessoa pediu menos movimento nas configurações do sistema.
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== CIRCUITO DO FUNDO =====
  // Folha de desenho que fica atrás de tudo.
  const folha = document.createElement('canvas');
  // Classe que posiciona a folha (css/futuro.css).
  folha.className = 'circuito';
  // Enfeite: o leitor de tela ignora.
  folha.setAttribute('aria-hidden', 'true');
  // Coloca antes de tudo, para ficar atrás.
  document.body.prepend(folha);
  // Caneta de desenho.
  const caneta = folha.getContext('2d');
  // Distância entre os pontos da malha. Diminuir deixa o circuito mais cheio.
  const PASSO = 44;
  // Tamanho da tela, trilhas desenhadas e pulsos que correm nelas.
  let largura = 0, altura = 0, trilhas = [], pulsos = [];
  // Hora do último quadro desenhado.
  let ultimo = 0;

  // sorteio() devolve um inteiro de 0 até n - 1.
  const sorteio = (n) => Math.floor(Math.random() * n);

  // criarTrilha() faz um caminho que anda reto e vira em diagonal, como numa placa de circuito.
  function criarTrilha() {
    // Começa num ponto da malha.
    let x = sorteio(Math.ceil(largura / PASSO)) * PASSO, y = sorteio(Math.ceil(altura / PASSO)) * PASSO;
    // Lista dos pontos do caminho.
    const pontos = [[x, y]];
    // De 3 a 6 trechos.
    const trechos = 3 + sorteio(4);
    // Sentido geral: para a direita ou para a esquerda.
    const sentido = Math.random() < 0.5 ? 1 : -1;
    for (let i = 0; i < trechos; i++) {
      // Trecho par: reto, de 1 a 4 casas. Ímpar: diagonal de uma casa, para cima ou para baixo.
      if (i % 2 === 0) x += sentido * PASSO * (1 + sorteio(4));
      else { x += sentido * PASSO; y += PASSO * (Math.random() < 0.5 ? 1 : -1); }
      // Guarda o ponto.
      pontos.push([x, y]);
    }
    // Comprimento de cada trecho e o total, para saber onde o pulso está.
    const medidas = pontos.slice(1).map((p, i) => Math.hypot(p[0] - pontos[i][0], p[1] - pontos[i][1]));
    // Devolve a trilha pronta.
    return { pontos, medidas, total: medidas.reduce((a, b) => a + b, 0) };
  }

  // lugar() diz onde fica um ponto da trilha a uma certa distância do começo.
  // Parâmetros: trilha e distancia. Devolve [x, y].
  function lugar(trilha, distancia) {
    // Anda pelos trechos até achar o que contém a distância.
    let resto = Math.max(0, Math.min(distancia, trilha.total));
    for (let i = 0; i < trilha.medidas.length; i++) {
      // O ponto está neste trecho.
      if (resto <= trilha.medidas[i]) {
        // Quanto do trecho já foi andado, de 0 a 1.
        const parte = trilha.medidas[i] ? resto / trilha.medidas[i] : 0;
        // Pontas do trecho.
        const [ax, ay] = trilha.pontos[i], [bx, by] = trilha.pontos[i + 1];
        // Ponto no meio do caminho.
        return [ax + (bx - ax) * parte, ay + (by - ay) * parte];
      }
      // Passa para o próximo trecho.
      resto -= trilha.medidas[i];
    }
    // Passou do fim: devolve a última ponta.
    return trilha.pontos[trilha.pontos.length - 1];
  }

  // preparar() ajusta a folha ao tamanho da tela e sorteia as trilhas.
  function preparar() {
    // Telas muito nítidas são limitadas a 1,5 para não pesar.
    const nitidez = Math.min(window.devicePixelRatio || 1, 1.5);
    // Mede a tela.
    largura = window.innerWidth; altura = window.innerHeight;
    // Tamanho real da folha, em pontos de tela.
    folha.width = largura * nitidez; folha.height = altura * nitidez;
    // Desenhar em "pixels de CSS", sem se preocupar com a nitidez.
    caneta.setTransform(nitidez, 0, 0, nitidez, 0, 0);
    // Uma trilha para cada pedaço da tela; no celular são menos.
    trilhas = Array.from({ length: Math.round((largura * altura) / 42000) }, criarTrilha);
    // Um pulso a cada duas trilhas, cada um num ponto e com velocidade própria.
    pulsos = trilhas.filter((_, i) => i % 2 === 0).map((trilha) => ({ trilha, d: Math.random() * trilha.total, v: 50 + Math.random() * 70 }));
    // Desenha já, para não ficar um quadro vazio.
    desenhar(0);
  }

  // desenhar() pinta um quadro. Parâmetro: segundos desde o quadro anterior.
  function desenhar(segundos) {
    // Apaga o quadro anterior.
    caneta.clearRect(0, 0, largura, altura);
    // Trilhas: linha fina de ouro quase apagada.
    caneta.lineWidth = 1;
    caneta.strokeStyle = 'rgba(232, 185, 74, 0.13)';
    caneta.fillStyle = 'rgba(232, 185, 74, 0.3)';
    trilhas.forEach((trilha) => {
      // Desenha o caminho ponto a ponto.
      caneta.beginPath();
      trilha.pontos.forEach(([x, y], i) => (i ? caneta.lineTo(x, y) : caneta.moveTo(x, y)));
      caneta.stroke();
      // Solda: um quadradinho em cada ponta.
      [trilha.pontos[0], trilha.pontos[trilha.pontos.length - 1]].forEach(([x, y]) => caneta.fillRect(x - 2, y - 2, 4, 4));
    });
    // Pulsos: um rastro que clareia até a cabeça.
    pulsos.forEach((pulso) => {
      // Anda; ao passar do fim, recomeça em outra trilha.
      pulso.d += pulso.v * segundos;
      if (pulso.d > pulso.trilha.total + 60) { pulso.trilha = trilhas[sorteio(trilhas.length)]; pulso.d = 0; }
      // Rastro de 10 pontinhos, do mais apagado ao mais claro.
      for (let i = 10; i >= 0; i--) {
        const distancia = pulso.d - i * 5;
        if (distancia < 0 || distancia > pulso.trilha.total) continue;
        const [x, y] = lugar(pulso.trilha, distancia);
        caneta.fillStyle = `rgba(255, 226, 150, ${0.85 * (1 - i / 11)})`;
        caneta.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
      }
    });
  }

  // rodar() é chamada pelo navegador a cada quadro. Desenha no máximo 30 por segundo.
  function rodar(agora) {
    // Pede o próximo quadro.
    requestAnimationFrame(rodar);
    // Aba escondida ou menos de 33 ms: não desenha, para poupar bateria.
    if (document.hidden || agora - ultimo < 33) return;
    // Tempo passado, limitado a 0,1 s para os pulsos não darem salto.
    const segundos = Math.min((agora - ultimo) / 1000, 0.1);
    ultimo = agora;
    desenhar(segundos);
  }

  // Prepara agora e refaz quando a largura muda. No celular a altura muda ao rolar, e isso não conta.
  preparar();
  let larguraAnterior = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === larguraAnterior) return;
    larguraAnterior = window.innerWidth;
    preparar();
  });
  // Liga a animação, se a pessoa não pediu menos movimento.
  if (!semMovimento) requestAnimationFrame(rodar);

  // ===== LUZ QUE SEGUE O MOUSE =====
  // Painéis e botões que recebem a luz.
  const ILUMINADOS = '.picker, .q-card, .activity-panel, .activity-card, .painel-item, .option, .tpick, .cpick, .len, .rev-secao';
  // Um ouvinte só para a página toda.
  document.addEventListener('pointermove', (e) => {
    // Dedo não tem "passar por cima": só mouse e caneta.
    if (e.pointerType === 'touch') return;
    // Acende o elemento de dentro e o painel que o contém.
    for (let alvo = e.target.closest(ILUMINADOS); alvo; alvo = alvo.parentElement && alvo.parentElement.closest(ILUMINADOS)) {
      // Posição do mouse dentro do elemento.
      const caixa = alvo.getBoundingClientRect();
      // O CSS usa estas duas variáveis para pôr a luz no lugar.
      alvo.style.setProperty('--mx', `${e.clientX - caixa.left}px`);
      alvo.style.setProperty('--my', `${e.clientY - caixa.top}px`);
    }
  }, { passive: true });

  // ===== NÚCLEO =====
  // Anel ao lado do título.
  const nucleo = document.getElementById('nucleo');
  // Texto "0 de 627", que o painel de estudo já mantém certo.
  const vistas = document.getElementById('est-vistas');
  // atualizarNucleo() lê os dois números do texto e acende o anel.
  function atualizarNucleo() {
    // Acha os números no texto.
    const [feitas, total] = (vistas.textContent.match(/\d+/g) || [0, 0]).map(Number);
    // Porcentagem, sem dividir por zero.
    const pct = total ? feitas / total : 0;
    // Arco do anel.
    nucleo.style.setProperty('--pct', pct);
    // Uma casa decimal enquanto for menos de 10%, para o avanço aparecer logo no começo.
    document.getElementById('nucleo-pct').textContent = `${(pct * 100).toFixed(pct > 0 && pct < 0.1 ? 1 : 0).replace('.', ',')}%`;
  }
  // Toda vez que o texto mudar (troca de matéria ou fim de rodada), o anel acompanha.
  if (nucleo && vistas) {
    new MutationObserver(atualizarNucleo).observe(vistas, { childList: true });
    atualizarNucleo();
  }
})();
