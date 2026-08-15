import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) => {
  const typeStyles = {
    danger: {
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      actionVariant: "destructive"
    },
    warning: {
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      actionVariant: "default"
    },
    info: {
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      actionVariant: "default"
    },
    primary: {
      iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      actionVariant: "default"
    }
  };

  const style = typeStyles[type] || typeStyles.danger;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md rounded-2xl">
        <AlertDialogHeader>
          <div className={`flex items-center gap-4 mb-4`}>
            <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconColor}`}>
              <AlertTriangle size={24} />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="rounded-xl font-semibold">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={type === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmModal;
