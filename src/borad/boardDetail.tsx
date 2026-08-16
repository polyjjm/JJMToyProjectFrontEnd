import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  TextField,
  Skeleton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { post, get, apiOrigin } from "../common/common";
import LoadingButton from "../common/LoadingButton";
import ConfirmDialog from "../common/ConfirmDialog";
import { COLORS } from "../theme";
import { BoardPost } from "./board.types";

interface CommentItem {
  comment_no: number;
  board_no: number;
  comment_userName: string;
  comment_content: string;
  comment_date: string;
}

export default function BoardDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const boardList: BoardPost | undefined = location.state?.boardList;

  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const currentUser = localStorage.getItem('user_email');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!boardList) {
      navigate("/board", { replace: true });
    }
  }, [boardList, navigate]);

  useEffect(() => {
    if (boardList) {
      post("/board/view", { board_no: boardList.board_no });
    }
  }, [boardList]);

  const loadComments = async () => {
    if (!boardList) return;
    setCommentsLoading(true);
    try {
      const result = await get(apiOrigin + '/board/comment/list', { board_no: boardList.board_no });
      if (result) setComments(result);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [boardList?.board_no]);

  if (!boardList) {
    return null;
  }

  // 대/중/소 breadcrumb - only the levels that actually have a value are shown, since a post
  // can be categorized as deep or as shallow as the author chose when writing it.
  const categoryPath = [boardList.board_categoryMain, boardList.board_categoryMid, boardList.board_categorySub]
    .filter(Boolean)
    .join(' › ');

  const canEdit = boardList.board_userName === localStorage.getItem("user_email");

  const handleDelete = async (confirm: boolean) => {
    if (confirm) {
      setDeleting(true);
      const result = await post("/board/delete", { board_no: boardList.board_no });
      if (!result) {
        alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setDeleting(false);
        setDeleteOpen(false);
        return;
      }
      navigate(-1);
      return;
    }
    setDeleteOpen(false);
  };

  const handleUpdate = (confirm: boolean) => {
    if (confirm) {
      navigate("/board/boardUpdate", { state: { boardList } });
    }
    setUpdateOpen(false);
  };

  const submitComment = async () => {
    const content = commentText.trim();
    if (!content) return;
    if (!currentUser) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    // comment_userName is intentionally NOT sent - the backend derives it from the JWT so a
    // comment can never be posted "as" someone else (see boardCommentServiceImpl).
    setCommentSubmitting(true);
    try {
      const result = await post('/board/comment/insert', {
        board_no: boardList.board_no,
        comment_content: content,
      });
      if (!result) {
        alert('댓글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      setCommentText('');
      await loadComments();
    } finally {
      setCommentSubmitting(false);
    }
  };

  const deleteComment = async (comment_no: number) => {
    const result = await post('/board/comment/delete', { comment_no });
    if (!result) {
      alert('댓글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    loadComments();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: "1200px", mx: "auto" }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '10px', border: `1px solid ${COLORS.border}`, bgcolor: COLORS.surface, minHeight: '900px' }}>
        {/* Title & Buttons */}
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} mb={3}>
          <Typography variant="h4" fontWeight="bold" sx={{ wordBreak: "break-word", color: COLORS.textPrimary }} dangerouslySetInnerHTML={{ __html: boardList.board_title }} />
          {canEdit && (
            <Box mt={isMobile ? 2 : 0} display="flex" gap={1}>
                <Button
                    onClick={() => setUpdateOpen(true)}
                    sx={{
                    px: 3,
                    py: 1,
                    borderRadius: '10px',
                    fontWeight: 600,
                    backgroundColor: COLORS.accent,
                    color: '#fff',
                    '&:hover': {
                        backgroundColor: '#211F1B',
                    },
                    }}
                >
                    수정
                </Button>

                <Button
                    onClick={() => setDeleteOpen(true)}
                    sx={{
                    px: 3,
                    py: 1,
                    borderRadius: '10px',
                    fontWeight: 600,
                    backgroundColor: COLORS.bg,
                    color: '#B3261E',
                    border: `1px solid ${COLORS.border}`,
                    '&:hover': {
                        backgroundColor: '#F4E4E2',
                    },
                    }}
                >
                    삭제
                </Button>
            </Box>
          )}
        </Box>

        {/* 3-tier category breadcrumb, replaces the old hashtag chip row */}
        {categoryPath && (
          <Box mb={3}>
            <Box component="span" sx={{
              fontSize: 12, fontWeight: 700, color: COLORS.accent, bgcolor: COLORS.accentSoft,
              px: 1.25, py: '4px', borderRadius: '999px',
            }}>
              {categoryPath}
            </Box>
          </Box>
        )}

        {/* Metadata */}
        <Box display="flex" justifyContent="space-between" sx={{ mb: 2, borderBottom: `1px solid ${COLORS.border}`, pb: 1 }}>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            작성일: {boardList.board_date?.substring(0, 10)}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            작성자: {boardList.board_writer}
          </Typography>
        </Box>

        {/* Content */}
        <Box>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8, color: COLORS.textPrimary }} dangerouslySetInnerHTML={{ __html: boardList.board_content }} />
        </Box>

        {/* Comments - deliberately minimal: flat list, no nested replies/editing/likes */}
        <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${COLORS.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2, color: COLORS.textPrimary }}>
            댓글 {comments.length}
          </Typography>

          {commentsLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {[0, 1].map((i) => (
                <Skeleton key={i} variant="rounded" animation="wave" height={54} sx={{ borderRadius: '8px' }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {comments.map((c) => (
                <Box key={c.comment_no} sx={{ p: 1.5, borderRadius: '8px', bgcolor: COLORS.bg }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary }}>{c.comment_userName}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: 11, color: COLORS.textTertiary }}>{c.comment_date?.substring(0, 16).replace('T', ' ')}</Typography>
                      {c.comment_userName === currentUser && (
                        <Button size="small" onClick={() => deleteComment(c.comment_no)} sx={{ minWidth: 0, p: 0, fontSize: 11, color: COLORS.textTertiary, '&:hover': { color: '#B3261E', background: 'none' } }}>
                          삭제
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 13.5, color: COLORS.textPrimary, mt: 0.5, whiteSpace: 'pre-wrap' }}>{c.comment_content}</Typography>
                </Box>
              ))}
              {comments.length === 0 && (
                <Typography sx={{ fontSize: 13, color: COLORS.textTertiary }}>아직 댓글이 없습니다.</Typography>
              )}
            </Box>
          )}

          {currentUser ? (
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="댓글을 입력하세요"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyUp={(e) => { if (e.key === 'Enter') submitComment(); }}
                inputProps={{ maxLength: 500 }}
                disabled={commentSubmitting}
              />
              <LoadingButton
                onClick={submitComment}
                loading={commentSubmitting}
                sx={{ bgcolor: COLORS.accent, color: '#fff', px: 3, borderRadius: '10px', flexShrink: 0, '&:hover': { bgcolor: '#211F1B' } }}
              >
                등록
              </LoadingButton>
            </Box>
          ) : (
            <Typography sx={{ fontSize: 13, color: COLORS.textSecondary }}>댓글을 작성하려면 로그인이 필요합니다.</Typography>
          )}
        </Box>
      </Paper>

      <ConfirmDialog
        open={deleteOpen}
        variant="delete"
        title="정말로 삭제하시겠습니까?"
        confirmLabel="삭제"
        loading={deleting}
        loadingText="삭제 중..."
        onConfirm={() => handleDelete(true)}
        onCancel={() => handleDelete(false)}
      />

      <ConfirmDialog
        open={updateOpen}
        variant="edit"
        title="수정하시겠습니까?"
        confirmLabel="수정"
        onConfirm={() => handleUpdate(true)}
        onCancel={() => handleUpdate(false)}
      />
    </Box>
  );
}
