import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-neutral-50">
      {children}
      <BottomNav />
    </div>
  );
}
