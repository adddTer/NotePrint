import React, { useState, useRef, useEffect } from 'react';
import { KnowledgeSheet, SubjectId, Folder } from '../types';
import { SUBJECT_CONFIGS } from '../subjectData';
import { 
  ArrowLeft, FolderPlus, FilePlus, Trash2, Printer, Edit3,
  Folder as FolderIcon, ChevronRight, ChevronDown, Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/contrib/mhchem';

function SubjectSelector({ value, onChange }: { value: SubjectId, onChange: (v: SubjectId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = SUBJECT_CONFIGS[value] || SUBJECT_CONFIGS['general'];

  return (
    <div className="relative shrink-0" ref={ref}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 bg-white hover:bg-stone-50 outline-none transition-colors shadow-2xs cursor-pointer"
      >
        {current.name}
        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-28 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {(Object.keys(SUBJECT_CONFIGS) as SubjectId[]).map(id => {
            const s = SUBJECT_CONFIGS[id];
            return (
              <button
                key={s.id}
                onClick={() => { onChange(s.id); setOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {s.name}
                {value === s.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DocWorkspaceProps {
  sheets: KnowledgeSheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onUpdateSheet: (sheet: KnowledgeSheet) => void;
  onAddSheet: (subject: SubjectId, folderId?: string | null, title?: string) => void;
  onDeleteSheet: (id: string) => void;
  onOpenPrint: (sheet: KnowledgeSheet) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  folders?: Folder[];
  onAddFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveFolder: (folderId: string, targetParentId: string | null) => void;
  onMoveSheet: (sheetId: string, targetFolderId: string | null) => void;
  showAlert: (title: string, message?: string) => Promise<void>;
  showConfirm: (title: string, message?: string) => Promise<boolean>;
  showPrompt: (title: string, message?: string, defaultValue?: string, placeholder?: string) => Promise<string | null>;
}

function MarkdownToolbar({ textareaId, onChange }: { textareaId: string; onChange: (val: string) => void }) {
  const insertFormatting = (prefix: string, suffix: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || (suffix ? '' : '文本')) + suffix;

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    onChange(updatedText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : (suffix ? 0 : 2));
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-100 border-b border-stone-200 select-none">
      <span className="text-[10px] text-stone-500 font-bold pl-1 mr-1">快捷输入：</span>
      
      <button type="button" onClick={() => insertFormatting('**', '**')} className="w-6 h-6 flex items-center justify-center font-bold text-[11px] text-stone-700 hover:bg-stone-200 rounded" title="加粗">B</button>
      <button type="button" onClick={() => insertFormatting('*', '*')} className="w-6 h-6 flex items-center justify-center italic text-[11px] text-stone-700 hover:bg-stone-200 rounded" title="斜体">I</button>
      <button type="button" onClick={() => insertFormatting('~~', '~~')} className="w-6 h-6 flex items-center justify-center line-through text-[11px] text-stone-700 hover:bg-stone-200 rounded" title="删除线">S</button>
      
      <span className="w-px h-3 bg-stone-300 mx-1"></span>
      
      <button type="button" onClick={() => insertFormatting('# ', '')} className="font-bold text-[11px] text-stone-700 hover:bg-stone-200 rounded px-1.5 h-6" title="一级标题">H1</button>
      <button type="button" onClick={() => insertFormatting('## ', '')} className="font-bold text-[11px] text-stone-700 hover:bg-stone-200 rounded px-1.5 h-6" title="二级标题">H2</button>
      <button type="button" onClick={() => insertFormatting('### ', '')} className="font-bold text-[11px] text-stone-700 hover:bg-stone-200 rounded px-1.5 h-6" title="三级标题">H3</button>
      
      <span className="w-px h-3 bg-stone-300 mx-1"></span>
      <button type="button" onClick={() => insertFormatting('- ', '')} className="text-[11px] text-stone-700 hover:bg-stone-200 rounded px-1.5 h-6" title="无序列表">• 列表</button>
      <button type="button" onClick={() => insertFormatting('1. ', '')} className="text-[11px] text-stone-700 hover:bg-stone-200 rounded px-1.5 h-6" title="有序列表">1. 列表</button>
      <button type="button" onClick={() => insertFormatting('> ', '')} className="text-[11px] text-stone-700 hover:bg-stone-200 rounded px-1.5 h-6" title="引用">引用</button>
      
      <span className="w-px h-3 bg-stone-300 mx-1"></span>
      <button type="button" onClick={() => insertFormatting('$$ ', ' $$')} className="text-[11px] font-mono text-indigo-700 hover:bg-stone-200 rounded px-1.5 h-6" title="独立公式">$$ 公式</button>
      <button type="button" onClick={() => insertFormatting('$', '$')} className="text-[11px] font-mono text-emerald-700 hover:bg-stone-200 rounded px-1.5 h-6" title="行内公式">$式$</button>
      <button type="button" onClick={() => insertFormatting('$$ \\ce{ A \\xlongequal{\\Delta} B } $$', '')} className="text-[11px] font-mono text-blue-700 hover:bg-stone-200 rounded px-1.5 h-6" title="化学方程式 (自动排版)">化学方程式</button>
      <button type="button" onClick={() => insertFormatting('`', '`')} className="text-[11px] font-mono text-rose-700 hover:bg-stone-200 rounded px-1.5 h-6" title="代码">`代码`</button>

      <span className="w-px h-3 bg-stone-300 mx-1"></span>
      <button type="button" onClick={() => insertFormatting('\\n| 列名1 | 列名2 |\\n| --- | --- |\\n| 内容A | 内容B |\\n', '')} className="text-[11px] text-stone-700 hover:bg-stone-200 rounded px-1.5 h-6" title="插入表格">表格</button>
    </div>
  );
}

export function DocWorkspace({
  sheets,
  activeSheetId,
  onSelectSheet,
  onUpdateSheet,
  onAddSheet,
  onDeleteSheet,
  onOpenPrint,
  onExportData,
  onImportData,
  folders = [],
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  onMoveSheet,
  showAlert,
  showConfirm,
  showPrompt
}: DocWorkspaceProps) {
  
  const [currentView, setCurrentView] = useState<'explorer' | 'editor'>('explorer');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [mobileEditorTab, setMobileEditorTab] = useState<'edit' | 'preview'>('edit');
  
  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];

  const openEditor = (id: string) => {
    onSelectSheet(id);
    setCurrentView('editor');
  };

  const handleBackToExplorer = () => {
    setCurrentView('explorer');
  };

  if (currentView === 'explorer') {
    const childFolders = folders.filter(f => f.parentId === currentFolderId);
    const childSheets = sheets.filter(s => s.folderId === currentFolderId);

    const getBreadcrumbs = () => {
      let crumbs: {id: string, name: string}[] = [];
      let temp = currentFolderId;
      while (temp) {
        const f = folders.find(f => f.id === temp);
        if (f) {
          crumbs.unshift({ id: f.id, name: f.name });
          temp = f.parentId;
        } else {
          break;
        }
      }
      return crumbs;
    };

    return (
      <div className="flex flex-col h-[calc(100vh-56px)] sm:h-[calc(100vh-80px)] w-full bg-white sm:rounded-xl sm:shadow-xs border-y sm:border border-stone-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50 gap-4 sm:gap-0">
          <div className="flex items-center gap-1.5 text-sm font-medium text-stone-600">
            <button 
              onClick={() => setCurrentFolderId(null)}
              className="hover:bg-stone-200 px-2 py-1 rounded transition-colors text-stone-800"
            >
              我的文稿
            </button>
            {getBreadcrumbs().map((crumb) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="w-4 h-4 text-stone-400" />
                <button 
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className="hover:bg-stone-200 px-2 py-1 rounded transition-colors text-stone-800"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
            <button 
              onClick={async () => {
                const name = await showPrompt('新建文件夹', '请输入新文件夹的名称：', '', '文件夹名称');
                if (name && name.trim()) onAddFolder(name.trim(), currentFolderId);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <FolderPlus className="w-4 h-4" />
              <span>新建文件夹</span>
            </button>
            
            <button 
              onClick={async () => {
                const title = await showPrompt('新建讲义/文档', '请输入新文档的标题：', '', '文档标题');
                if (title && title.trim()) {
                  onAddSheet('general', currentFolderId, title.trim());
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-900 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <FilePlus className="w-4 h-4" />
              <span>新建文档</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
            
            {childFolders.map(folder => (
              <div 
                key={folder.id}
                onDoubleClick={() => setCurrentFolderId(folder.id)}
                className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-stone-50 transition-all cursor-pointer relative"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <button onClick={async (e) => { 
                    e.stopPropagation(); 
                    const newName = await showPrompt('重命名文件夹', '输入新的文件夹名称：', folder.name);
                    if (newName && newName.trim() !== '') {
                      onRenameFolder(folder.id, newName.trim());
                    }
                  }} className="p-1 hover:bg-stone-200 bg-white shadow-2xs rounded-md text-stone-500 hover:text-stone-700 transition-colors" title="重命名">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={async (e) => { 
                    e.stopPropagation(); 
                    const confirmed = await showConfirm('删除确认', `确定要删除文件夹 "${folder.name}" 及其所有内容吗？此操作不可恢复。`);
                    if(confirmed) {
                      onDeleteFolder(folder.id);
                    }
                  }} className="p-1 hover:bg-rose-100 bg-white shadow-2xs rounded-md text-rose-400 hover:text-rose-600 transition-colors" title="删除">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-stone-200 transition-all group-active:scale-95 text-stone-400 group-hover:text-stone-600">
                  <FolderIcon className="w-8 h-8 fill-current opacity-20 stroke-[1.5]" />
                </div>
                <span className="text-sm font-medium text-stone-800 text-center line-clamp-2 px-2">
                  {folder.name}
                </span>
                <span className="text-xs text-stone-400 mt-1">文件夹</span>
              </div>
            ))}

            {childSheets.map(sheet => {
              const cfg = SUBJECT_CONFIGS[sheet.subject];
              return (
                <div 
                  key={sheet.id}
                  onClick={() => openEditor(sheet.id)}
                  className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-stone-50 transition-all cursor-pointer relative border border-transparent hover:border-stone-200 hover:shadow-2xs"
                >
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 z-10">
                    <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      const newName = await showPrompt('重命名讲义', '输入新的讲义名称：', sheet.title);
                      if (newName && newName.trim() !== '') {
                        onUpdateSheet({...sheet, title: newName.trim()});
                      }
                    }} className="p-1 hover:bg-stone-200 bg-white shadow-2xs rounded-md text-stone-500 hover:text-stone-700 transition-colors" title="重命名">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      const confirmed = await showConfirm('删除确认', `确定要删除讲义 "${sheet.title}" 吗？此操作不可恢复。`);
                      if(confirmed) {
                        onDeleteSheet(sheet.id);
                      }
                    }} className="p-1 hover:bg-rose-100 bg-white shadow-2xs rounded-md text-rose-400 hover:text-rose-600 transition-colors" title="删除">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className={"w-14 h-[72px] rounded-lg flex items-center justify-center mb-3 group-hover:-translate-y-1 transition-all group-active:translate-y-0 relative overflow-hidden bg-white shadow-sm border border-stone-200"}>
                    <div className={"absolute top-0 w-full h-1 " + cfg.bgColor.replace('/70', '')}></div>
                    <span className={"text-2xl font-black opacity-20 select-none " + cfg.darkColor.split(' ')[0]}>
                      {cfg.name[0]}
                    </span>
                    <div className="absolute bottom-1 right-1 text-[8px] font-bold text-stone-300">
                      .MD
                    </div>
                  </div>
                  
                  <span className="text-sm font-medium text-stone-800 text-center line-clamp-2 px-1">
                    {sheet.title}
                  </span>
                  <span className={"text-[10px] items-center flex gap-1 px-1.5 py-0.5 rounded-sm mt-1.5 font-bold " + cfg.darkColor}>
                    {cfg.name}
                  </span>
                  {sheet.tags && sheet.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap justify-center px-1">
                      {sheet.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] bg-stone-100 border border-stone-200 text-stone-500 px-1 py-0.5 rounded leading-none max-w-[60px] truncate">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {childFolders.length === 0 && childSheets.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-stone-400">
                <FolderIcon className="w-12 h-12 stroke-[1] mb-2 opacity-30" />
                <p>此文件夹为空</p>
                <p className="text-xs mt-1">点击右上角新建文件夹或文档</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'editor' && activeSheet) {
    const cfg = SUBJECT_CONFIGS[activeSheet.subject];

    return (
      <div className="flex flex-col h-[calc(100vh-56px)] sm:h-[calc(100vh-80px)] w-full bg-white sm:rounded-xl sm:shadow-xs border-y sm:border border-stone-200 overflow-hidden">
        {/* 编辑器顶部栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackToExplorer}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors"
              title="返回文件管理"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-stone-200"></div>
            <div className="flex flex-col">
              <input
                type="text"
                value={activeSheet.title}
                onChange={(e) => onUpdateSheet({...activeSheet, title: e.target.value})}
                className="font-bold text-stone-800 bg-transparent border-none outline-none focus:bg-stone-50 rounded px-1 -ml-1 text-sm max-w-sm"
                placeholder="在此输入标题..."
              />
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                <span className={"px-1.5 py-0.5 rounded-sm font-bold tracking-wider uppercase " + cfg.darkColor}>
                  {cfg.name}讲义
                </span>
                <span>最后修改：{new Date(activeSheet.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrint(activeSheet)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>排版与打印</span>
            </button>
          </div>
        </div>

        {/* 工作区：分屏编辑器 */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full">
          
          {/* 移动端标签页 */}
          <div className="flex md:hidden border-b border-stone-200 bg-stone-50">
            <button
              onClick={() => setMobileEditorTab('edit')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                mobileEditorTab === 'edit' 
                  ? 'border-emerald-600 text-emerald-700 bg-white' 
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              编辑文章
            </button>
            <button
              onClick={() => setMobileEditorTab('preview')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                mobileEditorTab === 'preview' 
                  ? 'border-emerald-600 text-emerald-700 bg-white' 
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              实时预览
            </button>
          </div>

          {/* 左侧面板 - 编辑器 */}
          <div className={`w-full md:w-1/2 flex flex-col border-r border-stone-200 bg-stone-50 h-full ${mobileEditorTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-stone-200 bg-white shadow-sm z-10 flex flex-col gap-2.5">
              <input 
                type="text" 
                placeholder="添加文档简介 / 描述文字..." 
                value={activeSheet.description} 
                onChange={e => onUpdateSheet({...activeSheet, description: e.target.value})}
                className="text-sm font-medium text-stone-800 w-full outline-none bg-transparent placeholder-stone-400"
              />
              <div className="flex items-center gap-2">
                <SubjectSelector 
                  value={activeSheet.subject}
                  onChange={v => onUpdateSheet({...activeSheet, subject: v})}
                />
                <input 
                  key={`tags-${activeSheet.id}`}
                  type="text" 
                  placeholder="添加标签..." 
                  defaultValue={activeSheet.tags.join(', ')} 
                  onBlur={e => onUpdateSheet({...activeSheet, tags: e.target.value.split(/[,，]/).map(t => t.trim()).filter(t => t !== '')})}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onUpdateSheet({...activeSheet, tags: e.currentTarget.value.split(/[,，]/).map(t => t.trim()).filter(t => t !== '')});
                      e.currentTarget.blur();
                    }
                  }}
                  className="text-xs font-mono border border-stone-200 rounded-lg px-2.5 py-1.5 flex-1 outline-none text-stone-600 bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 placeholder-stone-400 transition-all shadow-2xs"
                />
              </div>
            </div>

            <MarkdownToolbar 
              textareaId="md-editor-textarea" 
              onChange={(val) => onUpdateSheet({...activeSheet, content: val, updatedAt: new Date().toISOString()})} 
            />
            <textarea
              id="md-editor-textarea"
              className="flex-1 w-full bg-transparent border-0 p-4 shadow-inner outline-none resize-none font-mono text-[13px] md:text-sm text-stone-800 leading-relaxed scrollbar-thin focus:ring-inset focus:ring-2 focus:ring-emerald-500/20"
              placeholder="在此输入 Markdown 格式的内容... 支持 LaTeX 公式 及 \ce{} 化学式排版"
              value={activeSheet.content}
              onChange={(e) => onUpdateSheet({...activeSheet, content: e.target.value, updatedAt: new Date().toISOString()})}
            />
          </div>

          {/* 右侧面板 - 预览区 */}
          <div className={`w-full md:w-1/2 flex flex-col bg-white h-full ${mobileEditorTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
             <div className="hidden md:flex p-2 bg-stone-50 border-b border-stone-200 items-center shrink-0">
               <span className="text-xs text-stone-500 font-semibold px-2">实时渲染预览</span>
             </div>
             <div className="p-4 md:p-8 overflow-y-auto w-full flex-1 scrollbar-thin bg-white">
                <div className="markdown-body print-md prose prose-stone max-w-none prose-sm leading-relaxed text-stone-800">
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {activeSheet.content || '*预览区域为空...*'}
                  </Markdown>
                </div>
             </div>
          </div>

        </div>

      </div>
    );
  }

  return null;
}
