import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, resetDemoStore } from "@/lib/demo-store";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  resetDemoStore();
  const requested = request.nextUrl.searchParams.get("next");
  const destination =
    requested?.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/dashboard";
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
