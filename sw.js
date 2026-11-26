/*
  Arquivo: sw.js
  Papel no sistema: este arquivo é o Service Worker do navegador.
  Ele guarda uma cópia dos arquivos do projeto para o app continuar
  funcionando sem internet.

  Estrutura lógica do arquivo:
  1) CACHE_NAME define o nome do cache atual;
  2) urlsToCache lista os arquivos que serão armazenados;
  3) install salva os arquivos e assume o lugar da versão antiga;
  4) activate apaga os caches de versões antigas;
  5) fetch busca primeiro na rede e usa o cache só quando não há internet.

  Por que a rede vem primeiro: quando o cache vinha primeiro, o navegador
  continuava mostrando arquivos antigos e as mudanças no código não apareciam.
*/

// CACHE_NAME identifica o armazenamento local do navegador.
// Trocar esse valor cria um cache novo, e o evento activate apaga os antigos.
const CACHE_NAME = 'simulados-unipar-v17';

// urlsToCache guarda os arquivos necessários para abrir o app sem internet.
// Se um arquivo da lista não existir, a instalação falha. Ao criar uma matéria
// nova, inclua o arquivo dela aqui.
const urlsToCache = [
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/materias.css',
  './css/moderno.css',
  './css/estudo.css',
  './css/ouro.css',
  './css/futuro.css',
  // Visual de 26/11/2026: base de todos os visuais, Neon, Claro, painel de visual, níveis e pug.
  './css/base.css',
  './css/tema-neon.css',
  './css/tema-claro.css',
  './css/temas.css',
  './css/niveis.css',
  './css/pug.css',
  './js/voz.js',
  './js/visual.js',
  './js/futuro.js',
  './js/efeitos.js',
  './js/pug.js',
  './js/temas.js',
  // As 20 figuras do pug (10 expressões no estilo 3D e 10 no estilo desenho).
  './img/pug/3d-1.webp',
  './img/pug/3d-2.webp',
  './img/pug/3d-3.webp',
  './img/pug/3d-4.webp',
  './img/pug/3d-5.webp',
  './img/pug/3d-6.webp',
  './img/pug/3d-7.webp',
  './img/pug/3d-8.webp',
  './img/pug/3d-9.webp',
  './img/pug/3d-10.webp',
  './img/pug/desenho-1.webp',
  './img/pug/desenho-2.webp',
  './img/pug/desenho-3.webp',
  './img/pug/desenho-4.webp',
  './img/pug/desenho-5.webp',
  './img/pug/desenho-6.webp',
  './img/pug/desenho-7.webp',
  './img/pug/desenho-8.webp',
  './img/pug/desenho-9.webp',
  './img/pug/desenho-10.webp',
  './js/revisao.js',
  './js/livro.js',
  './js/historias.js',
  './js/jogos.js',
  './js/pratica.js',
  './js/geradores.js',
  './materias/index.json',
  './materias/programacao.json',
  './materias/requisitos.json',
  './materias/design.json',
  './materias/redes.json',
  './materias/testing.json',
  './materias/pensamento.json',
  './materias/linguagem.json',
  './materias/cyberseguranca.json',
  './materias/direito.json',
  './materias/internet.json',
  './materias/ambientacao.json'
];

// O evento 'install' acontece quando o navegador encontra uma versão nova deste arquivo.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache: 'reload' baixa cada arquivo do servidor, ignorando cópias antigas do navegador.
      .then(cache => cache.addAll(urlsToCache.map(endereco => new Request(endereco, { cache: 'reload' }))))
      // skipWaiting() faz a versão nova assumir sem esperar o app ser fechado.
      .then(() => self.skipWaiting())
  );
});

// O evento 'activate' acontece quando esta versão assume o controle.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nomes => {
        // Caches de versões antigas do app (se houver, isto é uma ATUALIZAÇÃO, não a primeira visita).
        const antigos = nomes.filter(nome => nome !== CACHE_NAME);
        // Apaga os antigos e devolve se havia algum.
        return Promise.all(antigos.map(nome => caches.delete(nome))).then(() => antigos.length > 0);
      })
      // clients.claim() passa a controlar as páginas que já estão abertas.
      .then(eraAtualizacao => self.clients.claim().then(() => eraAtualizacao))
      .then(eraAtualizacao => {
        // Primeira visita: nada a recarregar.
        if (!eraAtualizacao) return;
        // Atualização: recarrega as abas abertas, para trocar o visual e o conteúdo antigos pelos novos.
        // O setTimeout deixa a ativação TERMINAR antes: se a recarga fosse esperada aqui dentro,
        // ela pediria os arquivos a este mesmo service worker, que ainda não terminou de ativar,
        // e os dois ficariam esperando um pelo outro para sempre.
        // Isso acontece uma vez só por versão, porque o activate só roda quando chega um sw.js novo.
        setTimeout(() => {
          self.clients.matchAll({ type: 'window' })
            .then(abas => abas.forEach(aba => aba.navigate(aba.url).catch(() => null)));
        }, 0);
      })
  );
});

// O evento 'fetch' dispara toda vez que a página pede um arquivo.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Só cuidamos de leituras dos nossos próprios arquivos. Fontes e Chart.js
  // vêm de outros sites e seguem o caminho normal do navegador.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    // cache: 'no-cache' confere com o servidor toda vez (o GitHub manda guardar por 10 minutos).
    // Usa o endereço em texto porque pedidos de página inteira (navegação) não aceitam opções extras.
    fetch(url.href, { cache: 'no-cache', credentials: 'same-origin' })
      .then(resposta => {
        // Com internet: atualiza a cópia guardada e entrega o arquivo novo.
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        }
        return resposta;
      })
      // Sem internet: entrega a cópia guardada.
      .catch(() => caches.match(event.request))
  );
});
