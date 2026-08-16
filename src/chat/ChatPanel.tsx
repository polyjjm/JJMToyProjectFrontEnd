import { useEffect, useMemo, useState } from "react";
import { Box, Button, Checkbox, Drawer, IconButton, InputBase, Modal, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { post } from "../common/common";
import { COLORS } from "../theme";

// Room shape returned by POST /api/chat/rooms (see ChatRoomDto.java) - the room list is now
// backend-driven (unread count, last-message preview/type, opponent/group display name) instead
// of the old client-only "hasNewMessage" flag that reset on every page reload.
interface ChatRoom {
    room_id: number;
    is_group: boolean;
    room_name: string | null;
    lastMessage: string | null;
    lastMessageTime: string | null;
    messageType: string | null; // 'TEXT' | 'IMAGE'
    lastMessageSenderId: string | null;
    unreadCount: number;
    opponentName: string | null; // 1:1 only
    memberCount: number;
}

interface ChatUser {
    user_id: string;
    user_name: string;
    user_email: string;
}

type Tab = 'all' | '1:1' | 'group';

const POPUP_FEATURES = 'width=400,height=640,resizable=yes,scrollbars=yes';

// "오후 6:03" for today, "어제" for yesterday, "8월 13일" otherwise - matches chat-mockup.html's
// room-time treatment without pulling in a date-formatting library for one field.
function formatRoomTime(iso: string | null): string {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        const hours = date.getHours();
        const ampm = hours < 12 ? '오전' : '오후';
        const h12 = hours % 12 === 0 ? 12 : hours % 12;
        return `${ampm} ${h12}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    if (isYesterday) return '어제';
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function roomDisplayName(room: ChatRoom): string {
    if (!room.is_group) return room.opponentName || '(알 수 없음)';
    return room.room_name || `그룹채팅 (${room.memberCount}명)`;
}

function roomPreviewText(room: ChatRoom): string {
    if (room.messageType === 'IMAGE') return '(이미지)';
    return room.lastMessage || '대화를 시작해보세요';
}

interface ChatPanelProps {
    open: boolean;
    onClose: () => void;
    // Called whenever a room might have gone from unread to read (opening a room) or a new
    // room was created, so appShell.tsx can refresh the header bell's total count.
    onRoomsChanged: () => void;
}

export default function ChatPanel({ open, onClose, onRoomsChanged }: ChatPanelProps) {
    const currentUser = localStorage.getItem('user_id');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [searchText, setSearchText] = useState('');
    const [tab, setTab] = useState<Tab>('all');

    const [createOpen, setCreateOpen] = useState(false);
    const [userList, setUserList] = useState<ChatUser[]>([]);
    const [checkedList, setCheckedList] = useState<boolean[]>([]);

    const loadRooms = async () => {
        if (!currentUser) return;
        const result = await post('/api/chat/rooms', { userId: currentUser });
        if (result) setRooms(result);
    };

    // Re-fetch every time the panel opens - simplest way to pick up messages that arrived while
    // it was closed, without standing up a separate "unread changed" WebSocket topic (see
    // appShell.tsx's polling for the bell badge, same reasoning).
    useEffect(() => {
        if (open) loadRooms();
    }, [open]);

    const filteredRooms = useMemo(() => {
        return rooms
            .filter((r) => tab === 'all' || (tab === '1:1' && !r.is_group) || (tab === 'group' && r.is_group))
            .filter((r) => !searchText || roomDisplayName(r).toLowerCase().includes(searchText.toLowerCase()));
    }, [rooms, tab, searchText]);

    const openRoom = (roomId: number) => {
        window.open(`/chat/popup/${roomId}`, `chat_room_${roomId}`, POPUP_FEATURES);
        // The popup marks messages read on its own (see chatController.getHistory) - refresh
        // shortly after so this room's unread badge/preview catch up. A fixed delay is a
        // simplification (no cross-window "I've read this" signal exists today) that's good
        // enough for a single-user site opening rooms one at a time.
        setTimeout(() => {
            loadRooms();
            onRoomsChanged();
        }, 1500);
    };

    const openCreateModal = async () => {
        setCreateOpen(true);
        const users = await post('/member/userList', {});
        if (!users) {
            alert('유저 목록을 불러오지 못했습니다.');
            setCreateOpen(false);
            return;
        }
        setUserList(users);
        setCheckedList(users.map(() => false));
    };

    const toggleUser = (index: number) => {
        setCheckedList((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    const createRoom = async () => {
        const selected = userList.filter((_, i) => checkedList[i]).map((u) => u.user_id);
        if (selected.length === 0) {
            alert('대화 상대를 선택해주세요.');
            return;
        }
        const isGroup = selected.length > 1;
        const memberIds = [...selected, currentUser];   // 본인 추가
        const roomId = await post('/api/chat/createRoom', { memberIds, isGroup });
        setCreateOpen(false);
        if (roomId) {
            await loadRooms();
            openRoom(roomId);
        }
    };

    return (
        <>
            <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 380 } } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: COLORS.surface }}>
                    <Box sx={{ p: '18px 20px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>채팅</Typography>
                            <IconButton size="small" onClick={onClose} sx={{ color: COLORS.textTertiary }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, bgcolor: COLORS.bg,
                            border: `1px solid ${COLORS.border}`, borderRadius: '10px', px: 1.5, py: 1.125, mb: 1.5,
                        }}>
                            <SearchIcon sx={{ fontSize: 16, color: COLORS.textTertiary }} />
                            <InputBase
                                placeholder="이름, 대화 검색"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                sx={{ fontSize: 13, width: '100%' }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                            {([['all', '전체'], ['1:1', '1:1'], ['group', '그룹']] as [Tab, string][]).map(([value, label]) => (
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
                    </Box>

                    <Button
                        onClick={openCreateModal}
                        startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                        sx={{
                            m: '14px 20px 4px', bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px',
                            fontSize: 12.5, py: 1.125, '&:hover': { bgcolor: '#211F1B' },
                        }}
                    >
                        새 채팅
                    </Button>

                    <Box sx={{ flex: 1, overflowY: 'auto', p: '6px 10px 16px' }}>
                        {filteredRooms.length === 0 && (
                            <Typography sx={{ textAlign: 'center', fontSize: 13, color: COLORS.textTertiary, mt: 4 }}>
                                대화방이 없습니다
                            </Typography>
                        )}
                        {filteredRooms.map((room) => {
                            const unread = room.unreadCount > 0;
                            return (
                                <Box
                                    key={room.room_id}
                                    onClick={() => openRoom(room.room_id)}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1.5, p: '11px 10px', borderRadius: '12px',
                                        cursor: 'pointer', bgcolor: unread ? COLORS.accentSoft : 'transparent',
                                        '&:hover': { bgcolor: unread ? COLORS.accentSoft : COLORS.bg },
                                    }}
                                >
                                    <Box sx={{
                                        width: 42, height: 42, flexShrink: 0, bgcolor: COLORS.accent, color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 700,
                                        borderRadius: room.is_group ? '12px' : '50%',
                                    }}>
                                        {roomDisplayName(room).slice(0, 2)}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography sx={{ fontSize: 13.5, fontWeight: unread ? 800 : 700, color: COLORS.textPrimary }} noWrap>
                                                {roomDisplayName(room)}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: COLORS.textTertiary, flexShrink: 0, ml: 1 }}>
                                                {formatRoomTime(room.lastMessageTime)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.25 }}>
                                            <Typography sx={{
                                                fontSize: 12, color: unread ? COLORS.textPrimary : COLORS.textSecondary,
                                                fontWeight: unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap', maxWidth: 220,
                                            }}>
                                                {roomPreviewText(room)}
                                            </Typography>
                                            {unread && (
                                                <Box sx={{
                                                    minWidth: 18, height: 18, borderRadius: '999px', bgcolor: '#B3403B', color: '#fff',
                                                    fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', px: 0.625, flexShrink: 0,
                                                }}>
                                                    {room.unreadCount}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Drawer>

            {/* Create-room modal - moved here from the retired chatMain.tsx page; same
                /member/userList + /api/chat/createRoom flow, just reachable from the panel now. */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 420 }, maxHeight: '80vh', overflowY: 'auto',
                    bgcolor: COLORS.surface, borderRadius: '14px', p: 3, boxShadow: 24,
                }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2, color: COLORS.textPrimary }}>새 채팅 상대 선택</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 320, overflowY: 'auto', mb: 2 }}>
                        {userList.map((u, i) => (
                            <Box
                                key={u.user_id}
                                onClick={() => toggleUser(i)}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: '8px',
                                    cursor: 'pointer', '&:hover': { bgcolor: COLORS.bg },
                                }}
                            >
                                <Checkbox checked={!!checkedList[i]} size="small" />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: COLORS.textPrimary }} noWrap>{u.user_name}</Typography>
                                    <Typography sx={{ fontSize: 11.5, color: COLORS.textTertiary }} noWrap>{u.user_email}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    <Button
                        fullWidth
                        onClick={createRoom}
                        sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '10px', py: 1.25, '&:hover': { bgcolor: '#211F1B' } }}
                    >
                        채팅 시작
                    </Button>
                </Box>
            </Modal>
        </>
    );
}
