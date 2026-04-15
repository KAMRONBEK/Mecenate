/** Second tap within this window counts as double-tap (post/comment body on detail). */
export const DOUBLE_TAP_WINDOW_MS = 350;

/**
 * Feed card: delay before navigating to post so two quick taps can be treated as
 * double-tap like without pushing the detail route twice. Same value is used for
 * the double-tap interval on the main pressable.
 */
export const FEED_CARD_OPEN_DELAY_MS = 280;
