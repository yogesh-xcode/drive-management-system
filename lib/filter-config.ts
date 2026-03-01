export type EntityKey = "client" | "staff" | "candidate" | "drive";

type EntityFilterConfig = {
  primary: {
    columns: string[];
    defaultColumn?: string;
  };
  advanced: {
    columns?: string[];
  };
};

const DEFAULT_FILTER_CONFIG: EntityFilterConfig = {
  primary: {
    columns: [],
  },
  advanced: {},
};

export const ENTITY_FILTER_CONFIG: Record<EntityKey, EntityFilterConfig> = {
  client: {
    primary: {
      columns: ["client", "date", "programNo", "opening", "contact"],
      defaultColumn: "client",
    },
    advanced: {},
  },
  staff: {
    primary: {
      columns: ["department", "joinedDate", "name", "email"],
      defaultColumn: "department",
    },
    advanced: {},
  },
  candidate: {
    primary: {
      columns: ["position", "status", "appliedDate", "fullName"],
      defaultColumn: "position",
    },
    advanced: {},
  },
  drive: {
    primary: {
      columns: ["status", "date", "location", "title"],
      defaultColumn: "status",
    },
    advanced: {},
  },
};

export function getEntityFilterConfig(entity: EntityKey): EntityFilterConfig {
  return ENTITY_FILTER_CONFIG[entity] ?? DEFAULT_FILTER_CONFIG;
}
