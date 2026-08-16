import { Box, Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import './board.css';
import '../index.css';
import { apiOrigin, get, postBoardSearch } from "../common/common";
import { useNavigate } from "react-router-dom";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useMemo, useRef, useState } from "react";
import BoardSkeleton from "./boardSkeleton";
import AdFitBanner from "../common/AdFitBanner";
import { COLORS } from "../theme";
import { BoardPost, CategoryCount, CategoryTab, toThumbnailUrl } from "./board.types";

type SearchScope = 'title' | 'titleContent' | 'content';

interface Filters {
    categoryMain: string; // '' = "전체" (no filter at this level)
    categoryMid: string;
    categorySub: string;
    searchScope: SearchScope;
    searchWord: string;
}

// Rolls a flat CategoryCount[] up into the pill options for one tab row, summing counts for
// whichever level is being grouped by. Shared by all 3 rows (대/중/소) - see the 3 useMemo
// call sites below for how each level's "already narrowed to" rows get pre-filtered first.
function rollUpTabs(rows: CategoryCount[], levelKey: 'categoryMain' | 'categoryMid' | 'categorySub'): CategoryTab[] {
    const counts = new Map<string, number>();
    let total = 0;
    for (const row of rows) {
        total += row.count;
        const value = row[levelKey];
        if (!value) continue; // uncategorized posts still count toward "전체" but get no pill of their own
        counts.set(value, (counts.get(value) ?? 0) + row.count);
    }
    const pills = Array.from(counts, ([label, count]) => ({ label, value: label, count }));
    return [{ label: '전체', value: '', count: total }, ...pills];
}

