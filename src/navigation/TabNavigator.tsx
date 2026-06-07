import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types/navigation';
import { fontFamily, fontSize, letterSpacing } from '../theme';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/HomeScreen';
import ListagensScreen from '../screens/ListagensScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Iconografia aeroespacial por aba (família única para consistência). */
const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) =>
    <MaterialCommunityIcons name={name} color={color} size={size} />;

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        // O header nativo dá lugar ao Header.tsx renderizado dentro das telas.
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: fontFamily.mono,
          fontSize: fontSize.xs,
          letterSpacing: letterSpacing.wide,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Comando', tabBarIcon: tabIcon('radar') }}
      />
      <Tab.Screen
        name="Listagens"
        component={ListagensScreen}
        options={{ title: 'Rastreio', tabBarIcon: tabIcon('format-list-bulleted') }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{ title: 'Prioritários', tabBarIcon: tabIcon('star') }}
      />
      <Tab.Screen
        name="Configuracoes"
        component={ConfiguracoesScreen}
        options={{ title: 'Sistemas', tabBarIcon: tabIcon('cog') }}
      />
    </Tab.Navigator>
  );
}
