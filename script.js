// Calendar State
let currentDate = new Date();
let currentView = 'month';
let contentData = [];
let editingId = null;

// Platform configurations
const platforms = {
    facebook: { name: 'Facebook', color: '#1877f2', icon: 'fab fa-facebook-f' },
    instagram: { name: 'Instagram', color: '#e4405f', icon: 'fab fa-instagram' },
    twitter: { name: 'Twitter', color: '#1da1f2', icon: 'fab fa-twitter' },
    linkedin: { name: 'LinkedIn', color: '#0a66c2', icon: 'fab fa-linkedin-in' }
};

const contentTypes = {
    post: { icon: 'fas fa-file-alt' },
    story: { icon: 'fas fa-bolt' },
    reel: { icon: 'fas fa-film' },
    video: { icon: 'fas fa-video' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeCalendar();
    setupEventListeners();
    renderCalendar();
});

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('socialMediaContent');
    if (savedData) {
        contentData = JSON.parse(savedData);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('socialMediaContent', JSON.stringify(contentData));
}

// Initialize calendar
function initializeCalendar() {
    const today = new Date();
    currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    updatePeriodDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // View toggle
    document.getElementById('monthViewBtn').addEventListener('click', () => switchView('month'));
    document.getElementById('weekViewBtn').addEventListener('click', () => switchView('week'));

    // Navigation
    document.getElementById('prevBtn').addEventListener('click', navigatePrev);
    document.getElementById('nextBtn').addEventListener('click', navigateNext);
    document.getElementById('todayBtn').addEventListener('click', navigateToday);

    // Add content
    document.getElementById('addContentBtn').addEventListener('click', openAddModal);

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('contentForm').addEventListener('submit', handleFormSubmit);

    // Detail modal
    document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
    document.getElementById('editBtn').addEventListener('click', handleEdit);
    document.getElementById('deleteBtn').addEventListener('click', handleDelete);

    // Export
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);

    // Close modal on backdrop click
    document.getElementById('contentModal').addEventListener('click', (e) => {
        if (e.target.id === 'contentModal') closeModal();
    });
    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') closeDetailModal();
    });
}

// Switch view
function switchView(view) {
    currentView = view;
    
    // Update buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    if (view === 'month') {
        document.getElementById('monthViewBtn').classList.add('active');
        document.getElementById('monthView').classList.add('active');
        document.getElementById('weekView').classList.remove('active');
    } else {
        document.getElementById('weekViewBtn').classList.add('active');
        document.getElementById('weekView').classList.add('active');
        document.getElementById('monthView').classList.remove('active');
    }
    
    renderCalendar();
}

// Navigation
function navigatePrev() {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
        currentDate.setDate(currentDate.getDate() - 7);
    }
    updatePeriodDisplay();
    renderCalendar();
}

function navigateNext() {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
        currentDate.setDate(currentDate.getDate() + 7);
    }
    updatePeriodDisplay();
    renderCalendar();
}

function navigateToday() {
    const today = new Date();
    currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    updatePeriodDisplay();
    renderCalendar();
}

// Update period display
function updatePeriodDisplay() {
    const periodElement = document.getElementById('currentPeriod');
    
    if (currentView === 'month') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        periodElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        periodElement.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    }
}

// Render calendar
function renderCalendar() {
    if (currentView === 'month') {
        renderMonthView();
    } else {
        renderWeekView();
    }
}

// Render month view
function renderMonthView() {
    const grid = document.getElementById('calendarGrid');
    const header = document.getElementById('calendarHeader');
    
    // Render header
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    header.innerHTML = days.map(day => 
        `<div class="calendar-header-day">${day}</div>`
    ).join('');
    
    // Get calendar days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    const lastDayOfWeek = lastDay.getDay();
    
    let days_html = '';
    
    // Previous month days
    for (let i = firstDayOfWeek; i > 0; i--) {
        const date = new Date(year, month - 1, prevLastDate - i + 1);
        days_html += renderDay(date, true);
    }
    
    // Current month days
    for (let i = 1; i <= lastDateOfMonth; i++) {
        const date = new Date(year, month, i);
        days_html += renderDay(date, false);
    }
    
    // Next month days
    const remainingDays = 6 - lastDayOfWeek;
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days_html += renderDay(date, true);
    }
    
    grid.innerHTML = days_html;
    
    // Add click handlers
    document.querySelectorAll('.content-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = item.dataset.id;
            showContentDetail(id);
        });
    });
}

// Render a single day
function renderDay(date, otherMonth) {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dateStr = formatDateKey(date);
    const dayContents = contentData.filter(item => item.date === dateStr);
    
    let classes = 'calendar-day';
    if (otherMonth) classes += ' other-month';
    if (isToday) classes += ' today';
    
    let contentHTML = '';
    const maxDisplay = 3;
    
    dayContents.slice(0, maxDisplay).forEach(content => {
        const platform = platforms[content.platform];
        const type = contentTypes[content.type];
        contentHTML += `
            <div class="content-item ${content.platform}" data-id="${content.id}" data-testid="content-item-${content.id}">
                <i class="${type.icon}"></i>
                <span>${truncateText(content.title, 15)}</span>
            </div>
        `;
    });
    
    if (dayContents.length > maxDisplay) {
        contentHTML += `<div class="content-more">+${dayContents.length - maxDisplay} more</div>`;
    }
    
    return `
        <div class="${classes}" data-date="${dateStr}" data-testid="calendar-day-${dateStr}">
            <div class="day-number">${date.getDate()}</div>
            <div class="day-content">${contentHTML}</div>
        </div>
    `;
}

