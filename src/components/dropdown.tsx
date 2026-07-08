"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export interface DropdownOption {
  label: string;
  href: string;
  dotColorClass?: string;
}

interface DropdownProps {
  title: string;
  options: DropdownOption[];
  titleColor?: string;
  hoverColor?: string;
  dropdownBgColor?: string;
}

export function Dropdown({
  title,
  options,
  titleColor = "text-zinc-600",
  hoverColor = "hover:text-red-600",
  dropdownBgColor = "bg-white",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="relative inline-block text-left"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex w-full items-center justify-center gap-1 transition-colors font-semibold ${titleColor} ${hoverColor}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {title}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-auto sm:right-0 top-full pt-2 w-48 z-50">
          <div
            className={`origin-top-left sm:origin-top-right rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none ${dropdownBgColor}`}
            role="menu"
          >
            <div className="py-1" role="none">
              {options.map((option, index) => (
                <Link
                  key={index}
                  href={option.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${titleColor} ${hoverColor}`}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  {option.dotColorClass && (
                    <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${option.dotColorClass}`} aria-hidden="true" />
                  )}
                  <span>{option.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
