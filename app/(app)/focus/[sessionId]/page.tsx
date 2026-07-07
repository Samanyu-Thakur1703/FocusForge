import { notFound, redirect } from "next/navigation";
import { BrownNoiseToggle } from "@/components/audio/brown-noise-toggle";
import { FocusTimer } from "@/components/session/focus-timer";
import { ReflectionForm } from "@/components/session/reflection-form";
import { SessionControls } from "@/components/session/session-controls";
import { SessionStatusBadge } from "@/components/session/session-status-badge";
import { AuthService } from "@/features/auth/service";
import { SessionService } from "@/features/session/service";
import { ProtocolRepository } from "@/lib/database/repositories/protocol-repository";
import { SessionRepository } from "@/lib/database/repositories/session-repository";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

type FocusSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

type ProtocolStepView = {
  title: string;
  instruction: string;
  durationMinutes?: number;
};

export default async function FocusSessionPage({ params }: FocusSessionPageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const user = await new AuthService(supabase).getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessions = new SessionService({
    repository: new SessionRepository(supabase)
  });
  const session = await sessions.getSession(user.id, sessionId);

  if (!session) {
    notFound();
  }

  const protocol = session.protocol_id
    ? await new ProtocolRepository(supabase).findByIdForUser(session.protocol_id, user.id)
    : null;
  const sprintMinutes = protocol?.sprint_minutes ?? 25;
  const steps = readProtocolSteps(protocol?.steps ?? []);

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">{session.subject}</p>
          <h1 className="text-2xl font-semibold">{protocol?.title ?? "Focus Session"}</h1>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      <FocusTimer
        sessionId={session.id}
        durationSeconds={sprintMinutes * 60}
        initialElapsedSeconds={session.accumulated_seconds}
        status={session.status}
      />

      <section className="rounded-md border p-4">
        <h2 className="mb-3 font-semibold">Protocol</h2>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={`${step.title}-${index}`}>
              <strong>{index + 1}. {step.title}</strong>
              <p>{step.instruction}</p>
            </li>
          ))}
        </ol>
      </section>

      <SessionControls sessionId={session.id} status={session.status} />
      <BrownNoiseToggle />
      <ReflectionForm sessionId={session.id} status={session.status} />
    </main>
  );
}

function readProtocolSteps(value: Json): ProtocolStepView[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const title = item.title;
    const instruction = item.instruction;
    const durationMinutes = item.durationMinutes;

    if (typeof title !== "string" || typeof instruction !== "string") {
      return [];
    }

    return [
      {
        title,
        instruction,
        ...(typeof durationMinutes === "number" ? { durationMinutes } : {})
      }
    ];
  });
}
