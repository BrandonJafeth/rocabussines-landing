import React from 'react';

type LoaderSplitTextProps = {
  text?: string;
  subtitle?: string;
  className?: string;
};

export default function LoaderSplitText({
  text = 'Roca Business',
  subtitle = 'Asesoría y acompañamiento en bienes raíces',
  className = '',
}: LoaderSplitTextProps) {
  const characters = Array.from(text);

  return (
    <div className={`loader-split-wrap ${className}`}>
      <p
        aria-label={text}
        className="loader-split-text font-heading text-light text-4xl sm:text-7xl font-extrabold tracking-[0.08em]"
      >
        {characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            className="loader-split-char"
            style={{ animationDelay: `${0.9 + index * 0.06}s` }}
          >
            {character === ' ' ? '\u00A0' : character}
          </span>
        ))}
      </p>

      <p className="loader-subtitle font-heading text-light/85 text-sm sm:text-base mt-3 tracking-wide">
        {subtitle}
      </p>

      <style>{`
        @keyframes loaderSplitReveal {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .loader-split-text .loader-split-char {
          display: inline-block;
          opacity: 0;
          animation: loaderSplitReveal 0.55s cubic-bezier(0.22, 0.03, 0.26, 1) forwards;
          will-change: transform, opacity;
        }

        .loader-subtitle {
          opacity: 0;
          animation: loaderSplitReveal 0.6s cubic-bezier(0.22, 0.03, 0.26, 1) 1.75s forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .loader-split-text .loader-split-char {
            animation: none;
            opacity: 1;
            transform: none;
            filter: none;
          }

          .loader-subtitle {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
