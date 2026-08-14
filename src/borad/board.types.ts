// Shared board post shape, used by the list page, detail page, and the insert/update forms.
// These 4 files used to each redefine their own slightly-different subset of this interface;
// now that hashtags are gone and every one of them needs the same 3 new category fields plus
// commentCount, keeping one definition here avoids the 4 copies drifting out of sync again.
export interface BoardPost {
    board_no: number;
    board_title: string;
    board_userName: string;
    board_writer: string;
    // NOTE: despite the name, this is excerpt/description text rendered via
    // dangerouslySetInnerHTML - not an image. The actual card thumbnail image comes from
    // the first entry in board_imgList. This naming predates this change; left as-is since
    // renaming the column would touch far more callers than this pass needs.
    board_changeThumbnail: string;
    board_content: string;
    board_hit: string | number;
    board_like: string | number;
    board_hate: string | number;
    board_date: string;
    board_imgList: string;
    // 3-tier freeform category - see boardMapper.xml on the backend for the filtering logic.
    board_categoryMain: string | null;
    board_categoryMid: string | null;
    board_categorySub: string | null;
    // Not stored on the post itself - populated by a correlated subquery on the backend.
    commentCount: number;
}

// Subset of BoardPost editable through the insert/update forms, plus the upload-only fields
// those forms need while staging content-embedded images before submit.
export interface BoardFormState {
    board_title: string;
    board_content: string;
    board_userName: string | null;
    board_changeThumbnail: string;
    board_categoryMain: string;
    board_categoryMid: string;
    board_categorySub: string;
    boardImgList: { idx: number; value: string }[];
    boardImgLegacyList: { idx: number; value: string }[];
}

// One row of the category tree returned by GET /board/categoryTree: a (대,중,소) combination
// that actually exists on at least one post, and how many posts have exactly that combination.
export interface CategoryCount {
    categoryMain: string | null;
    categoryMid: string | null;
    categorySub: string | null;
    count: number;
}

// A single pill in one of the 3 tab rows, after rolling CategoryCount rows up by level.
export interface CategoryTab {
    label: string;
    value: string; // '' means "전체" (no filter at this level)
    count: number;
}
