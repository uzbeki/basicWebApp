import { hashQueryColumns, unhashQueryColumns } from "@/parser/utils";

export async function POST(req: Request, res: Response) {
  const data = (await req.json()) as { sql: string; database: string };
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get("hash") === "true";
  try {
    const result = hash ? hashQueryColumns(data) : await unhashQueryColumns(data);
    return Response.json(result);
  } catch (error: any) {
    console.error(error);
    return Response.json({ message: `${error.name}: ${error.message}` }, { status: 400 });
  }
}
