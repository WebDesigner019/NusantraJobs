
-- ============================================================
-- 1. CLEANUP: drop habit tracker tables
-- ============================================================
DROP TABLE IF EXISTS public.habit_logs CASCADE;
DROP TABLE IF EXISTS public.habits CASCADE;

-- ============================================================
-- 2. EXTEND profiles with full_name
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- ============================================================
-- 3. ROLES: enum + table + has_role() function
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('seeker', 'employer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. SEEKER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seeker_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT DEFAULT '',
  location TEXT DEFAULT '',
  experience_years INTEGER DEFAULT 0,
  skills TEXT[] NOT NULL DEFAULT '{}',
  cv_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view seeker profiles"
  ON public.seeker_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own seeker profile"
  ON public.seeker_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seeker profile"
  ON public.seeker_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seeker profile"
  ON public.seeker_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can create jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_id
    AND public.has_role(auth.uid(), 'employer')
  );

CREATE POLICY "Employers can update their own jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = employer_id);

CREATE INDEX IF NOT EXISTS idx_jobs_employer ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON public.jobs(created_at DESC);

-- ============================================================
-- 6. updated_at trigger for seeker_profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_seeker_profiles_updated_at ON public.seeker_profiles;
CREATE TRIGGER update_seeker_profiles_updated_at
  BEFORE UPDATE ON public.seeker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 7. Update handle_new_user trigger to also assign role
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _full_name TEXT;
BEGIN
  _full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );

  -- Insert profile (idempotent)
  INSERT INTO public.profiles (id, display_name, full_name, avatar_url)
  VALUES (
    NEW.id,
    _full_name,
    _full_name,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Determine role from signup metadata, default to 'seeker'
  BEGIN
    _role := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'seeker'::public.app_role);
  EXCEPTION WHEN OTHERS THEN
    _role := 'seeker'::public.app_role;
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. SEED DATA: 15 Indonesian jobs (employer_id NULL = demo seed)
-- ============================================================
INSERT INTO public.jobs (employer_id, title, company, location, description, required_skills) VALUES
(NULL, 'Frontend Developer', 'Tokopedia', 'Jakarta', 'Membangun antarmuka pengguna untuk platform e-commerce terbesar di Indonesia. Kolaborasi dengan tim desain dan backend.', ARRAY['React','TypeScript','Tailwind','HTML','CSS','Git']),
(NULL, 'Backend Engineer', 'Gojek', 'Jakarta', 'Mengembangkan layanan backend skala besar untuk super-app. Fokus pada performa dan keandalan sistem.', ARRAY['Go','PostgreSQL','Docker','Kubernetes','REST API','Git']),
(NULL, 'Product Designer', 'Bukalapak', 'Bandung', 'Mendesain pengalaman pengguna untuk fitur baru marketplace. Membuat wireframe, prototype, dan design system.', ARRAY['Figma','UI Design','UX Research','Prototyping','Design System']),
(NULL, 'Data Analyst', 'Traveloka', 'Jakarta', 'Menganalisis data perilaku pengguna untuk meningkatkan konversi booking. Membuat dashboard dan laporan rutin.', ARRAY['SQL','Python','Excel','Tableau','Data Analysis','Statistics']),
(NULL, 'Mobile Developer (Android)', 'Dana', 'Jakarta', 'Mengembangkan aplikasi dompet digital untuk jutaan pengguna. Fokus pada keamanan dan UX yang mulus.', ARRAY['Kotlin','Android','Java','REST API','Git','Firebase']),
(NULL, 'Digital Marketing Specialist', 'Ruangguru', 'Jakarta', 'Mengelola kampanye digital marketing untuk akuisisi siswa baru. Optimasi performa iklan dan konten.', ARRAY['SEO','SEM','Google Ads','Facebook Ads','Content Marketing','Analytics']),
(NULL, 'DevOps Engineer', 'Blibli', 'Jakarta', 'Mengelola infrastruktur cloud dan CI/CD pipeline. Memastikan availability dan scalability sistem.', ARRAY['AWS','Docker','Kubernetes','Terraform','Linux','CI/CD']),
(NULL, 'Full Stack Developer', 'Halodoc', 'Jakarta', 'Membangun fitur end-to-end untuk platform telemedicine. Bekerja di seluruh stack dari database hingga UI.', ARRAY['Node.js','React','TypeScript','PostgreSQL','REST API','Git']),
(NULL, 'UI/UX Designer', 'Tiket.com', 'Remote', 'Mendesain pengalaman booking yang intuitif untuk produk travel. Fokus pada mobile-first design.', ARRAY['Figma','UI Design','UX Research','Prototyping','User Testing']),
(NULL, 'Content Writer', 'IDN Media', 'Jakarta', 'Menulis konten artikel dan social media untuk audiens Gen Z dan Millennial Indonesia.', ARRAY['Copywriting','SEO','Content Marketing','Social Media','Editorial']),
(NULL, 'QA Engineer', 'OVO', 'Surabaya', 'Memastikan kualitas aplikasi pembayaran melalui automated dan manual testing. Menyusun test plan.', ARRAY['Selenium','Cypress','Manual Testing','Test Automation','Git','SQL']),
(NULL, 'Machine Learning Engineer', 'Shopee', 'Jakarta', 'Membangun model ML untuk rekomendasi produk dan deteksi fraud. Skala produksi jutaan transaksi/hari.', ARRAY['Python','TensorFlow','PyTorch','SQL','Machine Learning','Statistics']),
(NULL, 'HR Business Partner', 'Telkomsel', 'Jakarta', 'Mendukung divisi teknologi dalam strategi people, performance management, dan talent development.', ARRAY['HR Management','Recruitment','People Management','Communication','Excel']),
(NULL, 'Finance Analyst', 'Bank Mandiri', 'Jakarta', 'Menganalisis laporan keuangan dan menyusun proyeksi budget. Mendukung pengambilan keputusan strategis.', ARRAY['Excel','Financial Analysis','Accounting','SQL','PowerPoint','Reporting']),
(NULL, 'Product Manager', 'Ajaib', 'Remote', 'Mendefinisikan roadmap produk investasi. Bekerja dengan tim engineering dan design untuk delivery fitur.', ARRAY['Product Management','Agile','Roadmap','Analytics','Communication','User Research']);
