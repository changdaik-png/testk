// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { orchestrator } from "@/services/generation/agent.orchestrator";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await orchestrator.execute(sessionId || "default-session", message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
