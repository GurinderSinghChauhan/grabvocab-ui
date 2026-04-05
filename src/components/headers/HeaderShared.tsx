import { Pressable, Text, View } from 'react-native';
import {
  AntDesign,
  Entypo,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import type { ThemeColors } from '../../types/app';
import { styles } from '../../styles/appStyles';

export type HeaderAction = (label: string) => void | Promise<void>;

export function HeaderButton({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active?: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.headerButton,
        {
          backgroundColor: active ? colors.chipBg : colors.backgroundColor || colors.buttonBg,
          borderColor: active ? colors.chipText : colors.borderColor,
        },
      ]}
    >
      <View style={styles.headerButtonInner}>
        <HeaderIcon label={label} color={active ? colors.chipText : colors.primaryText} />
        <Text
          style={[
            styles.headerButtonText,
            { color: active ? colors.chipText : colors.primaryText },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function MobileDrawerButton({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active?: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.mobileDrawerButton,
        {
          backgroundColor: active ? colors.chipBg : colors.backgroundColor || colors.buttonBg,
          borderColor: active ? colors.chipText : colors.borderColor,
        },
      ]}
    >
      <View style={styles.headerButtonInner}>
        <HeaderIcon label={label} color={active ? colors.chipText : colors.primaryText} />
        <Text
          style={[
            styles.headerButtonText,
            { color: active ? colors.chipText : colors.primaryText },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function HeaderIcon({ label, color }: { label: string; color: string }) {
  if (label === 'Social Media') return <Entypo name="share" size={14} color={color} />;
  if (label === 'Login / Signup' || label === 'Logout')
    return <FontAwesome name="user-circle" size={14} color={color} />;
  if (label === 'About Us') return <AntDesign name="info-circle" size={14} color={color} />;
  if (label === 'Dictionary A-Z')
    return <MaterialCommunityIcons name="book-open-variant" size={14} color={color} />;
  if (label === 'Quiz')
    return <MaterialCommunityIcons name="clipboard-text-outline" size={14} color={color} />;
  if (label === 'Grades') return <MaterialIcons name="grade" size={14} color={color} />;
  if (label === 'Exam')
    return <MaterialCommunityIcons name="bookmark-multiple-outline" size={14} color={color} />;
  if (label === 'Subject') return <FontAwesome5 name="book-reader" size={14} color={color} />;
  return null;
}
