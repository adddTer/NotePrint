/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubjectConfig, SubjectId, KnowledgeSheet } from './types';

export const SUBJECT_CONFIGS: Record<SubjectId, SubjectConfig> = {
  general: {
    id: 'general',
    name: '综合',
    themeColor: 'stone',
    bgColor: 'bg-stone-50/70',
    borderColor: 'border-stone-200',
    darkColor: 'text-stone-800 border-stone-300 bg-stone-100/50',
    icon: 'FileText',
    placeholder: '输入文档内容、知识点、提纲或随笔...',
    defaultContent: `# 新建文档\n\n在此输入您的学习笔记或知识结构...`
  },
  chinese: {
    id: 'chinese',
    name: '语文',
    themeColor: 'rose',
    bgColor: 'bg-rose-50/70',
    borderColor: 'border-rose-200',
    darkColor: 'text-rose-800 border-rose-300 bg-rose-100/50',
    icon: 'BookOpen',
    placeholder: '输入文言文、字词拼音、古诗词或作文素材...',
    defaultContent: `# 语文学习笔记\n\n在此输入您的重点字词、文学常识或古诗词默写...`
  },
  math: {
    id: 'math',
    name: '数学',
    themeColor: 'indigo',
    bgColor: 'bg-indigo-50/70',
    borderColor: 'border-indigo-200',
    darkColor: 'text-indigo-800 border-indigo-300 bg-indigo-100/50',
    icon: 'Calculator',
    placeholder: '输入定理、公式推导、几何性质及经典考题...',
    defaultContent: `# 数学定理与公式\n\n$$ E = mc^2 $$\n\n记录推导过程和易错题型...`
  },
  english: {
    id: 'english',
    name: '英语',
    themeColor: 'cyan',
    bgColor: 'bg-cyan-50/70',
    borderColor: 'border-cyan-200',
    darkColor: 'text-cyan-800 border-cyan-300 bg-cyan-100/50',
    icon: 'Languages',
    placeholder: '输入词汇、语法短语、经典句型或错题改错...',
    defaultContent: `# 英语词汇与长难句\n\n### vocabulary\n- **发音**: /vəˈkæbjuləri/\n- **释义**: 词汇\n> 例句：Building a strong vocabulary is important.`
  },
  physics: {
    id: 'physics',
    name: '物理',
    themeColor: 'amber',
    bgColor: 'bg-amber-50/70',
    borderColor: 'border-amber-200',
    darkColor: 'text-amber-800 border-amber-300 bg-amber-100/50',
    icon: 'Sparkles',
    placeholder: '输入物理公式、量纲符号、实验现象或模型整理...',
    defaultContent: `# 物理模型与规律\n\n$$ s = v_0 t + \\frac{1}{2} a t^2 $$\n\n记录实验现象及分析...`
  },
  chemistry: {
    id: 'chemistry',
    name: '化学',
    themeColor: 'emerald',
    bgColor: 'bg-emerald-50/70',
    borderColor: 'border-emerald-200',
    darkColor: 'text-emerald-800 border-emerald-300 bg-emerald-100/50',
    icon: 'Beaker',
    placeholder: '输入化学性质、离子共存、典型反应方程式及实验步骤...',
    defaultContent: `# 化学反应方程式\n\n**高锰酸钾受热分解**\n\n$$ \\ce{ 2KMnO4 \\xlongequal{\\Delta} K2MnO4 + MnO2 + O2 ^ } $$\n\n**乙醇催化氧化（结构简式）**\n\n$$ \\ce{ 2CH3CH2OH + O2 \\xlongequal[\\Delta]{Cu} 2CH3CHO + 2H2O } $$\n\n- **实验现象**：…\n- **注意事项**：…`
  },
  biology: {
    id: 'biology',
    name: '生物',
    themeColor: 'teal',
    bgColor: 'bg-teal-50/70',
    borderColor: 'border-teal-200',
    darkColor: 'text-teal-800 border-teal-300 bg-teal-100/50',
    icon: 'Sprout',
    placeholder: '输入细胞结构、遗传杂交定律、光合作用规律等...',
    defaultContent: `# 生物知识体系\n\n| 特征 | 减数分裂 | 有丝分裂 |\n| --- | --- | --- |\n| 分裂次数 | 2次 | 1次 |`
  }
};

export const DEFAULT_SHEETS: KnowledgeSheet[] = [];
