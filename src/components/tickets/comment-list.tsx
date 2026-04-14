'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { Comment } from '@/types'
import { formatDate } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center">
          <div className="inline-block p-4 bg-cyan-100 rounded-full mb-3">
            <MessageSquare className="h-8 w-8 text-cyan-600" />
          </div>
          <p className="text-muted-foreground font-medium">Aucun commentaire pour le moment</p>
          <p className="text-sm text-muted-foreground mt-1">Soyez le premier à commenter</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment, index) => (
        <Card key={comment.commentId} className="border-2 hover:border-cyan-200 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {(comment.userName || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-gray-900">
                    {comment.userName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {comment.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
