// Conexion con Supabase
const SUPABASE_URL = 'https://hynnmslxljorvbdhrloc.supabase.co';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_U8j3b9sGOoAZWD0psjeEQQ_zAnJjc0L';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLIC_KEY
);

// Prueba de conexion con Supabase
supabaseClient
    .from('talleres')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
        if (error) {
            console.error('Error al conectar con Supabase:', error.message);
        } else {
            console.log('Conexion con Supabase correcta.');
        }
    });
    
const usersDatabase = [
    { username: 'sgarcia', pass: '123', name: 'Sebastian Garcia', greetingName: 'Sebastian', role: 'facilitador' },
    { username: 'asesor', pass: '123', name: 'Asesor Facilitador', greetingName: 'Asesor', role: 'facilitador' },
    { username: 'jefe', pass: '123', name: 'Jefatura Supervisor', greetingName: 'Jefe', role: 'jefe' }
];

let currentUser = JSON.parse(localStorage.getItem('talleres_current_user')) || null;
let currentCalendarDate = new Date();
let events = JSON.parse(localStorage.getItem('talleres_events')) || [
    { id: '1', taller: 'Orientacion Laboral', etapa: 'contacto', fecha: '2026-10-20', hora: '10:00', titulo: 'Contacto Inicial', createdBy: 'sgarcia' },
    { id: '2', taller: 'Orientacion Laboral', etapa: 'coordinacion', fecha: '2026-10-22', hora: '14:00', titulo: 'En coordinacion de Fechas', createdBy: 'sgarcia' },
    { id: '3', taller: 'Orientacion Laboral', etapa: 'agendado', fecha: '2026-10-25', hora: '18:00', titulo: 'Agendado - Entrevistas', createdBy: 'sgarcia' },
    { id: '4', taller: 'Orientacion Laboral', etapa: 'cierre', fecha: '2026-10-28', hora: '11:00', titulo: 'Confirmados - cierre', createdBy: 'asesor' },
    { id: '5', taller: 'Educacion Financiera', etapa: 'agendado', fecha: '2026-10-30', hora: '16:00', titulo: 'Agendado - Presupuesto', createdBy: 'jefe' }
];

const etapasNombresMap = {
    contacto: 'Contacto Inicial',
    coordinacion: 'En coordinacion',
    agendado: 'Agendado',
    cierre: 'Confirmados - cierre'
};

