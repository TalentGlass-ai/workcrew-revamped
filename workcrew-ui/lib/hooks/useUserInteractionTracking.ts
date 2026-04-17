import { useCallback } from 'react'

interface UserInteraction {
  candidateId?: string
  jobId?: string
  action: 'view' | 'apply' | 'save' | 'unsave' | 'share' | 'contact' | 'recommend'
  metadata?: Record<string, any>
  timestamp?: Date
}

export const useUserInteractionTracking = () => {
  const trackInteraction = useCallback(async (interaction: UserInteraction) => {
    try {
      // Send to analytics API
      const response = await fetch('/api/analytics/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...interaction,
          timestamp: interaction.timestamp || new Date(),
          sessionId: getSessionId(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      })

      if (!response.ok) {
        console.warn('Failed to track interaction:', response.statusText)
      }
    } catch (error) {
      console.warn('Error tracking interaction:', error)
      // Don't throw - tracking failures shouldn't break the UI
    }
  }, [])

  return { trackInteraction }
}

// Helper to get or create session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('workcrew_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('workcrew_session_id', sessionId)
  }
  return sessionId
}

// Specific tracking functions for common actions
export const useJobInteractions = () => {
  const { trackInteraction } = useUserInteractionTracking()

  const trackJobView = useCallback((jobId: string, candidateId?: string) => {
    trackInteraction({
      jobId,
      candidateId,
      action: 'view',
      metadata: { source: 'job_card' }
    })
  }, [trackInteraction])

  const trackJobApply = useCallback((jobId: string, candidateId: string) => {
    trackInteraction({
      jobId,
      candidateId,
      action: 'apply',
      metadata: { source: 'apply_button' }
    })
  }, [trackInteraction])

  const trackJobSave = useCallback((jobId: string, candidateId: string, saved: boolean) => {
    trackInteraction({
      jobId,
      candidateId,
      action: saved ? 'save' : 'unsave',
      metadata: { source: 'save_button' }
    })
  }, [trackInteraction])

  const trackJobShare = useCallback((jobId: string, candidateId?: string) => {
    trackInteraction({
      jobId,
      candidateId,
      action: 'share',
      metadata: { source: 'share_button' }
    })
  }, [trackInteraction])

  return {
    trackJobView,
    trackJobApply,
    trackJobSave,
    trackJobShare,
  }
}

export const useCandidateInteractions = () => {
  const { trackInteraction } = useUserInteractionTracking()

  const trackCandidateView = useCallback((candidateId: string, jobId?: string) => {
    trackInteraction({
      candidateId,
      jobId,
      action: 'view',
      metadata: { source: 'candidate_card' }
    })
  }, [trackInteraction])

  const trackCandidateContact = useCallback((candidateId: string, jobId: string) => {
    trackInteraction({
      candidateId,
      jobId,
      action: 'contact',
      metadata: { source: 'contact_button' }
    })
  }, [trackInteraction])

  const trackCandidateRecommend = useCallback((candidateId: string, jobId: string) => {
    trackInteraction({
      candidateId,
      jobId,
      action: 'recommend',
      metadata: { source: 'recommend_button' }
    })
  }, [trackInteraction])

  return {
    trackCandidateView,
    trackCandidateContact,
    trackCandidateRecommend,
  }
}