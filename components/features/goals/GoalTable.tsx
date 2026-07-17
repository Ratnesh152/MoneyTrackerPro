"use client";

import React, { useState } from 'react';
import { SavingsGoal, BCSavingsGoalCreateDTO, BCSavingsGoalUpdateDTO } from '@/types/goal.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react';
import { GoalDialog } from './GoalDialog';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { goalAnalyticsService } from '@/services/goal-analytics.service';
import Link from 'next/link';

interface GoalTableProps {
  goals: SavingsGoal[];
  ownerEntraObjectId: string;
  createAction: (dto: BCSavingsGoalCreateDTO) => Promise<{ success: boolean; error?: string }>;
  updateAction: (systemId: string, dto: BCSavingsGoalUpdateDTO, etag: string) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (systemId: string, etag: string) => Promise<{ success: boolean; error?: string }>;
}

export function GoalTable({
  goals,
  ownerEntraObjectId,
  createAction,
  updateAction,
  deleteAction,
}: GoalTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>(undefined);

  const handleOpenNew = () => {
    setEditingGoal(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDelete = async (goal: SavingsGoal) => {
    if (confirm(`Are you sure you want to delete ${goal.goalName}?`)) {
      const res = await deleteAction(goal.systemId, goal.etag);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Deleted successfully');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge className="bg-blue-500">Active</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500">Completed</Badge>;
      case 'Paused': return <Badge variant="secondary">Paused</Badge>;
      case 'Cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Savings Goals</h2>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Goal Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Target</TableHead>
              <TableHead className="text-right">Saved</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Target Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                  No savings goals found. Set a goal and start saving!
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => {
                const analytics = goalAnalyticsService.calculateAnalytics(goal);
                return (
                  <TableRow key={goal.systemId}>
                    <TableCell className="font-medium">
                      <Link href={`/goals/${goal.systemId}`} className="hover:underline text-primary">
                        {goal.goalName}
                      </Link>
                    </TableCell>
                    <TableCell>{goal.goalType.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                    <TableCell className="text-right font-medium">₹{goal.targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">₹{analytics.currentSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden min-w-[80px]">
                          <div 
                            className={`h-full ${analytics.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                            style={{ width: `${analytics.progressPercentage}%` }} 
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(analytics.progressPercentage)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {goal.targetDate ? format(new Date(goal.targetDate), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(goal.status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/goals/${goal.systemId}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => handleEdit(goal)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(goal)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <GoalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialData={editingGoal}
        ownerEntraObjectId={ownerEntraObjectId}
        createAction={createAction}
        updateAction={updateAction}
      />
    </div>
  );
}
