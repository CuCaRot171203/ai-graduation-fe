import { createElement } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import LandingPage from '../pages/general/landingPage'
import LoginPage from '../pages/general/loginPage'
import RegisterPage from '../pages/general/registerPage'
import ForgotPasswordPage from '../pages/general/forgotPasswordPage'
import ResetPasswordPage from '../pages/general/resetPasswordPage'
import CreateExam from '../pages/general/createExam'
import UserAdmin from '../pages/user/userAdmin'
import ExamListScreen from '../pages/user/examListScreen'
import ExamDetail from '../pages/user/examDetail'
import SubjectList from '../pages/user/subjectList'
import UserHistory from '../pages/user/userHistory'
import UserLeaderboard from '../pages/user/userLeaderboard'
import UserProfile from '../pages/user/userProfile'
import UserAiSupport from '../pages/user/userAiSupport'
import UserPracticeOptions from '../pages/user/userPracticeOptions'
import UserPracticeWithExam from '../pages/user/userPracticeWithExam'
import UserPracticeWithAi from '../pages/user/userPracticeWithAi'
import LectureDashboard from '../pages/lecture/lectureDashboard'
import LectureSubjects from '../pages/lecture/lectureSubjects'
import LectureExams from '../pages/lecture/lectureExams'
import LectureExamDetailPage from '../pages/lecture/lectureExamDetail'
import LectureExamAddQuestions from '../pages/lecture/lectureExamAddQuestions'
import LectureQuestionBank from '../pages/lecture/lectureQuestionBank'
import LectureCreateQuestion from '../pages/lecture/createQuestion.'
import RegisterSubject from '../pages/lecture/registerSubject'
import LectureClasses from '../pages/lecture/lectureClasses'
import LectureClassDetail from '../pages/lecture/lectureClassDetail'
import LectureClassResults from '../pages/lecture/lectureClassResults'
import LectureAiSupport from '../pages/lecture/lectureAiSupport'
import LectureAiAsk from '../pages/lecture/lectureAiAsk'
import LectureAiGenerateExam from '../pages/lecture/lectureAiGenerateExam'
import LectureProfile from '../pages/lecture/lectureProfile'
import LectureAssignments from '../pages/lecture/lectureAssignments'
import LectureAssignmentHomework from '../pages/lecture/lectureAssignmentHomework'
import LectureAssignmentMockExam from '../pages/lecture/lectureAssignmentMockExam'
import LectureAssignmentDetail from '../pages/lecture/lectureAssignmentDetail'
import LectureAssignmentProgress from '../pages/lecture/lectureAssignmentProgress'
import AdminDashboard from '../pages/admin/adminDashboard'
import CreateSubject from '../pages/admin/createSubject'
import SubjectDetail from '../pages/admin/subjectDetail'
import UpdateSubject from '../pages/admin/updateSubject'
import AllSubjects from '../pages/admin/allSubjects'
import CreateClass from '../pages/admin/createClass'
import AllClasses from '../pages/admin/allClasses'
import ClassResult from '../pages/admin/classResult'
import UpdateClass from '../pages/admin/updateClass'
import ClassDetail from '../pages/admin/classDetail'
import ClassList from '../pages/admin/classList'
import UserList from '../pages/admin/userList'
import ExamDashboard from '../pages/admin/examDashboard'
import AdminQuestionBank from '../pages/admin/adminQuestionBank'
import AdminTopicManagement from '../pages/admin/adminTopicManagement'

