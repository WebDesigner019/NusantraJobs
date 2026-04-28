import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, ArrowRight, Sparkles, Target, BookOpen, Building2, Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "NusantaraJobs — Pencocokan Kerja & Upskilling Berbasis AI" },
      { name: "description", content: "Unggah CV, dapatkan Skor Kecocokan dengan lowongan kerja Indonesia, dan temukan skill yang perlu ditingkatkan." },
    ],
  }),
});

function LandingPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          // Route by role
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);
          const isEmployer = roles?.some((r) => r.role === "employer");
          navigate({ to: isEmployer ? "/employer" : "/seeker" });
        } else {
          setChecked(true);
        }
      });
    }).catch(() => setChecked(true));
  }, [navigate]);

  if (!checked) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <ForEmployers />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FDAA3E] flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">NusantaraJobs</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition">Fitur</a>
          <a href="#how" className="hover:text-slate-900 transition">Cara Kerja</a>
          <a href="#employers" className="hover:text-slate-900 transition">Untuk Perusahaan</a>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 transition"
        >
          Masuk
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-white to-white pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#FDAA3E]/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Prototype MVP — didukung pencocokan berbasis keyword
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900" style={{ lineHeight: "1.05" }}>
            Temukan pekerjaan yang <span className="text-[#FDAA3E]">cocok untukmu</span>, tingkatkan skill yang kurang.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl" style={{ lineHeight: "1.6" }}>
            NusantaraJobs membantu pencari kerja Indonesia mendapatkan rekomendasi pekerjaan dengan <strong>Skor Kecocokan</strong>, melihat skill yang perlu ditingkatkan, dan menemukan kursus yang tepat — semua dalam satu tempat.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDAA3E] text-slate-900 px-7 py-3.5 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.97] shadow-lg shadow-amber-500/20"
            >
              Saya Pencari Kerja
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-900 px-7 py-3.5 text-sm font-semibold hover:bg-slate-50 transition active:scale-[0.97]"
            >
              Saya Perusahaan
              <Building2 className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Gratis untuk demo • Versi produksi dapat dimigrasikan ke Azure AI Document Intelligence, Azure OpenAI, dan Azure AI Search.
          </p>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Search, title: "Unggah CV", desc: "Unggah CV format PDF, sistem akan otomatis mengekstrak skill dari teks Anda." },
  { icon: Target, title: "Skor Kecocokan", desc: "Setiap lowongan menampilkan persentase kecocokan berdasarkan skill yang dimiliki." },
  { icon: BookOpen, title: "Rekomendasi Kursus", desc: "Skill yang perlu ditingkatkan? Kami sarankan kursus dari Coursera, Dicoding, dan freeCodeCamp." },
];

function Features() {
  return (
    <section id="features" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FDAA3E] mb-3">Fitur Utama</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900" style={{ lineHeight: "1.15" }}>
            Cara cerdas mencari kerja dan upskilling
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-7 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
                <f.icon className="w-6 h-6 text-[#FDAA3E]" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { num: "1", title: "Daftar & unggah CV", desc: "Buat akun sebagai Pencari Kerja, unggah CV PDF atau masukkan skill secara manual." },
  { num: "2", title: "Lihat rekomendasi", desc: "Sistem menampilkan lowongan yang diurutkan berdasarkan Skor Kecocokan." },
  { num: "3", title: "Tingkatkan skill", desc: "Pelajari skill yang perlu ditingkatkan lewat kursus rekomendasi, lalu lamar kembali." },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FDAA3E] mb-3">Cara Kerja</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Tiga langkah, mulai mencari kerja lebih cerdas
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FDAA3E] text-slate-900 flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-amber-500/20">
                {s.num}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForEmployers() {
  return (
    <section id="employers" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-5">
        <div className="rounded-3xl bg-slate-900 text-white p-10 lg:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FDAA3E]/20 blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FDAA3E] mb-3">Untuk Perusahaan</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ lineHeight: "1.15" }}>
              Posting lowongan, dapatkan kandidat berperingkat otomatis
            </h2>
            <p className="mt-5 text-slate-300 leading-relaxed">
              Tulis deskripsi pekerjaan dan skill yang dibutuhkan. Sistem otomatis memberi peringkat kandidat berdasarkan kecocokan skill mereka.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FDAA3E] text-slate-900 px-6 py-3 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.97]"
            >
              Posting Lowongan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-amber-50/40">
      <div className="max-w-2xl mx-auto px-5 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Siap memulai perjalanan kariermu?
        </h2>
        <p className="mt-4 text-slate-600">
          Bergabunglah dengan NusantaraJobs hari ini. Gratis selama prototype MVP.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FDAA3E] text-slate-900 px-8 py-4 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.97] shadow-lg shadow-amber-500/20"
        >
          Mulai Sekarang
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10 bg-white">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FDAA3E] flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm text-slate-900">NusantaraJobs</span>
        </div>
        <p className="text-xs text-slate-500 text-center sm:text-right max-w-md">
          <ShieldCheck className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
          MVP demo. Production path: Azure AI Document Intelligence, Azure OpenAI, Azure AI Search.
        </p>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} NusantaraJobs</p>
      </div>
    </footer>
  );
}
