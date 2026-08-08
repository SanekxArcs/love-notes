import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const pageWidths = {
  default: "max-w-3xl",
  medium: "max-w-4xl",
  wide: "max-w-5xl",
} as const;

type PageContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: keyof typeof pageWidths;
};

export function PageContainer({
  size = "default",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col px-4 pt-4 pb-28 sm:px-6 md:pb-8 lg:px-8",
        pageWidths[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
