// Simple Firestore helpers for the demo app (v8 API)
(function () {
    if (!window.db) {
        console.warn('Firestore (db) not initialized yet. Ensure firebase.js runs after the SDK scripts.');
        // We'll still define stub functions that throw if used before init
    }

    let _schemesMap = null;

    async function fetchSchemes() {
        if (!_schemesMap && window.db) {
            try {
                const snapshot = await db.collection('schemes').get();
                _schemesMap = {};
                snapshot.forEach(doc => {
                    _schemesMap[doc.id] = Object.assign({ firestoreId: doc.id }, doc.data());
                });
            } catch (err) {
                console.error('fetchSchemes error', err);
                _schemesMap = {};
            }
        }
        return _schemesMap || {};
    }

    async function fetchMembers() {
        if (!window.db) {
            console.error('fetchMembers: Firestore not initialized');
            return [];
        }
        try {
            const snapshot = await db.collection('members').orderBy('name').get();
            const list = [];
            snapshot.forEach(doc => list.push(Object.assign({ firestoreId: doc.id }, doc.data())));
            return list;
        } catch (err) {
            console.error('fetchMembers error', err);
            return [];
        }
    }

    async function addMember(data) {
        if (!window.db) {
            console.error('addMember: Firestore not initialized');
            return false;
        }
        try {
            const res = await db.collection('members').add(data);
            console.log('Member added', res.id);
            return true;
        } catch (err) {
            console.error('addMember error', err);
            return false;
        }
    }

    async function deleteMember(id) {
        if (!window.db) {
            console.error('deleteMember: Firestore not initialized');
            return false;
        }
        try {
            await db.collection('members').doc(id).delete();
            console.log('Member deleted', id);
            return true;
        } catch (err) {
            console.error('deleteMember error', err);
            return false;
        }
    }

    async function updateMember(id, data) {
        if (!window.db) {
            console.error('updateMember: Firestore not initialized');
            return false;
        }
        try {
            await db.collection('members').doc(id).update(data);
            console.log('Member updated', id);
            return true;
        } catch (err) {
            console.error('updateMember error', err);
            return false;
        }
    }

    async function getMemberById(id) {
        if (!window.db) {
            console.error('getMemberById: Firestore not initialized');
            return null;
        }
        try {
            const doc = await db.collection('members').doc(id).get();
            if (!doc.exists) return null;
            return Object.assign({ firestoreId: doc.id }, doc.data());
        } catch (err) {
            console.error('getMemberById error', err);
            return null;
        }
    }

    function getSchemeName(schemeId) {
        if (!_schemesMap) return '—';
        const s = _schemesMap[schemeId];
        return s ? s.name || s.title || s.firestoreId : '—';
    }

    // Expose to global scope for existing scripts
    window.fetchSchemes = fetchSchemes;
    window.fetchMembers = fetchMembers;
    window.addMember = addMember;
    window.deleteMember = deleteMember;
    window.updateMember = updateMember;
    window.getMemberById = getMemberById;
    window.getSchemeName = getSchemeName;

    /* ---------- Lists collection helpers ---------- */
    async function fetchLists() {
        if (!window.db) {
            console.error('fetchLists: Firestore not initialized');
            return [];
        }
        try {
            const snapshot = await db.collection('lists').orderBy('createdAt', 'desc').get();
            const list = [];
            snapshot.forEach(doc => list.push(Object.assign({ firestoreId: doc.id }, doc.data())));
            return list;
        } catch (err) {
            console.error('fetchLists error', err);
            return [];
        }
    }

    async function addList(data) {
        if (!window.db) {
            console.error('addList: Firestore not initialized');
            return false;
        }
        try {
            data.createdAt = new Date();
            const res = await db.collection('lists').add(data);
            console.log('List added', res.id);
            return true;
        } catch (err) {
            console.error('addList error', err);
            return false;
        }
    }

    async function updateList(id, data) {
        if (!window.db) {
            console.error('updateList: Firestore not initialized');
            return false;
        }
        try {
            await db.collection('lists').doc(id).update(data);
            console.log('List updated', id);
            return true;
        } catch (err) {
            console.error('updateList error', err);
            return false;
        }
    }

    async function deleteList(id) {
        if (!window.db) {
            console.error('deleteList: Firestore not initialized');
            return false;
        }
        try {
            await db.collection('lists').doc(id).delete();
            console.log('List deleted', id);
            return true;
        } catch (err) {
            console.error('deleteList error', err);
            return false;
        }
    }

    async function getListById(id) {
        if (!window.db) {
            console.error('getListById: Firestore not initialized');
            return null;
        }
        try {
            const doc = await db.collection('lists').doc(id).get();
            if (!doc.exists) return null;
            return Object.assign({ firestoreId: doc.id }, doc.data());
        } catch (err) {
            console.error('getListById error', err);
            return null;
        }
    }

    window.fetchLists = fetchLists;
    window.addList = addList;
    window.updateList = updateList;
    window.deleteList = deleteList;
    window.getListById = getListById;

})();
