/*
  Arquivo: sw.js
  Papel no sistema: este arquivo é o Service Worker do navegador.
  Ele funciona como um cache de arquivos do projeto para permitir que o app
  continue funcionando mesmo sem internet.

  O que ele faz na prática:
  - salva recursos essenciais do simulado localmente;
  - deixa a página carregando mais rápido em visitas futuras;
  - permite uso offline do app instalado;
  - reduz falhas quando a conexão estiver lenta ou instável.

  Estrutura lógica do arquivo:
  1) CACHE_NAME define o nome do cache atual;
  2) urlsToCache lista os arquivos que serão armazenados;
  3) install prepara o cache antes do app entrar em uso;
  4) fetch intercepta requisições e usa o cache primeiro.

  Como o Service Worker é usado aqui:
  - o navegador registra esse script em index.html;
  - depois da instalação, ele fica monitorando as requisições;
  - em vez de pedir tudo da rede, ele tenta responder pelo cache.

  Isso é uma explicação didática dentro do próprio código, sem alterar o
  comportamento real do projeto.
*/

// CACHE_NAME representa a identificação do armazenamento local do navegador.
// Quando a aplicação sofre mudanças importantes, esse valor pode ser trocado
// para forçar a criação de um novo cache e evitar arquivos antigos.
const CACHE_NAME = 'simulado-java-v1';

// urlsToCache guarda os arquivos essenciais que precisam ficar salvos no cache.
// Aqui são armazenados a página principal, o banco de questões e o manifesto do app.
const urlsToCache = [
  './index.html',
  './questoes.json',
  './manifest.json'
];

// O evento 'install' acontece quando o navegador registra o service worker.
// Nesse momento, o código prepara o ambiente para o uso offline.
self.addEventListener('install', event => {
  // event.waitUntil() faz o navegador aguardar a conclusão da operação antes de
  // considerar a instalação como finalizada.
  event.waitUntil(
    // caches.open() abre/cria o cache com o nome definido acima.
    caches.open(CACHE_NAME)
      // .then() executa algo depois que o cache estiver disponível.
      .then(cache => {
        // cache.addAll() salva todos os arquivos da lista em memória local.
        // Se algum arquivo falhar, a instalação do service worker pode falhar.
        return cache.addAll(urlsToCache);
      })
  );
});

// O evento 'fetch' dispara toda vez que a página tenta acessar algum recurso.
// Ele permite interceptar essa requisição e decidir se responde com cache ou rede.
self.addEventListener('fetch', event => {
  // event.respondWith() substitui a resposta padrão do navegador pela resposta
  // definida dentro desta função.
  event.respondWith(
    // caches.match(event.request) procura se a URL pedida já existe no cache.
    caches.match(event.request)
      // Se existir, retorna esse valor. Se não existir, faz a chamada real na rede.
      .then(response => {
        return response || fetch(event.request);
      })
  );
});