/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KnowledgeSheet, SubjectId, Folder } from './types';
import { DEFAULT_SHEETS, SUBJECT_CONFIGS } from './subjectData';
import { DocWorkspace } from './components/DocWorkspace';
import { PrintPreview } from './components/PrintPreview';
import { useDialog } from './components/Dialog';
import { BookOpen } from 'lucide-react';

function AppLogo() {
  return (
    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 relative overflow-hidden shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 drop-shadow-sm">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M8 7h6" />
        <path d="M8 11h8" />
        <circle cx="16" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
      <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-white/10 rounded-full blur-sm"></div>
    </div>
  );
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'f-arts', name: '文科学霸提分特训', parentId: null, createdAt: new Date().toISOString() },
  { id: 'f-arts-chinese', name: '语文经典诗词专栏', parentId: 'f-arts', createdAt: new Date().toISOString() },
  { id: 'f-arts-english', name: '英语写作与形近词解密', parentId: 'f-arts', createdAt: new Date().toISOString() },
  { id: 'f-science', name: '理科数理化公式宝典', parentId: null, createdAt: new Date().toISOString() },
  { id: 'f-science-math', name: '高中数学空间几何学', parentId: 'f-science', createdAt: new Date().toISOString() },
  { id: 'f-science-physics', name: '高考物理经典动力学', parentId: 'f-science', createdAt: new Date().toISOString() },
  { id: 'f-science-chemistry', name: '化学反应深度解析集', parentId: 'f-science', createdAt: new Date().toISOString() },
  { id: 'f-science-biology', name: '生物遗传机制与练习', parentId: 'f-science', createdAt: new Date().toISOString() },
];

