import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Plus, Info, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { extractSkillsFromText } from "@/lib/skills";
import { extractTextFromPdf } from "@/lib/pdf-extract";

export const Route = createFileRoute("/seeker/upload")({
  component: UploadCV,
  head: () => ({ meta: [{ title: "Unggah CV — NusantaraJobs" }] }),
});

function UploadCV() {
  const navigate = useNavigate();
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [cvText, setCvText] = useState("");
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("seeker_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) {
        setHeadline(data.headline ?? "");
        setLocation(data.location ?? "");
        setExperienceYears(data.experience_years ?? 0);
        setSkills(data.skills ?? []);
        setCvText(data.cv_text ?? "");
      }
      setLoadingProfile(false);
    })();
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      return;
    }
    setExtracting(true);
    setPdfFileName(file.name);
    try {
      const text = await extractTextFromPdf(file);
      setCvText(text);
      const extracted = extractSkillsFromText(text);
      // Merge with existing skills (dedupe)
      const merged = Array.from(new Set([...skills, ...extracted]));
      setSkills(merged);
      toast.success(`${extracted.length} skill terdeteksi dari CV`);
    } catch (err: any) {
      toast.error("Gagal membaca PDF. Coba unggah ulang atau masukkan skill manual.");
      console.error(err);
      setPdfFileName(null);
    } finally {
      setExtracting(false);
    }
  };

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

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    if (skills.length === 0) {
      toast.error("Tambahkan minimal satu skill");
      return;
    }
    setSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { error } = await supabase
        .from("seeker_profiles")
        .upsert({
          user_id: session.user.id,
          headline,
          location,
          experience_years: experienceYears,
          skills,
          cv_text: cvText,
        });
      if (error) throw error;
      toast.success("Profil disimpan!");
      navigate({ to: "/seeker/jobs" });
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell variant="seeker">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Unggah CV</h1>
          <p className="text-sm text-slate-500 mt-1">Skill terdeteksi otomatis dari CV. Anda dapat menambah atau menghapus secara manual.</p>
        </div>

        {/* Honesty disclaimer */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Prototype MVP:</strong> ekstraksi skill berbasis teks/keyword; versi produksi dapat dimigrasikan ke <strong>Azure AI Document Intelligence</strong> untuk akurasi yang lebih tinggi.
          </p>
        </div>

        {loadingProfile ? (
          <div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        ) : (
          <>
            {/* PDF upload */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-1">1. Unggah file PDF (opsional)</h2>
              <p className="text-xs text-slate-500 mb-4">Sistem akan otomatis mengekstrak skill dari teks CV Anda.</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />

              {pdfFileName ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-900 truncate">{pdfFileName}</p>
                    <p className="text-xs text-emerald-700">CV berhasil diproses</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-emerald-800 hover:underline"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={extracting}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 hover:border-amber-300 hover:bg-amber-50/40 transition disabled:opacity-60"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-6 h-6 text-[#FDAA3E] animate-spin" />
                      <span className="text-sm font-medium text-slate-700">Memproses CV...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Klik untuk unggah PDF</span>
                      <span className="text-xs text-slate-500">Maksimal 10 MB</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Profile info */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-slate-900">2. Informasi profil</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Headline / posisi yang dicari</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Contoh: Frontend Developer dengan 3 tahun pengalaman"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lokasi</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jakarta"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pengalaman (tahun)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-slate-900">3. Skill terdeteksi otomatis dari CV</h2>
                <span className="text-xs text-slate-500">{skills.length} skill</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Tambah atau hapus skill secara manual untuk hasil pencocokan yang lebih akurat.
              </p>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-900"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-600 transition">
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
                  placeholder="Tambah skill secara manual (contoh: React)"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <button
                  onClick={addSkill}
                  className="flex items-center gap-1 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-[#FDAA3E] text-slate-900 py-3.5 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-amber-500/20"
            >
              {saving ? "Menyimpan..." : "Simpan & Lihat Rekomendasi"}
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