// Render week view
function renderWeekView() {
    const header = document.getElementById('weekHeader');
    const grid = document.getElementById('weekGrid');
    
    const weekStart = getWeekStart(currentDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    // Render header
    let headerHTML = '<div></div>'; // Empty corner cell
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const isToday = date.toDateString() === today.toDateString();
        headerHTML += `
            <div class="week-header-day ${isToday ? 'today' : ''}" data-testid="week-header-${i}">
                <div class="week-day-name">${days[i]}</div>
                <div class="week-day-date">${date.getDate()}</div>
            </div>
        `;
    }
    header.innerHTML = headerHTML;
    
    // Render grid with time slots
    const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
    let gridHTML = '';
    
    timeSlots.forEach((slot, slotIndex) => {
        gridHTML += `<div class="week-time-slot" data-testid="time-slot-${slotIndex}">${slot}</div>`;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = formatDateKey(date);
            
            const dayContents = contentData.filter(item => {
                if (item.date !== dateStr) return false;
                const hour = parseInt(item.time.split(':')[0]);
                if (slot === 'Morning' && hour >= 6 && hour < 12) return true;
                if (slot === 'Afternoon' && hour >= 12 && hour < 17) return true;
                if (slot === 'Evening' && hour >= 17 && hour < 21) return true;
                if (slot === 'Night' && (hour >= 21 || hour < 6)) return true;
                return false;
            });
            
            let contentHTML = '';
            dayContents.forEach(content => {
                const type = contentTypes[content.type];
                contentHTML += `
                    <div class="content-item ${content.platform}" data-id="${content.id}" data-testid="week-content-item-${content.id}">
                        <i class="${type.icon}"></i>
                        <span>${truncateText(content.title, 12)}</span>
                    </div>
                `;
            });
            
            gridHTML += `<div class="week-day-slot" data-testid="week-slot-${i}-${slotIndex}">${contentHTML}</div>`;
        }
    });
    
    grid.innerHTML = gridHTML;
    
    // Add click handlers
    document.querySelectorAll('.content-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = item.dataset.id;
            showContentDetail(id);
        });
    });
}

// Modal functions
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Content';
    document.getElementById('contentForm').reset();
    
    // Set default date to today
    const today = new Date();
    document.getElementById('contentDate').value = formatDateInput(today);
    document.getElementById('contentTime').value = '12:00';
    
    document.getElementById('contentModal').classList.add('active');
}

function closeModal() {
    document.getElementById('contentModal').classList.remove('active');
    editingId = null;
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: editingId || generateId(),
        title: document.getElementById('contentTitle').value,
        date: document.getElementById('contentDate').value,
        time: document.getElementById('contentTime').value,
        platform: document.getElementById('contentPlatform').value,
        type: document.getElementById('contentType').value,
        description: document.getElementById('contentDescription').value
    };
    
    if (editingId) {
        // Update existing
        const index = contentData.findIndex(item => item.id === editingId);
        if (index !== -1) {
            contentData[index] = formData;
        }
    } else {
        // Add new
        contentData.push(formData);
    }
    
    saveData();
    closeModal();
    renderCalendar();
}

// Show content detail
function showContentDetail(id) {
    const content = contentData.find(item => item.id === id);
    if (!content) return;
    
    const platform = platforms[content.platform];
    const detailContent = document.getElementById('detailContent');
    
    detailContent.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Title</div>
            <div class="detail-value" data-testid="detail-title">${content.title}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date & Time</div>
            <div class="detail-value" data-testid="detail-datetime">${formatDateDisplay(content.date)} at ${content.time}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Platform</div>
            <div class="detail-platform" style="background: ${platform.color};" data-testid="detail-platform">
                <i class="${platform.icon}"></i> ${platform.name}
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Content Type</div>
            <div class="detail-type" data-testid="detail-type">${content.type}</div>
        </div>
        ${content.description ? `
        <div class="detail-item">
            <div class="detail-label">Description</div>
            <div class="detail-value" data-testid="detail-description">${content.description}</div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('detailModal').classList.add('active');
    document.getElementById('editBtn').dataset.id = id;
    document.getElementById('deleteBtn').dataset.id = id;
}

// Edit content
function handleEdit(e) {
    const id = e.currentTarget.dataset.id;
    const content = contentData.find(item => item.id === id);
    if (!content) return;
    
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Content';
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentDate').value = content.date;
    document.getElementById('contentTime').value = content.time;
    document.getElementById('contentPlatform').value = content.platform;
    document.getElementById('contentType').value = content.type;
    document.getElementById('contentDescription').value = content.description || '';
    
    closeDetailModal();
    document.getElementById('contentModal').classList.add('active');
}

// Delete content
function handleDelete(e) {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    const id = e.currentTarget.dataset.id;
    contentData = contentData.filter(item => item.id !== id);
    saveData();
    closeDetailModal();
    renderCalendar();
}

// Export to CSV
function exportToCSV() {
    if (contentData.length === 0) {
        alert('No content to export!');
        return;
    }
    
    const headers = ['Title', 'Date', 'Time', 'Platform', 'Type', 'Description'];
    const rows = contentData.map(item => [
        item.title,
        formatDateDisplay(item.date),
        item.time,
        platforms[item.platform].name,
        item.type,
        item.description || ''
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-media-calendar-${formatDateKey(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Utility functions
function generateId() {
    return 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateInput(date) {
    return formatDateKey(date);
}

function formatDateDisplay(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}
