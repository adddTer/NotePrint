import { FunctionDeclaration, Type } from "@google/genai";

export const toolDeclarations: FunctionDeclaration[] = [
    {
        name: "update_status",
        description: "更新Copilot的当前简短工作状态信息（例如“正在生成内容...”或“正在进行质量保证检查...”），方便用户直观看到进度。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                statusMsg: { type: Type.STRING, description: "状态信息" }
            },
            required: ["statusMsg"]
        }
    },
    {
        name: "update_task_state",
        description: "更新全局长任务状态机。在处理复杂长任务时，必须使用此工具来维护宏观进度。包含任务计划、当前步骤、已完成步骤和中间结果。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                plan: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "结构化的执行步骤列表" 
                },
                currentStepIndex: { 
                    type: Type.INTEGER, 
                    description: "当前正在执行的步骤索引（从 0 开始）" 
                },
                completedSteps: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "已完成的步骤描述列表" 
                },
                intermediateResults: { 
                    type: Type.STRING, 
                    description: "阶段性结果的 JSON 字符串，用于在步骤间传递数据" 
                }
            }
        }
    },
    {
        name: "memory_save",
        description: "记录下有价值的推理结果或用户信息，以便后续对话使用。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                key: { type: Type.STRING, description: "记忆的键名" },
                value: { type: Type.STRING, description: "记忆的内容" }
            },
            required: ["key", "value"]
        }
    },
    {
        name: "memory_retrieve",
        description: "获取之前记录的记忆内容。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                key: { type: Type.STRING, description: "记忆的键名" }
            },
            required: ["key"]
        }
    },
    {
        name: "ask_user",
        description: "主动中止当前执行循环，向人类用户提问或请求确认。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "提问文本，将展示给用户。" }
            },
            required: ["question"]
        }
    },
    {
        name: "query_folders",
        description: "查询所有文件夹列表",
        parameters: {
            type: Type.OBJECT,
            properties: {
                parentId: { type: Type.STRING, description: "可选，按父文件夹查询" }
            }
        }
    },
    {
        name: "query_sheets",
        description: "查询所有讲义文档列表（不包含完整正文 content）。可根据条件筛选。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                folderId: { type: Type.STRING, description: "可选，按文件夹ID过滤" },
                subject: { type: Type.STRING, description: "可选，按科目过滤 (general, chinese, math, english, physics, chemistry, biology)" }
            }
        }
    },
    {
        name: "get_sheet_content",
        description: "获取单个讲义文档的完整 Markdown 正文内容。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING, description: "讲义文档 ID" }
            },
            required: ["sheetId"]
        }
    },
    {
        name: "create_sheet",
        description: "创建新的讲义文档。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "讲义标题" },
                subject: { type: Type.STRING, description: "科目ID (general, chinese, math, english, physics, chemistry, biology)" },
                description: { type: Type.STRING, description: "简介" },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "标签数组" },
                content: { type: Type.STRING, description: "Markdown 正文" },
                folderId: { type: Type.STRING, description: "所属文件夹ID，如果为 null 则放置在根目录" }
            },
            required: ["title", "subject", "content"]
        }
    },
    {
        name: "begin_edit",
        description: "在准备编辑指定的讲义内容前，必须先声明进入编辑模式锁定讲义，否则不具备修改能力。（仅限修改被激活/选中的讲义）。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING }
            },
            required: ["sheetId"]
        }
    },
    {
        name: "end_edit",
        description: "完成全部编辑后调用此函数，进入用户确认与比对阶段。",
        parameters: { type: Type.OBJECT, properties: {} },
    },
    {
        name: "update_sheet",
        description: "更新已有讲义文档（如果只需更新部分字段，其它字段不传即可）。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING, description: "讲义的 ID" },
                title: { type: Type.STRING },
                subject: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                content: { type: Type.STRING },
                folderId: { type: Type.STRING }
            },
            required: ["sheetId"]
        }
    },
    {
        name: "delete_sheet",
        description: "删除讲义文档。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING, description: "讲义的 ID" }
            },
            required: ["sheetId"]
        }
    },
    {
        name: "create_folder",
        description: "创建新的文件夹。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "文件夹名字" },
                parentId: { type: Type.STRING, description: "父文件夹ID，为 null 则是根目录" }
            },
            required: ["name"]
        }
    },
    {
        name: "update_folder",
        description: "移动或重命名文件夹。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                folderId: { type: Type.STRING, description: "文件夹 ID" },
                name: { type: Type.STRING, description: "新的名字" },
                parentId: { type: Type.STRING, description: "新的父级文件夹ID，为 null 为根目录" }
            },
            required: ["folderId"]
        }
    },
    {
        name: "delete_folder",
        description: "删除文件夹，会连带着内部的文件夹一并删除（但是讲义会被移到根目录，不会被删除）。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                folderId: { type: Type.STRING, description: "要删除的文件夹ID" }
            },
            required: ["folderId"]
        }
    },
    {
        name: "replace_sheet_lines",
        description: "按行号替换指定讲义的部分内容。这比大段纯文本匹配更好，能够精确替换指定行数范围，不易出错。使用前先用 search_sheet_content 或 view_sheet_lines 确认行号。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING },
                startLine: { type: Type.INTEGER, description: "起始行号（包含，从1开始）" },
                endLine: { type: Type.INTEGER, description: "结束行号（包含）" },
                replacementText: { type: Type.STRING, description: "用于替换这段行的新文本（可以包含多行内容的字符串）" }
            },
            required: ["sheetId", "startLine", "endLine", "replacementText"]
        }
    },
    {
        name: "insert_sheet_content",
        description: "在指定讲义的特定行号处插入新内容。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING },
                line: { type: Type.INTEGER, description: "在此行号前插入内容（从1开始计算）。例如传2则在第2行之前插入新内容。如果在最后追加内容，请传入大于当前行数的数字。" },
                textToInsert: { type: Type.STRING, description: "要插入的新文本" }
            },
            required: ["sheetId", "line", "textToInsert"]
        }
    },
    {
        name: "view_sheet_lines",
        description: "按行号查看指定讲义的正文内容（附带行号输出）。当不知道原文确切内容，或者需要替换前检查内容时使用。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING },
                startLine: { type: Type.INTEGER, description: "起始行号（从 1 开始）" },
                endLine: { type: Type.INTEGER, description: "结束行号" }
            },
            required: ["sheetId", "startLine", "endLine"]
        }
    },
    {
        name: "search_sheet_content",
        description: "在指定讲义中全局搜索指定的文本，并返回对应行及其上下文。用于寻找自己要修改的文本。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                sheetId: { type: Type.STRING },
                query: { type: Type.STRING, description: "需要搜索的精确字符串" }
            },
            required: ["sheetId", "query"]
        }
    },
    {
        name: "search_wikipedia",
        description: "搜索维基百科（基于中文维基）。返回最匹配的几个条目标题和简要片段。你可以通过此工具来了解知识。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "关键词" }
            },
            required: ["query"]
        }
    },
    {
        name: "read_wikipedia",
        description: "读取指定的维基百科条目内容（纯文本，基于中文维基）。如果搜索到了标题，使用此获取完整正文。",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "条目名称" }
            },
            required: ["title"]
        }
    }
];

