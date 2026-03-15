import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Form, Input, Radio, notification, Spin, message } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { getSubjectById, updateSubject, type UpdateSubjectBody } from '../../apis/subjectsApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC_atX5EugpNdN-r15ms1JSWp8hmJJ9amN0wxeM-RoI4CV03dtpgjmZkJBD4uOPoRa9GGgnN0Og1JZvTJ1ZkYgXGlW_NthNelzX2sp6nCDi3jfzILWgQR8pujSaEeEPiywVM1zESys2o4svxHCnJW3U0e52-mjsxPkKEYdBHWOyPjqDQ7q5gZNf_wASEuOiFX-OQenCO4aUNh2LUBLL6kMHq0EGW5OkSWQ2bgqcPmKBEsYhrTsAQ81ZNK7V1R3ryqrjSxL_bKefo5aB'

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

export default function UpdateSubject() {
  const [form] = Form.useForm<UpdateSubjectBody & { status: string }>()
  const [searchParams] = useSearchParams()
  const idParam = searchParams.get('id')
  const subjectId = idParam ? parseInt(idParam, 10) : null
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!subjectId)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (subjectId == null || Number.isNaN(subjectId)) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getSubjectById(subjectId)
      .then((res) => {
        if (cancelled) return
        form.setFieldsValue({
          code: res.data.code,
          name: res.data.name,
          description: res.data.description ?? '',
          status: res.data.isActive ? 'active' : 'hidden',
        })
      })
      .catch((err) => {
        if (!cancelled) message.error(err instanceof Error ? err.message : 'Không tải được thông tin môn học')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [subjectId, form])

  const onFinish = async (values: { code: string; name: string; description?: string; status: string }) => {
    if (subjectId == null || Number.isNaN(subjectId)) return
    try {
      setSubmitting(true)
      await updateSubject(subjectId, {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        isActive: values.status === 'active',
      })
      toast.success('Cập nhật môn học thành công.')
      navigate(`/admin/detail-subject?id=${subjectId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật môn học thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const onCancel = () => {
    navigate(subjectId != null ? `/admin/detail-subject?id=${subjectId}` : '/admin/all-subjects')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Spin size="large" />
      </div>
    )
  }

  if (!subjectId || Number.isNaN(subjectId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Không tìm thấy môn học.</p>
          <Link to="/admin/all-subjects" className="mt-4 inline-block text-primary hover:underline">
            Quay lại danh sách môn học
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarAdmin activeItem="subjects" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin Panel"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
          searchSlot={
            <div className="flex items-center gap-2">
              <Link to="/admin/all-subjects" className="text-slate-500 dark:text-slate-400 hover:text-primary">
                Quản lý môn học
              </Link>
              <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
              <span className="font-medium text-primary">Cập nhật môn học</span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-4xl">
            <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/admin/all-subjects" className="hover:text-primary">Môn học</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="font-medium text-primary">Cập nhật môn học</span>
            </nav>
            <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Cập nhật môn học
            </h2>

            <div className="mx-auto max-w-[600px]">
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Form
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={onFinish}
                  className="space-y-6"
                >
                  <Form.Item
                    name="code"
                    label="Mã môn học"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã môn học' },
                      { whitespace: true, message: 'Mã môn không được để trống' },
                    ]}
                  >
                    <Input
                      placeholder="Ví dụ: PHYS12, MATH12"
                      size="large"
                      className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    name="name"
                    label="Tên môn học"
                    rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
                  >
                    <Input
                      placeholder="Nhập tên môn học..."
                      size="large"
                      className="rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item name="description" label="Mô tả môn học">
                    <Input.TextArea
                      placeholder="Nhập mô tả chi tiết môn học..."
                      rows={4}
                      className="resize-none rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&.ant-input]:rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item name="status" label="Trạng thái">
                    <Radio.Group className="flex gap-6">
                      <Radio value="active" className="[&_.ant-radio]:!w-5 [&_.ant-radio]:!h-5 [&_.ant-radio]:!text-primary">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Hoạt động</span>
                      </Radio>
                      <Radio value="hidden" className="[&_.ant-radio]:!w-5 [&_.ant-radio]:!h-5 [&_.ant-radio]:!text-primary">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tạm ẩn</span>
                      </Radio>
                    </Radio.Group>
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
                      Cập nhật môn học
                    </Button>
                  </Form.Item>
                </Form>
              </div>

              <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Cần hỗ trợ? Liên hệ{' '}
                <a href="#" className="text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                  Bộ phận quản lý đào tạo
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
