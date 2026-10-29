import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import api from '../../lib/axios.js';

export default function WeatherTab({ trip }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const res = await api.get(`/trips/${trip._id}/weather`);
        if (res.data.success) {
          setWeather(res.data.weather);
        }
      } catch (err) {
        setWeather({ available: false, reason: 'Weather provider currently unavailable' });
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [trip._id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!weather || !weather.available) {
    return (
      <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <CloudQueueIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Weather Forecast Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          {weather?.reason || 'Add coordinates to your destination or itinerary activities to display live weather forecasts.'}
        </Typography>
      </Card>
    );
  }

  const forecast = weather.forecast || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Destination Weather Forecast: {weather.locationName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live multi-day forecast powered by Open-Meteo API.
          </Typography>
        </Box>
        <Chip label="Live Weather Feed" size="small" color="primary" variant="outlined" />
      </Box>

      <Grid container spacing={2}>
        {forecast.map((day, idx) => {
          const dateObj = new Date(day.date);
          const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
          const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          return (
            <Grid item xs={6} sm={4} md={2.4} key={idx}>
              <Card sx={{ textAlign: 'center', p: 1.5, height: '100%' }}>
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {dayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                    {dateStr}
                  </Typography>

                  <Typography variant="h3" sx={{ my: 1 }}>
                    {day.icon || '⛅'}
                  </Typography>

                  <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 1.5 }}>
                    {day.condition}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="error.main">
                      {day.tempMax}°C
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={500} color="primary.main">
                      {day.tempMin}°C
                    </Typography>
                  </Box>

                  {day.precipitationProb > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <UmbrellaIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" fontWeight={600}>
                        {day.precipitationProb}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

