const express = require('express');
     const { Pool } = require('pg');
     const jwt = require('jsonwebtoken');
     const bcrypt = require('bcryptjs');
     const cors = require('cors');

     const app = express();
     app.use(express.json());
     app.use(cors({ origin: 'http://localhost:5173' }));

     const pool = new Pool({
       user: process.env.PG_USER,
       host: process.env.PG_HOST,
       database: process.env.PG_DATABASE,
       password: process.env.PG_PASSWORD,
       port: process.env.PG_PORT,
       ssl: { rejectUnauthorized: false },
     });

     app.post('/api/login', async (req, res) => {
       console.log('Requisição recebida:', req.body);
       const { username, password } = req.body;

       if (!username || !password) {
         return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
       }

       try {
         const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
         const user = result.rows[0];
         console.log('Usuário do banco:', user);
         if (!user || !(await bcrypt.compare(password, user.password))) {
           console.log('Falha na autenticação');
           return res.status(401).json({ error: 'Credenciais inválidas' });
         }

         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
         console.log('Token gerado:', token);
         res.json({ token });
       } catch (err) {
         console.error('Erro:', err.stack);
         res.status(500).json({ error: 'Erro no servidor' });
       }
     });

     const PORT = 3000;
     app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));