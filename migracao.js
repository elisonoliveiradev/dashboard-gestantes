// ARQUIVO: migracao.js

// 1. IMPORTANTE: Essa linha é obrigatória!
const { Pool } = require('pg');

// 2. Configuração para a NUVEM (Neon)
const pool = new Pool({
    // 👇 COLE A SUA CHAVE GIGANTE DO NEON AQUI DENTRO DAS ASPAS 👇
    connectionString: 'postgresql://neondb_owner:npg_PnFoD85iCVlH@ep-super-dust-ahz19on1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false } // Obrigatório para o Neon
});

// Dados Originais
const gestantesData = [
    { nome: "Alice Antunes dos Santos", dataNascimento: "1975-01-25", dum: "2025-07-01", dpp: "2026-04-08", testeMaezinha: null, vacinaGripe: null, vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Aliciane Fatima Chaves Cardoso", dataNascimento: "1998-05-08", dum: "2025-02-02", dpp: "2025-11-09", testeMaezinha: "2025-03-20", vacinaGripe: "2025-04-14", vacinaDtpa: "2025-08-11", vacinaCovid: "4 doses", risco: "Médio", medicacao: "Sim - Metformina", suplementos: "Sim - Ácido Fólico, Ferro" },
    { nome: "Ana Claudia Besen V. Branco", dataNascimento: "1995-11-28", dum: "2025-04-27", dpp: "2026-02-04", testeMaezinha: "Não precisa", vacinaGripe: "2025-08-14", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Andreia Antoninha Ap. Meira", dataNascimento: "2003-06-13", dum: "2025-05-16", dpp: "2026-02-16", testeMaezinha: "2025-06-17", vacinaGripe: "2025-06-17", vacinaDtpa: "2025-10-09", vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Bruna Aparecida Saurin", dataNascimento: "1998-02-12", dum: "2025-02-10", dpp: "2025-11-17", testeMaezinha: "2025-06-18", vacinaGripe: "2025-04-24", vacinaDtpa: "2025-10-09", vacinaCovid: "3 doses", risco: "Médio", medicacao: "Sim - Levotiroxina", suplementos: "Sim - Ácido Fólico, Iodo" },
    { nome: "Camila Fernanda Gomes", dataNascimento: "2000-03-15", dum: "2025-06-05", dpp: "2026-03-12", testeMaezinha: "2025-07-20", vacinaGripe: "2025-05-10", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Carla Simone Oliveira", dataNascimento: "1992-09-22", dum: "2025-01-15", dpp: "2025-10-22", testeMaezinha: "2025-02-28", vacinaGripe: "2025-03-05", vacinaDtpa: "2025-07-18", vacinaCovid: "4 doses", risco: "Alto", medicacao: "Sim - Insulina", suplementos: "Sim - Ácido Fólico, Ferro, Cálcio" },
    { nome: "Cristina Maria da Silva", dataNascimento: "1997-07-08", dum: "2025-03-20", dpp: "2025-12-27", testeMaezinha: "2025-04-30", vacinaGripe: "2025-05-15", vacinaDtpa: "2025-09-10", vacinaCovid: "3 doses", risco: "Médio", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Daniela Rocha Santos", dataNascimento: "2001-11-30", dum: "2025-08-12", dpp: "2026-05-19", testeMaezinha: null, vacinaGripe: null, vacinaDtpa: null, vacinaCovid: "2 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Elaine Pereira Costa", dataNascimento: "1994-04-17", dum: "2025-05-01", dpp: "2026-02-08", testeMaezinha: "2025-06-10", vacinaGripe: "2025-06-20", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Médio", medicacao: "Sim - Atenolol", suplementos: "Sim - Ácido Fólico, Ferro" },
    { nome: "Fernanda Alves Martins", dataNascimento: "1999-12-05", dum: "2025-04-10", dpp: "2026-01-17", testeMaezinha: "2025-05-20", vacinaGripe: "2025-06-01", vacinaDtpa: "2025-08-25", vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Gisele Ferreira Dias", dataNascimento: "1996-08-20", dum: "2025-07-15", dpp: "2026-04-22", testeMaezinha: null, vacinaGripe: "2025-08-30", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Heloísa Mendes Ribeiro", dataNascimento: "2002-02-14", dum: "2025-09-01", dpp: "2026-06-08", testeMaezinha: null, vacinaGripe: null, vacinaDtpa: null, vacinaCovid: "2 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Iris Souza Barbosa", dataNascimento: "1993-06-28", dum: "2025-02-20", dpp: "2025-11-27", testeMaezinha: "2025-03-30", vacinaGripe: "2025-04-10", vacinaDtpa: "2025-08-05", vacinaCovid: "4 doses", risco: "Alto", medicacao: "Sim - Hidroclorotiazida", suplementos: "Sim - Ácido Fólico, Ferro, Cálcio" },
    { nome: "Juliana Correia Lima", dataNascimento: "2000-10-11", dum: "2025-06-25", dpp: "2026-04-01", testeMaezinha: "2025-07-30", vacinaGripe: "2025-07-15", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Karina Monteiro Neves", dataNascimento: "1998-01-09", dum: "2025-03-05", dpp: "2025-12-12", testeMaezinha: "2025-04-15", vacinaGripe: "2025-05-20", vacinaDtpa: "2025-09-01", vacinaCovid: "3 doses", risco: "Médio", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Leticia Teixeira Gomes", dataNascimento: "2001-05-19", dum: "2025-08-08", dpp: "2026-05-15", testeMaezinha: null, vacinaGripe: null, vacinaDtpa: null, vacinaCovid: "2 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Mariana Bastos Pires", dataNascimento: "1995-03-25", dum: "2025-04-15", dpp: "2026-01-22", testeMaezinha: "2025-05-25", vacinaGripe: "2025-06-10", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Médio", medicacao: "Sim - Sertalina", suplementos: "Sim - Ácido Fólico, Ferro" },
    { nome: "Natalia Campos Rocha", dataNascimento: "1999-09-03", dum: "2025-05-22", dpp: "2026-02-28", testeMaezinha: "2025-06-30", vacinaGripe: "2025-07-05", vacinaDtpa: "2025-10-15", vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Olivia Nascimento Silva", dataNascimento: "1997-11-12", dum: "2025-01-30", dpp: "2025-11-06", testeMaezinha: "2025-03-10", vacinaGripe: "2025-03-25", vacinaDtpa: "2025-07-20", vacinaCovid: "4 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Patricia Alves Ferreira", dataNascimento: "1992-07-06", dum: "2025-02-14", dpp: "2025-11-21", testeMaezinha: "2025-03-25", vacinaGripe: "2025-04-05", vacinaDtpa: "2025-08-10", vacinaCovid: "4 doses", risco: "Alto", medicacao: "Sim - Glibenclamida", suplementos: "Sim - Ácido Fólico, Ferro, Cálcio" },
    { nome: "Quesia Ribeiro Mendes", dataNascimento: "2000-08-27", dum: "2025-07-10", dpp: "2026-04-17", testeMaezinha: null, vacinaGripe: "2025-08-15", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Rafaela Sousa Cardoso", dataNascimento: "1998-04-14", dum: "2025-03-28", dpp: "2026-01-04", testeMaezinha: "2025-05-08", vacinaGripe: "2025-05-30", vacinaDtpa: "2025-09-20", vacinaCovid: "3 doses", risco: "Médio", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Sandra Martins Oliveira", dataNascimento: "1994-12-01", dum: "2025-06-12", dpp: "2026-03-19", testeMaezinha: "2025-07-22", vacinaGripe: "2025-08-01", vacinaDtpa: null, vacinaCovid: "3 doses", risco: "Médio", medicacao: "Sim - Propranolol", suplementos: "Sim - Ácido Fólico, Ferro" },
    { nome: "Tatiana Gomes Pereira", dataNascimento: "2001-09-18", dum: "2025-08-25", dpp: "2026-06-01", testeMaezinha: null, vacinaGripe: null, vacinaDtpa: null, vacinaCovid: "2 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Ursula Fernandes Costa", dataNascimento: "1996-02-10", dum: "2025-05-05", dpp: "2026-02-12", testeMaezinha: "2025-06-15", vacinaGripe: "2025-07-01", vacinaDtpa: "2025-10-05", vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" },
    { nome: "Vanessa Rocha Barbosa", dataNascimento: "1999-06-22", dum: "2025-04-20", dpp: "2026-01-27", testeMaezinha: "2025-05-30", vacinaGripe: "2025-06-15", vacinaDtpa: "2025-09-25", vacinaCovid: "3 doses", risco: "Baixo", medicacao: "Não", suplementos: "Sim - Ácido Fólico" }
];

async function importarDados() {
    console.log("Iniciando importação para a NUVEM...");
    
    for (const g of gestantesData) {
        const riscoFormatado = g.risco === "Alto" ? "ALTO RISCO" : (g.risco === "Médio" ? "MÉDIO RISCO" : "BAIXO RISCO");
        const temHiper = g.medicacao.includes("Hidroclorotiazida") || g.medicacao.includes("Atenolol") || g.medicacao.includes("Propranolol");
        const temDiab = g.medicacao.includes("Metformina") || g.medicacao.includes("Insulina") || g.medicacao.includes("Glibenclamida");
        
        try {
            await pool.query(`
                INSERT INTO gestantes (
                    nome, data_nascimento, dum, dpp, 
                    vacina_gripe, vacina_dtpa, vacina_covid, 
                    risco, medicacao, suplementos, teste_maezinha,
                    hipertensao, diabetes, pontos_risco
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
                g.nome, 
                g.dataNascimento, 
                g.dum, 
                g.dpp,
                g.vacinaGripe || '', // Envia o TEXTO (ex: "2025-04-14") ou vazio
                g.vacinaDtpa || '',
                g.vacinaCovid || '',
                riscoFormatado,
                g.medicacao,
                g.suplementos,
                g.testeMaezinha,
                temHiper,
                temDiab,
                (riscoFormatado === "ALTO RISCO" ? 10 : (riscoFormatado === "MÉDIO RISCO" ? 5 : 0))
            ]);
            console.log(`✅ Importada na Nuvem: ${g.nome}`);
        } catch (err) {
            console.error(`❌ Erro em ${g.nome}:`, err.message);
        }
    }
    console.log("Importação concluída!");
    pool.end();
}

importarDados();