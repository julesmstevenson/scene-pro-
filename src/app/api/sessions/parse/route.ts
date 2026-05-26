export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ sessions: [] })

    const today = new Date().toISOString().split('T')[0]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        system: `Tu extrais des dates et horaires de séances de spectacle depuis un texte libre.
Retourne UNIQUEMENT un objet JSON valide, sans aucun texte autour :
{"sessions":[{"date":"YYYY-MM-DD","time":"HH:MM"},...]}

Règles :
- Pour les séances récurrentes sans plage précise (ex: "tous les lundis à 19h"), génère les occurrences pour les 3 prochains mois à partir d'aujourd'hui.
- Si l'heure n'est pas précisée, utilise "20:30" par défaut.
- Convertis les heures françaises : "20h30" → "20:30", "19h" → "19:00".
- Trie par date croissante.
- N'inclus pas les doublons.
- Date du jour : ${today}`,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      console.error('[parse-sessions] Anthropic HTTP error:', response.status, await response.text())
      return NextResponse.json({ error: 'Erreur IA' }, { status: 502 })
    }

    const aiData  = await response.json()
    const raw     = aiData.content?.[0]?.text ?? ''
    const match   = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ sessions: [] })

    const parsed  = JSON.parse(match[0])
    return NextResponse.json({ sessions: parsed.sessions ?? [] })
  } catch (err) {
    console.error('[POST /api/sessions/parse]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
