const CACHE_NAME = 'iqra-ep-v1.0.0'
const STATIC_CACHE_NAME = 'iqra-ep-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'iqra-ep-dynamic-v1.0.0'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/logo.webp',
  '/favicon.ico',
  '/manifest.json',
  '/_next/static/css/app/globals.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
]

// API routes to cache with network-first strategy
const API_ROUTES = [
  '/api/auth',
  '/api/students',
  '/api/courses',
  '/api/assignments',
  '/api/attendance',
  '/api/grades',
  '/api/messages',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Caching static assets...')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request))
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request))
  } else if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request))
  } else {
    event.respondWith(networkFirst(request))
  }
})

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Cache-first failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Network-first strategy for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Offline', { status: 503 })
  }
}

// Stale-while-revalidate strategy for pages
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request)
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE_NAME)
      cache.then((c) => c.put(request, networkResponse.clone()))
    }
    return networkResponse
  })

  return cachedResponse || networkResponsePromise
}

// Helper functions
function isStaticAsset(request) {
  return request.url.includes('/_next/static/') || 
         request.url.includes('.css') || 
         request.url.includes('.js') ||
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.webp') ||
         request.url.includes('.ico')
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         API_ROUTES.some(route => request.url.includes(route))
}

function isPageRequest(request) {
  return request.destination === 'document' || 
         request.headers.get('accept')?.includes('text/html')
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  console.log('Background sync triggered')
  // Handle offline actions when connection is restored
  // This can be expanded to handle form submissions, notifications, etc.
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/logo.webp',
      badge: '/logo.webp',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Görüntüle',
          icon: '/logo.webp'
        },
        {
          action: 'close',
          title: 'Kapat',
          icon: '/logo.webp'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification
  const action = event.action

  if (action === 'close') {
    notification.close()
  } else {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})