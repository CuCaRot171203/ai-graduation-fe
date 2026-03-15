import { useState } from 'react'
import type { ReactNode } from 'react'
import { Dropdown, Form, Input, Modal, notification } from 'antd'
import type { MenuProps } from 'antd'
import {
  changePassword,
  getMe,
  updateMe,
  type AuthMeData,
  type ChangePasswordBody,
  type UpdateMeBody,
} from '../apis/authApi'

export type TheHeaderVariant = 'lecture' | 'admin' | 'student'

export type TheHeaderProps = {
  searchPlaceholder?: string
  userName: string
  userSubtitle: string
  avatarUrl: string
  avatarAlt?: string
  variant?: TheHeaderVariant
  searchSlot?: ReactNode
  searchAreaClassName?: string
}

const NOTIFICATION_DURATION = 1
const NOTIFICATION_PLACEMENT = 'topRight' as const

const toast = {
  success: (description: string) =>
    notification.success({
      message: 'Thành công',
      description,
      placement: NOTIFICATION_PLACEMENT,
      duration: NOTIFICATION_DURATION,
    }),
  error: (description: string) =>
    notification.error({
      message: 'Thất bại',
      description,
      placement: NOTIFICATION_PLACEMENT,
      duration: NOTIFICATION_DURATION,
    }),
}

