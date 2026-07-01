import User from '../models/User.js';
import Institution from '../models/Institution.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Session from '../models/Session.js';
import Semester from '../models/Semester.js';
import StudentProfile from '../models/StudentProfile.js';
import Enrollment from '../models/Enrollment.js';
import Result from '../models/Result.js';
import GradingScale from '../models/GradingScale.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../middleware/auditLogger.js';
import { generatePassword, generateMatricNumber } from '../utils/generators.js';
import { sendAccountCreationEmail, sendResultPublishedEmail } from '../utils/emailService.js';

/**
 * @desc    Register a new institution
 * @route   POST /api/institution/register
 * @access  Public
 */
export const registerInstitution = async (req, res) => {
  try {
    const { name, code, type, email, phone, address, website, motto, adminFirstName, adminLastName, adminEmail, adminPassword } = req.body;

    // Check if institution code exists
    const existing = await Institution.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Institution code already exists' });
    }

    // Create institution admin user
    const adminUser = await User.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: adminPassword,
      role: 'institution',
      isActive: true
    });

    // Create institution — active immediately so admin can log in and start managing.
    const institution = await Institution.create({
      name, code: code.toUpperCase(), type, email, phone, address, website, motto,
      adminUserId: adminUser._id,
      status: 'active'
    });

    // Update user with institution reference
    adminUser.institutionId = institution._id;
    await adminUser.save({ validateBeforeSave: false });

    // Create default grading scale
    await GradingScale.create({
      institutionId: institution._id,
      name: 'Default',
      scales: [
        { grade: 'A', minScore: 70, maxScore: 100, gradePoint: 5.0, remark: 'Excellent' },
        { grade: 'B', minScore: 60, maxScore: 69, gradePoint: 4.0, remark: 'Very Good' },
        { grade: 'C', minScore: 50, maxScore: 59, gradePoint: 3.0, remark: 'Good' },
        { grade: 'D', minScore: 45, maxScore: 49, gradePoint: 2.0, remark: 'Fair' },
        { grade: 'E', minScore: 40, maxScore: 44, gradePoint: 1.0, remark: 'Pass' },
        { grade: 'F', minScore: 0, maxScore: 39, gradePoint: 0, remark: 'Fail' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Institution registered successfully. You can now log in.',
      data: { institution, adminUser: { email: adminUser.email } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

/**
 * @desc    Get institution dashboard stats
 * @route   GET /api/institution/dashboard
 * @access  Private/Institution
 */
export const getDashboard = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;

    const [totalStudents, totalTeachers, totalCourses, totalDepartments, pendingResults, recentResults] = await Promise.all([
      User.countDocuments({ institutionId, role: 'student', isActive: true }),
      User.countDocuments({ institutionId, role: 'teacher', isActive: true }),
      Course.countDocuments({ institutionId, isActive: true }),
      Department.countDocuments({ institutionId, isActive: true }),
      Result.countDocuments({ institutionId, status: 'submitted' }),
      Result.find({ institutionId, status: 'submitted' })
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('teacherId', 'firstName lastName')
        .populate('courseId', 'title code')
    ]);

    // Department distribution
    const departmentDistribution = await User.aggregate([
      { $match: { institutionId: institutionId, role: 'student' } },
      { $lookup: { from: 'studentprofiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
      { $unwind: '$profile' },
      { $group: { _id: '$profile.departmentId', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { name: '$dept.name', count: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: { totalStudents, totalTeachers, totalCourses, totalDepartments, pendingResults },
        recentResults,
        departmentDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
  }
};

// ==================== STUDENT MANAGEMENT ====================

/**
 * @desc    Create a student
 * @route   POST /api/institution/students
 * @access  Private/Institution
 */
export const createStudent = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const { firstName, lastName, email, departmentId, level, phone, guardianName, guardianPhone } = req.body;

    const password = generatePassword();
    const institution = await Institution.findById(institutionId);
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Generate matric number
    const studentCount = await StudentProfile.countDocuments({ institutionId });
    const year = new Date().getFullYear();
    const matricNumber = generateMatricNumber(institution.code, department.code, year, studentCount + 1);

    // Create user
    const user = await User.create({
      firstName, lastName, email, password, phone,
      role: 'student',
      institutionId,
      isActive: true
    });

    // Create student profile
    const profile = await StudentProfile.create({
      userId: user._id,
      institutionId,
      departmentId,
      matricNumber,
      level: level || 100,
      guardianName,
      guardianPhone
    });

    // Send credentials email
    await sendAccountCreationEmail(user, password);

    await logAudit({
      userId: req.user._id,
      action: 'STUDENT_CREATE',
      entity: 'Student',
      entityId: user._id,
      description: `Student ${firstName} ${lastName} created with matric: ${matricNumber}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        user: { ...user.toObject(), password: undefined },
        profile,
        generatedPassword: password // Only shown once
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create student', error: error.message });
  }
};

/**
 * @desc    Get all students for institution
 * @route   GET /api/institution/students
 * @access  Private/Institution
 */
export const getStudents = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const { page = 1, limit = 10, departmentId, level, search, status } = req.query;

    const userQuery = { institutionId, role: 'student' };
    if (search) {
      userQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(userQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const userIds = users.map(u => u._id);
    
    const profileQuery = { userId: { $in: userIds } };
    if (departmentId) profileQuery.departmentId = departmentId;
    if (level) profileQuery.level = level;
    if (status) profileQuery.status = status;

    const profiles = await StudentProfile.find(profileQuery)
      .populate('departmentId', 'name code');

    // Merge users with profiles
    const students = users.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return { ...user.toObject(), profile };
    }).filter(s => s.profile); // Only include students with matching profiles

    const total = await User.countDocuments(userQuery);

    res.status(200).json({
      success: true,
      data: students,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/institution/students/:id
 * @access  Private/Institution
 */
export const updateStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, departmentId, level, status } = req.body;
    
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId },
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (departmentId || level || status) {
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        { ...(departmentId && { departmentId }), ...(level && { level }), ...(status && { status }) },
        { new: true }
      );
    }

    res.status(200).json({ success: true, message: 'Student updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student', error: error.message });
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/institution/students/:id
 * @access  Private/Institution
 */
export const deleteStudent = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, institutionId: req.user.institutionId, role: 'student' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    await StudentProfile.findOneAndDelete({ userId: user._id });
    await Enrollment.deleteMany({ studentId: user._id });

    await logAudit({
      userId: req.user._id, action: 'STUDENT_DELETE', entity: 'Student', entityId: user._id,
      description: `Student ${user.firstName} ${user.lastName} deleted`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student', error: error.message });
  }
};

/**
 * @desc    Get a single student (with profile) for the current institution.
 * @route   GET /api/institution/students/:id
 * @access  Private/Institution
 */
export const getStudent = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, institutionId: req.user.institutionId, role: 'student' });
    if (!user) return res.status(404).json({ success: false, message: 'Student not found' });
    const profile = await StudentProfile.findOne({ userId: user._id })
      .populate('departmentId', 'name code');
    res.status(200).json({
      success: true,
      data: { ...user.toObject(), userId: { firstName: user.firstName, lastName: user.lastName, email: user.email }, ...(profile ? profile.toObject() : {}) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student', error: error.message });
  }
};

/**
 * @desc    Get approved results for a specific student (institution admin view).
 * @route   GET /api/institution/students/:id/results
 * @access  Private/Institution
 */
export const getStudentResults = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, institutionId: req.user.institutionId, role: 'student' });
    if (!user) return res.status(404).json({ success: false, message: 'Student not found' });

    const results = await Result.find({ studentId: user._id, institutionId: req.user.institutionId })
      .populate('courseId', 'title code creditUnits')
      .populate('semesterId', 'name')
      .populate('sessionId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student results', error: error.message });
  }
};

// ==================== TEACHER MANAGEMENT ====================

export const createTeacher = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const { firstName, lastName, email, phone, departmentId } = req.body;
    const password = generatePassword();

    const user = await User.create({
      firstName, lastName, email, password, phone,
      role: 'teacher', institutionId, isActive: true
    });

    await sendAccountCreationEmail(user, password);

    await logAudit({
      userId: req.user._id, action: 'TEACHER_CREATE', entity: 'Teacher', entityId: user._id,
      description: `Teacher ${firstName} ${lastName} created`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true, message: 'Teacher created',
      data: { user: { ...user.toObject(), password: undefined }, generatedPassword: password }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create teacher', error: error.message });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { institutionId: req.user.institutionId, role: 'teacher' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await User.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await User.countDocuments(query);

    // Get course count for each teacher
    const teachersWithCourses = await Promise.all(
      teachers.map(async (t) => {
        const courseCount = await Course.countDocuments({ teacherId: t._id });
        return { ...t.toObject(), courseCount };
      })
    );

    res.status(200).json({
      success: true, data: teachersWithCourses,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, isActive } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId, role: 'teacher' },
      { firstName, lastName, email, phone, ...(isActive !== undefined && { isActive }) },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.status(200).json({ success: true, message: 'Teacher updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update teacher', error: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, institutionId: req.user.institutionId, role: 'teacher' });
    if (!user) return res.status(404).json({ success: false, message: 'Teacher not found' });
    await Course.updateMany({ teacherId: user._id }, { teacherId: null });
    res.status(200).json({ success: true, message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete teacher', error: error.message });
  }
};

// ==================== DEPARTMENT MANAGEMENT ====================

/** Coerce empty-string ObjectId references to null so Mongoose never tries to cast '' as ObjectId. */
const toObjectIdOrNull = (v) => (v === '' || v === undefined || v === null) ? null : v;

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, isActive } = req.body;
    const headOfDepartment = toObjectIdOrNull(req.body.headOfDepartment);
    const department = await Department.create({
      name, code, description, headOfDepartment,
      ...(isActive !== undefined && { isActive }),
      institutionId: req.user.institutionId
    });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create department', error: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ institutionId: req.user.institutionId })
      .populate('headOfDepartment', 'firstName lastName')
      .sort({ name: 1 });

    // Attach course + student counts
    const withCounts = await Promise.all(
      departments.map(async (d) => {
        const [courseCount, studentCount] = await Promise.all([
          Course.countDocuments({ institutionId: req.user.institutionId, departmentId: d._id }),
          StudentProfile.countDocuments({ institutionId: req.user.institutionId, departmentId: d._id })
        ]);
        return { ...d.toObject(), courseCount, studentCount };
      })
    );

    res.status(200).json({ success: true, data: withCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, isActive } = req.body;
    const headOfDepartment = toObjectIdOrNull(req.body.headOfDepartment);
    const dept = await Department.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId },
      { name, code, description, headOfDepartment, ...(isActive !== undefined && { isActive }) },
      { new: true, runValidators: true }
    ).populate('headOfDepartment', 'firstName lastName');
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update department', error: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findOneAndDelete({ _id: req.params.id, institutionId: req.user.institutionId });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete department', error: error.message });
  }
};

// ==================== COURSE MANAGEMENT ====================

export const createCourse = async (req, res) => {
  try {
    const { title, code, creditUnits, departmentId, semesterType, description } = req.body;
    const teacherId = toObjectIdOrNull(req.body.teacherId);
    const level = Number(req.body.level) || 100;
    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }
    const course = await Course.create({
      title, code, creditUnits: Number(creditUnits) || 1,
      departmentId, semesterType, description, teacherId, level,
      institutionId: req.user.institutionId
    });
    await course.populate('departmentId', 'name code');
    await course.populate('teacherId', 'firstName lastName');
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const { departmentId, level, semesterType, teacherId } = req.query;
    const query = { institutionId: req.user.institutionId };
    if (departmentId) query.departmentId = departmentId;
    if (level) query.level = level;
    if (semesterType) query.semesterType = semesterType;
    if (teacherId) query.teacherId = teacherId;

    const courses = await Course.find(query)
      .populate('departmentId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .sort({ code: 1 });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { title, code, creditUnits, departmentId, semesterType, description, isActive } = req.body;
    const teacherId = toObjectIdOrNull(req.body.teacherId);
    const level = req.body.level !== undefined ? Number(req.body.level) : undefined;
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId },
      {
        title, code,
        ...(creditUnits !== undefined && { creditUnits: Number(creditUnits) }),
        departmentId, semesterType, description, teacherId,
        ...(level !== undefined && { level }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    ).populate('departmentId', 'name code').populate('teacherId', 'firstName lastName');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, institutionId: req.user.institutionId });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
};

// ==================== SESSION & SEMESTER ====================

export const createSession = async (req, res) => {
  try {
    const session = await Session.create({ ...req.body, institutionId: req.user.institutionId });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create session', error: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ institutionId: req.user.institutionId }).sort({ createdAt: -1 });
    // Attach semesters for each session so the UI can render them nested
    const sessionIds = sessions.map(s => s._id);
    const allSemesters = await Semester.find({ institutionId: req.user.institutionId, sessionId: { $in: sessionIds } })
      .sort({ createdAt: 1 });
    const withSemesters = sessions.map(s => ({
      ...s.toObject(),
      semesters: allSemesters.filter(sem => sem.sessionId.toString() === s._id.toString())
    }));
    res.status(200).json({ success: true, data: withSemesters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions', error: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId },
      req.body, { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update session', error: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, institutionId: req.user.institutionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    await Semester.deleteMany({ sessionId: session._id, institutionId: req.user.institutionId });
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete session', error: error.message });
  }
};

export const activateSession = async (req, res) => {
  try {
    // Session model has no isActive field of its own — we treat it as "current"
    // by activating one semester within it. So this simply activates the most
    // recently created semester of the chosen session and returns it.
    const session = await Session.findOne({ _id: req.params.id, institutionId: req.user.institutionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Deactivate every other semester of this institution
    await Semester.updateMany({ institutionId: req.user.institutionId }, { isActive: false });
    // Activate first semester of the chosen session (if any)
    const firstSemester = await Semester.findOne({
      institutionId: req.user.institutionId, sessionId: session._id
    }).sort({ createdAt: 1 });
    if (firstSemester) {
      firstSemester.isActive = true;
      await firstSemester.save();
    }
    res.status(200).json({ success: true, message: 'Session activated', data: { session, activeSemester: firstSemester } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to activate session', error: error.message });
  }
};

export const createSemester = async (req, res) => {
  try {
    const semester = await Semester.create({ ...req.body, institutionId: req.user.institutionId });
    res.status(201).json({ success: true, data: semester });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create semester', error: error.message });
  }
};

/**
 * Add a semester to a specific session (nested route helper).
 * POST /api/institution/sessions/:sessionId/semesters
 */
export const addSemesterToSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, institutionId: req.user.institutionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    const semester = await Semester.create({
      ...req.body,
      sessionId: session._id,
      institutionId: req.user.institutionId
    });
    res.status(201).json({ success: true, data: semester });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add semester', error: error.message });
  }
};

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

export const updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId },
      req.body, { new: true, runValidators: true }
    );
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.status(200).json({ success: true, data: semester });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update semester', error: error.message });
  }
};

export const deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findOneAndDelete({ _id: req.params.id, institutionId: req.user.institutionId });
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.status(200).json({ success: true, message: 'Semester deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete semester', error: error.message });
  }
};

/** Only one semester per institution is active at a time (used for course registration). */
export const activateSemester = async (req, res) => {
  try {
    const semester = await Semester.findOne({ _id: req.params.id, institutionId: req.user.institutionId });
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    await Semester.updateMany({ institutionId: req.user.institutionId }, { isActive: false });
    semester.isActive = true;
    await semester.save();
    res.status(200).json({ success: true, message: 'Semester activated', data: semester });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to activate semester', error: error.message });
  }
};

// ==================== GRADING SCALES ====================

export const getGradingScales = async (req, res) => {
  try {
    const scales = await GradingScale.find({ institutionId: req.user.institutionId });
    res.status(200).json({ success: true, data: scales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch grading scales', error: error.message });
  }
};

export const updateGradingScale = async (req, res) => {
  try {
    const scale = await GradingScale.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId },
      req.body, { new: true, runValidators: true }
    );
    if (!scale) return res.status(404).json({ success: false, message: 'Grading scale not found' });

    await logAudit({
      userId: req.user._id, action: 'GRADING_SCALE_UPDATE', entity: 'GradingScale', entityId: scale._id,
      description: 'Grading scale updated', newValue: req.body,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, data: scale });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update grading scale', error: error.message });
  }
};

/**
 * @desc    Update the institution's own grading scale without knowing the ID.
 *          Creates a default one if none exists.
 * @route   PUT /api/institution/grading-scales/my
 * @access  Private/Institution
 */
export const updateMyGradingScale = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const { scales } = req.body;
    if (!Array.isArray(scales)) {
      return res.status(400).json({ success: false, message: 'scales must be an array' });
    }

    const scale = await GradingScale.findOneAndUpdate(
      { institutionId },
      { scales },
      { new: true, runValidators: true, upsert: true }
    );

    await logAudit({
      userId: req.user._id, action: 'GRADING_SCALE_UPDATE', entity: 'GradingScale', entityId: scale._id,
      description: 'Grading scale updated', ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, data: scale });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update grading scale', error: error.message });
  }
};

// ==================== RESULT APPROVAL ====================

/**
 * List results with optional status filter, grouped by (course + semester + session)
 * so the approval UI shows one batch per class instead of one row per student.
 * GET /api/institution/results?status=submitted
 */
export const getResults = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { institutionId: req.user.institutionId };
    if (status) query.status = status;

    const results = await Result.find(query)
      .populate('courseId', 'title code creditUnits')
      .populate('teacherId', 'firstName lastName')
      .populate('semesterId', 'name')
      .populate('sessionId', 'name')
      .sort({ submittedAt: -1, updatedAt: -1 });

    // Group by course + semester + session
    const groups = new Map();
    for (const r of results) {
      const cId = r.courseId?._id?.toString();
      const seId = r.semesterId?._id?.toString();
      const ssId = r.sessionId?._id?.toString();
      if (!cId || !seId || !ssId) continue;
      const key = `${cId}::${seId}::${ssId}`;
      if (!groups.has(key)) {
        groups.set(key, {
          _id: key,
          courseId: r.courseId,
          semesterId: r.semesterId,
          sessionId: r.sessionId,
          teacherId: r.teacherId,
          status: r.status,
          resultIds: [],
          scores: [],
          submittedAt: r.submittedAt
        });
      }
      const g = groups.get(key);
      g.resultIds.push(r._id);
      g.scores.push(r.totalScore || 0);
      if (r.submittedAt && (!g.submittedAt || r.submittedAt < g.submittedAt)) g.submittedAt = r.submittedAt;
    }

    const batches = Array.from(groups.values()).map(g => ({
      _id: g._id,
      courseId: g.courseId,
      semesterId: g.semesterId,
      sessionId: g.sessionId,
      teacherId: g.teacherId,
      status: g.status,
      studentsCount: g.resultIds.length,
      resultIds: g.resultIds,
      avgScore: g.scores.length ? g.scores.reduce((s, x) => s + x, 0) / g.scores.length : 0,
      submittedAt: g.submittedAt
    }));

    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
  }
};

export const getPendingResults = async (req, res) => {
  req.query.status = 'submitted';
  return getResults(req, res);
};

/**
 * Send result-published emails + notifications to all students affected by a set of results.
 * Silent failure per student — never blocks the parent request.
 */
const notifyStudentsResultsPublished = async (resultIds, institutionId) => {
  if (!resultIds?.length) return;
  const affected = await Result.find({ _id: { $in: resultIds } })
    .populate('studentId', 'firstName lastName email')
    .populate('semesterId', 'name')
    .populate('sessionId', 'name');

  // De-duplicate by student — one email/notification per student per batch
  const byStudent = new Map();
  for (const r of affected) {
    const sid = r.studentId?._id?.toString();
    if (!sid || byStudent.has(sid)) continue;
    byStudent.set(sid, r);
  }

  const jobs = [];
  for (const r of byStudent.values()) {
    jobs.push(
      Notification.create({
        recipientId: r.studentId._id,
        institutionId,
        title: 'Results Published',
        message: `Your results for ${r.semesterId?.name || 'the semester'} ${r.sessionId?.name || ''} have been approved and are now available.`,
        type: 'result',
        link: '/dashboard/results'
      }).catch(err => console.error('Notification error:', err.message))
    );
    if (r.studentId?.email) {
      jobs.push(
        sendResultPublishedEmail(r.studentId, r.semesterId?.name || 'Semester', r.sessionId?.name || '')
          .catch(err => console.error('Email error:', err.message))
      );
    }
  }
  await Promise.allSettled(jobs);
};

export const approveResult = async (req, res) => {
  try {
    const result = await Result.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId, status: 'submitted' },
      { status: 'approved', approvedAt: new Date(), approvedBy: req.user._id },
      { new: true }
    );
    if (!result) return res.status(404).json({ success: false, message: 'Result not found or not submitted' });

    // Fire-and-forget notification + email
    notifyStudentsResultsPublished([result._id], req.user.institutionId);

    await logAudit({
      userId: req.user._id, action: 'RESULT_APPROVE', entity: 'Result', entityId: result._id,
      description: 'Result approved', ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: 'Result approved', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve result', error: error.message });
  }
};

export const rejectResult = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await Result.findOneAndUpdate(
      { _id: req.params.id, institutionId: req.user.institutionId, status: 'submitted' },
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    await logAudit({
      userId: req.user._id, action: 'RESULT_REJECT', entity: 'Result', entityId: result._id,
      description: `Result rejected: ${reason}`, ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: 'Result rejected', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject result', error: error.message });
  }
};

/**
 * Approve every submitted result for a (course, semester, session) batch,
 * or a supplied array of result IDs, and notify affected students.
 * POST /api/institution/results/bulk-approve
 *   body: { courseId, semesterId, sessionId }  OR  { resultIds: [...] }
 */
export const bulkApproveResults = async (req, res) => {
  try {
    const { courseId, semesterId, sessionId, resultIds } = req.body;
    const filter = { institutionId: req.user.institutionId, status: 'submitted' };
    if (Array.isArray(resultIds) && resultIds.length) {
      filter._id = { $in: resultIds };
    } else {
      if (!courseId || !semesterId) {
        return res.status(400).json({ success: false, message: 'courseId and semesterId (or resultIds) are required' });
      }
      filter.courseId = courseId;
      filter.semesterId = semesterId;
      if (sessionId) filter.sessionId = sessionId;
    }

    const targets = await Result.find(filter).select('_id');
    const idsToApprove = targets.map(t => t._id);

    const updateRes = await Result.updateMany(
      { _id: { $in: idsToApprove } },
      { status: 'approved', approvedAt: new Date(), approvedBy: req.user._id }
    );

    // Fire-and-forget student notifications + emails
    notifyStudentsResultsPublished(idsToApprove, req.user.institutionId);

    await logAudit({
      userId: req.user._id, action: 'RESULT_APPROVE', entity: 'Result',
      description: `Bulk approved ${updateRes.modifiedCount} results`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: `${updateRes.modifiedCount} results approved` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk approve', error: error.message });
  }
};

/**
 * Reject a whole batch (course+semester+session) or a supplied set of IDs.
 * POST /api/institution/results/bulk-reject
 *   body: { courseId, semesterId, sessionId, reason }  OR  { resultIds, reason }
 */
export const bulkRejectResults = async (req, res) => {
  try {
    const { courseId, semesterId, sessionId, resultIds, reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    const filter = { institutionId: req.user.institutionId, status: 'submitted' };
    if (Array.isArray(resultIds) && resultIds.length) {
      filter._id = { $in: resultIds };
    } else {
      if (!courseId || !semesterId) {
        return res.status(400).json({ success: false, message: 'courseId and semesterId (or resultIds) are required' });
      }
      filter.courseId = courseId;
      filter.semesterId = semesterId;
      if (sessionId) filter.sessionId = sessionId;
    }

    const updateRes = await Result.updateMany(filter, { status: 'rejected', rejectionReason: reason });

    await logAudit({
      userId: req.user._id, action: 'RESULT_REJECT', entity: 'Result',
      description: `Bulk rejected ${updateRes.modifiedCount} results: ${reason}`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: `${updateRes.modifiedCount} results rejected` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to bulk reject', error: error.message });
  }
};

// ==================== BULK UPLOAD ====================

export const bulkUploadStudents = async (req, res) => {
  try {
    const { students } = req.body; // Array of { firstName, lastName, email, departmentId, level }
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Students array is required' });
    }

    const institutionId = req.user.institutionId;
    const institution = await Institution.findById(institutionId);
    const results = { created: 0, errors: [] };

    for (const [index, s] of students.entries()) {
      try {
        const password = generatePassword();
        const department = await Department.findById(s.departmentId);
        if (!department) { results.errors.push(`Row ${index + 1}: Department not found`); continue; }

        const existingUser = await User.findOne({ email: s.email });
        if (existingUser) { results.errors.push(`Row ${index + 1}: Email ${s.email} already exists`); continue; }

        const studentCount = await StudentProfile.countDocuments({ institutionId });
        const matricNumber = generateMatricNumber(institution.code, department.code, new Date().getFullYear(), studentCount + 1);

        const user = await User.create({
          firstName: s.firstName, lastName: s.lastName, email: s.email,
          password, role: 'student', institutionId, isActive: true
        });

        await StudentProfile.create({
          userId: user._id, institutionId, departmentId: s.departmentId,
          matricNumber, level: s.level || 100
        });

        await sendAccountCreationEmail(user, password);
        results.created++;
      } catch (err) {
        results.errors.push(`Row ${index + 1}: ${err.message}`);
      }
    }

    await logAudit({
      userId: req.user._id, action: 'STUDENT_BULK_UPLOAD', entity: 'Student',
      description: `Bulk uploaded ${results.created} students`,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, message: `${results.created} students created`, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Bulk upload failed', error: error.message });
  }
};

export const bulkUploadTeachers = async (req, res) => {
  try {
    const { teachers } = req.body;
    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ success: false, message: 'Teachers array is required' });
    }

    const institutionId = req.user.institutionId;
    const results = { created: 0, errors: [] };

    for (const [index, t] of teachers.entries()) {
      try {
        const existingUser = await User.findOne({ email: t.email });
        if (existingUser) { results.errors.push(`Row ${index + 1}: Email ${t.email} already exists`); continue; }

        const password = generatePassword();
        const user = await User.create({
          firstName: t.firstName, lastName: t.lastName, email: t.email,
          password, phone: t.phone, role: 'teacher', institutionId, isActive: true
        });

        await sendAccountCreationEmail(user, password);
        results.created++;
      } catch (err) {
        results.errors.push(`Row ${index + 1}: ${err.message}`);
      }
    }

    res.status(201).json({ success: true, message: `${results.created} teachers created`, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Bulk upload failed', error: error.message });
  }
};

// ==================== TRANSCRIPT & BROADSHEET ====================

import { generateTranscriptData, generateBroadsheetData } from '../utils/pdfGenerator.js';

export const getStudentTranscript = async (req, res) => {
  try {
    const data = await generateTranscriptData(req.params.studentId, req.user.institutionId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate transcript', error: error.message });
  }
};

export const getBroadsheet = async (req, res) => {
  try {
    const data = await generateBroadsheetData(req.params.courseId, req.params.semesterId, req.user.institutionId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate broadsheet', error: error.message });
  }
};
