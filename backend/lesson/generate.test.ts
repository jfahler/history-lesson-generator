import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, APIError } from 'encore.dev/api';
import { generate } from './generate';

// Mock the secret function
vi.mock('encore.dev/config', () => ({
  secret: vi.fn(() => () => 'mock-api-key')
}));

// Mock the log module
vi.mock('encore.dev/log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Lesson Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Grade Level Detection', () => {
    it('should detect elementary grade level (K-5)', () => {
      const { detectGradeLevel } = require('./generate');
      
      const testCases = [
        'kindergarten history standards',
        'grade 3 social studies',
        'elementary school curriculum',
        'K-2 learning objectives',
        '5th grade world cultures'
      ];

      testCases.forEach(standard => {
        const result = detectGradeLevel(standard);
        expect(result.gradeLevel).toBe('K-5');
        expect(result.gradeRange).toBe('Elementary (K-5)');
      });
    });

    it('should detect middle school grade level (6-8)', () => {
      const { detectGradeLevel } = require('./generate');
      
      const testCases = [
        'middle school world history',
        'grade 7 ancient civilizations',
        '8th grade American history',
        'junior high social studies'
      ];

      testCases.forEach(standard => {
        const result = detectGradeLevel(standard);
        expect(result.gradeLevel).toBe('6-8');
        expect(result.gradeRange).toBe('Middle School (6-8)');
      });
    });

    it('should detect high school grade level (9-12)', () => {
      const { detectGradeLevel } = require('./generate');
      
      const testCases = [
        'high school world history',
        'grade 10 global studies',
        '11th grade European history',
        'freshman world cultures',
        'senior capstone project'
      ];

      testCases.forEach(standard => {
        const result = detectGradeLevel(standard);
        expect(result.gradeLevel).toBe('9-12');
        expect(result.gradeRange).toBe('High School (9-12)');
      });
    });

    it('should detect AP level courses', () => {
      const { detectGradeLevel } = require('./generate');
      
      const testCases = [
        'AP World History Modern',
        'Advanced Placement European History',
        'College Board AP curriculum'
      ];

      testCases.forEach(standard => {
        const result = detectGradeLevel(standard);
        expect(result.gradeLevel).toBe('9-12');
        expect(result.gradeRange).toBe('AP/Advanced (9-12)');
      });
    });

    it('should detect college level', () => {
      const { detectGradeLevel } = require('./generate');
      
      const testCases = [
        'college world history survey',
        'university undergraduate course',
        'freshman seminar in history'
      ];

      testCases.forEach(standard => {
        const result = detectGradeLevel(standard);
        expect(result.gradeLevel).toBe('College');
        expect(result.gradeRange).toBe('College/University');
      });
    });

    it('should default to high school for unclear standards', () => {
      const { detectGradeLevel } = require('./generate');
      
      const result = detectGradeLevel('analyze historical developments');
      expect(result.gradeLevel).toBe('9-12');
      expect(result.gradeRange).toBe('High School (9-12)');
    });
  });

  describe('Topic Extraction', () => {
    it('should extract key historical terms', () => {
      const { extractSearchTerms } = require('./generate');
      
      const standard = 'Students will analyze the political and religious influences of Ancient Rome, Greece, and Persia from 500 BCE to 600 CE, including the rise of Christianity and the fall of the Western Roman Empire.';
      
      const terms = extractSearchTerms(standard);
      
      expect(terms).toContain('Rome');
      expect(terms).toContain('Greece');
      expect(terms).toContain('Persia');
      expect(terms).toContain('Christianity');
      expect(terms).toContain('empire');
      expect(terms).toContain('religion');
    });

    it('should extract time periods and dates', () => {
      const { extractSearchTerms } = require('./generate');
      
      const standard = 'Examine developments from 1450 CE to 1750 CE during the early modern period, including the Renaissance and Reformation movements.';
      
      const terms = extractSearchTerms(standard);
      
      expect(terms.some(term => term.includes('1450'))).toBe(true);
      expect(terms.some(term => term.includes('1750'))).toBe(true);
      expect(terms).toContain('Renaissance');
      expect(terms).toContain('Reformation');
    });

    it('should extract College Board themes', () => {
      const { extractSearchTerms } = require('./generate');
      
      const standard = 'Analyze state-building, expansion, and conflict in early modern empires, examining trade networks and cultural exchange patterns.';
      
      const terms = extractSearchTerms(standard);
      
      expect(terms).toContain('state-building');
      expect(terms).toContain('expansion');
      expect(terms).toContain('conflict');
      expect(terms).toContain('trade');
      expect(terms).toContain('cultural exchange');
    });

    it('should limit extracted terms to reasonable number', () => {
      const { extractSearchTerms } = require('./generate');
      
      const longStandard = 'Students will analyze the political, economic, social, religious, cultural, technological, military, diplomatic, environmental, and demographic factors that influenced the development of Ancient Rome, Greece, Persia, India, China, Egypt, Mesopotamia, and other classical civilizations from 3000 BCE to 600 CE.';
      
      const terms = extractSearchTerms(longStandard);
      
      expect(terms.length).toBeLessThanOrEqual(15);
    });

    it('should filter out directive verbs', () => {
      const { filterDirectiveVerbs } = require('./generate');
      
      const text = 'Students will analyze and evaluate the political developments in Ancient Rome';
      const filtered = filterDirectiveVerbs(text);
      
      expect(filtered).not.toContain('analyze');
      expect(filtered).not.toContain('evaluate');
      expect(filtered).toContain('political');
      expect(filtered).toContain('Rome');
    });
  });

  describe('Activity Generation', () => {
    it('should generate age-appropriate activities for elementary', () => {
      const { generateSuggestedActivities } = require('./generate');
      
      const activities = generateSuggestedActivities('Ancient Egypt', 'K-5');
      
      expect(activities.length).toBeGreaterThan(0);
      expect(activities.every(activity => activity.ageAppropriate)).toBe(true);
      
      // Should include elementary-friendly activities
      const activityTypes = activities.map(a => a.type);
      expect(activityTypes).toContain('timeline');
      expect(activityTypes).toContain('crossword');
      
      // Should not include complex activities
      expect(activityTypes).not.toContain('webquest');
      expect(activityTypes).not.toContain('cartoon');
    });

    it('should generate appropriate activities for middle school', () => {
      const { generateSuggestedActivities } = require('./generate');
      
      const activities = generateSuggestedActivities('Medieval Europe', '6-8');
      
      expect(activities.length).toBeGreaterThan(0);
      expect(activities.every(activity => activity.ageAppropriate)).toBe(true);
      
      const activityTypes = activities.map(a => a.type);
      expect(activityTypes).toContain('mindmap');
      expect(activityTypes).toContain('webquest');
    });

    it('should generate sophisticated activities for high school', () => {
      const { generateSuggestedActivities } = require('./generate');
      
      const activities = generateSuggestedActivities('Industrial Revolution', '9-12');
      
      expect(activities.length).toBeGreaterThan(0);
      expect(activities.every(activity => activity.ageAppropriate)).toBe(true);
      
      const activityTypes = activities.map(a => a.type);
      expect(activityTypes).toContain('cartoon');
      expect(activityTypes).toContain('research');
      expect(activityTypes).toContain('discussion');
    });

    it('should include pedagogical benefits for all activities', () => {
      const { generateSuggestedActivities } = require('./generate');
      
      const activities = generateSuggestedActivities('World War I', '9-12');
      
      activities.forEach(activity => {
        expect(activity.pedagogicalBenefit).toBeDefined();
        expect(activity.pedagogicalBenefit.length).toBeGreaterThan(10);
        expect(activity.description).toBeDefined();
        expect(activity.name).toBeDefined();
        expect(activity.type).toBeDefined();
      });
    });
  });

  describe('Standard Cleaning', () => {
    it('should remove duplicate lines and sentences', () => {
      const { cleanStandard } = require('./generate');
      
      const duplicateStandard = `Students will analyze Ancient Rome.
Students will analyze Ancient Rome.
They will examine political structures. They will examine political structures.`;
      
      const result = cleanStandard(duplicateStandard);
      
      expect(result.cleaned).not.toMatch(/Students will analyze Ancient Rome.*Students will analyze Ancient Rome/);
      expect(result.cleaned).not.toMatch(/They will examine political structures.*They will examine political structures/);
    });

    it('should create meaningful search context', () => {
      const { cleanStandard } = require('./generate');
      
      const standard = 'Students will analyze the political and religious influences of Ancient Rome and Greece from 500 BCE to 600 CE.';
      
      const result = cleanStandard(standard);
      
      expect(result.searchContext).toContain('Rome');
      expect(result.searchContext).toContain('Greece');
      expect(result.searchContext.length).toBeGreaterThan(0);
    });

    it('should handle empty or whitespace-only input', () => {
      const { cleanStandard } = require('./generate');
      
      const result = cleanStandard('   \n\n   ');
      
      expect(result.cleaned).toBe('');
      expect(result.searchContext).toBe('');
    });
  });

  describe('Input Validation', () => {
    it('should reject null or undefined input', async () => {
      await expect(generate({ standard: null as any })).rejects.toThrow(APIError);
      await expect(generate({ standard: undefined as any })).rejects.toThrow(APIError);
    });

    it('should reject empty string input', async () => {
      await expect(generate({ standard: '' })).rejects.toThrow(APIError);
      await expect(generate({ standard: '   ' })).rejects.toThrow(APIError);
    });

    it('should reject input that is too short', async () => {
      await expect(generate({ standard: 'short' })).rejects.toThrow(APIError);
    });

    it('should reject input that is too long', async () => {
      const longStandard = 'a'.repeat(5001);
      await expect(generate({ standard: longStandard })).rejects.toThrow(APIError);
    });

    it('should reject potentially harmful content', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<iframe src="evil.com"></iframe>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>'
      ];

      for (const input of maliciousInputs) {
        await expect(generate({ standard: input })).rejects.toThrow(APIError);
      }
    });

    it('should accept valid input', async () => {
      const validStandard = 'Students will analyze the political and religious influences of Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock successful OpenAI response
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
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API timeout', async () => {
      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock timeout error
      (global.fetch as any).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), 100);
        });
      });

      await expect(generate({ standard: validStandard })).rejects.toThrow(APIError);
    });

    it('should handle OpenAI API rate limiting', async () => {
      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock rate limit response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded'
      });

      await expect(generate({ standard: validStandard })).rejects.toThrow(APIError);
    });

    it('should handle OpenAI API server errors', async () => {
      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock server error response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error'
      });

      await expect(generate({ standard: validStandard })).rejects.toThrow(APIError);
    });

    it('should handle invalid JSON response', async () => {
      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock invalid JSON response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'invalid json content'
            }
          }]
        })
      });

      await expect(generate({ standard: validStandard })).rejects.toThrow(APIError);
    });

    it('should return fallback lessons when OpenAI is unavailable', async () => {
      // Mock missing API key
      vi.doMock('encore.dev/config', () => ({
        secret: vi.fn(() => () => '')
      }));

      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      const result = await generate({ standard: validStandard });
      
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      expect(result.cleanedStandard).toBeDefined();
      expect(result.extractedTopics).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Network error'));

      await expect(generate({ standard: validStandard })).rejects.toThrow(APIError);
    });
  });

  describe('Fallback Lesson Generation', () => {
    it('should create appropriate fallback lessons', () => {
      const { createFallbackLessons } = require('./generate');
      
      const lessons = createFallbackLessons(
        'Students will analyze Ancient Rome',
        'Ancient Rome empire civilization',
        '9-12'
      );
      
      expect(lessons).toBeDefined();
      expect(lessons.length).toBeGreaterThan(0);
      
      lessons.forEach(lesson => {
        expect(lesson.title).toBeDefined();
        expect(lesson.description).toBeDefined();
        expect(lesson.objectives).toBeDefined();
        expect(lesson.activities).toBeDefined();
        expect(lesson.assessmentIdeas).toBeDefined();
        expect(lesson.gradeLevel).toBe('9-12');
        expect(lesson.resources).toBeDefined();
        expect(lesson.primarySources).toBeDefined();
        expect(lesson.multimedia).toBeDefined();
      });
    });

    it('should include search context in fallback lessons', () => {
      const { createFallbackLessons } = require('./generate');
      
      const searchContext = 'Ancient Rome empire civilization';
      const lessons = createFallbackLessons(
        'Students will analyze Ancient Rome',
        searchContext,
        '9-12'
      );
      
      lessons.forEach(lesson => {
        expect(lesson.title.toLowerCase()).toContain('ancient rome');
        expect(lesson.description.toLowerCase()).toContain('ancient rome');
      });
    });
  });

  describe('Response Validation', () => {
    it('should validate and sanitize OpenAI response structure', async () => {
      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock response with missing fields
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [{
                  title: 'Test Lesson',
                  // Missing other required fields
                }]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: validStandard });
      
      expect(result.lessons[0].title).toBe('Test Lesson');
      expect(result.lessons[0].description).toBe('No description provided');
      expect(result.lessons[0].objectives).toEqual([]);
      expect(result.lessons[0].activities).toEqual([]);
      expect(result.lessons[0].assessmentIdeas).toEqual([]);
    });

    it('should handle malformed lesson structure', async () => {
      const validStandard = 'Students will analyze Ancient Rome from 500 BCE to 600 CE.';
      
      // Mock response with invalid lesson structure
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [
                  null,
                  { title: 'Valid Lesson' },
                  'invalid lesson'
                ]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: validStandard });
      
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      
      // Should have sanitized the invalid entries
      result.lessons.forEach(lesson => {
        expect(lesson.title).toBeDefined();
        expect(typeof lesson.title).toBe('string');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should generate complete lesson response for valid input', async () => {
      const validStandard = 'Students will analyze the political and religious influences of Ancient Rome, Greece, and Persia from 500 BCE to 600 CE, examining the rise of Christianity and the development of imperial systems.';
      
      // Mock successful OpenAI response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [{
                  title: 'Ancient Empires: Political and Religious Influences',
                  description: 'Comprehensive analysis of classical civilizations',
                  objectives: [
                    'Students will analyze political structures of ancient empires',
                    'Students will evaluate religious influences on society'
                  ],
                  activities: [
                    'Primary source analysis of Roman legal codes',
                    'Comparative study of Greek and Persian political systems'
                  ],
                  suggestedActivities: [],
                  assessmentIdeas: [
                    'DBQ essay on imperial administration',
                    'Comparative chart of religious practices'
                  ],
                  timeEstimate: '4-5 class periods',
                  gradeLevel: '9-12',
                  detectedGradeRange: 'High School (9-12)',
                  resources: [{
                    title: 'Ancient History Sourcebook',
                    url: 'https://sourcebooks.fordham.edu/ancient/',
                    type: 'document',
                    description: 'Primary sources from ancient civilizations'
                  }],
                  primarySources: [{
                    title: 'Twelve Tables',
                    author: 'Roman Republic',
                    date: '450 BCE',
                    excerpt: 'If a man has broken a bone of a freeman with his hand or with a cudgel, let him pay a penalty of three hundred coins.',
                    context: 'Early Roman legal code that influenced later legal systems'
                  }],
                  multimedia: [{
                    title: 'Roman Empire Map',
                    url: 'https://example.com/map',
                    type: 'map',
                    description: 'Interactive map of Roman territorial expansion'
                  }]
                }]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: validStandard });
      
      expect(result).toBeDefined();
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBe(1);
      expect(result.cleanedStandard).toBeDefined();
      expect(result.extractedTopics).toBeDefined();
      expect(result.detectedGradeLevel).toBeDefined();
      
      const lesson = result.lessons[0];
      expect(lesson.title).toBe('Ancient Empires: Political and Religious Influences');
      expect(lesson.objectives.length).toBe(2);
      expect(lesson.activities.length).toBe(2);
      expect(lesson.assessmentIdeas.length).toBe(2);
      expect(lesson.resources.length).toBe(1);
      expect(lesson.primarySources.length).toBe(1);
      expect(lesson.multimedia.length).toBe(1);
    });
  });
});
