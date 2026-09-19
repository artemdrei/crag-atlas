import { describe, expect, it } from 'vitest';

import { NotFoundException } from '../common/exceptions/app.exception';
import { RoutesService } from './routes.service';

describe('RoutesService', () => {
  const service = new RoutesService();

  describe('findBySector', () => {
    it('returns only the routes of the given sector', () => {
      const routes = service.findBySector('bastion');

      expect(routes.length).toBeGreaterThan(0);
      expect(routes.every((route) => route.idSector === 'bastion')).toBe(true);
    });

    it('throws NotFoundException for an unknown sector', () => {
      expect(() => service.findBySector('nope')).toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('returns the route with the given id', () => {
      expect(service.findOne('mizerna-lohika').id).toBe('mizerna-lohika');
    });

    it('throws NotFoundException for an unknown route', () => {
      expect(() => service.findOne('nope')).toThrow(NotFoundException);
    });
  });
});
