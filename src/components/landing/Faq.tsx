import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "What is Plainly?",
    a: "A daily Bible reading app. Each day you get a short passage, a plain-English explanation, and the key word from the original Hebrew or Greek.",
  },
  {
    q: "How is my plan built?",
    a: "From your quiz answers — your tradition, how much time you have, what you're going through and what you want to understand.",
  },
  {
    q: "Which translation do you use?",
    a: "You choose. Plainly works alongside the translation you already read, and shows the original wording when it matters.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel during the trial in two taps and you won't be charged.",
  },
];

export function Faq() {
  return (
    <section className="bg-parchment py-14">
      <div className="mx-auto w-full max-w-[560px] px-5">
        <h2 className="text-center text-[26px] text-ink">FAQ</h2>
        <p className="mx-auto mt-2 max-w-[400px] text-center text-[14px] text-muted-foreground">
          Answers to the questions people ask before starting
        </p>
        <Accordion type="single" collapsible className="mt-7 space-y-3">
          {ITEMS.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-5 shadow-s1"
            >
              <AccordionTrigger className="py-4 text-left text-[15px] font-medium text-ink hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[14px] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}