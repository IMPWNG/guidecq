'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Mail,
    Phone,
    Plus,
    Trash2,
    Users,
    Wallet,
    X,
} from 'lucide-react';

const UNIT_PRICE = 85;
const DEPOSIT_RATE = 0.25;

interface Participant {
    prenom: string;
    nom?: string;
    age: number | string;
}

interface TourRequest {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    date_arrivee: string;
    date_depart: string;
    hebergement: string;
    restrictions: string;
    mobilite: string;
    pref_nature: number;
    pref_ville: number;
    pref_histoire: number;
    pref_gastronomie: number;
    pref_insolite: number;
    pref_photo: number;
    deja_visite_chine: boolean;
    excursions_interet: boolean;
    transport_prefere: string;
    rythme: string;
    commentaires: string;
    participants: Participant[] | string | null;
    langues: string[];
    option_voiture_privee: boolean;
    status: StatusType;
    created_at: string;
    jours_visite?: string[] | string | null;
}

type StatusType =
    | 'nouveau'
    | 'en_cours'
    | 'email_envoye'
    | 'confirme'
    | 'termine'
    | 'annule';

type TourPhase = 'upcoming' | 'ongoing' | 'finished' | 'cancelled';
type FilterType = 'tous' | 'a_confirmer' | 'a_venir' | 'en_visite' | 'termines' | 'annules';

const STATUS_CONFIG: Record<
    StatusType,
    { label: string; color: string; bgColor: string; border: string }
> = {
    nouveau: {
        label: 'Nouveau',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        border: 'border-blue-500',
    },
    en_cours: {
        label: 'En cours',
        color: 'text-amber-800',
        bgColor: 'bg-amber-100',
        border: 'border-amber-500',
    },
    email_envoye: {
        label: 'Email envoyé',
        color: 'text-purple-800',
        bgColor: 'bg-purple-100',
        border: 'border-purple-500',
    },
    confirme: {
        label: 'Confirmé',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        border: 'border-green-500',
    },
    termine: {
        label: 'Tour fini',
        color: 'text-slate-800',
        bgColor: 'bg-slate-200',
        border: 'border-slate-600',
    },
    annule: {
        label: 'Annulé',
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        border: 'border-red-500',
    },
};

function normalizeName(value: string | undefined | null): string {
    return (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

function getParticipants(request: TourRequest): Participant[] {
    const raw = request.participants;
    if (!raw) return [];
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return Array.isArray(raw) ? raw : [];
}

function isSamePerson(
    firstName: string,
    lastName: string,
    participant: Participant
): boolean {
    const first = normalizeName(firstName);
    const last = normalizeName(lastName);
    const full = `${first} ${last}`.trim();
    const pFirst = normalizeName(participant.prenom);
    const pLast = normalizeName(participant.nom);
    const pFull = `${pFirst} ${pLast}`.trim();

    if (!pFirst) return false;
    if (pFull === full) return true;
    if (pFirst === full || pFull === first) return true;
    if (pFirst === first && (!pLast || !last || pLast === last)) return true;
    return false;
}

function getHeadcount(request: TourRequest) {
    const listed = getParticipants(request);
    const registrantInList = listed.some((p) =>
        isSamePerson(request.prenom, request.nom, p)
    );

    if (listed.length === 0) {
        return {
            count: 1,
            listed: 0,
            registrantInList: false,
            registrantAdded: true,
        };
    }

    if (registrantInList) {
        return {
            count: listed.length,
            listed: listed.length,
            registrantInList: true,
            registrantAdded: false,
        };
    }

    return {
        count: listed.length + 1,
        listed: listed.length,
        registrantInList: false,
        registrantAdded: true,
    };
}

function getPricing(peopleCount: number) {
    const total = peopleCount * UNIT_PRICE;
    const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;
    const remaining = Math.round((total - deposit) * 100) / 100;
    return { total, deposit, remaining };
}

function getPaymentState(
    request: TourRequest,
    pricing: { total: number; deposit: number; remaining: number },
    phase: TourPhase
) {
    if (request.status === 'annule' || phase === 'cancelled') {
        return {
            collected: 0,
            outstanding: 0,
            note: 'Annulé — hors projection',
        };
    }

    if (request.status === 'termine' || (request.status === 'confirme' && phase === 'finished')) {
        return {
            collected: pricing.total,
            outstanding: 0,
            note: 'Tour fini — total encaissé',
        };
    }

    if (request.status === 'confirme') {
        return {
            collected: pricing.deposit,
            outstanding: pricing.remaining,
            note: 'Confirmé — acompte 25 % reçu, solde à percevoir',
        };
    }

    return {
        collected: 0,
        outstanding: 0,
        note: 'Pas encore confirmé — hors encaissement',
    };
}

function formatEuro(amount: number) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function parseLocalDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('T')[0].split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, 12, 0, 0);
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIsoDate(value: unknown): string | null {
    if (!value || typeof value !== 'string') return null;
    const iso = value.split('T')[0].trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

function getVisitDays(request: Pick<TourRequest, 'jours_visite'>): string[] {
    const raw = request.jours_visite;
    if (!raw) return [];
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed)
                    ? parsed.map(toIsoDate).filter((day): day is string => Boolean(day))
                    : [];
            } catch {
                return [];
            }
        }
        return trimmed
            .split(/[,;]/)
            .map(toIsoDate)
            .filter((day): day is string => Boolean(day));
    }
    if (Array.isArray(raw)) {
        return raw.map(toIsoDate).filter((day): day is string => Boolean(day));
    }
    return [];
}

