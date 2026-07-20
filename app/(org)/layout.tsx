import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.role !== "organizer" && profile.role !== "admin")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-svh bg-[#0a0a0b] pb-16 text-[#f5f5f0]">
      <header className="sticky top-0 z-40 border-b border-[#2c2c32] bg-[#0a0a0b]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-5 overflow-x-auto px-4 py-3 text-sm">
          <span className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-wide text-[#F5C518]">
            PAINEL DO ORGANIZADOR
          </span>
          <nav className="flex gap-4 text-[#9a9aa2]">
            <Link href="/organizador/validacoes" className="whitespace-nowrap hover:text-[#f5f5f0]">
              Validações
            </Link>
            <Link href="/organizador/eventos" className="whitespace-nowrap hover:text-[#f5f5f0]">
              Eventos
            </Link>
            <Link href="/organizador/participantes" className="whitespace-nowrap hover:text-[#f5f5f0]">
              Participantes
            </Link>
          </nav>
          <Link
            href="/dashboard"
            className="ml-auto shrink-0 whitespace-nowrap text-[#6f6f78] hover:text-[#f5f5f0]"
          >
            Voltar
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </div>
  );
}
