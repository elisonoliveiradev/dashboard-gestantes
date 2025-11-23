// ARQUIVO: script.js (Versão Final: Busca Google + 6 Gráficos + Texto Vacina)

const API_URL = 'https://dashboard-gestantes.onrender.com/gestantes';
let todosDados = []; 
let charts = {}; 

// --- 1. MODAL ---
function abrirModal() { document.getElementById('modalCadastro').style.display = 'flex'; }
function fecharModal() { document.getElementById('modalCadastro').style.display = 'none'; }

// --- 2. CÁLCULOS ---
function calcularDPP() {
    const elDum = document.getElementById('dum');
    const elDpp = document.getElementById('dpp');
    if (elDum && elDum.value) {
        const dataDum = new Date(elDum.value);
        dataDum.setDate(dataDum.getDate() + 280); 
        if(elDpp) elDpp.value = dataDum.toISOString().split('T')[0];
    }
}

function calcularRisco() {
    let pontos = 0;
    const getEl = id => document.getElementById(id);
    const elData = getEl('data_nascimento');
    if (elData && elData.value) {
        const nasc = new Date(elData.value);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        if (idade < 15 || idade > 40) pontos += 2;
    }
    if (getEl('hipertensao')?.checked) pontos += 10;
    if (getEl('diabetes')?.checked) pontos += 10;
    if (getEl('suspeita_infeccao')?.checked) pontos += 5;
    if (getEl('obesidade')?.checked) pontos += 4;

    if(getEl('displayPontos')) getEl('displayPontos').innerText = pontos + ' Pontos';
    const elRisco = getEl('displayRisco');
    let risco = 'Baixo Risco';
    if (elRisco) {
        elRisco.style.color = 'green';
        if (pontos >= 10) { risco = 'Alto Risco'; elRisco.style.color = 'red'; }
        else if (pontos >= 5) { risco = 'Médio Risco'; elRisco.style.color = 'orange'; }
        elRisco.innerText = risco;
    }
    return { pontos, risco };
}

// --- 3. CARREGAR ---
async function carregarGestantes() {
    const tabela = document.getElementById('tabelaBody');
    if(tabela) tabela.innerHTML = '<tr><td colspan="6" style="text-align:center">Carregando...</td></tr>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro na conexão');
        const dadosBrutos = await response.json();
        
        todosDados = dadosBrutos.map(g => {
            let idade = 0;
            if(g.data_nascimento) {
                const nasc = new Date(g.data_nascimento);
                const hoje = new Date();
                idade = hoje.getFullYear() - nasc.getFullYear();
            }
            let trimestre = '1º Trimestre';
            if(g.dum) {
                const dum = new Date(g.dum);
                const hoje = new Date();
                const diffTime = Math.abs(hoje - dum);
                const semanas = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                if(semanas > 13 && semanas <= 26) trimestre = '2º Trimestre';
                if(semanas > 26) trimestre = '3º Trimestre';
            }
            return { ...g, idadeCalculada: idade, trimestreCalculado: trimestre, risco: g.risco || 'Baixo Risco' };
        });
        aplicarFiltros(); 
    } catch (e) {
        console.error(e);
        if(tabela) tabela.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center">Erro ao conectar.</td></tr>';
    }
}

// --- 4. BUSCA TIPO GOOGLE (RESTAURADA!) ---
const inputNome = document.getElementById('filterNome');
const listaSugestoes = document.getElementById('listaSugestoes');

if(inputNome) {
    inputNome.addEventListener('input', function() {
        const texto = this.value.toLowerCase();
        aplicarFiltros(); // Filtra a tabela enquanto digita
        
        // Lógica da Lista Suspensa
        if (texto.length > 0) {
            const sugestoes = todosDados.filter(g => g.nome.toLowerCase().includes(texto));
            mostrarSugestoes(sugestoes);
        } else {
            listaSugestoes.style.display = 'none';
        }
    });
}

function mostrarSugestoes(lista) {
    listaSugestoes.innerHTML = '';
    if (lista.length === 0) { listaSugestoes.style.display = 'none'; return; }

    lista.forEach(g => {
        const li = document.createElement('li');
        // Mostra nome e cor do risco na lista
        let cor = g.risco === 'ALTO RISCO' ? '#dc3545' : (g.risco === 'MÉDIO RISCO' ? '#ffc107' : '#28a745');
        let corTexto = g.risco === 'MÉDIO RISCO' ? '#333' : 'white';
        li.innerHTML = `<span>${g.nome}</span><span class="suggestion-risk" style="background:${cor}; color:${corTexto}">${g.risco}</span>`;
        
        // Ao clicar na sugestão
        li.addEventListener('click', () => {
            inputNome.value = g.nome; // Preenche o campo
            listaSugestoes.style.display = 'none'; // Some a lista
            aplicarFiltros(); // Filtra para mostrar só essa pessoa
        });
        listaSugestoes.appendChild(li);
    });
    listaSugestoes.style.display = 'block';
}

