"use client";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";

type AutosizeTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
  maxRows?: number;
};

// Lightweight autosize textarea focused on responsiveness
export const AutosizeTextarea = forwardRef<HTMLTextAreaElement, AutosizeTextareaProps>(
  ({ className = "", style, minRows = 2, maxRows, onInput, onChange, value, defaultValue, ...rest }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      // Reset height to compute scrollHeight correctly
      el.style.height = "auto";
      const lineHeight = parseInt(window.getComputedStyle(el).lineHeight || "20", 10);
      let newHeight = el.scrollHeight;
      // Respect min/max rows if provided
      if (minRows && lineHeight) newHeight = Math.max(newHeight, minRows * lineHeight + 2);
      if (maxRows && lineHeight) newHeight = Math.min(newHeight, maxRows * lineHeight + 2);
      el.style.height = `${newHeight}px`;
    }, [minRows, maxRows]);

    // Resize on mount and when value changes
    useLayoutEffect(() => {
      resize();
    }, [resize, value]);

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      resize();
      onInput?.(e);
    };

    return (
      <textarea
        ref={innerRef}
        className={`w-full resize-none outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${className}`}
        style={{ overflow: "hidden", ...style }}
        rows={minRows}
        spellCheck={false}
        value={value as any}
        defaultValue={defaultValue as any}
        onInput={handleInput}
        onChange={onChange}
        {...rest}
      />
    );
  }
);

AutosizeTextarea.displayName = "AutosizeTextarea";

export default AutosizeTextarea;


