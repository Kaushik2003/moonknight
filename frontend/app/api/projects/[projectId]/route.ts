import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteRows, updateRows } from "@/lib/supabaseAdmin";

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) {
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

    const { projectId } = await context.params;
    const updatedProjects = await updateRows<ProjectRow>({
      table: "projects",
      values: {
        name: payload.name,
        contract_state: payload.contractState,
        frontend_state: payload.frontendState,
        updated_at: new Date().toISOString(),
      },
      filters: [
        { column: "id", value: projectId },
        { column: "owner_user_id", value: userId },
      ],
    });

    if (!updatedProjects[0]) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: updatedProjects[0] });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update project",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId } = await context.params;
    const deletedProjects = await deleteRows<ProjectRow>({
      table: "projects",
      filters: [
        { column: "id", value: projectId },
        { column: "owner_user_id", value: userId },
      ],
    });

    if (!deletedProjects[0]) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      { status: 500 },
    );
  }
}
