import React from 'react';

interface KismetBrandLogoProps {
  size?: number;
  className?: string;
}

/**
 * Original brand mark for KISMET: two interlocking orbit rings around a
 * four-point spark. Deliberately unrelated to any existing dating app mark.
 */
export const KismetBrandLogo: React.FC<KismetBrandLogoProps> = ({
  size = 28,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="kismetGrad" x1="3" y1="3" x2="25" y2="25" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF4D6D" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <ellipse
      cx="14"
      cy="14"
      rx="11"
      ry="5.4"
      transform="rotate(-35 14 14)"
      stroke="url(#kismetGrad)"
      strokeWidth="1.6"
    />
    <ellipse
      cx="14"
      cy="14"
      rx="11"
      ry="5.4"
      transform="rotate(35 14 14)"
      stroke="url(#kismetGrad)"
      strokeWidth="1.6"
      strokeOpacity="0.7"
    />
    <path
      d="M14 7.2L15.5 12.5L20.8 14L15.5 15.5L14 20.8L12.5 15.5L7.2 14L12.5 12.5L14 7.2Z"
      fill="url(#kismetGrad)"
    />
  </svg>
);
