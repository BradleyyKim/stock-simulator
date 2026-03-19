import { useEffect, useState } from 'react';

interface Notification {
  id: number;
  title: string;
  subtitle?: string;
  type: 'round-start' | 'hint' | 'round-end' | 'trade-close';
}

const TYPE_STYLES: Record<Notification['type'], { bg: string; icon: string }> = {
  'round-start': { bg: 'from-green-500 to-emerald-600', icon: '🔔' },
  'hint': { bg: 'from-amber-500 to-orange-600', icon: '💡' },
  'round-end': { bg: 'from-blue-500 to-indigo-600', icon: '📊' },
  'trade-close': { bg: 'from-red-500 to-rose-600', icon: '🚫' },
};

interface GameEventNotificationProps {
  notification: Notification | null;
  onDismiss: () => void;
}

export function GameEventNotification({ notification, onDismiss }: GameEventNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      setExiting(false);

      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          setExiting(false);
          onDismiss();
        }, 300);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!visible || !notification) return null;

  const style = TYPE_STYLES[notification.type];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          setExiting(false);
          onDismiss();
        }, 300);
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className={`relative bg-gradient-to-br ${style.bg} text-white rounded-2xl px-8 py-10 mx-6 text-center shadow-2xl transform transition-all duration-300 ${
          exiting ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <p className="text-5xl mb-4">{style.icon}</p>
        <h2 className="text-2xl font-bold mb-2">{notification.title}</h2>
        {notification.subtitle && (
          <p className="text-white/80 text-base">{notification.subtitle}</p>
        )}
      </div>
    </div>
  );
}

export type { Notification };
