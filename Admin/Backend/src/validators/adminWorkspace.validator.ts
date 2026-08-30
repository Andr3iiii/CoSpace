import { WORKSPACE_STATUS } from '../constants';

export function validateWorkspaceCreate(data: any): { isValid: boolean; errors?: Record<string, string>; value?: any } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
    errors.name = 'Workspace name must be at least 3 characters.';
  }

  if (!data.workspace_type_id) {
    errors.workspace_type_id = 'workspace_type_id is required.';
  }

  if (typeof data.capacity !== 'number' || data.capacity <= 0) {
    errors.capacity = 'Capacity must be a positive integer.';
  }

  if (typeof data.hourly_rate !== 'number' || data.hourly_rate < 0) {
    errors.hourly_rate = 'Hourly rate must be a non-negative number.';
  }

  if (typeof data.daily_rate !== 'number' || data.daily_rate < 0) {
    errors.daily_rate = 'Daily rate must be a non-negative number.';
  }

  const validStatuses = Object.values(WORKSPACE_STATUS) as string[];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  const slug = data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    isValid: true,
    value: {
      ...data,
      slug,
      name: data.name.trim(),
      description: data.description || '',
      floor: data.floor || '1st Floor',
      images: Array.isArray(data.images) ? data.images : [],
      is_featured: Boolean(data.is_featured),
    },
  };
}
