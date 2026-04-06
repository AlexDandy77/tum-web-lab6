import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../context/useStore';
import type { Toast as ToastType } from '../../context/useStore';

const icons = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

const colors = {
  success: { bg: '#22c55e', text: '#fff' },
  error: { bg: '#ef4444', text: '#fff' },
  info: { bg: 'var(--primary)', text: '#fff' },
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { bg, text } = colors[toast.type];
  return (
    <div
      className={toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: bg,
        color: text,
        padding: '12px 16px',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        fontSize: 14,
        fontWeight: 500,
        minWidth: 220,
        maxWidth: 340,
      }}
    >
      {icons[toast.type]}
      {toast.message}
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();
  if (!toasts.length) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 2000,
      }}
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  );
}
