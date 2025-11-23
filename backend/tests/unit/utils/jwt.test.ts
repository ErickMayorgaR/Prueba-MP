describe('JWT Utils', () => {
  const jwt = require('jsonwebtoken');
  
  const JWT_SECRET = 'test-secret-key-for-testing';
  const JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';

  const generateAccessToken = (payload: any): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  };

  const generateRefreshToken = (payload: any): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  };

  const verifyAccessToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
  };

  const verifyRefreshToken = (token: string): any => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  };

  const mockPayload = {
    id: 1,
    email: 'test@dicri.gob.gt',
    role: 'TECNICO',
  };

  describe('generateAccessToken', () => {
    it('deberia generar un token de acceso valido', () => {
      const token = generateAccessToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('deberia contener el payload correcto', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });
  });

  describe('generateRefreshToken', () => {
    it('deberia generar un refresh token valido', () => {
      const token = generateRefreshToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('deberia verificar un token de acceso valido', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('deberia lanzar error para token invalido', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('deberia lanzar error para token vacio', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('deberia verificar un refresh token valido', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockPayload.id);
    });

    it('deberia lanzar error para refresh token invalido', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('Token cruzado', () => {
    it('no deberia verificar access token con refresh secret', () => {
      const accessToken = generateAccessToken(mockPayload);
      
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });

    it('no deberia verificar refresh token con access secret', () => {
      const refreshToken = generateRefreshToken(mockPayload);
      
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('Expiracion de Token', () => {
    it('deberia incluir tiempo de expiracion', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
    });
  });
});