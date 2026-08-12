'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function NewSkill() {
  const [type, setType] = useState('offer')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('both')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('skills').insert({
      user_id: user.id,
      type,
      title,
      category,
      description,
      mode,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/skills')
    }
  }

  return (
    <main className="min-h-screen bg-bgsoft flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-textmain mb-6">Ajouter une compétence</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <label className="block text-sm text-textsub mb-1">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-4">
          <option value="offer">Je peux enseigner</option>
          <option value="request">Je veux apprendre</option>
        </select>

        <label className="block text-sm text-textsub mb-1">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Guitare pour débutants"
          className="w-full border rounded-lg px-4 py-2 mb-4"
          required
        />

        <label className="block text-sm text-textsub mb-1">Catégorie</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ex: Musique, Cuisine, Langues, Code..."
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        <label className="block text-sm text-textsub mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
          rows={3}
        />

        <label className="block text-sm text-textsub mb-1">Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-6">
          <option value="in_person">Présentiel uniquement</option>
          <option value="online">En ligne uniquement</option>
          <option value="both">Les deux</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
    </main>
  )
}