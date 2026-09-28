import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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

const SCROLL_EDGE = 8;
const ARROW_WIDTH = 44;

function fadeColor(hex: string, alpha: number) {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw;
  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const filtersRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const contentWidth = useRef(0);
  const viewportWidth = useRef(0);
  const chipLayouts = useRef<Partial<Record<AlertFilter, { x: number; width: number }>>>({});
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

  const syncScrollEdges = () => {
    const maxOffset = contentWidth.current - viewportWidth.current;
    const overflows = maxOffset > SCROLL_EDGE;
    setCanScrollLeft(overflows && scrollX.current > SCROLL_EDGE);
    setCanScrollRight(overflows && scrollX.current < maxOffset - SCROLL_EDGE);
  };

  const onFiltersScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = event.nativeEvent.contentOffset.x;
    syncScrollEdges();
  };

  const onFiltersLayout = (event: LayoutChangeEvent) => {
    viewportWidth.current = event.nativeEvent.layout.width;
    syncScrollEdges();
  };

  const onFiltersContentSizeChange = (width: number) => {
    contentWidth.current = width;
    syncScrollEdges();
  };

  const scrollFiltersBy = (direction: -1 | 1) => {
    const maxOffset = Math.max(0, contentWidth.current - viewportWidth.current);
    if (maxOffset <= SCROLL_EDGE || viewportWidth.current <= 0) return;
    const distance = Math.max(120, viewportWidth.current * 0.75);
    const next = Math.min(maxOffset, Math.max(0, scrollX.current + direction * distance));
    filtersRef.current?.scrollTo({ x: next, animated: true });
  };

  useEffect(() => {
    const chip = chipLayouts.current[filter];
    const viewport = viewportWidth.current;
    if (!chip || viewport <= 0) return;
    const maxOffset = Math.max(0, contentWidth.current - viewport);
    const inset = ARROW_WIDTH;
    let next = scrollX.current;
    if (chip.x < scrollX.current + inset) {
      next = chip.x - inset;
    } else if (chip.x + chip.width > scrollX.current + viewport - inset) {
      next = chip.x + chip.width - viewport + inset;
    } else {
      return;
    }
    next = Math.min(maxOffset, Math.max(0, next));
    if (Math.abs(next - scrollX.current) < 1) return;
    filtersRef.current?.scrollTo({ x: next, animated: true });
  }, [filter]);

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
        <View style={styles.filtersFrame}>
          <ScrollView
            ref={filtersRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            scrollEventThrottle={16}
            onScroll={onFiltersScroll}
            onLayout={onFiltersLayout}
            onContentSizeChange={onFiltersContentSizeChange}
            onScrollEndDrag={onFiltersScroll}
            onMomentumScrollEnd={onFiltersScroll}
            contentContainerStyle={[styles.filtersContent, { backgroundColor: colors.surface }]}>
            {chips.map((item) => {
              const selected = filter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout;
                    chipLayouts.current[item.id] = { x, width };
                  }}
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
          {canScrollLeft ? (
            <View style={[styles.edge, styles.edgeLeft]} pointerEvents="box-none">
              <LinearGradient
                pointerEvents="none"
                colors={[colors.surface, colors.surface, fadeColor(colors.surface, 0)]}
                locations={[0, 0.42, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.edgeFade}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Scroll categories left"
                onPress={() => scrollFiltersBy(-1)}
                style={({ pressed }) => [styles.arrowHit, pressed && styles.pressed]}>
                <IconSymbol name="chevron.left" size={16} color={colors.textOnCardSecondary} />
              </Pressable>
            </View>
          ) : null}
          {canScrollRight ? (
            <View style={[styles.edge, styles.edgeRight]} pointerEvents="box-none">
              <LinearGradient
                pointerEvents="none"
                colors={[fadeColor(colors.surface, 0), colors.surface, colors.surface]}
                locations={[0, 0.58, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.edgeFade}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Scroll categories right"
                onPress={() => scrollFiltersBy(1)}
                style={({ pressed }) => [styles.arrowHit, pressed && styles.pressed]}>
                <IconSymbol name="chevron.right" size={16} color={colors.textOnCardSecondary} />
              </Pressable>
            </View>
          ) : null}
        </View>
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
  filtersFrame: {
    position: 'relative',
  },
  filtersScroll: {
    flexGrow: 0,
  },
  edge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: ARROW_WIDTH,
    justifyContent: 'center',
    zIndex: 2,
  },
  edgeLeft: {
    left: 0,
    alignItems: 'flex-start',
  },
  edgeRight: {
    right: 0,
    alignItems: 'flex-end',
  },
  edgeFade: {
    ...StyleSheet.absoluteFillObject,
  },
  arrowHit: {
    width: ARROW_WIDTH,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
