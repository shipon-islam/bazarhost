import { Icon } from "@iconify/react";

export default function TopBar() {
  return (
    <div className="bg-ink text-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 text-xs sm:text-sm">
        <p className="truncate">
          Free delivery on orders over{" "}
          <span className="font-semibold text-orange-light">৳2,000</span>
        </p>
        <div className="hidden items-center gap-5 md:flex">
          <a
            href="tel:+8801330401213"
            className="transition-colors hover:text-white"
          >
            <Icon
              icon="famicons:call-outline"
              className="mr-1 inline-block size-4"
            />
            +880 1330401213
          </a>
          <span className="h-3 w-px bg-white/20" aria-hidden />
          <a
            href="mailto:bazarhostbd@gmail.com"
            className="transition-colors hover:text-white"
          >
            <Icon icon="codicon:mail" className="mr-1 inline-block size-5" />
            bazarhostbd@gmail.com
          </a>
        </div>
        <a
          href="#"
          className="shrink-0 font-medium text-white transition-colors hover:text-orange-light"
        >
          Track order
        </a>
      </div>
    </div>
  );
}
