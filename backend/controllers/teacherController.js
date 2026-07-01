import Course from '../models/Course.js';
import Result from '../models/Result.js';
import Enrollment from '../models/Enrollment.js';
import GradingScale from '../models/GradingScale.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Semester from '../models/Semester.js';
import { logAudit } from '../middleware/auditLogger.js';
import { calculateSemesterGPA } from '../utils/gpaCalculator.js';

/**
 * @desc    Get teacher dashboard stats
 * @route   GET /api/teacher/dashboard
 * @access  Private/Teacher
 */
export const getDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const [totalCourses, draftResults, submittedResults, approvedResults] = await Promise.all([
      Course.countDocuments({ teacherId, isActive: true }),
      Result.countDocuments({ teacherId, status: 'draft' }),
      Result.countDocuments({ teacherId, status: 'submitted' }),
      Result.countDocuments({ teacherId, status: 'approved' })
    ]);

    const myCourses = await Course.find({ teacherId, isActive: true })
      .populate('departmentId', 'name code')
      .sort({ code: 1 });

    res.status(200).json({
      success: true,
      data: {
        stats: { totalCourses, draftResults, submittedResults, approvedResults },
        myCourses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
  }
};

/**
 * @desc    Get assigned courses
 * @route   GET /api/teacher/courses
 * @access  Private/Teacher
 */
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacherId: req.user._id, isActive: true })
      .populate('departmentId', 'name code')
      .sort({ code: 1 });

    // Add enrolled student count for each course
    const coursesWithStudents = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await Enrollment.countDocuments({ courseId: course._id, status: 'registered' });
        return { ...course.toObject(), enrolledStudents: enrolledCount };
      })
    );

    res.status(200).json({ success: true, data: coursesWithStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

/**
 * @desc    Get students enrolled in a course (for result entry)
 * @route   GET /api/teacher/courses/:courseId/students
 * @access  Private/Teacher
 */
export const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, teacherId: req.user._id });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    const { semesterId, sessionId } = req.query;

    const enrollments = await Enrollment.find({
      courseId: course._id,
      ...(semesterId && { semesterId }),
      ...(sessionId && { sessionId }),
      status: 'registered'
    }).populate('studentId', 'firstName lastName email');

    // Get existing results
    const results = await Result.find({
      courseId: course._id,
      teacherId: req.user._id,
      ...(semesterId && { semesterId }),
      ...(sessionId && { sessionId })
    });

    const studentsWithResults = enrollments.map(enrollment => {
      const existingResult = results.find(r => r.studentId.toString() === enrollment.studentId._id.toString());
      return {
        student: enrollment.studentId,
        enrollmentId: enrollment._id,
        result: existingResult || null
      };
    });

    res.status(200).json({ success: true, data: studentsWithResults });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

/**
 * @desc    Enter/update results for a course
 * @route   POST /api/teacher/results
 * @access  Private/Teacher
 */
