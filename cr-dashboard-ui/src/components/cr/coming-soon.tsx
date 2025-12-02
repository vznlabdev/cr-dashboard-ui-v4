import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, Rocket, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  className?: string;
}

export function ComingSoon({
  icon: Icon = Rocket,
  title,
  description,
  features,
  className,
}: ComingSoonProps) {
  return (
    <div className={cn("min-h-[60vh] flex items-center justify-center p-4 animate-fade-in", className)}>
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">{title}</CardTitle>
          <CardDescription className="text-base mt-3">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {features && features.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-6">
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                Planned Features
              </h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/projects">
                View Projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

