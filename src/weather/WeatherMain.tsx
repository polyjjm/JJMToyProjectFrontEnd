import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  InputAdornment,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchWeatherByCity, fetchForecastByCity } from '../common/common';

const cityImages: Record<string, string> = {
  Seoul: 'https://source.unsplash.com/1600x900/?seoul,city,sky',
  Busan: 'https://source.unsplash.com/1600x900/?busan,beach,sky',
  Jeju: 'https://source.unsplash.com/1600x900/?jeju,island,sky',
  Default: 'https://source.unsplash.com/1600x900/?weather,sky,nature',
};

function groupForecastByDay(list: any[]) {
  const result: Record<string, any[]> = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!result[date]) result[date] = [];
    result[date].push(item);
  });
  return result;
}

function summarizeDailyWeather(items: any[]) {
  const temps = items.map((i) => i.main.temp);
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
  const description = items[0].weather[0].description;
  const icon = items[0].weather[0].icon;
  return { temp: avgTemp, description, icon };
}

export default function WeatherMain() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [bgImage, setBgImage] = useState<string>(cityImages.Default);

  const koreanToEnglishCityMap: Record<string, string> = {
    경기도: 'Suwon', 서울: 'Seoul', 부산: 'Busan', 대구: 'Daegu',
    인천: 'Incheon', 광주: 'Gwangju', 대전: 'Daejeon', 울산: 'Ulsan',
    수원: 'Suwon', 청주: 'Cheongju', 전주: 'Jeonju', 춘천: 'Chuncheon',
    제주: 'Jeju', 성남: 'Seongnam', 고양: 'Goyang', 용인: 'Yongin',
    안양: 'Anyang', 평택: 'Pyeongtaek', 의정부: 'Uijeongbu', 남양주: 'Namyangju',
  };

  const handleSearch = async () => {
    const trimmedCity = city.trim();
    const engCity = koreanToEnglishCityMap[trimmedCity] || trimmedCity;
    const query = `${engCity},KR`;

    try {
      const current = await fetchWeatherByCity(query);
      const forecastData = await fetchForecastByCity(query);
      console.log(current ,'지금')
      console.log(forecastData,'3일후')
      const grouped = groupForecastByDay(forecastData.list);
      const dates = Object.keys(grouped);

      setWeather({
        city: current.name,
        temp: current.main.temp,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
      });

      setForecast({
        list: forecastData.list,
        tomorrow: summarizeDailyWeather(grouped[dates[1]]),
        dayAfterTomorrow: summarizeDailyWeather(grouped[dates[2]]),
      });

      setBgImage(cityImages[engCity] || cityImages.Default);
    } catch (err) {
      alert('날씨 정보를 불러올 수 없습니다. 도시명을 다시 확인해주세요.');
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: '#fff',
        py: 5,
        px: 2,
      }}
    >
      <Container maxWidth="md" sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, p: 4, backdropFilter: 'blur(10px)' }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#fff' }}>
          🌤️ 오늘의 날씨
        </Typography>

        <Paper
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          sx={{
            p: '4px 8px',
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <TextField
            variant="standard"
            placeholder="도시 이름 (예: 서울, 부산)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ ml: 1, flex: 1 }}
          />
          <Button variant="contained" type="submit" color="secondary" sx={{ borderRadius: 5, px: 3 }}>
            검색
          </Button>
        </Paper>

        {weather && (
          <Card sx={{ mb: 4, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4">{weather.city}</Typography>
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                style={{ margin: '0 auto' }}
              />
              <Typography variant="h2">{weather.temp}°C</Typography>
              <Typography variant="h6">{weather.description}</Typography>
            </CardContent>
          </Card>
        )}

        {forecast && (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              📅 내일 & 모레 요약
            </Typography>
            <Grid container spacing={2} mb={4}>
              {[forecast.tomorrow, forecast.dayAfterTomorrow].map((day, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card sx={{ borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="h6">{idx === 0 ? '내일' : '모레'}</Typography>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.description}
                        style={{ margin: '0 auto' }}
                      />
                      <Typography variant="h4">{day.temp}°C</Typography>
                      <Typography>{day.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              ⏱ 3시간 간격 예보
            </Typography>
            <Box sx={{ overflowX: 'auto', display: 'flex', gap: 2, py: 2 }}>
              {forecast.list.map((item: any, idx: number) => (
                <Card
                  key={idx}
                  sx={{
                    minWidth: 180,
                    flexShrink: 0,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    textAlign: 'center',
                    color: '#fff',
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle2">{item.dt_txt.split(' ')[0]}</Typography>
                    <Typography variant="subtitle2">{item.dt_txt.split(' ')[1]}</Typography>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                      style={{ margin: '0 auto' }}
                    />
                    <Typography variant="h6">{item.main.temp}°C</Typography>
                    <Typography>{item.weather[0].description}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}