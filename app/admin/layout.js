import { requireAdmin } from "@/lib/admin/admin-guards";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Portal - FollowProperty",
  description: "Secure Administration Gateway",
};

/**
 * Server-side Admin Layout. Secures all routes matching /admin/*
 * by calling requireAdmin() before rendering any component tree.
 */
export default async function AdminLayout({ children }) {
  // Enforce server-side route protection
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg tracking-tight text-slate-900">
              FollowProperty
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span></span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
    </div>
  );
}
