describe('Password Utils', () => {
  const bcrypt = require('bcryptjs');
  
  const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  };

  const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };

  const plainPassword = 'TestPassword123!';

  describe('hashPassword', () => {
    it('deberia hashear una contrasena correctamente', async () => {
      const hashedPassword = await hashPassword(plainPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('deberia generar hashes diferentes para la misma contrasena', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      
      expect(hash1).not.toBe(hash2);
    });

    it('deberia generar un hash con formato bcrypt', async () => {
      const hash = await hashPassword(plainPassword);
      
      expect(hash).toMatch(/^\$2[aby]?\$\d{1,2}\$.{53}$/);
    });
  });

  describe('comparePassword', () => {
    it('deberia retornar true para contrasena correcta', async () => {
      const hashedPassword = await hashPassword(plainPassword);
      const result = await comparePassword(plainPassword, hashedPassword);
      
      expect(result).toBe(true);
    });

    it('deberia retornar false para contrasena incorrecta', async () => {
      const hashedPassword = await hashPassword(plainPassword);
      const result = await comparePassword('WrongPassword123!', hashedPassword);
      
      expect(result).toBe(false);
    });

    it('deberia retornar false para contrasena vacia', async () => {
      const hashedPassword = await hashPassword(plainPassword);
      const result = await comparePassword('', hashedPassword);
      
      expect(result).toBe(false);
    });
  });
});