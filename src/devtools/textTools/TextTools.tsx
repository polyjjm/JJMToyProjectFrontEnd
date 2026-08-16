import { useState } from 'react';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../theme';
import {
    base64Decode, base64Encode, decodeJwt, dedupeLines, sortLines, toCamelCase,
    toSnakeCase, toTitleCase, trimLines, urlDecode, urlEncode,
} from './textUtils';
import { jsonToJavaDto } from './jsonToDto';
import { parseJsonOrCsvRows, rowsToInsertStatements } from './jsonCsvToSql';

type ToolId = 'base64' | 'url' | 'jwt' | 'case' | 'lines' | 'json-dto' | 'sql-insert';

const TOOLS: [ToolId, string][] = [
    ['base64', 'Base64'],
    ['url', 'URL'],
    ['jwt', 'JWT 디코드'],
    ['case', '대소문자 변환'],
    ['lines', '줄 유틸'],
    ['json-dto', 'JSON → DTO'],
    ['sql-insert', 'JSON/CSV → SQL'],
];

function OutputArea({ text, error }: { text: string; error: string }) {
    if (error) return <Typography sx={{ fontSize: 12.5, color: '#B3403B', mt: 1 }}>{error}</Typography>;
    if (!text) return null;
    return (
        <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: COLORS.textTertiary }}>결과</Typography>
                <IconButton size="small" onClick={() => navigator.clipboard.writeText(text)} sx={{ color: COLORS.textTertiary }}>
                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
            </Box>
            <Box component="pre" sx={{
                m: 0, p: 1.5, bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px',
                fontSize: 12, fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: COLORS.textPrimary, maxHeight: 320, overflowY: 'auto',
            }}>
                {text}
            </Box>
        </Box>
    );
}

const inputSx = {
    width: '100%', border: `1px solid ${COLORS.border}`, borderRadius: '10px', p: 1.5,
    fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, monospace', fontSize: 12.5,
    resize: 'vertical' as const, outline: 'none', bgcolor: COLORS.surface,
};

const buttonSx = {
    bgcolor: COLORS.accent, color: '#fff', border: 'none', borderRadius: '8px', px: 2, py: 0.875,
    fontSize: 12.5, fontWeight: 700, cursor: 'pointer', mt: 1, '&:hover': { bgcolor: '#211F1B' },
};

