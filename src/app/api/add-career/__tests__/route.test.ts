/**
 * Test suite for /api/add-career endpoint
 * Tests XSS protection, input validation, and security measures
 */

// Mock Next.js modules before imports
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      const response = {
        ...data,
        status: init?.status || 200,
        json: jest.fn().mockResolvedValue(data),
      };
      return response;
    }),
  },
}));

import connectMongoDB from '@/lib/mongoDB/mongoDB';
import { guid } from '@/lib/Utils';

// Mock dependencies
jest.mock('@/lib/mongoDB/mongoDB');
jest.mock('@/lib/Utils', () => ({
  guid: jest.fn(() => 'test-guid-123'),
}));

// Import POST after mocks are set up
const routeModule = require('../route');
const { POST } = routeModule;

describe('POST /api/add-career - XSS Protection & Validation', () => {
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup MongoDB mocks
    const mockAggregateResult = [
      {
        plan: {
          jobLimit: 10,
          extraJobSlots: 0,
        },
      },
    ];

    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
      countDocuments: jest.fn().mockResolvedValue(5),
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAggregateResult),
      }),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
    };

    (connectMongoDB as jest.Mock).mockResolvedValue({ db: mockDb });
  });

  const createRequest = (body: any): Request => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as any;
  };

  const getValidPayload = () => ({
    jobTitle: 'Software Engineer',
    description: '<p>Valid job description</p>',
    questions: [
      {
        id: 1,
        category: 'Technical',
        questionCountToAsk: null,
        questions: [
          {
            id: 1,
            question: 'What is your experience?',
          },
        ],
      },
    ],
    location: 'Manila',
    workSetup: 'Remote',
    orgID: '507f1f77bcf86cd799439011',
    lastEditedBy: {
      name: 'Test User',
      email: 'test@example.com',
    },
    createdBy: {
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  describe('XSS Protection', () => {
    it('should remove script tags from description', async () => {
      const payload = getValidPayload();
      payload.description = "<script>alert('XSS')</script>Hello World";

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.description).not.toContain('<script>');
      expect(responseData.career.description).not.toContain('</script>');
      expect(responseData.career.description).toContain('Hello World');
    });

    it('should remove event handlers from description', async () => {
      const payload = getValidPayload();
      payload.description = '<div onclick="alert(\'XSS\')">Click me</div>';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.description).not.toContain('onclick');
    });

    it('should remove iframe tags from description', async () => {
      const payload = getValidPayload();
      payload.description = '<iframe src="evil.com"></iframe>Safe content';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.description).not.toContain('<iframe');
      expect(responseData.career.description).toContain('Safe content');
    });

    it('should sanitize CV secret prompt', async () => {
      const payload = getValidPayload();
      payload.cvSecretPrompt = "<script>alert('CV XSS')</script>";

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.cvSecretPrompt).not.toContain('<script>');
    });

    it('should sanitize AI interview secret prompt', async () => {
      const payload = getValidPayload();
      payload.aiInterviewSecretPrompt = "<img src=x onerror=alert('AI XSS')>";

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.aiInterviewSecretPrompt).not.toContain('onerror');
    });

    it('should remove javascript: protocol', async () => {
      const payload = getValidPayload();
      payload.description = '<a href="javascript:alert(\'XSS\')">Link</a>';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.description).not.toContain('javascript:');
    });

    it('should handle multiple XSS vectors simultaneously', async () => {
      const payload = getValidPayload();
      payload.description = "<script>alert(1)</script><iframe src='evil.com'></iframe><div onclick='alert(2)'>Click</div>";

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.description).not.toContain('<script>');
      expect(responseData.career.description).not.toContain('<iframe');
      expect(responseData.career.description).not.toContain('onclick');
    });
  });

  describe('Input Validation', () => {
    it('should reject empty job title', async () => {
      const payload = getValidPayload();
      payload.jobTitle = '';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Job title is required');
    });

    it('should reject empty description', async () => {
      const payload = getValidPayload();
      payload.description = '';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Description is required');
    });

    it('should reject empty location', async () => {
      const payload = getValidPayload();
      payload.location = '';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Location is required');
    });

    it('should reject empty work setup', async () => {
      const payload = getValidPayload();
      payload.workSetup = '';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Work setup is required');
    });

    it('should reject invalid ObjectId for orgID', async () => {
      const payload = getValidPayload();
      payload.orgID = 'invalid-id';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Valid organization ID is required');
    });

    it('should reject invalid email in user info', async () => {
      const payload = getValidPayload();
      payload.lastEditedBy.email = 'invalid-email';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Valid user email');
    });

    it('should reject missing user name', async () => {
      const payload = getValidPayload();
      payload.lastEditedBy.name = '';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('User name is required');
    });
  });

  describe('Length Validation', () => {
    it('should reject job title exceeding 200 characters', async () => {
      const payload = getValidPayload();
      payload.jobTitle = 'A'.repeat(201);

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('exceeds maximum length');
    });

    it('should reject description exceeding 50000 characters', async () => {
      const payload = getValidPayload();
      payload.description = 'A'.repeat(50001);

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('exceeds maximum length');
    });
  });

  describe('Type Validation', () => {
    it('should handle invalid salary values gracefully', async () => {
      const payload = getValidPayload();
      payload.minimumSalary = 'not-a-number';
      payload.maximumSalary = 'also-not-a-number';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.minimumSalary).toBeNull();
      expect(responseData.career.maximumSalary).toBeNull();
    });

    it('should validate salary range', async () => {
      const payload = getValidPayload();
      payload.minimumSalary = 100000;
      payload.maximumSalary = 50000; // Less than minimum

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Minimum salary cannot be greater than maximum salary');
    });

    it('should convert invalid boolean values', async () => {
      const payload = getValidPayload();
      payload.requireVideo = 'maybe'; // Invalid boolean
      payload.salaryNegotiable = 123; // Invalid boolean

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(typeof responseData.career.requireVideo).toBe('boolean');
      expect(typeof responseData.career.salaryNegotiable).toBe('boolean');
    });
  });

  describe('Questions Validation', () => {
    it('should reject non-array questions', async () => {
      const payload = getValidPayload();
      payload.questions = 'not-an-array';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Questions must be an array');
    });

    it('should sanitize XSS in question text', async () => {
      const payload = getValidPayload();
      payload.questions[0].questions[0].question = "<script>alert('XSS')</script>What is your experience?";

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.questions[0].questions[0].question).not.toContain('<script>');
      expect(responseData.career.questions[0].questions[0].question).toContain('What is your experience?');
    });

    it('should reject empty questions array', async () => {
      const payload = getValidPayload();
      payload.questions = [];

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Questions are required');
    });
  });

  describe('Successful Career Creation', () => {
    it('should create career with valid data', async () => {
      const payload = getValidPayload();

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Career added successfully');
      expect(responseData.career.jobTitle).toBe('Software Engineer');
      expect(responseData.career.orgID).toBe('507f1f77bcf86cd799439011');
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    it('should preserve safe HTML formatting', async () => {
      const payload = getValidPayload();
      payload.description = '<p>Valid paragraph</p><strong>Bold text</strong>';

      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.career.description).toContain('Valid paragraph');
    });
  });

  describe('Organization Limits', () => {
    it('should reject when job limit is reached', async () => {
      mockCollection.countDocuments.mockResolvedValue(10); // At limit

      const payload = getValidPayload();
      const request = createRequest(payload);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('maximum number of jobs');
    });

    it('should allow when under job limit', async () => {
      mockCollection.countDocuments.mockResolvedValue(5); // Under limit

      const payload = getValidPayload();
      const request = createRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });
});
