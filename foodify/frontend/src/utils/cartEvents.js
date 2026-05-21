/** Dispatch when `foodify_cart` localStorage changes so navbar badge updates across tabs. */
export function notifyCartChanged() {
  window.dispatchEvent(new Event("foodify_cart_changed"));
}
