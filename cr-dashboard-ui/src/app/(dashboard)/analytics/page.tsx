import { ComingSoon } from "@/components/cr";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Analytics Dashboard"
      description="Advanced analytics and insights for your AI content creation workflow are coming soon."
      features={[
        "Real-time content generation metrics",
        "AI tool usage analytics and cost tracking",
        "Compliance trend analysis over time",
        "Asset performance and engagement metrics",
        "Custom report builder with exportable insights",
        "Team productivity and collaboration stats",
      ]}
    />
  );
}

