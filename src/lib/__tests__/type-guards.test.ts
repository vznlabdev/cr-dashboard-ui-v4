/**
 * Unit Tests for Type Guards
 * 
 * Run with: npm test type-guards
 */

import {
  isProject,
  isAsset,
  isValidEmail,
  isValidProjectName,
  isValidComplianceScore,
  validateProject,
} from '../type-guards';

describe('Type Guards', () => {
  describe('isProject', () => {
    it('should return true for valid project', () => {
      const validProject = {
        id: '1',
        name: 'Test Project',
        description: 'Description',
        status: 'Active',
        assets: 5,
        compliance: 92,
        risk: 'Low',
        updated: '2 hours ago',
        createdDate: 'June 15, 2024',
        owner: 'John Doe',
      };

      expect(isProject(validProject)).toBe(true);
    });

    it('should return false for invalid project', () => {
      const invalidProject = {
        id: '1',
        name: 'Test',
        // missing required fields
      };

      expect(isProject(invalidProject)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isProject(null)).toBe(false);
      expect(isProject(undefined)).toBe(false);
      expect(isProject('string')).toBe(false);
      expect(isProject(123)).toBe(false);
      expect(isProject([])).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('name.surname@company.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidProjectName', () => {
    it('should return true for valid names', () => {
      expect(isValidProjectName('My Project')).toBe(true);
      expect(isValidProjectName('Summer Campaign 2024')).toBe(true);
    });

    it('should return false for too short names', () => {
      expect(isValidProjectName('AB')).toBe(false);
      expect(isValidProjectName('  ')).toBe(false);
    });

    it('should return false for too long names', () => {
      const longName = 'a'.repeat(101);
      expect(isValidProjectName(longName)).toBe(false);
    });
  });

  describe('isValidComplianceScore', () => {
    it('should return true for valid scores', () => {
      expect(isValidComplianceScore(0)).toBe(true);
      expect(isValidComplianceScore(50)).toBe(true);
      expect(isValidComplianceScore(100)).toBe(true);
    });

    it('should return false for invalid scores', () => {
      expect(isValidComplianceScore(-1)).toBe(false);
      expect(isValidComplianceScore(101)).toBe(false);
      expect(isValidComplianceScore(NaN)).toBe(false);
    });
  });

  describe('validateProject', () => {
    it('should return project if valid', () => {
      const validProject = {
        id: '1',
        name: 'Test',
        description: 'Desc',
        status: 'Active',
        assets: 0,
        compliance: 0,
        risk: 'Low',
        updated: 'now',
        createdDate: 'today',
        owner: 'me',
      };

      expect(validateProject(validProject)).toEqual(validProject);
    });

    it('should throw error if invalid', () => {
      const invalidProject = { id: '1' };

      expect(() => validateProject(invalidProject)).toThrow('Invalid project data');
    });
  });
});

