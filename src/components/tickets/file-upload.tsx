'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import { usePostHog } from 'posthog-js/react'

interface FileUploadProps {
  ticketId: string
  onUploadComplete: () => void
}

export function FileUpload({ ticketId, onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const posthog = usePostHog()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10 MB')
        return
      }
      setSelectedFile(file)
      setError('')
      setSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setError('')
    setSuccess(false)
    setIsUploading(true)

    try {
      const { ticketsApi } = await import('@/lib/api/tickets')
      
      const { uploadUrl } = await ticketsApi.getPresignedUrl(
        ticketId,
        selectedFile.name,
        selectedFile.type
      )

      await ticketsApi.uploadFile(uploadUrl, selectedFile)
      posthog.capture('attachment_uploaded', {
        ticket_id: ticketId,
        file_type: selectedFile.type,
        file_size_kb: Math.round(selectedFile.size / 1024),
      })

      setSuccess(true)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      setTimeout(() => {
        onUploadComplete()
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload du fichier')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setError('')
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Fichier uploadé avec succès !</AlertDescription>
            </Alert>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            
            {!selectedFile ? (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="inline-block p-4 bg-cyan-100 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-cyan-600" />
                </div>
                <p className="text-base font-medium mb-1">Cliquez pour sélectionner un fichier</p>
                <p className="text-sm text-muted-foreground">ou glissez-déposez ici</p>
                <p className="text-xs text-muted-foreground mt-2">Taille max: 10 MB</p>
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <File className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="flex-shrink-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full h-12 gradient-primary shadow-lg hover:shadow-glow transition-all text-base"
            >
              <Upload className="mr-2 h-5 w-5" />
              {isUploading ? 'Upload en cours...' : 'Uploader le fichier'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
