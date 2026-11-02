// The icon family (the app's): a 24 grid, a 1.75 px line, round ends. Plum by default (currentColor).
const P: Record<string, React.ReactNode> = {
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  shield: <><path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M4 7.5l8 5.5 8-5.5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0112 7.2 4.5 4.5 0 0119.5 10c0 5.4-7.5 10-7.5 10z" />,
  book: <><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" /><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5" /></>,
  seal: <><path d="M12 3a6 6 0 016 6c0 3.3-2.7 6-6 6s-6-2.7-6-6a6 6 0 016-6z" /><path d="M9 14l-1.5 7 4.5-2.5 4.5 2.5L15 14" /><path d="M9.5 9l1.8 1.8L14.8 7.5" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></>,
  alert: <><path d="M12 3.5l9 16H3l9-16z" /><path d="M12 10v4.5M12 17.4v.1" /></>,
  timer: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9.5V13l2.5 2M9.5 2.5h5" /></>,
  sparkle: <path d="M12 3c.8 4.6 3.4 7.2 8 8-4.6.8-7.2 3.4-8 8-.8-4.6-3.4-7.2-8-8 4.6-.8 7.2-3.4 8-8z" />,
  chat: <><path d="M4 5.5h16v10.5H9l-5 4V5.5z" /><path d="M8 10h8M8 13h5" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="3" /><path d="M16 10.5l5-3v9l-5-3" /></>,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.2 6.8v.1" /></>,
  link: <><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="3" /><path d="M10.5 18.5h3" /></>,
  apple: <path d="M15.6 3.5c.1 1.3-.4 2.5-1.2 3.4-.8.9-2 1.5-3.2 1.4-.1-1.2.5-2.5 1.2-3.3.8-.9 2.1-1.5 3.2-1.5zM19.4 16.6c-.5 1.2-.8 1.7-1.4 2.7-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.3.9-3.7.9c-1.6 0-2.8-1.6-3.7-3-2.5-3.9-2.8-8.4-1.2-10.8 1.1-1.7 2.9-2.7 4.6-2.7 1.7 0 2.8.9 4.2.9 1.4 0 2.2-.9 4.2-.9 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3.3 8.5z" />,
  play: <path d="M5 3.8v16.4c0 .6.7 1 1.2.7l14-8.2c.5-.3.5-1.1 0-1.4l-14-8.2C5.7 2.8 5 3.2 5 3.8z" />,
  leaf: <><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" /><path d="M5 19l7-7" /></>,
  drop: <path d="M12 3.5s6 6.4 6 10.5a6 6 0 01-12 0c0-4.1 6-10.5 6-10.5z" />,
  users: <><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><path d="M16 5.5a3.5 3.5 0 010 6.5M18 14.5c2 .8 3.5 2.8 3.5 5.5" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

export function Icon({ name, className, title }: { name: keyof typeof P | string; className?: string; title?: string }) {
  const filled = name === 'apple' || name === 'play';
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      focusable="false"
    >
      {P[name]}
    </svg>
  );
}
