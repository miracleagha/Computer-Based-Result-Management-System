import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Enrollment from '../models/Enrollment.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
import { calculateSemesterGPA, calculateCGPA } from '../utils/gpaCalculator.js';

/**
 * @desc    Get student dashboard
 * @route   GET /api/student/dashboard
 * @access  Private/Student
 */
export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const institutionId = req.user.institutionId;

    const profile = await StudentProfile.findOne({ userId: studentId })
      .populate('departmentId', 'name code');

    const [totalCourses, totalResults, unreadNotifications] = await Promise.all([
      Enrollment.countDocuments({ studentId, status: 'registered' }),
      Result.countDocuments({ studentId, status: 'approved' }),
      Notification.countDocuments({ recipientId: studentId, isRead: false })
    ]);

    // Get all approved results for CGPA
    const allResults = await Result.find({ studentId, status: 'approved' })
      .populate('courseId', 'creditUnits');
    const cgpaResult = calculateCGPA(allResults);
    const cgpa = cgpaResult.cgpa;
    const classification = cgpaResult.classification;

    // Recent results
    const recentResults = await Result.find({ studentId, status: 'approved' })
      .populate('courseId', 'title code creditUnits')
      .populate('semesterId', 'name')
      .populate('sessionId', 'name')
      .sort({ approvedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        profile,
        stats: { totalCourses, totalResults, unreadNotifications, cgpa, classification },
        recentResults
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
  }
};

/**
 * @desc    Get student results (by semester)
 * @route   GET /api/student/results
 * @access  Private/Student
 */
