import { describe, it, expect } from 'vitest';
import { parseSQL } from '../sql-parser.server';

describe('SQL Parser', () => {
  describe('operation type detection', () => {
    it('should detect SELECT operations', () => {
      const result = parseSQL('SELECT * FROM users');
      expect(result.type).toBe('SELECT');
    });

    it('should detect INSERT operations', () => {
      const result = parseSQL('INSERT INTO users (name, email) VALUES ("test", "test@example.com")');
      expect(result.type).toBe('INSERT');
    });

    it('should detect UPDATE operations', () => {
      const result = parseSQL('UPDATE users SET name = "test" WHERE id = 1');
      expect(result.type).toBe('UPDATE');
    });

    it('should detect DELETE operations', () => {
      const result = parseSQL('DELETE FROM users WHERE id = 1');
      expect(result.type).toBe('DELETE');
    });

    it('should detect CREATE operations', () => {
      const result = parseSQL('CREATE TABLE users (id INT PRIMARY KEY)');
      expect(result.type).toBe('CREATE');
    });

    it('should detect DROP operations', () => {
      const result = parseSQL('DROP TABLE users');
      expect(result.type).toBe('DROP');
    });

    it('should detect ALTER operations', () => {
      const result = parseSQL('ALTER TABLE users ADD COLUMN email TEXT');
      expect(result.type).toBe('ALTER');
    });

    it('should throw error for unsupported operations', () => {
      expect(() => parseSQL('TRUNCATE TABLE users')).toThrow('Unsupported SQL operation');
    });
  });

  describe('table extraction', () => {
    it('should extract single table from SELECT', () => {
      const result = parseSQL('SELECT * FROM users');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should extract multiple tables from SELECT with JOIN', () => {
      const result = parseSQL('SELECT * FROM users JOIN posts ON users.id = posts.user_id');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should extract table with schema', () => {
      const result = parseSQL('SELECT * FROM public.users');
      expect(result.tables).toEqual([{ schema: 'PUBLIC', table: 'USERS' }]);
    });

    it('should extract table from INSERT', () => {
      const result = parseSQL('INSERT INTO users (name) VALUES ("test")');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should extract table from UPDATE', () => {
      const result = parseSQL('UPDATE public.users SET name = "test"');
      expect(result.tables).toEqual([{ schema: 'PUBLIC', table: 'USERS' }]);
    });

    it('should extract table from DELETE', () => {
      const result = parseSQL('DELETE FROM users');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should extract table from CREATE TABLE', () => {
      const result = parseSQL('CREATE TABLE public.users (id INT)');
      expect(result.tables).toEqual([{ schema: 'PUBLIC', table: 'USERS' }]);
    });

    it('should extract table from DROP TABLE', () => {
      const result = parseSQL('DROP TABLE users');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should extract table from ALTER TABLE', () => {
      const result = parseSQL('ALTER TABLE public.users ADD COLUMN email TEXT');
      expect(result.tables).toEqual([{ schema: 'PUBLIC', table: 'USERS' }]);
    });
  });

  describe('SQL cleaning', () => {
    it('should handle inline comments', () => {
      const result = parseSQL(`
        SELECT * -- Get all columns
        FROM users -- From users table
        WHERE id > 0 -- Only active users
      `);
      expect(result.type).toBe('SELECT');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should handle multi-line comments', () => {
      const result = parseSQL(`
        SELECT * 
        /* This is a
           multi-line comment */
        FROM users
        WHERE id > 0
      `);
      expect(result.type).toBe('SELECT');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should handle string literals', () => {
      const result = parseSQL(`
        SELECT * 
        FROM users
        WHERE name = 'table_name'
        AND type = 'FROM'
      `);
      expect(result.type).toBe('SELECT');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });

    it('should handle complex queries with subqueries', () => {
      const result = parseSQL(`
        SELECT u.*, (
          SELECT COUNT(*)
          FROM posts p
          WHERE p.user_id = u.id
        ) as post_count
        FROM users u
        WHERE u.id IN (
          SELECT user_id
          FROM user_roles
          WHERE role = 'admin'
        )
      `);
      expect(result.type).toBe('SELECT');
      expect(result.tables).toEqual([{ table: 'USERS' }]);
    });
  });
});
