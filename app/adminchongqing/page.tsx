'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, Download, Trash2 } from 'lucide-react';

interface Participant {
    prenom: string;
    nom?: string;
    age: number;
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
    participants: Participant[];
    langues: string[];
    option_voiture_privee: boolean;
    created_at: string;
}

export default function AdminChongqing() {
    const [requests, setRequests] = useState<TourRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                console.log('🔄 Tentative de connexion à Supabase...');
                console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

                const { data, error } = await supabase
                    .from('tour_requests')
                    .select('*')
                    .order('created_at', { ascending: false });

                console.log('📊 Réponse Supabase:', { data, error });

                if (error) {
                    console.error('❌ Erreur Supabase:', error);
                    setError(`Erreur: ${error.message}`);
                    setRequests([]);
                } else {
                    console.log('✅ Données reçues:', data);
                    setRequests(data || []);
                    setError(null);
                }
            } catch (err) {
                console.error('❌ Erreur:', err);
                setError(`Erreur: ${String(err)}`);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const deleteRequest = async (id: string) => {
        if (!confirm('Sûr de vouloir supprimer ?')) return;

        const { error } = await supabase
            .from('tour_requests')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erreur: ' + error.message);
            return;
        }

        setRequests(requests.filter((r) => r.id !== id));
    };

    const downloadCSV = () => {
        if (requests.length === 0) return;

        const headers = [
            'ID',
            'Prénom',
            'Nom',
            'Email',
            'Téléphone',
            'Arrivée',
            'Départ',
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
            'Nb Personnes',
            'Date Soumission',
        ];

        const rows = requests.map((r) => [
            r.id,
            r.prenom,
            r.nom,
            r.email,
            r.telephone,
            r.date_arrivee,
            r.date_depart,
            r.hebergement || '-',
            r.mobilite || '-',
            r.transport_prefere || '-',
            r.rythme || '-',
            r.restrictions || '-',
            Array.isArray(r.langues) ? r.langues.join('; ') : r.langues || '-',
            r.option_voiture_privee ? 'Oui' : 'Non',
            r.deja_visite_chine ? 'Oui' : 'Non',
            r.excursions_interet ? 'Oui' : 'Non',
            r.pref_nature || '-',
            r.pref_ville || '-',
            r.pref_histoire || '-',
            r.pref_gastronomie || '-',
            r.pref_insolite || '-',
            r.pref_photo || '-',
            r.participants?.length || 0,
            new Date(r.created_at).toLocaleDateString('fr-FR'),
        ]);

        const csv =
            [headers, ...rows]
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
            const { data, error } = await supabase
                .from('tour_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erreur:', error);
                setError(`Erreur: ${error.message}`);
                setRequests([]);
            } else {
                setRequests(data || []);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError(`Erreur: ${String(err)}`);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
                <div className="text-xl font-semibold text-orange-600">
                    ⏳ Chargement...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-orange-900 mb-2">
                        🏔️ Admin Chongqing
                    </h1>
                    <p className="text-orange-700 text-lg">
                        {requests.length} réservation{requests.length > 1 ? 's' : ''} au total
                    </p>
                </div>

                {/* Affiche les erreurs */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                        <p className="font-semibold">❌ {error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <button
                        onClick={downloadCSV}
                        disabled={requests.length === 0}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={20} />
                        Télécharger CSV
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                        🔄 Actualiser
                    </button>
                </div>

                {/* Réservations */}
                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md">
                        <p className="text-gray-500 text-lg">
                            Aucune réservation pour le moment
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-orange-500 overflow-hidden"
                            >
                                {/* Header de la carte */}
                                <div
                                    onClick={() =>
                                        setExpandedId(expandedId === request.id ? null : request.id)
                                    }
                                    className="p-6 cursor-pointer hover:bg-orange-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start md:items-center gap-4 flex-wrap md:flex-nowrap">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-800 break-words">
                                                {request.prenom} {request.nom}
                                            </h3>
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                                <span>📧 {request.email}</span>
                                                <span>📱 {request.telephone}</span>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    👥 {request.participants?.length || 0} pers.
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right whitespace-nowrap">
                                                <p className="text-xs text-gray-500">Soumis le</p>
                                                <p className="font-semibold text-orange-600 text-sm">
                                                    {new Date(request.created_at).toLocaleDateString(
                                                        'fr-FR'
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteRequest(request.id);
                                                }}
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500 flex-shrink-0"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            <ChevronDown
                                                size={24}
                                                className={`text-orange-500 transition-transform flex-shrink-0 \${expandedId === request.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contenu expandable */}
                                {expandedId === request.id && (
                                    <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 space-y-6">

                                        {/* ===== INFOS PERSONNELLES ===== */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 mb-2">👤 Nom Complet</h4>
                                                <p className="text-gray-700">{request.prenom} {request.nom}</p>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 mb-2">📧 Email</h4>
                                                <p className="text-gray-700 break-all">{request.email}</p>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 mb-2">📱 Téléphone</h4>
                                                <p className="text-gray-700">{request.telephone}</p>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 mb-2">📅 Date Création</h4>
                                                <p className="text-gray-700">
                                                    {new Date(request.created_at).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ===== DATES & HÉBERGEMENT ===== */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-green-900 mb-2">🛫 Date Arrivée</h4>
                                                <p className="text-gray-700">
                                                    {new Date(request.date_arrivee).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-green-900 mb-2">🛬 Date Départ</h4>
                                                <p className="text-gray-700">
                                                    {new Date(request.date_depart).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-green-900 mb-2">🏨 Type Hébergement</h4>
                                                <p className="text-gray-700 font-medium">{request.hebergement || '—'}</p>
                                            </div>
                                        </div>

                                        {/* ===== DURÉE & MOBILITÉ ===== */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-purple-900 mb-2">⏱️ Durée du séjour</h4>
                                                <p className="text-gray-700 font-semibold text-lg">
                                                    {Math.ceil((new Date(request.date_depart).getTime() - new Date(request.date_arrivee).getTime()) / (1000 * 60 * 60 * 24))} jours
                                                </p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-purple-900 mb-2">♿ Mobilité</h4>
                                                <p className="text-gray-700 capitalize font-medium">{request.mobilite || '—'}</p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-purple-900 mb-2">🚗 Voiture Privée</h4>
                                                <p className="text-gray-700 font-semibold">{request.option_voiture_privee ? '✅ Oui' : '❌ Non'}</p>
                                            </div>
                                        </div>

                                        {/* ===== PARTICIPANTS ===== */}
                                        {Array.isArray(request.participants) && request.participants.length > 0 && (
                                            <div className="bg-pink-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-pink-900 mb-4">👥 Participants ({request.participants.length})</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {request.participants.map((p, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded border-l-4 border-pink-400">
                                                            <p className="font-semibold text-gray-800">{p.prenom} {p.nom || ''}</p>
                                                            <p className="text-sm text-gray-600">🎂 {p.age} ans</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ===== LANGUES ===== */}
                                        {Array.isArray(request.langues) && request.langues.length > 0 && (
                                            <div className="bg-indigo-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-indigo-900 mb-3">🗣️ Langues Parlées</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {request.langues.map((l, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                                                        >
                                                            {l}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ===== RESTRICTIONS ALIMENTAIRES ===== */}
                                        {request.restrictions && (
                                            <div className="bg-red-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-red-900 mb-3">🚫 Restrictions Alimentaires</h4>
                                                <p className="text-gray-700 whitespace-pre-wrap">{request.restrictions}</p>
                                            </div>
                                        )}

                                        {/* ===== TRANSPORT & RYTHME ===== */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-teal-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-teal-900 mb-2">🚌 Transport Préféré</h4>
                                                <p className="text-gray-700 capitalize font-medium">{request.transport_prefere || '—'}</p>
                                            </div>
                                            <div className="bg-teal-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-teal-900 mb-2">⏰ Rythme de Visite</h4>
                                                <p className="text-gray-700 capitalize font-medium">{request.rythme || '—'}</p>
                                            </div>
                                        </div>

                                        {/* ===== PRÉFÉRENCES (1-5) ===== */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-gray-800 mb-4">⭐ Préférences d&apos;Activités (échelle 1-5)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                    <p className="text-sm font-medium text-gray-700">🌲 Nature</p>
                                                    <p className="text-2xl font-bold text-blue-600">{request.pref_nature || '—'}/5</p>
                                                </div>
                                                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                    <p className="text-sm font-medium text-gray-700">🏙️ Ville</p>
                                                    <p className="text-2xl font-bold text-blue-600">{request.pref_ville || '—'}/5</p>
                                                </div>
                                                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                    <p className="text-sm font-medium text-gray-700">🏛️ Histoire</p>
                                                    <p className="text-2xl font-bold text-blue-600">{request.pref_histoire || '—'}/5</p>
                                                </div>
                                                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                    <p className="text-sm font-medium text-gray-700">🍽️ Gastronomie</p>
                                                    <p className="text-2xl font-bold text-blue-600">{request.pref_gastronomie || '—'}/5</p>
                                                </div>
                                                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                    <p className="text-sm font-medium text-gray-700">✨ Insolite</p>
                                                    <p className="text-2xl font-bold text-blue-600">{request.pref_insolite || '—'}/5</p>
                                                </div>
                                                <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                    <p className="text-sm font-medium text-gray-700">📸 Photo</p>
                                                    <p className="text-2xl font-bold text-blue-600">{request.pref_photo || '—'}/5</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ===== EXPÉRIENCE CHINE ===== */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-orange-900 mb-2">🇨🇳 Déjà visité la Chine ?</h4>
                                                <p className="text-gray-700 font-semibold text-lg">
                                                    {request.deja_visite_chine ? '✅ Oui' : '❌ Non'}
                                                </p>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-orange-900 mb-2">🧗 Intérêt pour Excursions</h4>
                                                <p className="text-gray-700 font-semibold text-lg">
                                                    {request.excursions_interet ? '✅ Oui' : '❌ Non'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* ===== COMMENTAIRES ===== */}
                                        {request.commentaires && (
                                            <div className="bg-lime-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-lime-900 mb-3">💬 Commentaires & Notes</h4>
                                                <p className="text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border-l-4 border-lime-400">
                                                    {request.commentaires}
                                                </p>
                                            </div>
                                        )}

                                        {/* ===== ID UNIQUE ===== */}
                                        <div className="bg-gray-100 p-3 rounded-lg text-center">
                                            <p className="text-xs text-gray-600 mb-1">ID de la réservation</p>
                                            <p className="font-mono text-sm text-gray-800 break-all">{request.id}</p>
                                        </div>

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}