function LayoutOutlet() {
  return createElement(Outlet)
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(LandingPage),
  },
  {
    path: '/login',
    element: createElement(LoginPage),
  },
  {
    path: '/register',
    element: createElement(RegisterPage),
  },
  {
    path: '/forgot-password',
    element: createElement(ForgotPasswordPage),
  },
  {
    path: '/reset-password',
    element: createElement(ResetPasswordPage),
  },
  {
    path: '/create-exam',
    element: createElement(CreateExam),
  },
  // --- /user ---
  {
    path: '/user',
    element: createElement(LayoutOutlet),
    children: [
      {
        path: 'dashboard',
        element: createElement(UserAdmin),
      },
      {
        path: 'exam-list',
        element: createElement(ExamListScreen),
      },
      {
        path: 'exam-practice/:id',
        element: createElement(ExamDetail),
      },
      {
        path: 'subject-list',
        element: createElement(SubjectList),
      },
      {
        path: 'history',
        element: createElement(UserHistory),
      },
      {
        path: 'leaderboard',
        element: createElement(UserLeaderboard),
      },
      {
        path: 'profile',
        element: createElement(UserProfile),
      },
      {
        path: 'ai-support',
        element: createElement(UserAiSupport),
      },
      {
        path: 'subjects/:subjectId/practice',
        element: createElement(UserPracticeOptions),
      },
      {
        path: 'subjects/:subjectId/practice/exams',
        element: createElement(UserPracticeWithExam),
      },
      {
        path: 'subjects/:subjectId/practice/ai',
        element: createElement(UserPracticeWithAi),
      },
    ],
  },
  {
    path: '/lecture',
    element: createElement(LayoutOutlet),
    children: [
      {
        path: 'dashboard',
        element: createElement(LectureDashboard),
      },
      {
        path: 'subjects',
        element: createElement(LectureSubjects),
      },
      {
        path: 'exams/:examId/add-questions',
        element: createElement(LectureExamAddQuestions),
      },
      {
        path: 'exams/:examId',
        element: createElement(LectureExamDetailPage),
      },
      {
        path: 'exams',
        element: createElement(LectureExams),
      },
      {
        path: 'classes',
        element: createElement(LectureClasses),
      },
      {
        path: 'classes/:classId',
        element: createElement(LectureClassDetail),
      },
      {
        path: 'classes/:classId/results',
        element: createElement(LectureClassResults),
      },
      {
        path: 'question-bank',
        element: createElement(LectureQuestionBank),
      },
      {
        path: 'assignments',
        element: createElement(LectureAssignments),
      },
      {
        path: 'assignments/homework',
        element: createElement(LectureAssignmentHomework),
      },
      {
        path: 'assignments/mock-exam',
        element: createElement(LectureAssignmentMockExam),
      },
      {
        path: 'assignments/:assignmentId',
        element: createElement(LectureAssignmentDetail),
      },
      {
        path: 'assignments/:assignmentId/progress',
        element: createElement(LectureAssignmentProgress),
      },
      {
        path: 'profile',
        element: createElement(LectureProfile),
      },
      {
        path: 'create-question',
        element: createElement(LectureCreateQuestion),
      },
      {
        path: 'register-subject',
        element: createElement(RegisterSubject),
      },
      {
        path: 'ai-support',
        element: createElement(LectureAiSupport),
      },
      {
        path: 'ai-support/ask',
        element: createElement(LectureAiAsk),
      },
      {
        path: 'ai-support/generate-exam',
        element: createElement(LectureAiGenerateExam),
      },
    ],
  },
  // --- /admin ---
  {
    path: '/admin',
    element: createElement(LayoutOutlet),
    children: [
      {
        path: 'dashboard',
        element: createElement(AdminDashboard),
      },
      {
        path: 'user-list',
        element: createElement(UserList),
      },
      {
        path: 'exam-dashboard',
        element: createElement(ExamDashboard),
      },
      {
        path: 'question-bank',
        element: createElement(AdminQuestionBank),
      },
      {
        path: 'topics',
        element: createElement(AdminTopicManagement),
      },
      {
        path: 'all-subjects',
        element: createElement(AllSubjects),
      },
      {
        path: 'create-subject',
        element: createElement(CreateSubject),
      },
      {
        path: 'detail-subject',
        element: createElement(SubjectDetail),
      },
      {
        path: 'update-subject',
        element: createElement(UpdateSubject),
      },
      {
        path: 'classes',
        element: createElement(AllClasses),
      },
      {
        path: 'create-class',
        element: createElement(CreateClass),
      },
      {
        path: 'class-result',
        element: createElement(ClassResult),
      },
      {
        path: 'update-class',
        element: createElement(UpdateClass),
      },
      {
        path: 'class-detail',
        element: createElement(ClassDetail),
      },
      {
        path: 'list-of-class',
        element: createElement(ClassList),
      },
    ],
  },
])
