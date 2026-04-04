import { Modal, Pressable, Text, TextInput, View, Image } from 'react-native';
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import type { DropdownKey, NavItem, ThemeColors, ThemeMode, User } from '../types/app';

import { styles } from '../styles/appStyles';

const logo = require('../../assets/grabvocab.png');

type HeaderAction = (label: string) => void | Promise<void>;

type HeaderBaseProps = {
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
};

type DesktopHeaderProps = HeaderBaseProps & {
  openDropdown: DropdownKey;
  setOpenDropdown: (value: DropdownKey) => void;
  currentUser: User | null;
  onHome: () => void;
};

type MobileHeaderProps = HeaderBaseProps & {
  drawerOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
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
    <View style={[styles.header, { backgroundColor: colors.headerColor, borderBottomColor: colors.borderColor }]}> 
      <View style={styles.desktopTopBar}>
        <Pressable onPress={onHome} style={styles.logoWrap}>
          <Image source={logo} style={styles.logoImage} />
          <Text style={[styles.logoText, { color: '#3b82f6' }]}>GrabVocab</Text>
        </Pressable>

        <View style={styles.desktopButtonRow}>
          {topButtons.map((label) => (
            <HeaderButton key={label} active={isActive(label)} label={label} colors={colors} onPress={() => void onHeaderButton(label)} />
          ))}

          {currentUser ? (
            <View style={[styles.userPill, { borderColor: colors.borderColor, backgroundColor: colors.chipBg }]}> 
              <FontAwesome name="user-circle" size={14} color={colors.chipText} />
              <Text style={[styles.userPillText, { color: colors.chipText }]}>{currentUser.username || currentUser.email}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={onToggleTheme}
            style={[styles.themeButton, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}
          >
            {theme === 'light' ? <Feather name="moon" size={18} color={colors.primaryText} /> : <Feather name="sun" size={18} color={colors.primaryText} />}
          </Pressable>
        </View>
      </View>

      <View style={styles.desktopNavRow}>
        <View style={styles.navWrap}>
          {navItems.map((item) =>
            'dropdown' in item ? (
              <View key={item.label} style={styles.dropdownContainer}>
                <Pressable onPress={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}>
                  <HeaderButton
                    active={isActive(item.label) || openDropdown === item.label}
                    label={item.label}
                    colors={colors}
                    onPress={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  />
                </Pressable>
                {openDropdown === item.label && (
                  <View style={[styles.dropdownMenu, { borderColor: colors.borderColor, backgroundColor: colors.buttonBg }]}> 
                    {item.dropdown.map((subItem) => (
                      <Pressable
                        key={subItem.value}
                        onPress={() => onDropdownSelect(item.label, subItem.value)}
                        style={({ pressed }) => [styles.dropdownItem, pressed && { backgroundColor: colors.dropdownHover }]}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.primaryText }]}>{subItem.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <HeaderButton key={item.label} active={isActive(item.label)} label={item.label} colors={colors} onPress={() => void onHeaderButton(item.label)} />
            )
          )}
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
              <View style={[styles.suggestionsBox, { backgroundColor: colors.buttonBg, borderColor: colors.borderColor }]}> 
                {suggestions.map((word) => (
                  <Pressable key={word} onPress={() => onSuggestionPress(word)} style={styles.suggestionItem}> 
                    <Text style={[styles.suggestionText, { color: colors.primaryText }]}>{word}</Text>
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
    <View style={[styles.header, { backgroundColor: colors.headerColor, borderBottomColor: colors.borderColor }]}> 
      <View style={styles.mobileTopRow}>
        <View style={styles.mobileBrandRow}>
          <Image source={logo} style={styles.logoImage} />
          <Text style={[styles.mobileLogoText, { color: '#3b82f6' }]}>GrabVocab</Text>
        </View>
        <View style={styles.mobileActions}>
          <Pressable
            style={[styles.mobileThemeButton, { borderColor: colors.borderColor, backgroundColor: colors.backgroundColor || colors.buttonBg }]}
            onPress={onToggleTheme}
          >
            {theme === 'light' ? <Feather name="moon" size={18} color={colors.primaryText} /> : <Feather name="sun" size={18} color={colors.primaryText} />}
          </Pressable>
          <Pressable onPress={onOpen} style={[styles.mobileMenuButton, { borderColor: colors.borderColor, borderWidth: 1, borderRadius: 20 }]}> 
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
          <View style={[styles.suggestionsBox, { backgroundColor: colors.buttonBg, borderColor: colors.borderColor }]}> 
            {suggestions.map((word) => (
              <Pressable key={word} onPress={() => onSuggestionPress(word)} style={styles.suggestionItem}> 
                <Text style={[styles.suggestionText, { color: colors.primaryText }]}>{word}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={[styles.drawerOverlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
          <Pressable style={[styles.drawerPanel, { backgroundColor: colors.headerColor, borderLeftColor: colors.borderColor }]} onPress={() => {}}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.accentColor }]}>Menu</Text>
              <Pressable onPress={onClose} style={styles.drawerCloseButton}>
                <Feather name="x" size={20} color={colors.accentColor} />
              </Pressable>
            </View>

            <View style={styles.drawerSection}>
              {topButtons.map((label) => (
                <MobileDrawerButton key={label} active={isActive(label)} label={label} colors={colors} onPress={() => void onHeaderButton(label)} />
              ))}
            </View>

            <View style={styles.drawerSection}>
              {navItems.map((item) =>
                'dropdown' in item ? (
                  <View key={item.label} style={styles.drawerGroup}>
                    <Text style={[styles.drawerGroupTitle, { color: colors.accentColor }]}>{item.label}</Text>
                    {item.dropdown.map((subItem) => (
                      <Pressable
                        key={subItem.value}
                        onPress={() => onDropdownSelect(item.label, subItem.value)}
                        style={[styles.drawerSubButton, { backgroundColor: colors.backgroundColor || colors.buttonBg }]}
                      >
                        <Text style={[styles.drawerSubButtonText, { color: colors.primaryText }]}>{subItem.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <MobileDrawerButton key={item.label} active={isActive(item.label)} label={item.label} colors={colors} onPress={() => void onHeaderButton(item.label)} />
                )
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function HeaderButton({ label, active, colors, onPress }: { label: string; active?: boolean; colors: ThemeColors; onPress: () => void }) {
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
        <Text style={[styles.headerButtonText, { color: active ? colors.chipText : colors.primaryText }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function MobileDrawerButton({ label, active, colors, onPress }: { label: string; active?: boolean; colors: ThemeColors; onPress: () => void }) {
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
        <Text style={[styles.headerButtonText, { color: active ? colors.chipText : colors.primaryText }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

function HeaderIcon({ label, color }: { label: string; color: string }) {
  if (label === 'Social Media') return <Entypo name="share" size={14} color={color} />;
  if (label === 'Login / Signup' || label === 'Logout') return <FontAwesome name="user-circle" size={14} color={color} />;
  if (label === 'About Us') return <AntDesign name="info-circle" size={14} color={color} />;
  if (label === 'Dictionary A-Z') return <MaterialCommunityIcons name="book-open-variant" size={14} color={color} />;
  if (label === 'Quiz') return <MaterialCommunityIcons name="clipboard-text-outline" size={14} color={color} />;
  if (label === 'Grades') return <MaterialIcons name="grade" size={14} color={color} />;
  if (label === 'Exam') return <MaterialCommunityIcons name="bookmark-multiple-outline" size={14} color={color} />;
  if (label === 'Subject') return <FontAwesome5 name="book-reader" size={14} color={color} />;
  return null;
}
