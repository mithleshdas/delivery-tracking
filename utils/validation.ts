import type {
  DeliveryFormErrors,
  DeliveryFormValues,
  DeliveryStatus,
} from '@/types/delivery';

const ID_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const VALID_STATUSES: DeliveryStatus[] = [
  'Pending',
  'In Transit',
  'Delivered',
  'Cancelled',
];

export function validateDeliveryForm(
  values: DeliveryFormValues,
  options?: { existingIds?: string[]; isEdit?: boolean }
): DeliveryFormErrors {
  const errors: DeliveryFormErrors = {};
  const id = values.id.trim();
  const customer = values.customer.trim();
  const driver = values.driver.trim();
  const date = values.date.trim();
  const status = values.status;

  if (!id) {
    errors.id = 'Delivery ID is required';
  } else if (!ID_PATTERN.test(id)) {
    errors.id = 'Use 3–20 letters, numbers, - or _';
  } else if (
    !options?.isEdit &&
    options?.existingIds?.some((existing) => existing.toLowerCase() === id.toLowerCase())
  ) {
    errors.id = 'This Delivery ID already exists';
  }

  if (!customer) {
    errors.customer = 'Customer is required';
  }

  if (!driver) {
    errors.driver = 'Driver is required';
  }

  if (!date) {
    errors.date = 'Delivery date is required';
  } else if (!DATE_PATTERN.test(date)) {
    errors.date = 'Use YYYY-MM-DD format';
  } else {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      errors.date = 'Enter a valid date';
    }
  }

  if (!status) {
    errors.status = 'Status is required';
  } else if (!VALID_STATUSES.includes(status as DeliveryStatus)) {
    errors.status = 'Select a valid status';
  }

  if (values.notes.length > 250) {
    errors.notes = 'Notes must be 250 characters or less';
  }

  return errors;
}

export function hasFormErrors(errors: DeliveryFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
