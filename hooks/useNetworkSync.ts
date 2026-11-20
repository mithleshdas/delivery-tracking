import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { useDeliveryStore } from '@/store/deliveryStore';

/**
 * When connectivity returns, flush offline mutations and refresh.
 */
export function useNetworkSync() {
  const flushPending = useDeliveryStore((state) => state.flushPending);
  const fetchAll = useDeliveryStore((state) => state.fetchAll);
  const pendingCount = useDeliveryStore((state) => state.pendingMutations.length);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      if (online && pendingCount > 0) {
        void (async () => {
          await flushPending();
          await fetchAll({ silent: true });
        })();
      }
    });

    return unsubscribe;
  }, [fetchAll, flushPending, pendingCount]);
}
