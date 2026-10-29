import { z } from 'zod';

// Helper for safe external URLs: allow http and https only
const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (url) => !url || /^https?:\/\//i.test(url),
    { message: 'URL must start with http:// or https://' }
  )
  .optional()
  .or(z.literal(''));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  preferredCurrency: z.string().length(3).toUpperCase().optional().default('USD')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  avatarUrl: safeUrlSchema,
  preferredCurrency: z.string().length(3).toUpperCase().optional(),
  timezone: z.string().min(1).max(50).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128)
});

export const tripSchemaValidator = z.object({
  title: z.string().trim().min(2, 'Trip title must be at least 2 characters').max(120),
  description: z.string().max(1000).optional().default(''),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }),
  destinations: z.array(z.string()).optional().default([]),
  primaryDestinationName: z.string().trim().optional().default(''),
  currency: z.string().length(3).toUpperCase().optional().default('USD'),
  totalBudget: z.number().min(0).optional().default(0),
  dailyBudget: z.number().min(0).optional().default(0),
  travelStyle: z.enum(['BALANCED', 'BUDGET', 'LUXURY', 'FAST_PACED', 'RELAXED']).optional().default('BALANCED'),
  interests: z.array(z.string()).optional().default([])
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date cannot be before start date', path: ['endDate'] }
);

export const itineraryDaySchemaValidator = z.object({
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  dayNumber: z.number().int().min(1),
  title: z.string().max(100).optional().default(''),
  notes: z.string().max(1000).optional().default('')
});

export const itineraryItemSchemaValidator = z.object({
  dayId: z.string().min(1, 'Day ID is required'),
  title: z.string().trim().min(1, 'Title is required').max(150),
  description: z.string().max(1000).optional().default(''),
  locationName: z.string().trim().max(200).optional().default(''),
  latitude: z.number().min(-90).max(90).nullable().optional().default(null),
  longitude: z.number().min(-180).max(180).nullable().optional().default(null),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be HH:mm format').nullable().optional().default(null),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be HH:mm format').nullable().optional().default(null),
  durationMinutes: z.number().min(5).max(1440).optional().default(60),
  estimatedCost: z.number().min(0).optional().default(0),
  currency: z.string().length(3).toUpperCase().optional().default('USD'),
  category: z.enum(['sightseeing', 'culture', 'nature', 'food', 'accommodation', 'transport', 'shopping', 'entertainment', 'other']).optional().default('sightseeing'),
  status: z.enum(['PLANNED', 'COMPLETED', 'SKIPPED']).optional().default('PLANNED'),
  displayOrder: z.number().int().optional().default(0),
  isFixedTime: z.boolean().optional().default(false),
  notes: z.string().max(1000).optional().default(''),
  externalUrl: safeUrlSchema
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime;
    }
    return true;
  },
  { message: 'End time must follow start time', path: ['endTime'] }
);

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      displayOrder: z.number().int().min(0)
    })
  ).min(1, 'Items array cannot be empty')
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  role: z.enum(['EDITOR', 'VIEWER']).default('VIEWER')
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'EDITOR', 'VIEWER'])
});

export const commentSchemaValidator = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000),
  itineraryItemId: z.string().optional().nullable().default(null)
});

export const voteProposalSchema = z.object({
  title: z.string().trim().min(2).max(120),
  destinationName: z.string().trim().min(2).max(120),
  destinationId: z.string().optional().nullable().default(null),
  country: z.string().max(100).optional().default(''),
  description: z.string().max(500).optional().default(''),
  imageUrl: safeUrlSchema
});

export const expenseSchemaValidator = z.object({
  title: z.string().trim().min(2, 'Title is required').max(120),
  description: z.string().max(500).optional().default(''),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  currency: z.string().length(3).toUpperCase().optional().default('USD'),
  category: z.enum(['accommodation', 'food', 'transport', 'activities', 'shopping', 'other']).default('other'),
  payerId: z.string().min(1, 'Payer is required'),
  expenseDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid expense date' }).optional(),
  splitMethod: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE']).default('EQUAL'),
  shares: z.array(
    z.object({
      userId: z.string().min(1),
      amount: z.number().min(0).optional(),
      percentage: z.number().min(0).max(100).optional()
    })
  ).min(1, 'At least one participant required'),
  notes: z.string().max(500).optional().default('')
});

export const settlementSchemaValidator = z.object({
  payerId: z.string().min(1, 'Payer is required'),
  receiverId: z.string().min(1, 'Receiver is required'),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  currency: z.string().length(3).toUpperCase().optional().default('USD'),
  notes: z.string().max(500).optional().default('')
});

export const reservationSchemaValidator = z.object({
  title: z.string().trim().min(2, 'Title is required').max(120),
  type: z.enum(['HOTEL', 'FLIGHT', 'TRAIN', 'BUS', 'CAR_RENTAL', 'RESTAURANT', 'ACTIVITY', 'OTHER']).default('HOTEL'),
  providerName: z.string().trim().min(1, 'Provider name is required').max(120),
  bookingReference: z.string().max(100).optional().default(''),
  startDateTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date/time' }),
  endDateTime: z.string().refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Invalid end date/time' }).optional().nullable().default(null),
  location: z.string().max(200).optional().default(''),
  latitude: z.number().min(-90).max(90).optional().nullable().default(null),
  longitude: z.number().min(-180).max(180).optional().nullable().default(null),
  cost: z.number().min(0).optional().default(0),
  currency: z.string().length(3).toUpperCase().optional().default('USD'),
  externalUrl: safeUrlSchema,
  status: z.enum(['CONFIRMED', 'TENTATIVE', 'CANCELLED']).default('CONFIRMED'),
  notes: z.string().max(1000).optional().default('')
});
