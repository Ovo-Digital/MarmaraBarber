"use client";

import { useKoyuUstBildir } from "@/lib/use-koyu-ust";

/**
 * Sunucu bileşeni olan sayfalarda "üstüm koyu" demenin yolu.
 * Başlık şeffaf durup bandın üzerinde yüzsün diye.
 */
export function KoyuUst() {
  useKoyuUstBildir();
  return null;
}