// Base64/URL: simple encode+decode pair sharing one input/output.
function EncodeDecodeTool({ encode, decode }: { encode: (s: string) => string; decode: (s: string) => string }) {
    const [text, setText] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const run = (fn: (s: string) => string) => {
        setError('');
        try { setOutput(fn(text)); } catch { setError('변환할 수 없습니다.'); setOutput(''); }
    };

    return (
        <Box>
            <Box component="textarea" value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} placeholder="텍스트를 입력하세요" sx={{ ...inputSx, height: 120 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Box component="button" onClick={() => run(encode)} sx={buttonSx}>인코드</Box>
                <Box component="button" onClick={() => run(decode)} sx={{ ...buttonSx, bgcolor: COLORS.accentSoft, color: COLORS.accent, '&:hover': { bgcolor: COLORS.accentSoft } }}>디코드</Box>
            </Box>
            <OutputArea text={output} error={error} />
        </Box>
    );
}

function JwtTool() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [error, setError] = useState('');

    const run = () => {
        setError('');
        try {
            const decoded = decodeJwt(token);
            setHeader(decoded.header);
            setPayload(decoded.payload);
        } catch (e: any) {
            setError(e?.message || '디코드할 수 없습니다.');
            setHeader(''); setPayload('');
        }
    };

    return (
        <Box>
            <Box component="textarea" value={token} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToken(e.target.value)} placeholder="JWT 토큰을 입력하세요" sx={{ ...inputSx, height: 100 }} />
            <Box component="button" onClick={run} sx={buttonSx}>디코드 (서명 검증 없음)</Box>
            {header && (
                <Box sx={{ mt: 1.5 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: COLORS.textTertiary, mb: 0.5 }}>HEADER</Typography>
                    <Box component="pre" sx={{ m: 0, mb: 1.5, p: 1.5, bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', fontSize: 12, fontFamily: 'monospace', color: COLORS.textPrimary }}>{header}</Box>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: COLORS.textTertiary, mb: 0.5 }}>PAYLOAD</Typography>
                    <Box component="pre" sx={{ m: 0, p: 1.5, bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '8px', fontSize: 12, fontFamily: 'monospace', color: COLORS.textPrimary }}>{payload}</Box>
                </Box>
            )}
            <OutputArea text="" error={error} />
        </Box>
    );
}

function CaseTool() {
    const [text, setText] = useState('');
    const [output, setOutput] = useState('');

    return (
        <Box>
            <Box component="textarea" value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} placeholder="텍스트를 입력하세요" sx={{ ...inputSx, height: 100 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Box component="button" onClick={() => setOutput(text.toUpperCase())} sx={buttonSx}>UPPER</Box>
                <Box component="button" onClick={() => setOutput(text.toLowerCase())} sx={buttonSx}>lower</Box>
                <Box component="button" onClick={() => setOutput(toTitleCase(text))} sx={buttonSx}>Title Case</Box>
                <Box component="button" onClick={() => setOutput(toCamelCase(text))} sx={buttonSx}>camelCase</Box>
                <Box component="button" onClick={() => setOutput(toSnakeCase(text))} sx={buttonSx}>snake_case</Box>
            </Box>
            <OutputArea text={output} error="" />
        </Box>
    );
}

function LinesTool() {
    const [text, setText] = useState('');
    const [output, setOutput] = useState('');

    return (
        <Box>
            <Box component="textarea" value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} placeholder="한 줄에 하나씩 입력하세요" sx={{ ...inputSx, height: 160 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Box component="button" onClick={() => setOutput(sortLines(text))} sx={buttonSx}>정렬</Box>
                <Box component="button" onClick={() => setOutput(dedupeLines(text))} sx={buttonSx}>중복 제거</Box>
                <Box component="button" onClick={() => setOutput(trimLines(text))} sx={buttonSx}>공백 제거</Box>
            </Box>
            <OutputArea text={output} error="" />
        </Box>
    );
}

function JsonToDtoTool() {
    const [text, setText] = useState('');
    const [className, setClassName] = useState('GeneratedDto');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const run = () => {
        setError('');
        try { setOutput(jsonToJavaDto(text, className)); } catch (e: any) { setError(e?.message || 'JSON을 파싱할 수 없습니다.'); setOutput(''); }
    };

    return (
        <Box>
            <TextField size="small" label="클래스 이름" value={className} onChange={(e) => setClassName(e.target.value)} sx={{ mb: 1.5, width: 240 }} />
            <Box component="textarea" value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} placeholder='{"id": 1, "name": "example"}' sx={{ ...inputSx, height: 160 }} />
            <Box component="button" onClick={run} sx={buttonSx}>DTO 생성</Box>
            <OutputArea text={output} error={error} />
        </Box>
    );
}

function SqlInsertTool() {
    const [text, setText] = useState('');
    const [isCsv, setIsCsv] = useState(false);
    const [tableName, setTableName] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const run = () => {
        setError('');
        try {
            const rows = parseJsonOrCsvRows(text, isCsv);
            setOutput(rowsToInsertStatements(rows, tableName));
        } catch (e: any) {
            setError(e?.message || '파싱할 수 없습니다.');
            setOutput('');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                <TextField size="small" label="테이블 이름" value={tableName} onChange={(e) => setTableName(e.target.value)} sx={{ width: 200 }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {([[false, 'JSON'], [true, 'CSV']] as [boolean, string][]).map(([value, label]) => (
                        <Box
                            key={label} onClick={() => setIsCsv(value)}
                            sx={{
                                px: 1.5, py: 0.625, borderRadius: '999px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                                bgcolor: isCsv === value ? COLORS.accent : COLORS.bg,
                                color: isCsv === value ? '#fff' : COLORS.textSecondary,
                                border: `1px solid ${isCsv === value ? COLORS.accent : COLORS.border}`,
                            }}
                        >
                            {label}
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box component="textarea" value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} placeholder={isCsv ? 'id,name\n1,example' : '[{"id": 1, "name": "example"}]'} sx={{ ...inputSx, height: 160 }} />
            <Box component="button" onClick={run} sx={buttonSx}>INSERT 생성</Box>
            <OutputArea text={output} error={error} />
        </Box>
    );
}

// 텍스트 만능 변환기 (item 4) - one page, tabbed, everything client-side and throwaway (nothing
// here is saved - that's what DB 관리 노트/만능 테이블 are for when the data represents
// something worth tracking over time).
export default function TextTools() {
    const navigate = useNavigate();
    const [tool, setTool] = useState<ToolId>('base64');

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 780, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconButton size="small" onClick={() => navigate('/tools')} sx={{ color: COLORS.textTertiary }}>
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary }}>텍스트 만능 변환기</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5, flexWrap: 'wrap' }}>
                {TOOLS.map(([id, label]) => (
                    <Box
                        key={id} onClick={() => setTool(id)}
                        sx={{
                            px: 1.5, py: 0.75, borderRadius: '999px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            bgcolor: tool === id ? COLORS.accent : COLORS.bg,
                            color: tool === id ? '#fff' : COLORS.textSecondary,
                            border: `1px solid ${tool === id ? COLORS.accent : COLORS.border}`,
                        }}
                    >
                        {label}
                    </Box>
                ))}
            </Box>

            {tool === 'base64' && <EncodeDecodeTool encode={base64Encode} decode={base64Decode} />}
            {tool === 'url' && <EncodeDecodeTool encode={urlEncode} decode={urlDecode} />}
            {tool === 'jwt' && <JwtTool />}
            {tool === 'case' && <CaseTool />}
            {tool === 'lines' && <LinesTool />}
            {tool === 'json-dto' && <JsonToDtoTool />}
            {tool === 'sql-insert' && <SqlInsertTool />}
        </Box>
    );
}
