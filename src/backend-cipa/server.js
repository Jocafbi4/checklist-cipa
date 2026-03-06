const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 PRIMEIRO cria o pool
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "cipa_inspecao",
    password: "1234",
    port: 5432,
});

// 🔹 DEPOIS usa o pool
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
              pergunta1, pergunta2, pergunta3,
              pergunta4, pergunta5, pergunta6)
             VALUES (CURRENT_DATE, $1,$2,$3,$4,$5,$6,$7,$8,$9)
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

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});