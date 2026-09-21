import { NextResponse } from "next/server";
import { listBackendDepartments } from "@/lib/departments";

export async function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country")?.trim() ?? "";

  try {
    const departments = await listBackendDepartments(country);
    return NextResponse.json({ departments });
  } catch (error) {
    console.error("[api/departments] response error", error);

    return NextResponse.json(
      { error: "Unable to load departments right now." },
      { status: 502 },
    );
  }
}