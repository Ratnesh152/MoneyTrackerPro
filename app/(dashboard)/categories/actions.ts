'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { categorySchema } from '@/schemas/category.schema';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  BCCategoryCreateDTO,
  BCCategoryUpdateDTO,
} from '@/services/business-central/category.service';

/**
 * Server Action to create a new category
 */
export async function createCategoryAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: No active session' };
    }

    const rawData = {
      code: formData.get('code'),
      name: formData.get('name'),
      transactionType: formData.get('transactionType'),
      isActive: formData.get('isActive') === 'true',
      displayOrder: parseInt(formData.get('displayOrder') as string, 10) || 0,
      colorCode: formData.get('colorCode'),
      iconName: formData.get('iconName'),
    };

    const validatedData = categorySchema.safeParse(rawData);
    if (!validatedData.success) {
      return {
        success: false,
        error: 'Validation failed: ' + validatedData.error.issues.map(i => i.message).join(', '),
      };
    }

    const dto: BCCategoryCreateDTO = {
      ownerEntraObjectId: session.user.id,
      code: validatedData.data.code,
      name: validatedData.data.name,
      transactionType: validatedData.data.transactionType,
      isActive: validatedData.data.isActive,
      displayOrder: validatedData.data.displayOrder,
      colorCode: validatedData.data.colorCode,
      iconName: validatedData.data.iconName,
    };

    await createCategory(dto);
    
    revalidatePath('/categories');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || 'Failed to create category' };
  }
}

/**
 * Server Action to update an existing category
 */
export async function updateCategoryAction(
  systemId: string,
  etag: string,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: No active session' };
    }

    const rawData = {
      code: formData.get('code'),
      name: formData.get('name'),
      transactionType: formData.get('transactionType'),
      isActive: formData.get('isActive') === 'true',
      displayOrder: parseInt(formData.get('displayOrder') as string, 10) || 0,
      colorCode: formData.get('colorCode'),
      iconName: formData.get('iconName'),
    };

    const validatedData = categorySchema.safeParse(rawData);
    if (!validatedData.success) {
      return {
        success: false,
        error: 'Validation failed: ' + validatedData.error.issues.map(i => i.message).join(', '),
      };
    }

    const dto: BCCategoryUpdateDTO = {
      code: validatedData.data.code,
      name: validatedData.data.name,
      transactionType: validatedData.data.transactionType,
      isActive: validatedData.data.isActive,
      displayOrder: validatedData.data.displayOrder,
      colorCode: validatedData.data.colorCode,
      iconName: validatedData.data.iconName,
    };

    await updateCategory(systemId, session.user.id, dto, etag);
    
    revalidatePath('/categories');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || 'Failed to update category' };
  }
}

/**
 * Server Action to delete a category
 */
export async function deleteCategoryAction(systemId: string, etag: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: No active session' };
    }

    await deleteCategory(systemId, session.user.id, etag);
    
    revalidatePath('/categories');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || 'Failed to delete category' };
  }
}
