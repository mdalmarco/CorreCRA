import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[#0a0a0b] text-[#f5f5f0]">
      {children}
      <BottomNav />
    </div>
  );
}