function init() {
    lucide.createIcons();
    if (currentUser) {
        showAppView();
    } else {
        showLoginView();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const uInput = document.getElementById('login-username').value.trim().toLowerCase();
    const pInput = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    const found = usersDatabase.find(u => u.username.toLowerCase() === uInput && u.pass === pInput);

    if (found) {
        currentUser = found;
        localStorage.setItem('talleres_current_user', JSON.stringify(currentUser));
        errorElement.classList.add('hidden');
        showAppView();
    } else {
        errorElement.classList.remove('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('talleres_current_user');
    showLoginView();
}

function showLoginView() {
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('flex');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').classList.add('hidden');
}

function showAppView() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('flex');

    document.getElementById('user-display-greeting').innerText = `Hola ${currentUser.greetingName}!`;
    document.getElementById('user-display-role').innerText = currentUser.role === 'jefe' ? 'Supervisor (Jefatura)' : 'Asesor Facilitador';

    updateRoleUI();
    buildSidebarNav();
    initCalendarSelectors();
    populateAdminSelectOptions();
    renderMatrix();
    renderCalendarGrid();
    renderAdminDashboard();
}

function updateRoleUI() {
    const bannerTitle = document.getElementById('role-title');
    const bannerDesc = document.getElementById('role-desc');

    if (currentUser.role === 'jefe') {
        bannerTitle.innerText = `Hola ${currentUser.greetingName}, modo Jefatura activo`;
        bannerDesc.innerText = "Acceso completo a gestion de eventos y al panel de Administracion.";
    } else {
        bannerTitle.innerText = `Hola ${currentUser.greetingName}, tu sesion esta activa`;
        bannerDesc.innerText = "Gestion completa de talleres, fases y sincronizacion con calendarios.";
    }
}

function buildSidebarNav() {
    const nav = document.getElementById('sidebar-nav');
    let html = `
        <button onclick="switchView('matrix')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 active:bg-slate-700 text-left font-medium transition text-base">
            <i data-lucide="layout-grid" class="w-5 h-5 text-emerald-400"></i> Matriz de Procesos
        </button>
        <button onclick="switchView('calendar')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 active:bg-slate-700 text-left font-medium transition text-base">
            <i data-lucide="calendar" class="w-5 h-5 text-blue-400"></i> Calendario Integral
        </button>
    `;
    if (currentUser.role === 'jefe') {
        html += `
            <button onclick="switchView('admin')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 active:bg-slate-700 text-left font-medium transition text-base border-t border-slate-800 pt-3">
                <i data-lucide="shield-check" class="w-5 h-5 text-amber-400"></i> Administraci&oacute;n
            </button>
        `;
    }
    nav.innerHTML = html;
    lucide.createIcons();
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('menu-overlay').classList.toggle('hidden');
}

function switchView(view) {
    toggleMenu();
    document.getElementById('view-matrix').classList.add('hidden');
    document.getElementById('view-calendar').classList.add('hidden');
    document.getElementById('view-admin').classList.add('hidden');

    if (view === 'matrix') {
        document.getElementById('view-matrix').classList.remove('hidden');
    } else if (view === 'calendar') {
        document.getElementById('view-calendar').classList.remove('hidden');
        renderCalendarGrid();
    } else if (view === 'admin') {
        document.getElementById('view-admin').classList.remove('hidden');
        renderAdminDashboard();
    }
}

function switchAdminTab(tab) {
    const btnGlobal = document.getElementById('tab-btn-global');
    const btnAsesores = document.getElementById('tab-btn-asesores');
    const tabGlobal = document.getElementById('admin-tab-global');
    const tabAsesores = document.getElementById('admin-tab-asesores');

    if (tab === 'global') {
        tabGlobal.classList.remove('hidden');
        tabAsesores.classList.add('hidden');
        btnGlobal.className = "flex-1 md:flex-none px-4 py-2 rounded-lg bg-white text-slate-800 shadow-xs transition flex items-center justify-center gap-1.5 font-bold";
        btnAsesores.className = "flex-1 md:flex-none px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5";
    } else {
        tabGlobal.classList.add('hidden');
        tabAsesores.classList.remove('hidden');
        btnAsesores.className = "flex-1 md:flex-none px-4 py-2 rounded-lg bg-white text-slate-800 shadow-xs transition flex items-center justify-center gap-1.5 font-bold";
        btnGlobal.className = "flex-1 md:flex-none px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5";
    }
}

function initCalendarSelectors() {
    const yearSelect = document.getElementById('calendar-year-select');
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let y = currentYear - 1; y <= currentYear + 3; y++) {
        let opt = document.createElement('option');
        opt.value = y;
        opt.innerText = y;
        if (y === currentCalendarDate.getFullYear()) opt.selected = true;
        yearSelect.appendChild(opt);
    }
    document.getElementById('calendar-month-select').value = currentCalendarDate.getMonth();
}

function updateCalendarMonth() {
    const m = parseInt(document.getElementById('calendar-month-select').value);
    const y = parseInt(document.getElementById('calendar-year-select').value);
    currentCalendarDate.setFullYear(y);
    currentCalendarDate.setMonth(m);
    renderCalendarGrid();
}

function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    document.getElementById('calendar-month-select').value = currentCalendarDate.getMonth();
    document.getElementById('calendar-year-select').value = currentCalendarDate.getFullYear();
    renderCalendarGrid();
}

function populateAdminSelectOptions() {
    const select = document.getElementById('admin-filter-select');
    if (!select) return;
    select.innerHTML = '<option value="ALL">-- Todos los Asesores --</option>';
    usersDatabase.forEach(u => {
        let opt = document.createElement('option');
        opt.value = u.username;
        opt.innerText = u.name;
        select.appendChild(opt);
    });
}

