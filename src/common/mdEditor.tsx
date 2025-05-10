import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MDEditor from '@uiw/react-md-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { postUpload } from "./common";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  boardList: {
    boardImgLegacyList: any[];
  };
}

export default function mdEditor({ value, onChange, boardList }: MarkdownEditorProps) {
  const noDragOverText = 'Paste, drop, or click to add files';
  const dragOverText = 'Drop to add files';

  const [dropText, setDropText] = useState(noDragOverText);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  let data = new FormData();
  let fileLength = 0;

  let imageName = '';
  let loadingText = '';
  let insertMarkdown: any;

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handlePasteOrDrop = async (data: DataTransfer) => {
    fileLength = data.files.length;
    const files = data.files;
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

    if (!boardList.boardImgLegacyList) {
      boardList.boardImgLegacyList = [];
    }

    for (let i = 0; i < path.length; i++) {
      boardList.boardImgLegacyList.push({
        idx: boardList.boardImgLegacyList.length,
        value: "src=\"" + path[i],
      });
      const imgTag = `<img src="${decodeURIComponent(path[i])}" alt="업로드된 이미지" />`;
      finalMarkdownText += imgTag + '\n';
    }

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

  return (
    <Box>
      <Box
        onClick={handleUpload}
        sx={{ '&:hover': { bgcolor: '#F5F5F5' } }}
        style={{ width: '50%', marginBottom: '10px', justifyContent: 'center' }}
      >
        <AttachFileIcon style={{ verticalAlign: 'middle' }} />
        <span style={{ verticalAlign: 'middle' }}>Pasto, Drop, or Click to add File</span>
      </Box>

      <div className="markarea">
        <div data-color-mode="dark">
          <MDEditor
            id='mdEditorTextArea'
            ref={textareaRef}
            height={865}
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
              setDropText(noDragOverText);
              await handlePasteOrDrop(e.dataTransfer);
              setIsImageLoading(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDropText(dragOverText);
            }}
            onDragLeave={() => {
              setDropText(noDragOverText);
            }}
          />
        </div>
      </div>

    </Box>
  );
}
