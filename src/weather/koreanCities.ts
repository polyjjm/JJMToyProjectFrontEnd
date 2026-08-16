// City list for the weather widget's location selector (WeatherMain.tsx). `query` is the exact
// string OpenWeatherMap's /weather and /forecast endpoints expect for the `q` param (used as
// "{query},KR" - see fetchWeatherByCity/fetchForecastByCity in common.tsx, unchanged).
//
// Provinces (도) don't have their own weather station, so each is represented by its
// provincial-capital city rather than the province name itself - e.g. 경기도 -> Suwon, not
// "Gyeonggi-do". All 17 특별시/광역시/도-level divisions are covered (either directly, for the
// 8 metro-level cities, or via their capital), plus other major cities within each province.
export interface KoreanCity {
    label: string;  // Korean display name
    query: string;  // OpenWeatherMap city name (English) - combined with ",KR" when fetching
    region: string; // province/metro grouping, shown as a section header in the picker
}

export const KOREAN_CITIES: KoreanCity[] = [
    // 8 특별시/광역시/특별자치시 - each is its own top-level entry.
    { label: '서울특별시', query: 'Seoul', region: '특별시·광역시' },
    { label: '부산광역시', query: 'Busan', region: '특별시·광역시' },
    { label: '대구광역시', query: 'Daegu', region: '특별시·광역시' },
    { label: '인천광역시', query: 'Incheon', region: '특별시·광역시' },
    { label: '광주광역시', query: 'Gwangju', region: '특별시·광역시' },
    { label: '대전광역시', query: 'Daejeon', region: '특별시·광역시' },
    { label: '울산광역시', query: 'Ulsan', region: '특별시·광역시' },
    { label: '세종특별자치시', query: 'Sejong', region: '특별시·광역시' },

    // 경기도 (도청 소재지: 수원) + 주요 도시
    { label: '수원시', query: 'Suwon', region: '경기도' },
    { label: '고양시', query: 'Goyang', region: '경기도' },
    { label: '용인시', query: 'Yongin', region: '경기도' },
    { label: '성남시', query: 'Seongnam', region: '경기도' },
    { label: '안양시', query: 'Anyang', region: '경기도' },
    { label: '평택시', query: 'Pyeongtaek', region: '경기도' },
    { label: '의정부시', query: 'Uijeongbu', region: '경기도' },
    { label: '남양주시', query: 'Namyangju', region: '경기도' },

    // 강원도 (도청 소재지: 춘천)
    { label: '춘천시', query: 'Chuncheon', region: '강원도' },
    { label: '원주시', query: 'Wonju', region: '강원도' },
    { label: '강릉시', query: 'Gangneung', region: '강원도' },

    // 충청북도 (도청 소재지: 청주)
    { label: '청주시', query: 'Cheongju', region: '충청북도' },
    { label: '충주시', query: 'Chungju', region: '충청북도' },

    // 충청남도
    { label: '천안시', query: 'Cheonan', region: '충청남도' },
    { label: '아산시', query: 'Asan', region: '충청남도' },
    { label: '서산시', query: 'Seosan', region: '충청남도' },

    // 전라북도 (도청 소재지: 전주)
    { label: '전주시', query: 'Jeonju', region: '전라북도' },
    { label: '군산시', query: 'Gunsan', region: '전라북도' },
    { label: '익산시', query: 'Iksan', region: '전라북도' },

    // 전라남도
    { label: '목포시', query: 'Mokpo', region: '전라남도' },
    { label: '여수시', query: 'Yeosu', region: '전라남도' },
    { label: '순천시', query: 'Suncheon', region: '전라남도' },

    // 경상북도 (도청 소재지: 안동)
    { label: '포항시', query: 'Pohang', region: '경상북도' },
    { label: '안동시', query: 'Andong', region: '경상북도' },
    { label: '구미시', query: 'Gumi', region: '경상북도' },
    { label: '경주시', query: 'Gyeongju', region: '경상북도' },

    // 경상남도 (도청 소재지: 창원)
    { label: '창원시', query: 'Changwon', region: '경상남도' },
    { label: '진주시', query: 'Jinju', region: '경상남도' },
    { label: '김해시', query: 'Gimhae', region: '경상남도' },

    // 제주특별자치도
    { label: '제주시', query: 'Jeju', region: '제주특별자치도' },
    { label: '서귀포시', query: 'Seogwipo', region: '제주특별자치도' },
];

export const DEFAULT_CITY: KoreanCity = KOREAN_CITIES[0]; // 서울특별시
