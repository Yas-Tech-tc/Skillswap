'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Requests() {
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: inc } = await supabase
      .from('sessions')
      .select('*, skills(title), profiles!sessions_learner_id_fkey(full_name)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    const { data: out } = await supabase
      .from('sessions')
      .select('*, skills(title), profiles!sessions_teacher_id_fkey(full_name)')
      .eq('learner_id', user.id)
      .order('created_at', { ascending: false })

    setIncoming(inc || [])
    setOutgoing(out || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <p className="p-8 text-textsub">Chargement...</p>

  return (
    <main className="min-h-screen bg-bgsoft px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-textmain mb-4">Demandes reçues</h1>
          {incoming.length === 0 && <p className="text-textsub">Aucune demande pour le moment.</p>}
          <div className="space-y-3">
            {incoming.map((s) => (
              <SessionRow key={s.id} session={s} otherName={s.profiles?.full_name} onUpdate={load} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-textmain mb-4">Mes demandes envoyées</h2>
          {outgoing.length === 0 && <p className="text-textsub">Aucune demande envoyée.</p>}
          <div className="space-y-3">
            {outgoing.map((s) => (
              <SessionRow key={s.id} session={s} otherName={s.profiles?.full_name} onUpdate={load} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function SessionRow({ session, otherName, onUpdate }) {
  const [scheduledAt, setScheduledAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const respond = async (status) => {
    setBusy(true)
    await supabase.from('sessions').update({ status }).eq('id', session.id)
    setBusy(false)
    onUpdate()
  }

  const confirmSchedule = async () => {
    if (!scheduledAt) return
    setBusy(true)
    setError('')
    const { error } = await supabase
      .from('sessions')
      .update({ scheduled_at: scheduledAt, status: 'scheduled' })
      .eq('id', session.id)
    setBusy(false)
    if (error) setError(error.message)
    onUpdate()
  }

  const markCompleted = async () => {
    setBusy(true)
    setError('')
    const { error } = await supabase.rpc('complete_session', { session_id_input: session.id })
    setBusy(false)
    if (error) setError(error.message)
    onUpdate()
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="mb-2">
        <p className="font-medium text-textmain">{session.skills?.title}</p>
        <p className="text-sm text-textsub">
          {otherName || 'Utilisateur'} · {session.mode} · statut: {session.status}
        </p>
        {session.scheduled_at && (
          <p className="text-xs text-textsub">
            Prévu le {new Date(session.scheduled_at).toLocaleString('fr-FR')}
          </p>
        )}
      </div>

      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}

      {session.status === 'requested' && (
        <div className="flex gap-2">
          <button onClick={() => respond('accepted')} disabled={busy} className="text-primary text-sm hover:underline">Accepter</button>
          <button onClick={() => respond('declined')} disabled={busy} className="text-red-600 text-sm hover:underline">Refuser</button>
        </div>
      )}

      {session.status === 'accepted' && (
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
          />
          <button onClick={confirmSchedule} disabled={busy} className="bg-primary text-white text-sm px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50">
            Confirmer le créneau
          </button>
        </div>
      )}

      {session.status === 'scheduled' && (
        <div className="flex gap-3 items-center flex-wrap">
          {session.mode === 'online' && (
            <Link href={`/session/${session.id}`} className="text-primary text-sm hover:underline">
              Rejoindre l'appel vidéo
            </Link>
          )}
          <button onClick={markCompleted} disabled={busy} className="bg-primary text-white text-sm px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-50">
            Marquer comme terminé
          </button>
        </div>
      )}

      {session.status === 'completed' && (
        <p className="text-xs text-green-700">✅ Session terminée, crédit transféré</p>
      )}
    </div>
  )
}