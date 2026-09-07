"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/ui-store";

/**
 * "Bu sayfanın en üstünde koyu bir hero bandı var" bildirimi.
 *
 * Header yüzdüğü için sayfanın üst şeridini kapatıyor. Koyu bir bandın üstünde
 * şeffaf durabilir; açık renkli bir sayfada beyaz yazı beyaz üstüne düşeceği
 * için dolu olması ve içeriğe boşluk bırakılması gerekiyor.
 *
 * Neden bildirim? Header, sayfa içeriğinden ÖNCE yerleşiyor; ekrandan renk
 * ölçmeyi denedim, ölçüm sırasında içerik daha DOM'a girmemiş oluyordu.
 * Bandın kendisi haber verince zamanlama sorunu kalmıyor.
 */
export function useKoyuUstBildir() {
  const setKoyuUst = useUiStore((s) => s.setKoyuUst);
  useEffect(() => {
    setKoyuUst(true);
    return () => setKoyuUst(false);
  }, [setKoyuUst]);
}
