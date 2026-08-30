import { CLIENT_STATUS } from '../constants';

export function validateClientStatusUpdate(data: any): { isValid: boolean; errors?: Record<string, string>; value?: { status: 'active' | 'suspended' | 'inactive' } } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Request body must be an object' } };
  }

  const validStatuses = Object.values(CLIENT_STATUS) as string[];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: { status: data.status },
  };
}
