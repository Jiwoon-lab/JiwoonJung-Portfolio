import type { PhotoItem, SectionKey } from '../types';

export function ratioOf(key: 'hero' | 'about' | SectionKey | string): number {
  if (key === 'hero') return 300 / 278;
  if (key === 'about') return 2 / 3;
  return 1; // default square for project thumbnails and galleries
}

export function dims(ph: PhotoItem, r: number) {
  const w = ph.w || 3;
  const h = ph.h || 2;
  const z = Math.max(1, Math.min(4, ph.z || 1));
  const wf = z * Math.max(1, (1 / r) * (w / h));
  const hf = z * Math.max(1, r * (h / w));
  const mx = (wf - 1) / 2;
  const my = (hf - 1) / 2;
  const x = Math.max(-mx, Math.min(mx, ph.x || 0));
  const y = Math.max(-my, Math.min(my, ph.y || 0));
  return { wf, hf, mx, my, x, y, z };
}

export function cs(ph: PhotoItem, r: number): React.CSSProperties {
  const d = dims(ph, r);
  return {
    position: 'absolute',
    maxWidth: 'none',
    display: 'block',
    userSelect: 'none',
    width: `${d.wf * 100}%`,
    height: `${d.hf * 100}%`,
    left: `${(0.5 + d.x - d.wf / 2) * 100}%`,
    top: `${(0.5 + d.y - d.hf / 2) * 100}%`,
  } as React.CSSProperties;
}

export function loadFile(file: File): Promise<PhotoItem | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const cw = Math.max(1, Math.round(img.naturalWidth * scale));
        const ch = Math.max(1, Math.round(img.naturalHeight * scale));
        try {
          const canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, cw, ch);
            resolve({
              src: canvas.toDataURL('image/jpeg', 0.84),
              w: cw,
              h: ch,
              z: 1,
              x: 0,
              y: 0,
            });
            return;
          }
        } catch {
          // fallback if canvas throws
        }
        resolve({
          src: reader.result as string,
          w: img.naturalWidth,
          h: img.naturalHeight,
          z: 1,
          x: 0,
          y: 0,
        });
      };
      img.onerror = () => resolve(null);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function loadUrl(url: string): Promise<PhotoItem> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({
        src: url,
        w: img.naturalWidth || 3,
        h: img.naturalHeight || 2,
        z: 1,
        x: 0,
        y: 0,
      });
    };
    img.onerror = () => {
      resolve({
        src: url,
        w: 3,
        h: 2,
        z: 1,
        x: 0,
        y: 0,
      });
    };
    img.src = url;
  });
}

export const pad = (num: number) => (num < 10 ? `0${num}` : `${num}`);
