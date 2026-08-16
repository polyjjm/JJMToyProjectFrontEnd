import { DbNoteColumn } from './dbNote.types';

// All 5 generated artifacts are computed client-side from an already-loaded column list - no
// backend generation endpoint (same "stateless, don't round-trip" reasoning as item 2's
// converter). The backend's only involvement is CRUD plus stamping last_generated_at (see
// dbNoteApi.ts's fetchGeneratedView).

function toCamelCase(snake: string): string {
    return snake.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function sqlTypeWithLength(column: DbNoteColumn): string {
    return column.length ? `${column.sql_type}(${column.length})` : column.sql_type;
}

// ---------------- 1) CREATE TABLE ----------------
export function generateCreateTable(tableName: string, columns: DbNoteColumn[]): string {
    if (!tableName || columns.length === 0) return '-- 테이블 이름과 컬럼이 필요합니다';

    const pkColumns = columns.filter((c) => c.is_primary_key);
    const lines = columns.map((c) => {
        const parts = [`  ${c.name}`, sqlTypeWithLength(c)];
        if (pkColumns.length === 1 && c.is_primary_key) parts.push('PRIMARY KEY');
        parts.push(c.nullable ? 'NULL' : 'NOT NULL');
        if (c.default_value) parts.push(`DEFAULT ${c.default_value}`);
        return parts.join(' ');
    });
    if (pkColumns.length > 1) {
        lines.push(`  PRIMARY KEY (${pkColumns.map((c) => c.name).join(', ')})`);
    }

    return `CREATE TABLE ${tableName} (\n${lines.join(',\n')}\n);`;
}

// ---------------- 2) ALTER TABLE (diff since last generated) ----------------
// One statement, comma-separated ADD COLUMN clauses - matches this project's own migration
// style (see e.g. the 2026-08-16 chat migration's message_type/attachment_url addition).
export function generateAlterTable(tableName: string, newColumns: DbNoteColumn[]): string {
    if (newColumns.length === 0) {
        return '-- 마지막 생성 이후 추가된 컬럼이 없습니다';
    }
    const clauses = newColumns.map((c) => {
        const parts = [`  ADD COLUMN ${c.name}`, sqlTypeWithLength(c)];
        parts.push(c.nullable ? 'NULL' : 'NOT NULL');
        if (c.default_value) parts.push(`DEFAULT ${c.default_value}`);
        return parts.join(' ');
    });
    return `ALTER TABLE ${tableName}\n${clauses.join(',\n')};`;
}

// ---------------- 3) Sample INSERT ----------------
function exampleValue(column: DbNoteColumn): string {
    const type = column.sql_type.toUpperCase();
    if (type.includes('INT')) return '0';
    if (type.includes('DECIMAL') || type.includes('FLOAT') || type.includes('DOUBLE')) return '0.0';
    if (type === 'BOOLEAN') return 'TRUE';
    if (type === 'DATE') return "'2026-01-01'";
    if (type === 'DATETIME' || type === 'TIMESTAMP') return "'2026-01-01 00:00:00'";
    if (type === 'JSON') return "'{}'";
    return "'예시'";
}

export function generateSampleInsert(tableName: string, columns: DbNoteColumn[]): string {
    if (!tableName || columns.length === 0) return '-- 테이블 이름과 컬럼이 필요합니다';
    const insertable = columns.filter((c) => !c.is_primary_key || c.default_value);
    const names = insertable.map((c) => c.name).join(', ');
    const values = insertable.map(exampleValue).join(', ');
    return `INSERT INTO ${tableName} (${names})\nVALUES (${values});`;
}

// ---------------- 4) Java DTO ----------------
// Matches boardDTO.java's style: lowercase-leading class name, @Data/@ToString, field names
// identical to the DB column names (not camelCased) - this project's DTOs use the raw
// snake_case column name as the Java field name throughout (see boardDTO/todoDTO), which is
// unusual for Java but is the established convention here, so the generator follows it rather
// than "fixing" it into normal camelCase.
function javaType(column: DbNoteColumn): string {
    const type = column.sql_type.toUpperCase();
    if (type === 'BIGINT') return 'Long';
    if (type.includes('INT')) return 'Integer';
    if (type.includes('DECIMAL') || type.includes('FLOAT') || type.includes('DOUBLE')) return 'Double';
    if (type === 'BOOLEAN') return 'Boolean';
    return 'String'; // VARCHAR/TEXT/ENUM/DATE/DATETIME/TIMESTAMP/JSON - see boardDTO's board_date
}

export function generateJavaDto(tableName: string, columns: DbNoteColumn[]): string {
    if (!tableName || columns.length === 0) return '// 테이블 이름과 컬럼이 필요합니다';
    const className = `${toCamelCase(tableName)}DTO`;
    const fields = columns.map((c) => {
        const note = c.note ? ` // ${c.note}` : '';
        return `    private ${javaType(c)} ${c.name};${note}`;
    });

    return [
        'package com.example.demo;',
        '',
        'import lombok.Data;',
        'import lombok.ToString;',
        '',
        '@Data',
        '@ToString',
        `public class ${className} {`,
        ...fields,
        '}',
    ].join('\n');
}

// ---------------- 5) MyBatis mapper XML skeleton ----------------
// Matches boardMapper.xml's structure: insert/select/update/delete, #{field} bindings keyed
// off the same DTO field names as generateJavaDto.
export function generateMyBatisMapper(tableName: string, columns: DbNoteColumn[]): string {
    if (!tableName || columns.length === 0) return '<!-- 테이블 이름과 컬럼이 필요합니다 -->';
    const className = `${toCamelCase(tableName)}DTO`;
    const namespace = `com.example.demo.${toCamelCase(tableName)}Mapper`;
    const dtoFqn = `com.example.demo.${className}`;
    const pk = columns.find((c) => c.is_primary_key) || columns[0];
    const nonPkColumns = columns.filter((c) => c !== pk);

    const insertCols = columns.map((c) => c.name).join(', ');
    const insertVals = columns.map((c) => `#{${c.name}}`).join(', ');
    const updateSet = nonPkColumns.map((c) => `${c.name} = #{${c.name}}`).join(',\n            ');

    return [
        '<?xml version="1.0" encoding="UTF-8" ?>',
        '<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">',
        `<mapper namespace="${namespace}">`,
        '',
        `    <insert id="insert" parameterType="${dtoFqn}"${pk.sql_type.toUpperCase().includes('INT') ? ` useGeneratedKeys="true" keyProperty="${pk.name}"` : ''}>`,
        `        INSERT INTO ${tableName} (${insertCols})`,
        `        VALUES (${insertVals})`,
        '    </insert>',
        '',
        `    <select id="selectList" resultType="${dtoFqn}">`,
        `        SELECT * FROM ${tableName}`,
        '    </select>',
        '',
        `    <select id="selectOne" resultType="${dtoFqn}">`,
        `        SELECT * FROM ${tableName} WHERE ${pk.name} = #{${pk.name}}`,
        '    </select>',
        '',
        `    <update id="update" parameterType="${dtoFqn}">`,
        `        UPDATE ${tableName}`,
        '        SET',
        `            ${updateSet}`,
        `        WHERE ${pk.name} = #{${pk.name}}`,
        '    </update>',
        '',
        `    <delete id="delete">`,
        `        DELETE FROM ${tableName} WHERE ${pk.name} = #{${pk.name}}`,
        '    </delete>',
        '',
        '</mapper>',
    ].join('\n');
}
