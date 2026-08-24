import { useEffect, useState } from "react";
import { StartButton } from "./StartButton";

/**
 * A quiz CTA that follows the reader down the page. It appears once the hero
 * button has scrolled away, so there is always one tap between any section of
 * the landing page and the funnel.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-5 pb-5 pt-3 backdrop-blur transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div className="mx-auto w-full max-w-[560px]">
        <StartButton label="Start the 2-minute quiz" placement="sticky" />
        <p className="mt-2 text-center text-[11.5px] text-faint">
          Free to take · no card required
        </p>
      </div>
    </div>
  );
}
