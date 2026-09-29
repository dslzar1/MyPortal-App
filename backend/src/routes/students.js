const express = require("express");
const pool = require("../db");

const router = express.Router();

// Maps a letter grade to standard 4.0-scale GPA points.
// Used to compute GPA in JavaScript after fetching each class's grade,
// rather than doing the mapping inside the SQL query.
const GPA_POINTS = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

// GET /api/students/:id/dashboard
// Returns this student's classes with their current grade, plus overall GPA.
// This is the data your Dashboard screen (Class Overview + GPA) needs.
router.get("/:id/dashboard", async (req, res) => {
  const studentId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT c.id AS class_id, c.name, c.subject,
              e.current_percentage, e.current_letter_grade
       FROM enrollments e
       JOIN classes c ON c.id = e.class_id
       WHERE e.student_id = $1
       ORDER BY c.name`,
      [studentId]
    );

    const classes = result.rows;

    // Compute GPA: average the grade points across every class that has
    // a letter grade recorded. Classes with no grade yet are skipped.
    const gradedClasses = classes.filter((c) => c.current_letter_grade);
    const gpa =
      gradedClasses.length === 0
        ? null
        : (
            gradedClasses.reduce(
              (sum, c) => sum + (GPA_POINTS[c.current_letter_grade] ?? 0),
              0
            ) / gradedClasses.length
          ).toFixed(2);

    res.json({ classes, gpa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

module.exports = router;
