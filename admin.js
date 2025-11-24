// Function to dynamically update the member table rows
async function updateMemberListTable() { // NOW ASYNC
    const tbody = document.querySelector('#memberTable tbody');
    if (!tbody) return;

    // 1. Fetch data from Firestore
    const members = await fetchMembers();
    
    // 2. Map and inject HTML (similar to previous logic)
    tbody.innerHTML = members.map(member => {
        const schemeName = getSchemeName(member.schemeId);
        const statusText = member.hasPrized ? 'Prized' : 'Active';
        const statusClass = member.hasPrized ? 'status-prized' : 'status-active';

        return `
            <tr id="row-${member.firestoreId}">
                <td>${member.firestoreId.substring(0, 6)}...</td> <td>${member.name}</td>
                <td>${schemeName}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-small btn-edit" data-id="${member.firestoreId}">Edit</button>
                    <button class="btn-small btn-delete" data-id="${member.firestoreId}">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}


// Submission handler for the Add New Member form
async function handleAddMemberSubmit(event) { // NOW ASYNC
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.schemeId) {
        alert("Please select a valid scheme.");
        return;
    }

    // Await the asynchronous database operation
    const success = await addMember(data);
    
    if (success) {
        hideModal();
        await updateMemberListTable(); // Reload table after successful save
        alert(`Success! Member ${data.name} has been added to the cloud database.`);
    } else {
        alert("Failed to add member. Check console for details.");
    }
}

// Event delegation handler for Edit/Delete buttons
async function handleMemberTableAction(event) { // NOW ASYNC
    const target = event.target;
    if (target.classList.contains('btn-delete')) {
        const firestoreId = target.dataset.id;
        if (confirm(`Are you sure you want to delete member ${firestoreId.substring(0, 6)}...? This action cannot be undone.`)) {
            const success = await deleteMember(firestoreId);
            if (success) {
                await updateMemberListTable();
            }
        }
    } 
}

// Initialization on DOM Load must now fetch schemes first
document.addEventListener('DOMContentLoaded', async () => { // NOW ASYNC
    // Basic Security Check (remains synchronous)
    if (localStorage.getItem('userRole') !== 'admin') {
        alert('Access denied. Please log in as Admin.');
        window.location.href = 'index.html';
        return;
    }
    
    // FETCH SCHEMES BEFORE INITIALIZING VIEWS
    await fetchSchemes(); 
    
    // Bind navigation links and module card clicks
    const navLinks = document.querySelectorAll('.nav-menu a');
    const moduleCards = document.querySelectorAll('.module-card');

    function setActiveLink(moduleName) {
        navLinks.forEach(l => {
            if (l.dataset.module === moduleName) l.classList.add('active');
            else l.classList.remove('active');
        });
    }

    function handleNavigation(e) {
        e.preventDefault();
        const moduleName = this.dataset.module;
        setActiveLink(moduleName);
        if (moduleName === 'dashboard') renderDashboardLists();
        else renderModule(moduleName);
    }

    navLinks.forEach(link => link.addEventListener('click', handleNavigation));

    moduleCards.forEach(card => {
        card.addEventListener('click', () => {
            const moduleName = card.dataset.module;
            // mirror nav selection
            setActiveLink(moduleName);
            if (moduleName === 'dashboard') renderDashboardLists();
            else renderModule(moduleName);
        });
        card.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                card.click();
            }
        });
    });

    // By default show the Dashboard lists view
    renderDashboardLists();

    // Animate module grid when overview is visible
    const moduleGrid = document.getElementById('moduleGrid');
    if (moduleGrid) {
        // Ensure animation can run after first paint
        setTimeout(() => moduleGrid.classList.add('animate'), 140);
    }
    // Logout handling
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear session indicators and redirect to login
            localStorage.removeItem('userRole');
            // Optionally sign out from Firebase Auth if used
            try { if (firebase && firebase.auth) firebase.auth().signOut(); } catch (e) {}
            window.location.href = 'index.html';
        });
    }
});

/* ---------- Render Helpers ---------- */
const dynamicContent = document.getElementById('dynamicContent');
const moduleContent = document.getElementById('moduleContent');

function renderDashboard() {
    // Show the modules overview and hide module content
    const overview = document.getElementById('modulesOverview');
    if (overview) overview.style.display = '';
    if (moduleContent) {
        moduleContent.style.display = 'none';
        moduleContent.setAttribute('aria-hidden', 'true');
    }
}

function renderModule(moduleName) {
    const overview = document.getElementById('modulesOverview');
    if (overview) overview.style.display = 'none';
    if (moduleContent) {
        moduleContent.style.display = '';
        moduleContent.setAttribute('aria-hidden', 'false');
        moduleContent.innerHTML = `<h3 style="margin-top:0">${humanTitle(moduleName)}</h3><p class="muted">Loading ${humanTitle(moduleName)}...</p>`;
    }

    // Basic switch to populate the module area. Replace with real renderers.
    switch(moduleName) {
        case 'members':
            moduleContent.innerHTML = `
                <div class="card">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h3 style="margin:0">Members</h3>
                        <div>
                            <button id="btnAddMember" class="btn-primary">Add Member</button>
                        </div>
                    </div>
                    <p class="muted">Manage members here.</p>
                    <div id="membersContainer"></div>
                </div>
            `;
            // Render list and bind add button
            setTimeout(() => { renderMembers(); }, 40);
            break;
        case 'auction':
            moduleContent.innerHTML = `<div class="card"><h3>Auction & Collection</h3><p class="muted">Auction setup and collection tracking.</p></div>`;
            break;
        case 'pending':
            moduleContent.innerHTML = `<div class="card"><h3>Pending Dues & Interest</h3><p class="muted">Review and process pending dues.</p></div>`;
            break;
        case 'reports':
            moduleContent.innerHTML = `<div class="card"><h3>Reports & Notifications</h3><p class="muted">Generate reports and send notifications.</p></div>`;
            break;
        default:
            moduleContent.innerHTML = `<div class="card"><h3>Dashboard</h3><p class="muted">Summary cards and charts go here.</p></div>`;
    }
}

function humanTitle(key) {
    if (!key) return '';
    return key.split(/[-_ ]+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

/* ---------- Members UI & Modal Logic ---------- */
function showModal(title, bodyHtml, onSave) {
    const overlay = document.getElementById('appModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalFooter.innerHTML = '';

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', async () => {
        try {
            await onSave();
            hideModal();
        } catch (err) {
            console.error(err);
            alert('Save failed. See console for details.');
        }
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', hideModal);

    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(saveBtn);

    overlay.classList.add('visible');
}

function hideModal() {
    const overlay = document.getElementById('appModal');
    overlay.classList.remove('visible');
}

document.getElementById('modalCloseBtn').addEventListener('click', hideModal);

async function renderMembers() {
    const container = document.getElementById('membersContainer');
    if (!container) return;

    // Add a simple table container
    container.innerHTML = `
        <div id="membersTableWrapper" style="margin-top:12px;">
            <table id="memberTable">
                <thead>
                    <tr><th>ID</th><th>Name</th><th>Scheme</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    // Bind add button
    const btnAdd = document.getElementById('btnAddMember');
    if (btnAdd) btnAdd.addEventListener('click', () => openMemberModal());

    // Load and populate
    await updateMemberListTable();

    // delegate actions
    const tbody = container.querySelector('#memberTable tbody');
    tbody.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('btn-edit')) {
            const id = target.dataset.id;
            openMemberModal(id);
        } else if (target.classList.contains('btn-delete')) {
            const id = target.dataset.id;
            if (confirm('Delete member? This cannot be undone.')) {
                const ok = await deleteMember(id);
                if (ok) await updateMemberListTable();
            }
        }
    });
}

