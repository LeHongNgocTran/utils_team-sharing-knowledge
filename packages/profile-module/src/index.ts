import {
  type ModuleExecutionContext,
  type TeamProfile,
  teamProfileSchema
} from "@tsa/schemas";
import { readJsonFile } from "@tsa/shared";

export interface ProfileProvider {
  loadTeamProfile(context: ModuleExecutionContext): Promise<TeamProfile>;
}

type ConfigWithSamples = {
  sampleData?: {
    teamProfile?: string;
  };
};

export class MockProfileProvider implements ProfileProvider {
  async loadTeamProfile(context: ModuleExecutionContext): Promise<TeamProfile> {
    const config = context.config as ConfigWithSamples;
    const samplePath = config.sampleData?.teamProfile ?? "data/samples/team-profile.json";
    const teamProfile = await readJsonFile<unknown>(samplePath);

    return teamProfileSchema.parse(teamProfile);
  }
}

export class RealProfileProvider implements ProfileProvider {
  async loadTeamProfile(): Promise<TeamProfile> {
    throw new Error("RealProfileProvider is not implemented. Replace it with a form, HRIS, sheet, or internal profile integration.");
  }
}
