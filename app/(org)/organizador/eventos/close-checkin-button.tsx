"use client";

import { useTransition } from "react";
import { closeEventCheckin } from "@/lib/actions/organizer";
import { Button } from "@/components/ui/button";

export function CloseCheckinButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(async () => { await closeEventCheckin(eventId); })}
    >
      {isPending ? "Encerrando..." : "Encerrar check-in"}
    </Button>
  );
}
