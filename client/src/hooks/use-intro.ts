import { useEffect, useState } from "react";

const played = new Set<string>();

/**
 * True only the first time a screen mounts in this session. Data reveals (count-ups, growing bars)
 * play once; coming back to the page later shows the numbers straight away.
 */
export function useIntro(id: string): boolean {
  const [first] = useState(() => !played.has(id));
  useEffect(() => {
    played.add(id);
  }, [id]);
  return first;
}
