import { useCallback, useEffect, useState } from 'react'
import { Button, Form, Input, Modal, notification, message } from 'antd'
import SidebarLecture from '../../components/SidebarLecture'
import TheHeader from '../../components/TheHeader'
import { changeAiPassword, getAiMe, updateAiMe, type AiAuthMeData } from '../../apis/aiExamApi'
import type { LoginUser } from '../../apis/authApi'

const LECTURE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB_XeKnZp9FDwVkj_Dy-H1n-xZmsvyK3qEfeV4N8hiQ0EBpSyghQyWE2inyxBJRk85zvCZgQh7Xqduh5k669Ew1FHs-sq1wEODa3FavZqUXGgwx8V-6RPffWs94LDGhFvqvzM4Ma_FO41SDrs7rgy-_4RvdxG_NWHrnInTsf2oLmfM8hnBIWCYOfxQflTRqCVS3BYPV5VMa58TLuy2W8Mz7WqqZC3-QxiE9UlwdL81gwNtPAg_VTMEhXnaGJfjrXDv9tlEWVI_u_On'

function getStoredUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as LoginUser
  } catch {
    return null
  }
}

export default function LectureProfile() {
  const user = getStoredUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [me, setMe] = useState<AiAuthMeData | null>(null)
  const [form] = Form.useForm<{ fullName: string; className?: string }>()

  const [pwOpen, setPwOpen] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwForm] = Form.useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>()

  const fetchMe = useCallback(() => {
    setLoading(true)
    getAiMe()
      .then((res) => {
        setMe(res.data)
        form.setFieldsValue({ fullName: res.data.fullName, className: res.data.className ?? '' })
      })
      .catch((err) => message.error(err?.message ?? 'Không tải được profile'))
      .finally(() => setLoading(false))
  }, [form])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const res = await updateAiMe({ fullName: values.fullName, className: values.className ?? '' })
      setMe(res.data)
      notification.success({
        message: 'Thành công',
        description: 'Đã cập nhật thông tin cá nhân.',
        placement: 'topRight',
        duration: 1.2,
      })
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      const values = await pwForm.validateFields()
      setPwSaving(true)
      await changeAiPassword(values)
      notification.success({
        message: 'Thành công',
        description: 'Đổi mật khẩu thành công.',
        placement: 'topRight',
        duration: 1.2,
      })
      setPwOpen(false)
      pwForm.resetFields()
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 antialiased">
      <SidebarLecture activeItem="profile" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="lecture"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Hồ sơ người dùng</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Xem và cập nhật thông tin cá nhân.</p>
            </div>
          }
          userName={user?.fullName ?? 'Giảng viên'}
          userSubtitle="Profile"
          avatarUrl={LECTURE_AVATAR}
          avatarAlt="Avatar"
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Thông tin cá nhân</h2>
              <div className="flex items-center gap-2">
                <Button icon={<span className="material-symbols-outlined">refresh</span>} onClick={fetchMe} loading={loading}>
                  Làm mới
                </Button>
                <Button icon={<span className="material-symbols-outlined">lock</span>} onClick={() => setPwOpen(true)} disabled={loading || !me}>
                  Đổi mật khẩu
                </Button>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {loading ? (
                <div className="py-6 text-center text-slate-500">Đang tải...</div>
              ) : me ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</div>
                    <div className="mt-1 font-medium text-slate-900 dark:text-white">{me.email}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</div>
                    <div className="mt-1 font-medium text-slate-900 dark:text-white">{me.role}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</div>
                    <div className="mt-1 font-medium text-slate-900 dark:text-white">{new Date(me.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                  <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Cập nhật thông tin cá nhân</div>
                    <Form form={form} layout="vertical">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                          <Input placeholder="Nguyễn Văn B" />
                        </Form.Item>
                        <Form.Item name="className" label="Lớp (tùy chọn)">
                          <Input placeholder="12A2" />
                        </Form.Item>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button type="primary" onClick={handleUpdate} loading={saving} icon={<span className="material-symbols-outlined">save</span>}>
                          Lưu thay đổi
                        </Button>
                      </div>
                    </Form>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500">Không có dữ liệu.</div>
              )}
            </section>

            {me?.stats && (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Số bài thi đã làm</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{me.stats.totalExamsTaken ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Số đề đã tạo</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{me.stats.totalExamsCreated ?? 0}</div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Modal
        title="Đổi mật khẩu"
        open={pwOpen}
        onCancel={() => {
          setPwOpen(false)
          pwForm.resetFields()
        }}
        onOk={handleChangePassword}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
        confirmLoading={pwSaving}
        width={520}
        destroyOnHidden
      >
        <Form form={pwForm} layout="vertical" className="mt-4">
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Nhập lại mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Nhập lại mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

