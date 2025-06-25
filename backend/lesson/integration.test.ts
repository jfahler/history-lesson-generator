import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

describe('Lesson Generation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-End Lesson Generation', () => {
    it('should generate complete lessons for AP World History standard', async () => {
      const apStandard = `AP World History Modern Unit 1: The Global Tapestry (c. 1200-1450)
Students will analyze the development and interactions of various belief systems, including Buddhism, Christianity, Islam, Judaism, and Hinduism, and their influence on political, economic, and social structures in different regions during the period 1200-1450 CE.`;

      // Mock successful OpenAI response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [
                  {
                    title: 'Belief Systems and Political Structures (1200-1450)',
                    description: 'Analysis of how major world religions influenced governance and society during the medieval period, aligned with AP World History themes.',
                    objectives: [
                      'Students will analyze the role of Buddhism in Southeast Asian political structures using historical thinking skills',
                      'Students will compare the influence of Islam and Christianity on medieval European and Middle Eastern societies',
                      'Students will evaluate primary sources demonstrating religious influence on economic systems'
                    ],
                    activities: [
                      'Primary source analysis of Buddhist texts and Islamic legal codes from the 13th century',
                      'Comparative study of Christian monasticism and Islamic madrasas as educational institutions',
                      'Document-based question examining religious influence on trade networks along the Silk Roads'
                    ],
                    suggestedActivities: [
                      {
                        name: 'Interactive Timeline',
                        type: 'timeline',
                        description: 'Create a visual timeline of key events related to belief systems and political structures',
                        pedagogicalBenefit: 'Helps students understand chronological thinking and cause-and-effect relationships',
                        ageAppropriate: true
                      }
                    ],
                    assessmentIdeas: [
                      'DBQ essay analyzing the role of religious institutions in medieval governance using College Board rubric',
                      'Comparative chart assessment evaluating different belief systems\' political influence with evidence',
                      'LEQ essay on continuity and change in religious-political relationships over time'
                    ],
                    timeEstimate: '4-5 class periods',
                    gradeLevel: '9-12',
                    detectedGradeRange: 'AP/Advanced (9-12)',
                    resources: [
                      {
                        title: 'College Board AP World History Course Description',
                        url: 'https://apcentral.collegeboard.org/courses/ap-world-history-modern',
                        type: 'document',
                        description: 'Official course materials and exam information'
                      }
                    ],
                    primarySources: [
                      {
                        title: 'The Travels of Ibn Battuta',
                        author: 'Ibn Battuta',
                        date: '1354 CE',
                        excerpt: 'I found the people of this city to be very religious, following the Islamic law strictly in their daily affairs and governance.',
                        context: 'Medieval Islamic traveler\'s account of religious influence on society and politics across different regions'
                      }
                    ],
                    multimedia: [
                      {
                        title: 'Medieval Trade Routes Map',
                        url: 'https://example.com/medieval-trade-map',
                        type: 'map',
                        description: 'Interactive map showing religious and cultural exchange along medieval trade networks'
                      }
                    ]
                  }
                ]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: apStandard });

      // Verify response structure
      expect(result).toBeDefined();
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBe(1);
      expect(result.cleanedStandard).toBeDefined();
      expect(result.extractedTopics).toBeDefined();
      expect(result.detectedGradeLevel).toBe('AP/Advanced (9-12)');

      // Verify lesson content
      const lesson = result.lessons[0];
      expect(lesson.title).toContain('Belief Systems');
      expect(lesson.gradeLevel).toBe('9-12');
      expect(lesson.detectedGradeRange).toBe('AP/Advanced (9-12)');
      expect(lesson.objectives.length).toBe(3);
      expect(lesson.activities.length).toBe(3);
      expect(lesson.assessmentIdeas.length).toBe(3);

      // Verify AP-specific content
      expect(lesson.description).toContain('AP World History');
      expect(lesson.assessmentIdeas.some(a => a.includes('DBQ'))).toBe(true);
      expect(lesson.assessmentIdeas.some(a => a.includes('LEQ'))).toBe(true);

      // Verify extracted topics include key terms
      expect(result.extractedTopics).toContain('Buddhism');
      expect(result.extractedTopics).toContain('Christianity');
      expect(result.extractedTopics).toContain('Islam');
    });

    it('should handle elementary school standards appropriately', async () => {
      const elementaryStandard = `Grade 3 Social Studies: Ancient Civilizations
Students will learn about daily life in ancient Egypt, including how people lived, worked, and built the pyramids. They will explore Egyptian art, writing, and important pharaohs like King Tut.`;

      // Mock response appropriate for elementary
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [
                  {
                    title: 'Life in Ancient Egypt',
                    description: 'Students explore daily life, art, and famous pharaohs in ancient Egypt through hands-on activities and stories.',
                    objectives: [
                      'Students will describe daily life in ancient Egypt using pictures and simple texts',
                      'Students will identify important pharaohs and their contributions',
                      'Students will create Egyptian art projects to understand their culture'
                    ],
                    activities: [
                      'Create Egyptian hieroglyphic name tags using simple symbols',
                      'Build model pyramids with blocks to understand construction',
                      'Story time about King Tut and other famous pharaohs with picture books'
                    ],
                    suggestedActivities: [
                      {
                        name: 'Egyptian Memory Game',
                        type: 'memory',
                        description: 'Match Egyptian symbols, pharaohs, and artifacts',
                        pedagogicalBenefit: 'Strengthens memory through repetition and makes learning facts more enjoyable',
                        ageAppropriate: true
                      }
                    ],
                    assessmentIdeas: [
                      'Drawing assessment: Students draw and label parts of Egyptian daily life',
                      'Show and tell: Students present their pyramid models and explain how they were built',
                      'Simple matching quiz with pictures of Egyptian artifacts and their uses'
                    ],
                    timeEstimate: '2-3 class periods',
                    gradeLevel: 'K-5',
                    detectedGradeRange: 'Elementary (K-5)',
                    resources: [
                      {
                        title: 'National Geographic Kids: Ancient Egypt',
                        url: 'https://kids.nationalgeographic.com/history/ancient-egypt/',
                        type: 'interactive',
                        description: 'Kid-friendly information and activities about ancient Egypt'
                      }
                    ],
                    primarySources: [
                      {
                        title: 'Egyptian Tomb Paintings',
                        author: 'Ancient Egyptian Artists',
                        date: 'Various periods',
                        excerpt: 'Pictures showing people farming, making bread, and celebrating festivals in ancient Egypt.',
                        context: 'These colorful paintings help us understand how ancient Egyptians lived and worked every day.'
                      }
                    ],
                    multimedia: [
                      {
                        title: 'Virtual Pyramid Tour',
                        url: 'https://example.com/pyramid-tour',
                        type: 'video',
                        description: 'Simple video tour inside the Great Pyramid suitable for young learners'
                      }
                    ]
                  }
                ]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: elementaryStandard });

      expect(result.detectedGradeLevel).toBe('Elementary (K-5)');
      
      const lesson = result.lessons[0];
      expect(lesson.gradeLevel).toBe('K-5');
      expect(lesson.detectedGradeRange).toBe('Elementary (K-5)');

      // Verify age-appropriate content
      expect(lesson.activities.some(a => a.includes('blocks'))).toBe(true);
      expect(lesson.activities.some(a => a.includes('story time'))).toBe(true);
      expect(lesson.assessmentIdeas.some(a => a.includes('drawing'))).toBe(true);
      expect(lesson.assessmentIdeas.some(a => a.includes('show and tell'))).toBe(true);

      // Verify simplified language
      expect(lesson.primarySources[0].context).toContain('help us understand');
      expect(lesson.primarySources[0].excerpt).toContain('Pictures showing');
    });

    it('should generate fallback lessons when API fails', async () => {
      const validStandard = 'Students will analyze the political and economic structures of the Roman Empire from 27 BCE to 476 CE.';

      // Mock API failure
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await generate({ standard: validStandard });

      // Should still return valid response with fallback lessons
      expect(result).toBeDefined();
      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      expect(result.cleanedStandard).toBeDefined();
      expect(result.extractedTopics).toBeDefined();

      // Verify fallback lessons have required structure
      result.lessons.forEach(lesson => {
        expect(lesson.title).toBeDefined();
        expect(lesson.description).toBeDefined();
        expect(lesson.objectives).toBeDefined();
        expect(lesson.activities).toBeDefined();
        expect(lesson.assessmentIdeas).toBeDefined();
        expect(lesson.resources).toBeDefined();
        expect(lesson.primarySources).toBeDefined();
        expect(lesson.multimedia).toBeDefined();
      });
    });

    it('should handle complex multi-topic standards', async () => {
      const complexStandard = `World History Honors: Comparative Civilizations (1000-1500 CE)
Students will analyze and compare the political, economic, social, and cultural developments of medieval European feudalism, Islamic caliphates, Chinese dynasties (Song and Yuan), Japanese shogunate, Byzantine Empire, and Mongol Empire. They will evaluate the role of trade networks, religious institutions, technological innovations, and cultural exchange in shaping these civilizations. Students will examine primary sources, create comparative analyses, and assess the long-term impact of these civilizations on subsequent historical developments.`;

      // Mock comprehensive response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [
                  {
                    title: 'Comparative Political Systems: Medieval Civilizations (1000-1500)',
                    description: 'Students compare and contrast political structures across major medieval civilizations, analyzing feudalism, caliphates, dynasties, and empires.',
                    objectives: [
                      'Students will compare political structures of European feudalism and Chinese dynastic systems',
                      'Students will analyze the role of religious authority in Islamic caliphates and Byzantine Empire',
                      'Students will evaluate the impact of Mongol political innovations on conquered territories'
                    ],
                    activities: [
                      'Comparative chart analysis of feudal hierarchy vs. Chinese bureaucracy using primary sources',
                      'Document-based investigation of Islamic legal codes and Byzantine administrative records',
                      'Role-playing simulation of Mongol kurultai decision-making processes'
                    ],
                    suggestedActivities: [],
                    assessmentIdeas: [
                      'Comparative essay analyzing political systems using specific historical evidence',
                      'Primary source analysis worksheet comparing governmental documents',
                      'Group presentation on political innovations with peer evaluation rubric'
                    ],
                    timeEstimate: '5-6 class periods',
                    gradeLevel: '9-12',
                    detectedGradeRange: 'High School (9-12)',
                    resources: [],
                    primarySources: [],
                    multimedia: []
                  },
                  {
                    title: 'Trade Networks and Cultural Exchange (1000-1500)',
                    description: 'Examination of major trade routes and their role in facilitating cultural, technological, and religious exchange between civilizations.',
                    objectives: [
                      'Students will trace the development of Silk Road, Indian Ocean, and trans-Saharan trade networks',
                      'Students will analyze the spread of technologies, ideas, and diseases through trade connections',
                      'Students will evaluate the economic and cultural impact of trade on different civilizations'
                    ],
                    activities: [
                      'Interactive mapping of trade routes with analysis of goods, ideas, and technologies exchanged',
                      'Primary source analysis of merchant accounts and travel narratives from different cultures',
                      'Comparative study of technological diffusion through trade networks'
                    ],
                    suggestedActivities: [],
                    assessmentIdeas: [
                      'Trade route mapping project with analysis of cultural exchange',
                      'Document-based question on the impact of trade on medieval societies',
                      'Research project on specific trade goods and their global impact'
                    ],
                    timeEstimate: '4-5 class periods',
                    gradeLevel: '9-12',
                    detectedGradeRange: 'High School (9-12)',
                    resources: [],
                    primarySources: [],
                    multimedia: []
                  }
                ]
              })
            }
          }]
        })
      });

      const result = await generate({ standard: complexStandard });

      expect(result.lessons.length).toBe(2);
      expect(result.extractedTopics).toContain('feudalism');
      expect(result.extractedTopics).toContain('caliphates');
      expect(result.extractedTopics).toContain('Song');
      expect(result.extractedTopics).toContain('Yuan');
      expect(result.extractedTopics).toContain('Mongol');
      expect(result.extractedTopics).toContain('Byzantine');

      // Verify lessons address different aspects of the complex standard
      const titles = result.lessons.map(l => l.title);
      expect(titles.some(t => t.includes('Political'))).toBe(true);
      expect(titles.some(t => t.includes('Trade'))).toBe(true);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from partial API failures', async () => {
      const validStandard = 'Students will analyze the Renaissance period in European history from 1400-1600 CE.';

      // Mock API returning malformed JSON that can be partially parsed
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: '{"lessons": [{"title": "Renaissance Art and Culture", "description": "Incomplete lesson'
            }
          }]
        })
      });

      // Should fall back to default lessons
      const result = await generate({ standard: validStandard });

      expect(result.lessons).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      expect(result.cleanedStandard).toContain('Renaissance');
    });

    it('should handle API timeout gracefully', async () => {
      const validStandard = 'Students will examine the causes and effects of World War I.';

      // Mock timeout
      (global.fetch as any).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      await expect(generate({ standard: validStandard })).rejects.toThrow();
    });

    it('should validate and sanitize malformed lesson data', async () => {
      const validStandard = 'Students will study ancient Greek philosophy and its influence on Western thought.';

      // Mock response with mixed valid and invalid lesson data
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [
                  {
                    title: 'Greek Philosophy',
                    description: 'Valid lesson',
                    objectives: ['Valid objective'],
                    activities: ['Valid activity'],
                    assessmentIdeas: ['Valid assessment']
                  },
                  {
                    // Missing required fields
                    title: 'Incomplete Lesson'
                  },
                  null, // Invalid lesson
                  {
                    title: 'Another Valid Lesson',
                    description: 'Another valid lesson',
                    objectives: null, // Invalid field type
                    activities: 'Not an array', // Invalid field type
                    assessmentIdeas: ['Valid assessment']
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

      // All returned lessons should have valid structure
      result.lessons.forEach(lesson => {
        expect(lesson.title).toBeDefined();
        expect(typeof lesson.title).toBe('string');
        expect(lesson.description).toBeDefined();
        expect(typeof lesson.description).toBe('string');
        expect(Array.isArray(lesson.objectives)).toBe(true);
        expect(Array.isArray(lesson.activities)).toBe(true);
        expect(Array.isArray(lesson.assessmentIdeas)).toBe(true);
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle very long standards efficiently', async () => {
      // Create a very long but valid standard
      const longStandard = `Students will analyze the comprehensive development of world civilizations from 3000 BCE to 1500 CE, including but not limited to: Mesopotamian civilizations (Sumerian, Babylonian, Assyrian), Egyptian dynasties (Old Kingdom, Middle Kingdom, New Kingdom), Indus Valley civilization, ancient Chinese dynasties (Shang, Zhou, Qin, Han, Tang, Song, Yuan), ancient Indian empires (Mauryan, Gupta), classical Greek city-states and Hellenistic kingdoms, Roman Republic and Empire, Byzantine Empire, Islamic caliphates (Rashidun, Umayyad, Abbasid), medieval European feudalism, African kingdoms (Ghana, Mali, Songhai, Great Zimbabwe), Mesoamerican civilizations (Olmec, Maya, Aztec), Andean civilizations (Chavin, Moche, Inca), Japanese periods (Heian, Kamakura, Muromachi), Korean kingdoms (Goguryeo, Baekje, Silla, Goryeo), Southeast Asian empires (Khmer, Srivijaya, Majapahit), and Mongol Empire. Students will examine political structures, economic systems, social hierarchies, religious and philosophical developments, technological innovations, artistic achievements, trade networks, cultural exchanges, military conflicts, environmental factors, and demographic changes across these civilizations.`.repeat(3);

      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                lessons: [{
                  title: 'World Civilizations Overview',
                  description: 'Comprehensive survey of world civilizations',
                  objectives: ['Analyze major civilizations'],
                  activities: ['Comparative timeline creation'],
                  suggestedActivities: [],
                  assessmentIdeas: ['Civilization comparison project'],
                  timeEstimate: '10-12 class periods',
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

      const startTime = Date.now();
      const result = await generate({ standard: longStandard });
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      
      // Should complete in reasonable time (less than 5 seconds for this test)
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Should have extracted meaningful topics despite length
      expect(result.extractedTopics.length).toBeGreaterThan(5);
      expect(result.extractedTopics.length).toBeLessThanOrEqual(15);
    });

    it('should limit extracted topics to prevent overwhelming the API', async () => {
      const topicHeavyStandard = 'Students will analyze Rome, Greece, Egypt, Persia, India, China, Japan, Korea, Vietnam, Thailand, Cambodia, Indonesia, Malaysia, Philippines, Mongolia, Turkey, Russia, France, Germany, England, Spain, Italy, Portugal, Netherlands, Belgium, Austria, Hungary, Poland, Czech Republic, Slovakia, Croatia, Serbia, Bulgaria, Romania, Ukraine, Belarus, Lithuania, Latvia, Estonia, Finland, Sweden, Norway, Denmark, Iceland, Ireland, Scotland, Wales, and their political, economic, social, cultural, religious, military, technological, artistic, architectural, literary, philosophical, and scientific developments.';

      const { extractSearchTerms } = require('./generate');
      const terms = extractSearchTerms(topicHeavyStandard);

      // Should limit to reasonable number
      expect(terms.length).toBeLessThanOrEqual(15);
      
      // Should prioritize important terms
      expect(terms).toContain('Rome');
      expect(terms).toContain('Greece');
      expect(terms).toContain('Egypt');
    });
  });
});
