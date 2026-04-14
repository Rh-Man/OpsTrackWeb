'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authHelpers } from '@/lib/auth/auth-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailFromUrl)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await authHelpers.confirmSignUp({ email, code })
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setError(result.error || 'Code de vérification invalide')
      }
    } catch (err: any) {
      console.error('Erreur de confirmation:', err)
      setError(err.message || 'Code de vérification invalide')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setError('Veuillez entrer votre email')
      return
    }

    setError('')
    setIsResending(true)

    try {
      // TODO: Implement resend code API when backend is ready
      alert('Fonctionnalité de renvoi de code à implémenter dans le backend')
    } catch (err: any) {
      console.error('Erreur de renvoi:', err)
      setError(err.message || 'Impossible de renvoyer le code')
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-sky-50 px-4">
        <Card className="w-full max-w-md border-2 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-green-600">Email vérifié !</CardTitle>
            <CardDescription className="text-base">
              Votre compte est maintenant actif. Redirection vers la connexion...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-sky-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block gradient-primary p-3 rounded-2xl mb-4 shadow-glow">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
            Vérification Email
          </h1>
          <p className="text-muted-foreground mt-2">Confirmez votre adresse email</p>
        </div>

        <Card className="border-2 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Code de vérification</CardTitle>
            <CardDescription>
              Entrez le code à 6 chiffres envoyé à votre email
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || !!emailFromUrl}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">Code de vérification</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={isLoading}
                  className="h-11 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground bg-cyan-50 p-2 rounded">
                  💡 Vérifiez votre boîte de réception et vos spams
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 gradient-primary shadow-lg hover:shadow-glow transition-all" 
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Vérification...' : 'Confirmer mon email'}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleResendCode}
                disabled={isResending || !email}
              >
                {isResending ? 'Envoi en cours...' : 'Renvoyer le code'}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Déjà vérifié ?{' '}
                <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
