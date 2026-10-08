import { Link } from "wouter";
import { NexaMark } from "@/components/brand/nexa-mark";
import { PageHeader } from "@/components/page-header";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <section className="panel relative flex min-h-[360px] flex-col items-start justify-end overflow-hidden p-8">
        <div className="hatch pointer-events-none absolute inset-0 [--hatch-color:rgb(255_255_255/0.03)]" />
        <NexaMark className="relative mb-8 h-8 w-auto text-white/15" />
        <h2 className="relative text-xl">{title} isn't built yet</h2>
        <p className="relative mt-2 max-w-md text-sm text-muted-foreground">
          This page is on the plan. Payments, invoices, projects and reports already read from the studio sheet.
        </p>
        <Link
          href="/payments"
          className="pressable relative mt-6 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#2aa6ec]"
        >
          Open payments
        </Link>
      </section>
    </div>
  );
}
