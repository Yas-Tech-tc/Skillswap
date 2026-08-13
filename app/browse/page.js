'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Browse() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    const loadSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*, profiles(id, full_name, city, latitude, longitude, avatar_url)')
        .eq('type', 'offer')
        .order('created_at', { ascending: false })

      if (!error) setSkills(data || [])
      setLoading(false)
    }
    loadSkills()
  }, [])

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstance.current) return
      if (mapRef.current._leaflet_id) return

      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      const map = L.map(mapRef.current).setView([36.75, 3.06], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)
      mapInstance.current = map
    }
    initMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  useEffect(() => {
    const addMarkers = async () => {
      if (!mapInstance.current) return
      const L = (await import('leaflet')).default

      skills.forEach((skill) => {
        const p = skill.profiles
        if (p?.latitude && p?.longitude) {
          L.marker([p.latitude, p.longitude])
            .addTo(mapInstance.current)
            .bindPopup(`<b>${skill.title}</b><br/>${p.full_name || 'Utilisateur'} · ${p.city || ''}`)
        }
      })
    }
    if (skills.length > 0) addMarkers()
  }, [skills])

  const filtered = categoryFilter
    ? skills.filter((s) => s.category?.toLowerCase().includes(categoryFilter.toLowerCase()))
    : skills

  return (
    <main className="min-h-screen bg-bgsoft px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-textmain mb-4">Découvrir des compétences</h1>

        <input
          type="text"
          placeholder="Filtrer par catégorie..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-6 bg-white"
        />

        <div ref={mapRef} className="w-full h-80 rounded-xl mb-8 z-0" />

        {loading && <p className="text-textsub">Chargement...</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </main>
  )
}

function SkillCard({ skill }) {
  const [requesting, setRequesting] = useState(false)
  const [mode, setMode] = useState(skill.mode === 'both' ? 'online' : skill.mode)
  const [status, setStatus] = useState('')

  const handleRequest = async () => {
    setRequesting(true)
    setStatus('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setStatus('Connectez-vous pour demander un échange.')
      setRequesting(false)
      return
    }
    const { error } = await supabase.from('sessions').insert({
      teacher_id: skill.user_id,
      learner_id: user.id,
      skill_id: skill.id,
      mode,
      status: 'requested',
    })
    setRequesting(false)
    setStatus(error ? 'Erreur: ' + error.message : 'Demande envoyée ✅')
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="font-semibold text-textmain">{skill.title}</h2>
      <p className="text-sm text-textsub mb-1">{skill.category} · {skill.mode}</p>
      <p className="text-sm text-textmain mb-2">{skill.description}</p>
      <p className="text-xs text-textsub mb-3">
        Par {skill.profiles?.full_name || 'Utilisateur'} · {skill.profiles?.city || 'Localisation inconnue'}
      </p>

      {skill.mode === 'both' && (
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="border rounded-lg px-2 py-1 text-sm mb-2">
          <option value="online">En ligne</option>
          <option value="in_person">Présentiel</option>
        </select>
      )}

      <button
        onClick={handleRequest}
        disabled={requesting}
        className="block w-full bg-primary text-white text-sm py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        {requesting ? 'Envoi...' : "Demander un échange"}
      </button>
      {status && <p className="text-xs mt-2 text-textsub">{status}</p>}
    </div>
  )
}