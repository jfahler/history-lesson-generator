import { describe, it, expect } from 'vitest';

// Test utility functions that are exported from generate.ts
describe('Lesson Generation Utilities', () => {
  describe('Grade Level Detection Edge Cases', () => {
    it('should handle mixed grade level indicators', () => {
      const { detectGradeLevel } = require('./generate');
      
      // When multiple grade levels are mentioned, should pick the most specific
      const result = detectGradeLevel('Elementary through high school students will analyze AP World History concepts');
      
      // Should prioritize AP over elementary
      expect(result.gradeLevel).toBe('9-12');
      expect(result.gradeRange).toBe('AP/Advanced (9-12)');
    });

    it('should handle non-English grade indicators', () => {
      const { detectGradeLevel } = require('./generate');
      
      const result = detectGradeLevel('Students in their final year of secondary education');
      
      // Should default to high school
      expect(result.gradeLevel).toBe('9-12');
      expect(result.gradeRange).toBe('High School (9-12)');
    });

    it('should handle abbreviated grade formats', () => {
      const { detectGradeLevel } = require('./generate');
      
      const testCases = [
        { input: 'K-12 curriculum', expected: 'K-5' }, // Should pick the first mentioned
        { input: '6-12 standards', expected: '6-8' },
        { input: '9-12 objectives', expected: '9-12' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = detectGradeLevel(input);
        expect(result.gradeLevel).toBe(expected);
      });
    });
  });

  describe('Topic Extraction Edge Cases', () => {
    it('should handle standards with no clear historical content', () => {
      const { extractSearchTerms } = require('./generate');
      
      const vague = 'Students will demonstrate understanding of concepts and apply critical thinking skills.';
      const terms = extractSearchTerms(vague);
      
      // Should still extract some meaningful terms
      expect(terms.length).toBeGreaterThan(0);
      expect(terms).toContain('concepts');
    });

    it('should prioritize historical proper nouns', () => {
      const { extractSearchTerms } = require('./generate');
      
      const standard = 'Students will analyze the Byzantine Empire, Ottoman Empire, and Mongol Empire during the medieval period.';
      const terms = extractSearchTerms(standard);
      
      expect(terms).toContain('Byzantine');
      expect(terms).toContain('Ottoman');
      expect(terms).toContain('Mongol');
      expect(terms).toContain('Empire');
      expect(terms).toContain('medieval');
    });

    it('should handle standards with extensive College Board terminology', () => {
      const { extractSearchTerms } = require('./generate');
      
      const cbStandard = 'Analyze the development and transformation of social structures, including gender roles and family structures, in the context of state-building, expansion, and conflict during periods of economic system creation and interaction.';
      const terms = extractSearchTerms(cbStandard);
      
      expect(terms).toContain('social structures');
      expect(terms).toContain('gender roles');
      expect(terms).toContain('family structures');
      expect(terms).toContain('state-building');
      expect(terms).toContain('expansion');
      expect(terms).toContain('conflict');
    });

    it('should extract terms from complex time period descriptions', () => {
      const { extractSearchTerms } = require('./generate');
      
      const standard = 'Examine the period from the fall of the Western Roman Empire in 476 CE through the Renaissance beginning in the 14th century, focusing on medieval Islamic civilizations and the Crusades.';
      const terms = extractSearchTerms(standard);
      
      expect(terms.some(term => term.includes('476'))).toBe(true);
      expect(terms.some(term => term.includes('14th'))).toBe(true);
      expect(terms).toContain('Renaissance');
      expect(terms).toContain('Islamic');
      expect(terms).toContain('Crusades');
      expect(terms).toContain('medieval');
    });
  });

  describe('Directive Verb Filtering', () => {
    it('should preserve important historical terms while filtering directives', () => {
      const { filterDirectiveVerbs } = require('./generate');
      
      const text = 'Students should analyze and compare the political structures of Ancient Rome and Greece to understand their influence on modern democracy.';
      const filtered = filterDirectiveVerbs(text);
      
      // Should remove directive verbs
      expect(filtered).not.toMatch(/\banalyze\b/);
      expect(filtered).not.toMatch(/\bcompare\b/);
      expect(filtered).not.toMatch(/\bunderstand\b/);
      
      // Should preserve historical content
      expect(filtered).toContain('political structures');
      expect(filtered).toContain('Ancient Rome');
      expect(filtered).toContain('Greece');
      expect(filtered).toContain('modern democracy');
    });

    it('should handle text with multiple directive verbs in sequence', () => {
      const { filterDirectiveVerbs } = require('./generate');
      
      const text = 'Create, develop, and design lesson plans to teach students about the Industrial Revolution.';
      const filtered = filterDirectiveVerbs(text);
      
      expect(filtered).not.toMatch(/\bcreate\b/i);
      expect(filtered).not.toMatch(/\bdevelop\b/i);
      expect(filtered).not.toMatch(/\bdesign\b/i);
      expect(filtered).toContain('Industrial Revolution');
    });

    it('should preserve directive verbs when they appear later in the text', () => {
      const { filterDirectiveVerbs } = require('./generate');
      
      const text = 'The Roman Empire used various strategies to analyze threats and compare military tactics.';
      const filtered = filterDirectiveVerbs(text);
      
      // Should preserve these since they're not at the beginning
      expect(filtered).toContain('analyze threats');
      expect(filtered).toContain('compare military tactics');
    });
  });

  describe('Activity Generation Logic', () => {
    it('should ensure activity variety across grade levels', () => {
      const { generateSuggestedActivities } = require('./generate');
      
      const elementary = generateSuggestedActivities('Ancient Egypt', 'K-5');
      const middle = generateSuggestedActivities('Ancient Egypt', '6-8');
      const high = generateSuggestedActivities('Ancient Egypt', '9-12');
      
      // Should have different activity types for different grade levels
      const elemTypes = elementary.map(a => a.type);
      const middleTypes = middle.map(a => a.type);
      const highTypes = high.map(a => a.type);
      
      expect(elemTypes).not.toEqual(middleTypes);
      expect(middleTypes).not.toEqual(highTypes);
      
      // Elementary should have simpler activities
      expect(elemTypes).toContain('crossword');
      expect(elemTypes).toContain('memory');
      
      // High school should have complex activities
      expect(highTypes).toContain('research');
      expect(highTypes).toContain('discussion');
    });

    it('should generate contextual activity descriptions', () => {
      const { generateSuggestedActivities } = require('./generate');
      
      const activities = generateSuggestedActivities('World War I', '9-12');
      
      activities.forEach(activity => {
        expect(activity.description.toLowerCase()).toContain('world war i');
        expect(activity.pedagogicalBenefit).toBeDefined();
        expect(activity.pedagogicalBenefit.length).toBeGreaterThan(20);
      });
    });

    it('should mark all activities as age-appropriate for their target grade', () => {
      const { generateSuggestedActivities } = require('./generate');
      
      const gradeLevels = ['K-5', '6-8', '9-12', 'College'];
      
      gradeLevels.forEach(grade => {
        const activities = generateSuggestedActivities('Ancient Civilizations', grade);
        activities.forEach(activity => {
          expect(activity.ageAppropriate).toBe(true);
        });
      });
    });
  });

  describe('Standard Cleaning Logic', () => {
    it('should handle standards with bullet points and numbering', () => {
      const { cleanStandard } = require('./generate');
      
      const bulletStandard = `Students will:
• Analyze political structures
• Compare economic systems  
• Evaluate cultural influences
1. Examine primary sources
2. Create historical arguments`;
      
      const result = cleanStandard(bulletStandard);
      
      expect(result.cleaned).toContain('Analyze political structures');
      expect(result.cleaned).toContain('Compare economic systems');
      expect(result.cleaned).toContain('Examine primary sources');
    });

    it('should preserve important punctuation and formatting', () => {
      const { cleanStandard } = require('./generate');
      
      const standard = 'Students will analyze the period 500 BCE - 600 CE, focusing on Rome, Greece, and Persia.';
      const result = cleanStandard(standard);
      
      expect(result.cleaned).toContain('500 BCE - 600 CE');
      expect(result.cleaned).toContain('Rome, Greece, and Persia');
    });

    it('should handle very long standards with repetitive content', () => {
      const { cleanStandard } = require('./generate');
      
      const repetitive = `Students will analyze Ancient Rome. Students will analyze Ancient Rome. They will examine political structures of Ancient Rome. They will examine political structures of Ancient Rome. The focus is on Ancient Rome and its political structures. The focus is on Ancient Rome and its political structures.`;
      
      const result = cleanStandard(repetitive);
      
      // Should significantly reduce length while preserving meaning
      expect(result.cleaned.length).toBeLessThan(repetitive.length * 0.7);
      expect(result.cleaned).toContain('Ancient Rome');
      expect(result.cleaned).toContain('political structures');
    });
  });

  describe('Contextual Activity Creation', () => {
    it('should create activities that reference the search context', () => {
      const { createContextualActivities } = require('./generate');
      
      const activities = createContextualActivities('Byzantine Empire');
      
      activities.forEach(activity => {
        expect(activity.toLowerCase()).toContain('byzantine empire');
      });
    });

    it('should include College Board aligned language', () => {
      const { createContextualActivities } = require('./generate');
      
      const activities = createContextualActivities('Mongol Empire');
      
      const allActivities = activities.join(' ');
      expect(allActivities).toContain('historical thinking skills');
      expect(allActivities).toContain('primary source');
      expect(allActivities).toContain('contextualization');
    });

    it('should generate varied activity types', () => {
      const { createContextualActivities } = require('./generate');
      
      const activities = createContextualActivities('Industrial Revolution');
      
      expect(activities.length).toBeGreaterThan(3);
      
      // Should include different types of activities
      const hasAnalysis = activities.some(a => a.includes('analysis'));
      const hasComparison = activities.some(a => a.includes('comparative'));
      const hasTimeline = activities.some(a => a.includes('timeline'));
      const hasDebate = activities.some(a => a.includes('debate'));
      
      expect(hasAnalysis).toBe(true);
      expect(hasComparison).toBe(true);
      expect(hasTimeline).toBe(true);
      expect(hasDebate).toBe(true);
    });
  });

  describe('Important Terms Extraction', () => {
    it('should extract multi-word historical phrases', () => {
      const { extractImportantTerms } = require('./generate');
      
      const text = 'The Roman Empire and Byzantine Empire influenced Medieval Europe during the Classical Period.';
      const terms = extractImportantTerms(text);
      
      expect(terms).toContain('Roman');
      expect(terms).toContain('Empire');
      expect(terms).toContain('Byzantine');
      expect(terms).toContain('Medieval');
      expect(terms).toContain('Europe');
      expect(terms).toContain('Classical');
      expect(terms).toContain('Period');
    });

    it('should identify cultural and religious terms', () => {
      const { extractImportantTerms } = require('./generate');
      
      const text = 'Islamic Art and Christian Architecture influenced Renaissance Literature and Baroque Science.';
      const terms = extractImportantTerms(text);
      
      expect(terms).toContain('Islamic');
      expect(terms).toContain('Art');
      expect(terms).toContain('Christian');
      expect(terms).toContain('Architecture');
      expect(terms).toContain('Renaissance');
      expect(terms).toContain('Literature');
    });

    it('should handle terms with descriptive adjectives', () => {
      const { extractImportantTerms } = require('./generate');
      
      const text = 'Ancient Greek Philosophy and Early Modern Science shaped Contemporary Political thought.';
      const terms = extractImportantTerms(text);
      
      expect(terms).toContain('Ancient');
      expect(terms).toContain('Greek');
      expect(terms).toContain('Philosophy');
      expect(terms).toContain('Modern');
      expect(terms).toContain('Science');
      expect(terms).toContain('Political');
    });
  });
});
