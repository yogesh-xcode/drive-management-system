import type { Candidate, Client, Drive, Staff } from "@/types";

export type GlobalSearchEntity = "staff" | "client" | "candidate" | "drive";

export type GlobalSearchItem = {
  id: string;
  entity: GlobalSearchEntity;
  title: string;
  subtitle?: string;
  tokens: string[];
  route: string;
  queryValue: string;
};

const ENTITY_ORDER: GlobalSearchEntity[] = [
  "staff",
  "client",
  "candidate",
  "drive",
];

const normalize = (value: unknown) => String(value ?? "").trim();

const normalizeLower = (value: unknown) => normalize(value).toLowerCase();

function scoreItem(item: GlobalSearchItem, query: string): number {
  const title = normalizeLower(item.title);
  const q = normalizeLower(query);
  if (!q) return 0;

  let score = 0;

  if (title === q) score += 120;
  else if (title.startsWith(q)) score += 90;
  else if (title.includes(q)) score += 65;

  for (const tokenRaw of item.tokens) {
    const token = normalizeLower(tokenRaw);
    if (!token) continue;
    if (token === q) score += 55;
    else if (token.startsWith(q)) score += 35;
    else if (token.includes(q)) score += 18;
  }

  return score;
}

export function buildGlobalSearchIndex(input: {
  staff: Staff[];
  clients: Client[];
  candidates: Candidate[];
  drives: Drive[];
}): GlobalSearchItem[] {
  const staffItems: GlobalSearchItem[] = input.staff.map((row) => {
    const title = normalize(row.name);
    const subtitle = [normalize(row.department), normalize(row.email)]
      .filter(Boolean)
      .join(" • ");
    return {
      id: `staff:${row.id}`,
      entity: "staff",
      title,
      subtitle,
      tokens: [
        title,
        normalize(row.department),
        normalize(row.email),
        normalize(row.id),
      ],
      route: "/staff",
      queryValue: title || normalize(row.email),
    };
  });

  const clientItems: GlobalSearchItem[] = input.clients.map((row) => {
    const title = normalize(row.client);
    const subtitle = [`Program #${normalize(row.programNo)}`, normalize(row.contact)]
      .filter(Boolean)
      .join(" • ");
    return {
      id: `client:${row.id}`,
      entity: "client",
      title,
      subtitle,
      tokens: [
        title,
        normalize(row.contact),
        normalize(row.programNo),
        normalize(row.opening),
      ],
      route: "/client",
      queryValue: title || normalize(row.contact),
    };
  });

  const candidateItems: GlobalSearchItem[] = input.candidates.map((row) => {
    const title = normalize(row.fullName);
    const subtitle = [normalize(row.position), normalize(row.status)]
      .filter(Boolean)
      .join(" • ");
    return {
      id: `candidate:${row.id}`,
      entity: "candidate",
      title,
      subtitle,
      tokens: [
        title,
        normalize(row.position),
        normalize(row.status),
        normalize(row.id),
      ],
      route: "/candidate",
      queryValue: title || normalize(row.position),
    };
  });

  const driveItems: GlobalSearchItem[] = input.drives.map((row) => {
    const title = normalize(row.title);
    const subtitle = [normalize(row.location), normalize(row.status)]
      .filter(Boolean)
      .join(" • ");
    return {
      id: `drive:${row.id}`,
      entity: "drive",
      title,
      subtitle,
      tokens: [
        title,
        normalize(row.location),
        normalize(row.status),
        normalize(row.id),
      ],
      route: "/drive",
      queryValue: title || normalize(row.location),
    };
  });

  return [...staffItems, ...clientItems, ...candidateItems, ...driveItems];
}

export function searchGlobalIndex(
  index: GlobalSearchItem[],
  query: string,
  limit = 12,
): GlobalSearchItem[] {
  const q = normalizeLower(query);
  if (q.length < 2) return [];

  return index
    .map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.title.localeCompare(b.item.title);
    })
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function groupGlobalSearchResults(results: GlobalSearchItem[]): Array<{
  entity: GlobalSearchEntity;
  label: string;
  items: GlobalSearchItem[];
}> {
  const labels: Record<GlobalSearchEntity, string> = {
    staff: "Staff",
    client: "Client",
    candidate: "Candidate",
    drive: "Drive",
  };

  return ENTITY_ORDER.map((entity) => ({
    entity,
    label: labels[entity],
    items: results.filter((item) => item.entity === entity),
  })).filter((group) => group.items.length > 0);
}
