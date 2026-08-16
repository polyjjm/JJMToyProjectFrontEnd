import { useRef, useState } from 'react';
import { Box, Button, IconButton, MenuItem, Select, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../theme';

type Format = 'json' | 'csv' | 'excel';

const FORMAT_LABELS: Record<Format, string> = { json: 'JSON', csv: 'CSV', excel: 'Excel' };

// A row of arbitrary JSON-serializable values - the common shape every format converts through
// (JSON array of objects, CSV rows-with-header, Excel sheet rows are all naturally this shape).
type Rows = Record<string, unknown>[];

// Normalizes a parsed JSON value into rows: an array passes through as-is, a single object
// becomes a 1-row array (matches how CSV/Excel would show it), anything else is wrapped under
// a single "value" column so conversion never just silently fails on a bare string/number.
function jsonToRows(value: unknown): Rows {
    if (Array.isArray(value)) return value as Rows;
    if (value && typeof value === 'object') return [value as Record<string, unknown>];
    return [{ value }];
}

// item 2's converter - entirely client-side per the task (no backend round trip for a
// stateless conversion). xlsx (SheetJS) handles Excel, papaparse handles CSV (hand-rolled CSV
// parsing breaks on quoted commas/newlines, not worth the risk), JSON uses the built-ins.
export default function FormatConverter() {
    const navigate = useNavigate();
    const [inputFormat, setInputFormat] = useState<Format>('json');
    const [outputFormat, setOutputFormat] = useState<Format>('csv');
    const [inputText, setInputText] = useState('');
    const [rows, setRows] = useState<Rows | null>(null);
    const [outputText, setOutputText] = useState('');
    const [outputBlob, setOutputBlob] = useState<{ blob: Blob; filename: string } | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFile = async (file: File) => {
        setError('');
        try {
            if (inputFormat === 'excel') {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                setRows(XLSX.utils.sheet_to_json(sheet) as Rows);
                setInputText(`(Excel 파일: ${file.name})`);
            } else {
                const text = await file.text();
                setInputText(text);
                parseInput(text, inputFormat);
            }
        } catch {
            setError('파일을 읽을 수 없습니다.');
        }
    };

    const parseInput = (text: string, format: Format) => {
        setError('');
        try {
            if (format === 'json') {
                setRows(jsonToRows(JSON.parse(text)));
            } else if (format === 'csv') {
                const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
                setRows(result.data as Rows);
            }
        } catch {
            setError('입력을 파싱할 수 없습니다. 형식을 확인해주세요.');
            setRows(null);
        }
    };

    const handleConvert = () => {
        setError('');
        setOutputBlob(null);
        setOutputText('');

        let parsedRows = rows;
        if (inputFormat !== 'excel') {
            // Re-parse from the textarea in case the user edited it after the last parse.
            try {
                parsedRows = inputFormat === 'json' ? jsonToRows(JSON.parse(inputText)) : (Papa.parse(inputText.trim(), { header: true, skipEmptyLines: true }).data as Rows);
            } catch {
                setError('입력을 파싱할 수 없습니다. 형식을 확인해주세요.');
                return;
            }
        }
        if (!parsedRows) {
            setError('먼저 파일을 업로드해주세요.');
            return;
        }

        if (outputFormat === 'json') {
            setOutputText(JSON.stringify(parsedRows, null, 2));
        } else if (outputFormat === 'csv') {
            setOutputText(Papa.unparse(parsedRows));
        } else {
            const sheet = XLSX.utils.json_to_sheet(parsedRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
            const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            setOutputBlob({
                blob: new Blob([arrayBuffer], { type: 'application/octet-stream' }),
                filename: 'converted.xlsx',
            });
        }
    };

    const downloadOutput = () => {
        if (outputBlob) {
            const url = URL.createObjectURL(outputBlob.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = outputBlob.filename;
            a.click();
            URL.revokeObjectURL(url);
            return;
        }
        const ext = outputFormat === 'json' ? 'json' : 'csv';
        const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 900, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconButton size="small" onClick={() => navigate('/tools')} sx={{ color: COLORS.textTertiary }}>
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>포맷 변환기</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, mb: 2, alignItems: 'center' }}>
                <Select size="small" value={inputFormat} onChange={(e) => { setInputFormat(e.target.value as Format); setRows(null); setInputText(''); }} sx={{ fontSize: 13, minWidth: 120 }}>
                    {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => <MenuItem key={f} value={f}>{FORMAT_LABELS[f]}</MenuItem>)}
                </Select>
                <Typography sx={{ fontSize: 13, color: COLORS.textTertiary }}>→</Typography>
                <Select size="small" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as Format)} sx={{ fontSize: 13, minWidth: 120 }}>
                    {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => <MenuItem key={f} value={f}>{FORMAT_LABELS[f]}</MenuItem>)}
                </Select>
                <Button onClick={handleConvert} sx={{ bgcolor: COLORS.accent, color: '#fff', borderRadius: '8px', ml: { md: 'auto' }, '&:hover': { bgcolor: '#211F1B' } }}>
                    변환
                </Button>
            </Box>

            {error && <Typography sx={{ fontSize: 12.5, color: '#B3403B', mb: 1.5 }}>{error}</Typography>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary }}>입력</Typography>
                        {inputFormat === 'excel' ? (
                            <Button size="small" startIcon={<UploadFileIcon sx={{ fontSize: 14 }} />} onClick={() => fileInputRef.current?.click()} sx={{ fontSize: 11.5 }}>
                                파일 선택
                            </Button>
                        ) : (
                            <Button size="small" startIcon={<UploadFileIcon sx={{ fontSize: 14 }} />} onClick={() => fileInputRef.current?.click()} sx={{ fontSize: 11.5 }}>
                                파일 업로드
                            </Button>
                        )}
                        <Box
                            component="input" ref={fileInputRef} type="file" accept={inputFormat === 'excel' ? '.xlsx,.xls' : inputFormat === 'json' ? '.json' : '.csv'}
                            sx={{ display: 'none' }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                        />
                    </Box>
                    <Box
                        component="textarea"
                        value={inputText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setInputText(e.target.value); if (inputFormat !== 'excel') parseInput(e.target.value, inputFormat); }}
                        placeholder={inputFormat === 'excel' ? '파일을 업로드해주세요' : `${FORMAT_LABELS[inputFormat]} 텍스트를 붙여넣으세요`}
                        readOnly={inputFormat === 'excel'}
                        sx={{
                            width: '100%', height: 320, border: `1px solid ${COLORS.border}`, borderRadius: '10px', p: 1.5,
                            fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace', fontSize: 12, resize: 'vertical',
                            bgcolor: inputFormat === 'excel' ? COLORS.bg : COLORS.surface, outline: 'none',
                        }}
                    />
                </Box>

                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary }}>출력</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {outputText && (
                                <IconButton size="small" onClick={() => navigator.clipboard.writeText(outputText)} sx={{ color: COLORS.textTertiary }}>
                                    <ContentCopyIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            )}
                            {(outputText || outputBlob) && (
                                <IconButton size="small" onClick={downloadOutput} sx={{ color: COLORS.textTertiary }}>
                                    <DownloadIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                    {outputBlob ? (
                        <Box sx={{
                            width: '100%', height: 320, border: `1px solid ${COLORS.border}`, borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1,
                            bgcolor: COLORS.bg, color: COLORS.textTertiary, fontSize: 12.5,
                        }}>
                            Excel 파일은 텍스트로 표시할 수 없습니다
                            <Button size="small" startIcon={<DownloadIcon sx={{ fontSize: 14 }} />} onClick={downloadOutput} sx={{ bgcolor: COLORS.accent, color: '#fff', '&:hover': { bgcolor: '#211F1B' } }}>
                                {outputBlob.filename} 다운로드
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            component="textarea" value={outputText} readOnly placeholder="변환 결과가 여기에 표시됩니다"
                            sx={{
                                width: '100%', height: 320, border: `1px solid ${COLORS.border}`, borderRadius: '10px', p: 1.5,
                                fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace', fontSize: 12, resize: 'vertical',
                                bgcolor: COLORS.bg, outline: 'none',
                            }}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
}
