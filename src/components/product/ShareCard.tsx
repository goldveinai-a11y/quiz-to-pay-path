import { useRef, useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { text: string; reference: string; translation: string };

const PAPER = "#f6f1e7";
const INK = "#1c1917";
const TERRA = "#b4521f";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A square card the reader can send to someone. Drawn locally, nothing generated. */
export function ShareCard({ text, reference, translation }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shared, setShared] = useState(false);

  const draw = () => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    const size = 1080;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(28,25,23,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, size - 112, size - 112);

    ctx.fillStyle = "rgba(28,25,23,0.55)";
    ctx.font = "600 24px Georgia, serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("PLAINLY", 110, 150);
    ctx.letterSpacing = "0px";

    const body = text.length > 260 ? `${text.slice(0, 257)}…` : text;
    ctx.fillStyle = INK;
    ctx.font = "48px Georgia, serif";
    const lines = wrap(ctx, `“${body}”`, size - 240);
    const lineHeight = 70;
    let y = size / 2 - (lines.length * lineHeight) / 2 + 20;
    for (const line of lines) {
      ctx.fillText(line, 120, y);
      y += lineHeight;
    }

    ctx.fillStyle = TERRA;
    ctx.fillRect(120, y + 26, 64, 3);
    ctx.fillStyle = "rgba(28,25,23,0.6)";
    ctx.font = "28px Georgia, serif";
    ctx.fillText(`${reference} · ${translation}`, 120, y + 86);

    return canvas;
  };

  const share = async () => {
    const canvas = draw();
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], `plainly-${reference.replace(/\s+/g, "-").toLowerCase()}.png`, {
      type: "image/png",
    });
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.canShare?.({ files: [file] }) && nav.share) {
      try {
        await nav.share({ files: [file], text: `${text} — ${reference}` });
        setShared(true);
        return;
      } catch {
        // fall through to download
      }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
    setShared(true);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={share}
      className="h-12 w-full rounded-xl border-border text-sm font-medium"
    >
      {shared ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
      {shared ? "Card saved" : "Share this verse"}
    </Button>
  );
}