-- Fix RLS Policies to use JWT Claims for Admin Check
-- This avoids infinite recursion by checking the token directly instead of querying the table.
-- 1. PROFILES
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

-- 2. STUDENTS
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

-- 3. MENTORS
DROP POLICY IF EXISTS "Users insert own mentor record" ON mentors;

CREATE POLICY "Users insert own mentor record" ON mentors FOR INSERT WITH CHECK (
  mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

-- 4. LOGS
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

-- 5. DOCUMENTS
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

-- 6. ACTIVITIES
DROP POLICY IF EXISTS "Users view own activities" ON activities;

CREATE POLICY "Users view own activities" ON activities FOR SELECT USING (
  user_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);
