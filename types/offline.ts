import type { Delivery } from '@/types/delivery';

export type PendingMutation =
  | { id: string; type: 'create'; payload: Delivery }
  | { id: string; type: 'update'; deliveryId: string; payload: Delivery }
  | { id: string; type: 'delete'; deliveryId: string };
