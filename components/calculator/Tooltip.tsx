"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { tooltips, type TooltipKey } from "@/constants/tooltips";

type IconVariant = "light" | "dark";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps): React.JSX.Element {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const wrapRef = useRef<HTMLSpanElement>(null);
  const fadeFrameRef = useRef<number>(0);

  const updatePlacement = useCallback(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top;
    setPlacement(top < 140 ? "bottom" : "top");
  }, []);

  const show = useCallback(() => {
    cancelAnimationFrame(fadeFrameRef.current);
    setVisible(false);
    updatePlacement();
    setOpen(true);
    fadeFrameRef.current = requestAnimationFrame(() => {
      fadeFrameRef.current = requestAnimationFrame(() => setVisible(true));
    });
  }, [updatePlacement]);

  const hide = useCallback(() => {
    cancelAnimationFrame(fadeFrameRef.current);
    setOpen(false);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        hide();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={open ? tooltipId : undefined}>{children}</span>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            "pointer-events-none absolute z-[200] max-w-[260px] rounded-lg bg-[var(--color-text-primary)] px-3.5 py-2.5 text-left text-[13px] leading-[1.5] text-white shadow-lg transition-opacity duration-150 ease-out",
            "left-1/2 w-max min-w-[180px] max-w-[260px] -translate-x-1/2",
            placement === "top" ? "bottom-[calc(100%+10px)]" : "top-[calc(100%+10px)]",
            visible ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          {content}
          <span
            className={[
              "absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-x-transparent",
              placement === "top"
                ? "bottom-[-6px] border-t-[6px] border-t-[var(--color-text-primary)]"
                : "top-[-6px] border-b-[6px] border-b-[var(--color-text-primary)]",
            ].join(" ")}
            aria-hidden
          />
        </span>
      ) : null}
    </span>
  );
}

export function LabelWithTooltip({
  children,
  tooltipKey,
  iconVariant = "light",
}: {
  children: ReactNode;
  tooltipKey: TooltipKey;
  iconVariant?: IconVariant;
}): React.JSX.Element {
  const text = tooltips[tooltipKey];
  const iconTone =
    iconVariant === "dark"
      ? "text-[14px] text-white/75 hover:text-white"
      : "text-[14px] text-[var(--color-text-secondary)]";

  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <Tooltip content={text}>
        <span
          className={["inline-flex cursor-help outline-none transition-opacity duration-150", iconTone].join(
            " "
          )}
          tabIndex={0}
        >
          ⓘ
        </span>
      </Tooltip>
    </span>
  );
}

export function InfoTooltipTrigger({
  tooltipKey,
  iconVariant = "light",
  className = "",
}: {
  tooltipKey: TooltipKey;
  iconVariant?: IconVariant;
  className?: string;
}): React.JSX.Element {
  const text = tooltips[tooltipKey];
  const iconTone =
    iconVariant === "dark"
      ? "text-[14px] text-white/75 hover:text-white"
      : "text-[14px] text-[var(--color-text-secondary)]";

  return (
    <Tooltip content={text}>
      <span
        className={["inline-flex cursor-help outline-none transition-opacity duration-150", iconTone, className].join(
          " "
        )}
        tabIndex={0}
      >
        ⓘ
      </span>
    </Tooltip>
  );
}
