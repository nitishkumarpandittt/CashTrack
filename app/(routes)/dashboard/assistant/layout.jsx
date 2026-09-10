"use client";

import { useParams } from "next/navigation";

import ChatWorkspace from "../_components/chat/ChatWorkspace";

/**
 * The workspace lives in this layout, above the `[[...chat]]` segment, on
 * purpose: a page component is remounted every time its dynamic params
 * change, which meant every new conversation (URL moves from /assistant to
 * /assistant/<id>) threw away the conversation list and the transcript and
 * refetched both behind skeletons. A layout persists across those
 * navigations, so only the `chatId` prop changes.
 *
 * useParams reads the child segment's params from anywhere in the tree.
 */
export default function AssistantLayout({ children }) {
  const params = useParams();
  const raw = Array.isArray(params?.chat) ? params.chat[0] : null;
  const parsed = Number(raw);
  const chatId = raw && Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  return (
    <>
      <ChatWorkspace chatId={chatId} />
      {children}
    </>
  );
}
