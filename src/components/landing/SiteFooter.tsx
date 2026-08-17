import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-ink px-5 py-12 text-background">
      <div className="mx-auto w-full max-w-[560px]">
        <p className="font-serif text-[22px] tracking-tight">BibleRoutine</p>
        <p className="mt-3 max-w-[420px] text-[14px] leading-relaxed opacity-70">
          Seven minutes a day. A daily Bible reading routine built around your tradition, your pace
          and your questions.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] opacity-70">
          <Link to="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link to="/terms" className="underline underline-offset-4">
            Terms of Use
          </Link>
          <Link to="/refund" className="underline underline-offset-4">
            Refunds
          </Link>
          <Link to="/contact" className="underline underline-offset-4">
            Contact
          </Link>
          <a href="mailto:hello@bibleroutine.app" className="underline underline-offset-4">
            hello@bibleroutine.app
          </a>
        </div>
        <p className="mt-8 text-[12px] opacity-50">
          Scripture quoted from the public-domain WEB, KJV and ASV translations.
        </p>
        <p className="mt-2 text-[12px] opacity-50">2026 © BibleRoutine. All rights reserved.</p>
      </div>
    </footer>
  );
}
