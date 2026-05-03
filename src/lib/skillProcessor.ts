import type { PrismaClient } from '@/lib/types/prisma'
import { SkillGraphService } from './skillGraphService'

export class SkillProcessor {
  private prisma: PrismaClient
  private skillGraphService: SkillGraphService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.skillGraphService = new SkillGraphService()
  }

  async updateSkillsFromAssessment(assessmentId: string): Promise<void> {
    // Get assessment with job, candidate, and answers
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        job: true,
        candidate: true,
        questions: {
          include: {
            answers: true
          }
        }
      }
    })

    if (!assessment || !assessment.job) {
      throw new Error(`Assessment ${assessmentId} not found or not associated with a job`)
    }

    // Extract skills from job's required skills
    const skills = (assessment.job.requiredSkills as string[]) || []

    if (skills.length === 0) {
      return // No skills to update
    }

    // Calculate average score from all answers
    const answers = assessment.questions.flatMap((q: any) => q.answers)
    const validScores = answers.map((a: any) => a.score).filter((score: any) => score !== null && score !== undefined) as number[]

    if (validScores.length === 0) {
      return // No scores to calculate from
    }

    const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length

    // Update or create CandidateSkill records for each skill
    const skillUpdates = skills.map(skillName =>
      this.prisma.candidateSkill.upsert({
        where: {
          candidateId_skillName: {
            candidateId: assessment.candidateId,
            skillName: skillName
          }
        },
        update: {
          score: avgScore,
          isValidated: true,
          validatedAt: new Date(),
          validationSource: 'assessment',
          lastVerifiedAt: new Date()
        },
        create: {
          candidateId: assessment.candidateId,
          skillName: skillName,
          score: avgScore,
          isValidated: true,
          validatedAt: new Date(),
          validationSource: 'assessment',
          lastVerifiedAt: new Date()
        }
      })
    )

    await Promise.all(skillUpdates)

    // Push data to skill graph service
    await this.skillGraphService.pushAssessmentData(assessmentId)
  }
}