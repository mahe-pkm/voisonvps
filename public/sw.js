self.addEventListener('install', function (event) {
    console.log('Service Worker installed');
});

self.addEventListener('fetch', function (event) {
    // Simple pass-through strategy for now
    // In future, caching strategies can be added here
});
