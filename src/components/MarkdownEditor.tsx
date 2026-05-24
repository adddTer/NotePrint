import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Undo, Redo, Save, X } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

export function MarkdownEditor({ value, onChange, onSave, readOnly }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Custom History for undo/redo
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Search/Replace state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  
  // Save feedback state
  const [savedVisible, setSavedVisible] = useState(false);

  // Update history internally when value from outside changes significantly
  // (e.g. initial load or changing sheets)
  useEffect(() => {
    if (value !== history[historyIndex]) {
      setHistory([value]);
      setHistoryIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // intentionally only run when external value prop changes to something far off

  const pushHistory = (newValue: string) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newValue];
    // limit history size
    if (newHistory.length > 50) newHistory.shift(); 
    else setHistoryIndex(newHistory.length - 1);
    
    setHistory(newHistory);
    onChange(newValue);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    pushHistory(e.target.value);
  };

  const handleSave = () => {
    if (onSave) onSave();
    setSavedVisible(true);
    setTimeout(() => setSavedVisible(false), 2000);
  };

  const insertFormatting = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || (suffix ? '' : '文本')) + suffix;

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    pushHistory(updatedText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : (suffix ? 0 : 2));
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleFind = () => {
    if (!searchQuery) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Very simple find - selects the first occurrence after current cursor
    const startPos = textarea.selectionEnd || 0;
    const text = textarea.value;
    let idx = text.indexOf(searchQuery, startPos);
    if (idx === -1) {
      // wrap around
      idx = text.indexOf(searchQuery, 0);
    }
    if (idx !== -1) {
      textarea.focus();
      textarea.setSelectionRange(idx, idx + searchQuery.length);
    }
  };

  const handleReplace = () => {
    if (!searchQuery) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end && textarea.value.substring(start, end) === searchQuery) {
      const text = textarea.value;
      const updatedText = text.substring(0, start) + replaceQuery + text.substring(end);
      pushHistory(updatedText);
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + replaceQuery.length);
      }, 50);
    } else {
      handleFind();
    }
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const text = textareaRef.current?.value || history[historyIndex];
    if (text.includes(searchQuery)) {
      const updatedText = text.split(searchQuery).join(replaceQuery);
      pushHistory(updatedText);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    const el = textareaRef.current;
    if (el) {
      el.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (el) el.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 select-none">
        <button type="button" onClick={handleUndo} disabled={historyIndex === 0} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded disabled:opacity-30" title="撤销 (Ctrl+Z)"><Undo className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded disabled:opacity-30" title="重做 (Ctrl+Y)"><Redo className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => setShowSearch(!showSearch)} className={`p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded ${showSearch ? 'bg-stone-200 dark:bg-stone-700' : ''}`} title="查找/替换 (Ctrl+F)"><Search className="w-3.5 h-3.5" /></button>

        <span className="w-px h-3 bg-stone-300 mx-1"></span>
        
        <button type="button" onClick={() => insertFormatting('**', '**')} className="w-6 h-6 flex items-center justify-center font-bold text-[11px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded" title="加粗">B</button>
        <button type="button" onClick={() => insertFormatting('*', '*')} className="w-6 h-6 flex items-center justify-center italic text-[11px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded" title="斜体">I</button>
        <button type="button" onClick={() => insertFormatting('~~', '~~')} className="w-6 h-6 flex items-center justify-center line-through text-[11px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded" title="删除线">S</button>
        
        <span className="w-px h-3 bg-stone-300 mx-1"></span>
        
        <button type="button" onClick={() => insertFormatting('# ', '')} className="font-bold text-[11px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded px-1.5 h-6" title="一级标题">H1</button>
        <button type="button" onClick={() => insertFormatting('## ', '')} className="font-bold text-[11px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded px-1.5 h-6" title="二级标题">H2</button>
        <button type="button" onClick={() => insertFormatting('- ', '')} className="text-[11px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded px-1.5 h-6" title="无序列表">• 列表</button>
        
        <span className="w-px h-3 bg-stone-300 mx-1"></span>
        <button type="button" onClick={() => insertFormatting('$$ ', ' $$')} className="text-[11px] font-mono text-indigo-700 hover:bg-stone-200 dark:hover:bg-stone-700 rounded px-1.5 h-6" title="独立公式">$$ 公式</button>
        <button type="button" onClick={() => insertFormatting('$$ \\ce{ A \\xlongequal{\\Delta} B } $$', '')} className="text-[11px] font-mono text-blue-700 hover:bg-stone-200 dark:hover:bg-stone-700 rounded px-1.5 h-6" title="化学方程式 (自动排版)">化学方程式</button>
        
        <span className="w-px h-3 bg-stone-300 mx-1"></span>
        <button type="button" onClick={() => insertFormatting('\\n| 列名1 | 列名2 |\\n| --- | --- |\\n| 内容A | 内容B |\\n', '')} className="text-[11px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded px-1.5 h-6" title="插入表格">表格</button>

      </div>

      {showSearch && (
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 text-xs">
          <input 
            type="text" 
            placeholder="查找内容..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFind()}
            className="px-2 py-1 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 outline-none focus:border-emerald-500 w-full sm:w-auto"
          />
          <button onClick={handleFind} className="px-2 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 rounded whitespace-nowrap">查找下一个</button>
          
          <div className="w-full sm:w-px h-px sm:h-4 bg-stone-300 dark:bg-stone-600"></div>

          <input 
            type="text" 
            placeholder="替换为..." 
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="px-2 py-1 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 outline-none focus:border-emerald-500 w-full sm:w-auto"
          />
          <button onClick={handleReplace} className="px-2 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 rounded whitespace-nowrap">替换</button>
          <button onClick={handleReplaceAll} className="px-2 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 rounded whitespace-nowrap">全部替换</button>
          <div className="flex-1"></div>
          <button onClick={() => setShowSearch(false)} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded absolute right-2 top-2 sm:static"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className={`flex-1 w-full bg-transparent border-0 p-4 shadow-inner outline-none resize-none font-mono text-[13px] md:text-sm leading-relaxed scrollbar-thin whitespace-pre-wrap ${readOnly ? 'text-stone-500 cursor-not-allowed' : 'text-stone-800 dark:text-stone-200 focus:ring-inset focus:ring-2 focus:ring-emerald-500/20'}`}
        placeholder="在此输入 Markdown 格式的内容... 支持 LaTeX 公式 及 \ce{} 化学式排版"
        value={history[historyIndex]}
        onChange={handleChange}
        readOnly={readOnly}
      />
    </div>
  );
}
