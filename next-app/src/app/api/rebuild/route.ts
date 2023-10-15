import { rebuildQuery } from "@/parser/utils";

export async function POST(req: Request, res: Response) {
  try {
    const ast = await req.json();
    const query = await rebuildQuery(ast);
    return Response.json({ query });
  } catch (error: any) {
    console.error(error);
    return Response.json({ message: `${error.name}: ${error.message}` }, { status: 400 });
  }
}