export default function TheHeader({
  searchPlaceholder = 'Tìm kiếm...',
  userName,
  userSubtitle,
  avatarUrl,
  avatarAlt = 'Avatar',
  variant = 'lecture',
  searchSlot,
  searchAreaClassName = '',
}: TheHeaderProps) {
  const isAdmin = variant === 'admin'
  const isStudent = variant === 'student'
  const isLecture = variant === 'lecture'

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileData, setProfileData] = useState<AuthMeData | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [updateForm] = Form.useForm<UpdateMeBody>()
  const [updateSubmitting, setUpdateSubmitting] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm] = Form.useForm<ChangePasswordBody>()
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const openProfileModal = () => {
    setProfileModalOpen(true)
    setProfileData(null)
    setProfileLoading(true)
    getMe()
      .then((res) => setProfileData(res.data))
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Lỗi tải thông tin'))
      .finally(() => setProfileLoading(false))
  }

  const openUpdateModal = () => {
    setProfileModalOpen(false)
    setUpdateModalOpen(true)
    if (profileData) {
      updateForm.setFieldsValue({
        fullName: profileData.fullName,
        className: profileData.className ?? '',
      })
    } else {
      getMe().then((res) => {
        updateForm.setFieldsValue({
          fullName: res.data.fullName,
          className: res.data.className ?? '',
        })
      })
    }
  }

  const openPasswordModal = () => {
    setPasswordModalOpen(true)
    passwordForm.resetFields()
  }

  const handleUpdateProfile = async () => {
    try {
      const values = await updateForm.validateFields()
      setUpdateSubmitting(true)
      await updateMe({
        fullName: values.fullName?.trim() || undefined,
        className: values.className?.trim() || undefined,
      })
      toast.success('Cập nhật thông tin thành công')
      setUpdateModalOpen(false)
      updateForm.resetFields()
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setUpdateSubmitting(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      if (values.newPassword !== values.confirmPassword) {
        toast.error('Mật khẩu mới và xác nhận không khớp')
        return
      }
      setPasswordSubmitting(true)
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      toast.success('Đổi mật khẩu thành công')
      setPasswordModalOpen(false)
      passwordForm.resetFields()
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      toast.error(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Xem thông tin profile',
      onClick: openProfileModal,
    },
    {
      key: 'update',
      label: 'Cập nhật thông tin',
      onClick: () => {
        setUpdateModalOpen(true)
        getMe().then((res) => {
          updateForm.setFieldsValue({
            fullName: res.data.fullName,
            className: res.data.className ?? '',
          })
        })
      },
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      onClick: openPasswordModal,
    },
  ]

  const headerClass = isAdmin
    ? 'sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900'
    : 'sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900'

  const searchWrapClass = isAdmin
    ? `flex-1 max-w-xl min-w-0 ${searchAreaClassName}`
    : isStudent
      ? `w-full max-w-md min-w-0 flex-1 ${searchAreaClassName}`
      : `w-1/3 min-w-0 ${searchAreaClassName}`

  const notificationDotClass = isStudent
    ? 'absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-primary dark:border-slate-900'
    : isAdmin
      ? 'absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900'
      : 'absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900'

  const userBlock = (
    <div
      className={
        isAdmin
          ? 'group flex cursor-pointer items-center gap-3'
          : 'flex cursor-pointer items-center gap-3 border-l border-slate-200 pl-6 dark:border-slate-800'
      }
    >
      <div
        className={
          isLecture
            ? 'hidden text-right sm:block'
            : 'text-right'
        }
      >
        <p
          className={
            isAdmin
              ? 'leading-none text-sm font-semibold text-slate-900 dark:text-white'
              : 'text-sm font-semibold'
          }
        >
          {userName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {userSubtitle}
        </p>
      </div>

      {isAdmin ? (
        <img
          alt={avatarAlt}
          className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/10 transition-all group-hover:ring-primary/30"
          src={avatarUrl}
        />
      ) : (
        <div
          className={
            isStudent
              ? 'h-10 w-10 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700'
              : 'h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'
          }
        >
          <img
            alt={avatarAlt}
            className="h-full w-full object-cover"
            src={avatarUrl}
          />
        </div>
      )}

      {(isAdmin || isLecture) && (
        <span className="material-symbols-outlined text-slate-400">
          expand_more
        </span>
      )}
      {isStudent && (
        <span className="material-symbols-outlined text-slate-400">
          expand_more
        </span>
      )}
    </div>
  )

  return (
    <>
      <header className={headerClass}>
        <div className={searchWrapClass}>
          {searchSlot ?? (
            <div className={isAdmin ? 'relative' : 'group relative'}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                className={
                  isAdmin
                    ? 'w-full rounded-xl border-none bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary dark:bg-slate-800'
                    : 'w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 dark:bg-slate-800'
                }
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            className={
              isAdmin
                ? 'relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                : isStudent
                  ? 'relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  : 'relative text-slate-600 transition-colors hover:text-primary dark:text-slate-400'
            }
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className={notificationDotClass} />
          </button>

          {isAdmin && (
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          )}

          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            {userBlock}
          </Dropdown>
        </div>
      </header>

      {/* Modal Xem thông tin profile */}
      <Modal
        title="Thông tin profile"
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        footer={[
          <button
            key="close"
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Đóng
          </button>,
          <button
            key="update"
            type="button"
            onClick={openUpdateModal}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Cập nhật thông tin
          </button>,
        ]}
        width={420}
      >
        {profileLoading ? (
          <p className="py-4 text-slate-500">Đang tải...</p>
        ) : profileData ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-slate-500">Email:</span> {profileData.email}</p>
            <p><span className="font-medium text-slate-500">Họ tên:</span> {profileData.fullName}</p>
            <p><span className="font-medium text-slate-500">Vai trò:</span> {profileData.role}</p>
            <p><span className="font-medium text-slate-500">Lớp:</span> {profileData.className ?? '—'}</p>
            <p><span className="font-medium text-slate-500">Ngày tạo:</span> {new Date(profileData.createdAt).toLocaleString('vi-VN')}</p>
            {profileData.stats && (
              <>
                <p><span className="font-medium text-slate-500">Số bài thi đã làm:</span> {profileData.stats.totalExamsTaken}</p>
                <p><span className="font-medium text-slate-500">Số bài thi đã tạo:</span> {profileData.stats.totalExamsCreated}</p>
              </>
            )}
          </div>
        ) : (
          <p className="py-4 text-slate-500">Không có dữ liệu</p>
        )}
      </Modal>

      {/* Modal Cập nhật thông tin */}
      <Modal
        title="Cập nhật thông tin"
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        onOk={handleUpdateProfile}
        okText="Lưu"
        confirmLoading={updateSubmitting}
        width={400}
        destroyOnHidden
      >
        <Form form={updateForm} layout="vertical" className="mt-4">
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input placeholder="Họ tên" />
          </Form.Item>
          <Form.Item name="className" label="Lớp">
            <Input placeholder="Ví dụ: 12A2" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Đổi mật khẩu */}
      <Modal
        title="Đổi mật khẩu"
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
        onOk={handleChangePassword}
        okText="Đổi mật khẩu"
        confirmLoading={passwordSubmitting}
        width={400}
        destroyOnHidden
      >
        <Form form={passwordForm} layout="vertical" className="mt-4">
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}>
            <Input.Password placeholder="Mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới' }]}>
            <Input.Password placeholder="Mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            rules={[{ required: true, message: 'Xác nhận mật khẩu mới' }]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
