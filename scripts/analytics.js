
// scripts/analytics.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GA4 if not already initialized
    if (typeof gtag === 'undefined') {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-X33GV53LH4');
    }

    // Track PWA installation
    window.addEventListener('appinstalled', () => {
        gtag('event', 'pwa_installed', {
            'event_category': 'engagement',
            'event_label': 'PWA Installation'
        });
    });
});