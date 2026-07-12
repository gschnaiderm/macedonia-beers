interface SectionTitleProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function SectionTitle({ title, subtitle, badge }: SectionTitleProps) {
  return (
    <div className="flex flex-col mb-10">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          {title}
        </h2>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
            {badge}
          </span>
        )}
      </div>
      
      {/* Decorative brand underline */}
      <div className="h-1.5 w-24 bg-red-600 rounded-full mt-4" />
      
      {subtitle && (
        <p className="mt-4 text-lg text-zinc-600 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
