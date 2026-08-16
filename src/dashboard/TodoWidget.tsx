import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { TodoItem, TodoPriority } from '../toDoList/todo';
import { fetchAllTodos, addTodo, updateTodo } from '../toDoList/todoService';
import { COLORS } from '../theme';
import TodoCalendar from './TodoCalendar';

type ViewMode = 'list' | 'calendar';
const VIEW_MODES: [ViewMode, string][] = [['list', '목록'], ['calendar', '캘린더']];

type FilterTab = 'all' | 'today' | 'overdue' | 'done';

const FILTER_TABS: [FilterTab, string][] = [
    ['all', '전체'],
    ['today', '오늘'],
    ['overdue', '지연'],
    ['done', '완료'],
];

const PRIORITY_COLOR: Record<TodoPriority, string> = {
    HIGH: '#B3403B',
    MID: '#C89B3C',
    LOW: COLORS.textTertiary,
};

function todayStr(): string {
    return new Date().toISOString().split('T')[0];
}

// null = no due tag, overdue only applies to not-yet-completed items (a completed item that
// happened to be overdue when finished isn't still "late" - see dashboard-mockup.html, whose
// done items show a plain date with no red/마감 treatment).
function dueTag(dateStr: string | undefined, completed: boolean): { text: string; overdue: boolean } | null {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

    if (diffDays === 0) return { text: '오늘', overdue: false };
    const overdue = diffDays < 0 && !completed;
    if (diffDays === -1) return { text: overdue ? '어제 마감' : '어제', overdue };
    return { text: `${due.getMonth() + 1}월 ${due.getDate()}일${overdue ? ' 마감' : ''}`, overdue };
}

