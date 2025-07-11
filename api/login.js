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

     // Configuração CORS para permitir origens específicas
     const corsOptions = {
       origin: [process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://stock-repositorio.vercel.app'],
       optionsSuccessStatus: 200 // Para navegadores antigos
     };
     const corsMiddleware = cors(corsOptions);

     export default async function handler(req, res) {
       console.log('Requisição recebida em /api/login:', req.method, req.url);
       await new Promise((resolve) => corsMiddleware(req, res, resolve));

       if (req.method !== 'POST') {
         console.log('Método não permitido:', req.method);
         return res.status(405).json({ error: 'Método não permitido' });
       }

       const { username, password } = req.body;
       console.log('Dados recebidos:', { username, password });

       if (!username || !password) {
         console.log('Dados inválidos:', { username, password });
         return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
       }

       try {
         console.log('Consultando banco para:', username);
         const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
         const user = result.rows[0];
         console.log('Resultado da consulta:', user);
         if (!user || !(await bcrypt.compare(password, user.password))) {
           console.log('Falha na autenticação:', { username, password }, 'User:', user);
           return res.status(401).json({ error: 'Credenciais inválidas' });
         }

         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
         console.log('Login bem-sucedido, token gerado:', token);
         res.status(200).json({ token });
       } catch (err) {
         console.error('Erro no servidor:', err.stack);
         res.status(500).json({ error: 'Erro no servidor' });
       }
     }