function openMemberModal(memberId) {
    if (memberId) {
        // Edit existing member
        showModal('Edit Member', '<p>Loading...</p>', async () => {});
        // load member data
        getMemberById(memberId).then(member => {
            if (!member) { alert('Member not found'); hideModal(); return; }
            const formHtml = `
                <form id="memberForm">
                    <div class="form-row"><label>Name</label><input name="name" value="${escapeHtml(member.name||'')}" required></div>
                    <div class="form-row"><label>Phone</label><input name="phone" value="${escapeHtml(member.phone||'')}"></div>
                    <div class="form-row"><label>Scheme ID</label><input name="schemeId" value="${escapeHtml(member.schemeId||'')}"></div>
                    <div class="form-row"><label>Has Prized</label><select name="hasPrized"><option value="false">No</option><option value="true">Yes</option></select></div>
                </form>
            `;
            showModal('Edit Member', formHtml, async () => {
                const form = document.getElementById('memberForm');
                const data = Object.fromEntries(new FormData(form).entries());
                // convert booleans
                data.hasPrized = data.hasPrized === 'true';
                const ok = await updateMember(memberId, data);
                if (ok) await updateMemberListTable();
            });
            // set current value for select
            const sel = document.querySelector('#appModal select[name="hasPrized"]');
            if (sel) sel.value = member.hasPrized ? 'true' : 'false';
        }).catch(err => { console.error(err); hideModal(); });

    } else {
        // Add new member
        const formHtml = `
            <form id="memberForm">
                <div class="form-row"><label>Name</label><input name="name" required></div>
                <div class="form-row"><label>Phone</label><input name="phone"></div>
                <div class="form-row"><label>Scheme ID</label><input name="schemeId"></div>
                <div class="form-row"><label>Has Prized</label><select name="hasPrized"><option value="false">No</option><option value="true">Yes</option></select></div>
            </form>
        `;
        showModal('Add Member', formHtml, async () => {
            const form = document.getElementById('memberForm');
            const data = Object.fromEntries(new FormData(form).entries());
            data.hasPrized = data.hasPrized === 'true';
            const ok = await addMember(data);
            if (ok) await updateMemberListTable();
        });
    }
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]);
}

