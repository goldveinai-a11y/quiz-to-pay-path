import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { WordNote } from "@/lib/product/types";

type Props = { note: WordNote | null; onClose: () => void };

/** What the word actually says in the language it was written in. */
export function WordSheet({ note, onClose }: Props) {
  return (
    <Sheet open={Boolean(note)} onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border bg-card pb-8">
        {note ? (
          <>
            <SheetHeader className="text-left">
              <p className="eyebrow text-muted-foreground">{note.language} behind “{note.word}”</p>
              <SheetTitle className="font-serif text-3xl font-semibold">{note.original}</SheetTitle>
            </SheetHeader>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{note.transliteration}</p>
            <p className="mt-4 text-[0.95rem] leading-relaxed">{note.meaning}</p>
            {note.alsoIn ? (
              <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                Also in {note.alsoIn}
              </p>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}