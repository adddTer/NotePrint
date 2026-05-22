/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubjectId = 'general' | 'chinese' | 'math' | 'english' | 'physics' | 'chemistry' | 'biology';

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  themeColor: string; // Tailwind class like "teal"
  bgColor: string;    // Tailwind bg class like "bg-teal-50"
  borderColor: string; // Tailwind border class
  darkColor: string;  // Tailwind text/border dark class
  icon: string;       // Name of lucide-react icon
  placeholder: string;
  defaultContent: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // Supports deep nested folders
  createdAt: string;
}

export interface KnowledgeSheet {
  id: string;
  title: string;
  subject: SubjectId;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  content: string;
  folderId?: string | null; // Belongs to physical folder structure
}

export interface PrintSettings {
  pageSize: 'A4' | 'A5' | 'B5';
  layout: 'single' | 'double'; // Single column vs Double column layout
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  showImportance: boolean;
  showTags: boolean;
  showWatermark: boolean;
  showNotes: boolean;
  paperStyle: 'clean' | 'grid' | 'warm'; // Plain white, dot-grid, eye-care ivory
}
