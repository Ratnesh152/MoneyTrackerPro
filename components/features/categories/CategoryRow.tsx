'use client';

import { MoreHorizontal } from 'lucide-react';
import { Category } from '@/types/category.types';
import * as icons from 'lucide-react';

import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  // Extract Lucide icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (icons as any)[category.iconName] || icons.HelpCircle;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ backgroundColor: `${category.colorCode}20`, color: category.colorCode }}
          >
            <IconComponent className="h-4 w-4" />
          </div>
          <div>
            <div>{category.name}</div>
            <div className="text-xs text-muted-foreground">{category.code}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={category.transactionType === 'Income' ? 'default' : 'secondary'}>
          {category.transactionType}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={category.isActive ? 'outline' : 'destructive'}>
          {category.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">{category.displayOrder}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground ml-auto">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(category)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
