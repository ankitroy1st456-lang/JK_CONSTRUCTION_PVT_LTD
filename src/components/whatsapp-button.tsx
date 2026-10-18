import { Icon } from "@/components/icons";
import { whatsappLink } from "@/lib/site";
import type { Settings } from "@/lib/types";

// Round green button floating in the bottom-right corner of every page
export function WhatsAppButton({ settings }: { settings: Settings }) {
  return (
    <aside aria-label="WhatsApp chat">
      <a className="whatsapp" href={whatsappLink(settings)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)">
        <Icon name="chat" size={28} />
      </a>
    </aside>
  );
}
