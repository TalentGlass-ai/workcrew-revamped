# WorkCrew.ai - Enhanced Job Portal

## 🚀 Enhanced Features Implemented

### 1. AI-Powered Recommendations
- **Smart matching algorithm** based on candidate skills, experience, salary expectations, and location
- **Personalized scoring** with weighted factors:
  - Skills matching (40% weight)
  - Experience compatibility (20% weight)
  - Salary alignment (20% weight)
  - Location proximity (10% weight)
  - Remote work preferences (10% weight)

### 2. Location-Based Search with Geocoding
- **Geocoding integration** using OpenStreetMap (free alternative to Google Maps)
- **Distance calculations** with configurable radius (default 50km)
- **Coordinate storage** for jobs and candidate profiles
- **Location filtering** in search API

### 3. Saved Searches & Job Alerts
- **Save search criteria** for quick access
- **Automated job alerts** with configurable frequency (instant, daily, weekly)
- **Email notifications** for new matching jobs
- **Alert management** API for creating/updating/deleting alerts

### 4. Premium Filters
- **Company size filtering** (startup, small, medium, large, enterprise)
- **Benefits filtering** (health insurance, remote work, etc.)
- **Remote work options**
- **Enhanced salary ranges**
- **Industry and location filters**

## 🗄️ Database Schema Enhancements

### New Models Added:
- **SavedSearch**: Store user search preferences
- **JobAlert**: Automated job notifications
- **Enhanced Company**: Size enum, benefits array, coordinates
- **Enhanced Job**: Benefits, remote flag, coordinates
- **Enhanced CandidateProfile**: Salary expectations, relocation preferences, coordinates

### New Enums:
- **CompanySize**: STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
- **AlertFrequency**: INSTANT, DAILY, WEEKLY

## 🔧 API Endpoints

### Search & Discovery
- `GET /api/jobs/search` - Enhanced search with location, benefits, company size
- `GET /api/jobs/recommendations` - AI-powered personalized recommendations
- `GET /api/categories` - Job categories with counts

### Saved Searches
- `GET /api/saved-searches?userId=...` - Get user's saved searches
- `POST /api/saved-searches` - Create saved search

### Job Alerts
- `GET /api/job-alerts?userId=...` - Get user's active alerts
- `POST /api/job-alerts` - Create job alert
- `PUT /api/job-alerts?id=...` - Update alert status

## 🛠️ Setup Instructions

### 1. Database Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run db:seed
```

### 2. Environment Variables
Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
# For production PostgreSQL:
# DATABASE_URL="postgresql://username:password@localhost:5432/workcrew"
```

### 3. Background Jobs
Set up cron job for processing alerts:
```bash
# Run every hour
npm run process:alerts
```

## 🎯 Usage Examples

### AI Recommendations
```javascript
// Get personalized job recommendations
const response = await fetch('/api/jobs/recommendations?userId=user123&limit=10')
const { jobs } = await response.json()
// Jobs are sorted by match score (0-100)
```

### Location-Based Search
```javascript
// Search jobs within 25km of coordinates
const response = await fetch('/api/jobs/search?q=developer&lat=37.7749&lng=-122.4194&radius=25')
const { jobs } = await response.json()
```

### Premium Filters
```javascript
// Search for remote jobs at large companies with health benefits
const response = await fetch('/api/jobs/search?companySize=LARGE&benefits=Health Insurance&isRemote=true')
const { jobs } = await response.json()
```

### Job Alerts
```javascript
// Create daily job alert
const response = await fetch('/api/job-alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    name: 'Daily Developer Jobs',
    criteria: {
      query: 'software engineer',
      location: 'San Francisco',
      jobType: 'FULL_TIME',
      salaryMin: 100000
    },
    frequency: 'DAILY'
  })
})
```

## 🔮 Future Enhancements

1. **Advanced AI Matching**
   - Machine learning models for better skill matching
   - Resume parsing and analysis
   - Career path recommendations

2. **Real-time Notifications**
   - WebSocket integration for instant alerts
   - Push notifications for mobile apps

3. **Analytics Dashboard**
   - Job search analytics
   - Application success rates
   - Market insights

4. **Premium Features**
   - Priority job postings
   - Advanced candidate screening
   - Video interview scheduling

## 📊 Performance Considerations

- **Database indexing** on frequently queried fields
- **Caching layer** for popular searches
- **Background job processing** for heavy computations
- **Pagination** for large result sets

This enhanced job portal now provides a comprehensive, AI-powered job matching experience that rivals major platforms like LinkedIn and Indeed! 🎉