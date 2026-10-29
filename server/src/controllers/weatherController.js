import { fetchWeatherForecast } from '../services/weatherService.js';
import { Destination } from '../models/Destination.js';
import { ItineraryItem } from '../models/ItineraryItem.js';

export async function getTripWeather(req, res, next) {
  try {
    const trip = req.trip;

    let lat = null;
    let lon = null;
    let locationName = trip.primaryDestinationName || trip.title;

    // 1. Try first destination from trip.destinations
    if (trip.destinations && trip.destinations.length > 0) {
      const dest = await Destination.findById(trip.destinations[0]);
      if (dest && dest.latitude != null && dest.longitude != null) {
        lat = dest.latitude;
        lon = dest.longitude;
        locationName = `${dest.name}, ${dest.country}`;
      }
    }

    // 2. If not found, try first itinerary activity with coordinates
    if (lat == null) {
      const firstItem = await ItineraryItem.findOne({
        trip: trip._id,
        latitude: { $ne: null },
        longitude: { $ne: null }
      });
      if (firstItem) {
        lat = firstItem.latitude;
        lon = firstItem.longitude;
        locationName = firstItem.locationName || locationName;
      }
    }

    if (lat == null || lon == null) {
      return res.status(200).json({
        success: true,
        weather: {
          available: false,
          reason: 'No location coordinates configured for this trip. Add a destination or activity with coordinates to view live weather forecasts.'
        }
      });
    }

    const weatherData = await fetchWeatherForecast(lat, lon);

    return res.status(200).json({
      success: true,
      weather: {
        ...weatherData,
        locationName,
        coordinates: { lat, lon }
      }
    });
  } catch (err) {
    next(err);
  }
}
