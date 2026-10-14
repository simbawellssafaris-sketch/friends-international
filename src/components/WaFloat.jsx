import { CONFIG } from "@/data/config";
import Icon from "./Icon";

export default function WaFloat({ text = "Hello Friends International, I would like to enquire about a trip." }) {
  return (
    <a
      className="wa-float"
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      href={`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`}
    >
      <Icon name="message-circle" size={20} /> <span>Chat with us</span>
    </a>
  );
}
