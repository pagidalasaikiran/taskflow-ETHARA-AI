import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { TASK_STATUSES, PRIORITIES } from '../../constants';
import { toInputDate } from '../../utils/dateUtils';

export default function TaskForm({ initialData, projects = [], members = [], onSubmit, onCancel, loading }) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || PRIORITIES.MEDIUM,
      status: initialData?.status || TASK_STATUSES.TODO,
      dueDate: toInputDate(initialData?.dueDate) || '',
      assignedTo: initialData?.assignedTo?._id || initialData?.assignedTo || '',
      project: initialData?.project?._id || initialData?.project || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || PRIORITIES.MEDIUM,
        status: initialData.status || TASK_STATUSES.TODO,
        dueDate: toInputDate(initialData.dueDate) || '',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        project: initialData.project?._id || initialData.project || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    // Clean empty strings
    if (!data.assignedTo) data.assignedTo = null;
    if (!data.dueDate) data.dueDate = null;

    const success = await onSubmit(data);
    if (success) {
      reset({
        title: '',
        description: '',
        priority: PRIORITIES.MEDIUM,
        status: TASK_STATUSES.TODO,
        dueDate: '',
        assignedTo: '',
        project: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Task Title"
        placeholder="Enter task title"
        error={errors.title?.message}
        {...register('title', {
          required: 'Title is required',
          minLength: { value: 2, message: 'Title must be at least 2 characters' },
        })}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-surface-700">Description</label>
        <textarea
          rows={3}
          placeholder="Describe the task..."
          className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm text-surface-800 placeholder:text-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-surface-300 resize-none"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Project"
          error={errors.project?.message}
          placeholder="Select project"
          options={projects.map((p) => ({ value: p._id, label: p.title }))}
          {...register('project', { required: 'Project is required' })}
        />

        <Select
          label="Assign To"
          placeholder="Unassigned"
          options={members.map((m) => ({ value: m._id, label: m.name }))}
          {...register('assignedTo')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          {...register('priority')}
        />

        <Select
          label="Status"
          options={[
            { value: 'todo', label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
          {...register('status')}
        />
      </div>

      <Input
        label="Due Date"
        type="date"
        {...register('dueDate')}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
