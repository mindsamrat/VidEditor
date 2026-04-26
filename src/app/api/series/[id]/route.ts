import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // TODO: load series + queue + recent posts from DB
  return NextResponse.json({ id: params.id, queue: [], recent: [] });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  // TODO: update fields, optionally pause/resume the queue
  return NextResponse.json({ id: params.id, ...body });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // TODO: soft-delete + cancel pending jobs
  return NextResponse.json({ id: params.id, deleted: true });
}
