import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MdEditor from "../common/mdEditor";
import LoadingButton from "../common/LoadingButton";
import SuccessSnackbar from "../common/SuccessSnackbar";
import ConfirmDialog from "../common/ConfirmDialog";
import { postUpload } from "../common/common";
import { COLORS } from "../theme";
import { BoardFormState } from "./board.types";
import { CategoryRow, FieldLabel, fieldSx, formCardSx } from "./boardFormShared";

export default function boardInsert(){
    const navigate = useNavigate();
    const [textValue, setText] = useState(String);
    const [flagIndex, flagIndexSet] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [boardList, setBoard] = useState<BoardFormState>({
        board_title: '',
        board_content: '',
        board_userName: '', // 이건 string이지만 string | null 타입과 호환됨
        board_categoryMain: '',
        board_categoryMid: '',
        board_categorySub: '',
        boardImgList: [],
        boardImgLegacyList: [],
    });

    const [uploadFiles , setFiles] = useState<FormData>(new FormData);

    // Reachable directly by URL, not just through board.tsx's "새 글 작성" button - that button
    // already checks for a token before navigating here, so this mirrors the same guard for
    // anyone who lands on this route without one. The actual enforcement is server-side
    // (securityConfig requires auth on /board/subMit); this just avoids showing a write form
    // that's guaranteed to fail on submit.
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/signin', { replace: true });
        }
    }, [navigate]);

    const changeTitle = (e:any) =>{
        const {value}  =e.target
        setBoard({...boardList , board_title : value});
    }

    // 대/중/소 각각 자유 텍스트 입력 - 프리셋 목록에서 고르는 게 아니라 사용자가 직접 입력한다.
    const changeCategory = (level: 'board_categoryMain' | 'board_categoryMid' | 'board_categorySub') => (e:any) => {
        setBoard({...boardList , [level] : e.target.value});
    }

    const eidtorValue = (e:any) =>{
        setText(e);
        setBoard({...boardList , board_content :  e})
    }

    // Runs validation up front so an incomplete form never gets a confirmation prompt for a
    // submit that's guaranteed to fail - the dialog only opens once title/content are present.
    const openConfirm = () => {
        if(!boardList.board_title){
            alert('제목을 입력해주세요');
            return;
        }

        if(!boardList.board_content){
            alert('내용을 입력해주세요');
            return;
        }

        setConfirmOpen(true);
    }

    // Same (confirm: boolean) shape as boardDetail.tsx's handleDelete - cancel just closes the
    // dialog with no side effects, the actual submit only runs once confirmed.
    const subMit = async (confirm: boolean) =>{
        if (!confirm) {
            setConfirmOpen(false);
            return;
        }

        setSubmitting(true);

        let reg = new RegExp(/<img[^>]+src=[\"']?([^>\"']+)[\"']?[^>]*>/, "g");

        const boardImg = boardList.board_content.match(reg);
        boardList.boardImgList = [];
        if(boardImg !== null){
            for(let i = 0 ; i < boardImg.length;i++){
                reg  = new RegExp(/src=".*?"/, "g");
                let srcValue = boardList.board_content.match(reg)
                if(srcValue){
                    boardList.boardImgList.push({idx: i , value : srcValue[0]});
                }

            }

        }
        uploadFiles.append('data' , new Blob([JSON.stringify(boardList)] , { type: "application/json"}));

        const result = await postUpload('/board/subMit' , uploadFiles);

        if(!result){
            alert('게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setSubmitting(false);
            setConfirmOpen(false);
            return;
        }

        // Only clear the unsaved-changes guard once we actually have a saved post - previously
        // this was set unconditionally at the top of subMit, so a failed validation check (empty
        // title/content) silently disarmed the beforeunload warning even though nothing was saved.
        flagIndexSet(1);
        setConfirmOpen(false);

        // Show the success toast before navigating - window.location.href below is a full page
        // reload (kept as-is so /board's initial fetch picks up the new post), which would wipe
        // the Snackbar instantly if fired in the same tick. The short delay is just long enough
        // for the confirmation to register before the page unloads.
        setShowSuccess(true);
        setTimeout(() => {
            window.location.href = '/board';
        }, 1100);
    }


    const preventClose =  (e:BeforeUnloadEvent) => {

        if(flagIndex == 0){
            e.preventDefault();
            e.returnValue = ""; // chrome에서는 설정이 필요해서 넣은 코드
        }

    }

    useEffect(() => {
        (() => {
            window.addEventListener("beforeunload", preventClose);
        })();
        return () => {
            window.removeEventListener("beforeunload", preventClose);
        };
    },[flagIndex]);

    return (
        <Box sx={{ mx: 'auto', maxWidth: 920, px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>

            <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
                <Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 700, letterSpacing: '-0.3px', mb: 0.75, color: COLORS.textPrimary }}>
                    게시글 등록
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                    자유롭게 기록하고 대/중/소 카테고리로 정리하세요.
                </Typography>
            </Box>

            <Box sx={formCardSx}>
                <Box sx={{ mb: 3 }}>
                    <FieldLabel>제목</FieldLabel>
                    <TextField
                        sx={{ ...fieldSx, '& .MuiOutlinedInput-input': { fontSize: 18, fontWeight: 700, py: '14px' } }}
                        placeholder="제목을 입력해주세요"
                        value={boardList.board_title}
                        onChange={changeTitle}
                        inputProps={{ maxLength: 50 }}
                    />
                </Box>

                {/* No separate thumbnail field - the card image is always the first image
                    embedded in the content below (board_imgList[0]), so a standalone thumbnail
                    input would just be a second, easily-out-of-sync source for the same thing. */}
                <Box>
                    <FieldLabel>카테고리</FieldLabel>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 420 }}>
                        <CategoryRow
                            label="대"
                            placeholder="예: 개발"
                            value={boardList.board_categoryMain}
                            onChange={changeCategory('board_categoryMain')}
                            inputProps={{ maxLength: 50 }}
                        />
                        <CategoryRow
                            label="중"
                            placeholder="예: Frontend"
                            value={boardList.board_categoryMid}
                            onChange={changeCategory('board_categoryMid')}
                            inputProps={{ maxLength: 50 }}
                        />
                        <CategoryRow
                            label="소"
                            placeholder="예: React"
                            value={boardList.board_categorySub}
                            onChange={changeCategory('board_categorySub')}
                            inputProps={{ maxLength: 50 }}
                        />
                    </Box>
                </Box>
            </Box>

            <Box sx={formCardSx}>
                <FieldLabel>내용</FieldLabel>
                <MdEditor
                    value={textValue}
                    onChange={eidtorValue}
                    boardList={boardList}
                    onImgListChange={(list) => setBoard((prev) => ({ ...prev, boardImgLegacyList: list }))}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25, mt: 0.5 }}>
                <LoadingButton
                    variant="outlined"
                    disabled={submitting}
                    sx={{ borderColor: COLORS.border, color: COLORS.textSecondary, borderRadius: '10px', px: 2.75, py: 1.25 }}
                    onClick={() => { window.history.back(); }}
                >
                    취소
                </LoadingButton>
                <LoadingButton
                    variant="contained"
                    loading={submitting}
                    loadingText="등록 중..."
                    sx={{ bgcolor: COLORS.accent, borderRadius: '10px', px: 2.75, py: 1.25, boxShadow: '0 1px 2px rgba(38,34,28,0.12)', '&:hover': { bgcolor: '#211F1B' } }}
                    onClick={openConfirm}
                >
                    등록
                </LoadingButton>
            </Box>

            <ConfirmDialog
                open={confirmOpen}
                variant="edit"
                title="게시글을 등록할까요?"
                description="등록 후 게시판 목록에서 바로 확인할 수 있어요."
                confirmLabel="등록하기"
                loading={submitting}
                loadingText="등록 중..."
                onConfirm={() => subMit(true)}
                onCancel={() => subMit(false)}
            />

            <SuccessSnackbar open={showSuccess} message="등록완료 했습니다" onClose={() => setShowSuccess(false)} />
        </Box>
    )
}
