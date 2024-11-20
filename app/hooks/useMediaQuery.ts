import { useEffect, useState } from 'react';

export default function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    setMatches(window.matchMedia(query).matches);
  }, [query]);

  return matches;
}
