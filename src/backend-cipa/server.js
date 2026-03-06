const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* SERVIR FRONTEND */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* CONEXÃO BANCO (Render usa DATABASE_URL) */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

/* ROTA INSPEÇÕES */

app.post("/inspecoes", async (req, res) => {
    try {
        const {
            auditor_nome,
            motorista_nome,
            tipo_veiculo,
            pergunta1,
            pergunta2,
            pergunta3,
            pergunta4,
            pergunta5,
            pergunta6,
        } = req.body;

        const resultado = await pool.query(
            `INSERT INTO inspecoes
            (data_inspecao, auditor_nome, motorista_nome, tipo_veiculo,
            pergunta1, pergunta2, pergunta3, pergunta4, pergunta5, pergunta6)
            VALUES (CURRENT_DATE,$1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING id`,
            [
                auditor_nome,
                motorista_nome,
                tipo_veiculo,
                pergunta1,
                pergunta2,
                pergunta3,
                pergunta4,
                pergunta5,
                pergunta6,
            ]
        );

        const idGerado = resultado.rows[0].id;

        const ano = new Date().getFullYear();
        const numeroFormatado = `INS-${ano}-${String(idGerado).padStart(6, "0")}`;

        await pool.query(
            `UPDATE inspecoes
            SET numero_inspecao = $1
            WHERE id = $2`,
            [numeroFormatado, idGerado]
        );

        console.log("RETORNO:", numeroFormatado);

        res.status(201).json({
            mensagem: "Inspeção enviada com sucesso",
            numero_inspecao: numeroFormatado,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao salvar inspeção" });
    }
});

/* PORTA DO RENDER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});