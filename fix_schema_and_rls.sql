-- Fix Schema and RLS Policies

-- 1. FIX FOREIGN KEYS
-- Ensure students table references profiles
ALTER TABLE students 
DROP CONSTRAINT IF EXISTS students_student_id_fkey;

ALTER TABLE students
ADD CONSTRAINT students_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Ensure mentors table references profiles
ALTER TABLE mentors
DROP CONSTRAINT IF EXISTS mentors_mentor_id_fkey;

ALTER TABLE mentors
ADD CONSTRAINT mentors_mentor_id_fkey
FOREIGN KEY (mentor_id)
REFERENCES profiles(id)
ON DELETE CASCADE;


-- 2. FIX RLS POLICIES (Re-applying to ensure consistency)

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (
  clerk_id = (auth.jwt() ->> 'sub')
);

CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (
  (auth.jwt() ->> 'user_role') = 'admin'
);

CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (
  clerk_id = (auth.jwt() ->> 'sub')
);

CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (
  clerk_id = (auth.jwt() ->> 'sub')
);

-- STUDENTS
DROP POLICY IF EXISTS "Students view own data" ON students;
DROP POLICY IF EXISTS "Mentors view assigned students" ON students;
DROP POLICY IF EXISTS "Admins view all students" ON students;
DROP POLICY IF EXISTS "Users insert own student record" ON students;

CREATE POLICY "Students view own data" ON students FOR SELECT USING (
  student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

CREATE POLICY "Mentors view assigned students" ON students FOR SELECT USING (
  mentor_id IN (SELECT mentor_id FROM mentors WHERE mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub')))
);

CREATE POLICY "Admins view all students" ON students FOR ALL USING (
  (auth.jwt() ->> 'user_role') = 'admin'
);

CREATE POLICY "Users insert own student record" ON students FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

-- MENTORS
DROP POLICY IF EXISTS "Users insert own mentor record" ON mentors;

CREATE POLICY "Users insert own mentor record" ON mentors FOR INSERT WITH CHECK (
  mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

-- LOGS
DROP POLICY IF EXISTS "Students view own logs" ON logs;
DROP POLICY IF EXISTS "Students create own logs" ON logs;
DROP POLICY IF EXISTS "Mentors view assigned student logs" ON logs;
DROP POLICY IF EXISTS "Mentors update assigned student logs" ON logs;
DROP POLICY IF EXISTS "Admins view all logs" ON logs;

CREATE POLICY "Students view own logs" ON logs FOR SELECT USING (
  student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

CREATE POLICY "Students create own logs" ON logs FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

CREATE POLICY "Mentors view assigned student logs" ON logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM students 
    WHERE student_id = logs.student_id 
    AND mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
  )
);

CREATE POLICY "Mentors update assigned student logs" ON logs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM students 
    WHERE student_id = logs.student_id 
    AND mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
  )
);

CREATE POLICY "Admins view all logs" ON logs FOR ALL USING (
  (auth.jwt() ->> 'user_role') = 'admin'
);

-- DOCUMENTS
DROP POLICY IF EXISTS "Students view own docs" ON documents;
DROP POLICY IF EXISTS "Students upload own docs" ON documents;
DROP POLICY IF EXISTS "Mentors view assigned student docs" ON documents;
DROP POLICY IF EXISTS "Admins view all docs" ON documents;

CREATE POLICY "Students view own docs" ON documents FOR SELECT USING (
  student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

CREATE POLICY "Students upload own docs" ON documents FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

CREATE POLICY "Mentors view assigned student docs" ON documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM students 
    WHERE student_id = documents.student_id 
    AND mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
  )
);

CREATE POLICY "Admins view all docs" ON documents FOR ALL USING (
  (auth.jwt() ->> 'user_role') = 'admin'
);

-- ACTIVITIES
DROP POLICY IF EXISTS "Users view own activities" ON activities;

CREATE POLICY "Users view own activities" ON activities FOR SELECT USING (
  user_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);
