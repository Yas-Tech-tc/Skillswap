'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function MySkills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadSkills = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setSkills(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const handleDelete = async (id) => {
    await supabase.from('skills').delete().eq('id', id)
    loadSkills()
  }

  if (loading) return <p className="p-8 text-textsub">Chargement...</p>

  return (
    <main className="min-h-screen bg-bgsoft px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-textmain">Mes compétences</h1>
          <Link href="/skills/new" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90">
            + Ajouter
          </Link>
        </div>

        {skills.length === 0 && <p className="text-textsub">Vous n'avez pas encore ajouté de compétence.</p>}

        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${skill.type === 'offer' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                  {skill.type === 'offer' ? "J'enseigne" : "Je veux apprendre"}
                </span>
                <h2 className="font-semibold text-textmain mt-2">{skill.title}</h2>
                <p className="text-sm text-textsub">{skill.category} · {skill.mode}</p>
              </div>
              <button
                onClick={() => handleDelete(skill.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}