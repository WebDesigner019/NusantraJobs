import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase,
  ArrowRight,
  Target,
  BookOpen,
  Building2,
  Search,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import shadowBg from "@/assets/shadow-bg.jpg";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "NusantaraJobs — Pencocokan Kerja & Upskilling Berbasis AI" },
      {
        name: "description",
        content:
          "Temukan pekerjaan yang cocok untukmu di Indonesia. Unggah CV, dapatkan Skor Kecocokan, dan tingkatkan skill dengan rekomendasi kursus terkurasi.",
      },
    ],
  }),
});

function LandingPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session?.user) {
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
      })
      .catch(() => setChecked(true));
  }, [navigate]);

  if (!checked) {
    return <div className="min-h-screen bg-[#050d0a]" />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Hero />
      <LogosBar />
      <Features />
      <HowItWorks />
      <ForEmployers />
      <Testimonial />
      <FinalCTA shadowBg={shadowBg} />
      <Footer />
    </div>
  );
}

/* ------------------------------- HERO ------------------------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#050d0a] text-white">
      {/* Background image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.45]"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden
      />
      {/* Gradient wash for legibility */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050d0a]/85 via-[#050d0a]/70 to-[#050d0a]"
        aria-hidden
      />
      {/* Amber glow */}
      <div
        className="absolute -top-40 -right-32 -z-10 h-[600px] w-[600px] rounded-full bg-[#FDAA3E]/20 blur-[120px]"
        aria-hidden
      />

      <Nav transparent />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#FDAA3E]" />
            Pencocokan kerja cerdas untuk talenta Indonesia
          </div>
          <h1
            className="mt-7 text-[2.6rem] font-bold tracking-tight text-white sm:text-5xl lg:text-[4rem]"
            style={{ lineHeight: "1.02", letterSpacing: "-0.02em" }}
          >
            Pekerjaan yang tepat.<br />
            <span className="text-[#FDAA3E]">Skill yang siap pakai.</span>
          </h1>
          <p
            className="mt-7 max-w-2xl text-lg text-white/75"
            style={{ lineHeight: "1.6" }}
          >
            NusantaraJobs menghubungkan pencari kerja Indonesia dengan
            lowongan yang paling cocok berdasarkan skill, lalu memandu
            peningkatan skill yang masih kurang lewat kursus terkurasi.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDAA3E] px-7 py-3.5 text-sm font-bold text-slate-900 shadow-[0_10px_40px_-10px_rgba(253,170,62,0.6)] transition hover:bg-[#fdb95e] active:scale-[0.97]"
            >
              Mulai sebagai Pencari Kerja
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 active:scale-[0.97]"
            >
              <Building2 className="h-4 w-4" />
              Posting Lowongan
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#FDAA3E]" />
              Gratis untuk pencari kerja
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#FDAA3E]" />
              Skor Kecocokan transparan
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#FDAA3E]" />
              Rekomendasi kursus terkurasi
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-20 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-10 sm:gap-10">
          <Stat value="1.2K+" label="Lowongan aktif" />
          <Stat value="85%" label="Akurasi pencocokan" />
          <Stat value="40+" label="Mitra perusahaan" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-white/60 sm:text-sm">{label}</div>
    </div>
  );
}

/* -------------------------------- NAV ------------------------------- */

