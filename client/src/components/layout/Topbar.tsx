import { LogOut, Menu, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../api/hooks/use-auth';
import { useAuth } from '../../features/auth/useAuth';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();

  const displayName = user?.fullName ?? 'Akiba User';

  function handleLogout() {
    logout.mutate(undefined, {
      // After logging out, return to the public home page. Seeing account
      // details again requires logging back in.
      onSettled: () => navigate('/', { replace: true }),
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        onClick={onOpenSidebar}
        className="lg:hidden"
      >
        <Menu size={18} />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open account menu"
            className="rounded-pill outline-none focus-visible:shadow-ring"
          >
            <Avatar name={displayName} size="sm" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem disabled>
            <Avatar name={displayName} size="sm" />
            <span className="flex flex-col">
              <span className="font-medium">{displayName}</span>
              {user?.email ? <span className="text-xs text-ink-3">{user.email}</span> : null}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User size={16} /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings size={16} /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut size={16} /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
