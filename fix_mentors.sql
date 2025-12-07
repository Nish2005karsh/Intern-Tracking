-- Fix Mentors RLS and Data

-- 1. Add SELECT policy for mentors
DROP POLICY IF EXISTS "Admins view all mentors" ON mentors;
CREATE POLICY "Admins view all mentors" ON mentors FOR SELECT USING (
  (auth.jwt() ->> 'user_role') = 'admin'
);

DROP POLICY IF EXISTS "Mentors view own data" ON mentors;
CREATE POLICY "Mentors view own data" ON mentors FOR SELECT USING (
  mentor_id IN (SELECT id FROM profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
);

-- 2. Backfill missing mentor records
INSERT INTO mentors (mentor_id, specialization)
SELECT id, 'General'
FROM profiles
WHERE role = 'mentor'
AND NOT EXISTS (
    SELECT 1 FROM mentors WHERE mentor_id = profiles.id
);

-- 3. Backfill missing student records
INSERT INTO students (student_id, status)
SELECT id, 'active'
FROM profiles
WHERE role = 'student'
AND NOT EXISTS (
    SELECT 1 FROM students WHERE student_id = profiles.id
);
