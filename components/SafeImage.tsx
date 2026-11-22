'use client';

import { useState } from 'react';
import { MonitorCheck } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallbackTitle?: string;
}

export default function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  priority = false,
  fallbackTitle,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full min-h-[160px] flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0B1F3A] to-[#132C4E] text-white/90 p-6 text-center"
      >
        <MonitorCheck className="w-8 h-8 text-[#F2B705]" aria-hidden="true" />
        <span className="text-sm font-medium text-white/90 max-w-xs">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
