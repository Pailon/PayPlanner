import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { catalog } from '../data/catalog';

const router = Router();

router.get('/catalog/services', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    let filteredCatalog = catalog;

    if (category) {
      filteredCatalog = filteredCatalog.filter((service) => service.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCatalog = filteredCatalog.filter(
        (service) =>
          service.name.toLowerCase().includes(searchLower) ||
          service.category.toLowerCase().includes(searchLower)
      );
    }

    res.json(filteredCatalog);
  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

