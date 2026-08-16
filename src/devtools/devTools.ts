// The 4 개발자 도구 tools - unlike the dashboard's server-status/quick-links widgets, these are
// hardcoded app features, not user-managed data. Shared between the dashboard's DevToolsRow
// (quick-access row) and DevToolsHub.tsx (the dedicated /tools landing page) so both list the
// same 4 tools from one source. Each id maps 1:1 to its route segment under /tools/<id>.
export interface DevTool {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export const DEV_TOOLS: DevTool[] = [
    { id: 'table', icon: '▦', title: '만능 테이블', description: '컬럼 자유롭게 만드는 나만의 표' },
    { id: 'format-converter', icon: '⇄', title: '포맷 변환기', description: 'JSON ↔ CSV ↔ Excel 변환' },
    { id: 'db-notes', icon: '🗂️', title: 'DB 관리 노트', description: '테이블/컬럼 구조 정리' },
    { id: 'text-converter', icon: '✎', title: '텍스트 변환기', description: 'Base64 · URL · JWT 디코드' },
];
