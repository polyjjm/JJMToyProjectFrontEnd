import { useEffect, useMemo, useState } from 'react';
import { Box, InputBase, Popover, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { fetchWeatherByCity, fetchForecastByCity } from '../common/common';
import { COLORS } from '../theme';
import { DEFAULT_CITY, KOREAN_CITIES, KoreanCity } from './koreanCities';

const STORAGE_KEY = 'dashboard_weather_city_query';

function loadStoredCity(): KoreanCity {
  const storedQuery = localStorage.getItem(STORAGE_KEY);
  return KOREAN_CITIES.find((c) => c.query === storedQuery) || DEFAULT_CITY;
}

// Groups an already-filtered city list by region, preserving KOREAN_CITIES' original region
// order (Map iteration order = insertion order) rather than alphabetizing.
function groupByRegion(cities: KoreanCity[]): [string, KoreanCity[]][] {
  const groups = new Map<string, KoreanCity[]>();
  for (const city of cities) {
    if (!groups.has(city.region)) groups.set(city.region, []);
    groups.get(city.region)!.push(city);
  }
  return Array.from(groups.entries());
}

// OpenWeatherMap's icon codes (e.g. "02d") mapped to a plain emoji, matching
// dashboard-mockup.html's icon treatment instead of the old component's PNG icon images.
function iconEmoji(owmIcon: string): string {
  const code = owmIcon.slice(0, 2);
  const isNight = owmIcon.endsWith('n');
  switch (code) {
    case '01': return isNight ? '🌙' : '☀️';
    case '02': return '🌤️';
    case '03': return '⛅';
    case '04': return '☁️';
    case '09': return '🌦️';
    case '10': return '🌧️';
    case '11': return '⛈️';
    case '13': return '❄️';
    case '50': return '🌫️';
    default: return '⛅';
  }
}

interface CurrentWeather {
  temp: number;
  feelsLike: number;
  tempMax: number;
  tempMin: number;
  description: string;
  icon: string;
}

interface HourlyPoint {
  label: string;
  icon: string;
  temp: number;
}

// Compact weather widget for the dashboard (see dashboard-mockup.html) - reuses the exact same
// fetchWeatherByCity/fetchForecastByCity OpenWeatherMap integration as before, just presented
// as a small always-loaded card instead of a full-page search-first hero.
//
// The mockup's hourly strip shows consecutive clock hours (15시, 16시, 17시...), but the
// forecast API this reuses only returns 3-hour steps (OpenWeatherMap's free /forecast
// endpoint, not the hourly One Call API - switching to that would be a new integration, not a
// layout pass) - so the strip below shows "지금" plus the next 5 real 3-hour-step entries at
// their actual times, rather than fabricating hourly data that isn't there.
export default function WeatherMain() {
  const [city, setCity] = useState<KoreanCity>(loadStoredCity);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [error, setError] = useState(false);

  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      setError(false);
      try {
        const query = `${city.query},KR`;
        const [weather, forecast] = await Promise.all([
          fetchWeatherByCity(query),
          fetchForecastByCity(query),
        ]);

        setCurrent({
          temp: Math.round(weather.main.temp),
          feelsLike: Math.round(weather.main.feels_like),
          tempMax: Math.round(weather.main.temp_max),
          tempMin: Math.round(weather.main.temp_min),
          description: weather.weather[0].description,
          icon: weather.weather[0].icon,
        });

        // Every remaining 3-hour entry for the rest of today, not a fixed count - the list is
        // chronological, so entries stop being "today" exactly once (when dt_txt's date part
        // rolls over), which is where this cuts off.
        const list = forecast.list || [];
        const todayDatePart = list[0]?.dt_txt?.split(' ')[0];
        const points: HourlyPoint[] = [];
        for (const item of list) {
          if (item.dt_txt.split(' ')[0] !== todayDatePart) break;
          points.push({
            label: `${item.dt_txt.split(' ')[1].slice(0, 2)}시`,
            icon: item.weather[0].icon,
            temp: Math.round(item.main.temp),
          });
        }
        setHourly(points);
      } catch {
        setError(true);
      }
    })();
  }, [city]);

  const filteredGroups = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    const filtered = text
      ? KOREAN_CITIES.filter((c) => c.label.toLowerCase().includes(text) || c.query.toLowerCase().includes(text))
      : KOREAN_CITIES;
    return groupByRegion(filtered);
  }, [searchText]);

  const openPicker = (e: React.MouseEvent<HTMLElement>) => {
    setSearchText('');
    setPickerAnchor(e.currentTarget);
  };
  const closePicker = () => setPickerAnchor(null);

  const selectCity = (next: KoreanCity) => {
    setCity(next);
    localStorage.setItem(STORAGE_KEY, next.query);
    closePicker();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '18px 22px 0' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.875, color: COLORS.textPrimary }}>
          <Box component="span" sx={{ fontSize: 15 }}>🌤️</Box> 날씨
        </Typography>
      </Box>

      <Box sx={{ p: '8px 22px 22px' }}>
        <Box
          onClick={openPicker}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 12.5, color: COLORS.textSecondary,
            bgcolor: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: '999px', px: '10px', py: '5px', mt: 1,
            cursor: 'pointer', '&:hover': { borderColor: COLORS.accent, color: COLORS.textPrimary },
          }}
        >
          📍 {city.label}
          <KeyboardArrowDownIcon sx={{ fontSize: 13 }} />
        </Box>

        <Popover
          open={!!pickerAnchor}
          anchorEl={pickerAnchor}
          onClose={closePicker}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{ paper: { sx: { width: 260, borderRadius: '12px', border: `1px solid ${COLORS.border}`, mt: 0.5 } } }}
        >
          <Box sx={{ p: 1.25, borderBottom: `1px solid ${COLORS.border}` }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: COLORS.bg,
              border: `1px solid ${COLORS.border}`, borderRadius: '10px', px: 1.25, py: 0.875,
            }}>
              <SearchIcon sx={{ fontSize: 15, color: COLORS.textTertiary }} />
              <InputBase
                autoFocus
                placeholder="지역 검색 (한글/영문)"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ fontSize: 12.5, width: '100%' }}
              />
            </Box>
          </Box>

          <Box sx={{ maxHeight: 320, overflowY: 'auto', py: 0.5 }}>
            {filteredGroups.length === 0 && (
              <Typography sx={{ fontSize: 12.5, color: COLORS.textTertiary, textAlign: 'center', py: 3 }}>
                검색 결과가 없습니다
              </Typography>
            )}
            {filteredGroups.map(([region, cities]) => (
              <Box key={region}>
                <Typography sx={{
                  fontSize: 10.5, fontWeight: 700, color: COLORS.textTertiary, textTransform: 'uppercase',
                  letterSpacing: '0.04em', px: 1.5, pt: 1, pb: 0.5,
                }}>
                  {region}
                </Typography>
                {cities.map((c) => (
                  <Box
                    key={c.query}
                    onClick={() => selectCity(c)}
                    sx={{
                      px: 1.5, py: 0.75, fontSize: 13, cursor: 'pointer',
                      fontWeight: c.query === city.query ? 700 : 500,
                      color: c.query === city.query ? COLORS.accent : COLORS.textPrimary,
                      bgcolor: c.query === city.query ? COLORS.accentSoft : 'transparent',
                      '&:hover': { bgcolor: c.query === city.query ? COLORS.accentSoft : COLORS.bg },
                    }}
                  >
                    {c.label}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Popover>

        {error && (
          <Typography sx={{ fontSize: 12.5, color: COLORS.textTertiary, mt: 2 }}>
            날씨 정보를 불러오지 못했습니다.
          </Typography>
        )}

        {current && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: '18px' }}>
              <Box sx={{ fontSize: 46, lineHeight: 1 }}>{iconEmoji(current.icon)}</Box>
              <Box>
                <Typography sx={{ fontSize: 40, fontWeight: 700, letterSpacing: '-1px', color: COLORS.textPrimary }}>
                  {current.temp}°
                </Typography>
                <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, mt: 0.25 }}>
                  {current.description} · 체감 {current.feelsLike}°
                </Typography>
                <Typography sx={{ fontSize: 12, color: COLORS.textTertiary, mt: 0.25 }}>
                  최고 {current.tempMax}° · 최저 {current.tempMin}°
                </Typography>
              </Box>
            </Box>

            {hourly.length > 0 && (
              <Box sx={{
                display: 'flex', gap: 0.75, overflowX: 'auto', pt: '14px',
                borderTop: `1px solid ${COLORS.border}`, mt: 0.5,
              }}>
                <Box sx={{
                  flexShrink: 0, width: 52, textAlign: 'center', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 0.75, py: 1, borderRadius: '10px', bgcolor: COLORS.accentSoft,
                }}>
                  <Typography sx={{ fontSize: 11, color: COLORS.textTertiary, fontWeight: 600 }}>지금</Typography>
                  <Box sx={{ fontSize: 18 }}>{iconEmoji(current.icon)}</Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary }}>{current.temp}°</Typography>
                </Box>
                {hourly.map((point, i) => (
                  <Box key={i} sx={{
                    flexShrink: 0, width: 52, textAlign: 'center', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 0.75, py: 1, borderRadius: '10px',
                  }}>
                    <Typography sx={{ fontSize: 11, color: COLORS.textTertiary, fontWeight: 600 }}>{point.label}</Typography>
                    <Box sx={{ fontSize: 18 }}>{iconEmoji(point.icon)}</Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary }}>{point.temp}°</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
