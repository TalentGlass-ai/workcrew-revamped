# WorkCrew.ai - SaaS Job Marketplace Platform

## Project Overview

WorkCrew.ai is a modern SaaS job marketplace platform that connects companies with top talent through AI-powered matching and intelligent insights. Unlike traditional ATS systems, WorkCrew.ai focuses on marketplace dynamics with subscription-based access to premium features.

## Core Features

- **AI-Powered Matching**: Advanced candidate-job matching with skill radar visualization
- **Conversational AI Assistant**: ChatGPT-style guidance for both candidates and recruiters
- **Multi-Tenant Architecture**: Organization-based SaaS with role-based access
- **Region-Aware Payments**: Stripe (Global) + Razorpay (India) integration
- **Usage-Based Billing**: Metered usage for premium features

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Search**: Typesense
- **Payments**: Stripe + Razorpay
- **AI**: OpenAI/Claude integration
- **Deployment**: Docker, Vercel

## Current Milestone: v1.1 Assessment System

**Goal:** Build a cheating-resistant assessment platform with adaptive AI questions, secure sandbox, proctoring signals, and skill intelligence integration

**Target features:**
- Adaptive coding assessment engine with dynamic difficulty
- Secure code execution sandbox (Docker/Firecracker)
- Multi-signal evaluation (correctness, efficiency, behavior)
- Proctoring layer with behavior tracking and risk signals
- Skill intelligence integration with graph database
- Recruiter dashboard with validated skills and risk insights
- Candidate experience with clear monitoring disclosure

## Roadmap

1. **Phase 1**: Core platform MVP (completed)
2. **Phase 2**: AI features and conversational assistant (completed)
3. **Phase 3**: Billing & Subscription System (in progress)
4. **Phase 4**: Advanced analytics and reporting
5. **Phase 5**: Mobile app and API ecosystem