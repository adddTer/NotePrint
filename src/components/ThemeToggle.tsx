import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-1 border border-stone-200 dark:border-stone-700">
      <button
        title="浅色模式"
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
            : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        title="跟随系统"
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
            : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
        }`}
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        title="深色模式"
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
            : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
