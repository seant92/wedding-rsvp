import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  const authenticated = session?.value === "authenticated";
  return NextResponse.json({ authenticated });
}
