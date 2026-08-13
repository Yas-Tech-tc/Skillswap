'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SessionPage() {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('sessions')
        .select('*, skills(title)')
        .eq('id', id)
        .single()

      if (error || !data) {
        setLoading(false)
        return
      }

      if (data.teacher_id !== user.id && data.learner_id !== user.id) {
        router.push('/requests')
        return
      }

      setSession(data)
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return <p className="p-8 text-textsub">Chargement...</p>
  if (!session) return <p className="p-8 text-textsub">Session introuvable.</p>

  const roomName = `skillswap-session-${session.id}`
  const jitsiUrl = `https://meet.jit.si/${roomName}`

  return (
    <main className="min-h-screen bg-bgsoft px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-textmain mb-2">{session.skills?.title}</h1>
        <p className="text-sm text-textsub mb-6">
          Statut: {session.status} · Mode: {session.mode}
          {session.scheduled_at && ` · Prévu le ${new Date(session.scheduled_at).toLocaleString('fr-FR')}`}
        </p>

        {session.mode === 'online' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-[600px] border-0"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-textmain">Cette session est en présentiel. Mettez-vous d'accord sur le lieu via le chat.</p>
          </div>
        )}
      </div>
    </main>
  )
}