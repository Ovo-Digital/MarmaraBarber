"use client";

import { useEffect, useState } from "react";

/**
 * Masaüstü hover menü — yalnızca geniş ekran + gerçek fare imleci.
 * Mobilde/tablette her zaman false; ghost-click ve hover kapanma sorunlarını önler.
 */
export function useDesktopHoverMenu(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return enabled;
}
