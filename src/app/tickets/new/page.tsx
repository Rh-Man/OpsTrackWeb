'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ticketsApi } from '@/lib/api/tickets'
import { TicketPriority } from '@/types'
import { AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'

export default function NewTicketPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const ticket = await ticketsApi.createTicket({ title, description, priority })
      // Nouveau backend utilise "id" au lieu de "ticketId"
      router.push(`/tickets/${ticket.id}`)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du ticket')
      setIsLoading(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 mb-4 shadow-lg">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau ticket</h1>
          <p className="text-gray-600 mt-2">Décrivez votre incident en détail</p>
        </div>

        <Card className="border-2 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Informations du ticket</h2>
            <p className="text-sm text-gray-600">Remplissez tous les champs pour créer votre ticket</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs font-bold">1</span>
                  Titre du ticket
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Erreur 500 sur la page de connexion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base border-2 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs font-bold">2</span>
                  Description détaillée
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le problème en détail : quand est-il survenu, quelles sont les étapes pour le reproduire, quel est l'impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isLoading}
                  rows={8}
                  className="text-base resize-none border-2 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <p className="text-xs text-gray-500">{description.length} caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs font-bold">3</span>
                  Niveau de priorité
                </Label>
                <Select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  disabled={isLoading}
                  className="h-12 text-base border-2 focus:border-cyan-500 focus:ring-cyan-500"
                >
                  <option value={TicketPriority.LOW}>🟢 Basse - Problème mineur</option>
                  <option value={TicketPriority.MEDIUM}>🟡 Moyenne - Impact modéré</option>
                  <option value={TicketPriority.HIGH}>🟠 Haute - Impact important</option>
                  <option value={TicketPriority.CRITICAL}>🔴 Critique - Service bloqué</option>
                </Select>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Créer le ticket
                    </>
                  )}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
