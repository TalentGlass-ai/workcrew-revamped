export interface AssessmentPack {
  pack_name: string;
  duration: string;
  focus: string[];
  levels: string[];
  questions: AssessmentQuestion[];
  evaluation_weights: Record<string, number>;
  output_skills: SkillWeight[];
}

export interface AssessmentQuestion {
  id: string;
  level: 'easy' | 'medium' | 'hard';
  title: string;
  task: string;
  constraints?: string[];
  expected?: string;
  signals?: string[];
  skills: string[];
  code_template?: string;
  test_cases?: TestCase[];
}

export interface TestCase {
  input: any;
  expected_output: any;
  description: string;
}

export interface SkillWeight {
  name: string;
  weight: number;
}

export interface EvaluationResult {
  correctness: number;
  system_design?: number;
  code_quality?: number;
  efficiency?: number;
  edge_cases?: number;
  data_handling?: number;
  model_quality?: number;
  feature_engineering?: number;
  explanation?: number;
  ui_logic?: number;
  async_handling?: number;
  performance?: number;
}

// Backend Engineer Assessment Pack
export const BACKEND_ENGINEER_PACK: AssessmentPack = {
  pack_name: "Backend Engineer - API & Systems",
  duration: "75 mins",
  focus: ["API Design", "Data Handling", "Scalability"],
  levels: ["easy", "medium", "hard"],
  evaluation_weights: {
    correctness: 40,
    system_design: 20,
    code_quality: 20,
    efficiency: 10,
    edge_cases: 10
  },
  output_skills: [
    { name: "API Design", weight: 0.3 },
    { name: "Backend Logic", weight: 0.25 },
    { name: "Concurrency", weight: 0.2 },
    { name: "Data Structures", weight: 0.15 },
    { name: "Error Handling", weight: 0.1 }
  ],
  questions: [
    {
      id: "be-q1",
      level: "easy",
      title: "Build a User API",
      task: "Create REST API endpoints for user management with POST /users and GET /users/:id",
      constraints: ["In-memory storage", "Input validation", "Proper HTTP status codes"],
      expected: "Functional API with validation and error handling",
      signals: ["REST principles", "Input validation", "Error responses"],
      skills: ["Node.js", "REST APIs", "Validation"],
      code_template: `// Express.js template
const express = require('express');
const app = express();
app.use(express.json());

const users = []; // In-memory storage

// TODO: Implement POST /users
// TODO: Implement GET /users/:id

module.exports = app;`,
      test_cases: [
        {
          input: { method: 'POST', body: { name: 'John', email: 'john@test.com' } },
          expected_output: { id: 1, name: 'John', email: 'john@test.com' },
          description: "Create user successfully"
        },
        {
          input: { method: 'GET', params: { id: '1' } },
          expected_output: { id: 1, name: 'John', email: 'john@test.com' },
          description: "Get user by ID"
        }
      ]
    },
    {
      id: "be-q2",
      level: "medium",
      title: "Rate Limiter Implementation",
      task: "Implement a rate limiter that allows maximum 5 requests per user per minute",
      constraints: ["In-memory tracking", "Time-based windows", "Clean up old entries"],
      expected: "Efficient rate limiting with proper time window management",
      signals: ["Hash map usage", "Time-based logic", "Memory efficiency"],
      skills: ["Data Structures", "Time Management", "Algorithms"],
      code_template: `class RateLimiter {
  constructor() {
    this.requests = new Map(); // userId -> timestamps[]
  }

  // TODO: Implement isAllowed(userId) method
  // Should return true if under limit, false if exceeded
}

module.exports = RateLimiter;`,
      test_cases: [
        {
          input: { userId: 'user1', requests: 5, timeWindow: 60000 },
          expected_output: true,
          description: "Allow up to 5 requests per minute"
        },
        {
          input: { userId: 'user1', requests: 6, timeWindow: 60000 },
          expected_output: false,
          description: "Block 6th request within minute"
        }
      ]
    },
    {
      id: "be-q3",
      level: "hard",
      title: "Job Queue System",
      task: "Build a job queue with enqueue, process, and retry failed jobs functionality",
      constraints: ["Async processing", "Retry logic", "Failure handling"],
      expected: "Robust queue system with proper error handling and retries",
      signals: ["Queue design", "Async patterns", "Error recovery", "Clean architecture"],
      skills: ["System Design", "Concurrency", "Error Handling", "Async Programming"],
      code_template: `class JobQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // TODO: Implement enqueue(job) method
  // TODO: Implement process() method with retry logic
  // TODO: Handle job failures and retries
}

module.exports = JobQueue;`,
      test_cases: [
        {
          input: { jobs: [{ id: 1, data: 'test' }, { id: 2, data: 'test2' }] },
          expected_output: "All jobs processed with retries on failure",
          description: "Process jobs with retry mechanism"
        }
      ]
    }
  ]
};

