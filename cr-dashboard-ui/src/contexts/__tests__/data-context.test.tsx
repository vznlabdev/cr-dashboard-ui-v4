/**
 * Integration Tests for Data Context
 * 
 * Run with: npm test data-context
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '../data-context';

describe('Data Context', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DataProvider>{children}</DataProvider>
  );

  describe('Projects CRUD', () => {
    it('should create a new project', async () => {
      const { result } = renderHook(() => useData(), { wrapper });

      const initialCount = result.current.projects.length;

      await act(async () => {
        const newProject = await result.current.createProject({
          name: 'Test Project',
          description: 'Test Description',
          owner: 'Test Owner',
          status: 'Draft',
          risk: 'Low',
        });

        expect(newProject.name).toBe('Test Project');
        expect(newProject.status).toBe('Draft');
      });

      expect(result.current.projects.length).toBe(initialCount + 1);
      expect(result.current.projects[0].name).toBe('Test Project');
    });

    it('should update a project', async () => {
      const { result } = renderHook(() => useData(), { wrapper });

      const projectId = result.current.projects[0]?.id;
      expect(projectId).toBeDefined();

      await act(async () => {
        await result.current.updateProject(projectId!, {
          status: 'Approved',
        });
      });

      const updatedProject = result.current.projects.find(p => p.id === projectId);
      expect(updatedProject?.status).toBe('Approved');
      expect(updatedProject?.updated).toBe('Just now');
    });

    it('should delete a project', async () => {
      const { result } = renderHook(() => useData(), { wrapper });

      const initialCount = result.current.projects.length;
      const projectId = result.current.projects[0]?.id;

      await act(async () => {
        await result.current.deleteProject(projectId!);
      });

      expect(result.current.projects.length).toBe(initialCount - 1);
      expect(result.current.projects.find(p => p.id === projectId)).toBeUndefined();
    });

    it('should get project by id', () => {
      const { result } = renderHook(() => useData(), { wrapper });

      const firstProject = result.current.projects[0];
      const foundProject = result.current.getProjectById(firstProject?.id!);

      expect(foundProject).toEqual(firstProject);
    });
  });

  describe('Assets CRUD', () => {
    it('should create a new asset', async () => {
      const { result } = renderHook(() => useData(), { wrapper });

      const projectId = result.current.projects[0]?.id;
      const initialAssetCount = result.current.getProjectAssets(projectId!).length;

      await act(async () => {
        const newAsset = await result.current.createAsset(projectId!, {
          name: 'test-asset.jpg',
          type: 'Image',
          aiMethod: 'AI Generative',
          creator: 'Test User',
          status: 'Draft',
          risk: 'Low',
          compliance: 85,
        });

        expect(newAsset.name).toBe('test-asset.jpg');
      });

      const updatedAssets = result.current.getProjectAssets(projectId!);
      expect(updatedAssets.length).toBe(initialAssetCount + 1);
    });

    it('should delete an asset', async () => {
      const { result } = renderHook(() => useData(), { wrapper });

      const projectId = result.current.projects[0]?.id;
      const assets = result.current.getProjectAssets(projectId!);
      const assetId = assets[0]?.id;

      if (!assetId) {
        // No assets to delete
        return;
      }

      const initialCount = assets.length;

      await act(async () => {
        await result.current.deleteAsset(projectId!, assetId);
      });

      const updatedAssets = result.current.getProjectAssets(projectId!);
      expect(updatedAssets.length).toBe(initialCount - 1);
    });
  });
});

