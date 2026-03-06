document.getElementById("formInspecao").addEventListener("submit", async function (e) {
    e.preventDefault();

    const perguntas = ["q1","q2","q3","q4","q5","q6"];
    const respostas = perguntas.map(q =>
        document.querySelector(`input[name="${q}"]:checked`)?.value
    );

    // Verifica se alguma não foi marcada
    if (respostas.includes(undefined)) {
        alert("Responda todas as perguntas.");
        return;
    }

    // Bloqueia se todas respostas forem iguais
    const todasIguais = respostas.every(r => r === respostas[0]);

    if (todasIguais) {
        alert("Atenção: Todas as respostas estão iguais. Revise o checklist.");
        return;
    }

    // Obriga observação se houver Não Conforme
    if (respostas.includes("Não Conforme") &&
        document.getElementById("observacao").value.trim() === "") {
        alert("É obrigatório preencher a observação quando houver Não Conforme.");
        return;
    }

    const dados = {
        auditor_nome: document.getElementById("auditor").value,
        motorista_nome: document.getElementById("motorista").value,
        tipo_veiculo: document.getElementById("tipo").value,
        pergunta1: respostas[0],
        pergunta2: respostas[1],
        pergunta3: respostas[2],
        pergunta4: respostas[3],
        pergunta5: respostas[4],
        pergunta6: respostas[5]
    };

    try {
        const resposta = await fetch("http://localhost:3000/inspecoes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        document.getElementById("numeroInspecao").innerText = resultado.numero_inspecao;
        document.getElementById("mensagemSucesso").style.display = "block";

        document.getElementById("formInspecao").reset();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao enviar inspeção.");
    }

});