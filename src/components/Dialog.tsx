import React from 'react';

export type DialogType = 'alert' | 'confirm' | 'prompt';

export interface DialogOptions {
  type: DialogType;
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface DialogState extends DialogOptions {
  isOpen: boolean;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  inputValue: string;
}

interface DialogProps {
  dialog: DialogState;
  setDialog: React.Dispatch<React.SetStateAction<DialogState>>;
}

export function Dialog({ dialog, setDialog }: DialogProps) {
  if (!dialog.isOpen) return null;

  const handleConfirm = () => {
    dialog.onConfirm(dialog.inputValue);
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    dialog.onCancel();
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        <h2 className="text-lg font-bold text-stone-800 mb-2">{dialog.title}</h2>
        {dialog.message && (
          <p className="text-sm text-stone-600 mb-5 whitespace-pre-wrap leading-relaxed">{dialog.message}</p>
        )}
        
        {dialog.type === 'prompt' && (
          <input
            autoFocus
            type="text"
            className="w-full px-3 py-2 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm mb-5 transition-all text-stone-800"
            value={dialog.inputValue}
            placeholder={dialog.placeholder || ''}
            onChange={(e) => setDialog(prev => ({ ...prev, inputValue: e.target.value }))}
            onKeyDown={handleKeyDown}
          />
        )}

        <div className="flex justify-end gap-3">
          {dialog.type !== 'alert' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {dialog.cancelText || '取消'}
            </button>
          )}
          <button
            onClick={handleConfirm}
            autoFocus={dialog.type !== 'prompt'}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors cursor-pointer"
          >
            {dialog.confirmText || '确定'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useDialog() {
  const [dialog, setDialog] = React.useState<DialogState>({
    isOpen: false,
    type: 'alert',
    title: '',
    inputValue: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showAlert = (title: string, message?: string, confirmText?: string) => {
    return new Promise<void>((resolve) => {
      setDialog({
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmText,
        inputValue: '',
        onConfirm: () => resolve(),
        onCancel: () => resolve(),
      });
    });
  };

  const showConfirm = (title: string, message?: string, confirmText?: string, cancelText?: string) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        inputValue: '',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  const showPrompt = (title: string, message?: string, defaultValue?: string, placeholder?: string, confirmText?: string, cancelText?: string) => {
    return new Promise<string | null>((resolve) => {
      setDialog({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        defaultValue,
        placeholder,
        confirmText,
        cancelText,
        inputValue: defaultValue || '',
        onConfirm: (val) => resolve(val || ''),
        onCancel: () => resolve(null),
      });
    });
  };

  return { DialogComponent: <Dialog dialog={dialog} setDialog={setDialog} />, showAlert, showConfirm, showPrompt };
}
