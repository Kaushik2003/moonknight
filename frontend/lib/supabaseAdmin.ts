import "server-only";

type SupabaseOperator = "eq" | "gt" | "gte" | "lt" | "lte" | "neq";
type SupabaseFilterValue = string | number | boolean | null;

export interface SupabaseFilter {
  column: string;
  operator?: SupabaseOperator;
  value: SupabaseFilterValue;
}

interface OrderBy {
  column: string;
  ascending?: boolean;
}

interface RequestRowsOptions {
  table: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  select?: string;
  filters?: SupabaseFilter[];
  orderBy?: OrderBy;
  limit?: number;
  prefer?: string;
  body?: unknown;
}

interface QueryResult<T> {
  data: T[];
  count: number | null;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are not configured");
  }

  return {
    url: `${url.replace(/\/$/, "")}/rest/v1`,
    serviceRoleKey,
  };
}

function formatFilterValue(value: SupabaseFilterValue) {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

function buildQueryString(options: RequestRowsOptions) {
  const params = new URLSearchParams();

  if (options.select) {
    params.set("select", options.select);
  }

  for (const filter of options.filters ?? []) {
    params.set(
      filter.column,
      `${filter.operator ?? "eq"}.${formatFilterValue(filter.value)}`,
    );
  }

  if (options.orderBy) {
    params.set(
      "order",
      `${options.orderBy.column}.${options.orderBy.ascending ? "asc" : "desc"}`,
    );
  }

  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }

  return params.toString();
}

function parseCount(contentRange: string | null) {
  if (!contentRange) {
    return null;
  }

  const [, countPart] = contentRange.split("/");
  const count = Number(countPart);

  return Number.isFinite(count) ? count : null;
}

async function parseErrorMessage(response: Response) {
  try {
    const json = await response.json();
    if (typeof json?.message === "string") {
      return json.message;
    }
    if (typeof json?.error === "string") {
      return json.error;
    }
    return JSON.stringify(json);
  } catch {
    const text = await response.text();
    return text || `Supabase request failed with status ${response.status}`;
  }
}

async function requestRows<T>(
  options: RequestRowsOptions,
): Promise<QueryResult<T>> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const queryString = buildQueryString(options);
  const requestUrl = `${url}/${options.table}${queryString ? `?${queryString}` : ""}`;

  const headers = new Headers({
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Accept: "application/json",
  });

  if (options.prefer) {
    headers.set("Prefer", options.prefer);
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(requestUrl, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const count = parseCount(response.headers.get("content-range"));

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return { data: [], count };
  }

  const text = await response.text();

  if (!text) {
    return { data: [], count };
  }

  const json = JSON.parse(text) as T | T[];

  return {
    data: Array.isArray(json) ? json : [json],
    count,
  };
}

export async function selectRows<T>(options: {
  table: string;
  select: string;
  filters?: SupabaseFilter[];
  orderBy?: OrderBy;
  limit?: number;
  count?: "exact" | "planned" | "estimated";
}) {
  return requestRows<T>({
    ...options,
    method: "GET",
    prefer: options.count ? `count=${options.count}` : undefined,
  });
}

export async function countRows(
  table: string,
  filters: SupabaseFilter[] = [],
) {
  const { count } = await selectRows({
    table,
    select: "id",
    filters,
    limit: 1,
    count: "exact",
  });

  return count ?? 0;
}

export async function insertRow<T>(
  table: string,
  values: Record<string, unknown>,
  select = "*",
) {
  const { data } = await requestRows<T>({
    table,
    method: "POST",
    body: values,
    select,
    prefer: "return=representation",
  });

  if (!data[0]) {
    throw new Error(`Insert into ${table} did not return a row`);
  }

  return data[0];
}

export async function updateRows<T>(options: {
  table: string;
  values: Record<string, unknown>;
  filters: SupabaseFilter[];
  select?: string;
}) {
  const { data } = await requestRows<T>({
    table: options.table,
    method: "PATCH",
    body: options.values,
    filters: options.filters,
    select: options.select ?? "*",
    prefer: "return=representation",
  });

  return data;
}

export async function deleteRows<T>(options: {
  table: string;
  filters: SupabaseFilter[];
  select?: string;
}) {
  const { data } = await requestRows<T>({
    table: options.table,
    method: "DELETE",
    filters: options.filters,
    select: options.select ?? "*",
    prefer: "return=representation",
  });

  return data;
}
