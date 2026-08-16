// JSON -> Java DTO (item 4) - a quick, throwaway, best-effort version distinct from DB 관리
// 노트's generator (codeGenerators.ts): that one works from a persisted, explicitly-typed
// column definition; this one infers types from arbitrary pasted JSON values on the spot, with
// no save step. Intentionally not sharing code with codeGenerators.ts - different inputs,
// different confidence level in the output.

function inferJavaType(value: unknown): string {
    if (value === null || value === undefined) return 'Object';
    if (typeof value === 'string') return 'String';
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Double';
    if (Array.isArray(value)) {
        const elementType = value.length > 0 ? inferJavaType(value[0]) : 'Object';
        return `List<${elementType}>`;
    }
    if (typeof value === 'object') return 'Object'; // nested objects simplified - best-effort, not recursive class generation
    return 'Object';
}

export function jsonToJavaDto(jsonText: string, className: string): string {
    const parsed = JSON.parse(jsonText);
    const source = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!source || typeof source !== 'object') {
        throw new Error('JSON 객체 또는 객체 배열이어야 합니다');
    }

    const usesList = Object.values(source).some((v) => Array.isArray(v));
    const fields = Object.entries(source).map(([key, value]) => `    private ${inferJavaType(value)} ${key};`);

    return [
        ...(usesList ? ['import java.util.List;', ''] : []),
        'import lombok.Data;',
        '',
        '@Data',
        `public class ${className.trim() || 'GeneratedDto'} {`,
        ...fields,
        '}',
    ].join('\n');
}
