import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Destination } from '../models/Destination.js';
import { Trip } from '../models/Trip.js';
import { TripMember } from '../models/TripMember.js';
import { ItineraryDay } from '../models/ItineraryDay.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { Reservation } from '../models/Reservation.js';
import { Comment } from '../models/Comment.js';
import { DestinationVote } from '../models/DestinationVote.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { toMinorUnits } from '../utils/moneyMath.js';
import { logger } from '../utils/logger.js';

const DESTINATIONS = [
  {
    name: 'Tokyo',
    slug: 'tokyo-japan',
    country: 'Japan',
    region: 'East Asia',
    description: 'An ultra-modern metropolis blending neon-lit skyscrapers with historic temples and world-class culinary wonders.',
    categories: ['City', 'Culture', 'Food', 'Shopping'],
    latitude: 35.6762,
    longitude: 139.6503,
    imageReferences: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 5,
    averageCostPerDayMinor: 16000
  },
  {
    name: 'Kyoto',
    slug: 'kyoto-japan',
    country: 'Japan',
    region: 'East Asia',
    description: 'The cultural capital of Japan featuring classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.',
    categories: ['Culture', 'History', 'Nature'],
    latitude: 35.0116,
    longitude: 135.7681,
    imageReferences: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 4,
    averageCostPerDayMinor: 14000
  },
  {
    name: 'Paris',
    slug: 'paris-france',
    country: 'France',
    region: 'Western Europe',
    description: 'The City of Light renowned for the Eiffel Tower, the Louvre museum, iconic café culture, and haute cuisine.',
    categories: ['City', 'Culture', 'Romantic', 'Art', 'Food'],
    latitude: 48.8566,
    longitude: 2.3522,
    imageReferences: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 4,
    averageCostPerDayMinor: 20000
  },
  {
    name: 'Rome',
    slug: 'rome-italy',
    country: 'Italy',
    region: 'Southern Europe',
    description: 'The Eternal City with nearly 3,000 years of globally influential art, architecture, and ancient ruins like the Colosseum.',
    categories: ['History', 'Culture', 'Food', 'City'],
    latitude: 41.9028,
    longitude: 12.4964,
    imageReferences: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 4,
    averageCostPerDayMinor: 17000
  },
  {
    name: 'Barcelona',
    slug: 'barcelona-spain',
    country: 'Spain',
    region: 'Southern Europe',
    description: 'Vibrant seaside city famous for Gaudí architecture, lively tapas bars, Gothic quarters, and sunny Mediterranean beaches.',
    categories: ['Beach', 'Culture', 'Food', 'Architecture', 'Nightlife'],
    latitude: 41.3851,
    longitude: 2.1734,
    imageReferences: ['https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 4,
    averageCostPerDayMinor: 15000
  },
  {
    name: 'New York City',
    slug: 'new-york-city-usa',
    country: 'United States',
    region: 'North America',
    description: 'The premier global hub of arts, theatre, finance, fashion, and culinary diversity that never sleeps.',
    categories: ['City', 'Entertainment', 'Shopping', 'Art', 'Food'],
    latitude: 40.7128,
    longitude: -74.006,
    imageReferences: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 5,
    averageCostPerDayMinor: 25000
  },
  {
    name: 'Bali',
    slug: 'bali-indonesia',
    country: 'Indonesia',
    region: 'Southeast Asia',
    description: 'Tropical paradise known for forested volcanic mountains, iconic rice paddies, pristine beaches, and coral reefs.',
    categories: ['Beach', 'Nature', 'Relaxation', 'Adventure'],
    latitude: -8.4095,
    longitude: 115.1889,
    imageReferences: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 6,
    averageCostPerDayMinor: 9000
  },
  {
    name: 'Cape Town',
    slug: 'cape-town-south-africa',
    country: 'South Africa',
    region: 'Africa',
    description: 'Spectacular coastal city nestled beneath Table Mountain, offering dramatic ocean views, wine valleys, and wildlife.',
    categories: ['Nature', 'Adventure', 'Beach', 'Wine'],
    latitude: -33.9249,
    longitude: 18.4241,
    imageReferences: ['https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 5,
    averageCostPerDayMinor: 11000
  },
  {
    name: 'Sydney',
    slug: 'sydney-australia',
    country: 'Australia',
    region: 'Oceania',
    description: 'World-famous harbour city boasting the Sydney Opera House, Harbour Bridge, Bondi Beach, and vibrant coastal lifestyle.',
    categories: ['City', 'Beach', 'Nature', 'Culture'],
    latitude: -33.8688,
    longitude: 151.2093,
    imageReferences: ['https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 5,
    averageCostPerDayMinor: 19000
  },
  {
    name: 'London',
    slug: 'london-uk',
    country: 'United Kingdom',
    region: 'Western Europe',
    description: 'A historic capital packed with iconic landmarks, West End theater, royalty, free national museums, and royal parks.',
    categories: ['City', 'History', 'Culture', 'Museums', 'Shopping'],
    latitude: 51.5074,
    longitude: -0.1278,
    imageReferences: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 5,
    averageCostPerDayMinor: 21000
  },
  {
    name: 'Reykjavik',
    slug: 'reykjavik-iceland',
    country: 'Iceland',
    region: 'Northern Europe',
    description: 'Gateway to surreal volcanic landscapes, natural hot springs, majestic glaciers, and mesmerizing Northern Lights.',
    categories: ['Nature', 'Adventure', 'Relaxation'],
    latitude: 64.1466,
    longitude: -21.9426,
    imageReferences: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 4,
    averageCostPerDayMinor: 22000
  },
  {
    name: 'Bangkok',
    slug: 'bangkok-thailand',
    country: 'Thailand',
    region: 'Southeast Asia',
    description: 'Buzzing capital famed for ornate shrines, lively street food, bustling floating markets, and rich nightlife.',
    categories: ['City', 'Food', 'Culture', 'Budget'],
    latitude: 13.7563,
    longitude: 100.5018,
    imageReferences: ['https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80'],
    recommendedDurationDays: 4,
    averageCostPerDayMinor: 7500
  }
];

export async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB for seeding...');

    // Clear existing sample collections
    await Promise.all([
      User.deleteMany({ email: { $in: ['demo@routecraft.com', 'alex@routecraft.com'] } }),
      Destination.deleteMany({}),
      Trip.deleteMany({ title: { $regex: /Summer in Japan/i } }),
      TripMember.deleteMany({}),
      ItineraryDay.deleteMany({}),
      ItineraryItem.deleteMany({}),
      Expense.deleteMany({}),
      Settlement.deleteMany({}),
      Reservation.deleteMany({}),
      Comment.deleteMany({}),
      DestinationVote.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // 1. Seed Destinations
    const createdDestinations = await Destination.insertMany(DESTINATIONS);
    logger.info(`Seeded ${createdDestinations.length} destinations.`);

    const tokyoDest = createdDestinations.find((d) => d.name === 'Tokyo');
    const kyotoDest = createdDestinations.find((d) => d.name === 'Kyoto');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'demo@routecraft.com',
      passwordHash: demoPasswordHash,
      preferredCurrency: 'USD',
      timezone: 'America/New_York',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    });

    const companionUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex@routecraft.com',
      passwordHash: demoPasswordHash,
      preferredCurrency: 'USD',
      timezone: 'America/New_York',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    });

    logger.info(`Seeded demo users: demo@routecraft.com & alex@routecraft.com (password: password123)`);

    // 3. Seed Sample Trip: Summer in Japan
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14); // 2 weeks from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4); // 5-day trip

    const trip = await Trip.create({
      title: 'Summer in Japan — Tokyo & Kyoto',
      description: 'An unforgettable 5-day expedition through high-tech Shibuya, historic Asakusa, scenic Arashiyama bamboo forest, and traditional Gion.',
      startDate,
      endDate,
      destinations: [tokyoDest._id, kyotoDest._id],
      primaryDestinationName: 'Tokyo, Japan',
      owner: demoUser._id,
      currency: 'USD',
      totalBudgetMinor: toMinorUnits(2800),
      dailyBudgetMinor: toMinorUnits(560),
      status: 'PLANNING',
      preferences: {
        travelStyle: 'BALANCED',
        interests: ['Culture', 'Food', 'Photography', 'Historic Sites']
      }
    });

    // Trip Members
    await TripMember.create([
      {
        trip: trip._id,
        user: demoUser._id,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date()
      },
      {
        trip: trip._id,
        user: companionUser._id,
        role: 'EDITOR',
        status: 'ACTIVE',
        joinedAt: new Date()
      }
    ]);

    // 4. Seed Itinerary Days (5 days)
    const dayDocs = [];
    for (let i = 0; i < 5; i++) {
      const curDate = new Date(startDate);
      curDate.setDate(curDate.getDate() + i);
      const dayTitles = [
        'Arrival & Neon Shibuya',
        'Historic Asakusa & Akihabara',
        'Bullet Train to Kyoto & Fushimi Inari',
        'Arashiyama Bamboo Grove & Kinkaku-ji',
        'Gion Geisha District & Farewell Dinner'
      ];
      dayDocs.push({
        trip: trip._id,
        date: curDate,
        dayNumber: i + 1,
        title: dayTitles[i],
        notes: i === 0 ? 'Pick up pocket Wi-Fi and Pasmo transit cards at the airport.' : ''
      });
    }

    const createdDays = await ItineraryDay.insertMany(dayDocs);

    // 5. Seed Itinerary Activities with real coordinates and realistic times
    const activities = [
      // Day 1: Tokyo Shibuya
      {
        trip: trip._id,
        day: createdDays[0]._id,
        title: 'Check-in at Hotel Gracery Shinjuku',
        description: 'Drop luggage, freshen up, and take in the view of the giant Godzilla head.',
        locationName: 'Hotel Gracery Shinjuku, Tokyo',
        latitude: 35.6953,
        longitude: 139.7022,
        startTime: '14:00',
        endTime: '15:00',
        durationMinutes: 60,
        estimatedCostMinor: toMinorUnits(0),
        category: 'accommodation',
        status: 'PLANNED',
        displayOrder: 0,
        isFixedTime: true,
        createdBy: demoUser._id
      },
      {
        trip: trip._id,
        day: createdDays[0]._id,
        title: 'Shibuya Crossing & Hachiko Statue',
        description: 'Experience the world-famous pedestrian scramble and grab coffee overlooking the crossing.',
        locationName: 'Shibuya Crossing, Tokyo',
        latitude: 35.6595,
        longitude: 139.7005,
        startTime: '15:45',
        endTime: '17:15',
        durationMinutes: 90,
        estimatedCostMinor: toMinorUnits(15),
        category: 'sightseeing',
        status: 'PLANNED',
        displayOrder: 1,
        isFixedTime: false,
        createdBy: demoUser._id
      },
      {
        trip: trip._id,
        day: createdDays[0]._id,
        title: 'Ramen Tasting at Ichiran Shibuya',
        description: 'Classic rich tonkotsu ramen in individual flavor-focus booths.',
        locationName: 'Ichiran Shibuya, Tokyo',
        latitude: 35.6617,
        longitude: 139.7011,
        startTime: '18:00',
        endTime: '19:15',
        durationMinutes: 75,
        estimatedCostMinor: toMinorUnits(30),
        category: 'food',
        status: 'PLANNED',
        displayOrder: 2,
        isFixedTime: false,
        createdBy: companionUser._id
      },
      // Day 2: Asakusa & Akihabara
      {
        trip: trip._id,
        day: createdDays[1]._id,
        title: 'Senso-ji Temple & Nakamise Dori',
        description: 'Explore Tokyo’s oldest Buddhist temple and taste street snacks along Nakamise shopping street.',
        locationName: 'Senso-ji, Asakusa, Tokyo',
        latitude: 35.7148,
        longitude: 139.7967,
        startTime: '09:30',
        endTime: '11:30',
        durationMinutes: 120,
        estimatedCostMinor: toMinorUnits(20),
        category: 'culture',
        status: 'PLANNED',
        displayOrder: 0,
        isFixedTime: false,
        createdBy: demoUser._id
      },
      {
        trip: trip._id,
        day: createdDays[1]._id,
        title: 'Akihabara Electric Town & Retro Arcades',
        description: 'Browse multi-story electronics, retro games, and anime culture shops.',
        locationName: 'Akihabara Station Area, Tokyo',
        latitude: 35.6984,
        longitude: 139.7731,
        startTime: '13:00',
        endTime: '15:30',
        durationMinutes: 150,
        estimatedCostMinor: toMinorUnits(45),
        category: 'shopping',
        status: 'PLANNED',
        displayOrder: 1,
        isFixedTime: false,
        createdBy: companionUser._id
      },
      // Day 3: Shinkansen to Kyoto
      {
        trip: trip._id,
        day: createdDays[2]._id,
        title: 'Nozomi Shinkansen Bullet Train to Kyoto',
        description: 'High-speed 2h 15m rail journey past Mount Fuji.',
        locationName: 'Tokyo Station Shinkansen Tracks',
        latitude: 35.6812,
        longitude: 139.7671,
        startTime: '09:00',
        endTime: '11:15',
        durationMinutes: 135,
        estimatedCostMinor: toMinorUnits(130),
        category: 'transport',
        status: 'PLANNED',
        displayOrder: 0,
        isFixedTime: true,
        createdBy: demoUser._id
      },
      {
        trip: trip._id,
        day: createdDays[2]._id,
        title: 'Fushimi Inari Taisha Shrine',
        description: 'Hike through the iconic tunnel of thousands of vermilion torii gates winding up sacred Mount Inari.',
        locationName: 'Fushimi Inari Taisha, Kyoto',
        latitude: 34.9671,
        longitude: 135.7727,
        startTime: '14:00',
        endTime: '16:30',
        durationMinutes: 150,
        estimatedCostMinor: toMinorUnits(10),
        category: 'sightseeing',
        status: 'PLANNED',
        displayOrder: 1,
        isFixedTime: false,
        createdBy: demoUser._id
      }
    ];

    await ItineraryItem.insertMany(activities);

    // 6. Seed Reservations
    await Reservation.create([
      {
        trip: trip._id,
        title: 'Hotel Gracery Shinjuku (2 Nights)',
        type: 'HOTEL',
        providerName: 'Booking.com',
        bookingReference: 'BK-TOKYO-849201',
        startDateTime: new Date(startDate),
        endDateTime: new Date(new Date(startDate).setDate(startDate.getDate() + 2)),
        location: '1-19-1 Kabukicho, Shinjuku, Tokyo',
        latitude: 35.6953,
        longitude: 139.7022,
        costMinor: toMinorUnits(380),
        currency: 'USD',
        externalUrl: 'https://gracery.com/shinjuku',
        status: 'CONFIRMED',
        notes: 'Includes breakfast buffet. Godzilla view room confirmed.',
        createdBy: demoUser._id
      },
      {
        trip: trip._id,
        title: 'Tokaido Shinkansen (Tokyo to Kyoto)',
        type: 'TRAIN',
        providerName: 'SmartEX Japan Rail',
        bookingReference: 'JR-NOZOMI-7741',
        startDateTime: new Date(new Date(startDate).setDate(startDate.getDate() + 2)),
        location: 'Tokyo Station Track 14',
        costMinor: toMinorUnits(260),
        currency: 'USD',
        status: 'CONFIRMED',
        notes: 'Car 5, Seats 8D & 8E (Mount Fuji side on the right).',
        createdBy: demoUser._id
      }
    ]);

    // 7. Seed Expenses with Accurate Integer Minor Units & Splits
    // Expense 1: Hotel prepaid by Sarah ($380) split equally
    await Expense.create({
      trip: trip._id,
      title: 'Hotel Gracery Shinjuku (2 nights)',
      description: 'Shinjuku accommodation booking',
      amountMinor: 38000,
      currency: 'USD',
      category: 'accommodation',
      payer: demoUser._id,
      expenseDate: new Date(),
      splitMethod: 'EQUAL',
      shares: [
        { user: demoUser._id, amountMinor: 19000, percentage: 50 },
        { user: companionUser._id, amountMinor: 19000, percentage: 50 }
      ],
      notes: 'Paid via Visa card online',
      createdBy: demoUser._id
    });

    // Expense 2: Shinkansen Train Tickets paid by Alex ($260) split equally
    await Expense.create({
      trip: trip._id,
      title: 'Bullet Train Tickets Tokyo -> Kyoto',
      description: 'Reserved seats on Nozomi Shinkansen',
      amountMinor: 26000,
      currency: 'USD',
      category: 'transport',
      payer: companionUser._id,
      expenseDate: new Date(),
      splitMethod: 'EQUAL',
      shares: [
        { user: demoUser._id, amountMinor: 13000, percentage: 50 },
        { user: companionUser._id, amountMinor: 13000, percentage: 50 }
      ],
      notes: 'Paid via SmartEX app',
      createdBy: companionUser._id
    });

    // Expense 3: Welcome Dinner paid by Sarah ($90) split equally
    await Expense.create({
      trip: trip._id,
      title: 'Shibuya Izakaya Welcome Dinner',
      description: 'Yakitori, gyoza, and local craft drinks',
      amountMinor: 9000,
      currency: 'USD',
      category: 'food',
      payer: demoUser._id,
      expenseDate: new Date(),
      splitMethod: 'EQUAL',
      shares: [
        { user: demoUser._id, amountMinor: 4500, percentage: 50 },
        { user: companionUser._id, amountMinor: 4500, percentage: 50 }
      ],
      notes: '',
      createdBy: demoUser._id
    });

    // 8. Seed Destination Vote Proposal
    await DestinationVote.create({
      trip: trip._id,
      title: 'Optional Day Trip on Day 4: Nara Deer Park or Osaka Food Crawl?',
      destinationName: 'Nara Deer Park',
      country: 'Japan',
      description: 'Feed bowing deer at Nara Park and visit Todai-ji Great Buddha temple.',
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
      proposedBy: companionUser._id,
      status: 'OPEN',
      votes: [
        { user: companionUser._id, votedAt: new Date() },
        { user: demoUser._id, votedAt: new Date() }
      ]
    });

    // 9. Seed Comments
    await Comment.create([
      {
        trip: trip._id,
        author: demoUser._id,
        content: 'Welcome to the RouteCraft trip planning board! Check out the day-wise itinerary and let me know if we should add teamLab Planets.'
      },
      {
        trip: trip._id,
        author: companionUser._id,
        content: 'Looks fantastic! I already added the bullet train tickets. Make sure to pack comfortable walking shoes!'
      }
    ]);

    // 10. Seed Notifications
    await Notification.create({
      recipient: demoUser._id,
      type: 'ITINERARY_UPDATE',
      title: 'Welcome to RouteCraft!',
      message: 'Your trip "Summer in Japan — Tokyo & Kyoto" has been initialized with sample itinerary days, reservations, and expenses.',
      relatedTrip: trip._id,
      isRead: false
    });

    // 11. Seed Activity Logs
    await ActivityLog.create([
      {
        trip: trip._id,
        actor: demoUser._id,
        action: 'TRIP_CREATED',
        resourceType: 'TRIP',
        resourceId: trip._id,
        summary: 'Sarah Jenkins created trip "Summer in Japan — Tokyo & Kyoto".'
      },
      {
        trip: trip._id,
        actor: companionUser._id,
        action: 'MEMBER_JOINED',
        resourceType: 'MEMBER',
        summary: 'Alex Rivera joined the trip as Editor.'
      }
    ]);

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error(`Seeding error: ${err.message}`);
    process.exit(1);
  }
}

seed();

