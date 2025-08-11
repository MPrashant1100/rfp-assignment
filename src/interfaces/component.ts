export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface NavBarProps {
  links: NavLink[];
}

export interface Props {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export interface StatusBadgeProps {
  status: string;
  className?: string;
}
