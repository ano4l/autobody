import { Button } from "./button";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-cream-200 px-4 py-3 text-xs text-ink-600">
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 0}
          onClick={() => onChange(Math.max(0, page - 1))}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
