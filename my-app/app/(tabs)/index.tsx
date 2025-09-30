import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main roleplay flow
    router.replace('/');
  }, []);
  
  return null;
}
