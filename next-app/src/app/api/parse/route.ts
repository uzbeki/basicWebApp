import { parser } from "@/parser/utils";

export async function POST(req: Request, res: Response) {
  const sql = await req.text()
  try {
    const result = parser.astify(sql);
    return Response.json(result);
  } catch (error: any) {
    console.error(error);
    return Response.json({ message: `${error.name}: ${error.message}` }, { status: 400 });
  }
}