export default function board() {
    const navigate = useNavigate();

    const [boards, setBoards] = useState<BoardPost[]>([]);
    // Starts true, not false: the initial-load effect below always fires loadBoards()
    // immediately on mount, so defaulting to false let the "게시물이 존재하지 않습니다" empty
    // state flash for one frame before the skeleton took over.
    const [isLoading, setIsLoading] = useState(true);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [scrollIndex, setScrollIndex] = useState(0);

    // Full (대,중,소,count) combination list - the single source the 3 tab rows derive
    // themselves from. See the "3-tier category tab derivation" block below.
    const [categoryTree, setCategoryTree] = useState<CategoryCount[]>([]);

    const [filters, setFilters] = useState<Filters>({
        categoryMain: '',
        categoryMid: '',
        categorySub: '',
        searchScope: 'titleContent',
        searchWord: '',
    });

    // Refs mirroring the above so the IntersectionObserver callback (registered once, on
    // mount) always reads current values instead of closing over stale state.
    const filtersRef = useRef(filters);
    const scrollIndexRef = useRef(scrollIndex);
    const hasNextPageRef = useRef(hasNextPage);
    const isLoadingRef = useRef(isLoading);
    const loadedIndexesRef = useRef<number[]>([]);
    filtersRef.current = filters;
    scrollIndexRef.current = scrollIndex;
    hasNextPageRef.current = hasNextPage;
    isLoadingRef.current = isLoading;

    // Single query path for both the initial list and every filtered/searched view - the old
    // version of this file had a separate "/board/select" (plain browse) code path and a
    // "/board/boardSearch" (search) code path that could never run at the same time. Since
    // categories now need to combine with free-text search (and both need infinite scroll),
    // that split no longer makes sense: boardSearch with no filters/search word behaves the
    // same as a plain list, so everything goes through it uniformly.
    const loadBoards = async (targetIndex: number, replace: boolean, overrideFilters?: Filters) => {
        if (!replace && loadedIndexesRef.current.includes(targetIndex)) return;
        if (!replace && hasNextPageRef.current === false) return;

        const f = overrideFilters ?? filtersRef.current;
        setIsLoading(true);
        try {
            const result = await postBoardSearch('/board/boardSearch', {
                scrollIndex: targetIndex,
                searchTableName: 'board',
                searchWord: f.searchWord || undefined,
                searchScope: f.searchScope,
                categoryMain: f.categoryMain || undefined,
                categoryMid: f.categoryMid || undefined,
                categorySub: f.categorySub || undefined,
            });
            if (!result) {
                throw new Error('게시글 목록을 불러오지 못했습니다');
            }

            setBoards((prev) => (replace ? result.data : [...prev, ...result.data]));
            loadedIndexesRef.current = replace ? [targetIndex] : [...loadedIndexesRef.current, targetIndex];
            setHasNextPage(result.scrollIndex < result.totalCount);
            setScrollIndex(result.scrollIndex);
        } catch (error) {
            console.error('게시글 목록 조회 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load + category tree fetch (once).
    useEffect(() => {
        loadBoards(0, true);
        (async () => {
            const tree = await get(apiOrigin + '/board/categoryTree');
            if (tree) setCategoryTree(tree);
        })();
    }, []);

    // Infinite scroll: registered once, always reads the *Ref mirrors above so it never sees
    // stale filters/pagination state from the render it was created in.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && hasNextPageRef.current && !isLoadingRef.current) {
                    loadBoards(scrollIndexRef.current, false);
                }
            },
            { threshold: 1 }
        );

        const observerTarget = document.getElementById("observer");
        if (observerTarget) {
            observer.observe(observerTarget);
        }
        return () => {
            if (observerTarget) {
                observer.unobserve(observerTarget);
            }
        };
    }, []);

    // ---- 3-tier category tab derivation ------------------------------------------------
    // `categoryTree` is the full (대,중,소,count) combination list from the backend - one row
    // per combination that actually exists on at least one post. Rather than the backend
    // serving a different response shape per drill-down step, each tab row is derived here by
    // filtering the same tree down to "rows consistent with everything selected so far" and
    // rolling up by the next level. This keeps "don't hardcode category values" true without
    // an API round trip every time the user narrows a level.
    const mainTabs = useMemo(() => rollUpTabs(categoryTree, 'categoryMain'), [categoryTree]);

    const midTabs = useMemo(() => {
        if (!filters.categoryMain) return [];
        const narrowed = categoryTree.filter((r) => r.categoryMain === filters.categoryMain);
        return rollUpTabs(narrowed, 'categoryMid');
    }, [categoryTree, filters.categoryMain]);

    const subTabs = useMemo(() => {
        if (!filters.categoryMain || !filters.categoryMid) return [];
        const narrowed = categoryTree.filter(
            (r) => r.categoryMain === filters.categoryMain && r.categoryMid === filters.categoryMid
        );
        return rollUpTabs(narrowed, 'categorySub');
    }, [categoryTree, filters.categoryMain, filters.categoryMid]);

    // Selecting a tab narrows that level and resets every level below it back to "전체" -
    // e.g. picking a new 대분류 clears whatever 중/소분류 had been selected under the old one.
    const selectMain = (value: string) => {
        const next = { ...filtersRef.current, categoryMain: value, categoryMid: '', categorySub: '' };
        setFilters(next);
        loadBoards(0, true, next);
    };
    const selectMid = (value: string) => {
        const next = { ...filtersRef.current, categoryMid: value, categorySub: '' };
        setFilters(next);
        loadBoards(0, true, next);
    };
    const selectSub = (value: string) => {
        const next = { ...filtersRef.current, categorySub: value };
        setFilters(next);
        loadBoards(0, true, next);
    };

    const handleScopeChange = (e: any) => {
        const next = { ...filtersRef.current, searchScope: e.target.value as SearchScope };
        setFilters(next);
        // Only re-run immediately if there's already an active search word - otherwise this
        // just changes which scope the *next* Enter-submitted search will use.
        if (next.searchWord) loadBoards(0, true, next);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        const value = (e.target as HTMLInputElement).value.trim();
        const next = { ...filtersRef.current, searchWord: value };
        setFilters(next);
        loadBoards(0, true, next);
    };

    const handleCardClick = (item: BoardPost) => {
        navigate("/board/boardDetail", { state: { boardList: item } });
    };
    const handleInsert = () => {
        const token = localStorage.getItem('token');
        navigate(token ? "/board/boardInsert" : "/signin");
    };

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <AdFitBanner adUnit="DAN-1z5CmB0DZNK1zHzu" width={728} height={90} />
            </Box>

            {/* Page head - title/subtitle + primary action, per design-mockup.html's .page-head */}
            <Box sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'flex-end' },
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                gap: 1.5,
                mb: 2.75,
            }}>
                <Box>
                    <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.3px', mb: 0.5 }}>게시판</Typography>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>자유롭게 기록하고 분류해서 정리하세요.</Typography>
                </Box>
                <Button
                    onClick={handleInsert}
                    startIcon={<AddIcon />}
                    sx={{
                        alignSelf: { xs: 'stretch', sm: 'auto' },
                        justifyContent: 'center',
                        bgcolor: COLORS.accent,
                        color: '#fff',
                        px: 2.25,
                        py: 1.25,
                        borderRadius: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: '0 1px 2px rgba(38,34,28,0.12)',
                        '&:hover': { bgcolor: '#211F1B' },
                    }}
                >
                    새 글 작성
                </Button>
            </Box>

            {/* Search bar: scope dropdown (custom chevron) + text input, one rounded container */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '14px',
                mb: 2.25,
                maxWidth: 520,
                overflow: 'hidden',
                '&:focus-within': { borderColor: COLORS.accent, boxShadow: `0 0 0 3px ${COLORS.accentSoft}` },
            }}>
                <Box sx={{ flexShrink: 0, borderRight: `1px solid ${COLORS.border}` }}>
                    <Select
                        value={filters.searchScope}
                        onChange={handleScopeChange}
                        variant="standard"
                        disableUnderline
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: COLORS.textSecondary,
                            bgcolor: COLORS.bg,
                            pl: 1.75,
                            '.MuiSelect-select': { py: 1.375, pr: '28px !important' },
                        }}
                    >
                        <MenuItem value="title">제목</MenuItem>
                        <MenuItem value="titleContent">제목+내용</MenuItem>
                        <MenuItem value="content">내용</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, flex: 1, minWidth: 0 }}>
                    <SearchIcon fontSize="small" sx={{ color: COLORS.textTertiary, flexShrink: 0 }} />
                    <TextField
                        variant="standard"
                        fullWidth
                        InputProps={{ disableUnderline: true }}
                        placeholder="검색어를 입력하세요"
                        onKeyUp={handleSearch}
                        sx={{ '& input': { fontSize: 13.5, py: 1.375 } }}
                    />
                </Box>
            </Box>

            {/* Row 1: 대분류 - always visible, horizontally scrollable with a fade-edge hint */}
            <Box sx={{ position: 'relative', mb: 1.25 }}>
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.25, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    {mainTabs.map((tab) => {
                        const active = filters.categoryMain === tab.value;
                        return (
                            <Box
                                key={tab.label}
                                onClick={() => selectMain(tab.value)}
                                sx={{
                                    px: 2, py: 1, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
                                    borderRadius: '999px',
                                    bgcolor: active ? COLORS.accent : COLORS.surface,
                                    color: active ? '#fff' : COLORS.textSecondary,
                                    display: 'flex', alignItems: 'center', gap: 0.875,
                                    whiteSpace: 'nowrap', flexShrink: 0,
                                    '&:hover': active ? undefined : { borderColor: '#C7CEDC', color: COLORS.textPrimary },
                                }}
                            >
                                {tab.label}
                                <Box component="span" sx={{
                                    fontSize: 11,
                                    color: active ? '#fff' : COLORS.textTertiary,
                                    bgcolor: active ? 'rgba(255,255,255,0.2)' : COLORS.bg,
                                    px: 0.75, borderRadius: '999px',
                                }}>
                                    {tab.count}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
                <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 2, width: 36, background: `linear-gradient(to right, transparent, ${COLORS.bg})`, pointerEvents: 'none' }} />
            </Box>

            {/* Row 2: 중분류 - only once a real 대분류 (not "전체") is selected */}
            {filters.categoryMain && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, overflowX: 'auto', mt: 1.25, mb: 2.75, pl: 0.25, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Box component="span" sx={{ color: COLORS.textTertiary, fontSize: 12, flexShrink: 0, mr: 0.25 }}>{filters.categoryMain} ›</Box>
                    {midTabs.map((tab) => {
                        const active = filters.categoryMid === tab.value;
                        return (
                            <Box
                                key={tab.label}
                                onClick={() => selectMid(tab.value)}
                                sx={{
                                    px: 1.5, py: 0.625, fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: '999px',
                                    border: `1px solid ${active ? COLORS.accentSoft : COLORS.border}`,
                                    bgcolor: active ? COLORS.accentSoft : COLORS.surface,
                                    color: active ? COLORS.accent : COLORS.textSecondary,
                                    whiteSpace: 'nowrap', flexShrink: 0,
                                    '&:hover': active ? undefined : { borderColor: '#C7CEDC' },
                                }}
                            >
                                {tab.label}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Row 3: 소분류 - only once a real 중분류 is selected; visually quieter than row 2 */}
            {filters.categoryMain && filters.categoryMid && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, overflowX: 'auto', mt: 1, mb: 2.75, pl: 0.25, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Box component="span" sx={{ color: COLORS.textTertiary, fontSize: 11.5, flexShrink: 0, mr: 0.25 }}>{filters.categoryMid} ›</Box>
                    {subTabs.map((tab) => {
                        const active = filters.categorySub === tab.value;
                        return (
                            <Box
                                key={tab.label}
                                onClick={() => selectSub(tab.value)}
                                sx={{
                                    px: 1.375, py: 0.5, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', borderRadius: '999px',
                                    border: `1px solid ${active ? COLORS.textPrimary : COLORS.border}`,
                                    bgcolor: active ? COLORS.textPrimary : 'transparent',
                                    color: active ? '#fff' : COLORS.textTertiary,
                                    whiteSpace: 'nowrap', flexShrink: 0,
                                    '&:hover': active ? undefined : { color: COLORS.textSecondary, borderColor: '#C7CEDC' },
                                }}
                            >
                                {tab.label}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Board cards - velog-style card: image on top when present, quiet placeholder
                when not (board_imgList may be empty; this is existing behavior, not a newnpm
                thumbnail pipeline). board_changeThumbnail is excerpt text, not an image - see
                board.types.ts. */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {boards.length > 0 ? boards.map((item) => {
                    const firstImage = item.board_imgList ? item.board_imgList.split(',')[0] : '';
                    return (
                        <Box
                            key={item.board_no}
                            onClick={() => handleCardClick(item)}
                            sx={{
                                bgcolor: COLORS.surface,
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: '10px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'border-color .15s, transform .1s, box-shadow .15s',
                                '&:hover': { borderColor: '#C7CEDC', transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(24,24,27,0.06)' },
                            }}
                        >
                            <Box sx={{
                                width: '100%',
                                aspectRatio: '16/9',
                                position: 'relative',
                                overflow: 'hidden',
                                background: firstImage ? undefined : `linear-gradient(135deg, ${COLORS.accentSoft}, #E3DCD1)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.accent,
                            }}>
                                {firstImage ? (
                                    <img
                                        src={toThumbnailUrl(firstImage)}
                                        alt="썸네일"
                                        style={{
                                            position: 'absolute',
                                            top: 0, left: 0,
                                            width: '100%', height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        onError={(e) => {
                                            const img = e.currentTarget;
                                            if (img.src !== firstImage) img.src = firstImage;
                                        }}
                                    />
                                ) : (
                                    <ImageIcon sx={{ fontSize: 36, opacity: 0.35 }} />
                                )}
                            </Box>
                            <Box sx={{ p: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 1.125 }}>
                                {item.board_categoryMain && (
                                    <Box component="span" sx={{
                                        alignSelf: 'flex-start', fontSize: 11, fontWeight: 700,
                                        color: COLORS.accent, bgcolor: COLORS.accentSoft, px: 1, py: '3px', borderRadius: '6px',
                                    }}>
                                        {item.board_categoryMain}
                                    </Box>
                                )}
                                <Typography sx={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.1px', lineHeight: 1.4 }} noWrap>
                                    {item.board_title}
                                </Typography>
                                {/* board_changeThumbnail is only populated on older posts now -
                                    the insert/update forms stopped collecting it since the card
                                    image above already comes from board_imgList[0] instead. */}
                                {item.board_changeThumbnail && (
                                    <Typography
                                        sx={{
                                            fontSize: 12.5, color: COLORS.textSecondary, lineHeight: 1.6,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: item.board_changeThumbnail }}
                                    />
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, fontSize: 11.5, color: COLORS.textTertiary }}>
                                    <span>{item.board_date?.substring(0, 10)}</span>
                                    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.375 }}>
                                            <RemoveRedEyeIcon sx={{ fontSize: 14 }} /> {item.board_hit}
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.375 }}>
                                            <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} /> {item.commentCount ?? 0}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    );
                }) : (
                    <Typography sx={{ gridColumn: '1 / -1', textAlign: 'center', color: COLORS.textSecondary, py: 6 }}>
                        {isLoading ? '' : '게시물이 존재하지 않습니다'}
                    </Typography>
                )}
            </Box>

            {isLoading && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', mt: 2 }}>
                    {/* One skeleton per post in a batch (now 8, matching the backend's LIMIT) so
                        the placeholder grid fills the same number of rows the real results will. */}
                    {Array.from({ length: 8 }).map((_, i) => <BoardSkeleton key={i} />)}
                </Box>
            )}

            <Box id='observer' style={{ width: '100%', height: '300px' }} />
        </Box>
    );
}
