import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { LogOut, ShieldCheck, Pencil, UserCog, Lock, ShieldHalf, Info, HeartPulse } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { NAV_ITEMS, ROLE_META } from '@/lib/constants';
import useProfile from '@/hooks/useProfile';
import useUnreadNotifications from '@/hooks/useUnreadNotifications';
import useUnreadInbox from '@/hooks/useUnreadInbox';
import AvatarArt from '@/components/auth/AvatarArt';
import LogoutDialog from '@/components/layout/LogoutDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ACCOUNT_LINKS = [
  { tab: 'profile', label: 'Edit profile', icon: UserCog },
  { tab: 'health', label: 'Account health', icon: HeartPulse },
  { tab: 'security', label: 'Security', icon: Lock },
  { tab: 'privacy', label: 'Privacy', icon: ShieldHalf },
  { tab: 'about', label: 'About your account', icon: Info },
];

export default function NavBar() {
  const { user, profile, role } = useProfile();
  const unread = useUnreadNotifications();
  const unreadInbox = useUnreadInbox();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const reduce = useReducedMotion();
  const listRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [indicator, setIndicator] = useState({ x: 0, width: 0, visible: false });

  // History stays visible for visitors (its page explains that it needs a sign-in).
  // Edit Labs is only offered to signed-in lab staff; other role-restricted pages
  // follow the role that can actually open them.
  const items = NAV_ITEMS.filter((item) => {
    if (item.access === 'staff') return role === 'instructor' || role === 'lab_assistant';
    if (item.access === 'signed-in') return Boolean(user);
    if (item.access === 'instructor') return role === 'instructor';
    return true;
  });

  const isItemActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(`${to}/`);
  const activeTo = items.find((item) => isItemActive(item.to))?.to;

  // Measure the active tab so the underline can glide between tabs.
  useLayoutEffect(() => {
    const measure = () => {
      const node = activeTo ? itemRefs.current.get(activeTo) : null;
      if (!node) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }
      setIndicator({ x: node.offsetLeft, width: node.offsetWidth, visible: true });
    };

    measure();
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [activeTo, items.length, unread, unreadInbox]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="LabTrack Pro home" className="shrink-0">
          <Logo compact />
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open account options"
                  title="Account options"
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 py-1 pl-1 pr-2 text-left transition-colors hover:bg-secondary/70"
                >
                  <span className="relative shrink-0">
                    <AvatarArt
                      role={role || 'student'}
                      id={profile?.avatar_id || 'st-1'}
                      className="h-8 w-8 rounded-full"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground"
                    >
                      <Pencil className="h-2 w-2" />
                    </span>
                  </span>
                    <span className="hidden max-w-[9rem] truncate text-xs font-medium sm:inline">
                      {profile?.full_name || user.full_name || 'Signed in'}
                    </span>
                    {role && (
                      <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {ROLE_META[role]?.label || role}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Signed in as
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-foreground">
                      {profile?.full_name || user.full_name || 'Your account'}
                    </span>
                    <span className="block truncate">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ACCOUNT_LINKS.map((link) => (
                    <DropdownMenuItem key={link.tab} onSelect={() => navigate(`/account?tab=${link.tab}`)}>
                      <link.icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      {link.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setConfirmLogout(true)}>
                    <LogOut className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/signin">
                <ShieldCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Sign in
              </Link>
            </Button>
          )}
        </div>
      </div>

      <nav
        aria-label="Pages"
        className="border-t border-border/50 bg-gradient-to-r from-primary/[0.07] via-transparent to-brand-gold/[0.07]"
      >
        <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6">
          <ul ref={listRef} className="no-scrollbar relative flex items-stretch gap-0.5 overflow-x-auto">
            {items.map((item) => (
              <li
                key={item.to}
                ref={(node) => {
                  if (node) itemRefs.current.set(item.to, node);
                  else itemRefs.current.delete(item.to);
                }}
                className="shrink-0"
              >
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative block whitespace-nowrap px-3 py-2.5 text-[12.5px] font-medium tracking-[0.01em] transition-colors sm:text-[13px] ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-teal via-brand-mint to-brand-gold bg-clip-text font-semibold text-transparent'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {(() => {
                        const count = item.key === 'notifications' ? unread : item.key === 'inbox' ? unreadInbox : 0;
                        if (!count) return null;
                        const noun = item.key === 'inbox' ? 'unread message' : 'unread notification';
                        return (
                          <span
                            className="ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground"
                            aria-label={`${count} ${noun}${count === 1 ? '' : 's'}`}
                          >
                            {count > 99 ? '99+' : count}
                          </span>
                        );
                      })()}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-2 bottom-1 h-px origin-left bg-primary/70 transition-transform duration-300 ease-out ${
                          isActive ? 'scale-x-0' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            <li
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-0"
              style={{
                width: indicator.width,
                opacity: indicator.visible ? 1 : 0,
                transform: `translateX(${indicator.x}px)`,
                transition: reduce
                  ? 'transform 180ms ease, width 180ms ease, opacity 180ms ease'
                  : 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1), width 520ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease',
              }}
            >
              <span
                aria-hidden="true"
                className="nav-flow-line absolute inset-x-1 bottom-0 h-[2.5px] rounded-full"
              />
            </li>
          </ul>
        </div>
      </nav>

      <LogoutDialog open={confirmLogout} onOpenChange={setConfirmLogout} />
    </header>
  );
}