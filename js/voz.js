/*
  Arquivo: js/voz.js
  Papel no sistema: tudo o que fala e tudo o que escuta no app.

  O navegador oferece duas ferramentas prontas:
  - speechSynthesis: lê um texto em voz alta;
  - SpeechRecognition: escuta o microfone e devolve o texto falado.

  As outras telas usam apenas as funções deste arquivo:
  Voz.falar(), Voz.lerSeAtivo(), Voz.parar(), Voz.ouvir() e Voz.confere().
*/
window.Voz = (function () {
  const CHAVE = 'unipar_ler_em_voz_alta';
  const sintese = window.speechSynthesis;
  const Reconhecedor = window.SpeechRecognition || window.webkitSpeechRecognition;
  let vozPortugues = null;
  let escutaAtual = null;

  // Procura uma voz em português do Brasil entre as instaladas no aparelho.
  function escolherVoz() {
    if (!sintese) return;
    const vozes = sintese.getVoices();
    vozPortugues = vozes.find((voz) => /^pt[-_]BR/i.test(voz.lang))
      || vozes.find((voz) => /^pt/i.test(voz.lang))
      || null;
  }

  if (sintese) {
    escolherVoz();
    sintese.addEventListener('voiceschanged', escolherVoz);
  }

  // limparTexto() tira as marcações que não fazem sentido em voz alta.
  function limparTexto(texto) {
    return String(texto)
      .replace(/<[^>]+>/g, ' ')
      .replace(/[`«»“”]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function falar(texto, aoTerminar) {
    if (!sintese) {
      if (aoTerminar) aoTerminar();
      return;
    }
    sintese.cancel();
    const fala = new SpeechSynthesisUtterance(limparTexto(texto));
    fala.lang = 'pt-BR';
    if (vozPortugues) fala.voice = vozPortugues;
    if (aoTerminar) fala.onend = aoTerminar;
    sintese.speak(fala);
  }

  function parar() {
    if (sintese) sintese.cancel();
    if (escutaAtual) escutaAtual.abort();
  }

  // A opção "Ler em voz alta" fica salva no navegador.
  function ativo() {
    return localStorage.getItem(CHAVE) === 'sim';
  }

  function definirAtivo(ligado) {
    localStorage.setItem(CHAVE, ligado ? 'sim' : 'nao');
    if (!ligado) parar();
  }

  function lerSeAtivo(texto) {
    if (ativo()) falar(texto);
  }

  // ouvir() liga o microfone uma vez e entrega o que entendeu.
  function ouvir({ aoOuvir, aoErro, aoFim }) {
    if (!Reconhecedor) {
      if (aoErro) aoErro('sem-suporte');
      if (aoFim) aoFim();
      return;
    }
    if (sintese) sintese.cancel();

    const escuta = new Reconhecedor();
    escuta.lang = 'pt-BR';
    escuta.interimResults = false;
    escuta.maxAlternatives = 5;

    escuta.onresult = (evento) => {
      const opcoes = [...evento.results[0]].map((item) => item.transcript);
      if (aoOuvir) aoOuvir(opcoes);
    };
    escuta.onerror = (evento) => {
      if (aoErro && evento.error !== 'aborted') aoErro(evento.error);
    };
    escuta.onend = () => {
      escutaAtual = null;
      if (aoFim) aoFim();
    };

    escutaAtual = escuta;
    escuta.start();
  }

  // Traduz os códigos de erro do navegador para uma orientação.
  function mensagemDeErro(codigo) {
    const mensagens = {
      'sem-suporte': 'Este navegador não escuta o microfone. Use o Chrome ou o Edge, ou digite a resposta.',
      'not-allowed': 'O microfone está bloqueado. Libere o acesso no cadeado da barra de endereço.',
      'service-not-allowed': 'O microfone está bloqueado. Libere o acesso no cadeado da barra de endereço.',
      'no-speech': 'Não ouvi nada. Toque de novo e fale logo depois.',
      'audio-capture': 'Nenhum microfone foi encontrado neste aparelho.',
      network: 'O reconhecimento de voz precisa de internet. Confira a conexão ou digite a resposta.'
    };
    return mensagens[codigo] || 'Não deu para ouvir agora. Tente de novo ou digite a resposta.';
  }

  // normalizar() deixa o texto comparável: sem acento, sem pontuação, em minúsculas.
  function normalizar(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  // distancia() conta quantas letras precisam mudar para um texto virar o outro.
  function distancia(a, b) {
    let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const atual = [i];
      for (let j = 1; j <= b.length; j++) {
        const troca = a[i - 1] === b[j - 1] ? 0 : 1;
        atual[j] = Math.min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + troca);
      }
      anterior = atual;
    }
    return anterior[b.length];
  }

  // confere() compara o que foi dito com as respostas aceitas.
  // Devolve "certo", "quase" ou "errado".
  function confere(tentativas, aceitas) {
    const ditos = [].concat(tentativas).map(normalizar).filter(Boolean);
    const certas = aceitas.map(normalizar);

    const acertou = ditos.some((dito) => certas.some((certa) => ` ${dito} `.includes(` ${certa} `)));
    if (acertou) return 'certo';

    const perto = ditos.some((dito) => certas.some((certa) => {
      const maior = Math.max(dito.length, certa.length);
      return maior >= 4 && distancia(dito, certa) / maior <= 0.34;
    }));
    return perto ? 'quase' : 'errado';
  }

  // letraFalada() entende "letra B", "alternativa c" ou só "d". Devolve 0 a 3, ou -1.
  function letraFalada(tentativas) {
    const letras = { a: 0, b: 1, be: 1, c: 2, ce: 2, se: 2, d: 3, de: 3 };
    for (const tentativa of [].concat(tentativas)) {
      const palavras = normalizar(tentativa).split(' ')
        .filter((palavra) => !['letra', 'alternativa', 'opcao', 'resposta', 'e', 'a resposta'].includes(palavra));
      if (palavras.length === 1 && palavras[0] in letras) return letras[palavras[0]];
    }
    return -1;
  }

  return {
    podeFalar: Boolean(sintese),
    podeOuvir: Boolean(Reconhecedor),
    falar,
    parar,
    ativo,
    definirAtivo,
    lerSeAtivo,
    ouvir,
    mensagemDeErro,
    normalizar,
    confere,
    letraFalada
  };
})();
