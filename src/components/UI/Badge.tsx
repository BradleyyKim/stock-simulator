import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'up' | 'down' | 'neutral' | 'trading' | 'paused' | 'waiting';
  className?: string;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-700',
  up: 'bg-red-50 text-red-600',
  down: 'bg-blue-50 text-blue-600',
  neutral: 'bg-gray-50 text-gray-500',
  trading: 'bg-green-50 text-green-700',
  paused: 'bg-yellow-50 text-yellow-700',
  waiting: 'bg-gray-50 text-gray-500',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}
