import { ICONS, EMOJI_ICON } from "@/lib/icons";

// Lucide-style inline SVG icon. <Icon name="map-pin" size={16} />
export default function Icon({ name, size = 18 }) {
  return (
    <svg
      className="ic"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || ICONS.sparkles }}
    />
  );
}

// Icon for an emoji stored in the content data (country "known for" cards, resident categories)
export function EmojiIcon({ emoji, size = 26 }) {
  const first = Array.from(String(emoji || "").replace(/️/g, ""))[0];
  return <Icon name={EMOJI_ICON[first] || "sparkles"} size={size} />;
}
