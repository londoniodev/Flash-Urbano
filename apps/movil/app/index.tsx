import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />;
  }

  if (user) {
    return <Redirect href="/(tabs)/scanner" />;
  }

  return <Redirect href="/auth/login" />;
}
