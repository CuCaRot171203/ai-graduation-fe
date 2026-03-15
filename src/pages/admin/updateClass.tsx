import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Form, Input, InputNumber, notification, Spin, message } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getClassById, updateClass, type UpdateClassBody } from '../../apis/classesApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

const toast = {
  success: (description: string) =>
    notification.success({
      message: 'Thành công',
      description,
      placement: 'topRight',
      duration: 2,
    }),
  error: (description: string) =>
    notification.error({
      message: 'Thất bại',
      description,
      placement: 'topRight',
      duration: 2,
    }),
}

export default function UpdateClass() {
  const [form] = Form.useForm<UpdateClassBody>()
  const [searchParams] = useSearchParams()
  const idParam = searchParams.get('id')
  const classId = idParam ? parseInt(idParam, 10) : null
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!classId)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (classId == null || Number.isNaN(classId)) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getClassById(classId)
      .then((res) => {
        if (cancelled) return
        form.setFieldsValue({
          name: res.data.name,
          description: res.data.description ?? '',
          schoolYear: res.data.schoolYear ?? '',
          teacherId: res.data.teacherId,
          subjectId: res.data.subjectId,
        })
      })
      .catch((err) => {
        if (!cancelled) message.error(err instanceof Error ? err.message : 'Không tải được thông tin lớp học')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [classId, form])

  const onFinish = async (values: UpdateClassBody) => {
    if (classId == null || Number.isNaN(classId)) return
    try {
      setSubmitting(true)
      await updateClass(classId, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        schoolYear: values.schoolYear.trim(),
        teacherId: values.teacherId,
        subjectId: values.subjectId,
      })
      toast.success('Cập nhật lớp học thành công.')
      navigate(`/admin/class-detail?id=${classId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật lớp học thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const onCancel = () => {
    navigate(classId != null ? `/admin/class-detail?id=${classId}` : '/admin/list-of-class')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Spin size="large" />
      </div>
    )
  }

  if (!classId || Number.isNaN(classId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Không tìm thấy lớp học.</p>
          <Link to="/admin/list-of-class" className="mt-4 inline-block text-primary hover:underline">
            Quay lại danh sách lớp học
          </Link>
        </div>
      </div>
    )
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
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/admin/list-of-class" className="transition-colors hover:text-primary">
                Quản lý lớp học
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="font-medium text-primary">Cập nhật lớp học</span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-3xl">
            <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/admin/list-of-class" className="hover:text-primary">Quản lý lớp học</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="font-medium text-primary">Cập nhật lớp học</span>
            </nav>
            <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Cập nhật lớp học
            </h1>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="p-8">
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
                      placeholder="Ví dụ: Lớp 12A1 - Toán"
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Form.Item
                      name="teacherId"
                      label="ID giáo viên phụ trách"
                      rules={[{ required: true, message: 'Vui lòng nhập ID giáo viên' }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="teacherId"
                        className="w-full rounded-xl [&_.ant-input-number-input]:rounded-xl"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name="subjectId"
                      label="ID môn học"
                      rules={[{ required: true, message: 'Vui lòng nhập ID môn học' }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="subjectId"
                        className="w-full rounded-xl [&_.ant-input-number-input]:rounded-xl"
                        size="large"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item name="description" label="Mô tả lớp học">
                    <Input.TextArea
                      placeholder="Nhập mô tả chi tiết về lớp học, chương trình học, mục tiêu..."
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
                      icon={<span className="material-symbols-outlined text-lg">save</span>}
                    >
                      Cập nhật lớp
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
