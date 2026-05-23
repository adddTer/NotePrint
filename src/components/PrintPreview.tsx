import React, { useState } from 'react';
import { KnowledgeSheet } from '../types';
import { SUBJECT_CONFIGS } from '../subjectData';
import { Printer, X, FileText, Settings2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MermaidRenderer } from './MermaidRenderer';
import { wrapChemistryVariables } from '../lib/markdownUtils';

interface PrintPreviewProps {
  sheet: KnowledgeSheet;
  onClose: () => void;
}

export function PrintPreview({ sheet, onClose }: PrintPreviewProps) {
  const [columns, setColumns] = useState<'single'|'double'>('single');
  const [fontSize, setFontSize] = useState<'normal'|'large'>('normal');
  const [showTitle, setShowTitle] = useState(true);
  const [showPageIndicator, setShowPageIndicator] = useState(true);

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 dark:bg-stone-900 flex flex-col md:flex-row print:!static print:!bg-transparent print:!block">
      
      {/* 顶部控制栏 (移动端) / 左侧控制栏 (PC端) */}
      <div className="w-full md:w-72 bg-white dark:bg-stone-950 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 p-4 shrink-0 flex flex-col print:hidden shadow-sm z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-600" />
            打印设置
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 布局方式
            </label>
            <div className="flex gap-2">
              <button onClick={() => setColumns('single')} className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${columns === 'single' ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}>单栏</button>
              <button onClick={() => setColumns('double')} className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${columns === 'double' ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}>双栏</button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> 字体大小
            </label>
            <div className="flex gap-2">
              <button onClick={() => setFontSize('normal')} className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${fontSize === 'normal' ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}>常规</button>
              <button onClick={() => setFontSize('large')} className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${fontSize === 'large' ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}>大号</button>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> 显示设置
            </label>
            <div className="flex flex-col gap-2 text-sm text-stone-700 dark:text-stone-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showTitle} 
                  onChange={e => setShowTitle(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                显示标题与描述
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showPageIndicator} 
                  onChange={e => setShowPageIndicator(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                显示辅助页脚与页码
              </label>
            </div>
          </div>
        </div>

        <button onClick={triggerPrint} className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-2xs">
          <Printer className="w-5 h-5" /> 开始打印
        </button>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 overflow-y-auto w-full flex justify-center p-4 md:p-8 shrink-0 print:!p-0 print:!block print:!overflow-visible text-black">
        <div className="w-[210mm] min-h-[297mm] bg-white border border-stone-200 shadow-md p-[15mm] shrink-0 print:!w-auto print:!border-none print:!shadow-none print:!m-0 print:!p-[10mm] relative pb-16 print:pb-0">
          
          {showTitle && (
            <div className="border-b-2 border-stone-800 pb-4 mb-6 text-center">
              <span className="inline-block px-3 py-1 bg-stone-100 text-stone-800 rounded-full text-xs font-bold mb-2">
                {(SUBJECT_CONFIGS[sheet.subject] || SUBJECT_CONFIGS.chemistry).name}
              </span>
              <h1 className="text-3xl font-black text-stone-900 tracking-tight">{sheet.title}</h1>
              {sheet.description && <p className="text-stone-500 text-sm mt-2">{sheet.description}</p>}
            </div>
          )}

          <div className={`markdown-body prose prose-stone max-w-none text-stone-900 print-md ${fontSize === 'normal' ? 'prose-sm' : 'prose-base'} ${columns === 'double' ? 'md:columns-2 print:columns-2 gap-8' : ''}`}>
            <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  pre({ node, children, ...props }: any) {
                    const isMermaid = node?.children?.[0]?.properties?.className?.includes('language-mermaid');
                    if (isMermaid) {
                      return <div className="not-prose">{children}</div>;
                    }
                    return <pre {...props}>{children}</pre>;
                  },
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline && match && match[1] === 'mermaid') {
                      return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />;
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
              {wrapChemistryVariables(sheet.content) || '*无内容*'}
            </Markdown>
          </div>
          
          {showPageIndicator && (
            <div className="absolute bottom-4 right-8 text-xs text-stone-400 print:fixed print:bottom-[5mm] print:right-[10mm] print:text-[10px] print:text-black">
              {sheet.title} · {new Date().toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
