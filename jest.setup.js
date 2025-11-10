// Mock environment variables
process.env.NODE_ENV = 'test'

// Polyfills for Node.js environment (needed for MongoDB and other packages)
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...data,
      status: init?.status || 200,
    })),
  },
}))

// Setup testing library
require('@testing-library/jest-dom')