export const getResults = async (req, res) => {
  try {
    const { semesterId, sessionId } = req.query;
    const query = { studentId: req.user._id, status: 'approved' };
    if (semesterId) query.semesterId = semesterId;
    if (sessionId) query.sessionId = sessionId;

    const results = await Result.find(query)
      .populate('courseId', 'title code creditUnits')
      .populate('semesterId', 'name')
      .populate('sessionId', 'name')
      .sort({ 'courseId.code': 1 });

    // Calculate semester GPA
    const gpa = calculateSemesterGPA(results);

    // All results for CGPA
    const allResults = await Result.find({ studentId: req.user._id, status: 'approved' })
      .populate('courseId', 'creditUnits');
    const cgpa = calculateCGPA(allResults).cgpa;

    // Total credit units this semester
    const totalCredits = results.reduce((sum, r) => sum + (r.courseId?.creditUnits || 0), 0);
    const totalQualityPoints = results.reduce((sum, r) => sum + (r.gradePoint * (r.courseId?.creditUnits || 0)), 0);

    res.status(200).json({
      success: true,
      data: {
        results,
        summary: { gpa, cgpa, totalCredits, totalQualityPoints, totalCourses: results.length }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
  }
};

/**
 * @desc    Get full transcript
 * @route   GET /api/student/transcript
 * @access  Private/Student
 */
export const getTranscript = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const profile = await StudentProfile.findOne({ userId: studentId })
      .populate('departmentId', 'name code')
      .populate('institutionId', 'name code logo');

    const user = await User.findById(studentId);

    // Get all approved results grouped by session/semester
    const results = await Result.find({ studentId, status: 'approved' })
      .populate('courseId', 'title code creditUnits')
      .populate('semesterId', 'name')
      .populate('sessionId', 'name')
      .sort({ 'sessionId.name': 1, 'semesterId.name': 1 });

    // Group by session and semester
    const transcript = {};
    results.forEach(r => {
      const sessionName = r.sessionId?.name || 'Unknown Session';
      const semesterName = r.semesterId?.name || 'Unknown Semester';
      const key = `${sessionName}___${semesterName}`;
      
      if (!transcript[key]) {
        transcript[key] = {
          session: sessionName,
          semester: semesterName,
          courses: [],
          gpa: 0
        };
      }
      transcript[key].courses.push(r);
    });

    // Calculate GPA for each semester
    Object.values(transcript).forEach(sem => {
      sem.gpa = calculateSemesterGPA(sem.courses);
    });

    const cgpaResult = calculateCGPA(results);
    const cgpa = cgpaResult.cgpa;
    const classification = cgpaResult.classification;

    res.status(200).json({
      success: true,
      data: {
        student: { ...user.toObject(), profile },
        transcript: Object.values(transcript),
        summary: { cgpa, classification, totalCredits: results.reduce((s, r) => s + (r.courseId?.creditUnits || 0), 0) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate transcript', error: error.message });
  }
};

/**
 * @desc    Get available courses for registration
 * @route   GET /api/student/courses/available
 * @access  Private/Student
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Get active semester
    const activeSemester = await Semester.findOne({ institutionId: req.user.institutionId, isActive: true });
    if (!activeSemester) {
      return res.status(400).json({ success: false, message: 'No active semester for registration' });
    }

    // Check registration deadline
    if (activeSemester.registrationDeadline && new Date() > activeSemester.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    // Get courses for student's department and level
    const courses = await Course.find({
      institutionId: req.user.institutionId,
      departmentId: profile.departmentId,
      level: profile.level,
      isActive: true
    }).populate('teacherId', 'firstName lastName').populate('departmentId', 'name code');

    // Get already enrolled courses
    const enrollments = await Enrollment.find({
      studentId: req.user._id,
      semesterId: activeSemester._id
    });
    const enrolledCourseIds = enrollments.map(e => e.courseId.toString());

    const availableCourses = courses.map(course => ({
      ...course.toObject(),
      isEnrolled: enrolledCourseIds.includes(course._id.toString())
    }));

    res.status(200).json({ success: true, data: { courses: availableCourses, semester: activeSemester } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

/**
 * @desc    Register for courses
 * @route   POST /api/student/courses/register
 * @access  Private/Student
 */
export const registerCourses = async (req, res) => {
  try {
    const { courseIds } = req.body;
    const studentId = req.user._id;
    const institutionId = req.user.institutionId;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ success: false, message: 'courseIds must be a non-empty array' });
    }

    const activeSemester = await Semester.findOne({ institutionId, isActive: true }).populate('sessionId');
    if (!activeSemester) {
      return res.status(400).json({ success: false, message: 'No active semester. Ask your institution to activate a semester.' });
    }
    if (activeSemester.registrationDeadline && new Date() > activeSemester.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed for the active semester.' });
    }

    const enrollments = [];
    const errors = [];

    for (const courseId of courseIds) {
      try {
        // Confirm course exists and belongs to the institution
        const course = await Course.findOne({ _id: courseId, institutionId, isActive: true });
        if (!course) { errors.push({ courseId, error: 'Course not found or inactive' }); continue; }

        // Skip if already enrolled in this active semester
        const already = await Enrollment.findOne({
          studentId, courseId, semesterId: activeSemester._id, sessionId: activeSemester.sessionId._id
        });
        if (already) { errors.push({ courseId, error: 'Already registered for this course' }); continue; }

        const enrollment = await Enrollment.create({
          studentId, courseId,
          semesterId: activeSemester._id,
          sessionId: activeSemester.sessionId._id,
          institutionId
        });
        enrollments.push(enrollment);
      } catch (err) {
        errors.push({ courseId, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `${enrollments.length} course(s) registered`,
      data: { enrollments, errors }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register courses', error: error.message });
  }
};

/**
 * @desc    List courses the student is currently registered for.
 *          Optionally filter by ?semesterId= or ?sessionId=. Defaults to the active semester.
 * @route   GET /api/student/courses/registered
 * @access  Private/Student
 */
export const getRegisteredCourses = async (req, res) => {
  try {
    const studentId = req.user._id;
    const institutionId = req.user.institutionId;
    const { semesterId, sessionId } = req.query;

    const filter = { studentId, status: 'registered' };
    if (semesterId) filter.semesterId = semesterId;
    if (sessionId) filter.sessionId = sessionId;

    // If no filter provided, default to the active semester (if any)
    if (!semesterId && !sessionId) {
      const activeSemester = await Semester.findOne({ institutionId, isActive: true });
      if (activeSemester) filter.semesterId = activeSemester._id;
    }

    const enrollments = await Enrollment.find(filter)
      .populate({ path: 'courseId', select: 'title code creditUnits level', populate: { path: 'teacherId', select: 'firstName lastName' } })
      .populate('semesterId', 'name')
      .populate('sessionId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch registered courses', error: error.message });
  }
};

/**
 * @desc    Drop a course the student is registered for.
 *          Only allowed if the semester's registration deadline hasn't passed.
 * @route   DELETE /api/student/enrollments/:id
 * @access  Private/Student
 */
export const dropCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    const semester = await Semester.findById(enrollment.semesterId);
    if (semester?.registrationDeadline && new Date() > semester.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline passed — cannot drop this course.' });
    }

    await Enrollment.deleteOne({ _id: enrollment._id });
    res.status(200).json({ success: true, message: 'Course dropped' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to drop course', error: error.message });
  }
};

/**
 * @desc    Get student notifications
 * @route   GET /api/student/notifications
 * @access  Private/Student
 */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments({ recipientId: req.user._id });
    const unread = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: { total, unread, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/student/notifications/:id/read
 * @access  Private/Student
 */
export const markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification', error: error.message });
  }
};

/**
 * @desc    Mark every notification for this student as read
 * @route   PUT /api/student/notifications/read-all
 * @access  Private/Student
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: `${result.modifiedCount} marked as read` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notifications', error: error.message });
  }
};

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile
 * @access  Private/Student
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('institutionId', 'name code logo');
    const profile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('departmentId', 'name code');

    res.status(200).json({
      success: true,
      data: { user, profile }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

/**
 * @desc    Get available semesters for viewing results
 * @route   GET /api/student/semesters
 * @access  Private/Student
 *
 * By default returns only semesters that have approved results for the student.
 * Pass ?all=true to list every semester in the institution (used for filter dropdowns).
 */
export const getSemesters = async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const semesters = await Semester.find({ institutionId: req.user.institutionId })
        .populate('sessionId', 'name')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: semesters });
    }
    const resultSemesters = await Result.distinct('semesterId', { studentId: req.user._id, status: 'approved' });
    const semesters = await Semester.find({ _id: { $in: resultSemesters } })
      .populate('sessionId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch semesters', error: error.message });
  }
};

/**
 * @desc    List sessions in the student's institution (for filter dropdowns).
 * @route   GET /api/student/sessions
 * @access  Private/Student
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
 * @desc    Update student-specific profile fields (guardian, etc.).
 *          Basic user fields go through PUT /api/auth/profile.
 * @route   PUT /api/student/profile
 * @access  Private/Student
 */
export const updateStudentProfile = async (req, res) => {
  try {
    const { guardianName, guardianPhone } = req.body;
    const update = {};
    if (guardianName !== undefined) update.guardianName = guardianName;
    if (guardianPhone !== undefined) update.guardianPhone = guardianPhone;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { new: true, runValidators: true }
    ).populate('departmentId', 'name code');

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};
