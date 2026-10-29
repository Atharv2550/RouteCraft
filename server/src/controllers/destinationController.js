import { Destination } from '../models/Destination.js';

export async function getAllDestinations(req, res, next) {
  try {
    const { search, category, region, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.categories = category;
    }

    if (region) {
      query.region = { $regex: region, $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [destinations, total] = await Promise.all([
      Destination.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
      Destination.countDocuments(query)
    ]);

    // Distinct categories and regions for filters
    const [categories, regions] = await Promise.all([
      Destination.distinct('categories'),
      Destination.distinct('region')
    ]);

    return res.status(200).json({
      success: true,
      destinations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      filters: {
        categories: categories.sort(),
        regions: regions.filter(Boolean).sort()
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getDestinationById(req, res, next) {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    return res.status(200).json({
      success: true,
      destination
    });
  } catch (err) {
    next(err);
  }
}