// Data Engineer / Data Scientist Assessment Pack
export const DATA_ENGINEER_PACK: AssessmentPack = {
  pack_name: "Data Engineer / Scientist - Data + ML",
  duration: "90 mins",
  focus: ["SQL", "Data Processing", "ML Thinking"],
  levels: ["easy", "medium", "hard"],
  evaluation_weights: {
    correctness: 35,
    data_handling: 25,
    model_quality: 20,
    feature_engineering: 10,
    explanation: 10
  },
  output_skills: [
    { name: "SQL", weight: 0.25 },
    { name: "Data Processing", weight: 0.25 },
    { name: "Machine Learning", weight: 0.2 },
    { name: "Statistics", weight: 0.15 },
    { name: "Data Cleaning", weight: 0.15 }
  ],
  questions: [
    {
      id: "de-q1",
      level: "easy",
      title: "SQL Query Optimization",
      task: "Write an efficient SQL query to find top 5 users with highest purchase amount in the last 30 days",
      constraints: ["Use proper indexing hints", "Optimize for large datasets"],
      expected: "Efficient query with proper joins and aggregations",
      signals: ["SQL knowledge", "Query optimization", "Aggregation functions"],
      skills: ["SQL", "Database Optimization", "Analytics"],
      code_template: `-- Sample tables:
-- users(id, name, email, created_at)
-- purchases(id, user_id, amount, purchase_date)

-- TODO: Write query to find top 5 users by purchase amount in last 30 days`
    },
    {
      id: "de-q2",
      level: "medium",
      title: "Data Pipeline Processing",
      task: "Process raw JSON logs: clean data, remove nulls, normalize fields, handle duplicates",
      constraints: ["Handle various data formats", "Memory efficient", "Error resilient"],
      expected: "Clean, normalized dataset with proper error handling",
      signals: ["Data cleaning logic", "Normalization", "Duplicate handling"],
      skills: ["Data Processing", "ETL", "Data Quality"],
      code_template: `// Process raw JSON logs
function processDataLogs(rawLogs) {
  // TODO: Parse JSON, remove nulls, normalize, deduplicate
  // Input: Array of JSON strings
  // Output: Clean array of objects
}

module.exports = { processDataLogs };`,
      test_cases: [
        {
          input: ['{"user":"A","value":null}', '{"user":"B","value":100}', '{"user":"A","value":50}'],
          expected_output: [{ user: 'A', value: 50 }, { user: 'B', value: 100 }],
          description: "Clean and deduplicate data"
        }
      ]
    },
    {
      id: "de-q3",
      level: "hard",
      title: "Predictive Model Implementation",
      task: "Build a classification model to predict customer churn using provided dataset",
      constraints: ["Feature engineering", "Model selection", "Evaluation metrics"],
      expected: "Working model with feature selection and performance metrics",
      signals: ["ML knowledge", "Feature engineering", "Model evaluation"],
      skills: ["Machine Learning", "Statistics", "Data Science"],
      code_template: `// Customer churn prediction
// Dataset: customers with features like usage, payments, complaints, etc.

function buildChurnModel(trainingData) {
  // TODO: Feature engineering
  // TODO: Model training
  // TODO: Return model with predictions

  return {
    predict: (features) => {
      // TODO: Implement prediction logic
      return Math.random() > 0.5 ? 'churn' : 'stay';
    },
    evaluate: (testData) => {
      // TODO: Calculate accuracy, precision, recall
      return { accuracy: 0.85, precision: 0.8, recall: 0.75 };
    }
  };
}

module.exports = { buildChurnModel };`
    }
  ]
};

