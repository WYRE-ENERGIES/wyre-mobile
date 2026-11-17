import { Alert, Dimensions, type AlertButton } from 'react-native';

/**
 * react-native-web ships Alert.alert as a no-op, which would silently swallow
 * confirmations (log out, remove rule, submit diesel entry) and validation
 * messages. Map it to the browser's alert/confirm dialogs.
 *
 * Only touches `window` when an alert is actually shown, never at import time.
 */
Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
  if (typeof window === 'undefined') return;
  const text = [title, message].filter(Boolean).join('\n\n');
  const list = buttons ?? [];
  const cancel = list.find((b) => b.style === 'cancel');
  const actions = list.filter((b) => b !== cancel);

  if (actions.length === 0) {
    window.alert(text);
    cancel?.onPress?.();
    return;
  }

  if (actions.length === 1 && !cancel) {
    window.alert(text);
    actions[0].onPress?.();
    return;
  }

  // Two-choice dialog: OK runs the primary (last non-cancel) action.
  const primary = actions[actions.length - 1];
  if (window.confirm(text)) {
    primary.onPress?.();
  } else {
    cancel?.onPress?.();
  }
};

/**
 * On desktop the app is shown as a centred phone-sized column (max 480px, see
 * app/+html.tsx). Screens that size artwork/charts from the window width
 * (useWindowDimensions / Dimensions.get) must see the column width, not the
 * full browser width, so clamp the reported window width.
 */
export const PHONE_MAX_WIDTH = 480;

type DimensionsValue = ReturnType<typeof Dimensions.get>;
type ChangeHandler = (dims: { window: DimensionsValue; screen: DimensionsValue }) => void;

const clampWindow = (win: DimensionsValue): DimensionsValue =>
  win && win.width > PHONE_MAX_WIDTH ? { ...win, width: PHONE_MAX_WIDTH } : win;

const originalGet = Dimensions.get.bind(Dimensions);
const originalAdd = Dimensions.addEventListener.bind(Dimensions) as unknown as (
  type: 'change',
  handler: ChangeHandler,
) => { remove: () => void } | undefined;
const originalRemove = (
  Dimensions as unknown as { removeEventListener?: (type: 'change', handler: ChangeHandler) => void }
).removeEventListener?.bind(Dimensions);
const wrappedHandlers = new WeakMap<ChangeHandler, ChangeHandler>();

Dimensions.get = ((dim: 'window' | 'screen') => {
  const value = originalGet(dim);
  return dim === 'window' ? clampWindow(value) : value;
}) as typeof Dimensions.get;

(Dimensions as unknown as { addEventListener: unknown }).addEventListener = (
  type: 'change',
  handler: ChangeHandler,
) => {
  const wrapped: ChangeHandler = (dims) => handler({ ...dims, window: clampWindow(dims.window) });
  wrappedHandlers.set(handler, wrapped);
  const subscription = originalAdd(type, wrapped);
  return {
    remove: () => {
      if (subscription?.remove) subscription.remove();
      else originalRemove?.(type, wrapped);
    },
  };
};

if (originalRemove) {
  (Dimensions as unknown as { removeEventListener: unknown }).removeEventListener = (
    type: 'change',
    handler: ChangeHandler,
  ) => originalRemove(type, wrappedHandlers.get(handler) ?? handler);
}
