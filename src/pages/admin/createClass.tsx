import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Form, Input, Select, notification, message } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getAdminUsers, type AdminUser } from '../../apis/adminApi'
import { getSubjects } from '../../apis/subjectsApi'
import { createClass, type CreateClassBody } from '../../apis/classesApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

const toast = {
  success: (description: string) =>
    notification.success({ message: 'Thành công', description, placement: 'topRight', duration: 2 }),
  error: (description: string) =>
    notification.error({ message: 'Thất bại', description, placement: 'topRight', duration: 2 }),
}

export default function CreateClass() {
  const [form] = Form.useForm<CreateClassBody>()
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [subjects, setSubjects] = useState<{ id: number; name: string; code: string }[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoadingOptions(true)
    Promise.all([
      getAdminUsers({
        page: 1,
        limit: 100,
        role: 'teacher',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      getSubjects({ page: 1, limit: 100 }),
    ])
      .then(([usersRes, subjectsRes]) => {
        if (cancelled) return
        setTeachers(usersRes.data?.users ?? [])
        setSubjects(subjectsRes.data?.subjects ?? [])
      })
      .catch((err) => {
        if (!cancelled) message.error(err instanceof Error ? err.message : 'Lỗi tải danh sách')
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false)
      })
    return () => { cancelled = true }
  }, [])

  const teacherOptions = teachers.map((t) => ({ value: t.id, label: t.fullName || t.email || `#${t.id}` }))
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))

  const onFinish = async (values: CreateClassBody) => {
    try {
      setSubmitting(true)
      await createClass({
        name: values.name.trim(),
        code: values.code.trim(),
        description: values.description?.trim() || undefined,
        schoolYear: values.schoolYear.trim(),
        teacherId: values.teacherId,
        subjectId: values.subjectId,
      })
      toast.success('Tạo lớp học thành công.')
      navigate('/admin/list-of-class')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tạo lớp học thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const onCancel = () => {
    navigate('/admin/list-of-class')
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="classes" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
          searchSlot={
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/admin/list-of-class" className="transition-colors hover:text-primary">
                Lớp học
              </Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="font-medium text-slate-900 dark:text-white">Tạo lớp học mới</span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-[700px]">
            <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/admin/list-of-class" className="hover:text-primary">Quản lý lớp học</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="font-medium text-primary">Tạo lớp học mới</span>
            </nav>
            <h2 className="mb-8 text-3xl font-extrabold text-slate-900 dark:text-white">
              Tạo lớp học mới
            </h2>

            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={onFinish}
                className="space-y-6"
              >
                <Form.Item
                  name="name"
                  label="Tên lớp học"
                  rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}
                >
                  <Input
                    placeholder="Ví dụ: Lớp 12A1 - Vật Lý"
                    size="large"
                    className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="code"
                  label="Mã lớp"
                  rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}
                >
                  <Input
                    placeholder="Ví dụ: 12A1-VL"
                    size="large"
                    className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="schoolYear"
                  label="Niên khóa"
                  rules={[{ required: true, message: 'Vui lòng nhập niên khóa' }]}
                >
                  <Input
                    placeholder="Ví dụ: 2025-2026"
                    size="large"
                    className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Form.Item
                    name="subjectId"
                    label="Môn học"
                    rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
                  >
                    <Select
                      placeholder="Chọn môn học"
                      size="large"
                      loading={loadingOptions}
                      options={subjectOptions}
                      className="[&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:border-slate-200 dark:[&_.ant-select-selector]:border-slate-700 dark:[&_.ant-select-selector]:bg-slate-800"
                    />
                  </Form.Item>

                  <Form.Item
                    name="teacherId"
                    label="Giáo viên phụ trách"
                    rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}
                  >
                    <Select
                      placeholder="Chọn giáo viên"
                      size="large"
                      loading={loadingOptions}
                      options={teacherOptions}
                      className="[&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:border-slate-200 dark:[&_.ant-select-selector]:border-slate-700 dark:[&_.ant-select-selector]:bg-slate-800"
                    />
                  </Form.Item>
                </div>

                <Form.Item name="description" label="Mô tả lớp học">
                  <Input.TextArea
                    placeholder="Mô tả mục tiêu lớp học, lộ trình học tập..."
                    rows={4}
                    className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                  />
                </Form.Item>

                <Form.Item className="mb-0 flex flex-row flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                  <Button
                    type="default"
                    htmlType="button"
                    size="large"
                    onClick={onCancel}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-600 hover:!border-slate-300 hover:!bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:!bg-slate-700"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={submitting}
                    className="flex items-center justify-center gap-2 rounded-xl px-6 font-semibold shadow-lg shadow-primary/20"
                    icon={<span className="material-symbols-outlined text-lg">add</span>}
                  >
                    Tạo lớp
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="material-symbols-outlined text-primary">info</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quy trình tạo lớp</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sau khi tạo, mã lớp học sẽ được gửi tự động đến giáo viên phụ trách.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="material-symbols-outlined text-primary">security</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bảo mật dữ liệu</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tất cả thông tin lớp học được mã hóa và bảo vệ theo chuẩn.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hỗ trợ AI</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hệ thống AI sẽ tự động đề xuất lộ trình thi cử dựa trên môn học.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
