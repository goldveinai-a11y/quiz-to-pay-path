export function SiteFooter() {
  return (
    <footer className="bg-ink px-5 py-12 text-background">
      <div className="mx-auto w-full max-w-[560px]">
        <p className="font-serif text-[22px] tracking-tight">Plainly</p>
        <p className="mt-3 max-w-[420px] text-[14px] leading-relaxed opacity-70">
          The Bible, plainly. A daily reading plan built around your tradition, your pace and your
          questions.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] opacity-70">
          <a href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </a>
          <a href="/terms" className="underline underline-offset-4">
            Terms of Use
          </a>
          <a href="mailto:hello@plainly.app" className="underline underline-offset-4">
            hello@plainly.app
          </a>
        </div>
        <p className="mt-8 text-[12px] opacity-50">2026 © Plainly. All rights reserved.</p>
      </div>
    </footer>
  );
}