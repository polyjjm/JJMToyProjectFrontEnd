import { Box, CircularProgress, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MDEditor from '@uiw/react-md-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useCallback, useRef, useState } from 'react';
import { postUpload } from "./common";
import { COLORS } from "../theme";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  boardList: {
    boardImgLegacyList: { idx: number; value: string }[];
  };
  // Called with the full replacement array whenever an image is added/removed - the parent
  // (boardInsert.tsx/boardUpdate.tsx) owns boardList as React state, so this component must
  // never mutate boardList.boardImgLegacyList in place (that doesn't trigger a re-render, and
  // silently drops updates when it races with an onChange to board_content around the same
  // time - see this file's git history for the bug that caused).
  onImgListChange: (list: { idx: number; value: string }[]) => void;
}

// boardImgLegacyList entries come from two different places that don't agree on wrapping:
// handleImageUpload below pushes "src=\"<url>" (leading wrapper only), while boardInsert.tsx/
// boardUpdate.tsx's regex-extraction of *existing* content captures the full `src="..."` match
// including the closing quote. Stripping only the leading wrapper (the old behavior) left a
// stray trailing `"` glued onto legacy entries' URLs - breaking their file-chip thumbnail
// (invalid <img src>), their filename label, and removeImage's regex match. This strips both.
function stripSrcWrapper(rawValue: string): string {
  return rawValue.replace(/^src="/, '').replace(/"$/, '');
}

// Pulls a human-readable file name out of an uploaded S3 URL (shape:
// ".../<uuid>@originalFileName.ext") for the file-chip label. Values are stored already
// decoded (see handleImageUpload) - both fresh-upload and legacy-extracted entries hit this
// as a plain decoded URL, so no decodeURIComponent needed here.
function fileNameFromLegacyValue(rawValue: string): string {
  const url = stripSrcWrapper(rawValue);
  const last = url.split('/').pop() || url;
  const afterAt = last.includes('@') ? last.split('@').slice(1).join('@') : last;
  return afterAt || '이미지';
}

