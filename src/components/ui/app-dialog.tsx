'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DialogFrameProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  tone?: 'default' | 'destructive';
}

function DialogFrame({
  open,
  title,
  description,
  children,
  onClose,
  tone = 'default',
}: DialogFrameProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Закрыть окно"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 rounded-t-2xl border-b border-primary/20 bg-primary/10 p-5">
          <div className="flex gap-3">
            <div
              className={cn(
                'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
                tone === 'destructive'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-primary/40 bg-primary/20 text-foreground'
              )}
            >
              {tone === 'destructive' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <DialogFrame
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      tone={destructive ? 'destructive' : 'default'}
    >
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Выполняется...' : confirmLabel}
        </Button>
      </div>
    </DialogFrame>
  );
}

interface PromptDialogProps {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onSubmit: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

export function PromptDialog({
  open,
  title,
  description,
  label,
  placeholder,
  defaultValue = '',
  confirmLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  loading = false,
  onSubmit,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputId = 'app-prompt-dialog-input';

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [defaultValue, open]);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    void onSubmit(trimmedValue);
  };

  return (
    <DialogFrame open={open} title={title} description={description} onClose={onCancel}>
      <div className="space-y-4">
        <label className="block space-y-2" htmlFor={inputId}>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            autoFocus
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !value.trim()}>
            {loading ? 'Сохранение...' : confirmLabel}
          </Button>
        </div>
      </div>
    </DialogFrame>
  );
}

interface MessageDialogProps {
  open: boolean;
  title: string;
  description?: string;
  closeLabel?: string;
  onClose: () => void;
}

export function MessageDialog({
  open,
  title,
  description,
  closeLabel = 'Понятно',
  onClose,
}: MessageDialogProps) {
  return (
    <DialogFrame open={open} title={title} description={description} onClose={onClose}>
      <div className="flex justify-end">
        <Button onClick={onClose}>{closeLabel}</Button>
      </div>
    </DialogFrame>
  );
}
