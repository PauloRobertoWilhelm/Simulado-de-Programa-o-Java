/*
  Arquivo: js/geradores.js
  Papel no sistema: cria perguntas de CONTA novas toda vez, com números sorteados.

  Por que existe: perguntas fixas a gente acaba decorando. Aqui o TTL, o IP, a
  máscara e o número de sequência mudam a cada pergunta, então a resposta certa
  também muda. Só dá para acertar fazendo a conta.

  As respostas erradas não são aleatórias: são os erros mais comuns de quem faz
  a conta (esquecer o "− 2", trocar rede por broadcast, somar 1 a mais...).

  Como usar: window.Geradores.gerar("redes", 10) devolve 10 perguntas novas.
*/
window.Geradores = (function () {
  // sorteia() devolve um número inteiro entre min e max, incluindo os dois.
  function sorteia(min, max) {
    // Math.random() dá um número entre 0 e 1; multiplicado e arredondado vira um inteiro da faixa.
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // escolhe() devolve um item sorteado de uma lista.
  function escolhe(lista) {
    // Sorteia uma posição válida da lista e devolve o item dela.
    return lista[sorteia(0, lista.length - 1)];
  }

  // pergunta() monta a pergunta no mesmo formato das perguntas dos arquivos JSON.
  // Parâmetros: enunciado, a resposta certa, a lista de erradas, uma função que
  // inventa uma errada extra (usada se alguma repetir) e a explicação.
  function pergunta(enunciado, certa, erradas, extra, explicacao) {
    // Começa com a certa na posição 0. O simulado muda a posição depois.
    const opcoes = [String(certa)];
    // Acrescenta cada errada que ainda não está na lista.
    erradas.map(String).forEach((errada) => {
      // Só entra se não repetir e se ainda couber (máximo de 4 opções).
      if (!opcoes.includes(errada) && opcoes.length < 4) opcoes.push(errada);
    });
    // Se faltou opção (alguma errada repetiu), pede outras até completar 4.
    let tentativas = 0;
    while (opcoes.length < 4 && tentativas < 50) {
      // Gera uma errada extra.
      const nova = String(extra());
      // Só usa se for diferente das que já estão.
      if (!opcoes.includes(nova)) opcoes.push(nova);
      // Conta as tentativas para nunca travar num laço sem fim.
      tentativas++;
    }
    // "topic: contas" separa estas perguntas das perguntas fixas.
    return { topic: 'contas', statement: enunciado, options: opcoes, correct: 0, explain: explicacao };
  }

  // mascara() transforma um prefixo (como 26) na máscara decimal (255.255.255.192).
  function mascara(prefixo) {
    // Lista com os 4 números da máscara.
    const partes = [];
    // Para cada um dos 4 octetos...
    for (let i = 0; i < 4; i++) {
      // ...quantos bits 1 ainda faltam colocar neste octeto (entre 0 e 8).
      const bits = Math.max(0, Math.min(8, prefixo - i * 8));
      // 8 bits 1 = 255; 0 bits = 0; no meio, 256 − 2^(8 − bits).
      partes.push(bits === 0 ? 0 : 256 - 2 ** (8 - bits));
    }
    // Junta com pontos: 255.255.255.192.
    return partes.join('.');
  }

  // baseDoIp() sorteia os três primeiros números de um IP privado, como "192.168.4.".
  function baseDoIp() {
    // Sorteia uma das três faixas privadas.
    const faixa = escolhe(['10', '172', '192']);
    // Segundo número de acordo com a faixa.
    const segundo = faixa === '10' ? sorteia(0, 255) : faixa === '172' ? sorteia(16, 31) : 168;
    // Devolve os três primeiros números e um ponto no fim.
    return `${faixa}.${segundo}.${sorteia(0, 255)}.`;
  }

  // ===== PERGUNTAS DE TTL =====
  // ttlChega(): com que TTL o pacote chega?
  function ttlChega() {
    // Valor inicial comum de sistemas operacionais.
    const inicial = escolhe([64, 128, 255]);
    // Quantos roteadores no caminho.
    const saltos = sorteia(3, 20);
    // Cada roteador tira 1.
    const certa = inicial - saltos;
    return pergunta(
      `Um pacote sai com TTL = ${inicial} e passa por ${saltos} roteadores até o destino. Com que TTL ele chega?`,
      certa,
      // Erros comuns: somar em vez de subtrair, errar por 1 para mais ou para menos.
      [inicial + saltos, certa + 1, certa - 1],
      () => certa + sorteia(2, 9),
      `<b>Conta:</b> cada roteador tira 1 do TTL. ${inicial} − ${saltos} = ${certa}.`
    );
  }

  // ttlSaltos(): quantos roteadores o pacote atravessou?
  function ttlSaltos() {
    // Valor inicial verdadeiro (escondido na pergunta).
    const inicial = escolhe([64, 128, 255]);
    // No máximo 30 saltos, para o TTL que chega não confundir com outro valor inicial.
    const saltos = sorteia(2, 30);
    // TTL que aparece na resposta do ping.
    const recebido = inicial - saltos;
    // Erro comum: usar o valor inicial errado (o próximo da lista).
    const outroInicial = inicial === 64 ? 128 : inicial === 128 ? 255 : 128;
    return pergunta(
      `A resposta de um ping chega com TTL = ${recebido}. Os sistemas começam com 64, 128 ou 255. Quantos roteadores o pacote atravessou, mais provavelmente?`,
      saltos,
      [Math.abs(outroInicial - recebido), saltos + 1, recebido],
      () => saltos + sorteia(2, 9),
      `<b>Truque:</b> pegue o valor inicial mais próximo ACIMA de ${recebido}, que é ${inicial}. Depois: ${inicial} − ${recebido} = ${saltos} roteadores.`
    );
  }

  // ===== PERGUNTAS DE SUB-REDE =====
  // subRede(): monta uma pergunta sobre um endereço sorteado.
  // Parâmetro: tipo ("rede", "broadcast", "primeiro" ou "ultimo").
  function subRede(tipo) {
    // Prefixo de /25 a /30: o salto fica no último número do IP.
    const prefixo = sorteia(25, 30);
    // Tamanho de cada bloco: 2 elevado aos bits de host. /26 dá 64.
    const bloco = 2 ** (32 - prefixo);
    // Último número da máscara: 256 − bloco. /26 dá 192.
    const fimMascara = 256 - bloco;
    // Sorteia em qual bloco o IP vai cair (começo do bloco = endereço de rede).
    const rede = sorteia(0, 256 / bloco - 1) * bloco;
    // Último endereço do bloco = broadcast.
    const broadcast = rede + bloco - 1;
    // IP de um host qualquer dentro do bloco (nunca a rede nem o broadcast).
    const host = rede + sorteia(1, bloco - 2);
    // Os três primeiros números do IP.
    const base = baseDoIp();
    // Texto do IP completo com o prefixo.
    const ip = `${base}${host}/${prefixo}`;
    // Passo a passo que aparece na explicação, igual para os quatro tipos.
    const passos = `<b>Salto:</b> /${prefixo} tem máscara final ${fimMascara}, então o salto é 256 − ${fimMascara} = ${bloco}. O ${host} cai no bloco de ${rede} a ${broadcast}. Rede = ${base}${rede}, broadcast = ${base}${broadcast}, hosts de ${base}${rede + 1} a ${base}${broadcast - 1}.`;
    // Erradas extra: outro número do mesmo tipo, deslocado por um bloco.
    const extra = () => `${base}${(rede + bloco * sorteia(1, 3)) % 256}`;

    if (tipo === 'rede') {
      // Erros comuns: confundir com broadcast, pegar o bloco vizinho, responder o próprio IP.
      return pergunta(`Qual é o endereço de rede de ${ip}?`, `${base}${rede}`,
        [`${base}${broadcast}`, `${base}${(rede + bloco) % 256}`, `${base}${host}`], extra, passos);
    }
    if (tipo === 'broadcast') {
      // Erros comuns: confundir com a rede, errar por 1, usar o fim do bloco seguinte.
      return pergunta(`Qual é o endereço de broadcast de ${ip}?`, `${base}${broadcast}`,
        [`${base}${rede}`, `${base}${broadcast - 1}`, `${base}${(broadcast + bloco) % 256}`], extra, passos);
    }
    if (tipo === 'primeiro') {
      // Erros comuns: responder a própria rede, ou o segundo endereço.
      return pergunta(`Qual é o PRIMEIRO host utilizável da sub-rede de ${ip}?`, `${base}${rede + 1}`,
        [`${base}${rede}`, `${base}${rede + 2}`, `${base}${broadcast - 1}`], extra, passos);
    }
    // tipo "ultimo": erros comuns são responder o broadcast ou o penúltimo.
    return pergunta(`Qual é o ÚLTIMO host utilizável da sub-rede de ${ip}?`, `${base}${broadcast - 1}`,
      [`${base}${broadcast}`, `${base}${broadcast - 2}`, `${base}${rede + 1}`], extra, passos);
  }

  // hostsUteis(): quantos hosts cabem num prefixo?
  function hostsUteis() {
    // Prefixos de /16 a /30.
    const prefixo = sorteia(16, 30);
    // Bits que sobram para os hosts.
    const h = 32 - prefixo;
    // Fórmula: 2^h − 2.
    const certa = 2 ** h - 2;
    return pergunta(`Quantos hosts utilizáveis cabem numa sub-rede /${prefixo}?`, certa,
      // Erros comuns: esquecer o −2, tirar só 1, usar um bit a mais.
      [2 ** h, 2 ** h - 1, 2 ** (h + 1) - 2],
      () => 2 ** (h - 1) - 2,
      `<b>Fórmula:</b> sobram 32 − ${prefixo} = ${h} bits. 2^${h} = ${2 ** h}, e tirando a rede e o broadcast: ${2 ** h} − 2 = ${certa}.`);
  }

  // mascaraDecimal(): qual máscara corresponde a um prefixo?
  function mascaraDecimal() {
    // Prefixos de /17 a /30, em que a conta é mais interessante.
    const prefixo = sorteia(17, 30);
    return pergunta(`Qual é a máscara em decimal do prefixo /${prefixo}?`, mascara(prefixo),
      // Erros comuns: um bit a mais, um bit a menos, um octeto inteiro de diferença.
      [mascara(prefixo + 1 > 32 ? prefixo - 2 : prefixo + 1), mascara(prefixo - 1), mascara(prefixo >= 24 ? prefixo - 8 : prefixo + 8)],
      () => mascara(sorteia(17, 30)),
      `<b>Conta os bits 1:</b> /${prefixo} são ${prefixo} bits 1 seguidos. Cada octeto cheio vale 255, e o octeto quebrado vale 256 − 2^(bits que faltam). Resultado: ${mascara(prefixo)}.`);
  }

  // prefixoDaMascara(): o contrário, qual prefixo tem esta máscara?
  function prefixoDaMascara() {
    // Prefixos de /17 a /30.
    const prefixo = sorteia(17, 30);
    return pergunta(`A máscara ${mascara(prefixo)} corresponde a qual prefixo CIDR?`, `/${prefixo}`,
      [`/${prefixo + 1 > 32 ? prefixo - 2 : prefixo + 1}`, `/${prefixo - 1}`, `/${prefixo >= 24 ? prefixo - 8 : prefixo + 8}`],
      () => `/${sorteia(17, 30)}`,
      `<b>Contar bits 1:</b> 255 = 8 bits. Some 8 para cada 255 e, no número quebrado, conte os 1 do começo do binário. Total: /${prefixo}.`);
  }

  // quantasSubRedes(): quantas sub-redes menores cabem numa maior?
  function quantasSubRedes() {
    // Rede original.
    const maior = escolhe([16, 20, 22, 24]);
    // Sub-rede pedida: de 1 a 6 bits a mais, sem passar de /30.
    const menor = Math.min(30, maior + sorteia(1, 6));
    // Bits emprestados.
    const emprestados = menor - maior;
    // Fórmula: 2^bits emprestados.
    const certa = 2 ** emprestados;
    return pergunta(`Quantas sub-redes /${menor} cabem dentro de uma rede /${maior}?`, certa,
      // Erros comuns: um bit a mais, multiplicar em vez de elevar, tirar 2 sem motivo.
      [2 ** (emprestados + 1), emprestados * 2, Math.max(1, certa - 2)],
      () => certa + sorteia(1, 5),
      `<b>Bits emprestados:</b> ${menor} − ${maior} = ${emprestados}. Cada bit dobra a quantidade: 2^${emprestados} = ${certa} sub-redes. Aqui não se tira 2, isso é só para hosts.`);
  }

  // privadoOuPublico(): acha o privado (ou o público) entre quatro endereços.
  function privadoOuPublico() {
    // Número de 0 a 255.
    const n = () => sorteia(0, 255);
    // Geradores de endereços privados.
    const privados = [
      () => `10.${n()}.${n()}.${n()}`,
      () => `172.${sorteia(16, 31)}.${n()}.${n()}`,
      () => `192.168.${n()}.${n()}`
    ];
    // Geradores de endereços públicos que PARECEM privados (as pegadinhas).
    const publicos = [
      () => `172.${escolhe([sorteia(1, 15), sorteia(32, 63)])}.${n()}.${n()}`,
      () => `192.${escolhe([167, 169, 170])}.${n()}.${n()}`,
      () => `${escolhe([11, 9, 100, 172 + 1])}.${n()}.${n()}.${n()}`,
      () => `168.192.${n()}.${n()}`
    ];
    // Metade das vezes pede o privado, metade pede o público.
    const pedePrivado = Math.random() < 0.5;
    // A certa vem do grupo pedido; as erradas, do outro grupo.
    const certa = escolhe(pedePrivado ? privados : publicos)();
    const outros = pedePrivado ? publicos : privados;
    return pergunta(
      pedePrivado ? 'Qual destes endereços IPv4 é PRIVADO?' : 'Qual destes endereços IPv4 é PÚBLICO?',
      certa,
      [escolhe(outros)(), escolhe(outros)(), escolhe(outros)()],
      () => escolhe(outros)(),
      `<b>Faixas privadas:</b> 10.0.0.0 a 10.255.255.255; 172.16.0.0 a 172.31.255.255; 192.168.0.0 a 192.168.255.255. Pegadinhas: 172.15 e 172.32 ficam FORA da faixa, e 192.169 também. A resposta é ${certa}.`
    );
  }

  // classeDoIp(): classe pelo modelo classful.
  function classeDoIp() {
    // Sorteia a classe e o primeiro número dentro da faixa dela.
    const classe = escolhe(['A', 'B', 'C']);
    const primeiro = classe === 'A' ? sorteia(1, 126) : classe === 'B' ? sorteia(128, 191) : sorteia(192, 223);
    return pergunta(`Pelo modelo classful, qual é a classe do endereço ${primeiro}.${sorteia(0, 255)}.${sorteia(0, 255)}.${sorteia(1, 254)}?`,
      `Classe ${classe}`, ['Classe A', 'Classe B', 'Classe C', 'Classe D'].filter((c) => c !== `Classe ${classe}`), () => 'Classe E',
      `<b>Olhe só o 1º número (${primeiro}):</b> A vai de 1 a 126, B de 128 a 191, C de 192 a 223 e D/E de 224 a 255.`);
  }

  // ===== PERGUNTAS DE TCP =====
  // handshake(): ack do SYN+ACK ou do 3º passo.
  function handshake() {
    // Número de sequência sorteado.
    const seq = sorteia(100, 9000);
    // Sorteia se a pergunta é sobre o servidor (2º passo) ou o cliente (3º passo).
    const segundo = Math.random() < 0.5;
    // Enunciado de cada variação.
    const enunciado = segundo
      ? `O cliente envia SYN com seq = ${seq}. Qual é o ack no SYN+ACK do servidor?`
      : `O servidor responde SYN+ACK com seq = ${seq}. Qual ack o cliente envia no 3º passo?`;
    return pergunta(enunciado, seq + 1, [seq, seq + 2, seq - 1], () => seq + sorteia(3, 9),
      `<b>Regra do ACK:</b> é o próximo byte esperado, e o SYN conta como 1. ${seq} + 1 = ${seq + 1}.`);
  }

  // ackDeDados(): ack depois de dados enviados.
  function ackDeDados() {
    // Número de sequência do primeiro byte.
    const seq = sorteia(100, 9000);
    // Quantidade de bytes enviados.
    const bytes = escolhe([100, 120, 200, 250, 300, 400, 500, 512, 1000, 1460]);
    // ACK = seq + bytes.
    const certa = seq + bytes;
    return pergunta(`O cliente envia ${bytes} bytes com seq = ${seq}. Qual ack o servidor devolve?`, certa,
      // Erros comuns: esquecer que o ack é o PRÓXIMO byte (−1), somar 1 a mais, só somar 1.
      [certa - 1, certa + 1, seq + 1], () => certa + sorteia(2, 9),
      `<b>Conta:</b> os bytes vão do ${seq} ao ${certa - 1}. O próximo esperado é ${seq} + ${bytes} = ${certa}.`);
  }

  // faixaDeBytes(): quais bytes um segmento carrega?
  function faixaDeBytes() {
    // Primeiro byte.
    const seq = sorteia(1, 90) * 100;
    // Quantidade de bytes.
    const bytes = escolhe([100, 200, 500, 1000]);
    // Último byte = seq + bytes − 1.
    const fim = seq + bytes - 1;
    return pergunta(`Um segmento tem seq = ${seq} e leva ${bytes} bytes. Quais bytes ele carrega?`,
      `Do ${seq} ao ${fim}`, [`Do ${seq} ao ${fim + 1}`, `Do ${seq + 1} ao ${fim + 1}`, `Do ${seq - bytes} ao ${seq}`],
      () => `Do ${seq} ao ${fim + sorteia(2, 5)}`,
      `<b>Seq é o primeiro byte:</b> ${bytes} bytes a partir do ${seq} terminam no ${fim} (${seq} + ${bytes} − 1). O ack depois dele será ${fim + 1}.`);
  }

  // ===== PERGUNTA DE IPv6 =====
  // ipv6Curto(): forma mais curta de um endereço IPv6.
  function ipv6Curto() {
    // Grupo com zeros à esquerda, como "00a1".
    const grupo = () => sorteia(1, 4095).toString(16).padStart(4, '0');
    // Três grupos que não são zero.
    const x = grupo(), y = grupo(), z = grupo();
    // Tira os zeros à esquerda de um grupo.
    const curto = (g) => g.replace(/^0+/, '') || '0';
    // Endereço completo, com três grupos de zero no meio.
    const completo = `2001:0db8:${x}:0000:0000:0000:${y}:${z}`;
    // Forma certa: zeros à esquerda fora e os três grupos zerados viram "::".
    const certa = `2001:db8:${curto(x)}::${curto(y)}:${curto(z)}`;
    return pergunta(`Qual é a forma mais curta de ${completo}?`, certa,
      [
        // Erro 1: comprimiu os zeros do meio, mas esqueceu os zeros à esquerda.
        `2001:0db8:${x}::${y}:${z}`,
        // Erro 2: trocou três grupos de zero por um só (sumiu grupo).
        `2001:db8:${curto(x)}:0:${curto(y)}:${curto(z)}`,
        // Erro 3: usou três dois-pontos, o que não existe.
        `2001:db8:${curto(x)}:::${curto(y)}:${curto(z)}`
      ],
      () => `2001:db8::${curto(x)}:${curto(y)}:${curto(z)}`,
      `<b>Duas regras:</b> 1) tire os zeros à esquerda de cada grupo (0db8 vira db8); 2) troque UMA sequência de grupos zerados por "::". Resultado: ${certa}.`);
  }

  // Lista de geradores de cada matéria. Cada um cria uma pergunta nova quando chamado.
  const porMateria = {
    redes: [
      ttlChega, ttlSaltos,
      () => subRede('rede'), () => subRede('broadcast'), () => subRede('primeiro'), () => subRede('ultimo'),
      hostsUteis, mascaraDecimal, prefixoDaMascara, quantasSubRedes,
      privadoOuPublico, classeDoIp, handshake, ackDeDados, faixaDeBytes, ipv6Curto
    ]
  };

  // tem() diz se a matéria tem perguntas de conta.
  function tem(idMateria) {
    // Verdadeiro se existe uma lista de geradores para essa matéria.
    return Boolean(porMateria[idMateria]);
  }

  // gerar() cria "quantidade" perguntas novas, sem repetir enunciado na mesma rodada.
  function gerar(idMateria, quantidade) {
    // Geradores da matéria (lista vazia se não tiver).
    const geradores = porMateria[idMateria] || [];
    // Lista final e conjunto de enunciados já usados.
    const lista = [];
    const usados = new Set();
    // Limite de tentativas para nunca travar.
    let tentativas = 0;
    while (geradores.length && lista.length < quantidade && tentativas < quantidade * 20) {
      // Usa os geradores em rodízio, para misturar os tipos de conta.
      const q = geradores[lista.length % geradores.length]();
      // Só entra se o enunciado for novo e tiver 4 opções diferentes.
      if (!usados.has(q.statement) && q.options.length === 4) {
        usados.add(q.statement);
        lista.push(q);
      }
      tentativas++;
    }
    // Embaralha para os tipos não virem sempre na mesma ordem.
    return lista.sort(() => Math.random() - 0.5);
  }

  // O que os outros arquivos podem usar.
  return { tem, gerar };
})();
