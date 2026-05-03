# GCP Deployment Guide for workcrew-revamped

This guide explains how to deploy the Next.js application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** - Create one at [Google Cloud Console](https://console.cloud.google.com)
2. **gcloud CLI** - [Install here](https://cloud.google.com/sdk/docs/install)
3. **Docker** - [Install here](https://docs.docker.com/get-docker/)
4. **Project setup** - Create a GCP project or use existing one

## Step 1: Initial Setup

### Authenticate with Google Cloud
```bash
gcloud auth login
gcloud config set project workcrew-revamped
```

### Enable Required APIs
```bash
gcloud services enable \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    run.googleapis.com
```

## Step 2: Set Up Secrets

Store sensitive environment variables in Google Cloud Secret Manager:

```bash
# Set NEXTAUTH_SECRET
echo -n "your-nextauth-secret-value" | gcloud secrets create nextauth-secret --data-file=-

# Set NEXTAUTH_URL (update with your Cloud Run URL after first deployment)
echo -n "https://workcrew-revamped-xxxxxxxx-uc.a.run.app" | gcloud secrets create nextauth-url --data-file=-

# For other secrets (database URLs, API keys, etc.)
gcloud secrets create database-url --data-file=-  # Paste value and press Ctrl+D
```

## Step 3: Deploy to Cloud Run

### Option A: Using the Deployment Script (Recommended)

```bash
chmod +x scripts/deploy-gcp.sh
./scripts/deploy-gcp.sh
```

### Option B: Using gcloud CLI Directly

```bash
# Build and push to Container Registry
docker build -t gcr.io/workcrew-revamped/workcrew-revamped:latest .
docker push gcr.io/workcrew-revamped/workcrew-revamped:latest

# Deploy to Cloud Run
gcloud run deploy workcrew-revamped \
    --image gcr.io/workcrew-revamped/workcrew-revamped:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 3600 \
    --port 3000 \
    --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" \
    --update-secrets "NEXTAUTH_SECRET=nextauth-secret:latest,NEXTAUTH_URL=nextauth-url:latest"
```

### Option C: Using Cloud Build (CI/CD)

```bash
gcloud builds submit \
    --config cloudbuild.yaml \
    --substitutions _REGION=us-central1,_SERVICE_NAME=workcrew-revamped
```

## Step 4: Configure Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run service
gcloud run services update-traffic workcrew-revamped \
    --region us-central1 \
    --to-revisions LATEST=100

# Set up custom domain
gcloud run domain-mappings create --service=workcrew-revamped \
    --domain=yourdomain.com \
    --region us-central1
```

## Monitoring & Logs

### View Service Status
```bash
gcloud run services describe workcrew-revamped --region us-central1
```

### Stream Logs
```bash
gcloud run services logs read workcrew-revamped --region us-central1 --limit 100 --follow
```

### View Metrics
```bash
# In Google Cloud Console:
# Cloud Run > workcrew-revamped > Metrics tab
```

## Updating the Application

When you push changes to the repository:

```bash
# If using automatic CI/CD with Cloud Build
git push origin main

# If deploying manually
./scripts/deploy-gcp.sh
```

## Troubleshooting

### Build Fails with Memory Error
Increase build machine type in `cloudbuild.yaml`:
```yaml
options:
  machineType: 'N1_HIGHCPU_8'  # or higher
```

### Service Returns 502 Bad Gateway
- Check health check endpoint: `https://<service-url>/api/health`
- Verify all environment variables are set correctly
- Check logs: `gcloud run services logs read workcrew-revamped`

### Environment Variables Not Loading
Ensure all env vars are set in Cloud Run:
```bash
gcloud run services update workcrew-revamped \
    --region us-central1 \
    --update-env-vars KEY1=value1,KEY2=value2
```

### High Cold Start Times
- Use `--min-instances 1` to keep a minimum instance warm
- Consider Premium plan for more resources

## Cost Optimization

- Set `--max-instances` to prevent unexpected charges
- Use scheduled scaling to reduce costs during off-hours
- Enable container image caching in Cloud Build

## Rollback to Previous Version

```bash
# List recent revisions
gcloud run revisions list --service workcrew-revamped

# Route traffic to a previous revision
gcloud run services update-traffic workcrew-revamped \
    --to-revisions REVISION_NAME=100
```

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