function formatLongDate(value: string) {
    const date = parseLocalDate(value);
    if (!date) return '—';
    return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatVisitDays(days: string[]) {
    if (days.length === 0) return 'À renseigner';
    return [...days]
        .sort()
        .map((day) => formatLongDate(day))
        .join(' · ');
}

function stayDuration(arrivee: string, depart: string) {
    const start = parseLocalDate(arrivee);
    const end = parseLocalDate(depart);
    if (!start || !end) return null;
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
}

function getStatusConfig(status: string | undefined) {
    if (status && status in STATUS_CONFIG) {
        return STATUS_CONFIG[status as StatusType];
    }
    return STATUS_CONFIG.nouveau;
}

function getTourPhase(request: TourRequest): TourPhase {
    if (request.status === 'annule') return 'cancelled';
    if (request.status === 'termine') return 'finished';

    const today = startOfDay(new Date());
    const visitDays = getVisitDays(request)
        .map((day) => parseLocalDate(day))
        .filter((day): day is Date => Boolean(day))
        .map(startOfDay)
        .sort((a, b) => a.getTime() - b.getTime());

    if (visitDays.length > 0) {
        const first = visitDays[0];
        const last = visitDays[visitDays.length - 1];
        if (last < today) return 'finished';
        if (visitDays.some((day) => day.getTime() === today.getTime())) return 'ongoing';
        if (first > today) return 'upcoming';
        return 'upcoming';
    }

    const arrivee = parseLocalDate(request.date_arrivee);
    const depart = parseLocalDate(request.date_depart);

    if (depart && startOfDay(depart) < today) return 'finished';
    if (arrivee && startOfDay(arrivee) > today) return 'upcoming';
    return 'ongoing';
}

function hasPreciseVisitDate(request: TourRequest) {
    return getVisitDays(request).length > 0;
}

function isAwaitingConfirmation(request: TourRequest, phase: TourPhase) {
    if (
        request.status === 'confirme' ||
        request.status === 'termine' ||
        request.status === 'annule' ||
        phase === 'cancelled' ||
        phase === 'finished'
    ) {
        return false;
    }
    if (request.status === 'email_envoye') {
        return phase !== 'ongoing' || !hasPreciseVisitDate(request);
    }
    return !hasPreciseVisitDate(request);
}

function isConfirmedUpcoming(request: TourRequest, phase: TourPhase) {
    return request.status === 'confirme' && phase === 'upcoming';
}

function isOnVisitNow(request: TourRequest, phase: TourPhase) {
    if (phase !== 'ongoing' || request.status === 'annule') return false;
    return request.status === 'confirme' || hasPreciseVisitDate(request);
}

const PHASE_LABEL: Record<TourPhase, { label: string; className: string }> = {
    upcoming: { label: 'À venir', className: 'bg-blue-100 text-blue-900' },
    ongoing: { label: 'En visite', className: 'bg-emerald-100 text-emerald-900' },
    finished: { label: 'Tour fini', className: 'bg-slate-200 text-slate-800' },
    cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-800' },
};

const PHASE_ORDER: Record<TourPhase, number> = {
    ongoing: 0,
    upcoming: 1,
    finished: 2,
    cancelled: 3,
};

const GUIDE_WAITLIST_MARKER = /Liste d['’]attente guides|Commande guide PDF/i;

const GUIDE_LABELS: Record<string, string> = {
    classic: 'Journée classique',
    photo: 'Guide photo',
    gourmet: 'Guide gourmand',
};

type GuideWaitlistEntry = {
    id: string;
    source: 'guide_orders' | 'tour_requests';
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    guides: string[];
    message: string;
    locale: string;
    created_at: string;
};

type GuidePurchaseRow = {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    guides: string[] | null;
    amount_eur: number | string;
    status: string;
    access_token: string;
    payment_reference: string;
    locale: string;
    created_at: string;
    paid_at: string | null;
    message: string | null;
};

function isGuideWaitlistRequest(request: TourRequest) {
    return GUIDE_WAITLIST_MARKER.test(request.commentaires || '');
}

function normalizeGuides(raw: unknown): string[] {
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
        } catch {
            return trimmed
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }
    return [];
}

function parseWaitlistComment(commentaires: string) {
    const lines = commentaires
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const guides: string[] = [];
    let locale = '';
    const messageLines: string[] = [];

    for (const line of lines) {
        if (GUIDE_WAITLIST_MARKER.test(line) && !line.includes(':')) continue;
        const guidesMatch = line.match(/^Guides:\s*(.+)$/i);
        if (guidesMatch) {
            guides.push(...normalizeGuides(guidesMatch[1]));
            continue;
        }
        const localeMatch = line.match(/^Locale:\s*(.+)$/i);
        if (localeMatch) {
            locale = localeMatch[1].trim();
            continue;
        }
        messageLines.push(line);
    }

    return { guides, locale, message: messageLines.join('\n') };
}

function guideLabel(id: string) {
    return GUIDE_LABELS[id] || id;
}

function waitlistFromTourRequest(request: TourRequest): GuideWaitlistEntry {
    const parsed = parseWaitlistComment(request.commentaires || '');
    return {
        id: request.id,
        source: 'tour_requests',
        prenom: request.prenom,
        nom: request.nom,
        email: request.email,
        telephone: request.telephone,
        guides: parsed.guides,
        message: parsed.message,
        locale: parsed.locale,
        created_at: request.created_at,
    };
}

function waitlistFromOrder(row: Record<string, unknown>): GuideWaitlistEntry {
    return {
        id: String(row.id ?? ''),
        source: 'guide_orders',
        prenom: String(row.prenom ?? ''),
        nom: String(row.nom ?? ''),
        email: String(row.email ?? ''),
        telephone: String(row.telephone ?? ''),
        guides: normalizeGuides(row.guides),
        message: String(row.message ?? ''),
        locale: String(row.locale ?? ''),
        created_at: String(row.created_at ?? ''),
    };
}

export default function AdminChongqing() {
    const [requests, setRequests] = useState<TourRequest[]>([]);
    const [guideOrders, setGuideOrders] = useState<GuideWaitlistEntry[]>([]);
    const [guidePurchases, setGuidePurchases] = useState<GuidePurchaseRow[]>([]);
    const [purchasesError, setPurchasesError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('tous');

    const loadRequests = async () => {
        const { data, error: fetchError } = await supabase
            .from('tour_requests')
            .select('*')
            .order('created_at', { ascending: false });

        const tours = data || [];
        const waitlistFromTours = tours.filter(isGuideWaitlistRequest);

        if (fetchError) {
            setError(`Erreur: ${fetchError.message}`);
            setRequests([]);
        } else {
            setRequests(tours.filter((request) => !isGuideWaitlistRequest(request)));
            setError(null);
        }

        const { data: orders } = await supabase
            .from('guide_orders')
            .select('*')
            .order('created_at', { ascending: false });

        const fromOrders = (orders || []).map((row) =>
            waitlistFromOrder(row as Record<string, unknown>)
        );
        const merged = [...fromOrders, ...waitlistFromTours.map(waitlistFromTourRequest)].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setGuideOrders(merged);

        const { data: purchases, error: purchasesFetchError } = await supabase
            .from('guide_purchases')
            .select('*')
            .order('created_at', { ascending: false });

        if (purchasesFetchError) {
            setPurchasesError(purchasesFetchError.message);
            setGuidePurchases([]);
        } else {
            setPurchasesError(null);
            setGuidePurchases((purchases || []) as GuidePurchaseRow[]);
        }
    };

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                await loadRequests();
            } catch (err) {
                setError(`Erreur: ${String(err)}`);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const updateStatus = async (id: string, newStatus: StatusType) => {
        setUpdatingId(id);
        try {
            const { error: updateError } = await supabase
                .from('tour_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (updateError) {
                const extra =
                    newStatus === 'termine'
                        ? '\n\nColle ceci dans Supabase → SQL Editor, puis réessaie :\n\nALTER TABLE tour_requests DROP CONSTRAINT IF EXISTS tour_requests_status_check;\nALTER TABLE tour_requests ADD CONSTRAINT tour_requests_status_check CHECK (status IN (\'nouveau\', \'en_cours\', \'email_envoye\', \'confirme\', \'termine\', \'annule\'));'
                        : '';
                alert('Erreur: ' + updateError.message + extra);
                return;
            }

            setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
            );
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la mise à jour');
        } finally {
            setUpdatingId(null);
        }
    };

    const updateVisitDays = async (id: string, days: string[]) => {
        setUpdatingId(id);
        const sorted = [...new Set(days)].sort();
        try {
            const { error: updateError } = await supabase
                .from('tour_requests')
                .update({ jours_visite: sorted })
                .eq('id', id);

            if (updateError) {
                alert(
                    'Erreur: ' +
                        updateError.message +
                        '\n\nAjoute cette colonne dans Supabase si besoin :\nALTER TABLE tour_requests ADD COLUMN IF NOT EXISTS jours_visite date[] DEFAULT \'{}\';'
                );
                return;
            }

            setRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, jours_visite: sorted } : r))
            );
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la mise à jour des jours de visite');
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteRequest = async (id: string) => {
        if (!confirm('Sûr de vouloir supprimer ?')) return;

        const { error: deleteError } = await supabase
            .from('tour_requests')
            .delete()
            .eq('id', id);

        if (deleteError) {
            alert('Erreur: ' + deleteError.message);
            return;
        }

        setRequests((prev) => prev.filter((r) => r.id !== id));
        setGuideOrders((prev) => prev.filter((entry) => entry.id !== id));
    };

    const deleteGuideOrder = async (entry: GuideWaitlistEntry) => {
        if (!confirm('Sûr de vouloir supprimer cette inscription guide ?')) return;

        const table = entry.source === 'guide_orders' ? 'guide_orders' : 'tour_requests';
        const { error: deleteError } = await supabase.from(table).delete().eq('id', entry.id);

        if (deleteError) {
            alert('Erreur: ' + deleteError.message);
            return;
        }

        setGuideOrders((prev) => prev.filter((item) => item.id !== entry.id));
    };

    const markGuidePurchasePaid = async (id: string) => {
        const { error: updateError } = await supabase
            .from('guide_purchases')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', id);

        if (updateError) {
            alert(
                'Erreur: ' +
                    updateError.message +
                    '\n\nSi la table n’existe pas, exécute supabase/guide_purchases.sql dans Supabase.'
            );
            return;
        }

        setGuidePurchases((prev) =>
            prev.map((row) =>
                row.id === id
                    ? { ...row, status: 'paid', paid_at: new Date().toISOString() }
                    : row
            )
        );
    };

    const deleteGuidePurchase = async (id: string) => {
        if (!confirm('Sûr de vouloir supprimer cet achat guide ?')) return;
        const { error: deleteError } = await supabase
            .from('guide_purchases')
            .delete()
            .eq('id', id);
        if (deleteError) {
            alert('Erreur: ' + deleteError.message);
            return;
        }
        setGuidePurchases((prev) => prev.filter((row) => row.id !== id));
    };

    const enriched = useMemo(() => {
        return requests.map((request) => {
            const headcount = getHeadcount(request);
            const pricing = getPricing(headcount.count);
            const phase = getTourPhase(request);
            const payment = getPaymentState(request, pricing, phase);
            return { request, headcount, pricing, phase, payment };
        });
    }, [requests]);

    const stats = useMemo(() => {
        const active = enriched.filter((item) => item.phase !== 'cancelled');
        const toConfirm = active.filter((item) =>
            isAwaitingConfirmation(item.request, item.phase)
        );
        const upcoming = active.filter((item) =>
            isConfirmedUpcoming(item.request, item.phase)
        );
        const ongoing = active.filter((item) =>
            isOnVisitNow(item.request, item.phase)
        );
        const finishedPeople = active.filter((item) => item.phase === 'finished');
        const finishedPaid = active.filter(
            (item) =>
                item.request.status === 'termine' ||
                (item.request.status === 'confirme' && item.phase === 'finished')
        );
        const confirmedToDo = active.filter(
            (item) => item.request.status === 'confirme' && item.phase !== 'finished'
        );
        const hypothetical = active.filter(
            (item) =>
                item.request.status !== 'confirme' &&
                item.request.status !== 'termine' &&
                item.request.status !== 'annule'
        );

        const sumPeople = (items: typeof active) =>
            items.reduce((acc, item) => acc + item.headcount.count, 0);
        const sumTotal = (items: typeof active) =>
            items.reduce((acc, item) => acc + item.pricing.total, 0);
        const sumCollected = (items: typeof active) =>
            items.reduce((acc, item) => acc + item.payment.collected, 0);
        const sumOutstanding = (items: typeof active) =>
            items.reduce((acc, item) => acc + item.payment.outstanding, 0);

        const projectionFinished = sumTotal(finishedPaid);
        const projectionToDo = sumTotal(confirmedToDo);
        const projectionHypothetical = sumTotal(hypothetical);

        return {
            peopleToConfirm: sumPeople(toConfirm),
            toursToConfirm: toConfirm.length,
            peopleUpcoming: sumPeople(upcoming),
            toursUpcoming: upcoming.length,
            peopleOngoing: sumPeople(ongoing),
            toursOngoing: ongoing.length,
            peopleFinished: sumPeople(finishedPeople),
            toursFinished: finishedPeople.length,
            projection: projectionFinished + projectionToDo,
            projectionFinished,
            projectionToDo,
            projectionHypothetical,
            collected: sumCollected(active),
            outstanding: sumOutstanding(confirmedToDo),
        };
    }, [enriched]);

    const filtered = useMemo(() => {
        const list = enriched.filter((item) => {
            if (filter === 'a_confirmer') {
                return isAwaitingConfirmation(item.request, item.phase);
            }
            if (filter === 'a_venir') {
                return isConfirmedUpcoming(item.request, item.phase);
            }
            if (filter === 'en_visite') {
                return isOnVisitNow(item.request, item.phase);
            }
            if (filter === 'termines') return item.phase === 'finished';
            if (filter === 'annules') return item.phase === 'cancelled';
            return true;
        });

        return [...list].sort((a, b) => {
            const phaseDiff = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
            if (phaseDiff !== 0) return phaseDiff;
            const visitA = getVisitDays(a.request)[0];
            const visitB = getVisitDays(b.request)[0];
            const dateA =
                parseLocalDate(visitA || a.request.date_arrivee)?.getTime() ?? 0;
            const dateB =
                parseLocalDate(visitB || b.request.date_arrivee)?.getTime() ?? 0;
            return dateA - dateB;
        });
    }, [enriched, filter]);

    const downloadCSV = () => {
        if (enriched.length === 0) return;

        const headers = [
            'ID',
            'Prénom',
            'Nom',
            'Email',
            'Téléphone',
            'Status',
            'Phase',
            'Arrivée',
            'Départ',
            'Jours de visite',
            'Hébergement',
            'Mobilité',
            'Transport',
            'Rythme',
            'Restrictions',
            'Langues',
            'Voiture Privée',
            'Déjà visité Chine',
            'Excursions',
            'Nature',
            'Ville',
            'Histoire',
            'Gastronomie',
            'Insolite',
            'Photo',
            'Participants listés',
            'Inscrit dans la liste',
            'Nb Personnes (tarif)',
            'Total €',
            'Déjà encaissé €',
            'Reste à encaisser €',
            'Note paiement',
            'Date Soumission',
        ];

        const rows = enriched.map(({ request, headcount, pricing, phase, payment }) => [
            request.id,
            request.prenom,
            request.nom,
            request.email,
            request.telephone,
            getStatusConfig(request.status).label,
            PHASE_LABEL[phase].label,
            request.date_arrivee,
            request.date_depart,
            getVisitDays(request).join('; ') || '-',
            request.hebergement || '-',
            request.mobilite || '-',
            request.transport_prefere || '-',
            request.rythme || '-',
            request.restrictions || '-',
            Array.isArray(request.langues) ? request.langues.join('; ') : request.langues || '-',
            request.option_voiture_privee ? 'Oui' : 'Non',
            request.deja_visite_chine ? 'Oui' : 'Non',
            request.excursions_interet ? 'Oui' : 'Non',
            request.pref_nature || '-',
            request.pref_ville || '-',
            request.pref_histoire || '-',
            request.pref_gastronomie || '-',
            request.pref_insolite || '-',
            request.pref_photo || '-',
            headcount.listed,
            headcount.registrantInList ? 'Oui' : 'Non',
            headcount.count,
            pricing.total,
            payment.collected,
            payment.outstanding,
            payment.note,
            new Date(request.created_at).toLocaleDateString('fr-FR'),
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reservations_chongqing_${Date.now()}.csv`);
        link.click();
    };

    const handleRefresh = async () => {
        setLoading(true);
        setError(null);
        try {
            await loadRequests();
        } catch (err) {
            setError(`Erreur: ${String(err)}`);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-cream">
                <div className="text-xl font-semibold text-ink">Chargement...</div>
            </div>
        );
    }

    const filters: { id: FilterType; label: string; count: number }[] = [
        { id: 'tous', label: 'Tous', count: enriched.length },
        { id: 'a_confirmer', label: 'À confirmer', count: stats.toursToConfirm },
        { id: 'a_venir', label: 'À venir', count: stats.toursUpcoming },
        { id: 'en_visite', label: 'En visite', count: stats.toursOngoing },
        { id: 'termines', label: 'Tours finis', count: stats.toursFinished },
        {
            id: 'annules',
            label: 'Annulés',
            count: enriched.filter((item) => item.phase === 'cancelled').length,
        },
    ];

    return (
        <div className="min-h-screen bg-cream p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
                        Admin Chongqing
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-lg">
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                <GuidePurchasesPanel
                    entries={guidePurchases}
                    error={purchasesError}
                    onMarkPaid={markGuidePurchasePaid}
                    onDelete={deleteGuidePurchase}
                />

                <GuideWaitlistPanel entries={guideOrders} onDelete={deleteGuideOrder} />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <StatCard
                        label="À confirmer"
                        value={stats.peopleToConfirm}
                        unit="personnes"
                        hint={`${stats.toursToConfirm} dossier${stats.toursToConfirm > 1 ? 's' : ''} sans confirmation`}
                        tone="amber"
                    />
                    <StatCard
                        label="Personnes à venir"
                        value={stats.peopleUpcoming}
                        unit="personnes"
                        hint={`${stats.toursUpcoming} tour${stats.toursUpcoming > 1 ? 's' : ''} confirmé${stats.toursUpcoming > 1 ? 's' : ''}`}
                        tone="sky"
                    />
                    <StatCard
                        label="En visite maintenant"
                        value={stats.peopleOngoing}
                        unit="personnes"
                        hint={`${stats.toursOngoing} tour${stats.toursOngoing > 1 ? 's' : ''}`}
                        tone="green"
                    />
                    <StatCard
                        label="Visites déjà faites"
                        value={stats.peopleFinished}
                        unit="personnes"
                        hint={`${stats.toursFinished} tour${stats.toursFinished > 1 ? 's' : ''} fini${stats.toursFinished > 1 ? 's' : ''}`}
                        tone="slate"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
                    <StatCard
                        label="Projection totale"
                        value={formatEuro(stats.projection)}
                        hint={`${formatEuro(stats.projectionFinished)} finis + ${formatEuro(stats.projectionToDo)} à faire (${formatEuro(stats.projectionHypothetical)} hypothétiques à venir)`}
                        tone="orange"
                    />
                    <StatCard
                        label="Déjà encaissé"
                        value={formatEuro(stats.collected)}
                        hint="Tours finis = 100 % · Confirmés = acompte 25 %"
                        tone="green"
                    />
                    <StatCard
                        label="Reste à encaisser"
                        value={formatEuro(stats.outstanding)}
                        hint="Solde 75 % des tours confirmés pas encore faits"
                        tone="amber"
                    />
                </div>
                <p className="text-sm font-medium text-ink/70 mb-6">
                    La projection et le reste à encaisser ne comptent que les tours confirmés
                    et finis. Les non confirmés apparaissent seulement en hypothétique.
                </p>

                <VisitCalendar
                    items={enriched}
                    onSelectRequest={(id) => {
                        setFilter('tous');
                        setExpandedId(id);
                        window.setTimeout(() => {
                            document
                                .getElementById(`reservation-${id}`)
                                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 80);
                    }}
                />

                <div className="mb-6 flex gap-3 flex-wrap">
                    <button
                        onClick={downloadCSV}
                        disabled={requests.length === 0}
                        className="flex items-center gap-2 bg-bamboo text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={20} />
                        Télécharger CSV
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="bg-apricot hover:opacity-90 text-white px-5 py-3 rounded-xl font-semibold transition-all"
                    >
                        Actualiser
                    </button>
                </div>

                <div className="mb-6 flex gap-2 flex-wrap">
                    {filters.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            className={`px-4 py-2 rounded-full font-semibold text-sm border-2 transition-all ${
                                filter === item.id
                                    ? 'bg-ink text-white border-ink'
                                    : 'bg-white text-ink border-ink/15 hover:border-ink/40'
                            }`}
                        >
                            {item.label} ({item.count})
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-ink/10">
                        <p className="text-ink/70 text-lg font-medium">
                            Aucune réservation dans cette vue
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filtered.map(({ request, headcount, pricing, phase, payment }) => {
                            const statusConfig = getStatusConfig(request.status);
                            const duration = stayDuration(
                                request.date_arrivee,
                                request.date_depart
                            );
                            const participants = getParticipants(request);
                            const visitDays = getVisitDays(request);
                            const expanded = expandedId === request.id;
                            const canMarkFinished =
                                request.status !== 'termine' && request.status !== 'annule';

                            return (
                                <div
                                    id={`reservation-${request.id}`}
                                    key={request.id}
                                    className={`rounded-2xl bg-white shadow-md border-l-8 overflow-hidden ${statusConfig.border}`}
                                >
                                    <div
                                        onClick={() =>
                                            setExpandedId(expanded ? null : request.id)
                                        }
                                        className="p-5 sm:p-6 cursor-pointer hover:bg-sunshine/10 transition-colors"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-2xl font-extrabold text-ink wrap-break-word">
                                                        {request.prenom} {request.nom}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        <span
                                                            className={`px-3 py-1.5 rounded-full font-bold text-sm ${statusConfig.bgColor} ${statusConfig.color}`}
                                                        >
                                                            {statusConfig.label}
                                                        </span>
                                                        <span
                                                            className={`px-3 py-1.5 rounded-full font-bold text-sm ${PHASE_LABEL[phase].className}`}
                                                        >
                                                            {PHASE_LABEL[phase].label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteRequest(request.id);
                                                        }}
                                                        className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={22} />
                                                    </button>
                                                    <ChevronDown
                                                        size={28}
                                                        className={`text-apricot transition-transform ${expanded ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                <div className="sm:col-span-2 lg:col-span-4">
                                                    <InfoChip
                                                        icon={<CalendarDays size={18} />}
                                                        label="Jour(s) de visite"
                                                        value={formatVisitDays(visitDays)}
                                                        extra={
                                                            visitDays.length === 0
                                                                ? 'À ajouter à la main'
                                                                : `${visitDays.length} jour${visitDays.length > 1 ? 's' : ''}`
                                                        }
                                                        emphasize={visitDays.length > 0}
                                                        warn={visitDays.length === 0}
                                                    />
                                                </div>
                                                <InfoChip
                                                    icon={<CalendarDays size={18} />}
                                                    label="Séjour"
                                                    value={`${formatLongDate(request.date_arrivee)} → ${formatLongDate(request.date_depart)}`}
                                                    extra={duration ? `${duration} jour${duration > 1 ? 's' : ''}` : undefined}
                                                />
                                                <InfoChip
                                                    icon={<Users size={18} />}
                                                    label="Personnes"
                                                    value={`${headcount.count} pers.`}
                                                    extra={
                                                        headcount.registrantAdded
                                                            ? `${headcount.listed} listé${headcount.listed > 1 ? 's' : ''} + inscrit`
                                                            : 'Inscrit déjà dans la liste'
                                                    }
                                                />
                                                <InfoChip
                                                    icon={<Wallet size={18} />}
                                                    label="Total"
                                                    value={formatEuro(pricing.total)}
                                                    extra={`${UNIT_PRICE} € × ${headcount.count}`}
                                                />
                                                <InfoChip
                                                    icon={<CheckCircle2 size={18} />}
                                                    label="Déjà encaissé"
                                                    value={formatEuro(payment.collected)}
                                                    extra={payment.note}
                                                    emphasize={payment.collected > 0}
                                                />
                                                <InfoChip
                                                    icon={<Wallet size={18} />}
                                                    label="Reste à encaisser"
                                                    value={formatEuro(payment.outstanding)}
                                                    extra={
                                                        payment.outstanding > 0
                                                            ? 'Encore à percevoir'
                                                            : 'Rien à percevoir'
                                                    }
                                                    warn={payment.outstanding > 0}
                                                />
                                            </div>

                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="bg-white border-2 border-ink/10 rounded-xl p-3"
                                            >
                                                <VisitDaysEditor
                                                    days={visitDays}
                                                    arrivee={request.date_arrivee}
                                                    depart={request.date_depart}
                                                    disabled={updatingId === request.id}
                                                    onAdd={(day) =>
                                                        updateVisitDays(request.id, [
                                                            ...visitDays,
                                                            day,
                                                        ])
                                                    }
                                                    onRemove={(day) =>
                                                        updateVisitDays(
                                                            request.id,
                                                            visitDays.filter((item) => item !== day)
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-base font-medium text-ink">
                                                <span className="inline-flex items-center gap-2">
                                                    <Mail size={16} className="text-ink/60" />
                                                    {request.email}
                                                </span>
                                                <span className="inline-flex items-center gap-2">
                                                    <Phone size={16} className="text-ink/60" />
                                                    {request.telephone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {expanded && (
                                        <div className="border-t-2 border-ink/10 p-5 sm:p-6 bg-sunshine/10 space-y-5">
                                            <div className="bg-white p-4 rounded-xl border-2 border-ink/10">
                                                <h4 className="font-bold text-ink text-lg mb-3">
                                                    Modifier le statut
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(Object.keys(STATUS_CONFIG) as StatusType[]).map(
                                                        (status) => {
                                                            const config = STATUS_CONFIG[status];
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    onClick={() =>
                                                                        updateStatus(request.id, status)
                                                                    }
                                                                    disabled={
                                                                        updatingId === request.id ||
                                                                        request.status === status
                                                                    }
                                                                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                                                        request.status === status
                                                                            ? `${config.bgColor} ${config.color} ring-2 ring-offset-2 ring-ink/30`
                                                                            : 'bg-ink/10 text-ink hover:bg-ink/15'
                                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                >
                                                                    {config.label}
                                                                </button>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                                {canMarkFinished && (
                                                    <button
                                                        onClick={() =>
                                                            updateStatus(request.id, 'termine')
                                                        }
                                                        disabled={updatingId === request.id}
                                                        className="mt-3 inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                        Marquer le tour comme fini
                                                    </button>
                                                )}
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border-2 border-emerald-200">
                                                <h4 className="font-bold text-ink text-lg mb-3">
                                                    Tarif & encaissement
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <PriceBox
                                                        label="Personnes"
                                                        value={`${headcount.count}`}
                                                    />
                                                    <PriceBox
                                                        label="Total"
                                                        value={formatEuro(pricing.total)}
                                                        highlight
                                                    />
                                                    <PriceBox
                                                        label="Déjà encaissé"
                                                        value={formatEuro(payment.collected)}
                                                    />
                                                    <PriceBox
                                                        label="Reste à encaisser"
                                                        value={formatEuro(payment.outstanding)}
                                                    />
                                                </div>
                                                <p className="mt-3 text-base font-semibold text-ink">
                                                    {payment.note}
                                                </p>
                                                {request.status === 'confirme' &&
                                                    phase !== 'finished' && (
                                                        <p className="mt-2 text-sm font-medium text-ink/70">
                                                            Acompte 25 % : {formatEuro(pricing.deposit)} ·
                                                            Solde 75 % : {formatEuro(pricing.remaining)}
                                                        </p>
                                                    )}
                                                {headcount.registrantAdded && (
                                                    <p className="mt-2 text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                                        L&apos;inscrit ({request.prenom} {request.nom}) n&apos;est
                                                        pas dans la liste des participants : il est ajouté
                                                        automatiquement au tarif.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <DetailBox title="Nom complet">
                                                    {request.prenom} {request.nom}
                                                </DetailBox>
                                                <DetailBox title="Email">{request.email}</DetailBox>
                                                <DetailBox title="Téléphone">
                                                    {request.telephone}
                                                </DetailBox>
                                                <DetailBox title="Date de création">
                                                    {new Date(request.created_at).toLocaleDateString(
                                                        'fr-FR',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                                </DetailBox>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <DetailBox title="Jour(s) de visite">
                                                    {formatVisitDays(visitDays)}
                                                </DetailBox>
                                                <DetailBox title="Arrivée">
                                                    {formatLongDate(request.date_arrivee)}
                                                </DetailBox>
                                                <DetailBox title="Départ">
                                                    {formatLongDate(request.date_depart)}
                                                </DetailBox>
                                                <DetailBox title="Hébergement">
                                                    {request.hebergement || '—'}
                                                </DetailBox>
                                                <DetailBox title="Durée">
                                                    {duration
                                                        ? `${duration} jour${duration > 1 ? 's' : ''}`
                                                        : '—'}
                                                </DetailBox>
                                                <DetailBox title="Mobilité">
                                                    {request.mobilite || '—'}
                                                </DetailBox>
                                                <DetailBox title="Voiture privée">
                                                    {request.option_voiture_privee ? 'Oui' : 'Non'}
                                                </DetailBox>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border-2 border-pink-200">
                                                <h4 className="font-bold text-ink text-lg mb-3">
                                                    Groupe ({headcount.count} pers.)
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="bg-apricot/15 p-3 rounded-xl border-l-4 border-apricot">
                                                        <p className="text-xs font-bold uppercase text-apricot">
                                                            Inscrit
                                                        </p>
                                                        <p className="font-bold text-ink text-lg">
                                                            {request.prenom} {request.nom}
                                                        </p>
                                                        <p className="text-sm font-medium text-ink/70">
                                                            {headcount.registrantInList
                                                                ? 'Présent dans la liste participants'
                                                                : 'Ajouté au décompte tarifaire'}
                                                        </p>
                                                    </div>
                                                    {participants.map((p, idx) => (
                                                        <div
                                                            key={`${p.prenom}-${idx}`}
                                                            className="bg-pink-50 p-3 rounded-xl border-l-4 border-pink-400"
                                                        >
                                                            <p className="text-xs font-bold uppercase text-pink-700">
                                                                Participant
                                                            </p>
                                                            <p className="font-bold text-ink text-lg">
                                                                {p.prenom} {p.nom || ''}
                                                            </p>
                                                            <p className="text-sm font-medium text-ink/70">
                                                                {p.age ? `${p.age} ans` : 'Âge non renseigné'}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {Array.isArray(request.langues) &&
                                                request.langues.length > 0 && (
                                                    <div className="bg-white p-4 rounded-xl border-2 border-indigo-200">
                                                        <h4 className="font-bold text-ink text-lg mb-3">
                                                            Langues parlées
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {request.langues.map((langue) => (
                                                                <span
                                                                    key={langue}
                                                                    className="bg-indigo-100 text-indigo-900 px-3 py-1.5 rounded-full text-sm font-bold"
                                                                >
                                                                    {langue}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            {request.restrictions && (
                                                <DetailBox title="Restrictions alimentaires">
                                                    {request.restrictions}
                                                </DetailBox>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <DetailBox title="Transport préféré">
                                                    {request.transport_prefere || '—'}
                                                </DetailBox>
                                                <DetailBox title="Rythme de visite">
                                                    {request.rythme || '—'}
                                                </DetailBox>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border-2 border-ink/10">
                                                <h4 className="font-bold text-ink text-lg mb-3">
                                                    Préférences (1-5)
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    <PrefBox label="Nature" value={request.pref_nature} />
                                                    <PrefBox label="Ville" value={request.pref_ville} />
                                                    <PrefBox
                                                        label="Histoire"
                                                        value={request.pref_histoire}
                                                    />
                                                    <PrefBox
                                                        label="Gastronomie"
                                                        value={request.pref_gastronomie}
                                                    />
                                                    <PrefBox
                                                        label="Insolite"
                                                        value={request.pref_insolite}
                                                    />
                                                    <PrefBox label="Photo" value={request.pref_photo} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <DetailBox title="Déjà visité la Chine ?">
                                                    {request.deja_visite_chine ? 'Oui' : 'Non'}
                                                </DetailBox>
                                                <DetailBox title="Intérêt pour les excursions">
                                                    {request.excursions_interet ? 'Oui' : 'Non'}
                                                </DetailBox>
                                            </div>

                                            {request.commentaires && (
                                                <DetailBox title="Commentaires">
                                                    {request.commentaires}
                                                </DetailBox>
                                            )}

                                            <p className="text-xs font-mono text-ink/50 break-all text-center">
                                                {request.id}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function padDatePart(value: number) {
    return String(value).padStart(2, '0');
}

function visitChipClass(status: StatusType) {
    if (status === 'termine') return 'bg-slate-200 text-slate-800';
    if (status === 'confirme') return 'bg-emerald-200 text-emerald-900';
    return 'bg-amber-200 text-amber-900';
}

function VisitCalendar({
    items,
    onSelectRequest,
}: {
    items: { request: TourRequest; headcount: { count: number } }[];
    onSelectRequest: (id: string) => void;
}) {
    const today = startOfDay(new Date());
    const [cursor, setCursor] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const visitsByDay = useMemo(() => {
        const map = new Map<
            string,
            { id: string; name: string; people: number; status: StatusType }[]
        >();

        for (const item of items) {
            if (item.request.status === 'annule') continue;
            for (const day of getVisitDays(item.request)) {
                const list = map.get(day) ?? [];
                list.push({
                    id: item.request.id,
                    name: `${item.request.prenom} ${item.request.nom}`.trim(),
                    people: item.headcount.count,
                    status: item.request.status,
                });
                map.set(day, list);
            }
        }

        return map;
    }, [items]);

    const monthPrefix = `${year}-${padDatePart(month + 1)}`;
    const monthVisitDays = [...visitsByDay.keys()].filter((day) =>
        day.startsWith(monthPrefix)
    ).length;

    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const monthLabel = cursor.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });
    const selectedVisits = selectedDay ? visitsByDay.get(selectedDay) ?? [] : [];

    return (
        <div className="bg-white border-2 border-ink/10 rounded-2xl p-4 sm:p-5 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ink">
                        Calendrier des visites
                    </h2>
                    <p className="text-sm font-medium text-ink/70">
                        Seulement les jours de visite — {monthVisitDays} jour
                        {monthVisitDays > 1 ? 's' : ''} ce mois-ci
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setCursor(new Date(year, month - 1, 1))
                        }
                        className="p-2 rounded-xl border-2 border-ink/10 hover:bg-ink/5"
                        aria-label="Mois précédent"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <p className="font-bold text-ink min-w-40 text-center capitalize">
                        {monthLabel}
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            setCursor(new Date(year, month + 1, 1))
                        }
                        className="p-2 rounded-xl border-2 border-ink/10 hover:bg-ink/5"
                        aria-label="Mois suivant"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs sm:text-sm font-bold text-ink/50 py-1"
                    >
                        {day}
                    </div>
                ))}
                {cells.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="min-h-12 sm:min-h-18" />;
                    }

                    const iso = `${year}-${padDatePart(month + 1)}-${padDatePart(day)}`;
                    const visits = visitsByDay.get(iso) ?? [];
                    const isToday =
                        today.getFullYear() === year &&
                        today.getMonth() === month &&
                        today.getDate() === day;
                    const isSelected = selectedDay === iso;
                    const hasVisits = visits.length > 0;

                    return (
                        <button
                            key={iso}
                            type="button"
                            onClick={() => setSelectedDay(iso)}
                            className={`min-h-12 sm:min-h-18 rounded-xl border-2 p-1 sm:p-1.5 text-left transition-all ${
                                isSelected
                                    ? 'border-ink bg-sunshine/30'
                                    : hasVisits
                                      ? 'border-apricot/50 bg-apricot/10 hover:bg-apricot/20'
                                      : 'border-transparent hover:bg-ink/5'
                            } ${isToday ? 'ring-2 ring-apricot' : ''}`}
                        >
                            <span
                                className={`text-sm font-extrabold ${
                                    hasVisits ? 'text-ink' : 'text-ink/50'
                                }`}
                            >
                                {day}
                            </span>
                            {hasVisits && (
                                <>
                                    <p className="text-[10px] sm:text-xs font-bold text-ink/80">
                                        {visits.length} vis.
                                    </p>
                                    <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                                        {visits.slice(0, 2).map((visit) => (
                                            <span
                                                key={`${iso}-${visit.id}`}
                                                className={`truncate rounded px-1 py-0.5 text-[10px] font-bold ${visitChipClass(visit.status)}`}
                                            >
                                                {visit.name.split(' ')[0]}
                                            </span>
                                        ))}
                                        {visits.length > 2 && (
                                            <span className="text-[10px] font-bold text-ink/60">
                                                +{visits.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-3 mt-3 text-xs font-semibold text-ink/70">
                <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Confirmé
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> À confirmer
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Fini
                </span>
            </div>

            {selectedDay && (
                <div className="mt-4 border-t-2 border-ink/10 pt-3">
                    <p className="font-bold text-ink mb-2">
                        {formatLongDate(selectedDay)}
                    </p>
                    {selectedVisits.length === 0 ? (
                        <p className="text-sm font-medium text-ink/60">
                            Aucune visite ce jour-là
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {selectedVisits.map((visit) => (
                                <button
                                    key={`${selectedDay}-${visit.id}`}
                                    type="button"
                                    onClick={() => onSelectRequest(visit.id)}
                                    className={`text-left px-3 py-2 rounded-xl font-semibold ${visitChipClass(visit.status)}`}
                                >
                                    {visit.name} · {visit.people} pers. ·{' '}
                                    {getStatusConfig(visit.status).label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function formatWaitlistDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function GuidePurchasesPanel({
    entries,
    error,
    onMarkPaid,
    onDelete,
}: {
    entries: GuidePurchaseRow[];
    error: string | null;
    onMarkPaid: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const [open, setOpen] = useState(true);
    const pending = entries.filter((row) => row.status === 'pending').length;
    const paid = entries.filter((row) => row.status === 'paid').length;

    return (
        <section className="mb-8 bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-sunshine/10 transition-colors"
            >
                <span className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-apricot/15 text-apricot flex items-center justify-center shrink-0">
                        <Wallet size={20} />
                    </span>
                    <span>
                        <span className="block font-extrabold text-ink">Achats guides (Wise)</span>
                        <span className="block text-sm font-medium text-ink/65">
                            {error
                                ? 'Table à créer dans Supabase'
                                : entries.length === 0
                                  ? 'Aucun achat pour l’instant'
                                  : `${paid} payé${paid > 1 ? 's' : ''} · ${pending} en attente`}
                        </span>
                    </span>
                </span>
                <ChevronDown
                    size={22}
                    className={`text-apricot shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="border-t border-ink/10">
                    {error ? (
                        <p className="px-5 py-6 text-sm text-ink/70 leading-relaxed">
                            {error}
                            <br />
                            Colle le fichier <code>supabase/guide_purchases.sql</code> dans
                            Supabase → SQL Editor.
                        </p>
                    ) : entries.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-ink/60">
                            Les paiements Wise apparaîtront ici.
                        </p>
                    ) : (
                        <ul className="divide-y divide-ink/10">
                            {entries.map((entry) => {
                                const locale = entry.locale === 'en' ? 'en' : 'fr';
                                const memberPath = `/${locale}/membre/${entry.access_token}`;
                                const isPaid = entry.status === 'paid';
                                return (
                                    <li key={entry.id} className="px-5 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-extrabold text-ink">
                                                    {entry.prenom} {entry.nom}
                                                </p>
                                                <p className="text-sm text-ink/55 mt-0.5">
                                                    {formatWaitlistDate(entry.created_at)}
                                                    {` · ${Number(entry.amount_eur).toFixed(2)} €`}
                                                    {` · ${entry.payment_reference}`}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${
                                                    isPaid
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {isPaid ? 'Payé' : 'En attente'}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                            {entry.email ? (
                                                <a
                                                    href={`mailto:${entry.email}`}
                                                    className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-apricot"
                                                >
                                                    <Mail size={14} />
                                                    {entry.email}
                                                </a>
                                            ) : null}
                                            {entry.telephone ? (
                                                <a
                                                    href={`tel:${entry.telephone}`}
                                                    className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-apricot"
                                                >
                                                    <Phone size={14} />
                                                    {entry.telephone}
                                                </a>
                                            ) : null}
                                        </div>

                                        {normalizeGuides(entry.guides).length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {normalizeGuides(entry.guides).map((guide) => (
                                                    <span
                                                        key={guide}
                                                        className="px-2.5 py-1 rounded-full bg-apricot/15 text-apricot text-xs font-bold"
                                                    >
                                                        {guideLabel(guide)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {isPaid ? (
                                                <a
                                                    href={memberPath}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm font-semibold text-apricot hover:text-apricot/80"
                                                >
                                                    Ouvrir l’espace membre
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => onMarkPaid(entry.id)}
                                                    className="text-sm font-semibold bg-ink text-white px-3 py-1.5 rounded-lg hover:bg-ink/90"
                                                >
                                                    Marquer payé
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => onDelete(entry.id)}
                                                className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}

function GuideWaitlistPanel({
    entries,
    onDelete,
}: {
    entries: GuideWaitlistEntry[];
    onDelete: (entry: GuideWaitlistEntry) => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <section className="mb-8 bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-sunshine/10 transition-colors"
            >
                <span className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-apricot/15 text-apricot flex items-center justify-center shrink-0">
                        <BookOpen size={20} />
                    </span>
                    <span>
                        <span className="block font-extrabold text-ink">Liste d’attente guides</span>
                        <span className="block text-sm font-medium text-ink/65">
                            {entries.length === 0
                                ? 'Aucune inscription pour l’instant'
                                : `${entries.length} inscription${entries.length > 1 ? 's' : ''} · messages et coordonnées`}
                        </span>
                    </span>
                </span>
                <ChevronDown
                    size={22}
                    className={`text-apricot shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="border-t border-ink/10">
                    {entries.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-ink/60">
                            Les inscriptions du formulaire guides apparaîtront ici.
                        </p>
                    ) : (
                        <ul className="divide-y divide-ink/10">
                            {entries.map((entry) => (
                                <li key={`${entry.source}-${entry.id}`} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-extrabold text-ink">
                                                {entry.prenom} {entry.nom}
                                            </p>
                                            <p className="text-sm text-ink/55 mt-0.5">
                                                {formatWaitlistDate(entry.created_at)}
                                                {entry.locale
                                                    ? ` · ${entry.locale.toUpperCase()}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(entry)}
                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 shrink-0"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                        {entry.email ? (
                                            <a
                                                href={`mailto:${entry.email}`}
                                                className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-apricot"
                                            >
                                                <Mail size={14} />
                                                {entry.email}
                                            </a>
                                        ) : null}
                                        {entry.telephone && entry.telephone !== '—' ? (
                                            <a
                                                href={`tel:${entry.telephone}`}
                                                className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-apricot"
                                            >
                                                <Phone size={14} />
                                                {entry.telephone}
                                            </a>
                                        ) : null}
                                    </div>

                                    {entry.guides.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {entry.guides.map((guide) => (
                                                <span
                                                    key={guide}
                                                    className="px-2.5 py-1 rounded-full bg-apricot/15 text-apricot text-xs font-bold"
                                                >
                                                    {guideLabel(guide)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}

                                    {entry.message ? (
                                        <p className="mt-3 text-sm leading-relaxed text-ink/80 bg-cream rounded-xl px-3 py-2 whitespace-pre-wrap">
                                            {entry.message}
                                        </p>
                                    ) : (
                                        <p className="mt-3 text-sm italic text-ink/45">
                                            Aucun message laissé
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}

function StatCard({
    label,
    value,
    unit,
    hint,
    tone,
}: {
    label: string;
    value: string | number;
    unit?: string;
    hint: string;
    tone: 'sky' | 'green' | 'slate' | 'orange' | 'amber';
}) {
    const tones = {
        sky: 'border-blue-400 text-blue-900',
        green: 'border-bamboo text-green-900',
        slate: 'border-slate-400 text-slate-900',
        orange: 'border-apricot text-orange-900',
        amber: 'border-amber-400 text-amber-900',
    };

    return (
        <div className={`bg-white border-2 rounded-2xl p-4 sm:p-5 shadow-sm ${tones[tone]}`}>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-ink/70 mb-1">
                {label}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold leading-tight">
                {value}
                {unit ? (
                    <span className="ml-1.5 text-base sm:text-lg font-bold text-ink/45">
                        /{unit}
                    </span>
                ) : null}
            </p>
            <p className="text-sm font-medium text-ink/70 mt-1 leading-snug">{hint}</p>
        </div>
    );
}

function InfoChip({
    icon,
    label,
    value,
    extra,
    emphasize = false,
    warn = false,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    extra?: string;
    emphasize?: boolean;
    warn?: boolean;
}) {
    return (
        <div
            className={`rounded-xl p-3 border-2 ${
                warn
                    ? 'bg-amber-50 border-amber-400'
                    : emphasize
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-ink/5 border-ink/10'
            }`}
        >
            <p className="text-xs font-bold uppercase tracking-wide text-ink/60 flex items-center gap-1.5 mb-1">
                {icon}
                {label}
            </p>
            <p className="text-base sm:text-lg font-extrabold text-ink leading-snug">
                {value}
            </p>
            {extra && (
                <p className="text-sm font-medium text-ink/70 mt-0.5">{extra}</p>
            )}
        </div>
    );
}

function VisitDaysEditor({
    days,
    arrivee,
    depart,
    disabled,
    onAdd,
    onRemove,
}: {
    days: string[];
    arrivee?: string;
    depart?: string;
    disabled: boolean;
    onAdd: (day: string) => void;
    onRemove: (day: string) => void;
}) {
    const [draft, setDraft] = useState('');
    const min = toIsoDate(arrivee) || undefined;
    const max = toIsoDate(depart) || undefined;
    const sorted = [...days].sort();

    const addDay = () => {
        const day = toIsoDate(draft);
        if (!day || days.includes(day) || disabled) return;
        onAdd(day);
        setDraft('');
    };

    return (
        <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ink/70 mb-2">
                Ajouter le jour exact de la visite
            </p>
            {sorted.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {sorted.map((day) => (
                        <span
                            key={day}
                            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-full font-bold text-sm"
                        >
                            {formatLongDate(day)}
                            <button
                                type="button"
                                onClick={() => onRemove(day)}
                                disabled={disabled}
                                className="text-emerald-800 hover:text-red-600 disabled:opacity-50"
                                title="Retirer ce jour"
                            >
                                <X size={16} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="date"
                    value={draft}
                    min={min}
                    max={max}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={disabled}
                    className="border-2 border-ink/15 rounded-xl px-3 py-2 text-base font-medium text-ink w-full sm:w-auto"
                />
                <button
                    type="button"
                    onClick={addDay}
                    disabled={disabled || !draft}
                    className="inline-flex items-center justify-center gap-2 bg-ink text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50"
                >
                    <Plus size={16} />
                    Ajouter ce jour
                </button>
            </div>
        </div>
    );
}

function PriceBox({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`rounded-xl p-3 ${
                highlight ? 'bg-emerald-100' : 'bg-ink/5'
            }`}
        >
            <p className="text-xs font-bold uppercase text-ink/60">{label}</p>
            <p className="text-xl font-extrabold text-ink">{value}</p>
        </div>
    );
}

function DetailBox({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="bg-white p-4 rounded-xl border-2 border-ink/10">
            <h4 className="font-bold text-ink mb-1">{title}</h4>
            <p className="text-base font-medium text-ink whitespace-pre-wrap wrap-break-word">
                {children}
            </p>
        </div>
    );
}

function PrefBox({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-ink/5 p-3 rounded-xl">
            <p className="text-sm font-semibold text-ink/70">{label}</p>
            <p className="text-2xl font-extrabold text-ink">{value || '—'}/5</p>
        </div>
    );
}
