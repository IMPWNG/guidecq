'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
    CalendarDays,
    CheckCircle2,
    ChevronDown,
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
type FilterType = 'tous' | 'a_venir' | 'en_visite' | 'termines' | 'annules';

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

export default function AdminChongqing() {
    const [requests, setRequests] = useState<TourRequest[]>([]);
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

        if (fetchError) {
            setError(`Erreur: ${fetchError.message}`);
            setRequests([]);
            return;
        }

        setRequests(data || []);
        setError(null);
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
                        ? '\n\nSi Supabase refuse cette valeur, ajoute « termine » aux statuts autorisés de la colonne status.'
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
    };

    const enriched = useMemo(() => {
        return requests.map((request) => {
            const headcount = getHeadcount(request);
            const pricing = getPricing(headcount.count);
            const phase = getTourPhase(request);
            return { request, headcount, pricing, phase };
        });
    }, [requests]);

    const stats = useMemo(() => {
        const active = enriched.filter((item) => item.phase !== 'cancelled');
        const upcoming = active.filter((item) => item.phase === 'upcoming');
        const ongoing = active.filter((item) => item.phase === 'ongoing');
        const finished = active.filter((item) => item.phase === 'finished');

        const sumPeople = (items: typeof active) =>
            items.reduce((acc, item) => acc + item.headcount.count, 0);
        const sumTotal = (items: typeof active) =>
            items.reduce((acc, item) => acc + item.pricing.total, 0);
        const sumDeposit = (items: typeof active) =>
            items.reduce((acc, item) => acc + item.pricing.deposit, 0);

        return {
            reservations: active.length,
            peopleUpcoming: sumPeople(upcoming),
            toursUpcoming: upcoming.length,
            peopleOngoing: sumPeople(ongoing),
            toursOngoing: ongoing.length,
            peopleFinished: sumPeople(finished),
            toursFinished: finished.length,
            total: sumTotal(active),
            deposit: sumDeposit(active),
            remaining: sumTotal(active) - sumDeposit(active),
        };
    }, [enriched]);

    const filtered = useMemo(() => {
        const list = enriched.filter((item) => {
            if (filter === 'a_venir') return item.phase === 'upcoming';
            if (filter === 'en_visite') return item.phase === 'ongoing';
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
            'Acompte 25% €',
            'Solde €',
            'Date Soumission',
        ];

        const rows = enriched.map(({ request, headcount, pricing, phase }) => [
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
            pricing.deposit,
            pricing.remaining,
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
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-2">
                        Admin Chongqing
                    </h1>
                    <p className="text-ink/80 text-base sm:text-lg font-medium">
                        {stats.reservations} réservation{stats.reservations > 1 ? 's' : ''} active
                        {stats.reservations > 1 ? 's' : ''} · {UNIT_PRICE} € / personne · acompte{' '}
                        {DEPOSIT_RATE * 100} %
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-lg">
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <StatCard
                        label="Personnes à venir"
                        value={stats.peopleUpcoming}
                        hint={`${stats.toursUpcoming} tour${stats.toursUpcoming > 1 ? 's' : ''}`}
                        tone="sky"
                    />
                    <StatCard
                        label="En visite maintenant"
                        value={stats.peopleOngoing}
                        hint={`${stats.toursOngoing} tour${stats.toursOngoing > 1 ? 's' : ''}`}
                        tone="green"
                    />
                    <StatCard
                        label="Visites déjà faites"
                        value={stats.peopleFinished}
                        hint={`${stats.toursFinished} tour${stats.toursFinished > 1 ? 's' : ''} fini${stats.toursFinished > 1 ? 's' : ''}`}
                        tone="slate"
                    />
                    <StatCard
                        label="Total à encaisser"
                        value={formatEuro(stats.total)}
                        hint="Hors annulations"
                        tone="orange"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                    <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-amber-800 mb-1">
                            Acomptes 25 %
                        </p>
                        <p className="text-3xl sm:text-4xl font-extrabold text-amber-900">
                            {formatEuro(stats.deposit)}
                        </p>
                        <p className="text-sm text-ink/70 mt-1">
                            Montant d&apos;acompte attendu sur les tours actifs
                        </p>
                    </div>
                    <div className="bg-white border-2 border-emerald-300 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800 mb-1">
                            Soldes restants 75 %
                        </p>
                        <p className="text-3xl sm:text-4xl font-extrabold text-emerald-900">
                            {formatEuro(stats.remaining)}
                        </p>
                        <p className="text-sm text-ink/70 mt-1">
                            Reste à encaisser après les acomptes
                        </p>
                    </div>
                </div>

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
                        {filtered.map(({ request, headcount, pricing, phase }) => {
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
                                                    emphasize
                                                />
                                                <InfoChip
                                                    icon={<CheckCircle2 size={18} />}
                                                    label="Acompte / solde"
                                                    value={formatEuro(pricing.deposit)}
                                                    extra={`Reste ${formatEuro(pricing.remaining)}`}
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
                                                    Tarif automatique
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <PriceBox
                                                        label="Personnes"
                                                        value={`${headcount.count}`}
                                                    />
                                                    <PriceBox
                                                        label="Prix unitaire"
                                                        value={formatEuro(UNIT_PRICE)}
                                                    />
                                                    <PriceBox
                                                        label="Total"
                                                        value={formatEuro(pricing.total)}
                                                        highlight
                                                    />
                                                    <PriceBox
                                                        label="Acompte 25 %"
                                                        value={formatEuro(pricing.deposit)}
                                                    />
                                                </div>
                                                <p className="mt-3 text-base font-semibold text-ink">
                                                    Solde restant : {formatEuro(pricing.remaining)}
                                                </p>
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

function StatCard({
    label,
    value,
    hint,
    tone,
}: {
    label: string;
    value: string | number;
    hint: string;
    tone: 'sky' | 'green' | 'slate' | 'orange';
}) {
    const tones = {
        sky: 'border-blue-400 text-blue-900',
        green: 'border-bamboo text-green-900',
        slate: 'border-slate-400 text-slate-900',
        orange: 'border-apricot text-orange-900',
    };

    return (
        <div className={`bg-white border-2 rounded-2xl p-4 sm:p-5 shadow-sm ${tones[tone]}`}>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-ink/70 mb-1">
                {label}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold leading-tight">{value}</p>
            <p className="text-sm font-medium text-ink/70 mt-1">{hint}</p>
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
