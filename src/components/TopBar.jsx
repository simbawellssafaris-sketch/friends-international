"use client";
import { usePathname } from "next/navigation";
import { CONFIG } from "@/data/config";
import Icon from "./Icon";

// Contact strip shown above the menu on the home page only.
export default function TopBar() {
  if (usePathname() !== "/") return null;
  return (
    <div className="topbar">
      <div className="wrap">
        <span>
          <Icon name="phone" size={14} /> <a className="c-phone" href={`tel:${CONFIG.phoneTel}`}>{CONFIG.phoneDisplay}</a> &nbsp;·&nbsp;{" "}
          <Icon name="mail" size={14} /> <span className="c-email">{CONFIG.email}</span>
        </span>
        <span className="hide-sm">Safaris · Beaches · Dubai · Europe · Asia</span>
      </div>
    </div>
  );
}
