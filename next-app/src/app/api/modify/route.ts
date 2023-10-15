import { getModifiedAst } from "@/parser/utils";

export async function POST(req: Request, res: Response) {
  try {
    const sql = await req.text();
    const ast = getModifiedAst(sql);
    return Response.json(ast);
  } catch (error: any) {
    console.error(error);
    return Response.json({ message: `${error.name}: ${error.message}` }, { status: 400 });
  }
}
