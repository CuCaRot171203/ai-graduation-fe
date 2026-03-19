import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Table, Tag, message } from 'antd'
import SidebarAdmin from '../../components/SidebarAdmin'
import TheHeader from '../../components/TheHeader'
import { createAiTopic, deleteAiTopic, getAiTopics, updateAiTopic, type AiTopic } from '../../apis/aiExamApi'
import { getSubjects, type Subject } from '../../apis/subjectsApi'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2YKy8f18qbth7H0cAQCXkATE3MsAQI1ezzPpWzXe6rPZoXdaXFkOHWDNh_n3o9WSuxQnzQQHRulPPqiSTzhQRU4WouPHLDflw1Op4WRczR69w5aNyfwHxuxviXrwqctop8ZKROlr3gQeBRnAP-c48xnoMNwYidvstRG04ASbi78xM2l1H0BrWo0UkD0PQ4VbwcomtnA4bKLqtUoDeBmoQlF-Qslmu7jHBBUY_rDWMydmmWYHnyPJiwBGe__oS8uAzmgMvO9czNoIi'

export default function AdminTopicManagement() {
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [topics, setTopics] = useState<AiTopic[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topicModalOpen, setTopicModalOpen] = useState(false)
  const [topicSaving, setTopicSaving] = useState(false)
  const [editingTopic, setEditingTopic] = useState<AiTopic | null>(null)
  const [topicForm] = Form.useForm()

  const fetchTopics = useCallback(async () => {
    setTopicsLoading(true)
    try {
      const [topicRes, subjectRes] = await Promise.all([
        getAiTopics({ page: 1, limit: 100 }),
        getSubjects({ page: 1, limit: 200 }),
      ])
      setTopics(topicRes.data?.topics ?? [])
      setSubjects(subjectRes.data?.subjects ?? [])
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Không thể tải danh sách chủ đề')
    } finally {
      setTopicsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTopics()
  }, [fetchTopics])

  const topicOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` })),
    [subjects]
  )

  const openCreateTopic = () => {
    setEditingTopic(null)
    topicForm.resetFields()
    setTopicModalOpen(true)
  }

  const openEditTopic = (t: AiTopic) => {
    setEditingTopic(t)
    topicForm.setFieldsValue({
      subjectId: t.subjectId,
      code: t.code,
      name: t.name,
      description: t.description ?? '',
      orderNumber: t.orderNumber ?? 0,
      isActive: t.isActive ?? true,
    })
    setTopicModalOpen(true)
  }

  const handleSaveTopic = async () => {
    try {
      const values = await topicForm.validateFields()
      setTopicSaving(true)
      if (editingTopic) {
        await updateAiTopic(editingTopic.id, {
          code: values.code,
          name: values.name,
          description: values.description,
          orderNumber: values.orderNumber,
          isActive: values.isActive,
        })
        message.success('Cập nhật chủ đề thành công')
      } else {
        await createAiTopic({
          subjectId: values.subjectId,
          code: values.code,
          name: values.name,
          description: values.description,
          orderNumber: values.orderNumber,
        })
        message.success('Thêm chủ đề thành công')
      }
      setTopicModalOpen(false)
      topicForm.resetFields()
      await fetchTopics()
    } catch (err) {
      if (err instanceof Error) message.error(err.message)
    } finally {
      setTopicSaving(false)
    }
  }

  const handleDeleteTopic = async (id: number) => {
    try {
      await deleteAiTopic(id)
      message.success('Xóa chủ đề thành công')
      await fetchTopics()
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Xóa chủ đề thất bại')
    }
  }

  return (
    <div className="flex min-h-screen bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <SidebarAdmin activeItem="topics" />
      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-hidden">
        <TheHeader
          variant="admin"
          userName="Quản trị viên"
          userSubtitle="Quản lý chủ đề"
          avatarUrl={ADMIN_AVATAR}
          avatarAlt="Admin"
          searchSlot={
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Quản lý chủ đề</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Thêm, sửa, xóa chủ đề theo môn học.</p>
            </div>
          }
        />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1400px] space-y-4">
            <div className="flex justify-end">
              <Button type="primary" onClick={openCreateTopic}>
                Thêm chủ đề
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Table<AiTopic>
                rowKey="id"
                loading={topicsLoading}
                dataSource={topics}
                columns={[
                  { title: 'ID', dataIndex: 'id', width: 70 },
                  { title: 'Mã', dataIndex: 'code', width: 140 },
                  { title: 'Tên chủ đề', dataIndex: 'name' },
                  {
                    title: 'Môn học',
                    render: (_: unknown, r: AiTopic) => r.subject?.name ?? `#${r.subjectId}`,
                    width: 180,
                  },
                  { title: 'Thứ tự', dataIndex: 'orderNumber', width: 90, align: 'center' as const },
                  {
                    title: 'Trạng thái',
                    render: (_: unknown, r: AiTopic) => (
                      <Tag color={r.isActive ? 'green' : 'default'}>{r.isActive ? 'Hoạt động' : 'Tạm khóa'}</Tag>
                    ),
                    width: 120,
                  },
                  {
                    title: 'Hành động',
                    width: 160,
                    render: (_: unknown, r: AiTopic) => (
                      <div className="flex items-center gap-2">
                        <Button size="small" onClick={() => openEditTopic(r)}>
                          Sửa
                        </Button>
                        <Popconfirm
                          title="Xóa chủ đề?"
                          description="Hành động này không thể hoàn tác."
                          okText="Xóa"
                          cancelText="Hủy"
                          onConfirm={() => handleDeleteTopic(r.id)}
                        >
                          <Button size="small" danger>
                            Xóa
                          </Button>
                        </Popconfirm>
                      </div>
                    ),
                  },
                ]}
                pagination={{ pageSize: 20, showSizeChanger: false }}
                locale={{ emptyText: 'Chưa có chủ đề.' }}
              />
            </div>
          </div>
        </div>
      </main>

      <Modal
        title={editingTopic ? 'Cập nhật chủ đề' : 'Thêm chủ đề'}
        open={topicModalOpen}
        onCancel={() => setTopicModalOpen(false)}
        onOk={handleSaveTopic}
        okText={editingTopic ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        confirmLoading={topicSaving}
        destroyOnHidden
      >
        <Form form={topicForm} layout="vertical" initialValues={{ isActive: true, orderNumber: 0 }}>
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}>
            <Select options={topicOptions} showSearch optionFilterProp="label" disabled={!!editingTopic} />
          </Form.Item>
          <Form.Item name="code" label="Mã chủ đề" rules={[{ required: true, message: 'Vui lòng nhập mã chủ đề' }]}>
            <Input placeholder="vd: dao_dong_co" />
          </Form.Item>
          <Form.Item name="name" label="Tên chủ đề" rules={[{ required: true, message: 'Vui lòng nhập tên chủ đề' }]}>
            <Input placeholder="vd: Dao động cơ" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="orderNumber" label="Thứ tự">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          {editingTopic ? (
            <Form.Item name="isActive" label="Trạng thái">
              <Select
                options={[
                  { value: true, label: 'Hoạt động' },
                  { value: false, label: 'Tạm khóa' },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  )
}

