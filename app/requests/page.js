'use client'
import { useState, useEffect } from 'react'
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

  const respond = async (id, status) => {
    await supabase.from('sessions').update({ status }).eq('id', id)
    load()
  }

  if (loading) return <p className="p-8 text-textsub">Chargement...</p>

  return (
    <main className="min-h-screen bg-bgsoft px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-textmain mb-4">Demandes reçues</h1>
          {incoming.length === 0 && <p className="text-textsub">Aucune demande pour le moment.</p>}
          <div className="space-y-3">
            {incoming.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-medium text-textmain">{s.skills?.title}</p>
                  <p className="text-sm text-textsub">
                    Demandé par {s.profiles?.full_name || 'Utilisateur'} · {s.mode} · {s.status}
                  </p>
                </div>
                {s.status === 'requested' && (
                  <div className="flex gap-2">
                    <button onClick={() => respond(s.id, 'accepted')} className="text-primary text-sm hover:underline">Accepter</button>
                    <button onClick={() => respond(s.id, 'declined')} className="text-red-600 text-sm hover:underline">Refuser</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-textmain mb-4">Mes demandes envoyées</h2>
          {outgoing.length === 0 && <p className="text-textsub">Aucune demande envoyée.</p>}
          <div className="space-y-3">
            {outgoing.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm">
                <p className="font-medium text-textmain">{s.skills?.title}</p>
                <p className="text-sm text-textsub">
                  À {s.profiles?.full_name || 'Utilisateur'} · {s.mode} · statut: {s.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}