export const enterResults = async (req, res) => {
  try {
    const { results: resultsData, courseId, semesterId, sessionId } = req.body;
    const teacherId = req.user._id;
    const institutionId = req.user.institutionId;

    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned to you' });
    }

    // Get institution grading scale
    const gradingScale = await GradingScale.findOne({ institutionId });
    const institution = await (await import('../models/Institution.js')).default.findById(institutionId);
    const caMax = institution?.settings?.caMaxScore || 40;
    const examMax = institution?.settings?.examMaxScore || 60;

    const savedResults = [];
    const errors = [];

    for (const item of resultsData) {
      try {
        // Validate scores
        if (item.caScore > caMax) {
          errors.push({ studentId: item.studentId, error: `CA score exceeds maximum (${caMax})` });
          continue;
        }
        if (item.examScore > examMax) {
          errors.push({ studentId: item.studentId, error: `Exam score exceeds maximum (${examMax})` });
          continue;
        }

        const totalScore = (item.caScore || 0) + (item.examScore || 0);

        // Compute grade
        let letterGrade = 'F';
        let gradePoint = 0;
        if (gradingScale) {
          const matched = gradingScale.scales.find(s => totalScore >= s.minScore && totalScore <= s.maxScore);
          if (matched) {
            letterGrade = matched.grade;
            gradePoint = matched.gradePoint;
          }
        }

        const result = await Result.findOneAndUpdate(
          { studentId: item.studentId, courseId, semesterId, sessionId },
          {
            studentId: item.studentId, courseId, semesterId, sessionId, institutionId, teacherId,
            caScore: item.caScore || 0,
            examScore: item.examScore || 0,
            totalScore,
            letterGrade,
            gradePoint,
            attendance: item.attendance || 0,
            status: 'draft'
          },
          { new: true, upsert: true, runValidators: true }
        );

        savedResults.push(result);
      } catch (err) {
        errors.push({ studentId: item.studentId, error: err.message });
      }
    }

    await logAudit({
      userId: teacherId, action: 'RESULT_CREATE', entity: 'Result', entityId: courseId,
      description: `${savedResults.length} results entered for course ${course.code}`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `${savedResults.length} results saved, ${errors.length} errors`,
      data: { saved: savedResults, errors }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to enter results', error: error.message });
  }
};

/**
 * @desc    Submit course results for approval
 * @route   POST /api/teacher/results/submit/:courseId
 * @access  Private/Teacher
 */
export const submitResults = async (req, res) => {
  try {
    const { semesterId, sessionId } = req.body;
    const result = await Result.updateMany(
      { courseId: req.params.courseId, teacherId: req.user._id, semesterId, sessionId, status: 'draft' },
      { status: 'submitted', submittedAt: new Date() }
    );

    await logAudit({
      userId: req.user._id, action: 'RESULT_SUBMIT', entity: 'Course', entityId: req.params.courseId,
      description: `${result.modifiedCount} results submitted for approval`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} results submitted for approval`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit results', error: error.message });
  }
};

/**
 * @desc    Get results for a course (grade book)
 * @route   GET /api/teacher/results/:courseId
 * @access  Private/Teacher
 */
export const getCourseResults = async (req, res) => {
  try {
    const { semesterId, sessionId, status } = req.query;
    const query = { courseId: req.params.courseId, teacherId: req.user._id };
    if (semesterId) query.semesterId = semesterId;
    if (sessionId) query.sessionId = sessionId;
    if (status) query.status = status;

    const results = await Result.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('courseId', 'title code creditUnits')
      .sort({ 'studentId.lastName': 1 });

    // Calculate class statistics
    const totalStudents = results.length;
    const passed = results.filter(r => r.totalScore >= 40).length;
    const failed = totalStudents - passed;
    const avgScore = totalStudents > 0 ? results.reduce((sum, r) => sum + r.totalScore, 0) / totalStudents : 0;
    const highestScore = totalStudents > 0 ? Math.max(...results.map(r => r.totalScore)) : 0;
    const lowestScore = totalStudents > 0 ? Math.min(...results.map(r => r.totalScore)) : 0;

    // Grade distribution
    const gradeDistribution = {};
    results.forEach(r => {
      gradeDistribution[r.letterGrade] = (gradeDistribution[r.letterGrade] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        results,
        stats: { totalStudents, passed, failed, avgScore: Math.round(avgScore * 100) / 100, highestScore, lowestScore },
        gradeDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
  }
};

/**
 * @desc    Get course performance analytics
 * @route   GET /api/teacher/analytics/:courseId
 * @access  Private/Teacher
 */
export const getCourseAnalytics = async (req, res) => {
  try {
    const results = await Result.find({ courseId: req.params.courseId, teacherId: req.user._id, status: 'approved' })
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'title code creditUnits');

    const scoreRanges = [
      { label: '0-39', min: 0, max: 39, count: 0 },
      { label: '40-49', min: 40, max: 49, count: 0 },
      { label: '50-59', min: 50, max: 59, count: 0 },
      { label: '60-69', min: 60, max: 69, count: 0 },
      { label: '70-100', min: 70, max: 100, count: 0 }
    ];

    results.forEach(r => {
      const range = scoreRanges.find(s => r.totalScore >= s.min && r.totalScore <= s.max);
      if (range) range.count++;
    });

    const topPerformers = [...results].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);

    res.status(200).json({
      success: true,
      data: { scoreRanges, topPerformers, totalResults: results.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};

/**
 * @desc    Update teacher profile
 * @route   PUT /api/teacher/profile
 * @access  Private/Teacher
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

/**
 * @desc    Update a single result (if still in draft)
 * @route   PUT /api/teacher/results/:id
 * @access  Private/Teacher
 */
export const updateResult = async (req, res) => {
  try {
    const { caScore, examScore } = req.body;
    const result = await Result.findOne({ _id: req.params.id, teacherId: req.user._id });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    if (result.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Cannot edit submitted/approved results' });
    }

    const gradingScale = await GradingScale.findOne({ institutionId: req.user.institutionId });
    const totalScore = (caScore || 0) + (examScore || 0);

    let letterGrade = 'F';
    let gradePoint = 0;
    if (gradingScale) {
      const matched = gradingScale.scales.find(s => totalScore >= s.minScore && totalScore <= s.maxScore);
      if (matched) { letterGrade = matched.grade; gradePoint = matched.gradePoint; }
    }

    result.caScore = caScore;
    result.examScore = examScore;
    result.totalScore = totalScore;
    result.letterGrade = letterGrade;
    result.gradePoint = gradePoint;
    await result.save();

    await logAudit({
      userId: req.user._id, action: 'GRADE_MODIFY', entity: 'Result', entityId: result._id,
      description: `Result updated for student`, newValue: { caScore, examScore, totalScore, letterGrade },
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: 'Result updated', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update result', error: error.message });
  }
};

/**
 * @desc    Get sessions for this teacher's institution (for result-entry dropdowns).
 * @route   GET /api/teacher/sessions
 * @access  Private/Teacher
 */
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ institutionId: req.user.institutionId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions', error: error.message });
  }
};

/**
 * @desc    Get semesters for this teacher's institution (for result-entry dropdowns).
 * @route   GET /api/teacher/semesters
 * @access  Private/Teacher
 */
export const getSemesters = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const query = { institutionId: req.user.institutionId };
    if (sessionId) query.sessionId = sessionId;
    const semesters = await Semester.find(query).populate('sessionId', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch semesters', error: error.message });
  }
}; 

export const bulkUploadResults = async (req, res) => {
  try {
    const { results: resultRows, courseId, semesterId, sessionId } = req.body;
    if (!resultRows || !Array.isArray(resultRows)) {
      return res.status(400).json({ success: false, message: 'Results array is required' });
    }

    const course = await Course.findOne({ _id: courseId, teacherId: req.user._id });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or not assigned' });
    }

    const gradingScale = await GradingScale.findOne({ institutionId: req.user.institutionId });
    const saved = [];
    const errors = [];

    for (const [index, row] of resultRows.entries()) {
      try {
        const totalScore = (row.caScore || 0) + (row.examScore || 0);
        let letterGrade = 'F', gradePoint = 0;
        if (gradingScale) {
          const matched = gradingScale.scales.find(s => totalScore >= s.minScore && totalScore <= s.maxScore);
          if (matched) { letterGrade = matched.grade; gradePoint = matched.gradePoint; }
        }

        const result = await Result.findOneAndUpdate(
          { studentId: row.studentId, courseId, semesterId, sessionId },
          {
            studentId: row.studentId, courseId, semesterId, sessionId,
            institutionId: req.user.institutionId, teacherId: req.user._id,
            caScore: row.caScore || 0, examScore: row.examScore || 0,
            totalScore, letterGrade, gradePoint, status: 'draft'
          },
          { new: true, upsert: true }
        );
        saved.push(result);
      } catch (err) {
        errors.push(`Row ${index + 1}: ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `${saved.length} results saved, ${errors.length} errors`,
      data: { saved: saved.length, errors }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Bulk upload failed', error: error.message });
  }
};

