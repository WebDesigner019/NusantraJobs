
# NusantaraJobs — MVP Plan (Final, v3)

Pivot the habit-tracker template into **NusantaraJobs**, an AI-powered job matching & upskilling platform for the Indonesian job market. **UI in Bahasa Indonesia**, honest MVP framing, Azure-portable architecture.

## Honesty Statement (shown in UI)

Every AI-touched surface is labeled as a prototype:
- CV upload result: *"Skill terdeteksi otomatis dari CV"* + small note: *"Prototype MVP: ekstraksi skill berbasis teks/keyword; versi produksi dapat dimigrasikan ke Azure AI Document Intelligence."*
- Match score card: *"Skor dihitung dari kecocokan keyword skill (MVP). Versi produksi: Azure AI Search + embeddings."*
- Footer / About: *"MVP demo. Production path: Azure AI Document Intelligence, Azure OpenAI, Azure AI Search."*

## Architecture

| Architecture doc says (Azure) | MVP implementation | Migration path |
|---|---|---|
| Azure AI Document Intelligence | Client-side `pdfjs-dist` + keyword skill extraction | Swap to Azure DI REST in edge function |
| Azure OpenAI | Lovable AI Gateway (OpenAI-compatible) — only if chatbot built | Change endpoint URL + auth header |
| Azure AI Search | Skill-overlap scoring (matched/required × 100) | Add Azure Search with embeddings |
| Azure SQL / Cosmos DB | Lovable Cloud (PostgreSQL) | Optional migration |
| Azure Blob Storage | Lovable Cloud Storage | Optional migration |
| Azure AD B2C | Lovable Cloud Auth (email + Google) | Optional migration |

## Pages & Routes (UI in Bahasa Indonesia)

```
/                       Landing page (hero, CTA: "Untuk Pencari Kerja" / "Untuk Perusahaan")
/login                  Masuk / Daftar (email + Google), pilih peran saat daftar
/seeker                 Dashboard Pencari Kerja
/seeker/upload          Unggah CV — atau input skill manual
/seeker/jobs            Rekomendasi Pekerjaan (semua lowongan + skor)
/seeker/jobs/$id        Detail lowongan: Skor Kecocokan, Skill yang Cocok, Skill yang Perlu Ditingkatkan, Rekomendasi Kursus
/employer               Dashboard Perusahaan (lowongan saya)
/employer/post          Posting Lowongan
/employer/jobs/$id      Detail lowongan + kandidat berperingkat
```

## Core UI Labels (Bahasa Indonesia)

| Surface | Label |
|---|---|
| CV upload page title | Unggah CV |
| CV upload subtitle | Skill terdeteksi otomatis dari CV |
| Manual input fallback | Atau masukkan skill secara manual |
| Job recommendations | Rekomendasi Pekerjaan |
| Match score | Skor Kecocokan |
| Matched skills section | Skill yang Cocok |
| Missing skills section | Skill yang Perlu Ditingkatkan |
| Course recommendations | Rekomendasi Kursus |
| Seeker dashboard | Dashboard Pencari Kerja |
| Employer dashboard | Dashboard Perusahaan |
| Post a job button | Posting Lowongan |
| Apply button | Lamar Sekarang |
| Sign in / up | Masuk / Daftar |
| Logout | Keluar |

Job descriptions, course names, and seed data also in Bahasa Indonesia where natural.

## Implementation Priority (in order)

1. **Cleanup & branding** — remove habit tracker files; update meta tags, landing page to NusantaraJobs (Bahasa Indonesia)
2. **Database** — migration: `profiles`, `seeker_profiles`, `jobs`, `user_roles` + RLS + `has_role()` + ~15 seed jobs (Indonesian market)
3. **Auth** — Masuk/Daftar with role selection (Pencari Kerja / Perusahaan); redirect by role; Google OAuth fix from `.lovable/plan.md` applied
4. **Seeker — CV upload & manual input** — `/seeker/upload`: PDF parse via `pdfjs-dist` OR manual skill chips; preview extracted skills (editable) before save
5. **Seeker — Skill extraction preview** — Editable chip list with honesty note
6. **Seeker — Job recommendations** — `/seeker/jobs`: list with `<Progress>` bar match score, sort by score desc
7. **Seeker — Job detail** — `/seeker/jobs/$id`: full description, **Skill yang Cocok** (filled badges), **Skill yang Perlu Ditingkatkan** (outline badges), **Rekomendasi Kursus** (static map → Coursera/Dicoding/freeCodeCamp links)
8. **Employer — Posting Lowongan** — `/employer/post`: form (title, company, location, description, required skills tag input)
9. **Employer — Dashboard** — `/employer`: list of own jobs; `/employer/jobs/$id`: ranked seeker matches with scores
10. **Polish** — empty states (Bahasa Indonesia), loading skeletons, error toasts, mobile responsive QA
11. **(Optional, last)** Career chatbot — only if time permits after the matching flow is complete and working. Lovable AI Gateway, streaming, system prompt as Indonesian career coach.

## Database Schema

```
profiles            id (=auth.uid), full_name, created_at
seeker_profiles     user_id (PK/FK), headline, location, experience_years, skills (text[]), cv_text
jobs                id, employer_id, title, company, location, description, required_skills (text[]), created_at
user_roles          id, user_id, role (enum: seeker, employer), unique(user_id, role)
```

RLS via `has_role()` security-definer function:
- `seeker_profiles`: owner full CRUD; authenticated employers SELECT
- `jobs`: any authenticated SELECT; only owner employer INSERT/UPDATE/DELETE
- `profiles`: owner CRUD; authenticated SELECT
- `user_roles`: owner SELECT only; INSERT via signup trigger

## Skill Extraction Logic (MVP, honest)

- Curated `src/lib/skills.ts` dictionary (~200 skills: tech, design, marketing, finance, Indonesian-market terms)
- Extract: lowercase CV text → match against dictionary (word boundaries)
- Display result with header *"Skill terdeteksi otomatis dari CV"* and italic disclaimer below
- Chips are editable — user can add/remove before saving (transparency + control)

## Match Score (MVP, honest)

```
score = (matched_required_skills / total_required_skills) × 100
```
- Color: ≥75% green, 40–74% amber, <40% gray
- Label: *"Skor Kecocokan: 67% — berdasarkan kecocokan skill"*
- Tooltip: *"MVP menggunakan keyword matching. Versi produksi akan menggunakan Azure AI Search dengan semantic embeddings."*

## Design

- White background, generous whitespace, professional startup aesthetic
- Brand color: amber `#FDAA3E` (kept from template, fits Indonesian warmth)
- Plus Jakarta Sans (already loaded — perfect for Indonesian product)
- shadcn/ui: Card, Badge, Progress, Tabs, Sheet, Input, Textarea, Button
- Mobile-first responsive (1-col mobile, 2-col desktop)

## Out of Scope (deferred)

- Real apply/messaging flow (button is intent only, shows toast)
- Vector embeddings / semantic matching
- Career chatbot (optional, only if time permits)
- Mobile native app
- English UI translation toggle

## Memory Updates

After build, update `mem://index.md` Core: replace habit-tracker vision/tables with NusantaraJobs (UI in Bahasa Indonesia, tables: profiles/seeker_profiles/jobs/user_roles, MVP uses keyword matching with Azure-portable architecture).

Approve to switch to build mode and implement.