// Fecha a lista se clicar fora
document.addEventListener('click', (e) => {
    if (inputNome && !inputNome.contains(e.target) && !listaSugestoes.contains(e.target)) {
        listaSugestoes.style.display = 'none';
    }
});

// --- 5. FILTROS GERAIS ---
function aplicarFiltros() {
    const getVal = id => document.getElementById(id)?.value || '';
    const fTrimestre = getVal('filterTrimestre');
    const fRisco = getVal('filterRisco');
    const fNome = getVal('filterNome').toLowerCase();

    const filtrados = todosDados.filter(g => {
        const matchTrimestre = fTrimestre ? g.trimestreCalculado === fTrimestre : true;
        const matchRisco = fRisco ? g.risco.toUpperCase().includes(fRisco.toUpperCase()) : true;
        const matchNome = fNome ? g.nome.toLowerCase().includes(fNome) : true;
        return matchTrimestre && matchRisco && matchNome;
    });
    atualizarTela(filtrados);
}
['filterTrimestre', 'filterRisco'].forEach(id => document.getElementById(id)?.addEventListener('change', aplicarFiltros));
document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
    ['filterTrimestre', 'filterRisco', 'filterNome'].forEach(id => document.getElementById(id).value = '');
    listaSugestoes.style.display = 'none';
    aplicarFiltros();
});

