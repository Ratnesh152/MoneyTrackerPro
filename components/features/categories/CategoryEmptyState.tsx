import { FolderPlus } from 'lucide-react';
import { AddCategoryButton } from './AddCategoryButton';

export function CategoryEmptyState() {
  return (
    <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FolderPlus className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No categories added</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not added any transaction categories. Add one below to start organizing your transactions.
        </p>
        <AddCategoryButton />
      </div>
    </div>
  );
}
