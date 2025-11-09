// Mock environment variables
process.env.NODE_ENV = 'test'

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...data,
      status: init?.status || 200,
    })),
  },
}))

