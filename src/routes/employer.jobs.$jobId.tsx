import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MatchScoreBar } from "@/components/MatchScoreBar";
import { Briefcase, MapPin, ArrowLeft, User, Users, Info } from "lucide-react";
import { computeMatchScore } from "@/lib/skills";

export const Route = createFileRoute("/employer/jobs/$jobId")({
  component: EmployerJobDetail,
  head: () => ({ meta: [{ title: "Kandidat Lowongan — NusantaraJobs" }] }),
});

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  required_skills: string[];
  employer_id: string | null;
}

interface SeekerCandidate {
  user_id: string;
  headline: string | null;
  location: string | null;
  experience_years: number | null;
  skills: string[];
  full_name?: string;
}

function EmployerJobDetail() {
  const { jobId } = useParams({ from: "/employer/jobs/$jobId" });
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<(SeekerCandidate & { score: number; matched: string[]; missing: string[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: jobData } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
      setJob(jobData);

      if (jobData) {
        const { data: seekers } = await supabase
          .from("seeker_profiles")
          .select("user_id, headline, location, experience_years, skills");

        // Fetch profiles for names (best effort, RLS allows authenticated SELECT only on own — falls back gracefully)
        const userIds = (seekers ?? []).map((s) => s.user_id);
        let nameMap = new Map<string, string>();
        if (userIds.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
          (profs ?? []).forEach((p: any) => p.full_name && nameMap.set(p.id, p.full_name));
        }

        const ranked = (seekers ?? [])
          .map((s) => ({
            ...s,
            full_name: nameMap.get(s.user_id),
            ...computeMatchScore(s.skills ?? [], jobData.required_skills),
          }))
          .filter((c) => c.score > 0)
          .sort((a, b) => b.score - a.score);
        setCandidates(ranked);
      }
      setLoading(false);
    })();
  }, [jobId]);

  if (loading) {
    return (
      <AppShell variant="employer">
        <div className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell variant="employer">
        <div className="text-center py-16">
          <p className="text-slate-500">Lowongan tidak ditemukan.</p>
          <Link to="/employer" className="text-[#FDAA3E] hover:underline text-sm mt-2 inline-block">← Kembali</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell variant="employer">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/employer" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke dashboard
        </Link>

        {/* Job header */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-7 h-7 text-slate-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
              <p className="text-slate-600 mt-0.5">{job.company}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.required_skills.map((s) => (
              <span key={s} className="text-xs font-medium rounded-full px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200">{s}</span>
            ))}
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Candidates */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Kandidat Berperingkat ({candidates.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Diurutkan berdasarkan kecocokan skill (MVP: keyword matching).
          </p>

          {candidates.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Belum ada kandidat yang cocok.</p>
              <p className="text-xs text-slate-400 mt-1">Kandidat akan muncul setelah pencari kerja melengkapi profil mereka.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((c) => (
                <CandidateCard key={c.user_id} candidate={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function CandidateCard({ candidate }: { candidate: SeekerCandidate & { score: number; matched: string[]; missing: string[] } }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">
                {candidate.full_name || `Kandidat ${candidate.user_id.slice(0, 6)}`}
              </h3>
              <p className="text-sm text-slate-600 truncate">{candidate.headline || "Pencari Kerja"}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {candidate.location && `${candidate.location} · `}
                {candidate.experience_years} tahun pengalaman
              </p>
            </div>
          </div>
          <div className="max-w-xs mb-3">
            <MatchScoreBar score={candidate.score} size="sm" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Cocok ({candidate.matched.length}) / Dibutuhkan ({candidate.matched.length + candidate.missing.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {candidate.matched.slice(0, 8).map((s) => (
                <span key={s} className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {s}
                </span>
              ))}
              {candidate.missing.slice(0, 4).map((s) => (
                <span key={s} className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
