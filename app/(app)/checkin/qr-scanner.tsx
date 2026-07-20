"use client";

import { useEffect, useRef } from "react";

export function QrScanner({
  onScan,
  active,
}: {
  onScan: (decodedText: string) => void;
  active: boolean;
}) {
  const containerId = "qr-reader";
  const scannerRef = useRef<import("html5-qrcode").Html5QrcodeScanner | null>(null);
  const hasScanned = useRef(false);

  useEffect(() => {
    if (!active) return;
    hasScanned.current = false;

    let cancelled = false;

    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (cancelled) return;
      const scanner = new Html5QrcodeScanner(
        containerId,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        false
      );
      scanner.render(
        (decodedText) => {
          if (hasScanned.current) return;
          hasScanned.current = true;
          onScan(decodedText);
          scanner.clear().catch(() => {});
        },
        () => {
          // ignore per-frame scan failures
        }
      );
      scannerRef.current = scanner;
    });

    return () => {
      cancelled = true;
      scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [active, onScan]);

  if (!active) return null;

  return <div id={containerId} className="mx-auto w-full max-w-xs" />;
}
