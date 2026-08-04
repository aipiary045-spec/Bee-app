"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Download, Printer, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHiveQuickLogUrl } from "@/lib/hive-qr";
import { env } from "@/lib/env";

interface HiveQrCardProps {
  hiveId: string;
  hiveName: string;
  /** Compact dialog layout vs full card on hive detail */
  variant?: "card" | "inline";
}

export function HiveQrCard({
  hiveId,
  hiveName,
  variant = "card",
}: HiveQrCardProps) {
  const reactId = useId().replace(/:/g, "");
  const canvasId = `hive-qr-${reactId}`;
  const [origin, setOrigin] = useState("");
  const yardUrl = env.appUrl();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = useMemo(
    () => getHiveQuickLogUrl(hiveId, origin || undefined),
    [hiveId, origin]
  );

  const ready = Boolean(url && (yardUrl || origin));

  function downloadPng() {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${hiveName.replace(/[^\w\-]+/g, "-").toLowerCase()}-quick-log-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function printQr() {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=480,height=640");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${hiveName} — Quick Log QR</title>
    <style>
      @page { margin: 0.6in; }
      body {
        font-family: Georgia, "Times New Roman", serif;
        text-align: center;
        color: #2a241f;
        padding: 24px;
      }
      h1 { font-size: 22px; margin: 0 0 6px; }
      p { font-size: 12px; color: #5a4d40; margin: 0 0 18px; }
      img { width: 280px; height: 280px; }
      .url { margin-top: 16px; font-size: 11px; word-break: break-all; color: #6b5c4c; }
    </style>
  </head>
  <body>
    <h1>${hiveName}</h1>
    <p>Scan to open Quick Log for this hive</p>
    <img src="${dataUrl}" alt="QR code for ${hiveName}" />
    <p class="url">${url}</p>
    <script>window.onload = function () { window.print(); };</script>
  </body>
</html>`);
    printWindow.document.close();
  }

  const content = (
    <>
      <div className="mb-3 flex justify-center">
        <Badge variant={yardUrl ? "success" : "muted"}>
          {yardUrl ? "Yard URL (LAN)" : "This device only"}
        </Badge>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl border border-wax-300/60 bg-white p-3 shadow-sm">
          {ready ? (
            <QRCodeCanvas
              id={canvasId}
              value={url}
              size={180}
              level="M"
              includeMargin
              bgColor="#ffffff"
              fgColor="#2a241f"
            />
          ) : (
            <div className="flex h-[180px] w-[180px] items-center justify-center text-xs text-hive-500">
              Generating…
            </div>
          )}
        </div>
        <p className="max-w-xs text-center text-xs leading-relaxed text-hive-500 break-all">
          {url || "Preparing Quick Log link…"}
        </p>
        {yardUrl && (
          <p className="max-w-xs text-center text-[11px] text-hive-500">
            Phones on your Wi‑Fi can open this link while the app is running.
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={downloadPng} disabled={!ready}>
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={printQr} disabled={!ready}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </>
  );

  if (variant === "inline") {
    return <div>{content}</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-4 w-4 text-honey-700" />
          Field QR code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-hive-600">
          Print and attach this to the hive. Scanning opens Quick Log for{" "}
          <span className="font-medium text-hive-800">{hiveName}</span>.
        </p>
        {content}
      </CardContent>
    </Card>
  );
}
