import { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Select, Switch, Table, message, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  getAdminUsers,
  patchAdminUserStatus,
  updateAdminUser,
  type AdminUser,
  type AdminUserDetail,
  type AdminUsersParams,
  type CreateAdminUserBody,
  type UpdateAdminUserBody,
} from '../../apis/adminApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

const ROLE_OPTIONS = [
  { value: '', label: '--' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'student', label: 'Học sinh' },
]

const IS_ACTIVE_OPTIONS = [
  { value: '', label: '--' },
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Không hoạt động' },
]

const SORT_BY_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'fullName', label: 'Họ tên' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Vai trò' },
  { value: 'updatedAt', label: 'Cập nhật' },
]

const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Giảm dần' },
  { value: 'asc', label: 'Tăng dần' },
]

const DEFAULT_PARAMS: AdminUsersParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    admin: 'Admin',
    teacher: 'Giáo viên',
    student: 'Học sinh',
  }
  return map[role] ?? role
}

const NOTIFICATION_DURATION = 1
const NOTIFICATION_PLACEMENT = 'topRight' as const

export default function UserList() {
  const [params, setParams] = useState<AdminUsersParams>(DEFAULT_PARAMS)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  })
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm] = Form.useForm<CreateAdminUserBody>()
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewUser, setViewUser] = useState<AdminUserDetail | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editUserId, setEditUserId] = useState<number | null>(null)
  const [editForm] = Form.useForm<UpdateAdminUserBody>()
  const [editSubmitting, setEditSubmitting] = useState(false)

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

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAdminUsers(params)
      .then((res) => {
        if (cancelled) return
        if (res?.data?.users) setUsers(res.data.users)
        if (res?.data?.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => {
        if (!cancelled) message.error(err instanceof Error ? err.message : 'Lỗi tải danh sách')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [params.page, params.limit, params.search, params.role, params.isActive, params.sortBy, params.sortOrder])

  const updateParams = (next: Partial<AdminUsersParams>) => {
    setParams((prev) => {
      const out = { ...prev, ...next }
      if (next.search !== undefined || next.role !== undefined || next.isActive !== undefined)
        out.page = 1
      return out
    })
  }

  const fetchUsers = () => {
    setLoading(true)
    getAdminUsers(params)
      .then((res) => {
        if (res?.data?.users) setUsers(res.data.users)
        if (res?.data?.pagination) setPagination(res.data.pagination)
      })
      .catch((err) => message.error(err instanceof Error ? err.message : 'Lỗi tải danh sách'))
      .finally(() => setLoading(false))
  }

  const onAddUserFinish = async (values: CreateAdminUserBody) => {
    setAddSubmitting(true)
    try {
      await createAdminUser({
        ...values,
        className: values.className?.trim() || null,
      })
      setAddModalOpen(false)
      addForm.resetFields()
      toast.success('Thêm người dùng thành công.')
      fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Thêm người dùng thất bại.')
    } finally {
      setAddSubmitting(false)
    }
  }

  const openViewModal = (record: AdminUser) => {
    setViewModalOpen(true)
    setViewUser(null)
    setViewLoading(true)
    getAdminUser(record.id)
      .then((res) => setViewUser(res.data))
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Không tải được thông tin'))
      .finally(() => setViewLoading(false))
  }

  const openEditModal = (record: AdminUser) => {
    setEditUserId(record.id)
    editForm.setFieldsValue({
      email: record.email,
      fullName: record.fullName,
      role: record.role as UpdateAdminUserBody['role'],
      className: record.className ?? '',
      isActive: record.isActive,
    })
    setEditModalOpen(true)
  }

  const onEditUserFinish = async (values: UpdateAdminUserBody) => {
    if (editUserId == null) return
    setEditSubmitting(true)
    try {
      const body: UpdateAdminUserBody = {
        ...values,
        className: values.className?.trim() || null,
      }
      if (values.password?.trim()) body.password = values.password.trim()
      await updateAdminUser(editUserId, body)
      setEditModalOpen(false)
      setEditUserId(null)
      editForm.resetFields()
      toast.success('Cập nhật người dùng thành công.')
      fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDelete = (record: AdminUser) => {
    Modal.confirm({
      title: 'Xóa người dùng',
      content: `Bạn có chắc muốn xóa "${record.fullName}" (${record.email})?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteAdminUser(record.id)
          toast.success('Xóa người dùng thành công.')
          fetchUsers()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Xóa thất bại.')
        }
      },
    })
  }

  const handleToggleStatus = (record: AdminUser) => {
    const nextActive = !record.isActive
    Modal.confirm({
      title: nextActive ? 'Mở người dùng' : 'Khóa người dùng',
      content: `Bạn có chắc muốn ${nextActive ? 'mở' : 'khóa'} "${record.fullName}"?`,
      okText: nextActive ? 'Mở' : 'Khóa',
      okType: nextActive ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await patchAdminUserStatus(record.id, nextActive)
          toast.success(nextActive ? 'Mở người dùng thành công.' : 'Khóa người dùng thành công.')
          fetchUsers()
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại.')
        }
      },
    })
  }

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      className: 'font-semibold text-slate-900 dark:text-slate-100',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'text-slate-600 dark:text-slate-400',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {roleLabel(role)}
        </span>
      ),
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      className: 'text-slate-500',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Hoạt động
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            Không hoạt động
          </span>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'text-slate-500 text-sm',
      render: (v: string) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—'),
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_, record) => (
        <span className="text-xs text-slate-500">
          Thi: {record.stats?.totalExamsTaken ?? 0} · Đề: {record.stats?.totalExamsCreated ?? 0} · Câu: {record.stats?.totalQuestionsCreated ?? 0}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      width: 160,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openViewModal(record)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary"
            title="Xem"
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
          <button
            type="button"
            onClick={() => openEditModal(record)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary"
            title="Sửa"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(record)}
            className={`rounded-lg p-1.5 transition-colors ${
              record.isActive
                ? 'text-slate-400 hover:bg-amber-100 hover:text-amber-600'
                : 'text-slate-400 hover:bg-green-100 hover:text-green-600'
            }`}
            title={record.isActive ? 'Khóa' : 'Mở'}
          >
            <span className="material-symbols-outlined text-xl">
              {record.isActive ? 'lock' : 'lock_open'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(record)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-500"
            title="Xóa"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="users" />

      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Admin User"
          userSubtitle="Quản trị viên"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
        />

        <div className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Danh sách người dùng
                </h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Lấy danh sách tất cả người dùng với phân trang, tìm kiếm và lọc.
                </p>
              </div>
              <Button
                type="primary"
                className="flex items-center gap-2 shadow-lg shadow-primary/20"
                icon={<span className="material-symbols-outlined text-lg">person_add</span>}
                onClick={() => setAddModalOpen(true)}
              >
                Thêm người dùng
              </Button>
            </div>

            <Modal
              title="Thêm người dùng"
              open={addModalOpen}
              onCancel={() => {
                if (!addSubmitting) setAddModalOpen(false)
              }}
              footer={null}
              destroyOnHidden
              width={480}
            >
              <Form
                form={addForm}
                layout="vertical"
                requiredMark={false}
                onFinish={onAddUserFinish}
                initialValues={{ role: 'student', isActive: true }}
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input placeholder="newuser@example.com" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item
                  name="fullName"
                  label="Họ tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input placeholder="Nguyễn Văn B" />
                </Form.Item>
                <Form.Item
                  name="role"
                  label="Vai trò"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                  <Select
                    options={[
                      { value: 'admin', label: 'Admin' },
                      { value: 'teacher', label: 'Giáo viên' },
                      { value: 'student', label: 'Học sinh' },
                    ]}
                    placeholder="Chọn vai trò"
                  />
                </Form.Item>
                <Form.Item name="className" label="Lớp">
                  <Input placeholder="12A1 (tùy chọn)" />
                </Form.Item>
                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
                </Form.Item>
                <Form.Item className="mb-0 flex justify-end gap-2">
                  <Button onClick={() => setAddModalOpen(false)} disabled={addSubmitting}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={addSubmitting}>
                    Thêm
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Chi tiết người dùng"
              open={viewModalOpen}
              onCancel={() => setViewModalOpen(false)}
              footer={null}
              destroyOnHidden
              width={480}
            >
              {viewLoading ? (
                <div className="py-8 text-center text-slate-500">Đang tải...</div>
              ) : viewUser ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">Họ tên</span>
                    <p className="font-medium text-slate-900 dark:text-white">{viewUser.fullName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">Email</span>
                    <p className="text-slate-700 dark:text-slate-300">{viewUser.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">Vai trò</span>
                    <p className="font-medium">{roleLabel(viewUser.role)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">Lớp</span>
                    <p className="text-slate-700 dark:text-slate-300">{viewUser.className ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">Trạng thái</span>
                    <p>
                      {viewUser.isActive ? (
                        <span className="text-green-600 dark:text-green-400">Hoạt động</span>
                      ) : (
                        <span className="text-slate-500">Khóa</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">Thống kê</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Thi: {viewUser.stats?.totalExamsTaken ?? 0} · Đề: {viewUser.stats?.totalExamsCreated ?? 0} · Câu: {viewUser.stats?.totalQuestionsCreated ?? 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500">Ngày tạo</span>
                    <p className="text-sm text-slate-600">
                      {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>
              ) : null}
            </Modal>

            <Modal
              title="Cập nhật người dùng"
              open={editModalOpen}
              onCancel={() => {
                if (!editSubmitting) {
                  setEditModalOpen(false)
                  setEditUserId(null)
                  editForm.resetFields()
                }
              }}
              footer={null}
              destroyOnHidden
              width={480}
            >
              <Form
                form={editForm}
                layout="vertical"
                requiredMark={false}
                onFinish={onEditUserFinish}
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input placeholder="user@example.com" />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu (để trống nếu không đổi)">
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item
                  name="fullName"
                  label="Họ tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input placeholder="Họ tên" />
                </Form.Item>
                <Form.Item
                  name="role"
                  label="Vai trò"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                  <Select
                    options={[
                      { value: 'admin', label: 'Admin' },
                      { value: 'teacher', label: 'Giáo viên' },
                      { value: 'student', label: 'Học sinh' },
                    ]}
                    placeholder="Chọn vai trò"
                  />
                </Form.Item>
                <Form.Item name="className" label="Lớp">
                  <Input placeholder="12A1 (tùy chọn)" />
                </Form.Item>
                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
                </Form.Item>
                <Form.Item className="mb-0 flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setEditModalOpen(false)
                      setEditUserId(null)
                      editForm.resetFields()
                    }}
                    disabled={editSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={editSubmitting}>
                    Cập nhật
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            {/* Filter bar: search, role, isActive, sortBy, sortOrder - page/limit dùng phân trang bảng bên dưới */}
            <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Tìm kiếm (tên, email, lớp)
                </label>
                <Input
                  placeholder="search"
                  value={params.search ?? ''}
                  onChange={(e) => updateParams({ search: e.target.value })}
                  className="rounded-xl"
                  allowClear
                />
              </div>
              <div className="w-28">
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Role
                </label>
                <Select
                  value={params.role ?? ''}
                  onChange={(v) => updateParams({ role: v || undefined })}
                  options={ROLE_OPTIONS}
                  className="w-full [&_.ant-select-selector]:rounded-xl"
                />
              </div>
              <div className="w-36">
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Trạng thái
                </label>
                <Select
                  value={
                    params.isActive === undefined || params.isActive === null
                      ? ''
                      : String(params.isActive)
                  }
                  onChange={(v) =>
                    updateParams({
                      isActive: v === '' ? undefined : v === 'true',
                    })
                  }
                  options={IS_ACTIVE_OPTIONS}
                  className="w-full [&_.ant-select-selector]:rounded-xl"
                />
              </div>
              <div className="w-36">
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Sắp xếp theo
                </label>
                <Select
                  value={params.sortBy ?? 'createdAt'}
                  onChange={(v) => updateParams({ sortBy: v })}
                  options={SORT_BY_OPTIONS}
                  className="w-full [&_.ant-select-selector]:rounded-xl"
                />
              </div>
              <div className="w-32">
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Thứ tự
                </label>
                <Select
                  value={params.sortOrder ?? 'desc'}
                  onChange={(v) => updateParams({ sortOrder: v as 'asc' | 'desc' })}
                  options={SORT_ORDER_OPTIONS}
                  className="w-full [&_.ant-select-selector]:rounded-xl"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <Table<AdminUser>
                rowKey="id"
                columns={columns}
                dataSource={users}
                loading={loading}
                pagination={{
                  current: pagination.currentPage,
                  pageSize: pagination.limit,
                  total: pagination.totalCount,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} / ${total} người dùng`,
                  onChange: (page, pageSize) =>
                    updateParams({
                      page: pageSize !== pagination.limit ? 1 : page,
                      limit: pageSize ?? params.limit,
                    }),
                }}
                className="[&_.ant-table-thead>tr>th]:bg-slate-50/50 [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:text-slate-500 dark:[&_.ant-table-thead>tr>th]:bg-slate-800/50"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
