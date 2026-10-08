import { Link } from "wouter";
import { PageHeader } from "@/components/page-header";

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader title="Page not found" description="That address doesn't match any page on the board." />
      <Link
        href="/"
        className="pressable inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Back to overview
      </Link>
    </div>
  );
}
