import { useMemo, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TodoItem } from '../toDoList/todo';
import { COLORS } from '../theme';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// Local (not UTC) YYYY-MM-DD, matching todo.date's shape - toISOString() would shift near
// midnight in a UTC+9 timezone, which matters here since this drives both the "today" highlight
// and the date-key lookup into todosByDate.
function toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Standard Sun-first month grid, padded with null cells so every week row has exactly 7 slots
// (leading blanks before day 1, trailing blanks after the last day of the month).
function buildMonthGrid(year: number, month: number): (Date | null)[][] {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}

interface TodoCalendarProps {
    todos: TodoItem[];
    // Same handler TodoWidget.tsx's list view uses for its checkbox click - the detail panel
    // row below reuses it verbatim so clicking a todo here does exactly what clicking it does
    // in the list view (toggle complete), not a new interaction.
    onToggle: (todo: TodoItem) => void;
}

// Calendar view for the dashboard todo widget (see TodoWidget.tsx) - shown alongside, not
// instead of, the list view via a 목록/캘린더 toggle. Groups the same already-fetched todos by
// their existing `date` field entirely client-side - no new endpoint, no change to
// todoService.ts's shape.
export default function TodoCalendar({ todos, onToggle }: TodoCalendarProps) {
    const todayStr = useMemo(() => toDateStr(new Date()), []);
    const [monthCursor, setMonthCursor] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);

    const todosByDate = useMemo(() => {
        const map: Record<string, TodoItem[]> = {};
        for (const todo of todos) {
            if (!todo.date) continue;
            if (!map[todo.date]) map[todo.date] = [];
            map[todo.date].push(todo);
        }
        return map;
    }, [todos]);

    const weeks = useMemo(
        () => buildMonthGrid(monthCursor.getFullYear(), monthCursor.getMonth()),
        [monthCursor]
    );

    const shiftMonth = (delta: number) => {
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const selectedTodos = todosByDate[selectedDate] || [];
    const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <IconButton size="small" onClick={() => shiftMonth(-1)} sx={{ color: COLORS.textSecondary, p: 0.375 }}>
                    <ChevronLeftIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>
                    {monthCursor.getFullYear()}년 {monthCursor.getMonth() + 1}월
                </Typography>
                <IconButton size="small" onClick={() => shiftMonth(1)} sx={{ color: COLORS.textSecondary, p: 0.375 }}>
                    <ChevronRightIcon sx={{ fontSize: 15 }} />
                </IconButton>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.25 }}>
                {WEEKDAY_LABELS.map((label) => (
                    <Typography key={label} sx={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: COLORS.textTertiary, py: 0.125, lineHeight: 1.4 }}>
                        {label}
                    </Typography>
                ))}
            </Box>

            {weeks.map((week, wi) => (
                <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25, mb: 0.25 }}>
                    {week.map((date, di) => {
                        if (!date) return <Box key={di} />;
                        const dateStr = toDateStr(date);
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedDate;
                        const hasTodos = !!todosByDate[dateStr]?.length;
                        return (
                            <Box
                                key={di}
                                onClick={() => setSelectedDate(dateStr)}
                                sx={{
                                    height: 22, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', gap: 0.125, borderRadius: '6px', cursor: 'pointer',
                                    bgcolor: isToday ? COLORS.accent : isSelected ? COLORS.accentSoft : 'transparent',
                                    border: `1px solid ${isSelected && !isToday ? COLORS.accent : 'transparent'}`,
                                    '&:hover': { bgcolor: isToday ? COLORS.accent : COLORS.bg },
                                }}
                            >
                                <Typography sx={{
                                    fontSize: 10.5, fontWeight: isToday ? 700 : 500, lineHeight: 1,
                                    color: isToday ? '#fff' : COLORS.textPrimary,
                                }}>
                                    {date.getDate()}
                                </Typography>
                                <Box sx={{
                                    width: 3, height: 3, borderRadius: '50%',
                                    bgcolor: hasTodos ? (isToday ? '#fff' : COLORS.accent) : 'transparent',
                                }} />
                            </Box>
                        );
                    })}
                </Box>
            ))}

            <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary, mb: 0.75 }}>
                    {selMonth}월 {selDay}일 · {selectedTodos.length}개
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.375 }}>
                    {selectedTodos.length === 0 && (
                        <Typography sx={{ fontSize: 12, color: COLORS.textTertiary, textAlign: 'center', py: 1 }}>
                            할 일이 없습니다
                        </Typography>
                    )}
                    {selectedTodos.map((todo) => (
                        <Box
                            key={todo.id}
                            onClick={() => onToggle(todo)}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 0.875, py: 0.375, cursor: 'pointer',
                                opacity: todo.completed ? 0.5 : 1,
                            }}
                        >
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: COLORS.accent, flexShrink: 0 }} />
                            <Typography sx={{
                                fontSize: 12.5, color: COLORS.textPrimary,
                                textDecoration: todo.completed ? 'line-through' : 'none',
                            }}>
                                {todo.text}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
