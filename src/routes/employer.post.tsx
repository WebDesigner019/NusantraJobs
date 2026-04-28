import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { X, Plus, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/post")({
  component: PostJob,
  head: () => ({ meta: [{ title: "Posting Lowongan — NusantaraJobs" }] }),
});

function PostJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills([...skills, s]);
    setSkillInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !location.trim() || !description.trim() || skills.length === 0) {
      toast.error("Lengkapi semua field, termasuk minimal satu skill.");
      return;
    }
    setSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { error } = await supabase.from("jobs").insert({
        employer_id: session.user.id,
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        description: description.trim(),
        required_skills: skills,
      });
      if (error) throw error;
      toast.success("Lowongan berhasil dipublikasikan!");
      navigate({ to: "/employer" });
    } catch (err: any) {
      toast.error(err.message || "Gagal memposting lowongan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell variant="employer">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Posting Lowongan</h1>
          <p className="text-sm text-slate-500 mt-1">Tulis detail lowongan dan skill yang dibutuhkan untuk mendapat kandidat berperingkat.</p>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            Sistem akan otomatis memberi peringkat kandidat berdasarkan kecocokan skill mereka dengan lowongan ini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Pekerjaan *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Frontend Developer"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Perusahaan *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nama perusahaan"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lokasi *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Jakarta / Remote"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Pekerjaan *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan tanggung jawab, kualifikasi, benefit, dll."
                rows={6}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                required
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            <label className="block text-sm font-bold text-slate-900 mb-1">Skill yang Dibutuhkan *</label>
            <p className="text-xs text-slate-500 mb-4">Tambahkan minimal satu skill. Sistem akan mencocokkan dengan skill kandidat.</p>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-900"
                  >
                    {skill}
                    <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Contoh: React, TypeScript, Tailwind..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#FDAA3E] text-slate-900 py-3.5 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-amber-500/20"
          >
            {saving ? "Memposting..." : "Posting Lowongan"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
