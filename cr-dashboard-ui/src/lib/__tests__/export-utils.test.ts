/**
 * Unit Tests for Export Utilities
 * 
 * Run with: npm test export-utils
 */

import { prepareProjectsForExport, prepareLegalIssuesForExport } from '../export-utils';

describe('Export Utilities', () => {
  describe('prepareProjectsForExport', () => {
    it('should format projects correctly for CSV export', () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project',
          description: 'Test Description',
          status: 'Active',
          assets: 5,
          compliance: 92,
          risk: 'Low',
          updated: '2 hours ago',
          owner: 'John Doe',
          createdDate: 'June 15, 2024',
        },
      ];

      const result = prepareProjectsForExport(mockProjects);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        'Project Name': 'Test Project',
        'Description': 'Test Description',
        'Status': 'Active',
        'Assets': 5,
        'Compliance': '92%',
        'Risk Level': 'Low',
        'Last Updated': '2 hours ago',
        'Owner': 'John Doe',
        'Created': 'June 15, 2024',
      });
    });

    it('should handle empty project list', () => {
      const result = prepareProjectsForExport([]);
      expect(result).toEqual([]);
    });

    it('should handle projects with missing optional fields', () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Minimal Project',
          status: 'Draft',
          assets: 0,
          compliance: 0,
          risk: 'High',
          updated: 'Just now',
        },
      ];

      const result = prepareProjectsForExport(mockProjects);

      expect(result[0]).toHaveProperty('Project Name', 'Minimal Project');
      expect(result[0]).toHaveProperty('Description', '');
      expect(result[0]).toHaveProperty('Owner', '');
    });
  });

  describe('prepareLegalIssuesForExport', () => {
    it('should format legal issues correctly', () => {
      const mockIssues = [
        {
          id: 1,
          asset: 'test-image.jpg',
          type: 'Copyright Conflict',
          severity: 'High',
          reported: '2 hours ago',
        },
      ];

      const result = prepareLegalIssuesForExport(mockIssues);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        'Asset': 'test-image.jpg',
        'Issue Type': 'Copyright Conflict',
        'Severity': 'High',
        'Status': undefined,
        'Reported': '2 hours ago',
      });
    });
  });
});

