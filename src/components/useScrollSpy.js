"use client";
import { useEffect } from "react";

// Highlights the sticky tab for the section being read (the original site's scrollspy).
export function useScrollSpy(linkSelector, sectionSelector) {
  useEffect(() => {
    const links = [...document.querySelectorAll(linkSelector)];
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(
      (es) => es.filter((e) => e.isIntersecting).forEach((e) => {
        const a = map.get(e.target.id);
        if (!a) return;
        links.forEach((x) => x.classList.toggle("on", x === a));
        a.scrollIntoView({ inline: "center", block: "nearest" });
      }),
      { rootMargin: "-140px 0px -65% 0px" },
    );
    document.querySelectorAll(sectionSelector).forEach((s) => { if (s.id) io.observe(s); });
    return () => io.disconnect();
  }, [linkSelector, sectionSelector]);
}
