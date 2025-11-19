import request from 'supertest';
import { app } from '../index.js';

describe('Authentication API', () => {
  test('Login endpoint returns 400 for missing credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});
    
    expect(response.status).toBe(400);
  });
});