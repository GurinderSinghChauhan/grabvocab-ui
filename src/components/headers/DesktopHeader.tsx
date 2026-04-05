import { Image, Pressable, Text, TextInput, View, type ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { DropdownKey, NavItem, ThemeColors, ThemeMode, User } from '../../types/app';
import { styles } from '../../styles/appStyles';
import { HeaderButton, type HeaderAction } from './HeaderShared';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logo: ImageSourcePropType = require('../../../assets/grabvocab.png');

type DesktopHeaderProps = {
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
  openDropdown: DropdownKey;
  setOpenDropdown: (value: DropdownKey) => void;
  currentUser: User | null;
  onHome: () => void;
};

export function DesktopHeader({
  colors,
  navItems,
  openDropdown,
  setOpenDropdown,
  onToggleTheme,
  theme,
  query,
  setQuery,
  suggestions,
  onSuggestionPress,
  onSearch,
  onHeaderButton,
  onDropdownSelect,
  currentUser,
  isActive,
  onHome,
  topButtons,
}: DesktopHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.headerColor, borderBottomColor: colors.borderColor },
      ]}
    >
      <View style={styles.desktopTopBar}>
        <Pressable onPress={onHome} style={styles.logoWrap}>
          <Image source={logo} style={styles.logoImage} />
          <Text style={[styles.logoText, { color: '#3b82f6' }]}>GrabVocab</Text>
        </Pressable>

        <View style={styles.desktopButtonRow}>
          {topButtons.map((label) => (
            <HeaderButton
              key={label}
              active={isActive(label)}
              label={label}
              colors={colors}
              onPress={() => void onHeaderButton(label)}
            />
          ))}

          {currentUser ? (
            <View
              style={[
                styles.userPill,
                { borderColor: colors.borderColor, backgroundColor: colors.chipBg },
              ]}
            >
              <Feather name="user" size={14} color={colors.chipText} />
              <Text style={[styles.userPillText, { color: colors.chipText }]}>
                {currentUser.username || currentUser.email}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={onToggleTheme}
            style={[
              styles.themeButton,
              {
                borderColor: colors.borderColor,
                backgroundColor: colors.backgroundColor || colors.buttonBg,
              },
            ]}
          >
            {theme === 'light' ? (
              <Feather name="moon" size={18} color={colors.primaryText} />
            ) : (
              <Feather name="sun" size={18} color={colors.primaryText} />
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.desktopNavRow}>
        <View style={styles.navWrap}>
          {navItems.map((item) => {
            const hasDropdown = 'dropdown' in item && item.dropdown !== undefined;
            const dropdownLabel = hasDropdown ? item.label : null;

            return hasDropdown ? (
              <View key={item.label} style={styles.dropdownContainer}>
                <Pressable
                  onPress={() =>
                    setOpenDropdown(
                      openDropdown === dropdownLabel ? null : (dropdownLabel as DropdownKey)
                    )
                  }
                >
                  <HeaderButton
                    active={isActive(item.label) || openDropdown === dropdownLabel}
                    label={item.label}
                    colors={colors}
                    onPress={() =>
                      setOpenDropdown(
                        openDropdown === dropdownLabel ? null : (dropdownLabel as DropdownKey)
                      )
                    }
                  />
                </Pressable>
                {openDropdown === dropdownLabel && item.dropdown && (
                  <View
                    style={[
                      styles.dropdownMenu,
                      { borderColor: colors.borderColor, backgroundColor: colors.buttonBg },
                    ]}
                  >
                    {item.dropdown.map((subItem) => (
                      <Pressable
                        key={subItem.value}
                        onPress={() =>
                          onDropdownSelect(
                            dropdownLabel as 'Subject' | 'Grades' | 'Exam',
                            subItem.value
                          )
                        }
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && { backgroundColor: colors.dropdownHover },
                        ]}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.primaryText }]}>
                          {subItem.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <HeaderButton
                key={item.label}
                active={isActive(item.label)}
                label={item.label}
                colors={colors}
                onPress={() => void onHeaderButton(item.label)}
              />
            );
          })}
        </View>

        <View style={styles.searchBlock}>
          <View style={styles.searchFieldWrap}>
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
                    <Text style={[styles.suggestionText, { color: colors.primaryText }]}>
                      {word}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
