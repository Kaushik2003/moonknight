import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { insertRow, selectRows } from "@/lib/supabaseAdmin";

interface ProjectRow {
  id: string;
  name: string;
  updated_at: string;
  created_at: string;
  contract_state: unknown;
  frontend_state: unknown;
}

interface ProjectPayload {
  name: string;
  contractState: unknown;
  frontendState: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseProjectPayload(body: unknown): ProjectPayload | null {
  if (!isRecord(body)) {
    return null;
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || !("contractState" in body) || !("frontendState" in body)) {
    return null;
  }

  return {
    name,
    contractState: body.contractState,
    frontendState: body.frontendState,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await selectRows<ProjectRow>({
      table: "projects",
      select: "id, name, updated_at, created_at, contract_state, frontend_state",
      filters: [{ column: "owner_user_id", value: userId }],
      orderBy: { column: "updated_at", ascending: false },
    });

    return NextResponse.json({ projects: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load projects",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = parseProjectPayload(await request.json());
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid project payload" },
        { status: 400 },
      );
    }

    const project = await insertRow<ProjectRow>("projects", {
      owner_user_id: userId,
      name: payload.name,
      contract_state: payload.contractState,
      frontend_state: payload.frontendState,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save project",
      },
      { status: 500 },
    );
  }
}
