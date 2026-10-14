"use client";
import { useState } from "react";

// Plain <img> that disappears if the file fails to load, so the gradient behind it shows instead.
export default function SafeImg({ src, alt = "", ...rest }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} {...rest} />;
}
