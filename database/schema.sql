CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 8 AND 12),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
);


CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
);

-- Classes 
-- ONe row per course section
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id INT REFERENCES teachers(id) ON DELETE SET NULL,
    room VARCHAR(50),
    term VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
);

-- enrollements 
-- join table: which students are enrolled in which classes
-- current percentage and current grade are stored values, recalculated
-- when grades are updated, or added, so dashboard reads directly

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    current_percentage NUMERIC(5, 2)
    current_letter_grade VARCHAR(2),
    UNIQUE(student_id, class_id)
);

-- ASSIGNMENTS
-- individual gradeable items
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50),        -- e.g., "Homework", "Quiz", "Exam"
    max_points NUMERIC(6, 2) NOT NULL,
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
);

-- GRADES
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    points_earned NUMERIC(6, 2),
    grades_at TIMESTAMP,
    UNIQUE (assignment_id, student_id)
);

-- TODOS 
-- students personal task list 
-- can add own tasks too
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
);

-- Schedule 
-- recurring weekly class periods

CREATE TABLE schedule_periods (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Sunday, 7=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
);

-- calendar events
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    students_id INT REFERENCES students(id) ON DELETE CASCADE, -- null = school wide event
    class_id INT REFERENCES classes(id) ON DELETE SET NULL, -- optional link - chem test
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    event_type VARCHAR(30), -- e.g., "Exam", "Holiday", "assignment due"
    created_at TIMESTAMP NOT NULL DEFAULT now(),
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_todos_student ON todos(student_id);
CREATE INDEX idx_calendar_events_student ON calendar_events(student_id);