// --- 6. RENDERIZAR (TABELA E GRÁFICOS) ---
function atualizarTela(lista) {
    const tabela = document.getElementById('tabelaBody');
    if(!tabela) return;
    tabela.innerHTML = '';
    
    if(lista.length === 0) { tabela.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum registro encontrado.</td></tr>'; }

    let total=0, alto=0, vGripe=0, vDtpa=0, vCovid=0, somaIdade=0;
    // Contadores Gráficos
    let countIdades = [0,0,0,0,0];
    let countTrim = {'1º Trimestre':0, '2º Trimestre':0, '3º Trimestre':0};
    let faixasRadar = {'15-19':0, '20-24':0, '25-29':0, '30-34':0, '35+':0};

    lista.forEach(g => {
        total++;
        const idCalc = g.idadeCalculada || 0;
        somaIdade += idCalc;
        
        if(g.risco === 'ALTO RISCO') alto++;

        // Lógica de Vacina (Texto) - Se tem mais de 2 letras, conta como vacinado
        const checkVacina = (val) => (val && val.length > 2 && val !== 'Não' && val !== 'false');
        if(checkVacina(g.vacina_gripe)) vGripe++;
        if(checkVacina(g.vacina_dtpa)) vDtpa++;
        if(checkVacina(g.vacina_covid)) vCovid++;

        // Gráficos
        if(countTrim[g.trimestreCalculado] !== undefined) countTrim[g.trimestreCalculado]++;
        let idx = 0;
        if(idCalc >= 20 && idCalc < 25) idx=1; else if(idCalc >= 25 && idCalc < 30) idx=2; else if(idCalc >= 30 && idCalc < 35) idx=3; else if(idCalc >= 35) idx=4;
        countIdades[idx]++;
        const labelsRadar = ['15-19', '20-24', '25-29', '30-34', '35+'];
        faixasRadar[labelsRadar[idx]]++;

        // Visual Vacina na Tabela
        const renderIcon = (val, tipo) => {
            const tomou = checkVacina(val);
            const texto = val ? val.toString() : 'Pendente';
            const icone = tipo === 'C' ? '🦠' : '💉';
            const style = tomou ? 'cursor:help;' : 'cursor:help; opacity:0.3; filter:grayscale(100%);';
            return `<span title="${texto}" style="${style}">${icone}${tipo}</span>`;
        };

        let cor = g.risco === 'ALTO RISCO' ? '#dc3545' : (g.risco === 'MÉDIO RISCO' ? '#fd7e14' : '#28a745');
        const dppShow = g.dpp ? new Date(g.dpp).toLocaleDateString('pt-BR') : '-';

        tabela.innerHTML += `
            <tr>
                <td>${g.id}</td>
                <td><strong>${g.nome}</strong><br><small>${idCalc} anos</small></td>
                <td>DPP: ${dppShow}</td>
                <td><span style="background:${cor}; color:white; padding:4px 8px; border-radius:10px; font-size:0.8em;">${g.risco}</span></td>
                <td>
                    ${renderIcon(g.vacina_gripe, 'G')} 
                    ${renderIcon(g.vacina_dtpa, 'D')} 
                    ${renderIcon(g.vacina_covid, 'C')}
                </td>
                <td><button onclick="excluir(${g.id})" style="border:1px solid red; color:red; background:white; border-radius:4px; cursor:pointer;">🗑️</button></td>
            </tr>
        `;
    });

    const setTxt = (id, v) => { const el = document.getElementById(id); if(el) el.innerText = v; };
    setTxt('kpiTotal', total);
    setTxt('kpiAltoRisco', alto);
    setTxt('kpiGripe', total ? Math.round((vGripe/total)*100) + '%' : '0%');
    setTxt('kpiDtpa', total ? Math.round((vDtpa/total)*100) + '%' : '0%');
    setTxt('kpiCovid', total ? Math.round((vCovid/total)*100) + '%' : '0%');
    setTxt('kpiIdadeMedia', total ? Math.round(somaIdade/total) + ' anos' : '-');

    atualizarTodosGraficos(total, vGripe, vDtpa, vCovid, countTrim, countIdades, faixasRadar);
}

function atualizarTodosGraficos(total, vGripe, vDtpa, vCovid, trim, idades, radar) {
    criarGrafico('chartIdade', 'bar', ['<20', '20-24', '25-29', '30-34', '35+'], idades, 'Idade', ['#667eea']);
    criarGrafico('chartTrimestre', 'doughnut', Object.keys(trim), Object.values(trim), 'Trimestres', ['#ff6384', '#36a2eb', '#ffce56']);
    
    criarGrafico('chartGripe', 'doughnut', ['Sim', 'Não'], [vGripe, total-vGripe], 'Gripe', ['#28a745', '#dc3545']);
    criarGrafico('chartDtpa', 'doughnut', ['Sim', 'Não'], [vDtpa, total-vDtpa], 'Dtpa', ['#28a745', '#dc3545']);
    criarGrafico('chartCovid', 'doughnut', ['Sim', 'Não'], [vCovid, total-vCovid], 'Covid', ['#28a745', '#dc3545']);

    const ctxR = document.getElementById('chartRadar');
    if(ctxR) {
        if(charts['radar']) charts['radar'].destroy();
        charts['radar'] = new Chart(ctxR.getContext('2d'), {
            type: 'radar',
            data: {
                labels: Object.keys(radar),
                datasets: [{ label: 'Faixa Etária', data: Object.values(radar), backgroundColor: 'rgba(102,126,234,0.2)', borderColor: '#667eea' }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { beginAtZero: true } } }
        });
    }
}

function criarGrafico(id, type, labels, data, label, colors) {
    const ctx = document.getElementById(id);
    if(!ctx) return;
    if(charts[id]) charts[id].destroy();
    
    let bgColors = colors;
    if(colors.length === 1 && data.length > 1) bgColors = colors[0];

    charts[id] = new Chart(ctx.getContext('2d'), {
        type: type,
        data: {
            labels: labels,
            datasets: [{ label: label, data: data, backgroundColor: bgColors, borderWidth: 1 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- 7. AÇÕES ---
window.excluir = async (id) => { if(confirm('Excluir?')) { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); carregarGestantes(); } };

const form = document.getElementById('formCadastro');
if(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const calc = calcularRisco();
        const getChk = id => document.getElementById(id)?.checked || false;
        const getVal = id => document.getElementById(id)?.value || null;
        const dados = {
            nome: getVal('nome'), data_nascimento: getVal('data_nascimento'), cpf: getVal('cpf'), telefone: getVal('telefone'),
            dum: getVal('dum'), dpp: getVal('dpp'), hipertensao: getChk('hipertensao'), diabetes: getChk('diabetes'), 
            suspeita_infeccao: getChk('suspeita_infeccao'), obesidade: getChk('obesidade'), 
            vacina_gripe: getVal('vacina_gripe'), vacina_dtpa: getVal('vacina_dtpa'), vacina_covid: getVal('vacina_covid'), 
            medicacao: getVal('medicacao'), suplementos: getVal('suplementos'), teste_maezinha: getVal('teste_maezinha'), 
            pontos_risco: calc.pontos, risco: calc.risco
        };
        await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(dados) });
        alert('Salvo!'); fecharModal(); form.reset(); carregarGestantes();
    });
}

carregarGestantes();