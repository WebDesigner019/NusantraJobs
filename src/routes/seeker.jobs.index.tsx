import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MatchScoreBar } from "@/components/MatchScoreBar";
import { Briefcase, MapPin, Search, Filter } from "lucide-react";
import { computeMatchScore } from "@/lib/skills";

export const Route = createFileRoute("/seeker/jobs/")({
  component: SeekerJobs,
  head: () => ({ meta: [{ title: "Rekomendasi Pekerjaan — NusantaraJobs" }] }),
});

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  required_skills: string[];
  created_at: string;
}

function SeekerJobs() {
  const [jobs, setJobs] = useState<(Job & { score: number; matched: string[]; missing: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "high" | "medium">("all");
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const [{ data: profile }, { data: jobsData }] = await Promise.all([
        supabase.from("seeker_profiles").select("skills").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      ]);

      const userSkills = profile?.skills ?? [];
      setSkills(userSkills);

      const ranked = (jobsData ?? [])
        .map((j) => ({ ...j, ...computeMatchScore(userSkills, j.required_skills) }))
        .sort((a, b) => b.score - a.score);

      setJobs(ranked);
      setLoading(false);
    })();
  }, []);

  const filtered = jobs.filter((j) => {
    if (search && !`${j.title} ${j.company} ${j.location}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "high" && j.score < 75) return false;
    if (filter === "medium" && (j.score < 40 || j.score >= 75)) return false;
    return true;
  });

  return (
    <AppShell variant="seeker">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Rekomendasi Pekerjaan</h1>
          <p className="text-sm text-slate-500 mt-1">
            {skills.length === 0
              ? "Unggah CV terlebih dahulu untuk mendapat skor kecocokan."
              : `${jobs.length} lowongan, diurutkan berdasarkan Skor Kecocokan dengan ${skills.length} skill Anda.`}
          </p>
        </div>

        {/* Filter / search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari posisi, perusahaan, lokasi..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <div className="flex gap-1 bg-white border border-slate-300 rounded-xl p-1">
            {(["all", "high", "medium"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${filter === f ? "bg-[#FDAA3E] text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {f === "all" ? "Semua" : f === "high" ? "Sangat Cocok ≥75%" : "Cukup Cocok 40-74%"}
              </button>
            ))}
          </div>
        </div>

        {/* Job list */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Tidak ada lowongan yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function JobRow({ job }: { job: Job & { score: number; matched: string[]; missing: string[] } }) {
  return (
    <Link
      to="/seeker/jobs/$jobId"
      params={{ jobId: job.id }}
      className="block rounded-2xl bg-white border border-slate-200 p-5 hover:border-amber-300 hover:shadow-md transition"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">{job.title}</h3>
              <p className="text-sm text-slate-600 truncate">{job.company}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3" />
            {job.location}
          </p>
          <div className="max-w-xs">
            <MatchScoreBar score={job.score} size="sm" />
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {job.required_skills.slice(0, 5).map((s) => {
              const matched = job.matched.includes(s);
              return (
                <span
                  key={s}
                  className={`text-[10px] font-medium rounded-full px-2 py-0.5 border ${matched ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                >
                  {s}
                </span>
              );
            })}
            {job.required_skills.length > 5 && (
              <span className="text-[10px] text-slate-400 px-1">+{job.required_skills.length - 5}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
