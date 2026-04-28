import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MatchScoreBar } from "@/components/MatchScoreBar";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, MapPin, Sparkles, ArrowRight, Briefcase } from "lucide-react";
import { computeMatchScore } from "@/lib/skills";

export const Route = createFileRoute("/seeker/")({
  component: SeekerDashboard,
  head: () => ({ meta: [{ title: "Dashboard Pencari Kerja — NusantaraJobs" }] }),
});

interface SeekerProfile {
  headline: string;
  location: string;
  skills: string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  required_skills: string[];
}

function SeekerDashboard() {
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [topJobs, setTopJobs] = useState<(Job & { score: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const [{ data: profileData }, { data: jobs }] = await Promise.all([
        supabase.from("seeker_profiles").select("headline, location, skills").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("jobs").select("id, title, company, location, required_skills").order("created_at", { ascending: false }).limit(50),
      ]);

      setProfile(profileData ?? null);

      const skills = profileData?.skills ?? [];
      const ranked = (jobs ?? [])
        .map((j) => ({ ...j, ...computeMatchScore(skills, j.required_skills) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setTopJobs(ranked);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell variant="seeker">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Pencari Kerja</h1>
          <p className="text-sm text-slate-500 mt-1">Selamat datang kembali. Berikut rekomendasi pekerjaan untukmu.</p>
        </div>

        {/* Profile summary */}
        {loading ? (
          <div className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        ) : !profile || !profile.skills?.length ? (
          <EmptyProfile />
        ) : (
          <ProfileCard profile={profile} />
        )}

        {/* Top recommendations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Rekomendasi Pekerjaan</h2>
            <Link to="/seeker/jobs" className="text-sm font-medium text-[#FDAA3E] hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : topJobs.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white rounded-2xl border border-slate-200 p-6">Belum ada lowongan.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {topJobs.map((job) => (
                <JobMiniCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function EmptyProfile() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#FDAA3E] flex items-center justify-center mx-auto mb-4">
        <Upload className="w-6 h-6 text-slate-900" />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1.5">Mulai dengan unggah CV</h3>
      <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
        Unggah CV format PDF atau masukkan skill secara manual untuk melihat lowongan yang sesuai.
      </p>
      <Link
        to="/seeker/upload"
        className="inline-flex items-center gap-2 rounded-xl bg-[#FDAA3E] text-slate-900 px-5 py-2.5 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.97] shadow"
      >
        <Upload className="w-4 h-4" />
        Unggah CV
      </Link>
    </div>
  );
}

function ProfileCard({ profile }: { profile: SeekerProfile }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Profil Anda</p>
          <h2 className="font-bold text-slate-900">{profile.headline || "Pencari Kerja"}</h2>
          {profile.location && (
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </p>
          )}
        </div>
        <Link
          to="/seeker/upload"
          className="text-xs font-medium text-[#FDAA3E] hover:underline flex-shrink-0"
        >
          Edit
        </Link>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#FDAA3E]" />
        <span className="text-xs font-semibold text-slate-700">{profile.skills.length} skill terdeteksi</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {profile.skills.slice(0, 12).map((s) => (
          <Badge key={s} variant="secondary" className="bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200">{s}</Badge>
        ))}
        {profile.skills.length > 12 && (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">+{profile.skills.length - 12}</Badge>
        )}
      </div>
    </div>
  );
}

function JobMiniCard({ job }: { job: Job & { score: number } }) {
  return (
    <Link
      to="/seeker/jobs/$jobId"
      params={{ jobId: job.id }}
      className="block rounded-2xl bg-white border border-slate-200 p-5 hover:border-amber-300 hover:shadow-md transition"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 text-slate-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
          <p className="text-sm text-slate-500 truncate">{job.company} · {job.location}</p>
        </div>
      </div>
      <MatchScoreBar score={job.score} size="sm" />
    </Link>
  );
}
