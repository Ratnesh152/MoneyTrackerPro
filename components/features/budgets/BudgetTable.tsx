'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { deleteBudgetAction } from '@/app/(dashboard)/budgets/actions';
import { BudgetWithUtilization } from '@/types/budget.types';
import { Category } from '@/types/category.types';
import { BudgetForm } from './BudgetForm';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BudgetTableProps {
  budgets: BudgetWithUtilization[];
  categories: Category[];
}

export function BudgetTable({ budgets, categories }: BudgetTableProps) {
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetWithUtilization | null>(null);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetWithUtilization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!budgetToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteBudgetAction(budgetToDelete.systemId, budgetToDelete.etag);
      
      if (result.success) {
        toast.success('Budget deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete budget');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setBudgetToDelete(null);
    }
  };

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No budgets found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You haven&apos;t set up any budgets for this month. Create one to start tracking your spending limits.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="w-[200px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((budget) => {
              const util = budget.utilizationPercentage;
              let statusColor = 'bg-green-500';
              if (util >= 100) statusColor = 'bg-red-500';
              else if (util >= 80) statusColor = 'bg-amber-500';

              const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(amount);
              };

              return (
                <TableRow key={budget.systemId}>
                  <TableCell className="font-medium">
                    {budget.categoryName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(budget.budgetAmount)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(budget.spentAmount)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${budget.remainingAmount < 0 ? 'text-red-500' : ''}`}>
                    {formatCurrency(budget.remainingAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{util}%</span>
                        {util >= 100 && <span className="text-red-500 font-medium">Over budget</span>}
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${statusColor}`} 
                          style={{ width: `${Math.min(util, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'h-8 w-8 p-0' })}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setBudgetToEdit(budget)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                          onClick={() => setBudgetToDelete(budget)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={(open) => !open && setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget for 
              <strong> {budgetToDelete?.categoryName}</strong>. 
              (This will NOT delete any transactions, only the budget limit).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Budget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Budget Dialog */}
      <Dialog open={!!budgetToEdit} onOpenChange={(open) => !open && setBudgetToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {budgetToEdit && (
            <BudgetForm 
              initialData={budgetToEdit} 
              categories={categories}
              onSuccess={() => setBudgetToEdit(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
