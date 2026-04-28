import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MatchScoreBar } from "@/components/MatchScoreBar";
import { Briefcase, MapPin, ArrowLeft, CheckCircle2, AlertCircle, BookOpen, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";
import { computeMatchScore } from "@/lib/skills";
import { getRecommendedCourses, type CourseRecommendation } from "@/lib/courses";

export const Route = createFileRoute("/seeker/jobs/$jobId")({
  component: JobDetail,
  head: () => ({ meta: [{ title: "Detail Lowongan — NusantaraJobs" }] }),
});

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  required_skills: string[];
  created_at: string;
}

function JobDetail() {
  const { jobId } = useParams({ from: "/seeker/jobs/$jobId" });
  const [job, setJob] = useState<Job | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const [{ data: jobData }, { data: profile }] = await Promise.all([
        supabase.from("jobs").select("*").eq("id", jobId).maybeSingle(),
        supabase.from("seeker_profiles").select("skills").eq("user_id", session.user.id).maybeSingle(),
      ]);

      setJob(jobData);
      setSkills(profile?.skills ?? []);
      setLoading(false);
    })();
  }, [jobId]);

  if (loading) {
    return (
      <AppShell variant="seeker">
        <div className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell variant="seeker">
        <div className="text-center py-16">
          <p className="text-slate-500">Lowongan tidak ditemukan.</p>
          <Link to="/seeker/jobs" className="text-[#FDAA3E] hover:underline text-sm mt-2 inline-block">
            ← Kembali ke daftar
          </Link>
        </div>
      </AppShell>
    );
  }

  const { score, matched, missing } = computeMatchScore(skills, job.required_skills);
  const courses: CourseRecommendation[] = getRecommendedCourses(missing);

  return (
    <AppShell variant="seeker">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/seeker/jobs" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar lowongan
        </Link>

        {/* Header */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-7 h-7 text-slate-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
              <p className="text-slate-600 mt-0.5">{job.company}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <MatchScoreBar score={score} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            MVP: keyword matching. Versi produksi akan menggunakan Azure AI Search dengan semantic embeddings.
          </p>

          <button
            onClick={() => toast.success("Lamaran terkirim (demo). Fitur lamar penuh akan tersedia di versi berikutnya.")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FDAA3E] text-slate-900 px-6 py-3 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.97] shadow"
          >
            Lamar Sekarang
          </button>
        </div>

        {/* Description */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8">
          <h2 className="font-bold text-slate-900 mb-3">Deskripsi Pekerjaan</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Matched skills */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900">Skill yang Cocok</h2>
              <span className="text-xs text-slate-500">({matched.length})</span>
            </div>
            {matched.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada skill yang cocok. Lengkapi profil Anda.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {matched.map((s) => (
                  <span key={s} className="text-xs font-medium rounded-full px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-[#FDAA3E]" />
              <h2 className="font-bold text-slate-900">Skill yang Perlu Ditingkatkan</h2>
              <span className="text-xs text-slate-500">({missing.length})</span>
            </div>
            {missing.length === 0 ? (
              <p className="text-sm text-emerald-700 font-medium">🎉 Semua skill terpenuhi!</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {missing.map((s) => (
                  <span key={s} className="text-xs font-medium rounded-full px-3 py-1 bg-white text-slate-700 border border-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Course recommendations */}
        {courses.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-[#FDAA3E]" />
              <h2 className="font-bold text-slate-900">Rekomendasi Kursus</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">Tingkatkan skill yang kurang dengan kursus berikut:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {courses.map((c) => (
                <a
                  key={c.url}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-amber-300 hover:bg-amber-50/40 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-[#FDAA3E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-900 transition leading-snug">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.provider}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition flex-shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
