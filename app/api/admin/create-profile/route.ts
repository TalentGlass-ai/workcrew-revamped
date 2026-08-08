// PATH: app/api/admin/create-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getPrisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  const prisma = await getPrisma();
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin/recruiter
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    });

    if (!user || !['ADMIN', 'RECRUITER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const profileData = await request.json();

    // Validate required fields
    const { name, email, phone, location, summary, experience, education, skills } = profileData;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if user with this email already exists and has a candidate profile
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { candidate: true }
    });

    if (existingUser?.candidate) {
      return NextResponse.json({
        error: 'A candidate profile with this email already exists'
      }, { status: 409 });
    }

    // If user exists but no candidate profile, use that user. Otherwise create new user.
    let userId = existingUser?.id;

    if (!userId) {
      // Create user first
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          role: 'candidate',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      userId = newUser.id;
    }

    // Create candidate profile
    const candidate = await prisma.candidate.create({
      data: {
        userId,
        profileSummary: summary || null,
        location: location || null,
        portfolioUrl: profileData.portfolioUrl || null,
        linkedinUrl: profileData.linkedinUrl || null,
        githubUrl: profileData.githubUrl || null,
        primarySkills: [],
        skillClusters: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Add experience
    if (experience && Array.isArray(experience)) {
      // Note: Experience model doesn't exist in current schema
      // This would need to be added to the database schema
      console.log('Experience data provided but not stored:', experience);
    }

    // Add education
    if (education && Array.isArray(education)) {
      // Note: Education model doesn't exist in current schema
      // This would need to be added to the database schema
      console.log('Education data provided but not stored:', education);
    }

    // Add skills
    if (skills && Array.isArray(skills)) {
      for (const skillName of skills) {
        // Create candidate skill association
        await prisma.candidateSkill.create({
          data: {
            candidateId: candidate.id,
            skillName,
            category: 'technical', // Default category
            score: 7.5 // Default intermediate score
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      candidate: {
        id: candidate.id,
        userId: candidate.userId,
        location: candidate.location,
        profileSummary: candidate.profileSummary
      }
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({
      error: 'Failed to create candidate profile'
    }, { status: 500 });
  }
}