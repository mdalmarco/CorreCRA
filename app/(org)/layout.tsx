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
    <div className="min-h-svh bg-neutral-50 pb-16">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 overflow-x-auto px-4 py-3 text-sm">
          <span className="shrink-0 font-bold">Painel do organizador</span>
          <nav className="flex gap-4 text-neutral-500">
            <Link href="/organizador/validacoes" className="hover:text-neutral-900">
              Validacoes
            </Link>
            <Link href="/organizador/eventos" className="hover:text-neutral-900">
              Eventos
            </Link>
            <Link href="/organizador/participantes" className="hover:text-neutral-900">
              Participantes
            </Link>
          </nav>
          <Link href="/dashboard" className="ml-auto shrink-0 text-neutral-400 hover:text-neutral-900">
            Voltar
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </div>
  );
}