export const createToolHandlers = (context: any) => {
    let hasBegunEditThisTurn = false;
    let copilotStateShadow = context.getCopilotState ? context.getCopilotState() : context.copilotState;

    const updateCopilotState = (updater: any) => {
        if (typeof updater === 'function') {
            copilotStateShadow = updater(copilotStateShadow);
        } else {
            copilotStateShadow = { ...copilotStateShadow, ...updater };
        }
        if (context.setCopilotState) {
            context.setCopilotState((prev: any) => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
        }
    };

    return {
        update_status: async (args: any) => {
            if (context.setCopilotState) {
                updateCopilotState({ statusMsg: args.statusMsg });
                return { status: "success" };
            }
            return { error: "无法更新状态" };
        },
        update_task_state: async (args: any) => {
            if (context.updateTaskState) {
                context.updateTaskState(args);
                return { status: "success", message: "全局任务状态已更新" };
            }
            return { error: "无法更新状态" };
        },
        memory_save: async ({ key, value }: { key: string, value: any }) => {
            context.updateMemory(key, value);
            return { status: "success", message: `已记录记忆: ${key}` };
        },
        memory_retrieve: async ({ key }: { key: string }) => {
            const value = context.threadMemory[key];
            return value ? { key, value } : { error: "未找到相关记忆" };
        },
        ask_user: async ({ question }: { question: string }) => {
            return { _engine_interrupt: true, _question: question };
        },
        query_folders: async ({ parentId }: { parentId?: string }) => {
            let folders = context.folders || [];
            if (parentId !== undefined) {
                folders = folders.filter((f: any) => f.parentId === parentId);
            }
            return folders;
        },
        query_sheets: async ({ folderId, subject }: { folderId?: string, subject?: string }) => {
            let sheets = context.sheets || [];
            if (folderId !== undefined) {
                sheets = sheets.filter((s: any) => s.folderId === folderId);
            }
            if (subject) {
                sheets = sheets.filter((s: any) => s.subject === subject);
            }
            // Strip content for list query to save tokens
            return sheets.map(({ content, ...rest }: any) => rest);
        },
        get_sheet_content: async ({ sheetId }: { sheetId: string }) => {
            const sheet = (context.sheets || []).find((s: any) => s.id === sheetId);
            if (!sheet) return { error: "未找到讲义" };
            return sheet;
        },
        create_sheet: async (args: any) => {
            const { title, subject, description, tags, content, folderId } = args;
            const newSheet = {
                id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                title,
                subject,
                description: description || "AI 自动生成的讲义",
                tags: tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                content,
                folderId: folderId || null
            };
            const updatedSheets = [...(context.sheets || []), newSheet];
            if (context.persistSheets) {
                context.sheets = updatedSheets;
                context.persistSheets(updatedSheets);
                return { status: "success", message: `已创建讲义: ${title}`, id: newSheet.id };
            }
            return { error: "保存失败" };
        },
        begin_edit: async ({ sheetId }: { sheetId: string }) => {
            if (hasBegunEditThisTurn) {
                return { error: "一次执行期间最多只能调用一遍 begin_edit。你已经开启过了，请直接修改或结束编辑。" };
            }
            hasBegunEditThisTurn = true;
            if (sheetId !== context.activeSheetId) {
                return { error: `你只能编辑用户当前打开所在的讲义(${context.activeSheetId || '无'})。如果需要编辑其它讲义，请提示用户先在左侧列表中打开它。` };
            }
            if (copilotStateShadow?.isActive) {
                if (copilotStateShadow.sheetId === sheetId) {
                    updateCopilotState((prev: any) => ({ ...prev, isReviewing: false }));
                    return { status: "success", message: "仍在继续之前的编辑模式。你可以继续修改草稿。完成后调用 end_edit。" };
                } else {
                    return { error: `当前已经在编辑另一份文件(${copilotStateShadow.sheetId})了，请先完成当前编辑或让用户撤销。` };
                }
            }
            const sheets = context.sheets || [];
            const index = sheets.findIndex((s: any) => s.id === sheetId);
            if (index === -1) return { error: "找不到指定讲义" };
            
            const originalContent = sheets[index].content || "";
            updateCopilotState({
                isActive: true,
                isReviewing: false,
                sheetId: sheetId,
                originalContent: originalContent,
                draftContent: originalContent
            });
            return { status: "success", message: "进入编辑模式成功。现在通过调用修改工具（如replace_sheet_lines或update_sheet的content参数）修改该讲义。完成所有改动后，最后一步必须且只调用 end_edit 提交！" };
        },
        end_edit: async () => {
            if (!copilotStateShadow?.isActive) {
                return { error: "当前未处于编辑模式，无需结束。" };
            }
            updateCopilotState((prev: any) => ({ ...prev, isReviewing: true }));
            return { status: "success", message: "修改已应用，正等待用户确认。你不需要做任何其他操作。" };
        },
        update_sheet: async (args: any) => {
            const { sheetId, title, subject, description, tags, content, folderId } = args;
            const sheets = context.sheets || [];
            const index = sheets.findIndex((s: any) => s.id === sheetId);
            if (index === -1) return { error: "未找到指定讲义" };
            
            const updatedSheet = { ...sheets[index], updatedAt: new Date().toISOString() };
            if (title !== undefined) updatedSheet.title = title;
            if (subject !== undefined) updatedSheet.subject = subject;
            if (description !== undefined) updatedSheet.description = description;
            if (tags !== undefined) updatedSheet.tags = tags;
            if (folderId !== undefined) updatedSheet.folderId = folderId;

            if (content !== undefined) {
                if (!copilotStateShadow?.isActive || copilotStateShadow.sheetId !== sheetId) {
                    return { error: "错误：修改正文（content）前由于防幻觉策略，必须先调用 begin_edit 进行声明并锁定！如果是修改 title 等非正文字段则可以直接调用 update_sheet。" };
                }
                updateCopilotState((prev: any) => ({ ...prev, draftContent: content }));
                return { status: "success", message: `正文修改已写入草稿。如无其他修改，请立即调用 end_edit 提交！`, title: updatedSheet.title };
            }

            const updatedSheets = [...sheets];
            updatedSheets[index] = updatedSheet;
            if (context.persistSheets) {
                context.sheets = updatedSheets;
                context.persistSheets(updatedSheets);
                return { status: "success", message: `已更新讲义: ${sheetId}`, title: updatedSheet.title };
            }
            return { error: "保存失败" };
        },
        delete_sheet: async ({ sheetId }: { sheetId: string }) => {
            const sheets = context.sheets || [];
            const filtered = sheets.filter((s: any) => s.id !== sheetId);
            if (filtered.length === sheets.length) return { error: "未找到指定讲义" };
            if (context.persistSheets) {
                context.sheets = filtered;
                context.persistSheets(filtered);
                return { status: "success", message: `已删除讲义: ${sheetId}` };
            }
            return { error: "删除失败" };
        },
        create_folder: async ({ name, parentId }: { name: string, parentId?: string }) => {
            const newFolder = {
                id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name,
                parentId: parentId || null,
                createdAt: new Date().toISOString()
            };
            const updatedFolders = [...(context.folders || []), newFolder];
            if (context.persistFolders) {
                context.folders = updatedFolders;
                context.persistFolders(updatedFolders);
                return { status: "success", message: `已创建文件夹: ${name}`, id: newFolder.id };
            }
            return { error: "保存失败" };
        },
        update_folder: async ({ folderId, name, parentId }: { folderId: string, name?: string, parentId?: string }) => {
            const folders = context.folders || [];
            const index = folders.findIndex((f: any) => f.id === folderId);
            if (index === -1) return { error: "未找到指定文件夹" };
            
            const updatedFolder = { ...folders[index] };
            if (name !== undefined) updatedFolder.name = name;
            
            if (parentId !== undefined) {
                if (parentId === folderId) return { error: "非法的父文件夹（不能是自己）" };
                updatedFolder.parentId = parentId;
            }

            const updatedFolders = [...folders];
            updatedFolders[index] = updatedFolder;
            if (context.persistFolders) {
                context.folders = updatedFolders;
                context.persistFolders(updatedFolders);
                return { status: "success", message: `已更新文件夹: ${folderId}` };
            }
            return { error: "保存失败" };
        },
        delete_folder: async ({ folderId }: { folderId: string }) => {
            if (context.onDeleteFolder) {
                context.onDeleteFolder(folderId);
                return { status: "success", message: `已触发删除文件夹操作` };
            }
            return { error: "无法执行操作，缺失回调" };
        },
        replace_sheet_lines: async (args: any) => {
            const { sheetId, startLine, endLine, replacementText } = args;
            if (!copilotStateShadow?.isActive || copilotStateShadow.sheetId !== sheetId) {
                return { error: "错误：必须先调用 begin_edit 进行声明并锁定才能修改！" };
            }
            
            const content = copilotStateShadow.draftContent || "";
            const lines = content.split('\n');
            const sl = Math.max(1, startLine) - 1;
            const el = Math.min(lines.length, endLine);
            
            if (sl >= lines.length) return { error: "startLine 超出范围" };
            if (sl > el - 1) return { error: "startLine 必须小于等于 endLine" };

            lines.splice(sl, el - sl, replacementText);
            const updatedContent = lines.join('\n');
            
            updateCopilotState((prev: any) => ({ ...prev, draftContent: updatedContent }));
            return { status: "success", message: `已成功替换第 ${startLine} 到 ${endLine} 行，写入了草稿。如果全部修改完请调用 end_edit。`, sheetId };
        },
        insert_sheet_content: async (args: any) => {
            const { sheetId, line, textToInsert } = args;
            if (!copilotStateShadow?.isActive || copilotStateShadow.sheetId !== sheetId) {
                return { error: "错误：必须先调用 begin_edit 进行声明并锁定才能修改！" };
            }
            
            const content = copilotStateShadow.draftContent || "";
            const lines = content.split('\n');
            const targetIndex = Math.max(0, Math.min(lines.length, line - 1));
            
            lines.splice(targetIndex, 0, textToInsert);
            const updatedContent = lines.join('\n');
            
            updateCopilotState((prev: any) => ({ ...prev, draftContent: updatedContent }));
            return { status: "success", message: `已成功在第 ${line} 行前插入内容，写入了草稿。如果全部修改完请调用 end_edit。`, sheetId };
        },
        view_sheet_lines: async (args: any) => {
            const { sheetId, startLine, endLine } = args;
            let contentStr = "";
            if (copilotStateShadow?.isActive && copilotStateShadow?.sheetId === sheetId) {
                contentStr = copilotStateShadow.draftContent || "";
            } else {
                const sheet = (context.sheets || []).find((s: any) => s.id === sheetId);
                if (!sheet) return { error: "未找到指定讲义" };
                contentStr = sheet.content || "";
            }
            
            const lines = contentStr.split('\n');
            const sl = Math.max(1, startLine) - 1;
            const el = Math.min(lines.length, endLine);
            const resultLines = lines.slice(sl, el).map((line: string, idx: number) => `${sl + idx + 1}: ${line}`);
            return { lines: resultLines.join('\n') };
        },
        search_sheet_content: async (args: any) => {
            const { sheetId, query } = args;
            let contentStr = "";
            if (copilotStateShadow?.isActive && copilotStateShadow?.sheetId === sheetId) {
                contentStr = copilotStateShadow.draftContent || "";
            } else {
                const sheet = (context.sheets || []).find((s: any) => s.id === sheetId);
                if (!sheet) return { error: "未找到指定讲义" };
                contentStr = sheet.content || "";
            }
            
            const lines = contentStr.split('\n');
            const matches: string[] = [];
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(query)) {
                    matches.push(`${i + 1}: ${lines[i]}`);
                }
            }
            return { matches: matches.length > 0 ? matches : "未搜索到结果" };
        },
        search_wikipedia: async ({ query }: { query: string }) => {
            try {
                const res = await fetch(`https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
                const data = await res.json();
                return data.query.search.map((r: any) => ({ title: r.title, snippet: r.snippet.replace(/<[^>]+>/g, '') }));
            } catch (e: any) {
                return { error: e.message || "请求失败" };
            }
        },
        read_wikipedia: async ({ title }: { title: string }) => {
            try {
                const res = await fetch(`https://zh.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(title)}&format=json&origin=*`);
                const data = await res.json();
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId === "-1") return { error: "条目不存在" };
                return { title, content: pages[pageId].extract };
            } catch (e: any) {
                return { error: e.message || "请求失败" };
            }
        }
    };
};
