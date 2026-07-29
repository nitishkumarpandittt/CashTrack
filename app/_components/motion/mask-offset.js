/**
 * How far a masked line starts below its mask, as a percentage of its own
 * height.
 *
 * `.line-mask` carries `padding-bottom: 0.28em` so descenders (g/y/p) are not
 * clipped by its `overflow: hidden`. That padding also enlarges the *visible*
 * area, so a plain 108% offset would leave the top of the text peeking through
 * the padded strip before it animates.
 *
 * Needed offset = 100 * (1 + padding / lineHeight). The tightest leading in
 * use is 0.9 (the hero h1), giving 100 * (1 + 0.28 / 0.9) ≈ 131%. 140% clears
 * that with margin to spare.
 */
export const MASK_OFFSET = 140;
