// lib/services/plan-service.ts
import { prisma } from '@/lib/prisma';
import { Plan } from '@prisma/client';

export interface CreatePlanParams {
  name: string;
  type: string;
  tier: string;
  price: number;
  currency?: string;
  interval?: string;
  features?: any;
  limits?: any;
}

export interface UpdatePlanParams {
  name?: string;
  price?: number;
  features?: any;
  limits?: any;
  isActive?: boolean;
}

export class PlanService {
  /**
   * Create a new plan
   */
  static async createPlan(params: CreatePlanParams): Promise<Plan> {
    return prisma.plan.create({
      data: {
        name: params.name,
        type: params.type,
        tier: params.tier,
        price: params.price,
        currency: params.currency || 'USD',
        interval: params.interval || 'month',
        features: params.features,
        limits: params.limits,
      },
    });
  }

  /**
   * Get all plans
   */
  static async getPlans(type?: string): Promise<Plan[]> {
    return prisma.plan.findMany({
      where: {
        type: type,
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  /**
   * Get plan by ID
   */
  static async getPlanById(id: string): Promise<Plan | null> {
    return prisma.plan.findUnique({
      where: { id },
    });
  }

  /**
   * Update plan
   */
  static async updatePlan(id: string, params: UpdatePlanParams): Promise<Plan> {
    return prisma.plan.update({
      where: { id },
      data: params,
    });
  }

  /**
   * Delete plan (soft delete by setting inactive)
   */
  static async deletePlan(id: string): Promise<Plan> {
    return prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get plan by tier and type
   */
  static async getPlanByTier(type: string, tier: string): Promise<Plan | null> {
    return prisma.plan.findFirst({
      where: {
        type,
        tier,
        isActive: true,
      },
    });
  }
}