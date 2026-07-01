import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import {
  getDashboard,
  getResults,
  getTranscript,
  getAvailableCourses,
  registerCourses,
  getRegisteredCourses,
  dropCourse,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getProfile,
  updateStudentProfile,
  getSemesters,
  getSessions
} from '../controllers/studentController.js';

const router = express.Router();

router.use(protect, authorize('student'));

router.get('/dashboard', getDashboard);
router.get('/results', getResults);
router.get('/transcript', getTranscript);

// Course registration
router.get('/courses/available', getAvailableCourses);
router.get('/courses/registered', getRegisteredCourses);
router.post('/courses/register', registerCourses);
router.delete('/enrollments/:id', dropCourse);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

// Profile + reference data
router.get('/profile', getProfile);
router.put('/profile', updateStudentProfile);
router.get('/semesters', getSemesters);
router.get('/sessions', getSessions);

export default router;