export default function App() {
  const [sheets, setSheets] = useState<KnowledgeSheet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string>('');
  const [printSheet, setPrintSheet] = useState<KnowledgeSheet | null>(null);
  
  const { DialogComponent, showAlert, showConfirm, showPrompt } = useDialog();

  // 从 localStorage 初始化或使用默认回退
  useEffect(() => {
    try {
      const storedFolders = localStorage.getItem('school_knowledge_folders');
      const storedSheets = localStorage.getItem('school_knowledge_sheets');
      
      let loadedFolders: Folder[] = [];
      let loadedSheets: KnowledgeSheet[] = [];

      if (storedFolders) {
        loadedFolders = JSON.parse(storedFolders);
      } else {
        loadedFolders = DEFAULT_FOLDERS;
        localStorage.setItem('school_knowledge_folders', JSON.stringify(DEFAULT_FOLDERS));
      }

      if (storedSheets) {
        loadedSheets = JSON.parse(storedSheets);
        // 确保没有 'content' 属性的旧讲义不会报错
        loadedSheets = loadedSheets.map(s => ({
          ...s,
          content: s.content || ''
        }));
      } else {
        loadedSheets = DEFAULT_SHEETS.map(s => {
          return { ...s, folderId: null, content: s.content || '' };
        });
        localStorage.setItem('school_knowledge_sheets', JSON.stringify(loadedSheets));
      }

      setFolders(loadedFolders);
      setSheets(loadedSheets);
      
      if (loadedSheets.length > 0) {
        setActiveSheetId(loadedSheets[0].id);
      }
    } catch (e) {
      console.error('Failed to parse from localStorage, using presets:', e);
      setFolders(DEFAULT_FOLDERS);
      setSheets([]);
    }
  }, []);

  const persistSheets = (updatedSheets: KnowledgeSheet[]) => {
    setSheets(updatedSheets);
    localStorage.setItem('school_knowledge_sheets', JSON.stringify(updatedSheets));
  };

  const persistFolders = (updatedFolders: Folder[]) => {
    setFolders(updatedFolders);
    localStorage.setItem('school_knowledge_folders', JSON.stringify(updatedFolders));
  };

  const handleUpdateSheet = (updatedSheet: KnowledgeSheet) => {
    const updated = sheets.map(s => s.id === updatedSheet.id ? updatedSheet : s);
    persistSheets(updated);
  };

  const handleSelectSheet = (id: string) => {
    setActiveSheetId(id);
  };

  const handleAddSheet = (subject: SubjectId, folderId: string | null = null, title?: string) => {
    const defaultMeta = SUBJECT_CONFIGS[subject];
    const newSheet: KnowledgeSheet = {
      id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title || `新建 ${defaultMeta.name} 讲义`,
      subject,
      description: `双击编辑文档说明...`,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: defaultMeta.defaultContent,
      folderId: folderId
    };
    
    const updated = [...sheets, newSheet];
    persistSheets(updated);
    setActiveSheetId(newSheet.id);
  };

  const handleDeleteSheet = (id: string) => {
    const updated = sheets.filter(s => s.id !== id);
    persistSheets(updated);
    if (activeSheetId === id && updated.length > 0) {
      setActiveSheetId(updated[0].id);
    } else if (activeSheetId === id) {
      setActiveSheetId('');
    }
  };

  // 文件夹操作函数
  const handleAddFolder = (name: string, parentId: string | null = null) => {
    const newFolder: Folder = {
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        parentId,
        createdAt: new Date().toISOString()
    };
    persistFolders([...folders, newFolder]);
  };

  const handleRenameFolder = (id: string, name: string) => {
    const updated = folders.map(f => f.id === id ? { ...f, name } : f);
    persistFolders(updated);
  };

  const handleDeleteFolder = (id: string) => {
    const folderIdsToDelete = new Set<string>([id]);
    let keepSearching = true;
    while (keepSearching) {
      let foundNested = false;
      folders.forEach(f => {
        if (f.parentId && folderIdsToDelete.has(f.parentId) && !folderIdsToDelete.has(f.id)) {
          folderIdsToDelete.add(f.id);
          foundNested = true;
        }
      });
      if (!foundNested) keepSearching = false;
    }

    const remainingFolders = folders.filter(f => !folderIdsToDelete.has(f.id));
    persistFolders(remainingFolders);

    const remainingSheets = sheets.map(s => {
      if (s.folderId && folderIdsToDelete.has(s.folderId)) {
        return { ...s, folderId: null };
      }
      return s;
    });
    persistSheets(remainingSheets);
  };

  const handleMoveFolder = (folderId: string, targetParentId: string | null) => {
    const illegalTargets = new Set<string>([folderId]);
    let active = true;
    while (active) {
      let foundSub = false;
      folders.forEach(f => {
        if (f.parentId && illegalTargets.has(f.parentId) && !illegalTargets.has(f.id)) {
          illegalTargets.add(f.id);
          foundSub = true;
        }
      });
      if (!foundSub) active = false;
    }

    if (targetParentId && illegalTargets.has(targetParentId)) {
      showAlert('操作失败', '无法将文件夹放入自身的子类目或其文件夹本身中！');
      return;
    }

    const updated = folders.map(f => f.id === folderId ? { ...f, parentId: targetParentId } : f);
    persistFolders(updated);
  };

  const handleMoveSheet = (sheetId: string, targetFolderId: string | null) => {
    const updated = sheets.map(s => s.id === sheetId ? { ...s, folderId: targetFolderId } : s);
    persistSheets(updated);
  };

  // 本地打包备份操作
  const handleExportData = () => {
    try {
      const backupObj = { folders, sheets };
      const dataStr = JSON.stringify(backupObj, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `学霸全科知识整理多级树形备份_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      showAlert('导出失败', '导出备份包失败，请检查浏览器权限');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const importContent = JSON.parse(event.target?.result as string);
        let loadedFoldersList: Folder[] = [];
        let loadedSheetsList: KnowledgeSheet[] = [];

        if (Array.isArray(importContent)) {
          loadedFoldersList = DEFAULT_FOLDERS;
          loadedSheetsList = importContent;
        } else if (importContent && typeof importContent === 'object' && Array.isArray(importContent.sheets)) {
          loadedFoldersList = Array.isArray(importContent.folders) ? importContent.folders : DEFAULT_FOLDERS;
          loadedSheetsList = importContent.sheets;
        } else {
          showAlert('读取失败', '备份文件不符合标准格式');
          return;
        }

        if (loadedSheetsList.length > 0) {
          const doImport = await showConfirm(
            '确认导入', 
            `成功读取到 ${loadedFoldersList.length} 个文件夹和 ${loadedSheetsList.length} 个知识讲义文档。这会覆盖当前本地的内容，确认导入吗？`
          );
          if (doImport) {
            persistFolders(loadedFoldersList);
            persistSheets(loadedSheetsList);
            setActiveSheetId(loadedSheetsList[0].id);
            showAlert('导入成功', '已恢复多级文档体系！');
          }
        } else {
          showAlert('提示', '备份中没有可导入的讲义文档');
        }
      } catch (err) {
        showAlert('解析失败', '解析备份失败，请传入正确的知识点整理 JSON 数据包');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 select-none antialiased">
      <header className="bg-white border-b border-stone-200 shadow-xs shrink-0 relative select-none">
        <div className="mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo />
            <h1 className="text-sm font-bold text-stone-800 tracking-wide">学案系统</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="importData"
              className="hidden"
              accept=".json"
              onChange={handleImportData}
            />
            <button
              onClick={() => document.getElementById('importData')?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              导入备份
            </button>
            <button
              onClick={handleExportData}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              导出全库
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-0 sm:p-4 overflow-hidden flex">
        <DocWorkspace
          sheets={sheets}
          activeSheetId={activeSheetId}
          onSelectSheet={handleSelectSheet}
          onUpdateSheet={handleUpdateSheet}
          onAddSheet={handleAddSheet}
          onDeleteSheet={handleDeleteSheet}
          onOpenPrint={(sheet) => setPrintSheet(sheet)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          folders={folders}
          onAddFolder={handleAddFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onMoveFolder={handleMoveFolder}
          onMoveSheet={handleMoveSheet}
          showAlert={showAlert}
          showConfirm={showConfirm}
          showPrompt={showPrompt}
        />
      </main>

      {printSheet && (
        <PrintPreview
          sheet={printSheet}
          onClose={() => setPrintSheet(null)}
        />
      )}
      {DialogComponent}
    </div>
  );
}