export default function mdEditor({ value, onChange, boardList, onImgListChange }: MarkdownEditorProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  let data = new FormData();
  let fileLength = 0;

  let imageName = '';
  let loadingText = '';
  let insertMarkdown: any;

  const handlePasteOrDrop = async (dataTransfer: DataTransfer) => {
    fileLength = dataTransfer.files.length;
    const files = dataTransfer.files;
    if (!files || !files.length) return;

    imageName = files.item(0)?.name || '이미지.png';
    loadingText = `<!-- Uploading "${imageName}"... -->`;

    insertMarkdown = insertToTextArea(loadingText);

    for (let i = 0; i < files.length; i++) {
      let image = files.item(i) as File;
      await handleImageUpload(image, i + 1);
    }
  };

  const handleImageUpload = async (image: File, length: number) => {
    if (!insertMarkdown) return;

    const updatedMarkdown = insertToTextArea(loadingText);
    await onChange(updatedMarkdown);

    data.append('upload', image);

    if (fileLength !== length) {
      return;
    }

    const path = await postUpload('/common/imageUpload', data);
    let finalMarkdownText = '';

    // Built fresh rather than mutating boardList.boardImgLegacyList in place - see
    // onImgListChange's doc comment. Decoded at push time (not at removeImage time) so this
    // matches exactly what ends up in the <img> tag below - decoding at removal time instead
    // used to leave a stale, still-encoded value in the list that removeImage's regex could
    // never match against the (decoded) textarea content for images uploaded this session.
    const existingList = boardList.boardImgLegacyList || [];
    const newEntries = path.map((p: string, i: number) => ({
      idx: existingList.length + i,
      value: "src=\"" + decodeURIComponent(p),
    }));

    for (let i = 0; i < path.length; i++) {
      const imgTag = `<img src="${decodeURIComponent(path[i])}" alt="업로드된 이미지" />`;
      finalMarkdownText += imgTag + '\n';
    }

    onImgListChange([...existingList, ...newEntries]);

    const finalMarkdown = updatedMarkdown.replace(loadingText, finalMarkdownText);
    await onChange(finalMarkdown);
  };

  const useUpload = () => {
    const [file, setFile] = useState<File | null>(null);

    const upload = useCallback((callback: (file: File | null) => void) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = () => {
        if (!input.files || input.files.length === 0) return;

        const selectedFile = input.files[0];

        setFile(selectedFile);
        callback(selectedFile);
      };

      input.click();
    }, []);

    return { upload, file };
  };

  const insertToTextArea = (text: string): string => {
    const updatedSentence = `${value}\n${text}`;
    return updatedSentence;
  };

  const { upload } = useUpload();

  const handleUpload = async () => {
    upload(async (file) => {
      if (!file) return;

      imageName = file?.name || '이미지.png';
      loadingText = `<!-- Uploading "${imageName}"... -->`;
      insertMarkdown = insertToTextArea(loadingText);
      fileLength = 1;

      setIsImageLoading(true);
      await handleImageUpload(file, 1);
      setIsImageLoading(false);
    });
  };

  // Removes one uploaded image from both the markdown source (the <img> tag) and the
  // boardImgLegacyList tracking array. Doesn't touch the upload mechanism or hit the server -
  // the file itself gets cleaned up on submit the same way any other dropped-then-undone image
  // does today (boardServiceImpl diffs boardImgLegacyList against the final content and deletes
  // whatever's no longer referenced).
  const removeImage = (entry: { idx: number; value: string }) => {
    // Already decoded at push time (both fresh uploads and boardUpdate.tsx's regex-extraction
    // of existing content store plain decoded URLs) - no decodeURIComponent needed here, just
    // strip the src="..." wrapper to match the raw <img> tag text in the textarea.
    const url = stripSrcWrapper(entry.value);
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tagPattern = new RegExp(`<img[^>]*src=["']${escapedUrl}["'][^>]*>\\n?`, 'g');

    const filteredList = boardList.boardImgLegacyList
        .filter((img) => img.idx !== entry.idx)
        .map((img, i) => ({ ...img, idx: i }));

    onChange(value.replace(tagPattern, ''));
    onImgListChange(filteredList);
  };

  return (
    <Box>
      {/* Dropzone - the textarea below already accepts paste/drop directly, this box is a
          second, more discoverable drop target + click-to-browse trigger for the same flow. */}
      <Box
        onClick={handleUpload}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragOver(false);
          setIsImageLoading(true);
          await handlePasteOrDrop(e.dataTransfer);
          setIsImageLoading(false);
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        sx={{
          border: `1.5px dashed ${isDragOver ? COLORS.accent : COLORS.border}`,
          borderRadius: '12px',
          p: { xs: 2.5, sm: '32px 20px' },
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragOver ? COLORS.accentSoft : COLORS.bg,
          transition: 'border-color .15s, background .15s',
          mb: 1.5,
          '&:hover': { borderColor: COLORS.accent, bgcolor: COLORS.accentSoft },
        }}
      >
        {isImageLoading ? (
          <CircularProgress size={22} sx={{ color: COLORS.textTertiary, mb: 1 }} />
        ) : (
          <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: COLORS.textTertiary, mb: 1 }} />
        )}
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: COLORS.textPrimary }}>
          {isImageLoading ? '업로드 중...' : '이미지를 끌어다 놓거나 클릭해서 업로드'}
        </Typography>
        <Typography sx={{ fontSize: 12, color: COLORS.textTertiary, mt: 0.5 }}>
          이미지를 붙여넣거나(Ctrl+V) 편집 영역에 바로 드롭할 수도 있습니다
        </Typography>
      </Box>

      {boardList.boardImgLegacyList?.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {boardList.boardImgLegacyList.map((entry) => {
            const url = stripSrcWrapper(entry.value);
            return (
              <Box
                key={entry.idx}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, bgcolor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`, borderRadius: '10px', pl: 0.5, pr: 1, py: 0.5,
                  fontSize: 12, color: COLORS.textSecondary, maxWidth: '100%',
                }}
              >
                <Box component="img" src={url} alt="" sx={{
                  width: 32, height: 32, borderRadius: '6px', objectFit: 'cover',
                  bgcolor: COLORS.accentSoft, flexShrink: 0,
                }} />
                <Typography sx={{
                  fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {fileNameFromLegacyValue(entry.value)}
                </Typography>
                <Box
                  onClick={() => removeImage(entry)}
                  sx={{
                    width: 16, height: 16, borderRadius: '50%', bgcolor: COLORS.border,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, '&:hover': { bgcolor: '#DDD6CB' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 11, color: COLORS.textSecondary }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Write area - preview="edit" turns off MDEditor's own side-by-side live preview so this
          is a single write pane; the rendered preview is the separate stacked block below it. */}
      <Box data-color-mode="light" sx={{
        '& .w-md-editor': { border: `1px solid ${COLORS.border}`, borderRadius: '10px 10px 0 0', boxShadow: 'none' },
        '& .w-md-editor-toolbar': { bgcolor: COLORS.bg, borderColor: COLORS.border, borderRadius: '10px 10px 0 0' },
      }}>
        <MDEditor
          id='mdEditorTextArea'
          ref={textareaRef}
          height={360}
          preview="edit"
          value={value ?? ''}
          onChange={(v) => onChange(v!)}
          onPaste={async (e) => {
            setIsImageLoading(true);
            await handlePasteOrDrop(e.clipboardData);
            setIsImageLoading(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsImageLoading(true);
            await handlePasteOrDrop(e.dataTransfer);
            setIsImageLoading(false);
          }}
        />
      </Box>

      {/* Stacked preview, always visible below the write area - this is the "write on top,
          rendered preview below" layout instead of the editor's default side-by-side split. */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25,
        border: `1px solid ${COLORS.border}`, borderTop: 'none', bgcolor: COLORS.bg,
        fontSize: 11.5, fontWeight: 700, color: COLORS.textTertiary, letterSpacing: '0.04em',
      }}>
        <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
        미리보기
      </Box>
      <Box sx={{
        border: `1px solid ${COLORS.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px',
        minHeight: 240, maxHeight: 720, height: 320,
        overflow: 'auto',          // overflowX/Y 나누지 말고 이거 하나로
        resize: 'vertical',
        bgcolor: COLORS.surface, p: '20px',
        boxSizing: 'border-box',   // 리사이즈 시 padding 때문에 크기 계산 꼬이는 것 방지
        '& img': { maxWidth: '100%', height: 'auto', borderRadius: '6px' },
      }}>
        {value ? (
            <MarkdownPreview source={value} style={{ background: 'transparent', fontSize: 14 }} />
        ) : (
            <Typography sx={{ fontSize: 13, color: COLORS.textTertiary }}>
              내용을 입력하면 여기에 미리보기가 표시됩니다
            </Typography>
        )}
      </Box>
    </Box>
  );
}
