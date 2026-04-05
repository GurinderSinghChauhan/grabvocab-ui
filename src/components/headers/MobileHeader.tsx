import {
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NavItem, ThemeColors, ThemeMode } from '../../types/app';
import { styles } from '../../styles/appStyles';
import { MobileDrawerButton, type HeaderAction } from './HeaderShared';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logo: ImageSourcePropType = require('../../../assets/grabvocab.png');

type MobileHeaderProps = {
  colors: ThemeColors;
  theme: ThemeMode;
  onToggleTheme: () => void;
  query: string;
  setQuery: (value: string) => void;
  suggestions: string[];
  onSuggestionPress: (word: string) => void;
  onSearch: () => void;
  onHeaderButton: HeaderAction;
  onDropdownSelect: (group: 'Subject' | 'Grades' | 'Exam', value: string) => void;
  isActive: (label: string) => boolean;
  topButtons: string[];
  navItems: NavItem[];
  drawerOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function MobileHeader({
  colors,
  navItems,
  drawerOpen,
  onClose,
  onOpen,
  onToggleTheme,
  theme,
  query,
  setQuery,
  suggestions,
  onSuggestionPress,
  onSearch,
  onHeaderButton,
  onDropdownSelect,
  isActive,
  topButtons,
}: MobileHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.headerColor, borderBottomColor: colors.borderColor },
      ]}
    >
      <View style={styles.mobileTopRow}>
        <View style={styles.mobileBrandRow}>
          <Image source={logo} style={styles.logoImage} />
          <Text style={[styles.mobileLogoText, { color: '#3b82f6' }]}>GrabVocab</Text>
        </View>
        <View style={styles.mobileActions}>
          <Pressable
            style={[
              styles.mobileThemeButton,
              {
                borderColor: colors.borderColor,
                backgroundColor: colors.backgroundColor || colors.buttonBg,
              },
            ]}
            onPress={onToggleTheme}
          >
            {theme === 'light' ? (
              <Feather name="moon" size={18} color={colors.primaryText} />
            ) : (
              <Feather name="sun" size={18} color={colors.primaryText} />
            )}
          </Pressable>
          <Pressable
            onPress={onOpen}
            style={[
              styles.mobileMenuButton,
              { borderColor: colors.borderColor, borderWidth: 1, borderRadius: 20 },
            ]}
          >
            <Feather name="menu" size={20} color={colors.primaryText} />
          </Pressable>
        </View>
      </View>

      <View style={styles.mobileSearchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
          placeholder="Search words..."
          placeholderTextColor={colors.secondaryText}
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.backgroundColor || colors.buttonBg,
              color: colors.primaryText,
              borderColor: colors.borderColor,
            },
          ]}
        />
        <Pressable onPress={onSearch} style={styles.searchIcon}>
          <Feather name="search" size={18} color={colors.primaryText} />
        </Pressable>
        {suggestions.length > 0 && (
          <View
            style={[
              styles.suggestionsBox,
              { backgroundColor: colors.buttonBg, borderColor: colors.borderColor },
            ]}
          >
            {suggestions.map((word) => (
              <Pressable
                key={word}
                onPress={() => onSuggestionPress(word)}
                style={styles.suggestionItem}
              >
                <Text style={[styles.suggestionText, { color: colors.primaryText }]}>{word}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable
          style={[styles.drawerOverlay, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        >
          <Pressable
            style={[
              styles.drawerPanel,
              { backgroundColor: colors.headerColor, borderLeftColor: colors.borderColor },
            ]}
            onPress={() => {}}
          >
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.accentColor }]}>Menu</Text>
              <Pressable onPress={onClose} style={styles.drawerCloseButton}>
                <Feather name="x" size={20} color={colors.accentColor} />
              </Pressable>
            </View>

            <View style={styles.drawerSection}>
              {topButtons.map((label) => (
                <MobileDrawerButton
                  key={label}
                  active={isActive(label)}
                  label={label}
                  colors={colors}
                  onPress={() => void onHeaderButton(label)}
                />
              ))}
            </View>

            <View style={styles.drawerSection}>
              {navItems.map((item) => {
                const hasDropdown = 'dropdown' in item && item.dropdown !== undefined;
                const dropdownLabel = hasDropdown ? item.label : null;

                return hasDropdown && item.dropdown ? (
                  <View key={item.label} style={styles.drawerGroup}>
                    <Text style={[styles.drawerGroupTitle, { color: colors.accentColor }]}>
                      {item.label}
                    </Text>
                    {item.dropdown.map((subItem) => (
                      <Pressable
                        key={subItem.value}
                        onPress={() =>
                          onDropdownSelect(
                            dropdownLabel as 'Subject' | 'Grades' | 'Exam',
                            subItem.value
                          )
                        }
                        style={[
                          styles.drawerSubButton,
                          { backgroundColor: colors.backgroundColor || colors.buttonBg },
                        ]}
                      >
                        <Text style={[styles.drawerSubButtonText, { color: colors.primaryText }]}>
                          {subItem.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <MobileDrawerButton
                    key={item.label}
                    active={isActive(item.label)}
                    label={item.label}
                    colors={colors}
                    onPress={() => void onHeaderButton(item.label)}
                  />
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
