// expo/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="hub"
      screenOptions={{
        headerShown: false,
        // 下部の標準タブバーを完全に非表示にする
        tabBarStyle: { display: 'none' }, 
      }}
    />
  );
}
