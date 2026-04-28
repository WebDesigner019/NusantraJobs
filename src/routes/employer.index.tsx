import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Building2, FilePlus2, Users, MapPin, ArrowRight, Briefcase } from "lucide-react";

export const Route = createFileRoute("/employer/")({
  component: EmployerDashboard,
  head: () => ({ meta: [{ title: "Dashboard Perusahaan — NusantaraJobs" }] }),
});

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  required_skills: string[];
  created_at: string;
}

function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", session.user.id)
        .order("created_at", { ascending: false });
      setJobs(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell variant="employer">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Perusahaan</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola lowongan dan lihat kandidat berperingkat.</p>
          </div>
          <Link
            to="/employer/post"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDAA3E] text-slate-900 px-5 py-2.5 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.97] shadow"
          >
            <FilePlus2 className="w-4 h-4" />
            Posting Lowongan
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <section>
            <h2 className="text-sm font-bold text-slate-700 mb-3">Lowongan Saya ({jobs.length})</h2>
            <div className="space-y-3">
              {jobs.map((job) => <EmployerJobRow key={job.id} job={job} />)}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#FDAA3E] flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-6 h-6 text-slate-900" />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1.5">Belum ada lowongan</h3>
      <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
        Posting lowongan pertama Anda untuk mulai mendapat kandidat berperingkat berdasarkan kecocokan skill.
      </p>
      <Link
        to="/employer/post"
        className="inline-flex items-center gap-2 rounded-xl bg-[#FDAA3E] text-slate-900 px-5 py-2.5 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.97] shadow"
      >
        <FilePlus2 className="w-4 h-4" />
        Posting Lowongan Pertama
      </Link>
    </div>
  );
}

function EmployerJobRow({ job }: { job: Job }) {
  return (
    <Link
      to="/employer/jobs/$jobId"
      params={{ jobId: job.id }}
      className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200 p-5 hover:border-amber-300 hover:shadow-md transition"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Briefcase className="w-5 h-5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate">{job.title}</h3>
        <p className="text-sm text-slate-600 truncate">{job.company}</p>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {job.location}
        </p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
          <Users className="w-3 h-3" /> Lihat kandidat
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
    </Link>
  );
}
