/**
 * useAsync Hook
 * 
 * Manages loading, error, and data states for async operations.
 * 
 * USAGE:
 * import { useAsync } from '@/hooks/useAsync';
 * 
 * const { execute, loading, error, data } = useAsync(api.projects.getAll);
 * 
 * // In component
 * useEffect(() => {
 *   execute();
 * }, []);
 * 
 * if (loading) return <LoadingSkeleton />;
 * if (error) return <ErrorMessage />;
 * return <DataDisplay data={data} />;
 */

import { useState, useCallback } from "react";
import { handleAPIError } from "@/lib/api-errors";

interface UseAsyncState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

interface UseAsyncReturn<T, Args extends any[]> extends UseAsyncState<T> {
  execute: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
}

export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>
): UseAsyncReturn<T, Args> {
  const [state, setState] = useState<UseAsyncState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setState({ loading: true, error: null, data: null });

      try {
        const result = await asyncFunction(...args);
        setState({ loading: false, error: null, data: result });
        return result;
      } catch (error) {
        const errorMessage = handleAPIError(error);
        setState({ loading: false, error: errorMessage, data: null });
        return undefined;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return { ...state, execute, reset };
}

// ==============================================
// Variant: useAsyncCallback (for user actions)
// ==============================================

/**
 * useAsyncCallback Hook
 * 
 * Similar to useAsync but doesn't auto-execute.
 * Better for user-triggered actions (button clicks, form submits).
 * 
 * USAGE:
 * const { execute, loading } = useAsyncCallback(async (projectId) => {
 *   await api.projects.delete(projectId);
 *   toast.success("Deleted!");
 * });
 * 
 * <Button onClick={() => execute(project.id)} disabled={loading}>
 *   {loading ? "Deleting..." : "Delete"}
 * </Button>
 */
export function useAsyncCallback<Args extends any[] = [], T = void>(
  asyncFunction: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setLoading(false);
        return result;
      } catch (err) {
        const errorMessage = handleAPIError(err);
        setError(errorMessage);
        setLoading(false);
        return undefined;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { execute, loading, error, reset };
}

// ==============================================
// Usage Examples
// ==============================================

/**
 * Example 1: Fetching data on mount
 * 
 * function ProjectsList() {
 *   const { data, loading, error, execute } = useAsync(api.projects.getAll);
 *   
 *   useEffect(() => {
 *     execute();
 *   }, []);
 *   
 *   if (loading) return <TableSkeleton />;
 *   if (error) return <ErrorMessage message={error} />;
 *   if (!data) return null;
 *   
 *   return <ProjectsTable projects={data.projects} />;
 * }
 */

/**
 * Example 2: User action with loading state
 * 
 * function DeleteButton({ projectId }) {
 *   const { execute, loading } = useAsyncCallback(async (id: string) => {
 *     await api.projects.delete(id);
 *     toast.success("Project deleted!");
 *   });
 *   
 *   return (
 *     <Button 
 *       onClick={() => execute(projectId)} 
 *       disabled={loading}
 *     >
 *       {loading ? "Deleting..." : "Delete"}
 *     </Button>
 *   );
 * }
 */

/**
 * Example 3: Form submission
 * 
 * function CreateProjectForm() {
 *   const { execute, loading, error } = useAsyncCallback(async (data) => {
 *     const result = await api.projects.create(data);
 *     toast.success("Project created!");
 *     return result;
 *   });
 *   
 *   const handleSubmit = async (formData) => {
 *     const result = await execute(formData);
 *     if (result) {
 *       router.push(`/projects/${result.project.id}`);
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <ErrorAlert message={error} />}
 *       <Button type="submit" disabled={loading}>
 *         {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 *         Create Project
 *       </Button>
 *     </form>
 *   );
 * }
 */

