export const initialFormState = { sql: "", sqlResult: "", error: "", database: "MySQL" };
type fetcherParams = Pick<typeof initialFormState, "sql" | "database"> & { hash: boolean };
export const isJsonParseable = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const hashFetcher = ({ database, hash, sql }: fetcherParams) =>
  fetch(`/api/sql?hash=${hash.valueOf()}`, {
    method: "POST",
    body: JSON.stringify({ database, sql }),
    headers: { "Content-Type": "application/json" },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.message);
    return data;
  });

export const parseFetcher = (sql: string) =>
  fetch(`/api/parse`, {
    method: "POST",
    body: sql,
    headers: { "Content-Type": "text/plain" },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.message);
    return data;
  });

export const modifyFetcher = (sql: string) =>
  fetch(`/api/modify`, {
    method: "POST",
    body: sql,
    headers: { "Content-Type": "text/plain" },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.message);
    return data;
  });

export const rebuildFetcher = (ast: Record<string, any>) =>
  fetch(`/api/rebuild`, {
    method: "POST",
    body: JSON.stringify(ast),
    headers: { "Content-Type": "application/json" },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.message);
    return data as { query: string };
  });
