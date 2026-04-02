import type { EventConfig } from "@/lib/cubing/events";

export function EventIcon({
  event,
  size = 20,
  className = "",
}: {
  event: EventConfig;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`cubing-icon ${event.iconClass} ${className}`}
      style={{ fontSize: size }}
    />
  );
}
