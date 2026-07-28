import Link from "next/link";
import { Check } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f5f6f1] p-3 sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1320px] overflow-hidden rounded-2xl border border-[#e0e2db] bg-white shadow-sm sm:min-h-[calc(100vh-40px)] lg:grid-cols-[.9fr_1.1fr]">
        <section className="flex flex-col px-6 py-6 sm:px-10 lg:px-14">
          <Link href="/" className="inline-flex w-max items-center gap-2 font-semibold tracking-[-.03em]">
            <span className="grid size-8 place-items-center rounded-lg bg-[#171a17] text-sm font-bold text-[#c7ff4a]">F</span>
            Fluebaze
          </Link>
          <div className="my-auto w-full max-w-md py-12">{children}</div>
          <p className="text-xs text-[#8a9087]">© 2026 Fluebaze · Early pilot</p>
        </section>
        <aside className="relative hidden overflow-hidden bg-[#171a17] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 size-[430px] rounded-full bg-[#c7ff4a]/10 blur-3xl" />
          <span className="relative w-max rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#c7ff4a]">Creator ops, without the spreadsheet</span>
          <div className="relative max-w-xl">
            <h1 className="text-5xl font-medium leading-[1.03] tracking-[-.055em]">
              Every creator, deadline and payment in one calm workspace.
            </h1>
            <div className="mt-10 grid gap-4 text-sm text-[#c9cec7]">
              {[
                "Create a campaign and add creators in minutes",
                "Move collaborations through a simple five-stage pipeline",
                "See due content and outstanding payments at a glance",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-[#c7ff4a]/15 text-[#c7ff4a]"><Check size={14} /></span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="relative max-w-lg text-sm leading-6 text-[#8f968c]">
            Built for founders and small D2C teams managing the creators they already know.
          </p>
        </aside>
      </div>
    </main>
  );
}
