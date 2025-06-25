import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIError } from 'encore.dev/api';
import { generate } from './generate';

// Mock dependencies
vi.mock('encore.dev/config', () => ({
  secret: vi.fn(() => () => 'test-api-key')
}));

vi.mock('encore.dev/log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

global.fetch = vi.fn();

describe('Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation Errors', () => {
    it('should throw invalidArgument for null input', async () => {
      await expect(generate({ standard: null as any }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: null as any });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect(error.message).toContain('non-empty string');
      }
    });

    it('should throw invalidArgument for undefined input', async () => {
      await expect(generate({ standard: undefined as any }))
        .rejects
        .toThrow(APIError);
    });

    it('should throw invalidArgument for empty string', async () => {
      await expect(generate({ standard: '' }))
        .rejects
        .toThrow(APIError);
      
      await expect(generate({ standard: '   \n\t   ' }))
        .rejects
        .toThrow(APIError);
    });

    it('should throw invalidArgument for too short input', async () => {
      await expect(generate({ standard: 'short' }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: 'short' });
      } catch (error) {
        expect(error.message).toContain('too short');
        expect(error.message).toContain('at least 10 characters');
      }
    });

    it('should throw invalidArgument for too long input', async () => {
      const longStandard = 'a'.repeat(5001);
      
      await expect(generate({ standard: longStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: longStandard });
      } catch (error) {
        expect(error.message).toContain('too long');
        expect(error.message).toContain('5000 characters');
      }
    });

    it('should throw invalidArgument for potentially harmful content', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<iframe src="evil.com"></iframe>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>'
      ];

      for (const input of maliciousInputs) {
        await expect(generate({ standard: input }))
          .rejects
          .toThrow(APIError);
        
        try {
          await generate({ standard: input });
        } catch (error) {
          expect(error.message).toContain('invalid content');
        }
      }
    });

    it('should accept valid input at minimum length', async () => {
      const validStandard = 'Students will analyze Ancient Rome.'; // Exactly at minimum
      
      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [{
                  title: 'Test Lesson',
                  description: 'Test Description',
                  objectives: ['Test Objective'],
                  activities: ['Test Activity'],
                  suggestedActivities: [],
                  assessmentIdeas: ['Test Assessment'],
                  timeEstimate: '1 class period',
                  gradeLevel: '9-12',
                  detectedGradeRange: 'High School (9-12)',
                  resources: [],
                  primarySources: [],
                  multimedia: []
                }]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: validStandard });
      expect(result).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
    });
  });

  describe('OpenAI API Error Handling', () => {
    const validStandard = 'Students will analyze the political structures of Ancient Rome from 27 BCE to 476 CE.';

    it('should handle 400 Bad Request errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('Invalid request to AI service');
      }
    });

    it('should handle 401 Unauthorized errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('authentication failed');
      }
    });

    it('should handle 403 Forbidden errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('Access to AI service denied');
      }
    });

    it('should handle 429 Rate Limit errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('rate limit exceeded');
        expect(error.message).toContain('try again in a few minutes');
      }
    });

    it('should handle 500 Internal Server Error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('temporarily unavailable');
      }
    });

    it('should handle 502 Bad Gateway errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 502,
        text: async () => 'Bad Gateway'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
    });

    it('should handle 503 Service Unavailable errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
    });

    it('should handle 504 Gateway Timeout errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 504,
        text: async () => 'Gateway Timeout'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
    });

    it('should handle unknown HTTP status codes', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 418, // I'm a teapot
        text: async () => 'Unknown Error'
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('AI service error (418)');
      }
    });
  });

  describe('Network and Timeout Errors', () => {
    const validStandard = 'Students will analyze the political structures of Ancient Rome from 27 BCE to 476 CE.';

    it('should handle network connection errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('Network error');
      }
    });

    it('should handle timeout errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Request timeout'));

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('timeout');
      }
    });

    it('should handle AbortError (timeout)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      
      (global.fetch as any).mockRejectedValueOnce(abortError);

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('timed out');
      }
    });
  });

  describe('JSON Parsing Errors', () => {
    const validStandard = 'Students will analyze the political structures of Ancient Rome from 27 BCE to 476 CE.';

    it('should handle invalid JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'This is not valid JSON {'
            }
          }]
        })
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow(APIError);
      
      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('Failed to parse AI response');
      }
    });

    it('should handle missing response structure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing choices array
        })
      });

      await expect(generate({ standard: validStandard }))
        .rejects
        .toThrow();
    });

    it('should handle empty response content', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: null
            }
          }]
        })
      });

      // Should fall back to default lessons instead of throwing
      const result = await generate({ standard: validStandard });
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
    });

    it('should handle malformed lesson structure in response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: 'not an array'
              })
            }
          }]
        })
      });

      // Should fall back to default lessons
      const result = await generate({ standard: validStandard });
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
    });
  });

  describe('Missing API Key Handling', () => {
    it('should return fallback lessons when API key is missing', async () => {
      // Mock missing API key
      vi.doMock('encore.dev/config', () => ({
        secret: vi.fn(() => () => '')
      }));

      const validStandard = 'Students will analyze the political structures of Ancient Rome from 27 BCE to 476 CE.';
      
      const result = await generate({ standard: validStandard });
      
      expect(result).toBeDefined();
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      expect(result.cleanedStandard).toBeDefined();
      expect(result.extractedTopics).toBeDefined();
      
      // Should be fallback lessons with proper structure
      result.lessons.forEach(lesson => {
        expect(lesson.title).toBeDefined();
        expect(lesson.description).toBeDefined();
        expect(lesson.objectives).toBeDefined();
        expect(lesson.activities).toBeDefined();
        expect(lesson.assessmentIdeas).toBeDefined();
      });
    });

    it('should return fallback lessons when API key is null', async () => {
      // Mock null API key
      vi.doMock('encore.dev/config', () => ({
        secret: vi.fn(() => () => null)
      }));

      const validStandard = 'Students will analyze medieval European feudalism.';
      
      const result = await generate({ standard: validStandard });
      
      expect(result.lessons.length).toBeGreaterThan(0);
      expect(result.cleanedStandard).toContain('medieval European feudalism');
    });
  });

  describe('Error Message Quality', () => {
    it('should provide helpful error messages for common issues', async () => {
      const testCases = [
        {
          input: '',
          expectedMessage: 'cannot be empty'
        },
        {
          input: 'short',
          expectedMessage: 'too short'
        },
        {
          input: 'a'.repeat(5001),
          expectedMessage: 'too long'
        },
        {
          input: '<script>alert("xss")</script>',
          expectedMessage: 'invalid content'
        }
      ];

      for (const testCase of testCases) {
        try {
          await generate({ standard: testCase.input });
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.message).toContain(testCase.expectedMessage);
        }
      }
    });

    it('should provide actionable error messages for API failures', async () => {
      const validStandard = 'Students will analyze Ancient Rome.';

      // Test rate limiting
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded'
      });

      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('try again in a few minutes');
      }

      // Test server error
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error'
      });

      try {
        await generate({ standard: validStandard });
      } catch (error) {
        expect(error.message).toContain('temporarily unavailable');
        expect(error.message).toContain('try again');
      }
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should gracefully handle partial API responses', async () => {
      const validStandard = 'Students will analyze the Renaissance period.';

      // Mock response with some valid and some invalid lessons
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [
                  {
                    title: 'Valid Lesson',
                    description: 'This is valid',
                    objectives: ['Valid objective'],
                    activities: ['Valid activity'],
                    assessmentIdeas: ['Valid assessment'],
                    timeEstimate: '2 periods',
                    gradeLevel: '9-12',
                    detectedGradeRange: 'High School (9-12)',
                    resources: [],
                    primarySources: [],
                    multimedia: []
                  },
                  null, // Invalid lesson
                  {
                    title: 'Incomplete Lesson'
                    // Missing required fields
                  }
                ]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: validStandard });
      
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      
      // Should have sanitized the response
      result.lessons.forEach(lesson => {
        expect(lesson.title).toBeDefined();
        expect(lesson.description).toBeDefined();
        expect(Array.isArray(lesson.objectives)).toBe(true);
        expect(Array.isArray(lesson.activities)).toBe(true);
        expect(Array.isArray(lesson.assessmentIdeas)).toBe(true);
      });
    });

    it('should handle API responses with missing lesson fields', async () => {
      const validStandard = 'Students will study ancient civilizations.';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [{
                  title: 'Ancient Civilizations',
                  // Missing most fields
                }]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: validStandard });
      
      expect(result.lessons[0].title).toBe('Ancient Civilizations');
      expect(result.lessons[0].description).toBe('No description provided');
      expect(result.lessons[0].objectives).toEqual([]);
      expect(result.lessons[0].activities).toEqual([]);
      expect(result.lessons[0].assessmentIdeas).toEqual([]);
      expect(result.lessons[0].timeEstimate).toBe('1-2 class periods');
    });
  });
});
