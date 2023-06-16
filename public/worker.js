;
const CACHE_NAME='v1_doormaid_cache',
urlsToCache=[
    '/',
    '/login',
    '/miCuenta',
    '/guia',
    '/receptor/*',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    '/img/icono.ico',
    '/img/icono.png',
    '/img/inicio.png',
    '/img/miCuenta.png',
    '/img/*',
    '/js/receptor.js',
    'https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js',
    '/socket.io/socket.io.js'
]
self.addEventListener('install', e => {
    e.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return cache.addAll(urlsToCache)
            .then(() => self.skipWaiting())
        })
        .catch(err => console.log('Falló registro de cache', err))
    )
  })
  self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME]
  
    e.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              //Eliminamos lo que ya no se necesita en cache
              if (cacheWhitelist.indexOf(cacheName) === -1) {
                return caches.delete(cacheName)
              }
            })
          )
        })
        // Le indica al SW activar el cache actual
        .then(() => self.clients.claim())
    )
  })
  self.addEventListener('fetch', e => {
    //Responder ya sea con el objeto en caché o continuar y buscar la url real
    e.respondWith(
      caches.match(e.request)
        .then(res => {
          if (res) {
            //recuperar del cache
            return res
          }
          //recuperar de la petición a la url
          return fetch(e.request)
        })
    )
  })
console.log("Servidor de espera iniciado");
self.addEventListener('push', (e)=>//escucha del evento de carga de objeto
{
    const data=e.data.json();//convercion a json de los datos del evento
    self.registration.showNotification(data.title, {//declaracion de estructura de notificacion
        body: data.message,
        image:'https://i.ibb.co/d5Q4w3c/door-Maidtoru.png'
    });
});