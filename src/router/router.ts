import { createElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import LandingPage from '../pages/general/landingPage'
import LoginPage from '../pages/general/loginPage'
import UserAdmin from '../pages/user/userAdmin'
import ExamListScreen from '../pages/user/examListScreen'
import ExamDetail from '../pages/user/examDetail'
import LectureDashboard from '../pages/lecture/lectureDashboard'
import LectureCreateQuestion from '../pages/lecture/createQuestion.'
import AdminDashboard from '../pages/admin/adminDashboard'

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
    path: '/user/dashboard',
    element: createElement(UserAdmin),
  },
  {
    path: '/user/exam-list',
    element: createElement(ExamListScreen),
  },
  {
    path: '/user/exam-practice/:id',
    element: createElement(ExamDetail),
  },
  {
    path: '/lecture/dashboard',
    element: createElement(LectureDashboard),
  },
  {
    path: '/lecture/create-question',
    element: createElement(LectureCreateQuestion),
  },
  {
    path: '/admin/dashboard',
    element: createElement(AdminDashboard),
  },
])