// Frontend Engineer Assessment Pack
export const FRONTEND_ENGINEER_PACK: AssessmentPack = {
  pack_name: "Frontend Engineer - UI & Performance",
  duration: "60 mins",
  focus: ["UI Logic", "Async Handling", "Performance"],
  levels: ["easy", "medium", "hard"],
  evaluation_weights: {
    correctness: 40,
    ui_logic: 25,
    async_handling: 15,
    performance: 10,
    code_quality: 10
  },
  output_skills: [
    { name: "React", weight: 0.3 },
    { name: "JavaScript", weight: 0.25 },
    { name: "Async Handling", weight: 0.2 },
    { name: "Performance Optimization", weight: 0.15 },
    { name: "UI State Management", weight: 0.1 }
  ],
  questions: [
    {
      id: "fe-q1",
      level: "easy",
      title: "API Data List Rendering",
      task: "Fetch user data from API and render in a list with loading and error states",
      constraints: ["Proper loading states", "Error handling", "Clean UI"],
      expected: "Functional list component with proper state management",
      signals: ["React basics", "API integration", "State management"],
      skills: ["React", "JavaScript", "API Integration"],
      code_template: `// React component for user list
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Implement useEffect to fetch users
  // TODO: Handle loading and error states
  // TODO: Render user list

  return (
    <div>
      {/* TODO: Implement loading, error, and data states */}
    </div>
  );
}

export default UserList;`
    },
    {
      id: "fe-q2",
      level: "medium",
      title: "Search with Debounce",
      task: "Implement search input with 300ms debounce and API calls, cancel previous requests",
      constraints: ["Debounce implementation", "Request cancellation", "Clean UX"],
      expected: "Smooth search experience with proper debouncing and cancellation",
      signals: ["Async handling", "Debounce logic", "Request management"],
      skills: ["JavaScript", "Async Programming", "Performance"],
      code_template: `// Search component with debounce
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // TODO: Implement debounced search
  // TODO: Cancel previous requests
  // TODO: Handle API responses

  const handleSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) return;

      // TODO: Make API call with cancellation
    }, 300),
    []
  );

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {/* TODO: Render results */}
    </div>
  );
}

export default SearchComponent;`
    },
    {
      id: "fe-q3",
      level: "hard",
      title: "Infinite Scroll with Cache",
      task: "Implement infinite scroll for data loading with caching to avoid duplicate API calls",
      constraints: ["Memory efficient", "Duplicate prevention", "Smooth UX"],
      expected: "Efficient infinite scroll with proper caching and performance",
      signals: ["State management", "Performance optimization", "Caching strategies"],
      skills: ["React", "Performance", "State Management"],
      code_template: `// Infinite scroll with cache
function InfiniteList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // TODO: Implement cache for loaded pages
  // TODO: Load more data on scroll
  // TODO: Prevent duplicate API calls

  const loadMore = async () => {
    if (loading || !hasMore) return;

    // TODO: Check cache first
    // TODO: Make API call if not cached
    // TODO: Update cache and state
  };

  // TODO: Implement scroll detection

  return (
    <div className="infinite-container">
      {items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
      {loading && <div>Loading...</div>}
    </div>
  );
}

export default InfiniteList;`
    }
  ]
};

// Available assessment packs
export const ASSESSMENT_PACKS: Record<string, AssessmentPack> = {
  'backend-engineer': BACKEND_ENGINEER_PACK,
  'data-engineer': DATA_ENGINEER_PACK,
  'frontend-engineer': FRONTEND_ENGINEER_PACK
};

// Helper functions
export function getPackByRole(role: string): AssessmentPack | null {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '-');
  return ASSESSMENT_PACKS[normalizedRole] || null;
}

export function getQuestionsByDifficulty(pack: AssessmentPack, difficulty: string): AssessmentQuestion[] {
  return pack.questions.filter(q => q.level === difficulty.toLowerCase());
}

export function calculateWeightedScore(evaluation: EvaluationResult, weights: Record<string, number>): number {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [criterion, weight] of Object.entries(weights)) {
    if (evaluation[criterion as keyof EvaluationResult] !== undefined) {
      totalScore += (evaluation[criterion as keyof EvaluationResult] as number) * (weight / 100);
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
}