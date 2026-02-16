"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStoryboard } from "@/hooks/useStoryboard";
import { PageContainer } from "@/components/layout/PageContainer";
import type { StoryboardFormat } from "@/types/storyboard";

const VALID_FORMATS: StoryboardFormat[] = [
  "short_form",
  "social_video",
  "commercial",
  "explainer",
  "brand_film",
  "music_video",
  "presentation",
  "custom",
];

export default function NewStoryboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createStoryboard } = useStoryboard();
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return;
    created.current = true;
    const formatParam = searchParams.get("format");
    const format: StoryboardFormat =
      formatParam && VALID_FORMATS.includes(formatParam as StoryboardFormat)
        ? (formatParam as StoryboardFormat)
        : "commercial";
    const sb = createStoryboard({
      title: "Untitled Storyboard",
      format,
      status: "draft",
      acts: [],
      frames: [],
      aspectRatio: format === "short_form" ? "9:16" : "16:9",
      collaborators: [],
    });
    router.replace(`/storyboards/${sb.id}`);
  }, [createStoryboard, router, searchParams]);

  return (
    <PageContainer>
      <p className="text-sm text-muted-foreground">Creating storyboard…</p>
    </PageContainer>
  );
}
