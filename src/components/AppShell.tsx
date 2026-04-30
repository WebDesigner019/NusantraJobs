import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Upload, LayoutDashboard, Search, FilePlus2, ListChecks } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";

interface AppShellProps {
  children: ReactNode;
  variant: "seeker" | "employer";
}

export function AppShell({ children, variant }: AppShellProps) {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  const [allowedRole, setAllowedRole] = useState<"seeker" | "employer" | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouterState();
  const path = router.location.pathname;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isEmployer = roles?.some((r) => r.role === "employer");
      setAllowedRole(isEmployer ? "employer" : "seeker");
      setChecking(false);
    })();
  }, [user, isLoading, navigate]);

  if (isLoading || checking) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  // If on wrong section, redirect
  if (allowedRole && allowedRole !== variant) {
    navigate({ to: allowedRole === "employer" ? "/employer" : "/seeker" });
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const seekerNav = [
    { to: "/seeker", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/seeker/upload", label: "Unggah CV", icon: Upload },
    { to: "/seeker/jobs", label: "Lowongan", icon: Search },
  ];

  const employerNav = [
    { to: "/employer", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/employer/post", label: "Posting Lowongan", icon: FilePlus2 },
  ];

  const nav = variant === "seeker" ? seekerNav : employerNav;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={logo} alt="NusantaraJobs" className="h-9 w-9" width={36} height={36} />
            <span className="font-bold text-slate-900 hidden sm:inline tracking-tight">NusantaraJobs</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.exact ? path === item.to : path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-amber-50 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden border-t border-slate-100 px-5 py-2 flex gap-1 overflow-x-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${active ? "bg-amber-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>

      <footer className="border-t border-slate-200 bg-white mt-12 py-6">
        <div className="max-w-6xl mx-auto px-5 text-center text-xs text-slate-500">
          MVP demo — pencocokan berbasis keyword. Production path: Azure AI Document Intelligence, Azure OpenAI, Azure AI Search.
        </div>
      </footer>
    </div>
  );
}
