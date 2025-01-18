import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Optional API route for future extensions
  return NextResponse.json({
    message: "API route ready",
  });
}
