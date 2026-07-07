import type { SymptomKey } from "@/lib/protocol-engine/symptoms";
import type {
  GeneratedProtocol,
  ProtocolProvider,
  ProtocolProviderInput,
  ProtocolStep
} from "@/lib/protocol-engine/provider";

export class RuleBasedProtocolProvider implements ProtocolProvider {
  readonly id = "rule_based" as const;
  readonly version = "v1";

  generateAssessmentProtocol(input: ProtocolProviderInput): GeneratedProtocol {
    const symptomKeys = input.symptomKeys ?? [];
    const primarySprintMinutes = chooseSprintMinutes(symptomKeys);
    const steps = buildAssessmentSteps(symptomKeys, input.subject).slice(0, 6);

    return {
      title: buildTitle(symptomKeys),
      coachMessage: buildCoachMessage(symptomKeys, input.subject),
      symptomKeys,
      steps,
      sprintMinutes: primarySprintMinutes,
      breakMinutes: primarySprintMinutes <= 15 ? 5 : 5,
      providerMetadata: {
        mode: "assessment",
        subject: input.subject,
        ruleSet: this.version
      }
    };
  }

  generateQuickProtocol(input: ProtocolProviderInput): GeneratedProtocol {
    return {
      title: "25-Minute Focus Sprint",
      coachMessage: `Start with one clear task for ${input.subject}. Keep this simple and protect the next 25 minutes.`,
      symptomKeys: [],
      sprintMinutes: 25,
      breakMinutes: 5,
      providerMetadata: {
        mode: "quick",
        subject: input.subject,
        ruleSet: this.version
      },
      steps: [
        {
          title: "Clear the study surface",
          instruction: "Remove unrelated tabs, papers, and objects from your immediate workspace.",
          durationMinutes: 1
        },
        {
          title: "Define one task",
          instruction: `Choose exactly one ${input.subject} task to work on during this sprint.`,
          durationMinutes: 2
        },
        {
          title: "Put distractions away",
          instruction: "Place your phone out of reach or enable a blocker before the timer starts.",
          durationMinutes: 1
        },
        {
          title: "Start the sprint",
          instruction: "Work on the single task for 25 minutes. Do not switch tasks mid-sprint.",
          durationMinutes: 25
        },
        {
          title: "Take a short break",
          instruction: "Step away for 5 minutes, then decide whether to continue.",
          durationMinutes: 5
        }
      ]
    };
  }
}

const symptomLabels: Record<SymptomKey, string> = {
  cant_start: "Can't start studying",
  phone_distraction: "Phone distraction",
  social_media: "Social media distraction",
  sleepiness: "Sleepiness",
  anxiety: "Anxiety",
  mind_wandering: "Mind wandering",
  low_motivation: "Lack of motivation",
  burnout: "Burnout",
  overwhelm: "Overwhelm"
};

function chooseSprintMinutes(symptomKeys: SymptomKey[]) {
  if (symptomKeys.includes("sleepiness")) {
    return 10;
  }

  if (
    symptomKeys.includes("anxiety") ||
    symptomKeys.includes("burnout") ||
    symptomKeys.includes("overwhelm")
  ) {
    return 15;
  }

  if (symptomKeys.includes("cant_start") || symptomKeys.includes("low_motivation")) {
    return 20;
  }

  return 25;
}

function buildTitle(symptomKeys: SymptomKey[]) {
  if (symptomKeys.includes("sleepiness")) {
    return "Low-Energy Study Reset";
  }

  if (symptomKeys.includes("anxiety")) {
    return "Calm Start Focus Protocol";
  }

  if (symptomKeys.includes("burnout") || symptomKeys.includes("overwhelm")) {
    return "Reduced-Scope Recovery Sprint";
  }

  if (symptomKeys.includes("phone_distraction") || symptomKeys.includes("social_media")) {
    return "Distraction Shield Focus Protocol";
  }

  if (symptomKeys.includes("cant_start") || symptomKeys.includes("low_motivation")) {
    return "Activation Focus Protocol";
  }

  return "Single-Task Focus Protocol";
}

function buildCoachMessage(symptomKeys: SymptomKey[], subject: string) {
  const labels = symptomKeys.map((key) => symptomLabels[key]).join(", ");
  return `Your blocker is ${labels || "unclear focus friction"}. For ${subject}, the goal is to lower the starting cost and complete one protected sprint.`;
}

function buildAssessmentSteps(symptomKeys: SymptomKey[], subject: string): ProtocolStep[] {
  const steps: ProtocolStep[] = [];

  addDistractionSteps(steps, symptomKeys);
  addRegulationSteps(steps, symptomKeys);
  addActivationSteps(steps, symptomKeys, subject);
  addAttentionSteps(steps, symptomKeys);

  steps.push({
    title: "Start the focus sprint",
    instruction: `Study one ${subject} task for ${chooseSprintMinutes(symptomKeys)} minutes. Keep the task visible and do not switch goals.`,
    durationMinutes: chooseSprintMinutes(symptomKeys)
  });

  steps.push({
    title: "Take a short break",
    instruction: "Pause for 5 minutes, stand up, and decide whether to run another sprint.",
    durationMinutes: 5
  });

  return dedupeSteps(steps);
}

function addDistractionSteps(steps: ProtocolStep[], symptomKeys: SymptomKey[]) {
  if (symptomKeys.includes("phone_distraction") || symptomKeys.includes("social_media")) {
    steps.push({
      title: "Block the distraction loop",
      instruction: "Put your phone across the room and enable a website or app blocker before starting.",
      durationMinutes: 2
    });
  }
}

function addRegulationSteps(steps: ProtocolStep[], symptomKeys: SymptomKey[]) {
  if (symptomKeys.includes("anxiety")) {
    steps.push({
      title: "Run a breathing reset",
      instruction: "Breathe in for 4 counts, hold for 2, and exhale for 6. Repeat for 2 minutes.",
      durationMinutes: 2
    });
  }

  if (symptomKeys.includes("sleepiness")) {
    steps.push({
      title: "Raise alertness",
      instruction: "Stand up, drink water, and move for 2 minutes before sitting back down.",
      durationMinutes: 2
    });
  }

  if (symptomKeys.includes("burnout") || symptomKeys.includes("overwhelm")) {
    steps.push({
      title: "Reduce the scope",
      instruction: "Pick the smallest useful piece of work. Ignore everything else until the sprint ends.",
      durationMinutes: 3
    });
  }
}

function addActivationSteps(steps: ProtocolStep[], symptomKeys: SymptomKey[], subject: string) {
  if (symptomKeys.includes("cant_start") || symptomKeys.includes("low_motivation")) {
    steps.push({
      title: "Do a 5-minute activation task",
      instruction: `Open your ${subject} material and complete the easiest visible subtask for 5 minutes.`,
      durationMinutes: 5
    });
  } else {
    steps.push({
      title: "Define the next action",
      instruction: `Write the exact ${subject} task you will work on in one sentence.`,
      durationMinutes: 2
    });
  }
}

function addAttentionSteps(steps: ProtocolStep[], symptomKeys: SymptomKey[]) {
  if (symptomKeys.includes("mind_wandering")) {
    steps.push({
      title: "Capture loose thoughts",
      instruction: "Write distracting thoughts on a parking-lot note so you can return to them later.",
      durationMinutes: 3
    });
  }
}

function dedupeSteps(steps: ProtocolStep[]) {
  const seen = new Set<string>();
  return steps.filter((step) => {
    if (seen.has(step.title)) {
      return false;
    }

    seen.add(step.title);
    return true;
  });
}
