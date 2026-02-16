"use client";

/**
 * React hook for storyboard state management.
 * All operations work on local state (mock data). Designed for API swap later.
 */

import { useCallback, useMemo, useState } from "react";
import type {
  Storyboard,
  StoryboardFrame,
  StoryboardAct,
} from "@/types/storyboard";
import { getInitialStoryboards } from "@/lib/data/storyboard-mock-data";

const now = () => new Date().toISOString();

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useStoryboard() {
  const [storyboards, setStoryboards] = useState<Storyboard[]>(() =>
    getInitialStoryboards()
  );

  const getStoryboards = useCallback(
    (projectId?: string): Storyboard[] => {
      if (!projectId) return [...storyboards];
      return storyboards.filter((sb) => sb.projectId === projectId);
    },
    [storyboards]
  );

  const getStoryboard = useCallback(
    (id: string): Storyboard | null => {
      return storyboards.find((sb) => sb.id === id) ?? null;
    },
    [storyboards]
  );

  const createStoryboard = useCallback(
    (data: Partial<Storyboard>): Storyboard => {
      const id = data.id ?? nextId("sb");
      const created: Storyboard = {
        id,
        title: data.title ?? "Untitled Storyboard",
        format: data.format ?? "commercial",
        status: data.status ?? "draft",
        acts: data.acts ?? [],
        frames: data.frames ?? [],
        totalDurationSeconds: 0,
        aspectRatio: data.aspectRatio ?? "16:9",
        collaborators: data.collaborators ?? [],
        commentCount: 0,
        provenanceEnabled: data.provenanceEnabled ?? false,
        aclarLinked: data.aclarLinked ?? false,
        createdAt: now(),
        updatedAt: now(),
        createdBy: data.createdBy ?? "Current User",
        version: 1,
        ...data,
      };
      setStoryboards((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const updateStoryboard = useCallback(
    (id: string, updates: Partial<Storyboard>) => {
      setStoryboards((prev) =>
        prev.map((sb) =>
          sb.id === id
            ? { ...sb, ...updates, updatedAt: now(), version: sb.version + 1 }
            : sb
        )
      );
    },
    []
  );

  const deleteStoryboard = useCallback((id: string) => {
    setStoryboards((prev) => prev.filter((sb) => sb.id !== id));
  }, []);

  const addFrame = useCallback(
    (
      storyboardId: string,
      afterFrameId?: string | null,
      frameType: StoryboardFrame["frameType"] = "scene"
    ): StoryboardFrame | null => {
      const sb = storyboards.find((s) => s.id === storyboardId);
      if (!sb) return null;
      const frames = [...sb.frames];
      const newOrder = afterFrameId
        ? (frames.find((f) => f.id === afterFrameId)?.order ?? -1) + 1
        : frames.length;
      const frameId = nextId("f");
      const newFrame: StoryboardFrame = {
        id: frameId,
        storyboardId,
        order: newOrder,
        frameType,
        visualDescription: "",
        durationSeconds: 3,
        linkedAssetIds: [],
        commentCount: 0,
        approvalStatus: "draft",
        createdAt: now(),
        updatedAt: now(),
        createdBy: "Current User",
        version: 1,
      };
      const reordered = frames
        .map((f) => (f.order >= newOrder ? { ...f, order: f.order + 1 } : f))
        .concat([newFrame])
        .sort((a, b) => a.order - b.order);
      setStoryboards((prev) =>
        prev.map((s) =>
          s.id === storyboardId
            ? {
                ...s,
                frames: reordered,
                totalDurationSeconds: reordered.reduce(
                  (sum, f) => sum + f.durationSeconds,
                  0
                ),
                updatedAt: now(),
              }
            : s
        )
      );
      return newFrame;
    },
    [storyboards]
  );

  const updateFrame = useCallback(
    (
      storyboardId: string,
      frameId: string,
      updates: Partial<StoryboardFrame>
    ) => {
      setStoryboards((prev) =>
        prev.map((sb) => {
          if (sb.id !== storyboardId) return sb;
          const frames = sb.frames.map((f) =>
            f.id === frameId
              ? { ...f, ...updates, updatedAt: now(), version: f.version + 1 }
              : f
          );
          const totalDurationSeconds = frames.reduce(
            (sum, f) => sum + f.durationSeconds,
            0
          );
          return {
            ...sb,
            frames,
            totalDurationSeconds,
            updatedAt: now(),
          };
        })
      );
    },
    []
  );

  const deleteFrame = useCallback(
    (storyboardId: string, frameId: string) => {
      setStoryboards((prev) =>
        prev.map((sb) => {
          if (sb.id !== storyboardId) return sb;
          const frames = sb.frames
            .filter((f) => f.id !== frameId)
            .map((f, i) => ({ ...f, order: i }));
          const acts = sb.acts.map((act) => ({
            ...act,
            frameIds: act.frameIds.filter((id) => id !== frameId),
          }));
          const totalDurationSeconds = frames.reduce(
            (sum, f) => sum + f.durationSeconds,
            0
          );
          return {
            ...sb,
            frames,
            acts,
            totalDurationSeconds,
            updatedAt: now(),
          };
        })
      );
    },
    []
  );

  const reorderFrame = useCallback(
    (storyboardId: string, frameId: string, newOrder: number) => {
      setStoryboards((prev) =>
        prev.map((sb) => {
          if (sb.id !== storyboardId) return sb;
          const frame = sb.frames.find((f) => f.id === frameId);
          if (!frame || frame.order === newOrder) return sb;
          const oldOrder = frame.order;
          const frames = sb.frames
            .map((f) => {
              if (f.id === frameId) return { ...f, order: newOrder };
              if (oldOrder < newOrder) {
                if (f.order > oldOrder && f.order <= newOrder)
                  return { ...f, order: f.order - 1 };
              } else {
                if (f.order >= newOrder && f.order < oldOrder)
                  return { ...f, order: f.order + 1 };
              }
              return f;
            })
            .sort((a, b) => a.order - b.order);
          return { ...sb, frames, updatedAt: now() };
        })
      );
    },
    []
  );

  const duplicateFrame = useCallback(
    (storyboardId: string, frameId: string): StoryboardFrame | null => {
      const sb = storyboards.find((s) => s.id === storyboardId);
      const frame = sb?.frames.find((f) => f.id === frameId);
      if (!sb || !frame) return null;
      const newId = nextId("f");
      const newFrame: StoryboardFrame = {
        ...JSON.parse(JSON.stringify(frame)),
        id: newId,
        order: frame.order + 1,
        createdAt: now(),
        updatedAt: now(),
        version: 1,
      };
      const frames = sb.frames
        .map((f) => (f.order > frame.order ? { ...f, order: f.order + 1 } : f))
        .concat([newFrame])
        .sort((a, b) => a.order - b.order);
      setStoryboards((prev) =>
        prev.map((s) =>
          s.id === storyboardId
            ? {
                ...s,
                frames,
                totalDurationSeconds: frames.reduce(
                  (sum, f) => sum + f.durationSeconds,
                  0
                ),
                updatedAt: now(),
              }
            : s
        )
      );
      return newFrame;
    },
    [storyboards]
  );

  const addAct = useCallback(
    (storyboardId: string, name: string): StoryboardAct | null => {
      const sb = storyboards.find((s) => s.id === storyboardId);
      if (!sb) return null;
      const actId = nextId("act");
      const newAct: StoryboardAct = {
        id: actId,
        name,
        order: sb.acts.length,
        frameIds: [],
      };
      setStoryboards((prev) =>
        prev.map((s) =>
          s.id === storyboardId
            ? { ...s, acts: [...s.acts, newAct], updatedAt: now() }
            : s
        )
      );
      return newAct;
    },
    [storyboards]
  );

  const updateAct = useCallback(
    (
      storyboardId: string,
      actId: string,
      updates: Partial<StoryboardAct>
    ) => {
      setStoryboards((prev) =>
        prev.map((s) =>
          s.id === storyboardId
            ? {
                ...s,
                acts: s.acts.map((a) =>
                  a.id === actId ? { ...a, ...updates } : a
                ),
                updatedAt: now(),
              }
            : s
        )
      );
    },
    []
  );

  const deleteAct = useCallback((storyboardId: string, actId: string) => {
    setStoryboards((prev) =>
      prev.map((s) =>
        s.id === storyboardId
          ? {
              ...s,
              acts: s.acts.filter((a) => a.id !== actId),
              updatedAt: now(),
            }
          : s
      )
    );
  }, []);

  const moveFrameToAct = useCallback(
    (storyboardId: string, frameId: string, actId: string) => {
      setStoryboards((prev) =>
        prev.map((sb) => {
          if (sb.id !== storyboardId) return sb;
          const acts = sb.acts.map((act) => {
            const hasFrame = act.frameIds.includes(frameId);
            if (act.id === actId) {
              return hasFrame ? act : { ...act, frameIds: [...act.frameIds, frameId] };
            }
            return hasFrame
              ? { ...act, frameIds: act.frameIds.filter((id) => id !== frameId) }
              : act;
          });
          return { ...sb, acts, updatedAt: now() };
        })
      );
    },
    []
  );

  const getTotalDuration = useCallback(
    (storyboardId: string): number => {
      const sb = storyboards.find((s) => s.id === storyboardId);
      return sb?.frames.reduce((sum, f) => sum + f.durationSeconds, 0) ?? 0;
    },
    [storyboards]
  );

  const getFrameStartTimes = useCallback(
    (storyboardId: string): Record<string, number> => {
      const sb = storyboards.find((s) => s.id === storyboardId);
      if (!sb) return {};
      const sorted = [...sb.frames].sort((a, b) => a.order - b.order);
      let t = 0;
      return sorted.reduce<Record<string, number>>((acc, f) => {
        acc[f.id] = t;
        t += f.durationSeconds;
        return acc;
      }, {});
    },
    [storyboards]
  );

  const getProductionProgress = useCallback(
    (
      storyboardId: string
    ): { total: number; generated: number; approved: number; pending: number } => {
      const sb = storyboards.find((s) => s.id === storyboardId);
      if (!sb) return { total: 0, generated: 0, approved: 0, pending: 0 };
      const total = sb.frames.length;
      let generated = 0;
      let approved = 0;
      let pending = 0;
      sb.frames.forEach((f) => {
        if (f.generationStatus === "generated" || f.generationStatus === "approved") generated++;
        if (f.approvalStatus === "approved") approved++;
        if (f.approvalStatus === "pending_review" || f.approvalStatus === "needs_revision" || f.generationStatus === "not_started" || f.generationStatus === "in_progress") pending++;
      });
      return { total, generated, approved, pending };
    },
    [storyboards]
  );

  return useMemo(
    () => ({
      storyboards,
      getStoryboards,
      getStoryboard,
      createStoryboard,
      updateStoryboard,
      deleteStoryboard,
      addFrame,
      updateFrame,
      deleteFrame,
      reorderFrame,
      duplicateFrame,
      addAct,
      updateAct,
      deleteAct,
      moveFrameToAct,
      getTotalDuration,
      getFrameStartTimes,
      getProductionProgress,
    }),
    [
      storyboards,
      getStoryboards,
      getStoryboard,
      createStoryboard,
      updateStoryboard,
      deleteStoryboard,
      addFrame,
      updateFrame,
      deleteFrame,
      reorderFrame,
      duplicateFrame,
      addAct,
      updateAct,
      deleteAct,
      moveFrameToAct,
      getTotalDuration,
      getFrameStartTimes,
      getProductionProgress,
    ]
  );
}