// --- FUNCIONES DE EXPORTACIÓN A EXCEL (CSV UTF-8) ---
function downloadCSV(csvContent, fileName) {
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportMatrixToExcel() {
    let csv = "Taller,Etapa,Titulo / Notas,Fecha,Hora,Autor / Asesor\n";
    events.forEach(ev => {
        const author = usersDatabase.find(u => u.username === ev.createdBy)?.name || 'Sistema';
        const etapaStr = etapasNombresMap[ev.etapa] || ev.etapa;
        csv += `"${ev.taller}","${etapaStr}","${ev.titulo.replace(/"/g, '""')}","${ev.fecha}","${ev.hora}","${author}"\n`;
    });
    downloadCSV(csv, `Reporte_Matriz_Talleres_${new Date().toISOString().slice(0,10)}.csv`);
}

function exportCalendarToExcel() {
    let csv = "Fecha,Hora,Taller,Etapa,Titulo / Notas,Autor / Asesor\n";
    const sortedEvents = [...events].sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    sortedEvents.forEach(ev => {
        const author = usersDatabase.find(u => u.username === ev.createdBy)?.name || 'Sistema';
        const etapaStr = etapasNombresMap[ev.etapa] || ev.etapa;
        csv += `"${ev.fecha}","${ev.hora}","${ev.taller}","${etapaStr}","${ev.titulo.replace(/"/g, '""')}","${author}"\n`;
    });
    downloadCSV(csv, `Reporte_Calendario_Talleres_${new Date().toISOString().slice(0,10)}.csv`);
}

function exportAdminMacroToExcel() {
    const total = events.length;
    const contacto = events.filter(e => e.etapa === 'contacto').length;
    const coordinacion = events.filter(e => e.etapa === 'coordinacion').length;
    const agendado = events.filter(e => e.etapa === 'agendado').length;
    const cierre = events.filter(e => e.etapa === 'cierre').length;

    let csv = "Indicador / Etapa,Total Registros,Porcentaje del Total\n";
    csv += `"Total Talleres Globales",${total},"100%"\n`;
    csv += `"Contacto Inicial",${contacto},"${total > 0 ? Math.round((contacto/total)*100) : 0}%"\n`;
    csv += `"En coordinacion",${coordinacion},"${total > 0 ? Math.round((coordinacion/total)*100) : 0}%"\n`;
    csv += `"Agendados",${agendado},"${total > 0 ? Math.round((agendado/total)*100) : 0}%"\n`;
    csv += `"Confirmados - Cierre",${cierre},"${total > 0 ? Math.round((cierre/total)*100) : 0}%"\n`;

    downloadCSV(csv, `Reporte_Macro_Administracion_${new Date().toISOString().slice(0,10)}.csv`);
}

function exportAdminHistoryToExcel() {
    const filterValue = document.getElementById('admin-filter-select') ? document.getElementById('admin-filter-select').value : 'ALL';
    const searchValue = document.getElementById('admin-search-input') ? document.getElementById('admin-search-input').value.trim().toLowerCase() : '';

    let filteredUsers = usersDatabase.filter(u => {
        const matchesSelect = (filterValue === 'ALL') || (u.username === filterValue);
        const matchesSearch = u.name.toLowerCase().includes(searchValue) || u.username.toLowerCase().includes(searchValue);
        return matchesSelect && matchesSearch;
    });

    let csv = "Asesor / Autor,Taller,Etapa Actual,Titulo / Notas,Fecha,Hora\n";
    filteredUsers.forEach(asesor => {
        const talleresAsesor = events.filter(e => e.createdBy === asesor.username || (asesor.username === 'sgarcia' && !e.createdBy));
        talleresAsesor.forEach(ev => {
            const etapaStr = etapasNombresMap[ev.etapa] || ev.etapa;
            csv += `"${asesor.name}","${ev.taller}","${etapaStr}","${ev.titulo.replace(/"/g, '""')}","${ev.fecha}","${ev.hora}"\n`;
        });
    });

    downloadCSV(csv, `Reporte_Historial_Asesores_${new Date().toISOString().slice(0,10)}.csv`);
}

// Generadores de Enlaces de Calendario
function getGoogleCalendarUrl(ev) {
    const cleanDate = ev.fecha.replace(/-/g, '');
    const cleanTime = ev.hora.replace(':', '') + '00';
    const startIso = `${cleanDate}T${cleanTime}Z`;
    const endHour = String(parseInt(ev.hora.slice(0,2)) + 1).padStart(2, '0');
    const endIso = `${cleanDate}T${endHour}${ev.hora.slice(3)}00Z`;

    const title = encodeURIComponent(`${ev.titulo} (${ev.taller})`);
    const details = encodeURIComponent("Proceso de taller gestionado en el portal corporativo.");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
}

function getOutlookCalendarUrl(ev) {
    const startIso = `${ev.fecha}T${ev.hora}:00Z`;
    const endHour = String(parseInt(ev.hora.slice(0,2)) + 1).padStart(2, '0');
    const endIso = `${ev.fecha}T${endHour}:${ev.hora.slice(3)}:00Z`;

    const subject = encodeURIComponent(`${ev.titulo} (${ev.taller})`);
    const body = encodeURIComponent("Proceso de taller gestionado en el portal corporativo.");

    return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${subject}&startdt=${startIso}&enddt=${endIso}&body=${body}`;
}

function downloadAppleCalendarIcs(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;

    const cleanDate = ev.fecha.replace(/-/g, '');
    const cleanTime = ev.hora.replace(':', '') + '00';
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.15//EN
BEGIN:VEVENT
SUMMARY:${ev.titulo} (${ev.taller})
DESCRIPTION:Proceso de taller gestionado en el portal corporativo.
DTSTART:${cleanDate}T${cleanTime}Z
DTEND:${cleanDate}T${parseInt(cleanTime.slice(0,2))+1}${cleanTime.slice(2)}Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${ev.titulo.replace(/\s+/g, '_')}_Apple.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderMatrix() {
    // Obtener talleres predeterminados y agregar dinámicamente los que estén registrados en eventos
    const defaultTalleres = ['Orientacion Laboral', 'Educacion Financiera'];
    const talleresFromEvents = events.map(e => e.taller ? e.taller.trim() : '');
    const talleresUnicos = Array.from(new Set([...defaultTalleres, ...talleresFromEvents])).filter(Boolean);
    
    const etapas = ['contacto', 'coordinacion', 'agendado', 'cierre'];

    // Función auxiliar para comparar nombres de talleres de forma flexible (ignorando acentos y mayúsculas)
    const matchTaller = (t1, t2) => {
        if (!t1 || !t2) return false;
        return t1.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === 
               t2.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const tbody = document.getElementById('matrix-tbody');
    tbody.innerHTML = '';
    
    talleresUnicos.forEach((taller, idx) => {
        let tr = document.createElement('tr');
        tr.className = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

        let tdTaller = document.createElement('td');
        tdTaller.className = 'p-4 font-bold text-slate-700 border-r border-slate-200';
        tdTaller.innerText = taller;
        tr.appendChild(tdTaller);

        etapas.forEach(etapa => {
            let td = document.createElement('td');
            td.className = 'p-3 border-r border-slate-200 align-top space-y-2';
            if (etapa === 'agendado') td.classList.add('bg-emerald-50/30');

            const filtered = events.filter(e => matchTaller(e.taller, taller) && e.etapa === etapa);
            filtered.forEach(ev => {
                let card = createEventCard(ev, etapa);
                td.appendChild(card);
            });
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    const mobileContainer = document.getElementById('matrix-mobile');
    mobileContainer.innerHTML = '';

    talleresUnicos.forEach(taller => {
        let cardTaller = document.createElement('div');
        cardTaller.className = 'bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3';
        
        let title = document.createElement('h3');
        title.className = 'font-bold text-slate-800 text-sm border-b pb-2 flex items-center justify-between';
        title.innerHTML = `<span>${taller}</span> <span class="text-xs font-normal text-slate-500">Taller</span>`;
        cardTaller.appendChild(title);

        etapas.forEach(etapa => {
            const filtered = events.filter(e => matchTaller(e.taller, taller) && e.etapa === etapa);
            if (filtered.length > 0) {
                let sectionEtapa = document.createElement('div');
                sectionEtapa.className = 'space-y-1.5';
                sectionEtapa.innerHTML = `<p class="text-[11px] font-semibold text-slate-500 uppercase">${etapasNombresMap[etapa]}</p>`;

                filtered.forEach(ev => {
                    let cardEv = createEventCard(ev, etapa);
                    sectionEtapa.appendChild(cardEv);
                });
                cardTaller.appendChild(sectionEtapa);
            }
        });
        mobileContainer.appendChild(cardTaller);
    });

    lucide.createIcons();
}

function createEventCard(ev, etapa) {
    let card = document.createElement('div');
    let bgCard = 'bg-sky-50 border-sky-200 text-sky-900';
    if (etapa === 'coordinacion') bgCard = 'bg-blue-50 border-blue-200 text-blue-900';
    if (etapa === 'agendado') bgCard = 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-medium';
    if (etapa === 'cierre') bgCard = 'bg-orange-50 border-orange-200 text-orange-900';

    const userFound = usersDatabase.find(u => u.username === ev.createdBy);
    const authorName = userFound ? userFound.name : 'Sistema';

    card.className = `p-3 rounded-lg border text-xs relative space-y-2 ${bgCard}`;
    card.innerHTML = `
        <div>
            <p class="font-bold text-sm">${ev.titulo}</p>
            <p class="opacity-90 mt-0.5">📅 ${ev.fecha} - 🕒 ${ev.hora}</p>
            <p class="text-[10px] opacity-75 mt-0.5">Por: <b>${authorName}</b></p>
        </div>
        
        <div class="pt-1.5 border-t border-black/10 flex items-center justify-between flex-wrap gap-1.5">
            <div class="flex items-center gap-1 font-medium flex-wrap">
                <span class="text-[10px] opacity-75 mr-0.5">Agendar:</span>
                <a href="${getGoogleCalendarUrl(ev)}" target="_blank" class="inline-flex items-center gap-0.5 bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-[10px] transition">📆 Google</a>
                <a href="${getOutlookCalendarUrl(ev)}" target="_blank" class="inline-flex items-center gap-0.5 bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-[10px] transition">📆 Outlook</a>
                <button onclick="downloadAppleCalendarIcs('${ev.id}')" class="inline-flex items-center gap-0.5 bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-[10px] transition">📆 Apple</button>
            </div>

            <div class="flex gap-1 ml-auto">
                <button onclick="editEvent('${ev.id}')" class="p-1 rounded hover:bg-black/15 active:bg-black/25 transition" title="Editar"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
                <button onclick="deleteEvent('${ev.id}')" class="p-1 rounded hover:bg-black/15 active:bg-black/25 transition" title="Eliminar"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </div>
        </div>
    `;
    return card;
}

function renderCalendarGrid() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const startingDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startingDay; i++) {
        let emptyCell = document.createElement('div');
        emptyCell.className = 'h-20 sm:h-28 bg-slate-100/40 border border-slate-200 rounded-lg opacity-40';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        let cell = document.createElement('div');
        cell.className = 'h-20 sm:h-28 bg-white border border-slate-200 rounded-lg p-1 flex flex-col overflow-y-auto smooth-scroll text-xs';
        
        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

        let dayHeader = document.createElement('div');
        dayHeader.className = 'font-bold text-slate-700 mb-1 text-right px-1 text-[11px] sm:text-xs';
        dayHeader.innerText = day;
        cell.appendChild(dayHeader);

        const dayEvents = events.filter(e => e.fecha === dateStr);
        dayEvents.forEach(ev => {
            let evCard = document.createElement('div');
            let bgBadge = 'bg-sky-100 text-sky-800 border-sky-300';
            if (ev.etapa === 'coordinacion') bgBadge = 'bg-blue-100 text-blue-800 border-blue-300';
            if (ev.etapa === 'agendado') bgBadge = 'bg-emerald-600 text-white border-emerald-700 font-semibold';
            if (ev.etapa === 'cierre') bgBadge = 'bg-orange-100 text-orange-800 border-orange-300';

            evCard.className = `p-1 rounded mb-1 border text-[9px] sm:text-[10px] truncate ${bgBadge}`;
            evCard.title = `${ev.titulo} (${ev.taller}) - ${ev.hora}`;
            evCard.innerText = `${ev.hora} ${ev.titulo}`;
            cell.appendChild(evCard);
        });

        grid.appendChild(cell);
    }
    lucide.createIcons();
}

function renderAdminDashboard() {
    if (!currentUser || currentUser.role !== 'jefe') return;

    const totalGlobal = events.length;
    const contactoGlobal = events.filter(e => e.etapa === 'contacto').length;
    const coordinacionGlobal = events.filter(e => e.etapa === 'coordinacion').length;
    const agendadoGlobal = events.filter(e => e.etapa === 'agendado').length;
    const cierreGlobal = events.filter(e => e.etapa === 'cierre').length;

    document.getElementById('macro-total').innerText = totalGlobal;
    document.getElementById('macro-contacto').innerText = contactoGlobal;
    document.getElementById('macro-coordinacion').innerText = coordinacionGlobal;
    document.getElementById('macro-agendado').innerText = agendadoGlobal;
    document.getElementById('macro-cierre').innerText = cierreGlobal;

    const chartsContainer = document.getElementById('charts-progress-container');
    const items = [
        { label: 'Contacto Inicial', count: contactoGlobal, color: 'bg-sky-500', text: 'text-sky-700' },
        { label: 'En coordinación', count: coordinacionGlobal, color: 'bg-blue-600', text: 'text-blue-700' },
        { label: 'Agendado', count: agendadoGlobal, color: 'bg-emerald-600', text: 'text-emerald-700' },
        { label: 'Confirmados - Cierre', count: cierreGlobal, color: 'bg-orange-500', text: 'text-orange-700' }
    ];

    chartsContainer.innerHTML = '';
    items.forEach(item => {
        const percent = totalGlobal > 0 ? Math.round((item.count / totalGlobal) * 100) : 0;
        let bar = document.createElement('div');
        bar.className = 'space-y-1';
        bar.innerHTML = `
            <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-700">${item.label}</span>
                <span class="${item.text}">${item.count} talleres (${percent}%)</span>
            </div>
            <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div class="${item.color} h-2.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
            </div>
        `;
        chartsContainer.appendChild(bar);
    });

    const kpisContainer = document.getElementById('admin-kpis');
    const historyTbody = document.getElementById('admin-history-tbody');
    const filterValue = document.getElementById('admin-filter-select') ? document.getElementById('admin-filter-select').value : 'ALL';
    const searchValue = document.getElementById('admin-search-input') ? document.getElementById('admin-search-input').value.trim().toLowerCase() : '';

    kpisContainer.innerHTML = '';
    historyTbody.innerHTML = '';

    let filteredUsers = usersDatabase.filter(u => {
        const matchesSelect = (filterValue === 'ALL') || (u.username === filterValue);
        const matchesSearch = u.name.toLowerCase().includes(searchValue) || u.username.toLowerCase().includes(searchValue);
        return matchesSelect && matchesSearch;
    });

    if (filteredUsers.length === 0) {
        kpisContainer.innerHTML = `<p class="col-span-2 text-center text-xs text-slate-500 py-4">No se encontraron asesores que coincidan con la búsqueda.</p>`;
    }

    filteredUsers.forEach(asesor => {
        const talleresAsesor = events.filter(e => e.createdBy === asesor.username || (asesor.username === 'sgarcia' && !e.createdBy));

        const contacto = talleresAsesor.filter(e => e.etapa === 'contacto').length;
        const coordinacion = talleresAsesor.filter(e => e.etapa === 'coordinacion').length;
        const agendado = talleresAsesor.filter(e => e.etapa === 'agendado').length;
        const cierre = talleresAsesor.filter(e => e.etapa === 'cierre').length;
        const total = talleresAsesor.length;

        let kpiCard = document.createElement('div');
        kpiCard.className = 'bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3';
        kpiCard.innerHTML = `
            <div class="flex justify-between items-center border-b pb-2">
                <span class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <i data-lucide="user-check" class="w-4 h-4 text-emerald-600"></i> ${asesor.name}
                </span>
                <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-xs">Total: ${total}</span>
            </div>
            <div class="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div class="bg-sky-50 p-1.5 rounded border border-sky-100">
                    <p class="font-bold text-sky-700">${contacto}</p>
                    <p class="text-slate-500">Contacto</p>
                </div>
                <div class="bg-blue-50 p-1.5 rounded border border-blue-100">
                    <p class="font-bold text-blue-700">${coordinacion}</p>
                    <p class="text-slate-500">Coordinación</p>
                </div>
                <div class="bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    <p class="font-bold text-emerald-700">${agendado}</p>
                    <p class="text-slate-500">Agendado</p>
                </div>
                <div class="bg-orange-50 p-1.5 rounded border border-orange-100">
                    <p class="font-bold text-orange-700">${cierre}</p>
                    <p class="text-slate-500">Cierre</p>
                </div>
            </div>
        `;
        kpisContainer.appendChild(kpiCard);

        talleresAsesor.forEach(ev => {
            let tr = document.createElement('tr');
            let etapaBadge = '';
            if (ev.etapa === 'contacto') etapaBadge = '<span class="bg-sky-100 text-sky-800 px-2 py-0.5 rounded">Contacto Inicial</span>';
            if (ev.etapa === 'coordinacion') etapaBadge = '<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">En coordinación</span>';
            if (ev.etapa === 'agendado') etapaBadge = '<span class="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">Agendado</span>';
            if (ev.etapa === 'cierre') etapaBadge = '<span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Confirmados - cierre</span>';

            tr.innerHTML = `
                <td class="p-3 font-medium text-slate-700">${asesor.name}</td>
                <td class="p-3 font-semibold">${ev.taller}</td>
                <td class="p-3">${etapaBadge}</td>
                <td class="p-3 text-slate-600">${ev.titulo}</td>
                <td class="p-3 text-slate-500">📅 ${ev.fecha} 🕒 ${ev.hora}</td>
            `;
            historyTbody.appendChild(tr);
        });
    });
    lucide.createIcons();
}

function openModal(id = null) {
    document.getElementById('event-modal').classList.remove('hidden');
    if (id) {
        document.getElementById('modal-title').innerText = "Editar Evento";
        const ev = events.find(e => e.id === id);
        document.getElementById('event-id').value = ev.id;
        document.getElementById('event-taller').value = ev.taller;
        document.getElementById('event-etapa').value = ev.etapa;
        document.getElementById('event-fecha').value = ev.fecha;
        document.getElementById('event-hora').value = ev.hora;
        document.getElementById('event-titulo').value = ev.titulo;
    } else {
        document.getElementById('modal-title').innerText = "Nuevo Evento de Taller";
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';
    }
}

function closeModal() {
    document.getElementById('event-modal').classList.add('hidden');
}

function saveEvent(e) {
    e.preventDefault();
    const id = document.getElementById('event-id').value;
    const data = {
        id: id ? id : Date.now().toString(),
        taller: document.getElementById('event-taller').value,
        etapa: document.getElementById('event-etapa').value,
        fecha: document.getElementById('event-fecha').value,
        hora: document.getElementById('event-hora').value,
        titulo: document.getElementById('event-titulo').value,
        createdBy: currentUser ? currentUser.username : 'sgarcia'
    };

    if (id) {
        events = events.map(ev => ev.id === id ? data : ev);
    } else {
        events.push(data);
    }

    localStorage.setItem('talleres_events', JSON.stringify(events));
    closeModal();
    renderMatrix();
    renderCalendarGrid();
    renderAdminDashboard();
}

function editEvent(id) {
    openModal(id);
}

function deleteEvent(id) {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
        events = events.filter(e => e.id !== id);
        localStorage.setItem('talleres_events', JSON.stringify(events));
        renderMatrix();
        renderCalendarGrid();
        renderAdminDashboard();
    }
}

window.onload = init;
