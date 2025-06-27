const token = localStorage.getItem('token');
let eventosCarregados = {};
let editando = null;

if (!token) window.location = 'login.html';

function logout() {
    localStorage.removeItem('token');
    window.location = 'login.html';
}

function abrirModal(tipo) {
    document.getElementById(`modal${capitalize(tipo)}`).classList.add('active');
}

function fecharModal(tipo) {
    document.getElementById(`modal${capitalize(tipo)}`).classList.remove('active');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function carregarEventos() {
    fetch('api/get_eventos.php', {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json())
        .then(data => {
            const { eventos, estatisticas } = data;
            eventosCarregados = eventos;

            document.getElementById('diasSem').innerText = estatisticas.dias_sem_recaida;
            document.getElementById('recorde').innerText = estatisticas.recorde;
            document.getElementById('faltam').innerText = estatisticas.dias_para_bater_recorde;
            document.getElementById('tempoPerdido').innerText = estatisticas.tempo_total_perdido;

            const lista = document.getElementById('lista');
            lista.innerHTML = '';

            Object.keys(eventos).sort().reverse().forEach(data => {
                const grupo = eventos[data];
                const dia = new Date(data).toLocaleDateString();

                const header = document.createElement('h3');
                header.innerText = dia;
                lista.appendChild(header);

                grupo.forEach(e => {
                    const div = document.createElement('div');
                    div.className = `evento-item ${e.tipo === 'recaida' ? 'recaida' : 'quase-recaida'}`;
                    div.innerHTML = `
            <strong>${e.hora || '--:--'}</strong> - ${e.tipo === 'recaida'
                            ? `${e.descricao} (${e.quantidade})<br><em>Tempo: ${e.tempo}</em>`
                            : `<em>Quase recaída:</em><br>${e.texto}`
                        }
            <button onclick="editarEvento('${data}', ${e.id}, '${e.tipo}')">✏️</button>
          `;
                    lista.appendChild(div);
                });
            });
        });
}

function registrarRecaida() {
    const datahora = document.getElementById('datahoraRecaida').value;
    const descricao = document.getElementById('descricaoRecaida').value;
    const quantidade = document.getElementById('quantidadeRecaida').value;
    const tempo = document.getElementById('tempoRecaida').value;

    const payload = editando ? {
        ...editando,
        data: datahora, descricao, quantidade, tempo
    } : { data: datahora, descricao, quantidade, tempo, tipo: 'recaida' };

    fetch(editando ? 'api/edit_evento.php' : 'api/add_evento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    }).then(() => {
        fecharModal('recaida');
        carregarEventos();
        editando = null;
    });
}

function registrarQuase() {
    const datahora = document.getElementById('datahoraQuase').value;
    const texto = document.getElementById('textoQuase').value;

    const payload = editando ? {
        ...editando,
        data: datahora, texto
    } : { data: datahora, texto, tipo: 'quase' };

    fetch(editando ? 'api/edit_evento.php' : 'api/add_evento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    }).then(() => {
        fecharModal('quase');
        carregarEventos();
        editando = null;
    });
}

function editarEvento(dataStr, id, tipo) {
    const grupo = eventosCarregados[dataStr] || [];
    const evento = grupo.find(e => e.id == id && e.tipo === tipo);
    if (!evento) return;

    editando = { id, tipo };

    if (tipo === 'recaida') {
        document.getElementById('datahoraRecaida').value = evento.data;
        document.getElementById('descricaoRecaida').value = evento.descricao;
        document.getElementById('quantidadeRecaida').value = evento.quantidade;
        document.getElementById('tempoRecaida').value = evento.tempo;
        abrirModal('recaida');
    } else {
        const dt = evento.data + 'T' + (evento.hora.length === 5 ? evento.hora : evento.hora.slice(0, 5));
        document.getElementById('datahoraQuase').value = dt;
        document.getElementById('textoQuase').value = evento.texto;
        abrirModal('quase');
    }
}

window.onload = carregarEventos;
