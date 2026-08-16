import { artworkForDay, type Artwork } from "@/lib/product/artworks";
import { cn } from "@/lib/utils";

const VEIL: Record<string, string> = {
  teal: "from-teal/95 via-teal/70 to-ink/30",
  terra: "from-terra/95 via-terra/65 to-ink/30",
  indigo: "from-indigo/95 via-indigo/70 to-ink/30",
  olive: "from-olive/95 via-olive/65 to-ink/30",
};

type Props = {
  day?: number;
  artwork?: Artwork;
  tone?: string;
  className?: string;
  children?: React.ReactNode;
  credit?: boolean;
};

/** Cropped public-domain engraving under a colour veil: mood and texture, never a picture of a scene. */
export function Plate({ day = 1, artwork, tone = "teal", className, children, credit = false }: Props) {
  const art = artwork ?? artworkForDay(day);
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={art.src}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-[1.6] object-cover object-[50%_28%] opacity-90 grayscale contrast-125"
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br mix-blend-multiply",
          VEIL[tone] ?? VEIL["teal"],
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
      <div className="relative">{children}</div>
      {credit ? (
        <p className="eyebrow absolute bottom-2 right-3 text-white/55">
          {art.artist}, {art.year} · public domain
        </p>
      ) : null}
    </div>
  );
}