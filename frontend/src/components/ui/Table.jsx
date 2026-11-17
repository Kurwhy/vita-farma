import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export function Table({ children, minWidth = '760px', className }) {
  const scrollRef = useRef(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const check = () => {
      setOverflow(element.scrollWidth > element.clientWidth + 1);
    };

    const frame = window.requestAnimationFrame(check);
    const observer = new ResizeObserver(check);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [children]);

  return (
    <div>
      {overflow ? (
        <p className="border-b border-line bg-surface px-4 py-2 text-micro text-muted">
          Geser tabel untuk melihat semua kolom.
        </p>
      ) : null}
      <div
        ref={scrollRef}
        className={cn('w-full overflow-x-auto scroll-thin [contain:paint]', className)}
      >
        <table className="w-full border-collapse text-small" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="border-b border-line bg-surface">{children}</thead>;
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, className, height = 'normal' }) {
  return (
    <tr
      className={cn(
        'border-t border-line align-middle transition-colors first:border-t-0 hover:bg-brand-50/40',
        height === 'compact' ? 'h-11' : 'h-[52px]',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TH({ children, className, align = 'left' }) {
  const alignment =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-3 text-small font-semibold text-muted',
        alignment,
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({ children, className, align = 'left', numeric = false }) {
  const alignment =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td className={cn('px-4 py-2.5 text-ink', alignment, numeric && 'nums', className)}>
      {children}
    </td>
  );
}
