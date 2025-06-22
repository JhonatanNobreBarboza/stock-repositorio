import { Pool } from 'pg';
     import jwt from 'jsonwebtoken';
     import bcrypt from 'bcryptjs';
     import cors from 'cors';

     const pool = new Pool({
       user: process.env.PG_USER,
       host: process.env.PG_HOST,
       database: process.env.PG_DATABASE,
       password: process.env.PG_PASSWORD,
       port: process.env.PG_PORT,
       ssl: { rejectUnauthorized: false },
     });

     const corsMiddleware = cors({ origin: '*' });

     export default async function handler(req, res) {
       await new Promise((resolve) => corsMiddleware(req, res, resolve));

       if (req.method !== 'POST') {
         return res.status(405).json({ error: 'Método não permitido' });
       }

       const { username, password } = req.body;

       if (!username || !password) {
         return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
       }

       try {
         const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
         const user = result.rows[0];

         if (!user || !(await bcrypt.compare(password, user.password))) {
           return res.status(401).json({ error: 'Credenciais inválidas' });
         }

         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
         res.status(200).json({ token });
       } catch (err) {
         console.error('Erro no login:', err);
         res.status(500).json({ error: 'Erro no servidor' });
       }
     }