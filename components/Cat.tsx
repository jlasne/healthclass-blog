// The class cat (the app's drawings, 6 hand-drawn frames each, 7 a second). Each pose is a static SVG built by
// scripts/build-cats.mjs into public/cats/, so it animates as a plain image and caches once for every page.
import cats from '@/lib/cats.json';

export type Pose = keyof typeof cats.sizes;

export function Cat({ pose, width = 160, className, alt = '', priority = false }: { pose: Pose; width?: number; className?: string; alt?: string; priority?: boolean }) {
  const s = cats.sizes[pose];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/cats/${pose}.svg`}
      width={width}
      height={Math.round((width * s.h) / s.w)}
      alt={alt}
      className={className ? `cat ${className}` : 'cat'}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      draggable={false}
    />
  );
}
