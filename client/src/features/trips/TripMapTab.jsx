import React, { useEffect, useMemo } from 'react';
import { Box, Typography, Card, Chip, Button } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigationIcon from '@mui/icons-material/Navigation';

// Fix Leaflet's default icon path issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Component to dynamically fit map bounds to all markers
function MapBoundsFitter({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, map]);

  return null;
}

export default function TripMapTab({ trip, days = [], items = [] }) {
  // Filter items that have coordinates
  const itemsWithCoords = useMemo(() => {
    return items.filter(
      (it) => it.latitude != null && it.longitude != null && !isNaN(it.latitude) && !isNaN(it.longitude)
    );
  }, [items]);

  const polylineCoords = useMemo(() => {
    return itemsWithCoords.map((it) => [it.latitude, it.longitude]);
  }, [itemsWithCoords]);

  // Default fallback center (Tokyo or 0,0)
  const defaultCenter = itemsWithCoords.length > 0
    ? [itemsWithCoords[0].latitude, itemsWithCoords[0].longitude]
    : [35.6762, 139.6503];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Interactive Trip & Itinerary Route Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {itemsWithCoords.length} plotted location(s) with sequential travel paths.
          </Typography>
        </Box>
        <Chip
          label="OpenStreetMap Tiles"
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {itemsWithCoords.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <LocationOnIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            No coordinates plotted yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
            Add latitude and longitude to your itinerary activities or bookings to visualize route polylines and markers.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, overflow: 'hidden', height: 600, border: '1px solid', borderColor: 'divider' }}>
          <MapContainer
            center={defaultCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBoundsFitter points={polylineCoords} />

            {/* Polyline connecting sequential activities */}
            {polylineCoords.length > 1 && (
              <Polyline
                positions={polylineCoords}
                pathOptions={{ color: '#0284c7', weight: 4, opacity: 0.8, dashArray: '6, 8' }}
              />
            )}

            {/* Markers */}
            {itemsWithCoords.map((item, idx) => {
              const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

              return (
                <Marker key={item._id || idx} position={[item.latitude, item.longitude]}>
                  <Popup>
                    <Box sx={{ p: 0.5, minWidth: 180 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                        #{idx + 1} {item.title}
                      </Typography>
                      {item.startTime && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ⏰ {item.startTime} {item.endTime ? '— ' + item.endTime : ''}
                        </Typography>
                      )}
                      {item.locationName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          📍 {item.locationName}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1.5 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<NavigationIcon />}
                          href={navUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontSize: '0.72rem', py: 0.4 }}
                        >
                          Google Maps
                        </Button>
                      </Box>
                    </Box>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </Card>
      )}
    </Box>
  );
}