// Compact todo widget for the dashboard (see dashboard-mockup.html) - reuses todoService.ts's
// existing fetch/add/update calls as-is, just with a new flat-list-plus-filter-tabs
// presentation instead of the old calendar+feed full-page layout (retired MainLayout.tsx/
// TodoList.tsx/TodoInput.tsx/CalendarView.tsx, which were only ever used from this page and
// don't fit a narrow widget card).
export default function TodoWidget() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [tab, setTab] = useState<FilterTab>('all');
    const [quickAddText, setQuickAddText] = useState('');
    const currentUser = localStorage.getItem('user_id');

    const load = async () => {
        const result = await fetchAllTodos();
        if (Array.isArray(result)) setTodos(result);
    };

    useEffect(() => { load(); }, []);

    const today = todayStr();
    const total = todos.length;
    const completedCount = todos.filter((t) => t.completed).length;
    const progressPct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    const filtered = useMemo(() => {
        switch (tab) {
            case 'today': return todos.filter((t) => t.date === today);
            case 'overdue': return todos.filter((t) => !t.completed && !!t.date && t.date < today);
            case 'done': return todos.filter((t) => t.completed);
            default: return todos;
        }
    }, [todos, tab, today]);

    const handleQuickAdd = async () => {
        const text = quickAddText.trim();
        if (!text || !currentUser) return;
        const newTodo: TodoItem = {
            id: Date.now(), text, completed: false, important: false,
            date: today, priority: 'LOW', user_id: currentUser,
        };
        const ok = await addTodo(newTodo);
        if (ok) {
            setQuickAddText('');
            load();
        }
    };

    const toggleComplete = async (todo: TodoItem) => {
        const ok = await updateTodo(todo.id, { completed: !todo.completed });
        if (ok) setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '18px 22px 0' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.875, color: COLORS.textPrimary }}>
                    <CheckIcon sx={{ fontSize: 16, color: COLORS.textTertiary }} /> 할 일
                </Typography>
                <Box sx={{ display: 'flex', gap: '3px', bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '999px', p: '3px' }}>
                    {VIEW_MODES.map(([mode, label]) => (
                        <Box
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            sx={{
                                px: 1.25, py: 0.5, borderRadius: '999px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                bgcolor: viewMode === mode ? COLORS.accent : 'transparent',
                                color: viewMode === mode ? '#fff' : COLORS.textSecondary,
                            }}
                        >
                            {label}
                        </Box>
                    ))}
                </Box>
            </Box>

            {viewMode === 'calendar' ? (
                <Box sx={{ p: '8px 22px 22px' }}>
                    <TodoCalendar todos={todos} onToggle={toggleComplete} />
                </Box>
            ) : (
            <Box sx={{ p: '8px 22px 22px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, my: '10px 0 16px', mt: 1.25, mb: 2 }}>
                    <Box sx={{ flex: 1, height: 6, borderRadius: '999px', bgcolor: COLORS.bg, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${progressPct}%`, bgcolor: COLORS.accent, borderRadius: '999px', transition: 'width .2s' }} />
                    </Box>
                    <Typography sx={{ fontSize: 11.5, color: COLORS.textTertiary, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {completedCount} / {total} 완료
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Box
                        component="input"
                        value={quickAddText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickAddText(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleQuickAdd(); }}
                        placeholder="할 일을 입력하고 Enter"
                        sx={{
                            flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: '10px', px: 1.75, py: 1.25,
                            fontFamily: 'inherit', fontSize: 13, color: COLORS.textPrimary, bgcolor: COLORS.bg, outline: 'none',
                            '&:focus': { borderColor: COLORS.accent, bgcolor: COLORS.surface },
                        }}
                    />
                    <Box
                        component="button"
                        onClick={handleQuickAdd}
                        sx={{
                            bgcolor: COLORS.accent, color: '#fff', border: 'none', borderRadius: '10px', px: 2,
                            fontSize: 13, fontWeight: 700, cursor: 'pointer', '&:hover': { bgcolor: '#211F1B' },
                        }}
                    >
                        추가
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.75, mb: 1.75 }}>
                    {FILTER_TABS.map(([value, label]) => (
                        <Box
                            key={value}
                            onClick={() => setTab(value)}
                            sx={{
                                px: 1.5, py: 0.625, borderRadius: '999px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                                bgcolor: tab === value ? COLORS.accent : COLORS.bg,
                                color: tab === value ? '#fff' : COLORS.textSecondary,
                                border: `1px solid ${tab === value ? COLORS.accent : COLORS.border}`,
                            }}
                        >
                            {label}
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {filtered.length === 0 && (
                        <Typography sx={{ fontSize: 12.5, color: COLORS.textTertiary, textAlign: 'center', py: 2 }}>
                            할 일이 없습니다
                        </Typography>
                    )}
                    {filtered.map((todo) => {
                        const due = dueTag(todo.date, todo.completed);
                        const priority = (todo.priority || 'LOW') as TodoPriority;
                        return (
                            <Box
                                key={todo.id}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.5, p: '11px 12px',
                                    border: `1px solid ${COLORS.border}`, borderRadius: '10px', bgcolor: COLORS.surface,
                                    opacity: todo.completed ? 0.5 : 1,
                                }}
                            >
                                <Box sx={{ width: 6, height: 20, borderRadius: '4px', flexShrink: 0, bgcolor: PRIORITY_COLOR[priority] }} />
                                <Box
                                    onClick={() => toggleComplete(todo)}
                                    sx={{
                                        width: 18, height: 18, borderRadius: '6px', flexShrink: 0, cursor: 'pointer',
                                        border: `1.5px solid ${todo.completed ? COLORS.accent : COLORS.textTertiary}`,
                                        bgcolor: todo.completed ? COLORS.accent : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                    }}
                                >
                                    {todo.completed && <CheckIcon sx={{ fontSize: 13 }} />}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{
                                        fontSize: 13.5, fontWeight: 600, color: COLORS.textPrimary,
                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                    }}>
                                        {todo.text}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.375 }}>
                                        {todo.category && (
                                            <Box component="span" sx={{
                                                fontSize: 10.5, fontWeight: 700, px: 0.875, py: '2px', borderRadius: '5px',
                                                bgcolor: COLORS.accentSoft, color: COLORS.accent,
                                            }}>
                                                {todo.category}
                                            </Box>
                                        )}
                                        {due && (
                                            <Box component="span" sx={{
                                                fontSize: 10.5, fontWeight: 600,
                                                color: due.overdue ? '#B3403B' : COLORS.textTertiary,
                                            }}>
                                                {due.text}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
            )}
        </Box>
    );
}
