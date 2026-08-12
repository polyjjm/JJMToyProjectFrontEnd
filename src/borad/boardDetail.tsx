import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { post } from "../common/common";

interface boardType {
  board_no: number;
  board_title: string;
  board_writer: string;
  board_userName: string;
  board_content: string | TrustedHTML;
  board_hit: string;
  board_like: string;
  board_hate: string;
  board_date: string;
  board_hashTag: string;
}

export default function BoardDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const boardList: boardType | undefined = location.state?.boardList;

  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  if (!boardList) {
    return null;
  }

  const hashList = boardList.board_hashTag?.split(",") || [];

  const canEdit = boardList.board_userName === localStorage.getItem("user_email");

  const handleDelete = async (confirm: boolean) => {
    if (confirm) {
      const result = await post("/board/delete", { board_no: boardList.board_no });
      if (!result) {
        alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setDeleteOpen(false);
        return;
      }
      navigate(-1);
    }
    setDeleteOpen(false);
  };

  const handleUpdate = (confirm: boolean) => {
    if (confirm) {
      navigate("/board/boardUpdate", { state: { boardList } });
    }
    setUpdateOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: "1200px", mx: "auto" }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, bgcolor: "#fefefe",minHeight:'900px' }}>
        {/* Title & Buttons */}
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} mb={3}>
          <Typography variant="h4" fontWeight="bold" sx={{ wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: boardList.board_title }} />
          {canEdit && (
            <Box mt={isMobile ? 2 : 0} display="flex" gap={1}>
                <Button
                    onClick={() => setUpdateOpen(true)}
                    sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 3,
                    fontWeight: 600,
                    backgroundColor: '#F5A623',
                    color: '#fff',
                    '&:hover': {
                        backgroundColor: '#d48806',
                    },
                    }}
                >
                    ✏️ 수정
                </Button>

                <Button
                    onClick={() => setDeleteOpen(true)}
                    sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 3,
                    fontWeight: 600,
                    backgroundColor: '#FF4D4F',
                    color: '#fff',
                    '&:hover': {
                        backgroundColor: '#d9363e',
                    },
                    }}
                >
                    🗑️ 삭제
                </Button>
            </Box>
          )}
        </Box>

        {/* HashTags */}
        <Box mb={3} display="flex" flexWrap="wrap" gap={1}>
          {hashList.map((tag) => (
            <Chip key={tag} label={`${tag}`} color="warning" sx={{ fontWeight: 600 }} />
          ))}
        </Box>

        {/* Metadata */}
        <Box display="flex" justifyContent="space-between" sx={{ mb: 2, borderBottom: '1px solid #ccc', pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            작성일: {boardList.board_date?.substring(0, 10)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            작성자: {boardList.board_writer}
          </Typography>
        </Box>

        {/* Content */}
        <Box>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: boardList.board_content }} />
        </Box>
      </Paper>

      {/* 삭제 확인 */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>정말로 삭제하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleDelete(true)}>삭제</Button>
          <Button onClick={() => handleDelete(false)}>취소</Button>
        </DialogActions>
      </Dialog>

      {/* 수정 확인 */}
      <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)}>
        <DialogTitle>수정하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleUpdate(true)}>수정</Button>
          <Button onClick={() => handleUpdate(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
