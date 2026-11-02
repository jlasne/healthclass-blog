// The curved bar: the logo's smile, the hammock, the line under a title.
export function Smile({ center = false }: { center?: boolean }) {
  return (
    <svg className={center ? 'smile smile--c' : 'smile'} viewBox="0 0 92 16" aria-hidden="true" focusable="false">
      <path d="M3 3C26 15 66 15 89 3" />
    </svg>
  );
}
