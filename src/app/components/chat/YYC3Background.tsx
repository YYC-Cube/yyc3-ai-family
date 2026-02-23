import * as React from 'react';

export function YYC3Background() {
  const [bgImageUrl, setBgImageUrl] = React.useState('');
  const [bgBrightness, setBgBrightness] = React.useState(70);
  const [bgBlurPx, setBgBlurPx] = React.useState(0);

  // Load + apply from localStorage
  const syncFromStorage = React.useCallback(() => {
    try {
      const img = localStorage.getItem('yyc3-bg-image');

      setBgImageUrl(img || '');
      const raw = localStorage.getItem('yyc3-appearance-config');

      if (raw) {
        const cfg = JSON.parse(raw);

        if (typeof cfg.bgBrightness === 'number') setBgBrightness(cfg.bgBrightness);
        if (typeof cfg.bgBlurPx === 'number') setBgBlurPx(cfg.bgBlurPx);
      }
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => {
    syncFromStorage();

    // Listen for cross-tab storage events
    window.addEventListener('storage', syncFromStorage);
    // Listen for same-tab custom event from settings
    window.addEventListener('yyc3-bg-update', syncFromStorage);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('yyc3-bg-update', syncFromStorage);
    };
  }, [syncFromStorage]);

  const hasImage = !!bgImageUrl;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dark gradient base — reduced opacity when custom image is present */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black transition-opacity duration-500"
        style={{ opacity: hasImage ? 0.3 : 0.8 }}
      />

      {/* Custom background image layer — ON TOP of gradient base */}
      {hasImage && (
        <div
          id="yyc3-custom-bg"
          className="absolute inset-0 transition-all duration-500"
          style={{
            backgroundImage: `url(${bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: bgBlurPx > 0 ? `blur(${bgBlurPx}px)` : undefined,
            /* Scale slightly when blurred to avoid white edges from blur */
            transform: bgBlurPx > 0 ? `scale(${1 + bgBlurPx * 0.01})` : undefined,
          }}
        />
      )}
      {/* Brightness overlay — the lower bgBrightness, the darker the overlay */}
      {hasImage && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: 1 - bgBrightness / 100 }}
        />
      )}

      {/* Grid — always visible */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full mix-blend-screen" />
    </div>
  );
}
