export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="inline-block rounded-full bg-cra-yellow px-4 py-1 text-sm font-semibold">
        Desafio CRA 2026
      </span>
      <h1 className="text-3xl font-bold">Corra. Some pontos. Suba no ranking.</h1>
      <p className="max-w-md text-neutral-600">
        Inscrições abertas de agosto a novembro de 2026. Faça login para
        acompanhar sua pontuação, check-ins e ranking.
      </p>
      <a
        href="/login"
        className="rounded-lg bg-cra-black px-6 py-3 font-semibold text-white"
      >
        Entrar / Cadastrar
      </a>
    </main>
  );
}
