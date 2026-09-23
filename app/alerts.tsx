import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert as RNAlert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AlertRow } from '@/components/wyre/alert-row';
import { useAppTheme } from '@/context/theme-context';
import { useNotificationInbox } from '@/hooks/use-notification-inbox';
import {
  filterAlerts,
  groupAlertsByDate,
  parseAlertCategory,
  type AlertFilter,
  type AlertSection,
  type WyreAlert,
} from '@/lib/alerts';
import { openNotificationById } from '@/lib/notification-routing';
import {
  fetchNotificationCatalog,
  parseNotificationId,
  type NotificationCategoryCatalogItem,
} from '@/lib/notifications-api';

type ListItem =
  | { type: 'header'; key: string; title: string }
  | { type: 'alert'; key: string; alert: WyreAlert; isLast: boolean };

function flattenSections(sections: AlertSection[]): ListItem[] {
  return sections.flatMap((section) => [
    { type: 'header' as const, key: `header-${section.title}`, title: section.title },
    ...section.data.map((alert, index) => ({
      type: 'alert' as const,
      key: alert.id,
      alert,
      isLast: index === section.data.length - 1,
    })),
  ]);
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const {
    alerts,
    unreadCount,
    loading,
    refreshing,
    refresh,
    onMarkRead,
    onMarkAllRead,
  } = useNotificationInbox();
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [categories, setCategories] = useState<NotificationCategoryCatalogItem[]>([]);
  const items = useMemo(
    () => flattenSections(groupAlertsByDate(filterAlerts(alerts, filter))),
    [alerts, filter],
  );
  const chips = useMemo(() => {
    const base: { id: AlertFilter; label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'unread', label: unreadCount ? `Unread (${unreadCount})` : 'Unread' },
    ];
    return [
      ...base,
      ...categories.map((item) => ({
        id: parseAlertCategory(item.code) as AlertFilter,
        label: item.label,
      })),
    ];
  }, [categories, unreadCount]);

  useEffect(() => {
    fetchNotificationCatalog()
      .then((catalog) => setCategories(catalog.categories))
      .catch(() => setCategories([]));
  }, []);

  const openAlert = (alert: WyreAlert) => {
    const serverId = alert.serverId ?? parseNotificationId(alert.id);
    if (serverId != null) {
      openNotificationById(serverId);
      return;
    }
    if (!alert.read) onMarkRead(alert.id).catch(() => undefined);
    RNAlert.alert(alert.title, `${alert.body}\n\n${alert.branchName}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.pageBg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            hitSlop={8}>
            <IconSymbol name="chevron.left" size={26} color={colors.textOnPage} />
          </Pressable>
          <View>
            <Text style={[styles.title, { color: colors.textOnPage }]}>Notifications</Text>
            <Text style={[styles.subtitle, { color: colors.textOnPageMuted }]}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up'}
            </Text>
          </View>
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={() => onMarkAllRead().catch(() => undefined)} hitSlop={8}>
            <Text style={[styles.markAll, { color: colors.accent }]}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filtersBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={[styles.filtersContent, { backgroundColor: colors.surface }]}>
          {chips.map((item) => {
            const selected = filter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setFilter(item.id)}
                style={[
                  styles.filter,
                  selected && { backgroundColor: colors.surfaceMuted },
                ]}>
                <Text
                  style={[
                    styles.filterText,
                    { color: selected ? colors.textOnCard : colors.textOnCardSecondary },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          style={styles.listWrap}
          data={items}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refresh().catch(() => undefined)}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 24 },
            items.length === 0 && styles.emptyList,
          ]}
          renderItem={({ item }) =>
            item.type === 'header' ? (
              <Text style={[styles.sectionTitle, { color: colors.textOnPageMuted }]}>
                {item.title}
              </Text>
            ) : (
              <View
                style={[
                  styles.alertCard,
                  { backgroundColor: colors.surface },
                  item.isLast && styles.alertCardLast,
                ]}>
                <AlertRow alert={item.alert} onPress={openAlert} isLast={item.isLast} />
              </View>
            )
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                <IconSymbol name="bell" size={30} color={colors.textOnPageMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textOnPage }]}>
                {filter === 'unread'
                  ? 'No unread notifications'
                  : filter === 'all'
                    ? 'No notifications yet'
                    : `No ${filter.replaceAll('_', ' ')} notifications`}
              </Text>
              <Text style={[styles.emptyBody, { color: colors.textOnPageMuted }]}>
                Alerts about your energy system will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  back: { width: 34, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  title: { fontSize: 25, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { marginTop: 1, fontSize: 12 },
  markAll: { fontSize: 12, fontWeight: '700' },
  filtersBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: 14,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
  },
  filterText: { textAlign: 'center', fontSize: 12, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listWrap: { flex: 1 },
  list: { paddingTop: 10, flexGrow: 1 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 7,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertCard: { marginHorizontal: 16, overflow: 'hidden' },
  alertCardLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14, marginBottom: 4 },
  empty: { alignItems: 'center', paddingHorizontal: 32, gap: 7 },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyBody: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  pressed: { opacity: 0.65 },
});