/* ---------- Dashboard: Add List UI ---------- */
async function renderDashboardLists() {
    // Ensure the overview is hidden and show moduleContent as dashboard
    const overview = document.getElementById('modulesOverview');
    if (overview) overview.style.display = 'none';
    if (moduleContent) {
        moduleContent.style.display = '';
        moduleContent.setAttribute('aria-hidden', 'false');
        moduleContent.innerHTML = `
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="margin:0">Add List</h3>
                    <button id="btnAddList" class="btn-primary">Add List</button>
                </div>
                <p class="muted">Create new lists and manage existing ones. Previous lists appear below.</p>
                <div id="listsContainer" style="margin-top:12px;"></div>
            </div>
        `;
    }

    // Render lists and bind add
    setTimeout(async () => {
        await renderLists();
        const btn = document.getElementById('btnAddList');
        if (btn) btn.addEventListener('click', () => openListModal());
    }, 30);
}

async function renderLists() {
    const container = document.getElementById('listsContainer');
    if (!container) return;
    container.innerHTML = `
        <table id="listsTable">
            <thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody></tbody>
        </table>
    `;

    const tbody = container.querySelector('tbody');
    const lists = await fetchLists();
    tbody.innerHTML = lists.map(l => `
        <tr id="list-${l.firestoreId}">
            <td>${l.firestoreId.substring(0,6)}...</td>
            <td>${escapeHtml(l.title||'—')}</td>
            <td>${escapeHtml(l.description||'')}</td>
            <td>${l.createdAt ? new Date(l.createdAt.seconds ? l.createdAt.seconds*1000 : l.createdAt).toLocaleString() : ''}</td>
            <td>
                <button class="btn-small btn-view" data-id="${l.firestoreId}">View</button>
                <button class="btn-small btn-edit" data-id="${l.firestoreId}">Edit</button>
                <button class="btn-small btn-delete" data-id="${l.firestoreId}">Delete</button>
            </td>
        </tr>
    `).join('');

    // Actions delegation
    tbody.addEventListener('click', async (e) => {
        const t = e.target;
        if (t.classList.contains('btn-edit')) {
            openListModal(t.dataset.id);
        } else if (t.classList.contains('btn-delete')) {
            if (confirm('Delete list? This cannot be undone.')) {
                const ok = await deleteList(t.dataset.id);
                if (ok) await renderLists();
            }
        } else if (t.classList.contains('btn-view')) {
            viewListDetails(t.dataset.id);
        }
    });
}

function openListModal(listId) {
    if (listId) {
        showModal('Edit List', '<p>Loading...</p>', async () => {});
        getListById(listId).then(list => {
            if (!list) { alert('List not found'); hideModal(); return; }
            const html = `
                <form id="listForm">
                    <div class="form-row"><label>Title</label><input name="title" value="${escapeHtml(list.title||'')}" required></div>
                    <div class="form-row"><label>Description</label><textarea name="description">${escapeHtml(list.description||'')}</textarea></div>
                </form>
            `;
            showModal('Edit List', html, async () => {
                const form = document.getElementById('listForm');
                const data = Object.fromEntries(new FormData(form).entries());
                const ok = await updateList(listId, data);
                if (ok) await renderLists();
            });
        }).catch(err => { console.error(err); hideModal(); });
    } else {
        const html = `
            <form id="listForm">
                <div class="form-row"><label>Title</label><input name="title" required></div>
                <div class="form-row"><label>Description</label><textarea name="description"></textarea></div>
            </form>
        `;
        showModal('Add List', html, async () => {
            const form = document.getElementById('listForm');
            const data = Object.fromEntries(new FormData(form).entries());
            data.createdAt = new Date();
            const ok = await addList(data);
            if (ok) await renderLists();
        });
    }
}

async function viewListDetails(listId) {
    const list = await getListById(listId);
    if (!list) { alert('List not found'); return; }

    // Fetch members with schemeId === listId
    const members = (await fetchMembers()).filter(m => (m.schemeId||'') === listId);
    const membersHtml = members.length ? `
        <table style="width:100%;border-collapse:collapse;margin-top:8px;"><thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
        <tbody>${members.map(m => `<tr><td>${m.firestoreId.substring(0,6)}...</td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.phone||'')}</td><td>${m.hasPrized? 'Prized':'Active'}</td></tr>`).join('')}</tbody></table>
    ` : '<p class="muted">No members assigned to this list.</p>';

    const html = `
        <div><strong>Title:</strong> ${escapeHtml(list.title||'—')}</div>
        <div style="margin-top:8px;"><strong>Description:</strong><div>${escapeHtml(list.description||'')}</div></div>
        <div style="margin-top:12px"><h4>Members in this list</h4>${membersHtml}</div>
    `;
    showModal('List Details', html, async () => { hideModal(); });
}
