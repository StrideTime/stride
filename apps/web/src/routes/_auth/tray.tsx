import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/tray')({
  component: TrayPage,
});

// `/tray` — the desktop tray window's content (compact layout): idle / live-session / break / review states,
// the ⌥Space capture window, the meeting-join flow. Loaded by the Tauri tray window — NOT a web nav item.
// See docs/product/surfaces.md and the "Tauri Desktop Architecture" section of .cursor/rules/architecture.mdc.
function TrayPage() {
  return <section>Tray — coming soon</section>;
}
