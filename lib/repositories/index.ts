import { DataService } from "@/lib/repositories/dataService";
import { Client, Staff, Candidate, Drive } from "@/types";
import { UserService } from "./user";

// 1. Client data service (table: client_data, id field: id)
export const clientDataService = new DataService<Client, "id">(
  "client_data",
  "id"
);

// 2. Staff data service (table: staff_data, id field: id)
export const staffDataService = new DataService<Staff, "id">(
  "staff_data",
  "id"
);

// 3. Candidate data service (table: candidate_data, id field: id)
export const candidateDataService = new DataService<Candidate, "id">(
  "candidate_data",
  "id"
);

// 4. 🚀 Drive data service (table: drive_data, id field: id)
export const driveDataService = new DataService<Drive, "id">(
  "drive_data",
  "id"
);

export const userService = new UserService();
