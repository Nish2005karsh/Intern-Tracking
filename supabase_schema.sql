-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
CREATE TYPE internship_status AS ENUM ('active', 'completed');
CREATE TYPE log_status AS ENUM ('pending', 'approved', 'rejected');

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mentors Table
CREATE TABLE mentors (
    mentor_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    specialization TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE students (
    student_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES mentors(mentor_id) ON DELETE SET NULL,
    department TEXT,
    course TEXT,
    status TEXT,
    phone TEXT,
    enrollment_number TEXT UNIQUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Internships Table
CREATE TABLE internships (
    internship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status internship_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- 5. Logs Table
CREATE TABLE logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours NUMERIC NOT NULL,
    description TEXT,
    status log_status DEFAULT 'pending',
    approved_by UUID REFERENCES mentors(mentor_id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT positive_hours CHECK (hours > 0)
);

-- 6. Documents Table
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT,
    document_type TEXT,
    file_size INT,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Skills Progress Table
CREATE TABLE skills_progress (
    skill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    percentage INT CHECK (percentage >= 0 AND percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Mentor Reviews Table
CREATE TABLE mentor_reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Companies Table
CREATE TABLE companies (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    industry TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Activities Table
CREATE TABLE activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    related_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Optimization
CREATE INDEX idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX idx_students_mentor_id ON students(mentor_id);
CREATE INDEX idx_internships_student_id ON internships(student_id);
CREATE INDEX idx_logs_student_id ON logs(student_id);
CREATE INDEX idx_logs_mentor_id ON logs(mentor_id);
CREATE INDEX idx_documents_student_id ON documents(student_id);
CREATE INDEX idx_skills_progress_student_id ON skills_progress(student_id);
CREATE INDEX idx_mentor_reviews_mentor_id ON mentor_reviews(mentor_id);
CREATE INDEX idx_mentor_reviews_student_id ON mentor_reviews(student_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile. Admins can view all.
-- Profiles:
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (clerk_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING ((auth.jwt() ->> 'user_role') = 'admin');
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (clerk_id = (auth.jwt() ->> 'sub'));
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (clerk_id = (auth.jwt() ->> 'sub'));

-- Students:
CREATE POLICY "Students view own data" ON students FOR SELECT USING (student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Mentors view assigned students" ON students FOR SELECT USING (mentor_id IN (SELECT mentor_id FROM mentors WHERE mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))));
CREATE POLICY "Admins view all students" ON students FOR ALL USING ((auth.jwt() ->> 'user_role') = 'admin');
CREATE POLICY "Users insert own student record" ON students FOR INSERT WITH CHECK (student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));

-- Mentors:
CREATE POLICY "Users insert own mentor record" ON mentors FOR INSERT WITH CHECK (mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));

-- Logs:
CREATE POLICY "Students view own logs" ON logs FOR SELECT USING (student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Students create own logs" ON logs FOR INSERT WITH CHECK (student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Mentors view assigned student logs" ON logs FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE student_id = logs.student_id AND mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))));
CREATE POLICY "Mentors update assigned student logs" ON logs FOR UPDATE USING (EXISTS (SELECT 1 FROM students WHERE student_id = logs.student_id AND mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))));
CREATE POLICY "Admins view all logs" ON logs FOR ALL USING ((auth.jwt() ->> 'user_role') = 'admin');

-- Documents:
CREATE POLICY "Students view own docs" ON documents FOR SELECT USING (student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Students upload own docs" ON documents FOR INSERT WITH CHECK (student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));
CREATE POLICY "Mentors view assigned student docs" ON documents FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE student_id = documents.student_id AND mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))));
CREATE POLICY "Admins view all docs" ON documents FOR ALL USING ((auth.jwt() ->> 'user_role') = 'admin');

-- Activities:
CREATE POLICY "Users view own activities" ON activities FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')));
