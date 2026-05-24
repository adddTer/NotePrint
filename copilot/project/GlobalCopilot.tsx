import React from 'react';
import { CopilotUI } from '../ui/CopilotUI';
import { toolDeclarations, createToolHandlers } from './tools';
import { systemInstructionBase, toolNameMap } from './prompts';
import { KnowledgeSheet, Folder } from '../../src/types';

interface GlobalCopilotProps {
    sheets: KnowledgeSheet[];
    folders: Folder[];
    persistSheets: (sheets: KnowledgeSheet[]) => void;
    persistFolders: (folders: Folder[]) => void;
    onDeleteFolder: (id: string) => void;
    copilotState: any;
    getCopilotState: () => any;
    setCopilotState: any;
    activeSheetId: string;
}

export const GlobalCopilot: React.FC<GlobalCopilotProps> = (props) => {
    const handleThinkingStatusChange = React.useCallback((isThinking: boolean) => {
        props.setCopilotState((prev: any) => {
            if (isThinking && prev.isActive && prev.isReviewing) {
                return { ...prev, isReviewing: false };
            } else if (!isThinking && prev.isActive) {
                return { ...prev, isReviewing: true };
            }
            return prev;
        });
    }, [props.setCopilotState]);

    return (
        <CopilotUI
            toolDeclarations={toolDeclarations}
            createHandlers={createToolHandlers}
            systemInstructionBase={systemInstructionBase}
            context={props}
            title="讲义整理 Copilot"
            toolNameMap={toolNameMap}
            emptyStateTitle="我是你的讲义整理助手"
            emptyStateDescription="你可以让我帮你整理讲义、重新排版资料、调整文件夹层级，或是根据文字要求自动归档。比如你可以说：'帮我把所有的语文资料都移动到一个叫语文复习的文件夹下'。"
            onThinkingStatusChange={handleThinkingStatusChange}
        />
    );
};