function Nav({ transparent = false }: { transparent?: boolean }) {
  return (
    <nav
      className={`relative z-20 ${
        transparent ? "" : "border-b border-slate-200/60 bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDAA3E]">
            <Briefcase className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
          </div>
          <span
            className={`font-bold tracking-tight ${
              transparent ? "text-white" : "text-slate-900"
            }`}
          >
            NusantaraJobs
          </span>
        </Link>
        <div
          className={`hidden items-center gap-8 text-sm md:flex ${
            transparent ? "text-white/70" : "text-slate-600"
          }`}
        >
          <a href="#features" className="transition hover:text-[#FDAA3E]">Fitur</a>
          <a href="#how" className="transition hover:text-[#FDAA3E]">Cara Kerja</a>
          <a href="#employers" className="transition hover:text-[#FDAA3E]">Untuk Perusahaan</a>
        </div>
        <Link
          to="/login"
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
            transparent
              ? "bg-white text-slate-900 hover:bg-white/90"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          Masuk
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  );
}

/* ----------------------------- LOGOS BAR ---------------------------- */

function LogosBar() {
  const partners = ["Tokopedia", "Gojek", "Bukalapak", "Traveloka", "Blibli", "Sinarmas"];
  return (
    <section className="border-b border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Dipercaya oleh tim rekrutmen di seluruh Nusantara
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
          {partners.map((p) => (
            <span
              key={p}
              className="text-base font-semibold tracking-tight text-slate-300"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FEATURES ----------------------------- */

const features = [
  {
    icon: Search,
    title: "Unggah CV, ekstrak skill",
    desc: "Unggah CV PDF Anda — sistem mengekstrak skill yang relevan secara otomatis dan menyusun profil profesional.",
  },
  {
    icon: Target,
    title: "Skor Kecocokan transparan",
    desc: "Setiap lowongan menampilkan persentase kecocokan, beserta skill yang sudah cocok dan yang masih perlu ditingkatkan.",
  },
  {
    icon: BookOpen,
    title: "Rekomendasi Kursus",
    desc: "Skill yang masih kurang dipetakan ke kursus dari Coursera, Dicoding, dan freeCodeCamp — siap dipelajari hari ini.",
  },
  {
    icon: TrendingUp,
    title: "Pertumbuhan karier terukur",
    desc: "Pantau peningkatan skill dan jumlah lowongan yang cocok seiring Anda menyelesaikan kursus baru.",
  },
  {
    icon: Users,
    title: "Kandidat berperingkat untuk perusahaan",
    desc: "Perusahaan otomatis menerima daftar kandidat yang sudah diurutkan berdasarkan kecocokan skill.",
  },
  {
    icon: ShieldCheck,
    title: "Privasi & data terlindungi",
    desc: "Data CV dan profil Anda hanya diakses oleh perusahaan saat Anda melamar — Anda tetap yang memegang kendali.",
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FDAA3E]">
            Fitur Utama
          </p>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{ lineHeight: "1.15", letterSpacing: "-0.02em" }}
          >
            Cara cerdas mencari kerja dan meningkatkan skill
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Semua yang Anda butuhkan untuk berpindah dari mencari kerja menjadi siap kerja.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_12px_40px_-12px_rgba(253,170,62,0.25)]"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 transition group-hover:bg-[#FDAA3E]">
                <f.icon className="h-5 w-5 text-[#FDAA3E] transition group-hover:text-slate-900" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- HOW IT WORKS -------------------------- */

const steps = [
  {
    num: "01",
    title: "Daftar & unggah CV",
    desc: "Buat akun sebagai Pencari Kerja, lalu unggah CV PDF Anda atau masukkan skill secara manual.",
  },
  {
    num: "02",
    title: "Lihat rekomendasi kerja",
    desc: "Sistem menampilkan lowongan yang diurutkan berdasarkan Skor Kecocokan dengan profil Anda.",
  },
  {
    num: "03",
    title: "Tingkatkan skill, lamar lagi",
    desc: "Pelajari skill yang kurang lewat kursus rekomendasi, lalu lamar lowongan dengan profil yang lebih kuat.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="border-y border-slate-200 bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FDAA3E]">
            Cara Kerja
          </p>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{ lineHeight: "1.15", letterSpacing: "-0.02em" }}
          >
            Tiga langkah, mulai mencari kerja lebih cerdas
          </h2>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent md:block" />
          {steps.map((s) => (
            <div key={s.num} className="relative text-center">
              <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDAA3E] text-base font-bold text-slate-900 shadow-[0_10px_30px_-10px_rgba(253,170,62,0.6)]">
                {s.num}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- FOR EMPLOYERS -------------------------- */

function ForEmployers() {
  const points = [
    "Posting lowongan dengan skill yang dibutuhkan dalam hitungan menit",
    "Daftar kandidat berperingkat otomatis berdasarkan kecocokan skill",
    "Lihat skill yang sudah cocok dan yang masih kurang dari setiap kandidat",
    "Hemat waktu seleksi awal hingga 70%",
  ];
  return (
    <section id="employers" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FDAA3E]">
              Untuk Perusahaan
            </p>
            <h2
              className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ lineHeight: "1.15", letterSpacing: "-0.02em" }}
            >
              Temukan kandidat yang benar-benar cocok, lebih cepat
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Posting lowongan dan biarkan sistem mencocokkan kandidat berdasarkan
              skill mereka. Tidak ada lagi tumpukan CV yang tidak relevan.
            </p>
            <ul className="mt-7 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#FDAA3E]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.97]"
            >
              Posting Lowongan Pertama Anda
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mock candidate card */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-amber-100/60 via-transparent to-amber-50/40 blur-2xl" />
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Kandidat Berperingkat</h4>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  3 cocok
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Siti Nurhaliza", role: "Frontend Developer", score: 92 },
                  { name: "Budi Santoso", role: "Full Stack Engineer", score: 87 },
                  { name: "Andi Pratama", role: "React Developer", score: 78 },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FDAA3E]/15 text-sm font-bold text-[#FDAA3E]">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {c.name}
                      </div>
                      <div className="truncate text-xs text-slate-500">{c.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{c.score}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        cocok
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- TESTIMONIAL --------------------------- */

function Testimonial() {
  return (
    <section className="bg-slate-50 border-t border-slate-200 py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FDAA3E]">
          Cerita Pengguna
        </p>
        <blockquote
          className="mt-6 text-2xl font-medium leading-snug text-slate-900 sm:text-3xl"
          style={{ letterSpacing: "-0.01em" }}
        >
          “Skor Kecocokan membuat saya tahu persis skill apa yang perlu
          dipelajari. Dalam dua bulan, saya pindah dari magang ke posisi
          Frontend Developer.”
        </blockquote>
        <div className="mt-8 inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDAA3E] text-sm font-bold text-slate-900">
            R
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-900">Rizky Pratama</div>
            <div className="text-xs text-slate-500">Frontend Developer, Jakarta</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FINAL CTA ---------------------------- */

function FinalCTA({ shadowBg }: { shadowBg: string }) {
  return (
    <section className="relative overflow-hidden bg-[#050d0a] py-24 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${shadowBg})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#050d0a]/70 to-[#050d0a]"
        aria-hidden
      />
      <div className="absolute -top-24 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#FDAA3E]/15 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2
          className="text-3xl font-bold tracking-tight sm:text-5xl"
          style={{ lineHeight: "1.05", letterSpacing: "-0.02em" }}
        >
          Karier yang lebih baik <span className="text-[#FDAA3E]">dimulai hari ini.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-white/70 sm:text-lg">
          Bergabunglah dengan ribuan pencari kerja Indonesia yang sudah menemukan
          pekerjaan yang tepat lewat NusantaraJobs.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDAA3E] px-8 py-4 text-sm font-bold text-slate-900 shadow-[0_15px_50px_-15px_rgba(253,170,62,0.7)] transition hover:bg-[#fdb95e] active:scale-[0.97]"
          >
            Buat Akun Gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline"
          >
            Saya perusahaan, ingin posting lowongan →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- FOOTER ----------------------------- */

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDAA3E]">
                <Briefcase className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
              </div>
              <span className="font-bold tracking-tight text-slate-900">NusantaraJobs</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Platform pencocokan kerja dan upskilling yang membantu talenta
              Indonesia menemukan karier yang tepat.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Produk
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-[#FDAA3E]">Fitur</a></li>
              <li><a href="#how" className="hover:text-[#FDAA3E]">Cara Kerja</a></li>
              <li><a href="#employers" className="hover:text-[#FDAA3E]">Untuk Perusahaan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Akun
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li><Link to="/login" className="hover:text-[#FDAA3E]">Masuk</Link></li>
              <li><Link to="/login" className="hover:text-[#FDAA3E]">Daftar</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} NusantaraJobs. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-slate-400">
            Dibangun untuk talenta Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
