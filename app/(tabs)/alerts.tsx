import { useMemo, useState } from 'react';
import {
  Alert as RNAlert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertRow } from '@/components/wyre/alert-row';
import { AppHeader } from '@/components/wyre/app-header';
import { UserAvatarButton } from '@/components/wyre/user-avatar-button';
import { WyreColors } from '@/constants/theme';
import {
  countUnreadAlerts,
  DUMMY_ALERTS,
  filterAlerts,
  groupAlertsByDate,
  type AlertFilter,
  type AlertSection,
  type SolarAlert,
} from '@/lib/dummy-alerts';

type ListItem =
  | { type: 'header'; key: string; title: string }
  | { type: 'alert'; key: string; alert: SolarAlert; isFirst: boolean; isLast: boolean };

function flattenSections(sections: AlertSection[]): ListItem[] {
  const items: ListItem[] = [];

  for (const section of sections) {
    items.push({
      type: 'header',
      key: `header-${section.title}`,
      title: section.title,
    });

    section.data.forEach((alert, index) => {
      items.push({
        type: 'alert',
        key: alert.id,
        alert,
        isFirst: index === 0,
        isLast: index === section.data.length - 1,
      });
    });
  }

  return items;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<SolarAlert[]>(DUMMY_ALERTS);
  const [filter, setFilter] = useState<AlertFilter>('all');

  const unreadCount = useMemo(() => countUnreadAlerts(alerts), [alerts]);
  const listItems = useMemo(
    () => flattenSections(groupAlertsByDate(filterAlerts(alerts, filter))),
    [alerts, filter],
  );

  const onPressAlert = (alert: SolarAlert) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === alert.id ? { ...item, read: true } : item)),
    );

    RNAlert.alert(alert.title, `${alert.body}\n\n${alert.branchName}`, [
      { text: 'OK', style: 'cancel' },
    ]);
  };

  const onMarkAllRead = () => {
    setAlerts((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <View style={styles.root}>
      <AppHeader rightAction={<UserAvatarButton />} />

      <View style={styles.toolbar}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.summary}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'No new alerts'}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <Pressable
            onPress={onMarkAllRead}
            style={({ pressed }) => [styles.markAllBtn, pressed && styles.pressed]}
            hitSlop={8}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setFilter('all')}
          style={styles.tab}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === 'all' }}>
          <Text style={[styles.tabLabel, filter === 'all' && styles.tabLabelActive]}>All</Text>
          {filter === 'all' ? <View style={styles.tabUnderline} /> : null}
        </Pressable>
        <Pressable
          onPress={() => setFilter('unread')}
          style={styles.tab}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === 'unread' }}>
          <Text style={[styles.tabLabel, filter === 'unread' && styles.tabLabelActive]}>
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Text>
          {filter === 'unread' ? <View style={styles.tabUnderline} /> : null}
        </Pressable>
      </View>

      <FlatList
        data={listItems}
        keyExtractor={(item) => item.key}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
          listItems.length === 0 && styles.listEmptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
            );
          }

          return (
            <View
              style={[
                styles.sectionCard,
                item.isFirst && styles.sectionCardFirst,
                item.isLast && styles.sectionCardLast,
                item.isLast && styles.sectionCardSpacing,
              ]}>
              <AlertRow
                alert={item.alert}
                onPress={onPressAlert}
                isLast={item.isLast}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'No unread alerts' : 'No alerts'}
            </Text>
            <Text style={styles.emptyBody}>
              {filter === 'unread'
                ? 'You are up to date.'
                : 'New solar alerts will appear here.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WyreColors.pageBg,
  },
  toolbar: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    letterSpacing: -0.4,
  },
  summary: {
    marginTop: 2,
    fontSize: 14,
    color: WyreColors.textSecondary,
  },
  markAllBtn: {
    paddingTop: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: WyreColors.purple,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WyreColors.border,
    backgroundColor: WyreColors.pageBg,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 22,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: WyreColors.textSecondary,
  },
  tabLabelActive: {
    color: WyreColors.textPrimary,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: WyreColors.purple,
    borderRadius: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  listEmptyContent: {
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WyreColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  sectionCardFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sectionCardLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  sectionCardSpacing: {
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});
