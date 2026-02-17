'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteAccountProps {
  onDelete?: () => Promise<void>;
}

export function DeleteAccount({ onDelete }: DeleteAccountProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      }
      // Redirect to home after deletion
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
      <p className="text-sm text-red-700 mb-4">
        Deleting your account is permanent and cannot be undone. All your votes,
        payments, and account data will be deleted.
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be
              undone. All your data including votes, payments, and account
              information will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              You will lose access to all your voting history and receipts.
            </p>
          </div>

          <div className="flex gap-3">
            <AlertDialogCancel disabled={isDeleting}>
              Keep Account
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
