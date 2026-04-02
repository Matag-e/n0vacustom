import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let m = shuffled.length;
  let t;
  let i;

  // Gerador de número pseudo-randômico simples baseado na seed
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  while (m) {
    i = Math.floor(random(seed + m) * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }

  return shuffled;
}

export function transformImageUrl(
  url: string,
  opts: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'png' | 'jpeg'; resize?: 'contain' | 'cover' | 'fill' } = {}
) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('supabase.co') && u.pathname.includes('/storage/v1/object/')) {
      u.pathname = u.pathname.replace('/storage/v1/object/', '/storage/v1/render/image/');
    }
    if (opts.width) u.searchParams.set('width', String(opts.width));
    if (opts.quality) u.searchParams.set('quality', String(opts.quality));
    if (opts.format) u.searchParams.set('format', opts.format);
    u.searchParams.set('resize', opts.resize || 'contain');
    return u.toString();
  } catch {
    return url;
  }
}

export function buildSrcSet(
  url: string,
  widths: number[],
  quality = 80,
  format: 'webp' | 'avif' | 'png' | 'jpeg' = 'webp'
) {
  if (!url) return '';
  return widths
    .map((w) => `${transformImageUrl(url, { width: w, quality, format })} ${w}w`)
    .join(', ');
}

export function originalImageUrl(url: string) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('supabase.co') && u.pathname.includes('/storage/v1/render/image/')) {
      u.pathname = u.pathname.replace('/storage/v1/render/image/', '/storage/v1/object/');
      // remove transform params to get raw
      u.searchParams.delete('width');
      u.searchParams.delete('quality');
      u.searchParams.delete('format');
      u.searchParams.delete('resize');
    }
    return u.toString();
  } catch {
    return url;
  }
}
