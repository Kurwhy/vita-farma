import { useEffect } from 'react';

export function usePageMeta(title) {
  useEffect(() => {
    document.title = title ? `${title} | Vitafarma` : 'Vitafarma';
  }, [title]);
}
