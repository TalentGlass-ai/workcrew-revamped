This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Search Engine Setup (Typesense)

This project uses [Typesense](https://typesense.org/) for advanced job search functionality with full-text search, typo tolerance, and intelligent ranking.

### Local Development Setup

1. **Start Typesense Server:**
   ```bash
   docker-compose -f docker-compose.typesense.yml up -d
   ```

2. **Verify Typesense is running:**
   ```bash
   curl http://localhost:8108/health
   ```

3. **Sync data from database to Typesense:**
   ```bash
   npm run sync:typesense
   ```

### Environment Variables

Make sure your `.env` file contains the following Typesense configuration:

```env
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

### Production Deployment

For production, use a managed Typesense service or deploy Typesense on your infrastructure. Update the environment variables accordingly.

### Search API

The search functionality is available via:
- `/api/jobs/search-typesense` - Advanced search with filtering
- `/api/sync-typesense` - Real-time data synchronization webhooks
