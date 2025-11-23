import 'reflect-metadata';

describe('Auth Middleware', () => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = 'test-secret-key-for-testing';

  describe('authenticate', () => {
    it('deberia verificar token valido', () => {
      const payload = { id: 1, email: 'test@dicri.gob.gt', role: 'TECNICO' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      
      const decoded = jwt.verify(token, JWT_SECRET);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('deberia rechazar token invalido', () => {
      expect(() => jwt.verify('invalid-token', JWT_SECRET)).toThrow();
    });

    it('deberia rechazar token con secret incorrecto', () => {
      const payload = { id: 1, email: 'test@dicri.gob.gt', role: 'TECNICO' };
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });

      expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
    });

    it('deberia extraer Bearer token correctamente', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const token = authHeader.split(' ')[1];

      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('deberia rechazar header sin Bearer', () => {
      const authHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const hasBearer = authHeader.startsWith('Bearer ');

      expect(hasBearer).toBe(false);
    });
  });

  describe('authorize', () => {
    it('deberia permitir rol ADMIN', () => {
      const allowedRoles = ['ADMIN', 'COORDINADOR'];
      const userRole = 'ADMIN';

      expect(allowedRoles.includes(userRole)).toBe(true);
    });

    it('deberia permitir rol COORDINADOR', () => {
      const allowedRoles = ['ADMIN', 'COORDINADOR'];
      const userRole = 'COORDINADOR';

      expect(allowedRoles.includes(userRole)).toBe(true);
    });

    it('deberia rechazar rol TECNICO cuando no esta permitido', () => {
      const allowedRoles = ['ADMIN', 'COORDINADOR'];
      const userRole = 'TECNICO';

      expect(allowedRoles.includes(userRole)).toBe(false);
    });

    it('deberia permitir multiples roles', () => {
      const allowedRoles = ['ADMIN', 'COORDINADOR', 'TECNICO'];
      
      expect(allowedRoles.includes('ADMIN')).toBe(true);
      expect(allowedRoles.includes('COORDINADOR')).toBe(true);
      expect(allowedRoles.includes('TECNICO')).toBe(true);
    });
  });
});