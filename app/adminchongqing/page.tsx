'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, Download, Trash2 } from 'lucide-react';

interface Participant {
    prenom: string;
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
    budget: string;
    restrictions: string[];
    langues: string[];
    preferences: string[];
    participants: Participant[];
    created_at: string;
}

export default function AdminChongqing() {
    const [requests, setRequests] = useState<TourRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // ✅ Mets la logique directement dans useEffect
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data, error } = await supabase
                    .from('tour_requests')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Erreur:', error);
                    setRequests([]);
                } else {
                    setRequests(data || []);
                }
            } catch (err) {
                console.error('Erreur:', err);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []); // ✅ Dépendances vides = s'exécute UNE FOIS au mount

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
            'Budget',
            'Nb Personnes',
            'Restrictions',
            'Langues',
            'Préférences',
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
            r.budget,
            r.participants?.length || 0,
            (r.restrictions || []).join('; '),
            (r.langues || []).join('; '),
            (r.preferences || []).join('; '),
            new Date(r.created_at).toLocaleDateString('fr-FR'),
        ]);

        const csv =
            [headers, ...rows]
                .map((row) => row.map((cell) => `"${cell}"`).join(','))
                .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reservations_chongqing_${Date.now()}.csv`;
        a.click();
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tour_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erreur:', error);
                setRequests([]);
            } else {
                setRequests(data || []);
            }
        } catch (err) {
            console.error('Erreur:', err);
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
                                                className={`text-orange-500 transition-transform flex-shrink-0 ${expandedId === request.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contenu expandable */}
                                {expandedId === request.id && (
                                    <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Dates */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    📅 Dates
                                                </h4>
                                                <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded-lg">
                                                    <p>
                                                        <span className="font-medium">Arrivée:</span>{' '}
                                                        <span className="text-orange-600 font-semibold">
                                                            {request.date_arrivee}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Départ:</span>{' '}
                                                        <span className="text-orange-600 font-semibold">
                                                            {request.date_depart}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Budget & Langues */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3">
                                                    💰 Budget & Langues
                                                </h4>
                                                <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded-lg">
                                                    <p>
                                                        <span className="font-medium">Budget:</span>{' '}
                                                        <span className="bg-green-200 px-3 py-1 rounded text-green-800 font-semibold">
                                                            {request.budget}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Langues:</span>{' '}
                                                        <span className="text-blue-600 font-medium">
                                                            {(request.langues || []).length > 0
                                                                ? (request.langues || []).join(', ')
                                                                : 'Non spécifiées'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Restrictions */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3">
                                                    🚫 Restrictions Alimentaires
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(request.restrictions || []).length > 0 ? (
                                                        (request.restrictions || []).map((r, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                                                            >
                                                                {r}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">
                                                            Aucune restriction
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Préférences */}
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3">
                                                    ⭐ Préférences
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(request.preferences || []).length > 0 ? (
                                                        (request.preferences || []).map((p, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                                                            >
                                                                {p}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">
                                                            Aucune préférence
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Participants */}
                                            {request.participants &&
                                                request.participants.length > 0 && (
                                                    <div className="md:col-span-2">
                                                        <h4 className="font-semibold text-gray-800 mb-3">
                                                            👥 Détail des Participants
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {request.participants.map((p, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="bg-white p-3 rounded-lg text-sm text-gray-700 border-l-2 border-orange-400"
                                                                >
                                                                    <span className="font-bold text-orange-600">
                                                                        {p.prenom}
                                                                    </span>
                                                                    <span className="text-gray-500"> • </span>
                                                                    <span>{p.age} ans</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
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