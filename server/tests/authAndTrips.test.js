import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { config } from '../src/config/env.js';

describe('Authentication & Trip API Integration Tests', () => {
  let authToken = '';
  let testUserId = '';
  let createdTripId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongoUri);
    }
  });

  afterAll(async () => {
    if (createdTripId) {
      await request(app)
        .delete(`/api/v1/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    await mongoose.disconnect();
  });

  it('rejects access to protected routes without a token', async () => {
    const res = await request(app).get('/api/v1/trips');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('logs in successfully with the seeded demo account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'demo@routecraft.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('demo@routecraft.com');

    authToken = res.body.token;
    testUserId = res.body.user._id;
  });

  it('retrieves authenticated profile via /auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Sarah Jenkins');
  });

  it('creates a new trip and auto-generates itinerary days', async () => {
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 4 days

    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Alpine Hiking Adventure',
        description: 'Exploring mountain trails and scenic lakes.',
        startDate,
        endDate,
        primaryDestinationName: 'Interlaken, Switzerland',
        currency: 'EUR',
        totalBudget: 1500
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.trip.title).toBe('Alpine Hiking Adventure');
    expect(res.body.trip.currency).toBe('EUR');

    createdTripId = res.body.trip._id;

    // Verify day-wise itinerary was automatically created
    const itinRes = await request(app)
      .get(`/api/v1/trips/${createdTripId}/itinerary`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(itinRes.status).toBe(200);
    expect(itinRes.body.days.length).toBe(4);
    expect(itinRes.body.suggestions).toBeDefined();
  });

  it('prevents non-members from accessing private trip data', async () => {
    // Companion user logs in
    const alexLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alex@routecraft.com',
        password: 'password123'
      });

    const alexToken = alexLogin.body.token;

    // Alex is not a member of the newly created Alpine Hiking Adventure trip
    const res = await request(app)
      .get(`/api/v1/trips/${createdTripId}`)
      .set('Authorization', `Bearer ${alexToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

