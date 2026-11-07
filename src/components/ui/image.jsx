import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Content image: a plain <img> with lazy loading and async decoding.
 * fittingType="fill" (default) crops to the box, "fit" contains it.
 */
const Image = React.forwardRef(
  ({ src, alt = "", fittingType = "fill", className, loading = "lazy", decoding = "async", ...props }, ref) => (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={cn(fittingType === "fit" ? "object-contain" : "object-cover", className)}
      {...props}
    />
  )
);
Image.displayName = "Image";

export { Image };
export default Image;
