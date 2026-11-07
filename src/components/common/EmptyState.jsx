import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ illustration, title, description, action }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-14 text-center sm:px-12">
      <div className="mb-6 flex w-full max-w-[280px] items-center justify-center">{illustration}</div>
      <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action?.to && (
        <Link
          to={action.to}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
      {action?.onClick && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}