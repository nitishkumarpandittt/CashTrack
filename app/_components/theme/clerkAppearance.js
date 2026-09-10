/**
 * Clerk's widgets render inside our shells but style themselves from their own
 * appearance API, so the palette has to be handed over explicitly.
 *
 * `elements` take classNames, so those can reference the --cash-* tokens and
 * follow the theme for free. `variables` cannot: Clerk parses them to derive
 * shades and alpha steps, which needs literal colours — hence the small map
 * below, kept in step with the two token blocks in globals.css.
 *
 * Clerk injects its own stylesheet at runtime, after Tailwind's, so anything
 * that has to beat a Clerk default of equal specificity is written with
 * Tailwind's `!` prefix. This is Clerk's supported styling path: it targets
 * elements by name rather than by their internal DOM structure, so a Clerk
 * update cannot silently break the layout the way `.cl-*` selectors could.
 */
const PALETTE = {
  light: {
    primary: "#007a74",
    text: "#0f1620",
    textSecondary: "#5c6a72",
    background: "#ffffff",
    inputBackground: "#f4f8f7",
    neutral: "#0f1620",
  },
  dark: {
    primary: "#35bdb0",
    text: "#e6eef2",
    textSecondary: "#93a3ad",
    background: "#121b21",
    inputBackground: "#0b1216",
    neutral: "#e6eef2",
  },
};

// AuthShell supplies the frame, width, padding and elevation, so Clerk's own
// card chrome is stripped. `overflow-visible` matters because the display
// face's negative tracking lets the first glyph overhang its box, which
// Clerk's default `overflow: hidden` would clip.
const BARE_CARD = "!w-full !max-w-none !rounded-none !border-0 !bg-transparent !shadow-none";

/** Appearance for the full-page SignIn / SignUp forms. */
export function authAppearance(isDark) {
  const palette = isDark ? PALETTE.dark : PALETTE.light;

  return {
    layout: {
      socialButtonsVariant: "blockButton",
      socialButtonsPlacement: "top",
      logoPlacement: "none",
    },
    variables: {
      colorPrimary: palette.primary,
      colorText: palette.text,
      colorTextSecondary: palette.textSecondary,
      colorBackground: palette.background,
      colorInputBackground: palette.inputBackground,
      colorInputText: palette.text,
      colorNeutral: palette.neutral,
      borderRadius: "1rem",
      fontFamily: "inherit",
      fontFamilyButtons: "inherit",
    },
    elements: {
      rootBox: "!w-full !overflow-visible",
      cardBox: `${BARE_CARD} !overflow-visible`,
      card: `${BARE_CARD} !m-0 !gap-6 !p-0 !overflow-visible`,
      header: "text-left !overflow-visible",
      headerTitle:
        "font-display !text-3xl !font-extrabold !tracking-[-0.07em] !text-[var(--cash-ink)] !pl-[0.08em] sm:!text-[2.1rem]",
      headerSubtitle: "!text-sm !leading-6 !text-[var(--cash-muted)]",
      socialButtonsBlockButton:
        "!h-12 !rounded-full !border-[var(--cash-line)] !bg-[var(--cash-mist)] !text-[var(--cash-ink)] hover:!bg-[var(--cash-wash)]",
      socialButtonsBlockButtonText: "!font-semibold",
      dividerLine: "!bg-[var(--cash-line)]",
      dividerText: "!text-[var(--cash-muted)]",
      formFieldLabel: "!text-sm !font-semibold !text-[var(--cash-ink)]",
      // 16px on phones stops iOS Safari zooming into the field on focus.
      formFieldInput:
        "!h-12 !rounded-full !border-[var(--cash-line)] !bg-[var(--cash-mist)] !px-4 !text-base !text-[var(--cash-ink)] focus:!border-[var(--cash-teal)] focus:!ring-[var(--cash-teal)] sm:!text-sm",
      formFieldInputShowPasswordButton: "!text-[var(--cash-muted)]",
      otpCodeFieldInput: "!border-[var(--cash-line)] !text-[var(--cash-ink)]",
      formButtonPrimary:
        "!h-12 !rounded-full !bg-[var(--cash-teal-solid)] !text-sm !font-bold !text-white !shadow-[var(--cash-shadow-button)] hover:!bg-[var(--cash-onyx)]",
      footer: "!bg-transparent !bg-none",
      footerAction: "!bg-transparent !bg-none !px-0",
      footerActionText: "!text-[var(--cash-muted)]",
      footerActionLink: "!font-semibold !text-[var(--cash-teal)] hover:!text-[var(--cash-ink)]",
      identityPreview: "!border-[var(--cash-line)] !bg-[var(--cash-mist)]",
      identityPreviewText: "!text-[var(--cash-ink)]",
      identityPreviewEditButton: "!text-[var(--cash-teal)]",
      alternativeMethodsBlockButton:
        "!rounded-full !border-[var(--cash-line)] !text-[var(--cash-ink)] hover:!bg-[var(--cash-wash)]",
      backLink: "!text-[var(--cash-teal)]",
      formResendCodeLink: "!text-[var(--cash-teal)]",
    },
  };
}

/**
 * Shared styling for the avatar menu in the three places it appears. Only
 * classNames here, so the popover follows the theme without any JS.
 */
export const userButtonElements = {
  userButtonPopoverCard:
    "border border-[var(--cash-line)] bg-[var(--cash-paper)] shadow-[var(--cash-shadow-card)]",
  userButtonPopoverActionButton: "hover:bg-[var(--cash-mist)]",
  userButtonPopoverActionButtonText: "text-[var(--cash-ink)]",
  userButtonPopoverActionButtonIcon: "text-[var(--cash-muted)]",
  userButtonPopoverFooter: "border-t border-[var(--cash-line)]",
  userPreviewMainIdentifier: "text-[var(--cash-ink)]",
  userPreviewSecondaryIdentifier: "text-[var(--cash-muted)]",
};
