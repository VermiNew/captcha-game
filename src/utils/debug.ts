// Utility to check debug mode across the app
export const isDebugMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  // prefer an explicit global flag set by the app
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyWin = window as any;
  if (anyWin.__VIBE_DEBUG__ === true) return true;

  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('debug');
  } catch (e) {
    return false;
  }
};

export default isDebugMode;
