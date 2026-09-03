import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Guides Chongqing — Mat',
        short_name: 'Guides CQ',
        description: 'Tes guides pratiques pour Chongqing, à ouvrir depuis l’écran d’accueil.',
        start_url: '/fr/membre',
        scope: '/',
        display: 'standalone',
        background_color: '#FFF9EE',
        theme_color: '#FF9E5E',
        lang: 'fr',
        icons: [
            {
                src: '/icon-guide.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any',
            },
        ],
    }
}
