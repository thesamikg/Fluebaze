import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEMO_COOKIE = "fluebaze-local-demo";

const protectedPrefixes = [
  "/dashboard",
  "/creators",
  "/campaigns",
  "/payments",
  "/settings",
  "/onboarding",
];

export async function proxy(request: NextRequest) {
  const isLocalDemo =
    process.env.NODE_ENV === "development" &&
    request.cookies.get(DEMO_COOKIE)?.value === "1";
  const isDemoAuthPage = ["/login", "/signup"].includes(
    request.nextUrl.pathname,
  );
  if (isLocalDemo && isDemoAuthPage) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }
  if (isLocalDemo) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isProtected = protectedPrefixes.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const isAuthPage = ["/login", "/signup"].includes(request.nextUrl.pathname);

  if (!user && process.env.NODE_ENV === "development" && (isProtected || isAuthPage)) {
    const demoEntry = request.nextUrl.clone();
    demoEntry.pathname = "/dev-entry";
    demoEntry.searchParams.set(
      "next",
      isProtected ? request.nextUrl.pathname : "/dashboard",
    );
    return NextResponse.redirect(demoEntry);
  }

  if (!user && isProtected) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (user && isAuthPage) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
