import type { Locale } from '@/lib/i18n'

export const MEMBER_GUIDE_IDS = ['classic', 'photo', 'gourmet'] as const
export type MemberGuideId = (typeof MEMBER_GUIDE_IDS)[number]

export type GuideSection = {
    heading: string
    paragraphs: readonly string[]
}

export type MemberGuide = {
    id: MemberGuideId
    title: string
    subtitle: string
    sections: readonly GuideSection[]
    moreComing: string
}

export function isMemberGuideId(value: string | undefined | null): value is MemberGuideId {
    return value === 'classic' || value === 'photo' || value === 'gourmet'
}

export function parseMemberGuides(raw: string | string[] | undefined): MemberGuideId[] {
    const value = Array.isArray(raw) ? raw.join(',') : raw || ''
    const ids = value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(isMemberGuideId)
    return [...new Set(ids)]
}

const fr: Record<MemberGuideId, Omit<MemberGuide, 'id'>> = {
    classic: {
        title: 'Une journée classique à Chongqing',
        subtitle: 'L’itinéraire pour réussir ton premier jour',
        moreComing: 'La suite de la journée — Hongya Cave, Jiefangbei, le téléphérique, Ciqikou et les pauses repas — sera ajoutée ici au fil de l’édition.',
        sections: [
            {
                heading: 'Avant de partir',
                paragraphs: [
                    'L’idée n’est pas de tout voir. C’est de traverser la ville dans le bon ordre, sans zigzag, et de garder du temps pour vraiment regarder.',
                    'Prends le métro : c’est le moyen le plus simple de bouger à Chongqing. Un QR code Alipay ou WeChat suffit. Prévois de bonnes chaussures, de l’eau, et un rythme que tu peux tenir jusqu’en fin d’après-midi.',
                    'Départ conseillé vers 9 h. Si tu commences plus tard, saute les étapes marquées « si tu as moins de temps » plutôt que de tout compresser.',
                ],
            },
            {
                heading: '9 h — Liziba, le métro dans l’immeuble',
                paragraphs: [
                    'Commence ici. C’est le cliché le plus connu de Chongqing, et pour une fois il vaut vraiment le détour — à condition d’y aller tôt, avant la foule.',
                    'Prends la ligne 2 et descends à Liziba. Le quai donne directement sur la vue : le métro traverse un immeuble résidentiel. Monte ensuite sur la passerelle au-dessus de la station pour voir passer la rame depuis l’extérieur.',
                    'Dix à quinze minutes suffisent. Inutile de rester une heure. Quand tu as tes photos, repars : la suite de la journée est plus belle si tu ne traînes pas ici.',
                ],
            },
            {
                heading: 'Ensuite, sans revenir sur tes pas',
                paragraphs: [
                    'Depuis Liziba, tu continues vers le centre — Hongya Cave, Jiefangbei, puis le téléphérique au-dessus du Yangtsé. Tout s’enchaîne en métro, dans ce sens-là. L’erreur classique, c’est de faire Ciqikou trop tôt et de recroiser toute la ville l’après-midi.',
                ],
            },
        ],
    },
    photo: {
        title: 'Le guide photo',
        subtitle: 'Les meilleurs spots photo de Chongqing',
        moreComing: 'Les autres spots — toits, passerelles, rives du Jialing, Huangjueping, Eling et Nanshan — seront ajoutés ici au fil de l’édition.',
        sections: [
            {
                heading: 'Comment utiliser ce guide',
                paragraphs: [
                    'Chongqing est spectaculaire, mais les plus belles vues ne sont pas toujours là où les cars s’arrêtent. Pour chaque spot, je te donne le moment, l’angle, et comment y arriver sans courir d’un bout à l’autre de la ville.',
                    'La lumière change vite, surtout l’hiver et par temps de brume. Si le ciel est blanc, privilégie les vues resserrées (Liziba, passerelles, rues) plutôt que les grands panoramas.',
                ],
            },
            {
                heading: 'Hongya Cave — l’heure bleue',
                paragraphs: [
                    'C’est le spot le plus photographié, et il ne marche vraiment qu’à une heure : juste après le coucher du soleil, quand les lanternes s’allument et que le ciel est encore bleu.',
                    'Ne photographie pas le bâtiment depuis le quai du bas, collé aux boutiques. Traverse vers la rive opposée, côté Qiansimen / pont, et cadrer Hongya Cave avec la rivière devant. Arrive 20 minutes avant la nuit.',
                    'Le jour, l’endroit est bruyant et plat. Garde-le pour le soir, et fais Liziba ou les passerelles dans la journée.',
                ],
            },
            {
                heading: 'Liziba — le métro dans le cadre',
                paragraphs: [
                    'Deux images valent le déplacement : la rame qui traverse l’immeuble, vue depuis le quai ; et la même scène depuis la passerelle extérieure, avec la ville en fond.',
                    'Le matin, moins de monde. Place-toi en bout de quai, pas au milieu. Une fois la rame passée, tu as déjà ce qu’il faut — inutile d’attendre la suivante si tu as d’autres spots dans la journée.',
                ],
            },
        ],
    },
    gourmet: {
        title: 'Le guide gourmand',
        subtitle: 'Les meilleures adresses pour manger à Chongqing',
        moreComing: 'Les autres adresses — hot pot, poisson grillé, brochettes, rues du soir — seront ajoutées ici au fil de l’édition.',
        sections: [
            {
                heading: 'Comment commander, simplement',
                paragraphs: [
                    'Tu n’as pas besoin de parler chinois pour bien manger ici. Montre le plat sur l’ardoise ou sur ton téléphone, ou pointe ce que la table d’à côté a commandé. Un sourire et le mot « 这个 » (zhège, « celui-là ») suffisent souvent.',
                    'Évite les restaurants avec un menu-photos géant collé à l’entrée, en plusieurs langues, pile sur le passage des groupes. Les meilleures tables sont un peu à l’écart, et souvent plus simples.',
                ],
            },
            {
                heading: 'Le piment, sans te tromper',
                paragraphs: [
                    'À Chongqing, « pas piquant » n’existe presque pas. Demande « 微辣 » (wēi là) : légèrement piquant. C’est le bon départ. « 中辣 » (zhōng là) est déjà sérieux. « 特辣 » est un défi, pas un repas.',
                    'Le numbing du poivre de Sichuan n’est pas du piquant : c’est une anesthésie douce. Si tu n’aimes pas, dis-le. Si tu aimes le piquant mais pas ce fourmillement, précise-le aussi : ce n’est pas la même chose.',
                ],
            },
            {
                heading: 'Pour commencer : un bol de xiaomian',
                paragraphs: [
                    'Le petit-déjeuner le plus juste, c’est un bol de 小面 (xiǎomiàn) dans une petite boutique de quartier. Nouilles, sauce, parfois viande hachée, parfois arachides. Pas cher, rapide, et tu comprends tout de suite la ville.',
                    'Commande un bol, reste debout ou sur un tabouret, et ne cherche pas la « meilleure » adresse de la ville dès le premier matin. Une bonne xiaomian, c’est celle qui a déjà une file d’habitants à 8 h 30.',
                ],
            },
        ],
    },
}

