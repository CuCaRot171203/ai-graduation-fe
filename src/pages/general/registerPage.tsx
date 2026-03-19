import { Link, useNavigate } from 'react-router-dom'
import { Button, Checkbox, Form, Input, Select, notification } from 'antd'
import { register, type UserRole } from '../../apis/authApi'

const ROLE_OPTIONS = [
  { value: 'student', label: 'Học sinh' },
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'admin', label: 'Quản trị viên' },
]

export default function RegisterPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = async (values: Record<string, unknown>) => {
    try {
      const payload = {
        email: String(values.email ?? '').trim(),
        password: String(values.password ?? ''),
        fullName: String(values.fullname ?? '').trim(),
        role: String(values.role ?? 'student') as UserRole,
        className: String(values.className ?? '').trim(),
      }
      const res = await register(payload)
      notification.success({
        message: 'Thành công',
        description: res.message ?? 'Đăng ký tài khoản thành công',
        placement: 'topRight',
        duration: 2,
      })
      navigate('/login')
    } catch (err) {
      notification.error({
        message: 'Thất bại',
        description: err instanceof Error ? err.message : 'Đăng ký thất bại',
        placement: 'topRight',
        duration: 2,
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light p-6 font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <div className="w-full max-w-[450px] rounded-xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <span className="material-symbols-outlined text-4xl text-primary">
              school
            </span>
          </div>
          <h1 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            AI Graduation Exam Command Center
          </h1>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Tạo tài khoản mới
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tham gia hệ thống học tập AI thông minh.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          className="register-form"
        >
          <Form.Item
            name="fullname"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input
              prefix={
                <span className="material-symbols-outlined mr-2 text-slate-400">
                  person
                </span>
              }
              placeholder="Nguyễn Văn A"
              size="large"
              className="rounded-lg bg-slate-50 dark:bg-slate-800 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-700"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={
                <span className="material-symbols-outlined mr-2 text-slate-400">
                  mail
                </span>
              }
              placeholder="email@example.com"
              size="large"
              className="rounded-lg bg-slate-50 dark:bg-slate-800 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-700"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={
                <span className="material-symbols-outlined mr-2 text-slate-400">
                  lock
                </span>
              }
              placeholder="••••••••"
              size="large"
              className="rounded-lg bg-slate-50 dark:bg-slate-800 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-700"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={
                <span className="material-symbols-outlined mr-2 text-slate-400">
                  shield
                </span>
              }
              placeholder="••••••••"
              size="large"
              className="rounded-lg bg-slate-50 dark:bg-slate-800 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-700"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò người dùng"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            initialValue="student"
          >
            <Select
              placeholder="Chọn vai trò"
              size="large"
              suffixIcon={
                <span className="material-symbols-outlined text-slate-400">
                  expand_more
                </span>
              }
              options={ROLE_OPTIONS}
              className="[&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:bg-slate-50 [&_.ant-select-selector]:border-slate-200 dark:[&_.ant-select-selector]:bg-slate-800 dark:[&_.ant-select-selector]:border-slate-700"
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.role !== cur.role}
          >
            {({ getFieldValue }) =>
              getFieldValue('role') === 'student' ? (
                <Form.Item
                  name="className"
                  label="Lớp học"
                  rules={[{ required: true, message: 'Vui lòng nhập lớp học' }]}
                >
                  <Input
                    placeholder="12A1"
                    size="large"
                    className="rounded-lg bg-slate-50 dark:bg-slate-800 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-700"
                  />
                </Form.Item>
              ) : (
                <Form.Item name="className" label="Lớp học (không bắt buộc)">
                  <Input
                    placeholder="12A1"
                    size="large"
                    className="rounded-lg bg-slate-50 dark:bg-slate-800 [&.ant-input]:border-slate-200 dark:[&.ant-input]:border-slate-700"
                  />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator(_, value) {
                  if (value) return Promise.resolve()
                  return Promise.reject(
                    new Error('Bạn cần đồng ý với điều khoản sử dụng'),
                  )
                },
              },
            ]}
          >
            <Checkbox className="[&_.ant-checkbox-inner]:rounded [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-primary [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-primary">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Tôi đồng ý với{' '}
                <a
                  href="#"
                  className="text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a
                  href="#"
                  className="text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  chính sách bảo mật
                </a>
                .
              </span>
            </Checkbox>
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-bold shadow-md shadow-primary/20 hover:!bg-blue-700"
            >
              Tạo tài khoản
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="ml-1 font-semibold text-primary hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
