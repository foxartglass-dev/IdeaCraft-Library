
import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-.868.372-1.66.984-2.226z"
      clipRule="evenodd"
    />
    <path
      d="M.75 9.75A.75.75 0 011.5 9h4.5a.75.75 0 010 1.5H1.5A.75.75 0 01.75 9.75zM1.5 3.75A.75.75 0 00.75 4.5v2.25c0 .414.336.75.75.75h3a.75.75 0 000-1.5H2.25V4.5a.75.75 0 00-.75-.75zM6.75 12A.75.75 0 016 12.75v3.75a.75.75 0 01-1.5 0V12a.75.75 0 01.75-.75h.75z"
    />
  </svg>
);
