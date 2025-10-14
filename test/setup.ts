// Test setup file to configure environment for tests without Redis
process.env.NODE_ENV = 'test'

// Mock Redis connection to prevent actual connection attempts
jest.mock('ioredis', () => {
  const mockRedis = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
    status: 'ready',
  }
  return jest.fn(() => mockRedis)
})

// Mock Bull to prevent Redis dependency
jest.mock('bull', () => {
  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    removeJobs: jest.fn().mockResolvedValue({}),
    clean: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue({}),
    getJob: jest.fn().mockResolvedValue(null),
    getJobs: jest.fn().mockResolvedValue([]),
    getWaiting: jest.fn().mockResolvedValue([]),
    getActive: jest.fn().mockResolvedValue([]),
    getCompleted: jest.fn().mockResolvedValue([]),
    getFailed: jest.fn().mockResolvedValue([]),
    getDelayed: jest.fn().mockResolvedValue([]),
    pause: jest.fn().mockResolvedValue({}),
    resume: jest.fn().mockResolvedValue({}),
    // Add Bull-specific properties that BullAdapter checks for
    client: {
      status: 'ready'
    },
    _events: {},
    _eventsCount: 0,
    _maxListeners: undefined,
  }
  
  return jest.fn(() => mockQueue)
})

// Mock Bull Board adapter to prevent validation errors
jest.mock('@bull-board/api/bullAdapter', () => {
  return {
    BullAdapter: jest.fn().mockImplementation(() => ({
      setFormatter: jest.fn(),
      getName: jest.fn().mockReturnValue('mock-queue'),
      clean: jest.fn().mockResolvedValue({}),
      getJob: jest.fn().mockResolvedValue(null),
      getJobs: jest.fn().mockResolvedValue([]),
      getJobCounts: jest.fn().mockResolvedValue({}),
      isPaused: jest.fn().mockResolvedValue(false),
      pause: jest.fn().mockResolvedValue({}),
      resume: jest.fn().mockResolvedValue({}),
    }))
  }
})
