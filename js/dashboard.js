const token = localStorage.getItem('token');
if (!token) window.location = 'login.html';

let eventosCarregados = {};
let editando = null;

function logout() {
    localStorage.removeItem('token');
    window.location = 'login.html';
}

function abrirModal(tipo) {
    if (!editando) limparCampos(tipo);
    document.getElementById(`modal${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).classList.add('active');
}

function fecharModal(tipo) {
    document.getElementById(`modal${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).classList.remove('active');
    editando = null;
}

function carregarEventos() {
    fetch('api/get_eventos.php', {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
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

    const payload = {
        data: datahora,
        descricao,
        quantidade,
        tempo,
        tipo: 'recaida'
    };

    if (editando) {
        payload.id = editando.id;
        fetch('api/edit_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        }).then(() => {
            fecharModal('recaida');
            carregarEventos();
        });
    } else {
        fetch('api/add_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        }).then(() => {
            fecharModal('recaida');
            carregarEventos();
        });
    }
}

function registrarQuase() {
    const datahora = document.getElementById('datahoraQuase').value;
    const texto = document.getElementById('textoQuase').value;

    const payload = {
        data: datahora,
        texto,
        tipo: 'quase'
    };

    if (editando) {
        payload.id = editando.id;
        fetch('api/edit_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        }).then(() => {
            fecharModal('quase');
            carregarEventos();
        });
    } else {
        fetch('api/add_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        }).then(() => {
            fecharModal('quase');
            carregarEventos();
        });
    }
}

function editarEvento(dataStr, id, tipo) {
    const grupo = eventosCarregados[dataStr] || [];
    const evento = grupo.find(e => e.id === id && e.tipo === tipo);
    if (!evento) return;

    editando = { id, tipo };

    if (tipo === 'recaida') {
        document.getElementById('datahoraRecaida').value = evento.data;
        document.getElementById('descricaoRecaida').value = evento.descricao;
        document.getElementById('quantidadeRecaida').value = evento.quantidade;
        document.getElementById('tempoRecaida').value = evento.tempo;
        abrirModal('recaida');
    } else {
        const horaFormatada = (evento.hora || '00:00').slice(0, 5);
        document.getElementById('datahoraQuase').value = `${evento.data}T${horaFormatada}`;
        document.getElementById('textoQuase').value = evento.texto;
        abrirModal('quase');
    }
}

function limparCampos(tipo) {
  if (tipo === 'recaida') {
    document.getElementById('datahoraRecaida').value = '';
    document.getElementById('descricaoRecaida').value = '';
    document.getElementById('quantidadeRecaida').value = '';
    document.getElementById('tempoRecaida').value = '';
  } else {
    document.getElementById('datahoraQuase').value = '';
    document.getElementById('textoQuase').value = '';
  }
}

window.onload = carregarEventos;
