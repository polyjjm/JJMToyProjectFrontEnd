import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface WeatherProps {
  city: string;
  temp: number;
  description: string;
}

const WeatherCard: React.FC<WeatherProps> = ({ city, temp, description }) => {
  return (
    <Card sx={{ minWidth: 275, mt: 4 }}>
      <CardContent>
        <Typography variant="h5">{city}</Typography>
        <Typography variant="h4">{temp}°C</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;