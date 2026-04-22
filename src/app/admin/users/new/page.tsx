'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { adminApi } from '@/lib/api/admin'
import { AlertCircle, UserPlus, CheckCircle } from 'lucide-react'

export default function NewUserPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'supervisor' | 'agent'>('agent')
  const [success, setSuccess] = useState(false)
  const [createdEmail, setCreatedEmail] = useState('')

  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setCreatedEmail(user.email)
      setSuccess(true)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createUserMutation.mutate({ email, name, role })
  }

  if (success) {
    return (
      <ProtectedLayout>
        <div className="max-w-lg mx-auto">
          <Card className="border-2 shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Compte créé !</h2>
              <p className="text-muted-foreground mb-2">
                Les accès ont été envoyés à
              </p>
              <p className="font-semibold text-gray-900 mb-6">{createdEmail}</p>
              <p className="text-sm text-muted-foreground mb-8 bg-cyan-50 p-3 rounded-lg">
                L'utilisateur recevra un email avec son mot de passe temporaire. Il devra le changer à sa première connexion.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setSuccess(false); setName(''); setEmail(''); }} variant="outline">
                  Créer un autre
                </Button>
                <Button onClick={() => router.push('/admin/users')} className="gradient-primary">
                  Voir la liste
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-lg">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Créer un utilisateur</h1>
          <p className="text-gray-600 mt-2">Les accès seront envoyés par email automatiquement</p>
        </div>

        <Card className="border-2 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Informations du compte</h2>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {createUserMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{(createUserMutation.error as Error).message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Ex: Abdou Ndiaye"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={createUserMutation.isPending}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@opstrack.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={createUserMutation.isPending}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'supervisor' | 'agent')}
                  disabled={createUserMutation.isPending}
                  className="h-11"
                >
                  <option value="supervisor">Superviseur — Peut assigner des tickets aux agents</option>
                  <option value="agent">Agent — Traite les tickets assignés</option>
                </Select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>📧 Email automatique :</strong> Un mot de passe temporaire sera généré et envoyé à l'adresse email renseignée. L'utilisateur devra le changer à sa première connexion.
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 h-11 gradient-primary shadow-lg"
                >
                  {createUserMutation.isPending ? 'Création en cours...' : 'Créer et envoyer les accès'}
                </Button>
                <Link href="/admin/users" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-11" disabled={createUserMutation.isPending}>
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
