CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),g
    email VARCHAR(100),
    grade_level INT
)


CREATE TABLE enrollments (
    student_id INT REFERENCES students(id)
    class_id INT REFERENCES classes(id)
)
