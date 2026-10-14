"use client";
import { useEffect, useRef, useState } from "react";

// Real photos from the package pages: safari, Zanzibar, Dubai, Europe and Asia.
const SLIDES = [
  { src: "/images/kt/2.jpg", label: "Maasai Mara, Kenya" },
  { src: "/images/kt/29.jpg", label: "Balloon safari, Maasai Mara" },
  { src: "/images/kt/48.webp", label: "Zanzibar" },
  { src: "/images/uae/dubai.webp", label: "Dubai" },
  { src: "/images/europe/france.webp", label: "Paris" },
  { src: "/images/asia/china.jpg", label: "China" },
];
const N = SLIDES.length;
const DELAY = 5000; // time each photo stays before sliding to the next

// Slides scroll sideways by themselves and loop forever. The track has one extra copy of the
// first photo at the end so the last-to-first move keeps sliding in the same direction.
export default function HeroCarousel() {
  const [pos, setPos] = useState(0);
  const [anim, setAnim] = useState(true);
  const touchX = useRef(null);
  const posRef = useRef(0);
  posRef.current = pos;

  const next = () => { if (posRef.current >= N) return; setAnim(true); setPos(posRef.current + 1); };
  const prev = () => {
    if (posRef.current === 0) {
      setAnim(false); setPos(N);
      requestAnimationFrame(() => requestAnimationFrame(() => { setAnim(true); setPos(N - 1); }));
    } else { setAnim(true); setPos(posRef.current - 1); }
  };
  const goTo = (n) => { setAnim(true); setPos(n); };

  // automatic scrolling: restarts after every move, including manual ones
  useEffect(() => {
    const t = setTimeout(next, DELAY);
    return () => clearTimeout(t);
  }, [pos]);

  const onEnd = () => { if (pos === N) { setAnim(false); setPos(0); } };
  const current = pos % N;
  const track = [...SLIDES, SLIDES[0]];

  return (
    <div
      className="hero-bg hero-slides"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
      }}
    >
      <div
        className="hero-track"
        style={{ transform: `translateX(-${pos * 100}%)`, transition: anim ? "transform .9s cubic-bezier(.65,0,.35,1)" : "none" }}
        onTransitionEnd={onEnd}
      >
        {track.map((s, n) => (
          <div
            key={n}
            className="hero-slide"
            style={{ backgroundImage: `url('${s.src}')` }}
            role="img"
            aria-label={s.label}
            aria-hidden={n % N !== current}
          />
        ))}
      </div>
      <button className="hero-arrow prev" type="button" aria-label="Previous photo" onClick={prev}>‹</button>
      <button className="hero-arrow next" type="button" aria-label="Next photo" onClick={next}>›</button>
      <div className="hero-dots" role="tablist" aria-label="Choose a photo">
        {SLIDES.map((s, n) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={n === current}
            aria-label={s.label}
            title={s.label}
            className={n === current ? "on" : ""}
            onClick={() => goTo(n)}
          />
        ))}
      </div>
    </div>
  );
}
