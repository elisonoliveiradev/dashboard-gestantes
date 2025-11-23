// ARQUIVO: index.js (Pronto para a Nuvem ☁️)

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
// O Render define a porta automaticamente, ou usamos 3000 localmente
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração Inteligente do Banco
// Se tiver uma variável DATABASE_URL (na nuvem), usa ela.
// Se não, usa os dados locais do seu computador.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:885588@localhost:5432/saude_anibal',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.get('/', (req, res) => res.send('API Online 🚀'));

// 1. BUSCAR
app.get('/gestantes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM gestantes ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// 2. CADASTRAR
app.post('/gestantes', async (req, res) => {
    const { 
        nome, data_nascimento, cpf, telefone, dum, dpp, 
        hipertensao, diabetes, obesidade, suspeita_infeccao, 
        vacina_gripe, vacina_dtpa, vacina_covid, 
        medicacao, suplementos, teste_maezinha,
        pontos_risco, risco 
    } = req.body;
    
    try {
        const query = `
            INSERT INTO gestantes (
                nome, data_nascimento, cpf, telefone, dum, dpp,
                hipertensao, diabetes, obesidade, suspeita_infeccao,
                vacina_gripe, vacina_dtpa, vacina_covid,
                medicacao, suplementos, teste_maezinha,
                pontos_risco, risco
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *
        `;
        const values = [
            nome, data_nascimento, cpf, telefone, dum, dpp,
            hipertensao, diabetes, obesidade, suspeita_infeccao,
            vacina_gripe, vacina_dtpa, vacina_covid,
            medicacao, suplementos, teste_maezinha,
            pontos_risco, risco
        ];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Erro' }); }
});

// 3. EXCLUIR
app.delete('/gestantes/:id', async (req, res) => {
    try { await pool.query('DELETE FROM gestantes WHERE id = $1', [req.params.id]); res.json({ msg: 'Ok' }); }
    catch (err) { res.status(500).json({ error: 'Erro' }); }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));