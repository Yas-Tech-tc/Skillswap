'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [locating, setLocating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setBio(profile.bio || '')
        setCity(profile.city || '')
      }
    }
    loadUser()
  }, [router])

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setMessage("La géolocalisation n'est pas supportée par votre navigateur.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('profiles').update({ latitude, longitude }).eq('id', user.id)
        setLocating(false)
        setMessage('Position enregistrée ✅')
      },
      () => {
        setLocating(false)
        setMessage("Impossible d'obtenir votre position.")
      }
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    let avatar_url = undefined

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        setMessage("Erreur lors de l'upload de l'avatar: " + uploadError.message)
        setSaving(false)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      avatar_url = data.publicUrl
    }

    const updates = { full_name: fullName, bio, city }
    if (avatar_url) updates.avatar_url = avatar_url

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    setSaving(false)
    setMessage(error ? 'Erreur: ' + error.message : 'Profil enregistré ✅')
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-bgsoft flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-textmain mb-6">Mon profil</h1>
        {message && <p className="text-sm mb-4 text-primary">{message}</p>}

        <label className="block text-sm text-textsub mb-1">Nom complet</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        <label className="block text-sm text-textsub mb-1">Ville</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-2"
        />

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="text-sm text-primary hover:underline mb-4 block"
        >
          {locating ? 'Localisation...' : '📍 Utiliser ma position actuelle'}
        </button>

        <label className="block text-sm text-textsub mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
          rows={3}
        />

        <label className="block text-sm text-textsub mb-1">Photo de profil</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files[0])}
          className="w-full mb-6"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </main>
  )
}