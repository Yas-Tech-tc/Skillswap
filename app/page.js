import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-bgsoft flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-textmain mb-4">
        Échangez vos compétences, sans argent
      </h1>
      <p className="text-textsub max-w-xl mb-8">
        Enseignez ce que vous savez, apprenez ce que vous voulez — en présentiel ou en ligne, grâce à un système de crédits horaires.
      </p>
      <div className="flex gap-4">
        <Link href="/signup" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90">
          Commencer
        </Link>
        <Link href="/login" className="border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/5">
          Se connecter
        </Link>
      </div>
    </main>
  )
}