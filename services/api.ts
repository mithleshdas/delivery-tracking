import { API_BASE_URL } from '@/constants/config';
import type {
  Customer,
  Delivery,
  Driver,
  StatusOption,
} from '@/types/delivery';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDeliveries: () => request<Delivery[]>('/deliveries'),

  getDelivery: (id: string) =>
    request<Delivery>(`/deliveries/${encodeURIComponent(id)}`),

  createDelivery: (payload: Delivery) =>
    request<Delivery>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateDelivery: (id: string, payload: Delivery) =>
    request<Delivery>(`/deliveries/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteDelivery: (id: string) =>
    request<void>(`/deliveries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getCustomers: () => request<Customer[]>('/customers'),
  getDrivers: () => request<Driver[]>('/drivers'),
  getStatuses: () => request<StatusOption[]>('/statuses'),
};
