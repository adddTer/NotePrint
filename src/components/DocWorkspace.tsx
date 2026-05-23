import React, { useState, useRef, useEffect } from 'react';
import { KnowledgeSheet, SubjectId, Folder } from '../types';
import { SUBJECT_CONFIGS } from '../subjectData';
import { 
  ArrowLeft, FolderPlus, FilePlus, Trash2, Printer, Edit3,
  Folder as FolderIcon, ChevronRight, ChevronDown, Check, Save,
  LayoutGrid, ListTree, File as FileIcon
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/contrib/mhchem';
import { wrapChemistryVariables } from '../lib/markdownUtils';
import { MermaidRenderer } from './MermaidRenderer';
import { MarkdownEditor } from './MarkdownEditor';

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
        className="flex items-center gap-1.5 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1.5 text-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 outline-none transition-colors shadow-2xs cursor-pointer"
      >
        {current.name}
        <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-28 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {(Object.keys(SUBJECT_CONFIGS) as SubjectId[]).map(id => {
            const s = SUBJECT_CONFIGS[id];
            return (
              <button
                key={s.id}
                onClick={() => { onChange(s.id); setOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
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
  const [explorerViewType, setExplorerViewType] = useState<'grid' | 'tree'>('grid');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  
  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];

  // Local state for draft editing
  const [localSheet, setLocalSheet] = useState<KnowledgeSheet>(activeSheet);
  
  useEffect(() => {
    // Only reset localSheet when transitioning to a different sheet from outside
    if (activeSheet && (!localSheet || activeSheet.id !== localSheet.id)) {
      setLocalSheet(activeSheet);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheetId]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = (() => {
    if (!activeSheet || !localSheet) return false;
    if (activeSheet.id !== localSheet.id) return false; // In transition
    return activeSheet.title !== localSheet.title ||
           activeSheet.description !== localSheet.description ||
           activeSheet.content !== localSheet.content ||
           activeSheet.subject !== localSheet.subject ||
           JSON.stringify(activeSheet.tags || []) !== JSON.stringify(localSheet.tags || []);
  })();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && currentView === 'editor') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, currentView]);

  const handleManualSave = () => {
    if (hasUnsavedChanges) {
      onUpdateSheet({ ...localSheet, updatedAt: new Date().toISOString() });
    }
  };

  const openEditor = (id: string) => {
    const targetSheet = sheets.find(s => s.id === id);
    if (targetSheet) {
      onSelectSheet(id);
      setLocalSheet(targetSheet);
      setCurrentView('editor');
    }
  };

  const handleBackToExplorer = async () => {
    if (hasUnsavedChanges) {
      const confirmed = await showConfirm('未保存提示', '当前文档有未保存的更改，确认退出吗？未保存的更改将被丢弃。');
      if (!confirmed) return;
      // Revert changes
      if (activeSheet) setLocalSheet(activeSheet);
    }
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
    
    const toggleExpand = (folderId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedFolders(prev => 
        prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
      );
    };

    const renderTreeViewNode = (parentId: string | null = null, depth: number = 0) => {
      const nodeFolders = folders.filter(f => f.parentId === parentId);
      const nodeSheets = sheets.filter(s => s.folderId === parentId);

      if (nodeFolders.length === 0 && nodeSheets.length === 0 && depth === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400 dark:text-stone-500">
            <FolderIcon className="w-12 h-12 stroke-[1] mb-2 opacity-30" />
            <p>空间为空</p>
            <p className="text-xs mt-1">点击右上角新建文件夹或文档</p>
          </div>
        );
      }

      return (
        <div className={`flex flex-col ${depth > 0 ? 'ml-6 border-l border-stone-200 dark:border-stone-800 space-y-1 mt-1 pl-2' : 'space-y-1'}`}>
          {nodeFolders.map(folder => {
            const isExpanded = expandedFolders.includes(folder.id);
            return (
              <div key={folder.id} className="flex flex-col">
                <div 
                  className="flex items-center gap-2 group p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors"
                  onClick={() => setCurrentFolderId(folder.id)}
                  onDoubleClick={(e) => toggleExpand(folder.id, e)}
                >
                  <button onClick={(e) => toggleExpand(folder.id, e)} className="p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                     {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <FolderIcon className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                  <span className="font-medium text-stone-700 dark:text-stone-200 text-sm flex-1">{folder.name}</span>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      const newName = await showPrompt('重命名文件夹', '输入新的文件夹名称：', folder.name);
                      if (newName && newName.trim() !== '') {
                        onRenameFolder(folder.id, newName.trim());
                      }
                    }} className="p-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md text-stone-500 transition-colors" title="重命名">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      const confirmed = await showConfirm('删除确认', `确定要删除文件夹 "${folder.name}" 及其所有内容吗？此操作不可恢复。`);
                      if(confirmed) {
                        onDeleteFolder(folder.id);
                      }
                    }} className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-md text-rose-500 transition-colors" title="删除">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {isExpanded && renderTreeViewNode(folder.id, depth + 1)}
              </div>
            );
          })}
          
          {nodeSheets.map(sheet => {
            const cfg = SUBJECT_CONFIGS[sheet.subject] || SUBJECT_CONFIGS.chemistry;
            return (
              <div 
                key={sheet.id}
                className="flex items-center gap-3 group p-2 mx-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors"
                onClick={() => openEditor(sheet.id)}
              >
                <FileIcon className="w-4 h-4 ml-2 mr-0.5 text-stone-400" />
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${cfg.darkColor}`}>
                  {cfg.name}
                </span>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200 flex-1 truncate">{sheet.title}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500 hidden sm:block w-32 shrink-0 truncate">{(sheet.tags || []).join(', ')}</span>
                
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button onClick={async (e) => { 
                    e.stopPropagation(); 
                    const newName = await showPrompt('重命名讲义', '输入新的讲义名称：', sheet.title);
                    if (newName && newName.trim() !== '') {
                      onUpdateSheet({...sheet, title: newName.trim()});
                    }
                  }} className="p-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md text-stone-500 transition-colors" title="重命名">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={async (e) => { 
                    e.stopPropagation(); 
                    const confirmed = await showConfirm('删除确认', `确定要删除讲义 "${sheet.title}" 吗？此操作不可恢复。`);
                    if(confirmed) {
                      onDeleteSheet(sheet.id);
                    }
                  }} className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-md text-rose-500 transition-colors" title="删除">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="flex flex-col h-[calc(100vh-56px)] sm:h-[calc(100vh-80px)] w-full bg-white dark:bg-stone-900 sm:rounded-xl sm:shadow-xs border-y sm:border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-stone-100 bg-stone-50 dark:bg-stone-950/50 gap-4 sm:gap-0">
          <div className="flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-stone-300">
            <button 
              onClick={() => setCurrentFolderId(null)}
              className="hover:bg-stone-200 dark:hover:bg-stone-700 px-2 py-1 rounded transition-colors text-stone-800 dark:text-stone-200"
            >
              我的文稿
            </button>
            {getBreadcrumbs().map((crumb) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                <button 
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className="hover:bg-stone-200 dark:hover:bg-stone-700 px-2 py-1 rounded transition-colors text-stone-800 dark:text-stone-200"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
            <div className="flex bg-stone-200/50 dark:bg-stone-800 rounded-lg p-0.5 mr-2">
              <button
                onClick={() => setExplorerViewType('grid')}
                className={`p-1.5 rounded-md transition-colors ${explorerViewType === 'grid' ? 'bg-white dark:bg-stone-700 shadow-sm text-emerald-600' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                title="网格视图"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setExplorerViewType('tree')}
                className={`p-1.5 rounded-md transition-colors ${explorerViewType === 'tree' ? 'bg-white dark:bg-stone-700 shadow-sm text-emerald-600' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                title="列表视图"
              >
                <ListTree className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={async () => {
                const name = await showPrompt('新建文件夹', '请输入新文件夹的名称：', '', '文件夹名称');
                if (name && name.trim()) onAddFolder(name.trim(), currentFolderId);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-2xs"
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
          {explorerViewType === 'tree' ? (
             renderTreeViewNode(currentFolderId)
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
              
              {childFolders.map(folder => (
              <div 
                key={folder.id}
                onDoubleClick={() => setCurrentFolderId(folder.id)}
                className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer relative"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <button onClick={async (e) => { 
                    e.stopPropagation(); 
                    const newName = await showPrompt('重命名文件夹', '输入新的文件夹名称：', folder.name);
                    if (newName && newName.trim() !== '') {
                      onRenameFolder(folder.id, newName.trim());
                    }
                  }} className="p-1 hover:bg-stone-200 bg-white dark:bg-stone-900 shadow-2xs rounded-md text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors" title="重命名">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={async (e) => { 
                    e.stopPropagation(); 
                    const confirmed = await showConfirm('删除确认', `确定要删除文件夹 "${folder.name}" 及其所有内容吗？此操作不可恢复。`);
                    if(confirmed) {
                      onDeleteFolder(folder.id);
                    }
                  }} className="p-1 hover:bg-rose-100 bg-white dark:bg-stone-900 shadow-2xs rounded-md text-rose-400 hover:text-rose-600 transition-colors" title="删除">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-stone-200 dark:hover:bg-stone-700 transition-all group-active:scale-95 text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:text-stone-300">
                  <FolderIcon className="w-8 h-8 fill-current opacity-20 stroke-[1.5]" />
                </div>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200 text-center line-clamp-2 px-2">
                  {folder.name}
                </span>
                <span className="text-xs text-stone-400 dark:text-stone-500 mt-1">文件夹</span>
              </div>
            ))}

            {childSheets.map(sheet => {
              const cfg = SUBJECT_CONFIGS[sheet.subject] || SUBJECT_CONFIGS.chemistry;
              return (
                <div 
                  key={sheet.id}
                  onClick={() => openEditor(sheet.id)}
                  className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer relative border border-transparent hover:border-stone-200 dark:border-stone-700 hover:shadow-2xs"
                >
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 z-10">
                    <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      const newName = await showPrompt('重命名讲义', '输入新的讲义名称：', sheet.title);
                      if (newName && newName.trim() !== '') {
                        onUpdateSheet({...sheet, title: newName.trim()});
                      }
                    }} className="p-1 hover:bg-stone-200 bg-white dark:bg-stone-900 shadow-2xs rounded-md text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors" title="重命名">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={async (e) => { 
                      e.stopPropagation(); 
                      const confirmed = await showConfirm('删除确认', `确定要删除讲义 "${sheet.title}" 吗？此操作不可恢复。`);
                      if(confirmed) {
                        onDeleteSheet(sheet.id);
                      }
                    }} className="p-1 hover:bg-rose-100 bg-white dark:bg-stone-900 shadow-2xs rounded-md text-rose-400 hover:text-rose-600 transition-colors" title="删除">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className={"w-14 h-[72px] rounded-lg flex items-center justify-center mb-3 group-hover:-translate-y-1 transition-all group-active:translate-y-0 relative overflow-hidden bg-white dark:bg-stone-900 shadow-sm border border-stone-200 dark:border-stone-700"}>
                    <div className={"absolute top-0 w-full h-1 " + cfg.bgColor.replace('/70', '')}></div>
                    <span className={"text-2xl font-black opacity-20 select-none " + cfg.darkColor.split(' ')[0]}>
                      {cfg.name[0]}
                    </span>
                    <div className="absolute bottom-1 right-1 text-[8px] font-bold text-stone-300">
                      .MD
                    </div>
                  </div>
                  
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200 text-center line-clamp-2 px-1">
                    {sheet.title}
                  </span>
                  <span className={"text-[10px] items-center flex gap-1 px-1.5 py-0.5 rounded-sm mt-1.5 font-bold " + cfg.darkColor}>
                    {cfg.name}
                  </span>
                  {sheet.tags && sheet.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap justify-center px-1">
                      {sheet.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] bg-stone-100 dark:bg-stone-800 border border-stone-200 text-stone-500 dark:text-stone-400 dark:text-stone-500 px-1 py-0.5 rounded leading-none max-w-[60px] truncate">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {childFolders.length === 0 && childSheets.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-stone-400 dark:text-stone-500">
                <FolderIcon className="w-12 h-12 stroke-[1] mb-2 opacity-30" />
                <p>此文件夹为空</p>
                <p className="text-xs mt-1">点击右上角新建文件夹或文档</p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'editor' && localSheet) {
    const cfg = SUBJECT_CONFIGS[localSheet.subject] || SUBJECT_CONFIGS.chemistry;

    return (
      <div className="flex flex-col h-[calc(100vh-56px)] sm:h-[calc(100vh-80px)] w-full bg-white dark:bg-stone-900 sm:rounded-xl sm:shadow-xs border-y sm:border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* 编辑器统一信息与控制栏 */}
        <div className="flex flex-col border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shrink-0">
          {/* Top row: Back button, Title, Actions */}
          <div className="flex items-center justify-between px-4 py-3">
             <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={handleBackToExplorer}
                  className="p-1.5 -ml-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-stone-500 dark:text-stone-400 dark:hover:text-stone-300 transition-colors shrink-0"
                  title="返回文件管理"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-stone-200 dark:bg-stone-700 shrink-0 hidden sm:block"></div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="hidden sm:block shrink-0">
                    <SubjectSelector 
                      value={localSheet.subject}
                      onChange={v => setLocalSheet({...localSheet, subject: v})}
                    />
                  </div>
                  <div className="flex items-center flex-1 min-w-0 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 rounded-lg px-3 py-1.5 transition-all">
                    <input
                      type="text"
                      value={localSheet.title}
                      onChange={(e) => setLocalSheet({...localSheet, title: e.target.value})}
                      className="font-bold text-base sm:text-lg text-stone-800 dark:text-stone-200 bg-transparent border-none outline-none w-full placeholder-stone-400"
                      placeholder="在此输入标题..."
                    />
                    {hasUnsavedChanges && <span className="text-emerald-600 font-bold ml-1 shrink-0" title="未保存">*</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={handleManualSave}
                    disabled={!hasUnsavedChanges}
                    className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 font-medium rounded-lg transition-colors text-sm shadow-2xs ${hasUnsavedChanges ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600'}`}
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">保存</span>
                  </button>
                  <button
                    onClick={() => onOpenPrint(localSheet)}
                    className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-lg transition-colors text-sm shadow-2xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">排版打印</span>
                  </button>
                </div>
             </div>
          </div>

          {/* Bottom row: Description, Tags, Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 pb-3 pt-1">
              <div className="sm:hidden -mt-1 mb-1">
                <SubjectSelector 
                  value={localSheet.subject}
                  onChange={v => setLocalSheet({...localSheet, subject: v})}
                />
              </div>
              <input 
                type="text" 
                placeholder="添加文档简介 / 描述文字..." 
                value={localSheet.description} 
                onChange={e => setLocalSheet({...localSheet, description: e.target.value})}
                className="text-sm text-stone-600 dark:text-stone-400 flex-1 outline-none bg-transparent placeholder-stone-400 dark:placeholder-stone-600"
              />
              <div className="flex items-center gap-3 shrink-0">
                <input 
                  key={`tags-${localSheet.id}`}
                  type="text" 
                  placeholder="添加标签 (用逗号分隔)..." 
                  defaultValue={(localSheet.tags || []).join(', ')} 
                  onBlur={e => setLocalSheet({...localSheet, tags: e.target.value.split(/[,，]/).map(t => t.trim()).filter(t => t !== '')})}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setLocalSheet({...localSheet, tags: e.currentTarget.value.split(/[,，]/).map(t => t.trim()).filter(t => t !== '')});
                      e.currentTarget.blur();
                    }
                  }}
                  className="text-xs border border-stone-200 dark:border-stone-700 rounded-md px-2 py-1 outline-none text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder-stone-400 transition-all shadow-2xs w-full sm:w-48"
                />
                <span className="text-[10px] text-stone-400 dark:text-stone-500 hidden sm:block whitespace-nowrap">
                  最后修改: {new Date(localSheet.updatedAt).toLocaleDateString()}
                </span>
              </div>
          </div>
        </div>

        {/* 工作区：分屏编辑器 */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full">
          
          {/* 移动端标签页 */}
          <div className="flex md:hidden border-b border-stone-200 bg-stone-50 dark:bg-stone-950">
            <button
              onClick={() => setMobileEditorTab('edit')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                mobileEditorTab === 'edit' 
                  ? 'border-emerald-600 text-emerald-700 bg-white dark:bg-stone-900' 
                  : 'border-transparent text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              编辑文章
            </button>
            <button
              onClick={() => setMobileEditorTab('preview')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                mobileEditorTab === 'preview' 
                  ? 'border-emerald-600 text-emerald-700 bg-white dark:bg-stone-900' 
                  : 'border-transparent text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              实时预览
            </button>
          </div>

          {/* 左侧面板 - 编辑器 */}
          <div className={`w-full md:w-1/2 flex flex-col border-r border-stone-200 bg-stone-50 dark:bg-stone-950 h-full ${mobileEditorTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-1 overflow-hidden">
              <MarkdownEditor 
                value={localSheet.content} 
                onChange={(val) => setLocalSheet({...localSheet, content: val})}
                onSave={handleManualSave}
              />
            </div>
          </div>

          {/* 右侧面板 - 预览区 */}
          <div className={`w-full md:w-1/2 flex flex-col bg-white dark:bg-stone-900 h-full ${mobileEditorTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
             <div className="hidden md:flex p-2 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-700 items-center shrink-0">
               <span className="text-xs text-stone-500 dark:text-stone-400 dark:text-stone-500 font-semibold px-2">实时渲染预览</span>
             </div>
             <div className="p-4 md:p-8 overflow-y-auto w-full flex-1 scrollbar-thin bg-white dark:bg-stone-900">
                <div className="markdown-body print-md prose prose-stone max-w-none prose-sm leading-relaxed text-stone-800 dark:text-stone-200">
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
                    {wrapChemistryVariables(localSheet.content) || '*预览区域为空...*'}
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
