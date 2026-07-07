import type { SessionRepository } from "@/lib/database/repositories/session-repository";
import { buildDashboardData } from "@/lib/analytics/metrics";

type AnalyticsServiceOptions = {
  sessions: Pick<SessionRepository, "listAllForUser">;
  now?: () => Date;
};

export class AnalyticsService {
  private readonly now: () => Date;

  constructor(private readonly options: AnalyticsServiceOptions) {
    this.now = options.now ?? (() => new Date());
  }

  async getDashboardData(userId: string) {
    const sessions = await this.options.sessions.listAllForUser(userId);
    return buildDashboardData(sessions, this.now());
  }
}
