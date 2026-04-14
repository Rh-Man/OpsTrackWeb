'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Send } from 'lucide-react'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setError('')
    setIsLoading(true)

    try {
      await onSubmit(content)
      setContent('')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du commentaire')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Textarea
            placeholder="Écrivez votre commentaire ici..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            rows={4}
            className="resize-none text-base"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {content.length} caractères
            </p>
            <Button 
              type="submit" 
              disabled={isLoading || !content.trim()}
              className="gradient-primary shadow-lg hover:shadow-glow transition-all"
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Envoi...' : 'Publier'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
