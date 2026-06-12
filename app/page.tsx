/**
 * Public caller page — /
 *
 * Wave 1: renders the idle state with mock data.
 * Wave 2: replace this with a client component that imports CallerPage
 *         and drives it from useConversation (ElevenLabs) and useState.
 *
 * Prop interface: see components/caller/CallerPage.tsx → CallerPageProps
 */

import { CallerPage } from "@/components/caller/CallerPage";

export default function Home() {
  return (
    <CallerPage
      callState="idle"
      speakerMode="listening"
      // Wave 2 wires these callbacks:
      // onStartCall, onEndCall, onReset
    />
  );
}
