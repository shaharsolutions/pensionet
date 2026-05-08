import { db } from './supabase.js';

const app = {
    currentTab: 'dashboard',
    activeWalk: null,
    timerInterval: null,
    seconds: 0,
    data: {
        dogs: [],
        walks: [],
        reports: [],
        settings: {
            businessName: 'Walkie Hub',
            pricePerWalk: 50,
            defaultDuration: '30 דק',
            userName: 'שחר'
        }
    },

    async init() {
        try {
            await Promise.all([
                this.loadData(),
                this.loadSettings()
            ]);
        } catch (e) {
            console.error("Failed to load from Supabase:", e);
        }
        this.render();
    },

    async loadData() {
        const [dogs, walks, reports] = await Promise.all([
            db.getDogs(),
            db.getWalks(),
            db.getReports()
        ]);
        this.data.dogs = dogs || [];
        this.data.walks = walks || [];
        this.data.reports = reports || [];
    },

    async loadSettings() {
        const settings = await db.getSettings();
        if (settings && Object.keys(settings).length > 0) {
            this.data.settings = { ...this.data.settings, ...settings };
        }
    },

    switchTab(tabId) {
        if (this.activeWalk && tabId !== 'active-walk') {
            this.showConfirm('יש טיול פעיל. האם ברצונך לצאת?', () => {
                this.currentTab = tabId;
                this.renderTabs();
                this.render();
            });
            return;
        }
        
        this.currentTab = tabId;
        this.renderTabs();
        this.render();
    },

    renderTabs() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(this.currentTab)) {
                link.classList.add('active');
            }
        });
    },

    render() {
        const root = document.getElementById('app-root');
        if (!root) return;
        
        if (this.activeWalk) {
            root.innerHTML = this.templateActiveWalk();
        } else {
            switch(this.currentTab) {
                case 'dashboard':
                    root.innerHTML = this.templateDashboard();
                    break;
                case 'dogs':
                    root.innerHTML = this.templateDogs();
                    break;
                case 'schedule':
                    root.innerHTML = this.templateSchedule();
                    break;
                case 'reports':
                    root.innerHTML = this.templateReports();
                    break;
                case 'settings':
                    root.innerHTML = this.templateSettings();
                    break;
                default:
                    root.innerHTML = `<div class="card"><h2>בקרוב: ${this.currentTab}</h2></div>`;
            }
        }
        
        lucide.createIcons();
    },

    templateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const todayWalks = this.data.walks.filter(w => w.walk_date === today);
        const completedCount = todayWalks.filter(w => w.status === 'completed').length;
        const totalCount = todayWalks.length;
        const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        const price = this.data.settings.pricePerWalk || 50;
        
        return `
            <header class="section-header">
                <div class="header-text">
                    <h1>שלום, ${this.data.settings.userName || 'שחר'}! 👋</h1>
                    <p>הנה סיכום הפעילות שלך ב-${this.data.settings.businessName || 'Walkie'}.</p>
                </div>
                <div class="weather-widget">
                    <i data-lucide="sun" class="weather-icon"></i>
                    <span>24°C | תל אביב</span>
                </div>
            </header>

            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">התקדמות יומית</span>
                        <i data-lucide="trending-up" class="stat-icon"></i>
                    </div>
                    <span class="stat-value">${completedCount}/${totalCount}</span>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">הכנסה היום</span>
                        <i data-lucide="dollar-sign" class="stat-icon"></i>
                    </div>
                    <span class="stat-value">₪${completedCount * price}</span>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">כלבים פעילים</span>
                        <i data-lucide="heart" class="stat-icon"></i>
                    </div>
                    <span class="stat-value">${this.data.dogs.length}</span>
                </div>
            </div>

            <div class="main-grid">
                <section class="card next-walk-card">
                    <h3 class="section-title"><i data-lucide="clock"></i> הטיול הבא</h3>
                    ${this.renderNextWalk(todayWalks.find(w => w.status === 'pending'))}
                </section>
                
                <section class="card recent-activity">
                    <h3 class="section-title"><i data-lucide="activity"></i> פעילות אחרונה</h3>
                    <div class="activity-list">
                        ${this.data.reports.slice(0, 3).map(r => {
                            const walk = this.data.walks.find(w => w.id === r.walk_id);
                            const dog = walk ? this.data.dogs.find(d => d.id === walk.dog_id) : null;
                            if (!dog) return '';
                            return `
                                <div class="activity-item">
                                    <span class="activity-time">${new Date(r.timestamp).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span class="activity-text">סיום טיול עם <strong>${dog.name}</strong></span>
                                </div>
                            `;
                        }).join('')}
                        ${this.data.reports.length === 0 ? '<p>אין פעילות אחרונה להצגה.</p>' : ''}
                    </div>
                </section>
            </div>
        `;
    },

    renderNextWalk(walk) {
        if (!walk) return `<p>אין טיולים נוספים להיום!</p>`;
        const dog = this.data.dogs.find(d => d.id === walk.dog_id);
        if (!dog) return '';
        return `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${dog.image || 'images/golden.png'}" class="dog-avatar" alt="${dog.name}">
                    <div>
                        <strong>${dog.name} (${dog.breed || 'לא הוגדר'})</strong><br>
                        <span style="color: var(--text-muted)">שעה: ${walk.walk_time} | משך: ${walk.duration || '30 דק'}</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="window.app.startWalk('${walk.id}')">
                    <i data-lucide="play"></i> התחל טיול
                </button>
            </div>
        `;
    },

    templateDogs() {
        return `
            <header class="section-header">
                <div class="header-text">
                    <h1>כלבים ולקוחות</h1>
                </div>
                <button class="btn btn-primary" onclick="window.app.showAddDogModal()">
                    <i data-lucide="plus"></i> הוסף כלב חדש
                </button>
            </header>

            <div class="card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>כלב</th>
                            <th>גזע</th>
                            <th>בעלים</th>
                            <th>טלפון</th>
                            <th>סטטוס</th>
                            <th>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.dogs.map(dog => `
                            <tr>
                                <td>
                                    <img src="${dog.image || 'images/golden.png'}" class="dog-avatar">
                                    <strong>${dog.name}</strong>
                                </td>
                                <td>${dog.breed || '-'}</td>
                                <td>${dog.owner}</td>
                                <td>
                                    ${dog.phone || '-'}
                                    ${dog.phone ? `
                                        <a href="${this.formatWhatsAppLink(dog.phone)}" target="_blank" style="color: #25d366; margin-right: 0.5rem; display: inline-flex; align-items: center; vertical-align: middle;">
                                            <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
                                        </a>
                                    ` : ''}
                                </td>
                                <td><span class="status-badge status-${dog.status}">${dog.status === 'active' ? 'פעיל' : 'ממתין'}</span></td>
                                <td>
                                    <button class="btn" style="padding: 0.5rem;" onclick="window.app.showEditDogModal('${dog.id}')">
                                        <i data-lucide="edit-2"></i>
                                    </button>
                                    <button class="btn" style="padding: 0.5rem; color: #ef4444;" onclick="window.app.deleteDog('${dog.id}')">
                                        <i data-lucide="trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    templateActiveWalk() {
        const walk = this.activeWalk;
        const dog = this.data.dogs.find(d => d.id === walk.dog_id);
        return `
            <div class="card" style="text-align: center; max-width: 600px; margin: 2rem auto;">
                <img src="${dog.image || 'images/golden.png'}" class="dog-avatar" style="width: 100px; height: 100px; margin-bottom: 1rem;">
                <h2>טיול פעיל: ${dog.name}</h2>
                <p>${dog.breed || ''} | בעלים: ${dog.owner}</p>
                
                <div class="timer-display" id="walk-timer">${this.formatTime(this.seconds)}</div>
                
                <div class="event-buttons">
                    <div class="event-btn" id="event-pee" onclick="window.app.toggleEvent('pee')">
                        <i data-lucide="droplets" style="color: #3b82f6;"></i>
                        <span>פיפי</span>
                    </div>
                    <div class="event-btn" id="event-poop" onclick="window.app.toggleEvent('poop')">
                        <i data-lucide="trash-2" style="color: #92400e;"></i>
                        <span>קקי</span>
                    </div>
                </div>

                <div class="form-group">
                    <textarea class="form-control" id="walk-notes" placeholder="הערות לטיול..."></textarea>
                </div>

                <div class="modal-buttons">
                    <button class="btn btn-primary" style="background: #ef4444;" onclick="window.app.finishWalk()">
                        <i data-lucide="square"></i> סיום טיול
                    </button>
                </div>
            </div>
        `;
    },

    templateSchedule() {
        return `
            <header class="section-header">
                <div class="header-text">
                    <h1>לו"ז טיולים</h1>
                </div>
                <button class="btn btn-primary" onclick="window.app.showAddWalkModal()">
                    <i data-lucide="calendar-plus"></i> קבע טיול חדש
                </button>
            </header>
            <div class="card">
                <div style="margin-top: 1rem;">
                    ${this.data.walks.length === 0 ? '<p>אין טיולים מתוכננים.</p>' : this.data.walks.map(w => {
                        const dog = this.data.dogs.find(d => d.id === w.dog_id);
                        if (!dog) return '';
                        return `
                            <div class="card" style="margin-bottom: 0.5rem; border-right: 4px solid ${w.status === 'completed' ? '#10b981' : '#f59e0b'}">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>${w.walk_time}</strong> - ${dog.name} (${w.duration || '30 דק'})
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <span class="status-badge status-${w.status}">${w.status === 'completed' ? 'בוצע' : 'ממתין'}</span>
                                        <button class="btn" style="padding: 4px; color: #ef4444;" onclick="window.app.deleteWalk('${w.id}')"><i data-lucide="x-circle"></i></button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    templateReports() {
        return `
            <header class="section-header">
                <div class="header-text">
                    <h1>דיווחים אחרונים</h1>
                </div>
            </header>
            <div class="dashboard-grid">
                ${this.data.reports.length === 0 ? '<div class="card"><p>אין דיווחים עדיין.</p></div>' : this.data.reports.map(r => {
                    const walk = this.data.walks.find(w => w.id === r.walk_id);
                    const dog = walk ? this.data.dogs.find(d => d.id === walk.dog_id) : null;
                    if (!dog) return '';
                    return `
                        <div class="card" style="position: relative;">
                            <button class="btn" style="position: absolute; top: 1rem; left: 1rem; padding: 4px; color: #ccc;" onclick="window.app.deleteReport('${r.id}')">
                                <i data-lucide="trash-2" style="width: 16px;"></i>
                            </button>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                <img src="${dog.image || 'images/golden.png'}" class="dog-avatar">
                                <div>
                                    <strong>${dog.name}</strong><br>
                                    <small style="color: var(--text-muted)">${new Date(r.timestamp).toLocaleDateString('he-IL')} | ${new Date(r.timestamp).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</small>
                                </div>
                            </div>
                            <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">${r.notes || 'אין הערות.'}</p>
                            <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                                <span style="display:flex; align-items:center; gap:4px;"><i data-lucide="${r.peed ? 'check-circle' : 'circle'}" style="width: 14px; color: ${r.peed ? '#10b981' : '#ccc'}"></i> פיפי</span>
                                <span style="display:flex; align-items:center; gap:4px;"><i data-lucide="${r.pooped ? 'check-circle' : 'circle'}" style="width: 14px; color: ${r.pooped ? '#10b981' : '#ccc'}"></i> קקי</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    templateSettings() {
        const s = this.data.settings;
        return `
            <header class="section-header">
                <div class="header-text">
                    <h1>הגדרות מערכת</h1>
                    <p>נהל את פרטי העסק וההעדפות האישיות שלך.</p>
                </div>
            </header>

            <div class="card" style="max-width: 600px;">
                <div class="form-group">
                    <label>שם המשתמש (יוצג בברכה)</label>
                    <input type="text" id="set-userName" class="form-control" value="${s.userName || ''}">
                </div>
                <div class="form-group">
                    <label>שם העסק</label>
                    <input type="text" id="set-businessName" class="form-control" value="${s.businessName || ''}">
                </div>
                <div class="form-group">
                    <label>מחיר לטיול (₪)</label>
                    <input type="number" id="set-pricePerWalk" class="form-control" value="${s.pricePerWalk || 50}">
                </div>
                <div class="form-group">
                    <label>משך טיול ברירת מחדל</label>
                    <input type="text" id="set-defaultDuration" class="form-control" value="${s.defaultDuration || '30 דק'}">
                </div>

                <div class="modal-buttons" style="justify-content: flex-start;">
                    <button class="btn btn-primary" onclick="window.app.saveSettings()">
                        <i data-lucide="save"></i> שמור שינויים
                    </button>
                </div>
            </div>

            <div class="card" style="max-width: 600px; margin-top: 2rem; border-right: 4px solid #ef4444;">
                <h3 style="color: #ef4444; margin-bottom: 1rem;">אזור סכנה</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">פעולות אלו הן בלתי הפיכות.</p>
                <button class="btn" style="color: #ef4444; border: 1px solid #ef4444;" onclick="window.app.clearAllData()">
                    <i data-lucide="trash-2"></i> מחק את כל נתוני האפליקציה
                </button>
            </div>
        `;
    },

    // Logic Functions
    startWalk(walkId) {
        const walk = this.data.walks.find(w => w.id === walkId);
        if (!walk) return;
        this.activeWalk = { ...walk, events: { pee: false, poop: false } };
        this.seconds = 0;
        this.timerInterval = setInterval(() => {
            this.seconds++;
            const display = document.getElementById('walk-timer');
            if (display) display.innerText = this.formatTime(this.seconds);
        }, 1000);
        this.render();
    },

    toggleEvent(type) {
        if (!this.activeWalk) return;
        this.activeWalk.events[type] = !this.activeWalk.events[type];
        const btn = document.getElementById(`event-${type}`);
        if (btn) btn.classList.toggle('active');
    },

    async finishWalk() {
        const notes = document.getElementById('walk-notes').value;
        const report = {
            walk_id: this.activeWalk.id,
            peed: this.activeWalk.events.pee,
            pooped: this.activeWalk.events.poop,
            notes: notes,
            timestamp: new Date().toISOString()
        };

        try {
            await Promise.all([
                db.addReport(report),
                db.updateWalk(this.activeWalk.id, { status: 'completed' })
            ]);
            
            await this.loadData();
            clearInterval(this.timerInterval);
            this.activeWalk = null;
            this.seconds = 0;

            this.showAlert(`
                <i data-lucide="check-circle" style="width: 48px; height: 48px; color: #10b981; margin-bottom: 1rem;"></i>
                <h2>הטיול הושלם!</h2>
                <p>הדיווח נשמר בהצלחה במסד הנתונים.</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">מצוין</button>
                </div>
            `);
            this.render();
        } catch (e) {
            this.showAlert(`
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>שגיאה בשמירה</h2>
                <p>${e.message}</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">הבנתי</button>
                </div>
            `);
        }
    },

    showAddDogModal() {
        this.showAlert(`
            <h2>הוספת כלב חדש</h2>
            <div style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>שם הכלב</label>
                    <input type="text" id="new-dog-name" class="form-control" placeholder="למשל: ברונו">
                </div>
                <div class="form-group">
                    <label>גזע</label>
                    <input type="text" id="new-dog-breed" class="form-control" placeholder="למשל: לברדור">
                </div>
                <div class="form-group">
                    <label>שם הבעלים</label>
                    <input type="text" id="new-dog-owner" class="form-control" placeholder="שם מלא">
                </div>
                <div class="form-group">
                    <label>טלפון</label>
                    <input type="tel" id="new-dog-phone" class="form-control" placeholder="05X-XXXXXXX">
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn" onclick="window.app.closeModal()">ביטול</button>
                <button class="btn btn-primary" onclick="window.app.saveNewDog()">שמור כלב</button>
            </div>
        `);
    },

    async saveNewDog() {
        const name = document.getElementById('new-dog-name').value;
        const breed = document.getElementById('new-dog-breed').value;
        const owner = document.getElementById('new-dog-owner').value;
        const phone = document.getElementById('new-dog-phone').value;

        if (!name || !owner) {
            this.showAlert(`
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #f59e0b; margin-bottom: 1rem;"></i>
                <h2>פרטים חסרים</h2>
                <p>נא למלא לפחות שם ובעלים.</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">אוקיי</button>
                </div>
            `);
            return;
        }

        try {
            await db.addDog({ name, breed, owner, phone, status: 'active' });
            await this.loadData();
            this.closeModal();
            this.render();
        } catch (e) {
            this.showAlert(`
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>שגיאה בשמירת הכלב</h2>
                <p>${e.message}</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                </div>
            `);
        }
    },

    showEditDogModal(id) {
        const dog = this.data.dogs.find(d => d.id === id);
        if (!dog) return;
        this.showAlert(`
            <h2>עריכת פרטי כלב</h2>
            <div style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>שם הכלב</label>
                    <input type="text" id="edit-dog-name" class="form-control" value="${dog.name}">
                </div>
                <div class="form-group">
                    <label>גזע</label>
                    <input type="text" id="edit-dog-breed" class="form-control" value="${dog.breed || ''}">
                </div>
                <div class="form-group">
                    <label>שם הבעלים</label>
                    <input type="text" id="edit-dog-owner" class="form-control" value="${dog.owner}">
                </div>
                <div class="form-group">
                    <label>טלפון</label>
                    <input type="tel" id="edit-dog-phone" class="form-control" value="${dog.phone || ''}">
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn" onclick="window.app.closeModal()">ביטול</button>
                <button class="btn btn-primary" onclick="window.app.saveEditDog('${id}')">שמור שינויים</button>
            </div>
        `);
    },

    async saveEditDog(id) {
        const updates = {
            name: document.getElementById('edit-dog-name').value,
            breed: document.getElementById('edit-dog-breed').value,
            owner: document.getElementById('edit-dog-owner').value,
            phone: document.getElementById('edit-dog-phone').value,
        };

        try {
            await db.updateDog(id, updates);
            await this.loadData();
            this.closeModal();
            this.render();
        } catch (e) {
            this.showAlert(`
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>שגיאה בעדכון</h2>
                <p>${e.message}</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                </div>
            `);
        }
    },

    async deleteDog(id) {
        this.showConfirm('האם אתה בטוח שברצונך למחוק כלב זה?', async () => {
            try {
                await db.deleteDog(id);
                await this.loadData();
                this.render();
            } catch (e) {
                this.showAlert(`
                    <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2>שגיאה במחיקה</h2>
                    <p>${e.message}</p>
                    <div class="modal-buttons">
                        <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                    </div>
                `);
            }
        });
    },

    showAddWalkModal() {
        if (this.data.dogs.length === 0) {
            this.showAlert(`
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #f59e0b; margin-bottom: 1rem;"></i>
                <h2>אין כלבים רשומים</h2>
                <p>עליך להוסיף לפחות כלב אחד לפני קביעת טיול.</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">הוסף כלב עכשיו</button>
                </div>
            `);
            return;
        }
        
        // Default selected duration
        this.selectedDuration = this.data.settings.defaultDuration || '30 דק';

        this.showAlert(`
            <h2>קביעת טיול חדש</h2>
            <div style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>בחר כלב</label>
                    <select id="new-walk-dog" class="form-control">
                        ${this.data.dogs.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>שעה</label>
                    <input type="time" id="new-walk-time" class="form-control" value="${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}">
                </div>
                <div class="form-group">
                    <label>משך זמן</label>
                    <div class="duration-selector">
                        <button class="duration-btn ${this.selectedDuration === '30 דק' ? 'active' : ''}" onclick="window.app.selectDuration(this, '30 דק')">30 דק'</button>
                        <button class="duration-btn ${this.selectedDuration === '45 דק' ? 'active' : ''}" onclick="window.app.selectDuration(this, '45 דק')">45 דק'</button>
                        <button class="duration-btn ${this.selectedDuration === '60 דק' ? 'active' : ''}" onclick="window.app.selectDuration(this, '60 דק')">60 דק'</button>
                        <button class="duration-btn ${this.selectedDuration === '90 דק' ? 'active' : ''}" onclick="window.app.selectDuration(this, '90 דק')">90 דק'</button>
                    </div>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn" onclick="window.app.closeModal()">ביטול</button>
                <button class="btn btn-primary" onclick="window.app.saveNewWalk()">קבע טיול</button>
            </div>
        `);
    },

    selectDuration(btn, value) {
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDuration = value;
    },

    async saveNewWalk() {
        const dogId = document.getElementById('new-walk-dog').value;
        const time = document.getElementById('new-walk-time').value;
        const duration = this.selectedDuration;

        try {
            await db.addWalk({
                dog_id: dogId,
                walk_time: time,
                duration: duration,
                status: 'pending',
                walk_date: new Date().toISOString().split('T')[0]
            });
            await this.loadData();
            this.closeModal();
            this.render();
        } catch (e) {
            this.showAlert(`
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>שגיאה בקביעת הטיול</h2>
                <p>${e.message}</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                </div>
            `);
        }
    },

    async deleteWalk(id) {
        this.showConfirm('האם אתה בטוח שברצונך לבטל טיול זה?', async () => {
            try {
                await db.deleteWalk(id);
                await this.loadData();
                this.render();
            } catch (e) {
                this.showAlert(`
                    <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2>שגיאה בביטול</h2>
                    <p>${e.message}</p>
                    <div class="modal-buttons">
                        <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                    </div>
                `);
            }
        });
    },

    async deleteReport(id) {
        this.showConfirm('האם אתה בטוח שברצונך למחוק דיווח זה?', async () => {
            try {
                await db.deleteReport(id);
                await this.loadData();
                this.render();
            } catch (e) {
                this.showAlert(`
                    <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2>שגיאה במחיקה</h2>
                    <p>${e.message}</p>
                    <div class="modal-buttons">
                        <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                    </div>
                `);
            }
        });
    },

    async saveSettings() {
        const newSettings = {
            userName: document.getElementById('set-userName').value,
            businessName: document.getElementById('set-businessName').value,
            pricePerWalk: parseInt(document.getElementById('set-pricePerWalk').value),
            defaultDuration: document.getElementById('set-defaultDuration').value,
        };

        try {
            const promises = Object.entries(newSettings).map(([key, val]) => db.saveSetting(key, val));
            await Promise.all(promises);
            this.data.settings = { ...this.data.settings, ...newSettings };
            
            this.showAlert(`
                <i data-lucide="check-circle" style="width: 48px; height: 48px; color: #10b981; margin-bottom: 1rem;"></i>
                <h2>ההגדרות נשמרו!</h2>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                </div>
            `);
            this.render();
        } catch (e) {
            this.showAlert(`
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                <h2>שגיאה בשמירה</h2>
                <p>${e.message}</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                </div>
            `);
        }
    },

    async clearAllData() {
        this.showConfirm('האם אתה בטוח שברצונך למחוק את כל הנתונים לצמיתות? פעולה זו תמחק כלבים, טיולים ודיווחים!', async () => {
            try {
                await db.clearAllData();
                await this.loadData();
                this.render();
                this.showAlert(`
                    <i data-lucide="trash" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2>הנתונים נמחקו</h2>
                    <p>כל הנתונים הוסרו בהצלחה ממסד הנתונים.</p>
                    <div class="modal-buttons">
                        <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                    </div>
                `);
            } catch (e) {
                this.showAlert(`
                    <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2>שגיאה במחיקה</h2>
                    <p>${e.message}</p>
                    <div class="modal-buttons">
                        <button class="btn btn-primary" onclick="window.app.closeModal()">סגור</button>
                    </div>
                `);
            }
        });
    },

    formatWhatsAppLink(phone) {
        if (!phone) return '#';
        const cleanPhone = phone.replace(/\D/g, '');
        const formatted = cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone;
        return `https://wa.me/${formatted}`;
    },

    // Utils
    formatTime(s) {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    showAlert(html) {
        const overlay = document.getElementById('modal-overlay');
        const body = document.getElementById('modal-body');
        if (overlay && body) {
            body.innerHTML = html;
            overlay.style.display = 'flex';
            lucide.createIcons();
        }
    },

    showConfirm(text, onConfirm) {
        this.confirmCallback = onConfirm;
        this.showAlert(`
            <i data-lucide="help-circle" style="width: 48px; height: 48px; color: #f59e0b; margin-bottom: 1rem;"></i>
            <h2>אישור פעולה</h2>
            <p>${text}</p>
            <div class="modal-buttons">
                <button class="btn" onclick="window.app.closeModal()">ביטול</button>
                <button class="btn btn-primary" onclick="window.app.handleConfirm()">אישור</button>
            </div>
        `);
    },

    handleConfirm() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.closeModal();
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'none';
        this.confirmCallback = null;
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
