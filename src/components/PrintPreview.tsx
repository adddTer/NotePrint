import React, { useState } from 'react';
import { KnowledgeSheet, PrintSettings } from '../types';
import { SUBJECT_CONFIGS } from '../subjectData';
import { 
  Printer, Layout, Type, X, Columns 
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface PrintPreviewProps {
  sheet: KnowledgeSheet;
  onClose: () => void;
}

export function PrintPreview({ sheet, onClose }: PrintPreviewProps) {
  const [settings, setSettings] = useState<PrintSettings>({
    pageSize: 'A4',
    layout: 'double', 
    fontSize: 'md',
    showImportance: true,
    showTags: true,
    showWatermark: true,
    showNotes: true,
    paperStyle: 'clean'
  });

  const fontSizeClasses = {
    sm: 'text-[11px] leading-relaxed prose-sm',
    md: 'text-[13px] leading-relaxed prose-base',
    lg: 'text-[15px] leading-relaxed prose-lg',
    xl: 'text-[17px] leading-relaxed prose-xl',
  };

  const paperStyles = {
    clean: 'bg-white text-stone-900 border border-stone-200 shadow-lg',
    grid: 'bg-white text-stone-900 bg-[linear-gradient(to_right,#f1f1f1_1px,transparent_1px),linear-gradient(to_bottom,#f1f1f1_1px,transparent_1px)] bg-[size:16px_16px] border border-stone-300 shadow-lg',
    warm: 'bg-[#faf6ee] text-stone-900 border border-amber-100 shadow-lg'
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-md z-50 flex flex-col md:flex-row h-screen print:bg-white print:p-0 overflow-hidden select-none">
      
      {/* 控制侧边栏 */}
      <div className="w-full md:w-80 bg-stone-800 border-b md:border-b-0 md:border-r border-stone-700/80 p-5 flex flex-col gap-5 text-stone-200 shrink-0 print:hidden overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-stone-700">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
            <Printer className="w-4 h-4" />
            <span>智能排版打印控制台</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-stone-700 hover:bg-stone-600 transition-all text-stone-400 hover:text-white"
            title="关闭预览"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 纸张样式选择 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-400 flex items-center gap-1">
            <Layout className="w-3.5 h-3.5" /> 纸张样式与风格
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {([
              { id: 'clean', label: '素雅白' },
              { id: 'grid', label: '方格页' },
              { id: 'warm', label: '护眼米' }
            ] as const).map(p => (
              <button
                key={p.id}
                onClick={() => setSettings({ ...settings, paperStyle: p.id })}
                className={`py-1.5 px-2 rounded-lg border font-medium transition-all ${
                  settings.paperStyle === p.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-stone-700 hover:bg-stone-700/50 text-stone-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 页面布局排版栏 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-400 flex items-center gap-1">
            <Columns className="w-3.5 h-3.5" /> 纸张分栏布局
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setSettings({ ...settings, layout: 'single' })}
              className={`py-2 px-2.5 rounded-lg border font-medium flex flex-col items-center gap-1 transition-all ${
                settings.layout === 'single'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-stone-700 hover:bg-stone-700/50 text-stone-300'
              }`}
            >
              <div className="w-8 h-5 border border-dashed border-stone-500 rounded bg-stone-900/40 flex items-center justify-center text-[8px]">
                ■
              </div>
              <span>单栏排版</span>
            </button>
            <button
              onClick={() => setSettings({ ...settings, layout: 'double' })}
              className={`py-2 px-2.5 rounded-lg border font-medium flex flex-col items-center gap-1 transition-all ${
                settings.layout === 'double'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-stone-700 hover:bg-stone-700/50 text-stone-300'
              }`}
            >
              <div className="w-8 h-5 border border-dashed border-stone-500 rounded bg-stone-900/40 flex gap-0.5 p-0.5">
                <div className="flex-1 bg-stone-600/40 rounded"></div>
                <div className="flex-1 bg-stone-600/40 rounded"></div>
              </div>
              <span>高效双栏</span>
            </button>
          </div>
        </div>

        {/* 字体大小选择 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-400 flex items-center gap-1">
            <Type className="text-stone-400 w-3.5 h-3.5" /> 字体大小控制
          </label>
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {([
              { id: 'sm', label: '紧凑' },
              { id: 'md', label: '常规' },
              { id: 'lg', label: '适中' },
              { id: 'xl', label: '较大' }
            ] as const).map(f => (
              <button
                key={f.id}
                onClick={() => setSettings({ ...settings, fontSize: f.id })}
                className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                  settings.fontSize === f.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-stone-700 hover:bg-stone-700/50 text-stone-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 排版信息开关 */}
        <div className="space-y-2 border-t border-stone-700/60 pt-3">
          <span className="text-xs font-semibold text-stone-400 block mb-2">排版信息开关</span>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.showTags}
                onChange={(e) => setSettings({ ...settings, showTags: e.target.checked })}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span>在页首包含学科分类与标签</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.showWatermark}
                onChange={(e) => setSettings({ ...settings, showWatermark: e.target.checked })}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span>添加防伪水印</span>
            </label>
          </div>
        </div>

        {/* 打印按钮组 */}
        <div className="mt-auto pt-4 border-t border-stone-700">
          <button
            onClick={triggerPrint}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <Printer className="w-5 h-5 animate-pulse" />
            <span>进入系统开始打印</span>
          </button>
          
          <p className="text-[10px] text-stone-500 text-center mt-3 leading-relaxed">
            建议在弹出的浏览器打印设置中：<br />
            勾选 <b>“背景图形”</b> 并在页眉页脚选择 <b>“无”</b> 体验最佳排版。
          </p>
        </div>
      </div>

      {/* 打印预览主区域 */}
      <div className="flex-1 bg-stone-900 overflow-y-auto px-4 py-8 flex justify-center print:bg-white print:p-0 print:overflow-visible">
        
        {/* 模拟A4纸 */}
        <div 
          className={`w-[210mm] min-h-[297mm] p-[15mm] shrink-0 print:border-none print:shadow-none print:m-0 print:p-[10mm] transition-all relative overflow-hidden ${
            paperStyles[settings.paperStyle]
          }`}
          id="simulation-a4-sheet"
        >
          {/* 水印 */}
          {settings.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
              <div className="text-7xl font-sans font-bold uppercase rotate-[-35deg] tracking-[1rem] leading-none text-stone-900 border-4 border-stone-800 p-8">
                学霸手记 • 打印本
              </div>
            </div>
          )}

          {/* 文档内容 */}
          <div className="relative z-10 space-y-6">
            
            {/* 页头 */}
            <div className="border-b-4 border-stone-800 pb-3 flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 font-bold text-xs bg-stone-900 text-white rounded">
                    {SUBJECT_CONFIGS[sheet.subject].name}
                  </span>
                  <span className="text-[11px] text-stone-500 tracking-wide font-medium">知识整合讲义</span>
                </div>
                <h1 className="text-2xl font-bold font-sans text-stone-900 mt-1.5">{sheet.title}</h1>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xl">{sheet.description}</p>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <span className="font-mono text-[9px] text-stone-400">更新时间: {new Date(sheet.updatedAt).toLocaleDateString()}</span>
                {settings.showTags && sheet.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                     {sheet.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-stone-100/80 border border-stone-200 text-stone-600 rounded text-[9px] font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Markdown 解析布局 */}
             <div className={`markdown-body prose prose-stone max-w-none text-stone-800 break-words ${fontSizeClasses[settings.fontSize]} ${settings.layout === 'double' ? 'columns-2 gap-8 space-y-0' : ''}`}>
               <Markdown
                 remarkPlugins={[remarkGfm, remarkMath]}
                 rehypePlugins={[rehypeKatex]}
               >
                 {sheet.content || '*本文段无内容*'}
               </Markdown>
             </div>

            {/* 页脚 */}
             <div className="border-t border-stone-300 mt-8 pt-3 text-center text-[10px] text-stone-400 font-mono flex justify-between items-center z-10 select-none" style={{ breakInside: 'avoid' }}>
               <span>学科知识打印大师 • 学霸自制讲义版</span>
               <span>打印页码：A4 标准页</span>
               <span>严禁盗版复印 • 祝您大考题名</span>
             </div>

          </div>

        </div>

      </div>

      {/* 全局 CSS 注入以支持原生打印机并防止样式泄漏 */}
      <style>{`
        @media print {
          /* Hide console and top controls */
          body * {
            visibility: hidden;
          }
          
          /* Show only the simulation printable core */
          #simulation-a4-sheet, #simulation-a4-sheet * {
            visibility: visible;
          }
          
          #simulation-a4-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }

          /* Force high-quality ink output colors */
          body {
            background-color: white !important;
            color: black !important;
          }
          
          /* Hide margins in native document windows */
          @page {
            size: auto;
            margin: 10mm 15mm 10mm 15mm;
          }
        }
      `}</style>
    </div>
  );
}
