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
     const { id } = req.query;

     try {
       const { userId } = jwt.verify(token, process.env.JWT_SECRET);

       if (req.method === 'PUT') {
         const { ticker, quantity, purchase_date } = req.body;
         const result = await pool.query(
           'UPDATE stocks SET ticker = $1, quantity = $2, purchase_date = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
           [ticker, quantity, purchase_date, id, userId]
         );
         if (result.rows.length === 0) {
           return res.status(404).json({ error: 'Ação não encontrada' });
         }
         res.status(200).json(result.rows[0]);
       } else if (req.method === 'DELETE') {
         const result = await pool.query('DELETE FROM stocks WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
         if (result.rows.length === 0) {
           return res.status(404).json({ error: 'Ação não encontrada' });
         }
         res.status(200).json({ message: 'Ação deletada' });
       } else {
         res.status(405).json({ error: 'Método não permitido' });
       }
     } catch (err) {
       res.status(401).json({ error: 'Token inválido ou erro no servidor' });
     }
   }