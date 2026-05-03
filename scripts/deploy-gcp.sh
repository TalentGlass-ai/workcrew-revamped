#!/bin/bash
# GCP Cloud Run Deployment Script for workcrew-revamped

set -e

PROJECT_ID="workcrew-frontend-preprod"
SERVICE_NAME="workcrew-frontend-preprod"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying workcrew-frontend-preprod to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the GCP project
echo "📋 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    run.googleapis.com

# Build and push the Docker image, prefer local Docker but fallback to Cloud Build
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "🐳 Building Docker image locally..."
    docker build \
        -t $IMAGE_NAME:latest \
        -t $IMAGE_NAME:$(git rev-parse --short HEAD) \
        .

    echo "📤 Pushing image to Google Container Registry..."
    docker push $IMAGE_NAME:latest
    docker push $IMAGE_NAME:$(git rev-parse --short HEAD)
else
    echo "🐳 Docker is unavailable locally; using Cloud Build instead..."
    gcloud builds submit . --tag $IMAGE_NAME:latest
fi

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 3600 \
    --max-instances 10 \
    --min-instances 1 \
    --port 3000 \
    --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" \
    --update-secrets "NEXTAUTH_SECRET=nextauth-secret:latest,NEXTAUTH_URL=nextauth-url:latest" \
    || echo "⚠️  Secrets not found. Make sure to set them in Cloud Secret Manager."

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')

echo ""
echo "✅ Deployment successful!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📊 Monitor your service:"
echo "   gcloud run services describe $SERVICE_NAME --region $REGION"
echo ""
echo "📋 View logs:"
echo "   gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100"
