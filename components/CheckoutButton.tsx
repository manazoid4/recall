'use client';

import { useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';

interface CheckoutButtonProps {
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export default function CheckoutButton({
  label = 'GET LIFETIME ACCESS — £49',
  className = '',
  variant = 'primary',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to create checkout');
      }

      // Redirect to LemonSqueezy checkout
      window.location.href = json.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const baseClasses = variant === 'primary'
    ? 'flex w-full items-center justify-center gap-2 rounded-lg bg-yellow py-3 font-black text-white transition-all hover:-translate-y-0.5 hover:bg-orange disabled:opacity-50'
    : 'flex w-full items-center justify-center gap-2 rounded-lg border border-line py-3 font-bold text-ink transition-colors hover:bg-surface disabled:opacity-50';

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`${baseClasses} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ExternalLink className="h-5 w-5" />
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