const en: Record<MemberGuideId, Omit<MemberGuide, 'id'>> = {
    classic: {
        title: 'A classic day in Chongqing',
        subtitle: 'The itinerary for a first day that works',
        moreComing:
            'The rest of the day — Hongya Cave, Jiefangbei, the cable car, Ciqikou, and where to eat — will be added here as the guide is edited.',
        sections: [
            {
                heading: 'Before you go',
                paragraphs: [
                    'You are not trying to see everything. You are crossing the city in the right order, without a zigzag, and leaving time to actually look.',
                    'Take the metro: it is the simplest way to move in Chongqing. An Alipay or WeChat QR code is enough. Wear decent shoes, bring water, and pick a pace you can hold until late afternoon.',
                    'Aim to start around 9am. If you start later, skip the “if you have less time” stops instead of squeezing the whole day.',
                ],
            },
            {
                heading: '9am — Liziba, the metro through a building',
                paragraphs: [
                    'Start here. It is Chongqing’s most famous image, and for once it is worth it — if you go early, before the crowd.',
                    'Take line 2 and get off at Liziba. The platform is the view: the train runs through a residential building. Then go up to the walkway above the station to watch the next train from outside.',
                    'Ten to fifteen minutes is enough. Do not stay an hour. Once you have the picture, move on: the rest of the day is better if you do not linger here.',
                ],
            },
            {
                heading: 'Next, without doubling back',
                paragraphs: [
                    'From Liziba you continue toward the centre — Hongya Cave, Jiefangbei, then the cable car over the Yangtze. It all chains on the metro, in that order. The classic mistake is doing Ciqikou too early and crossing the whole city again in the afternoon.',
                ],
            },
        ],
    },
    photo: {
        title: 'The photo guide',
        subtitle: 'Chongqing’s best photo spots',
        moreComing:
            'The other spots — rooftops, walkways, the Jialing riverbanks, Huangjueping, Eling, and Nanshan — will be added here as the guide is edited.',
        sections: [
            {
                heading: 'How to use this guide',
                paragraphs: [
                    'Chongqing is spectacular, but the best views are not always where the coaches stop. For each spot you get the time, the angle, and how to get there without racing from one end of the city to the other.',
                    'Light changes fast, especially in winter and in the fog. If the sky is white, shoot tighter scenes (Liziba, walkways, streets) instead of the big panoramas.',
                ],
            },
            {
                heading: 'Hongya Cave — blue hour',
                paragraphs: [
                    'This is the most photographed spot, and it only really works at one time: just after sunset, when the lanterns come on and the sky is still blue.',
                    'Do not shoot the building from the lower quay, stuck among the shops. Cross to the opposite bank, Qiansimen / bridge side, and frame Hongya Cave with the river in front. Arrive 20 minutes before night.',
                    'In daylight the place is noisy and flat. Keep it for the evening, and shoot Liziba or the walkways during the day.',
                ],
            },
            {
                heading: 'Liziba — the metro in the frame',
                paragraphs: [
                    'Two pictures are worth the trip: the train running through the building, from the platform; and the same scene from the outside walkway, with the city behind it.',
                    'Morning means fewer people. Stand at the end of the platform, not in the middle. Once a train has passed, you already have it — do not wait for the next one if you have other spots that day.',
                ],
            },
        ],
    },
    gourmet: {
        title: 'The food guide',
        subtitle: 'The best places to eat in Chongqing',
        moreComing:
            'The other addresses — hot pot, grilled fish, skewers, evening streets — will be added here as the guide is edited.',
        sections: [
            {
                heading: 'How to order, simply',
                paragraphs: [
                    'You do not need to speak Chinese to eat well here. Point at the board, at a photo on your phone, or at the table next to you. A smile and the word 「这个」 (zhège, “this one”) often does the job.',
                    'Skip the places with a giant multilingual photo menu stuck to the door, right on the tour-group path. The better rooms are a little off to the side, and usually simpler.',
                ],
            },
            {
                heading: 'Chilli, without getting it wrong',
                paragraphs: [
                    'In Chongqing, “not spicy” barely exists. Ask for 「微辣」 (wēi là): mildly spicy. That is the right start. 「中辣」 (zhōng là) is already serious. 「特辣」 is a dare, not a meal.',
                    'Sichuan pepper’s numbing is not heat: it is a soft anaesthetic. If you do not like it, say so. If you like heat but not that tingle, say that too — they are not the same thing.',
                ],
            },
            {
                heading: 'Start with a bowl of xiaomian',
                paragraphs: [
                    'The most honest breakfast is a bowl of 小面 (xiǎomiàn) in a small neighborhood shop. Noodles, sauce, sometimes minced meat, sometimes peanuts. Cheap, fast, and you understand the city immediately.',
                    'Order one bowl, sit on a stool, and do not hunt for the “best” address in town on your first morning. A good xiaomian shop is the one with a line of locals at 8.30am.',
                ],
            },
        ],
    },
}

const byLocale = { fr, en }

export function getMemberGuide(locale: Locale, id: MemberGuideId): MemberGuide {
    return { id, ...byLocale[locale][id] }
}
