import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCategories } from '@/services/business-central/category.service';
import { AddCategoryButton } from '@/components/features/categories/AddCategoryButton';
import { CategoryTable } from '@/components/features/categories/CategoryTable';
import { CategoryFilters } from '@/components/features/categories/CategoryFilters';
import { CategoryPagination } from '@/components/features/categories/CategoryPagination';

export const metadata: Metadata = {
  title: 'Categories - MoneyTracker Pro',
  description: 'Manage your transaction categories',
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const pageSize = 10;
  
  let categoriesData;
  let error = null;

  try {
    categoriesData = await getCategories(session.user.id, {
      search: resolvedParams.search,
      type: resolvedParams.type,
      isActive: resolvedParams.isActive,
      skip: resolvedParams.skip ? parseInt(resolvedParams.skip, 10) : 0,
      top: pageSize,
      sort: resolvedParams.sort,
    });
  } catch (e) {
    console.error('Failed to load categories:', e);
    error = e;
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        </div>
        <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
          Failed to load categories. Please check your connection to Business Central and ensure your user has the correct permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <div className="flex items-center space-x-2">
          <AddCategoryButton />
        </div>
      </div>

      <CategoryFilters />

      <div className="space-y-4">
        <CategoryTable categories={categoriesData?.value || []} />
        {categoriesData && categoriesData['@odata.count'] !== undefined && categoriesData['@odata.count'] > 0 && (
          <CategoryPagination 
            totalCount={categoriesData['@odata.count']} 
            pageSize={pageSize} 
          />
        )}
      </div>
    </div>
  );
}
