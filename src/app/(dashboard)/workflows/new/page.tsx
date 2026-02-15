import { Suspense } from "react";
import {
  NewWorkflowClient,
  NewWorkflowPageSkeleton,
} from "./NewWorkflowClient";

export default function NewWorkflowPage() {
  return (
    <Suspense fallback={<NewWorkflowPageSkeleton />}>
      <NewWorkflowClient />
    </Suspense>
  );
}
