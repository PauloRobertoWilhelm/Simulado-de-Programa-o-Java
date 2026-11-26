/*
  Arquivo: js/pug.js
  Papel no sistema: o pug, mascote que tira onda quando você erra e faz elogio irônico quando acerta.
  As figuras ficam em img/pug/ (10 expressões no estilo 3D e 10 no estilo desenho).
  A aparência e as animações estão em css/pug.css.

  Como os outros arquivos usam:
  - window.Pug.reagir('correct' ou 'wrong', { alvo, sequencia, mudouNivel, nivel })
      com "alvo" (a caixa da explicação), o pug aparece dentro dela; sem "alvo", aparece no canto;
  - window.Pug.resultado(porcentagem, caixa)   pug com a frase da nota, no fim da prova;
  - window.Pug.materia(id, titulo)              troca as piadas para as da matéria aberta;
  - window.Pug.estilo() / definirEstilo(valor)   "3d", "desenho" ou "desligado" (salvo no navegador).
  O pug é só enfeite: aria-hidden faz o leitor de tela pular as piadas.
*/

// A função roda uma vez e não deixa variáveis soltas na página.
(() => {
  // Número do arquivo de cada expressão (img/pug/3d-1.webp, desenho-1.webp...). A ordem é a das imagens que o Paulo mandou.
  const EXPRESSOES = { zoeira: 1, chocado: 2, bravo: 3, desconfiado: 4, feliz: 5, malandro: 6, ironico: 7, empolgado: 8, triste: 9, gargalhada: 10 };
  // Caras que combinam com cada situação. O pug sorteia uma delas.
  const CARAS = {
    erro: ['zoeira', 'gargalhada', 'malandro', 'desconfiado', 'bravo'],
    acerto: ['ironico', 'chocado', 'desconfiado', 'feliz', 'malandro'],
    sequencia: ['empolgado', 'chocado'],
    subiu: ['empolgado', 'feliz'],
    desceu: ['triste'],
    toque: ['bravo', 'desconfiado', 'chocado'],
    oi: ['feliz', 'malandro'],
  };
  // Frases comuns a todas as matérias. {n} = acertos seguidos, {nivel} = nome do nível, {materia} = nome da matéria.
  const FRASES = {
    erro: [
      'Errou com tanta convicção que eu quase acreditei.',
      'Chutou? O goleiro agradece.',
      'Calma. Até o pug erra… mas não assim.',
      'Essa foi de propósito, né? Fala que foi.',
      'Se errar valesse ponto, você já tinha passado.',
      'Interessante. Errado, mas interessante.',
      'Vou fingir que não vi. Mentira, eu vi.',
      'Fiquei com vergonha alheia aqui.',
      'Tá treinando para errar na prova também?',
      'Resposta corajosa. Errada, mas corajosa.',
      'Lê de novo. Devagar. Com fé.',
      'Até o meu focinho achatado via essa.',
      'Se a confiança desse nota, você tirava 10.',
      'Essa doeu até em mim, e eu sou um pug.',
      'Lê a explicação aí embaixo. Ela não morde. Eu talvez.',
    ],
    acerto: [
      'Uau. Até que enfim.',
      'Acertou? Não vou contar para ninguém. Ninguém ia acreditar.',
      'Que orgulho. Quase chorei. Quase.',
      'Ok, gênio. Não se acostuma.',
      'Sorte de principiante, só pode.',
      'Olha só, o cérebro ligou.',
      'Parabéns, você fez o mínimo.',
      'Bonito. Agora acerta a próxima, quero ver.',
      'Acertou. Vou anotar no meu diário de milagres.',
      'Foi chute ou foi estudo? Eu sei a resposta.',
      'Até que você não é tão ruim assim.',
      'Muito bem. Agora não fica se achando.',
      'Acertou sem colar? Respeito.',
      'Seu professor ficaria levemente orgulhoso.',
    ],
    sequencia3: ['Três seguidas? Quem é você e o que fez com o aluno?', 'Três em sequência. Tô começando a desconfiar.'],
    sequencia5: ['Cinco seguidas! Isso está me deixando nervoso.', 'Cinco! Vou ter que arrumar outro emprego.'],
    sequenciaMais: ['{n} seguidas. Tá bom, você venceu. Por hoje.', '{n} em sequência. Para de me humilhar.'],
    subiu: ['Subiu para o {nivel}. Agora a brincadeira fica séria.', 'Nível {nivel}! Segura, que vem pergunta de gente grande.', 'Promovido para o {nivel}. Não vá me decepcionar.'],
    desceu: ['Desceu para o {nivel}. Respira, bebe uma água e volta.', 'De volta ao {nivel}. Às vezes é preciso dar um passo atrás.', '{nivel} de novo. O chão está aí para isso.'],
    toque: ['Ei! Eu sou um pug, não um botão.', 'Para de me cutucar e vai estudar.', 'Ai! Isso doeu no meu ego.', 'Cutucar o pug não dá ponto, viu?', 'Tô de olho em você.'],
    oi: ['Bora estudar {materia}? Prometo zoar só um pouquinho.', 'Cheguei. Vou ficar de olho nas suas respostas.', 'Pode começar. Eu fico aqui torcendo… ou rindo.'],
    otimo: ['Nota {nota}? Tá. Vou admitir: mandou bem.', 'Quase gabaritou. Fiquei sem piada. Que raiva.'],
    bom: ['Passou. Não foi lindo, mas passou.', 'Aprovado. Agora estuda o que errou, senão eu conto para todo mundo.'],
    medio: ['Meio-termo, igual pug: nem grande, nem pequeno.', 'Dá para melhorar. Bastante. Mas dá.'],
    ruim: ['Isso foi uma prova ou um sorteio?', 'Calma. Revisa os erros e volta. Eu espero. Com pipoca.'],
  };
  // Piadas de cada matéria: entram misturadas com as comuns.
  const DA_MATERIA = {
    redes: {
      erro: ['Erro 404: resposta certa não encontrada.', 'Seu raciocínio perdeu pacote no caminho.', 'O TTL zerou antes de chegar à resposta.', 'Até o UDP entregaria melhor que isso.', 'Isso é erro 4xx: a culpa é do cliente. Você.'],
      acerto: ['200 OK. Milagres acontecem.', 'Handshake completo: SYN, SYN-ACK, ACERTOU.', 'Pacote entregue sem retransmissão. Chique.'],
    },
    programacao: {
      erro: ['NullPointerException no seu raciocínio.', 'Compilou na sua cabeça, né? Aqui não.', 'Esse laço deu uma volta a mais.', 'Faltou um ponto e vírgula na sua lógica.'],
      acerto: ['Compilou de primeira? Desconfio.', 'System.out.println("uau");', 'Sem erro de compilação. Que evolução.'],
    },
    requisitos: {
      erro: ['Esse requisito não passou na validação.', 'Faltou critério de aceite nessa resposta.', 'Isso foi um «extend»: opcional e errado.'],
      acerto: ['Requisito validado. Pode entregar.', 'Critério de aceite cumprido. Chocado.', 'Isso foi um «include»: acerto obrigatório.'],
    },
    design: {
      erro: ['O Nielsen choraria com essa resposta.', 'Você caiu no golfo da execução.', 'Essa resposta não tem affordance nenhuma.'],
      acerto: ['Usabilidade aprovada. O Nielsen sorriu.', 'Interface intuitiva, igual à sua resposta.'],
    },
    testing: {
      erro: ['Bug encontrado: na sua resposta.', 'Teste de regressão: você regrediu.', 'Caixa-preta? Sua resposta veio vazia.'],
      acerto: ['Passou no teste. Até no smoke test.', 'Zero bugs nessa. Anota a data.'],
    },
    pensamento: {
      erro: ['Decompõe esse problema aí, porque não deu.', 'Seu algoritmo entrou em laço infinito.'],
      acerto: ['Algoritmo aprovado: finito e preciso.', 'Abstração nível pug: perfeita.'],
    },
    cyberseguranca: {
      erro: ['O firewall bloqueou a sua resposta.', 'Foi phishing? Porque você caiu.'],
      acerto: ['Acesso concedido. Por enquanto.', 'Defesa em profundidade: aprovada.'],
    },
    ambientacao: {
      erro: ['Seu sistema de arquivos corrompeu.', 'Volta para o snapshot anterior, vai.'],
      acerto: ['Máquina virtual rodando liso.', 'Snapshot salvo: você acertou.'],
    },
  };

  // Matéria aberta agora (id e nome), para as piadas e o "oi".
  let materiaId = '';
  let materiaNome = '';
  // Hora da última REAÇÃO no canto (acerto ou erro), para o pug não falar sem parar nos jogos.
  // O "oi" e as reclamações de toque não contam: assim a primeira resposta sempre ganha comentário.
  let ultimaReacao = 0;
  // Relógio que esconde o balão do canto.
  let relogio = null;
  // Sacolas de frases: cada frase só repete depois de todas as outras saírem.
  const sacolas = {};

  // sortear() tira um item da lista sem repetir até a lista acabar.
  // Parâmetros: chave (nome da sacola) e lista (frases ou caras). Devolve um item.
  function sortear(chave, lista) {
    // Sacola vazia (ou lista nova): enche de novo, embaralhada.
    if (!sacolas[chave] || !sacolas[chave].length) sacolas[chave] = [...lista].sort(() => Math.random() - 0.5);
    // Tira o último item da sacola.
    return sacolas[chave].pop();
  }

  // estilo() lê o estilo salvo: "3d" (padrão), "desenho" ou "desligado".
  function estilo() {
    // try/catch: navegador em modo privado pode recusar o acesso ao armazenamento.
    try {
      // Lê a escolha guardada.
      const salvo = localStorage.getItem('unipar_pug');
      // Só aceita os três valores conhecidos.
      return ['3d', 'desenho', 'desligado'].includes(salvo) ? salvo : '3d';
    } catch (erro) {
      // Sem armazenamento, usa o padrão.
      return '3d';
    }
  }

  // foto() devolve o endereço da figura de uma expressão no estilo escolhido.
  // Parâmetro: expressao (nome em EXPRESSOES).
  function foto(expressao) {
    // Exemplo: img/pug/3d-10.webp.
    return `img/pug/${estilo()}-${EXPRESSOES[expressao] || 5}.webp`;
  }

  // preencher() troca {n}, {nivel}, {nota} e {materia} pelos valores.
  // Parâmetros: frase e valores (objeto). Devolve o texto pronto.
  function preencher(frase, valores) {
    // Cada {nome} vira o valor do mesmo nome; sem valor, fica vazio.
    return frase.replace(/\{(\w+)\}/g, (_, nome) => (valores[nome] !== undefined ? valores[nome] : ''));
  }

  // fraseDe() escolhe uma frase do tipo pedido, misturando a da matéria com as comuns.
  // Parâmetro: tipo ("erro" ou "acerto"). Devolve o texto.
  function fraseDe(tipo) {
    // Piadas da matéria aberta (pode não ter).
    const proprias = (DA_MATERIA[materiaId] || {})[tipo] || [];
    // Quatro em dez vezes, quando houver, usa a piada da matéria.
    if (proprias.length && Math.random() < 0.4) return sortear(`${materiaId}-${tipo}`, proprias);
    // Nas outras vezes, uma das comuns.
    return sortear(tipo, FRASES[tipo]);
  }

  // criarFala() monta o pug com o balão. Devolve o elemento pronto.
  // Parâmetros: texto (fala), expressao (nome da cara) e classe ("erro", "acerto", "festa" ou "triste").
  function criarFala(texto, expressao, classe) {
    // Caixa que junta foto e balão.
    const fala = document.createElement('div');
    // Classes para o visual e a animação (css/pug.css).
    fala.className = `pug-fala ${classe}`;
    // Enfeite: o leitor de tela pula.
    fala.setAttribute('aria-hidden', 'true');
    // Moldura da foto.
    const moldura = document.createElement('div');
    moldura.className = 'pug-foto';
    // A figura do pug.
    const img = document.createElement('img');
    img.src = foto(expressao);
    // Texto alternativo vazio: a figura é só decoração.
    img.alt = '';
    moldura.append(img);
    // Balão com a fala. textContent impede que a frase vire código.
    const balao = document.createElement('div');
    balao.className = 'pug-balao';
    balao.textContent = texto;
    // Junta tudo.
    fala.append(moldura, balao);
    return fala;
  }

  // ===== PUG FLUTUANTE (canto da tela) =====
  // Caixa do canto, criada uma vez só.
  const canto = document.createElement('div');
  // Classe do visual (css/pug.css).
  canto.className = 'pug-flutuante';
  // Enfeite: o leitor de tela pula.
  canto.setAttribute('aria-hidden', 'true');
  // Foto e balão do canto.
  canto.innerHTML = '<div class="pug-foto"><img alt=""></div><div class="pug-balao"></div>';
  // Atalhos para a figura e o balão.
  const cantoImg = canto.querySelector('img');
  const cantoBalao = canto.querySelector('.pug-balao');

  // falarNoCanto() mostra o pug no canto com uma frase e esconde depois de alguns segundos.
  // Parâmetros: texto, expressao e segundos (quanto tempo fica).
  function falarNoCanto(texto, expressao, segundos = 4) {
    // Pug desligado: não faz nada.
    if (estilo() === 'desligado') return;
    // Troca a cara e a fala.
    cantoImg.src = foto(expressao);
    cantoBalao.textContent = texto;
    // Recomeça a animação do pulinho tirando e pondo a classe (o reflow no meio faz o navegador reiniciar).
    canto.classList.remove('falando');
    void canto.offsetWidth;
    // Aparece e fala.
    canto.classList.add('ativo', 'falando');
    // Cancela o relógio anterior, se houver.
    clearTimeout(relogio);
    // Depois do tempo, cala e volta para o plantão (ou sai da tela).
    relogio = setTimeout(() => {
      canto.classList.remove('ativo', 'falando');
      // De plantão, a cara volta a ser a de cochilo.
      cantoImg.src = foto('ironico');
    }, segundos * 1000);
  }

  // Tocar no pug do canto: ele reclama.
  canto.querySelector('.pug-foto').addEventListener('click', () => {
    falarNoCanto(sortear('toque', FRASES.toque), sortear('cara-toque', CARAS.toque), 3);
  });

  // aplicarEstilo() liga ou desliga o pug do canto conforme a escolha e pré-carrega as figuras.
  function aplicarEstilo() {
    // Estilo escolhido.
    const atual = estilo();
    // Desligado: some do canto. Ligado: fica de plantão (só aparece parado nas telas largas, pelo CSS).
    canto.classList.toggle('de-plantao', atual !== 'desligado');
    // Sem pug, para aqui.
    if (atual === 'desligado') { canto.classList.remove('ativo', 'falando'); return; }
    // Cara de plantão: cochilando ou piscando.
    cantoImg.src = foto('ironico');
    // Pré-carrega as 10 figuras, para a reação aparecer na hora.
    Object.values(EXPRESSOES).forEach((n) => { const img = new Image(); img.src = `img/pug/${atual}-${n}.webp`; });
  }

  // ===== O QUE OS OUTROS ARQUIVOS CHAMAM =====
  // reagir() é chamada a cada resposta (prova, histórias, jogos e praticar).
  // Parâmetros: tipo ("correct" ou "wrong") e contexto { alvo, sequencia, mudouNivel, nivel }.
  function reagir(tipo, contexto = {}) {
    // Pug desligado: não faz nada.
    if (estilo() === 'desligado') return;
    // Acertou?
    const acertou = tipo === 'correct';
    // Acertos seguidos (só a prova manda).
    const n = contexto.sequencia || 0;
    // Frase, cara e animação de cada caso. Começa pelo acerto ou erro comum.
    let texto = fraseDe(acertou ? 'acerto' : 'erro');
    let cara = sortear(acertou ? 'cara-acerto' : 'cara-erro', acertou ? CARAS.acerto : CARAS.erro);
    let classe = acertou ? 'acerto' : 'erro';
    // Subiu ou desceu de nível vale mais que tudo.
    if (contexto.mudouNivel === 1) {
      texto = preencher(sortear('subiu', FRASES.subiu), { nivel: contexto.nivel });
      cara = sortear('cara-subiu', CARAS.subiu);
      classe = 'festa';
    } else if (contexto.mudouNivel === -1) {
      texto = preencher(sortear('desceu', FRASES.desceu), { nivel: contexto.nivel });
      cara = 'triste';
      classe = 'triste';
    } else if (acertou && (n === 3 || n === 5 || (n >= 7 && n % 2 === 1))) {
      // Sequência de acertos: 3, 5, 7, 9...
      const lista = n === 3 ? FRASES.sequencia3 : n === 5 ? FRASES.sequencia5 : FRASES.sequenciaMais;
      texto = preencher(sortear(`seq${Math.min(n, 7)}`, lista), { n });
      cara = sortear('cara-seq', CARAS.sequencia);
      classe = 'festa';
    }
    // Com alvo (a explicação da prova): o pug entra no começo da caixa.
    if (contexto.alvo) {
      contexto.alvo.prepend(criarFala(texto, cara, classe));
      return;
    }
    // Sem alvo (jogos, histórias, praticar): fala no canto, no máximo uma reação a cada 4,5 segundos.
    if (Date.now() - ultimaReacao < 4500) return;
    // Guarda a hora desta reação.
    ultimaReacao = Date.now();
    falarNoCanto(texto, cara);
  }

  // resultado() põe o pug na tela final, com a frase da nota.
  // Parâmetros: pct (0 a 100) e caixa (onde o pug entra).
  function resultado(pct, caixa) {
    // Sem caixa: não há onde desenhar.
    if (!caixa) return;
    // Limpa o pug da rodada anterior.
    caixa.replaceChildren();
    // Pug desligado: a caixa fica vazia.
    if (estilo() === 'desligado') return;
    // Faixa da nota: ótimo, bom, médio ou ruim.
    const faixa = pct >= 90 ? 'otimo' : pct >= 70 ? 'bom' : pct >= 40 ? 'medio' : 'ruim';
    // Cara de cada faixa.
    const cara = { otimo: 'chocado', bom: 'feliz', medio: 'desconfiado', ruim: 'gargalhada' }[faixa];
    // Nota de 0 a 10 com vírgula, para a frase.
    const nota = (pct / 10).toFixed(1).replace('.', ',');
    // Animação: festa nas notas boas, cabeça baixa nas ruins.
    const classe = pct >= 70 ? 'festa' : pct >= 40 ? 'acerto' : 'triste';
    // Desenha.
    caixa.append(criarFala(preencher(sortear(faixa, FRASES[faixa]), { nota }), cara, classe));
  }

  // materia() avisa qual matéria está aberta. Na primeira vez, o pug dá oi no canto.
  // Parâmetros: id (como "redes") e titulo (nome para mostrar).
  let jaDeuOi = false;
  function materia(id, titulo) {
    // Guarda para as piadas.
    materiaId = id;
    materiaNome = titulo || '';
    // Só um "oi" por visita, um pouco depois de a página abrir.
    if (jaDeuOi) return;
    jaDeuOi = true;
    setTimeout(() => {
      // Se a pessoa já respondeu algo e o pug está comentando, o "oi" não passa por cima.
      if (canto.classList.contains('falando')) return;
      falarNoCanto(preencher(sortear('oi', FRASES.oi), { materia: materiaNome }), sortear('cara-oi', CARAS.oi), 4.5);
    }, 1200);
  }

  // definirEstilo() salva a escolha ("3d", "desenho" ou "desligado") e aplica na hora.
  function definirEstilo(valor) {
    // try/catch: modo privado pode recusar a gravação; o pug muda só nesta visita.
    try { localStorage.setItem('unipar_pug', valor); } catch (erro) { console.warn('Não deu para salvar o estilo do pug.', erro); }
    // Liga ou desliga o canto.
    aplicarEstilo();
    // Mostra o pug novo falando, para a pessoa ver o resultado da escolha.
    if (valor !== 'desligado') falarNoCanto('E aí, gostou do meu visual novo?', 'malandro', 3);
  }

  // Põe o canto na página e aplica o estilo salvo quando o HTML terminar de carregar.
  document.addEventListener('DOMContentLoaded', () => { document.body.append(canto); aplicarEstilo(); });

  // Deixa as funções disponíveis para o index.html e o js/temas.js.
  window.Pug = { reagir, resultado, materia, estilo, definirEstilo };
})();
