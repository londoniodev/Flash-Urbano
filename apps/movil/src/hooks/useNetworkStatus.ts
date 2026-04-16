import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NetworkState } from '../types';

export function useNetworkStatus(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    isConnected: false,
    type: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      setState({
        isConnected: !!(netState.isConnected && netState.isInternetReachable !== false),
        type: netState.type,
      });
    });

    return unsubscribe;
  }, []);

  return state;
}
