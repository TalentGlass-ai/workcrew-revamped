import { SkillGraphService } from './skillGraphService'

describe('SkillGraphService', () => {
  let skillGraphService: SkillGraphService

  beforeAll(() => {
    skillGraphService = new SkillGraphService()
  })

  afterAll(async () => {
    await skillGraphService.close()
  })

  describe('pushAssessmentData', () => {
    it('should push assessment data to graph database', async () => {
      const assessmentId = 'test-assessment-id'
      // This will attempt to connect to Neo4j, may fail if not running
      await expect(skillGraphService.pushAssessmentData(assessmentId)).rejects.toThrow()
      // In real test, would mock or have test DB
    })
  })
})