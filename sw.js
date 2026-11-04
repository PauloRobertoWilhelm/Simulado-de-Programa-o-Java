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
const CACHE_NAME = 'simulados-unipar-v2';

// urlsToCache guarda os arquivos necessários para abrir o app sem internet.
// Se um arquivo da lista não existir, a instalação falha. Ao criar uma matéria
// nova, inclua o arquivo dela aqui.
const urlsToCache = [
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/materias.css',
  './js/historias.js',
  './js/jogos.js',
  './materias/index.json',
  './materias/programacao.json',
  './materias/requisitos.json',
  './materias/design.json',
  './materias/redes.json',
  './materias/testing.json',
  './materias/engenharia-software.json'
];

// O evento 'install' acontece quando o navegador encontra uma versão nova deste arquivo.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      // skipWaiting() faz a versão nova assumir sem esperar o app ser fechado.
      .then(() => self.skipWaiting())
  );
});

// O evento 'activate' acontece quando esta versão assume o controle.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(
        nomes
          .filter(nome => nome !== CACHE_NAME)
          .map(nome => caches.delete(nome))
      ))
      // clients.claim() passa a controlar as páginas que já estão abertas.
      .then(() => self.clients.claim())
  );
});

// O evento 'fetch' dispara toda vez que a página pede um arquivo.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Só cuidamos de leituras dos nossos próprios arquivos. Fontes e Chart.js
  // vêm de outros sites e seguem o caminho normal do navegador.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
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
