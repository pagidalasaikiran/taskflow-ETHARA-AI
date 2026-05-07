import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { PROJECT_STATUSES } from '../../constants';

export default function ProjectForm({ initialData, onSubmit, onCancel, loading }) {
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
      status: initialData?.status || PROJECT_STATUSES.ACTIVE,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || PROJECT_STATUSES.ACTIVE,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    const success = await onSubmit(data);
    if (success) {
      reset({ title: '', description: '', status: PROJECT_STATUSES.ACTIVE });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Project Title"
        placeholder="Enter project title"
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
          placeholder="Describe the project..."
          className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm text-surface-800 placeholder:text-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-surface-300 resize-none"
          {...register('description')}
        />
      </div>

      {isEdit && (
        <Select
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'archived', label: 'Archived' },
          ]}
          {...register('status')}
        />
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
