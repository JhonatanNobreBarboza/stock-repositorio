import { Pool } from 'pg';
   import jwt from 'jsonwebtoken';

   const pool = new Pool({
     user: process.env.PG_USER,
     host: process.env.PG_HOST,
     database: process.env.PG_DATABASE,
     password: process.env.PG_PASSWORD,
     port: process.env.PG_PORT,
     ssl: { rejectUnauthorized: false },
   });

   export default async function handler(req, res) {
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return res.status(401).json({ error: 'Token não fornecido' });
     }

     const token = authHeader.split(' ')[1];
     try {
       const { userId } = jwt.verify(token, process.env.JWT_SECRET);

       if (req.method === 'GET') {
         const result = await pool.query('SELECT * FROM stocks WHERE user_id = $1', [userId]);
         const stocks = result.rows.map(stock => ({
           ...stock,
           current_price: (Math.random() * 100 + 50).toFixed(2),
         }));
         res.status(200).json(stocks);
       } else if (req.method === 'POST') {
         const { ticker, quantity, purchase_date } = req.body;
         const result = await pool.query(
           'INSERT INTO stocks (user_id, ticker, quantity, purchase_date) VALUES ($1, $2, $3, $4) RETURNING *',
           [userId, ticker, quantity, purchase_date]
         );
         res.status(200).json(result.rows[0]);
       } else {
         res.status(405).json({ error: 'Método não permitido' });
       }
     } catch (err) {
       res.status(401).json({ error: 'Token inválido ou erro no servidor' });
     }
   }