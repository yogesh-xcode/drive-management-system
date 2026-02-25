// services.ts
import {
  clientDataService,
  staffDataService,
  candidateDataService,
  driveDataService,
} from "@/lib/repositories";

export const serviceMap = {
  client: clientDataService,
  staff: staffDataService,
  candidate: candidateDataService,
  drive: driveDataService,
};
