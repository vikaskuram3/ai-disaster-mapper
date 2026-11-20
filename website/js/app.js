/**
 * Narasimha PG Hostel Manager v3.0 - Enterprise SaaS Controller
 * Complete Commercial PG Hostel Management System
 * Hyderabad, Telangana, India
 */

(function () {
  'use strict';

  class AppController {
    constructor() {
      // Initialize or reuse DatabaseService
      this.db = window.DatabaseService ? new window.DatabaseService() : null;
      this.currentView = 'dashboard';
      this.selectedHostelFilter = 'all';
      this.selectedFloorFilter = 'all';
      this.selectedSharingFilter = 'all';
      this.selectedAvailabilityFilter = 'all';
      this.searchQuery = '';
      this.authTab = 'signin';
      this.authRole = 'owner';
      this.activeModal = null;
      this.modalPayload = null;

      this.init();
    }

    init() {
      // Check current user role to set initial view
      if (this.db && this.db.currentUser) {
        if (this.db.currentUser.role === 'student') {
          this.currentView = 'student-portal';
        }
      }
      this.render();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }

    showToast(message, type = 'success') {
      const existing = document.getElementById('app-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-sm font-semibold transition transform duration-200 ${
        type === 'error' ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-emerald-600 text-white shadow-emerald-200'
      }`;
      toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✓'}</span><span>${message}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 250);
      }, 3000);
    }

    openModal(modalId, payload = null) {
      this.activeModal = modalId;
      this.modalPayload = payload;
      this.renderModal();
    }

    closeModal() {
      this.activeModal = null;
      this.modalPayload = null;
      const c = document.getElementById('modal-container');
      if (c) c.innerHTML = '';
    }

    formatCurrency(val) {
      if (!val && val !== 0) return '₹0';
      return '₹' + Number(val).toLocaleString('en-IN');
    }

    render() {
      const app = document.getElementById('app');
      if (!app) return;

      if (!this.db || !this.db.currentUser) {
        app.innerHTML = this.renderAuthView();
        this.bindAuthEvents();
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      const isStudent = this.db.currentUser.role === 'student';

      app.innerHTML = `
        <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          ${this.renderHeader()}
          <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            ${isStudent ? this.renderStudentPortalView() : this.renderActiveTabContent()}
          </main>
          ${this.renderFooter()}
          <div id="modal-container"></div>
        </div>
      `;

      this.bindHeaderEvents();
      this.bindViewEvents();
      if (window.lucide) window.lucide.createIcons();
    }

    renderHeader() {
      const user = this.db.currentUser;
      const isStudent = user && user.role === 'student';
      const hostels = this.db.getHostels();

      if (isStudent) {
        return `
          <header class="sticky top-0 z-30 glass-nav border-b border-slate-200 shadow-xs">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <i data-lucide="graduation-cap" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Narasimha PG</span>
                      <span class="text-xs px-2 py-0.5 font-semibold bg-emerald-100 text-emerald-800 rounded-full">Student Resident Portal</span>
                    </div>
                    <p class="text-xs text-slate-500">Welcome, ${user.full_name || user.email}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <button id="signout-btn" class="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1.5">
                    <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
        `;
      }

      // Owner Header
      return `
        <header class="sticky top-0 z-30 glass-nav border-b border-slate-200 shadow-xs">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 gap-3">
              <!-- Brand Logo & Title -->
              <div class="flex items-center space-x-3 cursor-pointer" id="nav-brand-btn">
                <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <i data-lucide="building-2" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Narasimha</span>
                    <span class="text-xs px-2 py-0.5 font-semibold bg-blue-100 text-blue-700 rounded-full">PG Hostels SaaS</span>
                  </div>
                  <p class="hidden sm:block text-xs text-slate-500 font-medium">Hyderabad, Telangana • Multi-Property Platform</p>
                </div>
              </div>

              <!-- Hostel Filter Dropdown -->
              <div class="flex items-center gap-2">
                <div class="relative">
                  <select id="global-hostel-selector" class="pl-8 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition cursor-pointer appearance-none">
                    <option value="all" ${this.selectedHostelFilter === 'all' ? 'selected' : ''}>🏢 All Hostels (${hostels.length})</option>
                    ${hostels.map(h => `<option value="${h.id}" ${this.selectedHostelFilter === h.id ? 'selected' : ''}>📍 ${h.name} (${h.area || h.city})</option>`).join('')}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                  </div>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                    <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
                  </div>
                </div>
              </div>

              <!-- Navigation Links & User Menu -->
              <div class="flex items-center space-x-1 sm:space-x-2">
                <nav class="hidden xl:flex items-center space-x-1">
                  <button id="nav-tab-dashboard" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Dashboard
                  </button>
                  <button id="nav-tab-hostels" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'hostels' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Hostels (${hostels.length})
                  </button>
                  <button id="nav-tab-floors" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'floors' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Floors
                  </button>
                  <button id="nav-tab-rooms" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'rooms' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Rooms & Beds
                  </button>
                  <button id="nav-tab-pricing" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'pricing' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Pricing
                  </button>
                  <button id="nav-tab-students" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'students' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Students
                  </button>
                  <button id="nav-tab-payments" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'payments' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Payments
                  </button>
                  <button id="nav-tab-reminders" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition ${this.currentView === 'reminders' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
                    Reminders
                  </button>
                </nav>

                <!-- Database / Acceptance Settings modal button -->
                <button id="open-db-modal-btn" class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition" title="Acceptance Testing & Database Settings">
                  <i data-lucide="database" class="w-4 h-4"></i>
                </button>

                <!-- User profile / logout -->
                <div class="flex items-center pl-2 border-l border-slate-200">
                  <span class="hidden md:inline text-xs font-semibold text-slate-700 mr-2">${user.full_name || 'Owner'}</span>
                  <button id="signout-btn" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Sign Out">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile Navigation Scrollable Bar -->
            <div class="flex xl:hidden items-center space-x-1 py-2 border-t border-slate-100 overflow-x-auto text-xs whitespace-nowrap">
              <button id="mobile-nav-dashboard" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Dashboard</button>
              <button id="mobile-nav-hostels" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'hostels' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Hostels</button>
              <button id="mobile-nav-floors" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'floors' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Floors</button>
              <button id="mobile-nav-rooms" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'rooms' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Rooms & Beds</button>
              <button id="mobile-nav-pricing" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'pricing' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Pricing</button>
              <button id="mobile-nav-students" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'students' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Students</button>
              <button id="mobile-nav-payments" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'payments' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Payments</button>
              <button id="mobile-nav-reminders" class="px-2.5 py-1.5 font-medium rounded-lg ${this.currentView === 'reminders' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}">Reminders</button>
            </div>
          </div>
        </header>
      `;
    }

    renderActiveTabContent() {
      switch (this.currentView) {
        case 'hostels': return this.renderHostelsView();
        case 'floors': return this.renderFloorsView();
        case 'rooms': return this.renderRoomsView();
        case 'pricing': return this.renderPricingView();
        case 'students': return this.renderStudentsView();
        case 'payments': return this.renderPaymentsView();
        case 'reminders': return this.renderRemindersView();
        default: return this.renderDashboardView();
      }
    }

    // ==========================================
    // 1. DASHBOARD VIEW (Module 7 & 8)
    // ==========================================
    renderDashboardView() {
      const genMetrics = this.db.getGeneralMetrics(this.selectedHostelFilter);
      const finMetrics = this.db.getFinancialMetrics(this.selectedHostelFilter);
      const currentHostel = this.selectedHostelFilter !== 'all' ? this.db.getHostelById(this.selectedHostelFilter) : null;
      const hostels = this.db.getHostels();

      // Get students with urgent status (due today or overdue)
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const urgentStudents = this.db.getStudents({ hostel_id: this.selectedHostelFilter, status: 'Active' })
        .filter(s => s.next_payment_due_date <= todayStr || s.next_payment_due_date === tomorrowStr);

      return `
        <div class="space-y-6">
          <!-- Page Header & Quick Action Buttons -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
                ${currentHostel ? `Property Overview: ${currentHostel.name}` : 'PG Hostel Executive Dashboard'}
              </h1>
              <p class="text-sm text-slate-500 mt-0.5">
                ${currentHostel ? `${currentHostel.area}, ${currentHostel.city}, ${currentHostel.state} — Real-time occupancy & financial operations` : `Consolidated operations across ${hostels.length} hostel properties in Hyderabad`}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button id="quick-add-student-btn" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                <span>Add Student</span>
              </button>
              <button id="quick-add-room-btn" class="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition">
                <i data-lucide="plus" class="w-4 h-4 text-slate-500"></i>
                <span>Add Room</span>
              </button>
              <button id="quick-record-payment-btn" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition">
                <i data-lucide="credit-card" class="w-4 h-4"></i>
                <span>Record Payment</span>
              </button>
              <button id="run-daily-reminders-quick-btn" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition" title="Trigger Automated Rent Reminders (Asia/Kolkata)">
                <i data-lucide="bell-ring" class="w-4 h-4"></i>
                <span>Trigger Reminders</span>
              </button>
            </div>
          </div>

          <!-- KPI Summary Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Total Hostels -->
            <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider">Hostels</span>
                <i data-lucide="building" class="w-4 h-4 text-blue-600"></i>
              </div>
              <div class="text-2xl font-bold text-slate-900">${genMetrics.totalHostels}</div>
              <p class="text-xs text-slate-500 mt-1">${genMetrics.totalRooms} rooms configured</p>
            </div>

            <!-- Bed Occupancy -->
            <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider">Occupancy</span>
                <i data-lucide="bed" class="w-4 h-4 text-blue-600"></i>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold text-slate-900">${genMetrics.occupancyRate}%</span>
                <span class="text-xs font-semibold text-slate-500">${genMetrics.occupiedBeds}/${genMetrics.totalBeds} beds</span>
              </div>
              <p class="text-xs text-emerald-600 font-medium mt-1">${genMetrics.availableBeds} beds vacant</p>
            </div>

            <!-- Expected Revenue -->
            <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider">Monthly Expected</span>
                <i data-lucide="indian-rupee" class="w-4 h-4 text-emerald-600"></i>
              </div>
              <div class="text-2xl font-bold text-slate-900">${this.formatCurrency(finMetrics.totalExpectedRevenue)}</div>
              <p class="text-xs text-slate-500 mt-1">${finMetrics.totalActiveStudents} active residents</p>
            </div>

            <!-- Collected vs Pending -->
            <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider">Rent Collected</span>
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
              </div>
              <div class="text-2xl font-bold text-emerald-600">${this.formatCurrency(finMetrics.totalRentCollected)}</div>
              <p class="text-xs text-amber-600 font-medium mt-1">Pending: ${this.formatCurrency(finMetrics.pendingRevenue)}</p>
            </div>
          </div>

          <!-- Payment Alerts Bar -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div>
                  <div class="text-xs font-semibold text-amber-900">Due Tomorrow (24h Notice)</div>
                  <div class="text-xs text-amber-700">${finMetrics.dueTomorrowCount} student(s) due tomorrow</div>
                </div>
              </div>
              <span class="text-base font-bold text-amber-800">${finMetrics.dueTomorrowCount}</span>
            </div>

            <div class="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
                <div>
                  <div class="text-xs font-semibold text-orange-900">Due Today (Expiry Date)</div>
                  <div class="text-xs text-orange-700">${finMetrics.dueTodayCount} student(s) due today</div>
                </div>
              </div>
              <span class="text-base font-bold text-orange-800">${finMetrics.dueTodayCount}</span>
            </div>

            <div class="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div>
                  <div class="text-xs font-semibold text-rose-900">Overdue Payments</div>
                  <div class="text-xs text-rose-700">${finMetrics.overdueCount} student(s) overdue</div>
                </div>
              </div>
              <span class="text-base font-bold text-rose-800">${finMetrics.overdueCount}</span>
            </div>
          </div>

          <!-- 4 Interactive Visual SVG Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Chart 1: Bed Occupancy Gauge / Donut -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-slate-900">Bed Occupancy Status</h3>
                <span class="text-xs px-2 py-0.5 font-semibold bg-blue-100 text-blue-800 rounded-full">${genMetrics.occupancyRate}% Full</span>
              </div>
              <div class="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                <!-- SVG Donut -->
                <div class="relative w-36 h-36 flex items-center justify-center">
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" stroke-width="3.8"></circle>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#2563eb" stroke-width="3.8"
                            stroke-dasharray="${genMetrics.occupancyRate}, 100" stroke-linecap="round"></circle>
                  </svg>
                  <div class="absolute text-center">
                    <span class="text-xl font-bold text-slate-900">${genMetrics.occupiedBeds}</span>
                    <span class="block text-[10px] text-slate-400 uppercase font-medium">Beds Filled</span>
                  </div>
                </div>
                <!-- Legend -->
                <div class="space-y-3 text-xs w-full sm:w-48">
                  <div class="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-md bg-blue-600"></div>
                      <span class="font-medium text-slate-700">Occupied</span>
                    </div>
                    <span class="font-bold text-slate-900">${genMetrics.occupiedBeds}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-md bg-emerald-500"></div>
                      <span class="font-medium text-slate-700">Available</span>
                    </div>
                    <span class="font-bold text-emerald-800">${genMetrics.availableBeds}</span>
                  </div>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span class="font-medium text-slate-500">Total Capacity</span>
                    <span class="font-bold text-slate-700">${genMetrics.totalBeds} Beds</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chart 2: Revenue Collection Breakdown -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-slate-900">Monthly Revenue Collection</h3>
                <span class="text-xs text-slate-500 font-medium">Cycle: ${new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              <div class="space-y-4 py-2">
                <div>
                  <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Collected: ${this.formatCurrency(finMetrics.totalRentCollected)}</span>
                    <span class="text-slate-500">Target: ${this.formatCurrency(finMetrics.totalExpectedRevenue)}</span>
                  </div>
                  <div class="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                    <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${finMetrics.totalExpectedRevenue > 0 ? Math.min(100, Math.round((finMetrics.totalRentCollected / finMetrics.totalExpectedRevenue) * 100)) : 0}%"></div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 pt-2">
                  <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <span class="text-[11px] font-semibold text-emerald-700 uppercase">Collected</span>
                    <div class="text-lg font-bold text-emerald-900 mt-0.5">${this.formatCurrency(finMetrics.totalRentCollected)}</div>
                  </div>
                  <div class="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <span class="text-[11px] font-semibold text-amber-700 uppercase">Pending Collection</span>
                    <div class="text-lg font-bold text-amber-900 mt-0.5">${this.formatCurrency(finMetrics.pendingRevenue)}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chart 3: Student Payment Status Breakdown -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-slate-900">Resident Payment Status</h3>
                <span class="text-xs text-slate-500">${finMetrics.totalActiveStudents} Active Students</span>
              </div>
              <div class="grid grid-cols-4 gap-2 pt-2 text-center">
                <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div class="text-xl font-bold text-emerald-700">${finMetrics.paidCount}</div>
                  <div class="text-[10px] font-semibold text-emerald-800 uppercase mt-1">Paid / Ahead</div>
                </div>
                <div class="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div class="text-xl font-bold text-amber-700">${finMetrics.dueTomorrowCount}</div>
                  <div class="text-[10px] font-semibold text-amber-800 uppercase mt-1">Due Tomorrow</div>
                </div>
                <div class="p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <div class="text-xl font-bold text-orange-700">${finMetrics.dueTodayCount}</div>
                  <div class="text-[10px] font-semibold text-orange-800 uppercase mt-1">Due Today</div>
                </div>
                <div class="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <div class="text-xl font-bold text-rose-700">${finMetrics.overdueCount}</div>
                  <div class="text-[10px] font-semibold text-rose-800 uppercase mt-1">Overdue</div>
                </div>
              </div>
            </div>

            <!-- Chart 4: Sharing-Type Availability -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-slate-900">Sharing-Wise Inventory</h3>
                <button id="view-pricing-shortcut" class="text-xs text-blue-600 hover:text-blue-800 font-semibold">View Rates →</button>
              </div>
              <div class="space-y-2 text-xs">
                ${[1, 2, 3, 4, 5].map(type => {
                  const label = window.SHARING_CONFIG ? window.SHARING_CONFIG[type].name : `${type} Sharing`;
                  const allRooms = this.db.getRooms(this.selectedHostelFilter).filter(r => r.sharing_type === type);
                  const roomIds = allRooms.map(r => r.id);
                  const totalBeds = this.db.state.beds.filter(b => roomIds.includes(b.room_id)).length;
                  const occupiedBeds = this.db.state.students.filter(s => roomIds.includes(s.room_id) && s.student_status === 'Active').length;
                  const vacant = Math.max(0, totalBeds - occupiedBeds);
                  return `
                    <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                      <div class="flex items-center gap-2">
                        <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">${type}</span>
                        <span class="font-semibold text-slate-800">${label}</span>
                        <span class="text-slate-400">(${allRooms.length} rooms)</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-slate-500">${occupiedBeds}/${totalBeds} filled</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${vacant > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
                          ${vacant > 0 ? `${vacant} Vacant` : 'Full'}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Immediate Action Alert Table for Due / Overdue Students -->
          ${urgentStudents.length > 0 ? `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div class="flex items-center gap-2">
                  <i data-lucide="bell" class="w-4 h-4 text-amber-600"></i>
                  <h3 class="text-sm font-bold text-slate-900">Active Rent Payment Follow-Ups</h3>
                </div>
                <span class="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded-full">${urgentStudents.length} Students Requiring Action</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th class="px-4 py-3">Student</th>
                      <th class="px-4 py-3">Hostel & Room</th>
                      <th class="px-4 py-3">Monthly Rent</th>
                      <th class="px-4 py-3">Due Date</th>
                      <th class="px-4 py-3">Status</th>
                      <th class="px-4 py-3 text-right">Instant Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                    ${urgentStudents.map(student => {
                      const hostel = this.db.getHostelById(student.hostel_id);
                      const room = this.db.state.rooms.find(r => r.id === student.room_id);
                      const isToday = student.next_payment_due_date === todayStr;
                      const isTomorrow = student.next_payment_due_date === tomorrowStr;
                      const isOverdue = student.next_payment_due_date < todayStr;
                      const badgeClass = isOverdue ? 'badge-overdue' : (isToday ? 'badge-due-today' : 'badge-due-tomorrow');
                      const statusText = isOverdue ? 'Overdue' : (isToday ? 'Due Today' : 'Due Tomorrow');

                      return `
                        <tr class="hover:bg-slate-50">
                          <td class="px-4 py-3 font-semibold text-slate-900">
                            <div>${student.full_name}</div>
                            <div class="text-[11px] text-slate-400 font-normal">${student.mobile_number} • ${student.student_id_code}</div>
                          </td>
                          <td class="px-4 py-3">
                            <div>${hostel ? hostel.name : 'PG Hostel'}</div>
                            <div class="text-[11px] text-slate-400 font-normal">Room ${room ? room.room_number : '-'}</div>
                          </td>
                          <td class="px-4 py-3 font-semibold text-slate-900">${this.formatCurrency(student.agreed_monthly_rent)}</td>
                          <td class="px-4 py-3 font-medium">${student.next_payment_due_date}</td>
                          <td class="px-4 py-3">
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}">${statusText}</span>
                          </td>
                          <td class="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button data-action="whatsapp-reminder" data-student-id="${student.id}" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold inline-flex items-center gap-1 transition">
                              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                              <span>WhatsApp</span>
                            </button>
                            <button data-action="quick-pay" data-student-id="${student.id}" class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-1 transition">
                              <i data-lucide="credit-card" class="w-3.5 h-3.5"></i>
                              <span>Collect</span>
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    // ==========================================
    // 2. HOSTEL MANAGEMENT VIEW (Module 1)
    // ==========================================
    renderHostelsView() {
      const hostels = this.db.getHostels();

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Hostel Properties</h1>
              <p class="text-sm text-slate-500 mt-0.5">Manage multiple PG hostels in Hyderabad, addresses, and Google Maps locations</p>
            </div>
            <button id="add-hostel-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add New Hostel</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${hostels.map(hostel => {
              const rooms = this.db.state.rooms.filter(r => r.hostel_id === hostel.id);
              const roomIds = rooms.map(r => r.id);
              const beds = this.db.state.beds.filter(b => roomIds.includes(b.room_id));
              const activeStudents = this.db.state.students.filter(s => s.hostel_id === hostel.id && s.student_status === 'Active');
              const occupiedBeds = activeStudents.length;
              const totalBeds = beds.length;
              const availableBeds = Math.max(0, totalBeds - occupiedBeds);
              const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

              return `
                <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between interactive-card">
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <h2 class="text-lg font-bold text-slate-900">${hostel.name}</h2>
                          <span class="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full">${hostel.type || 'Boys'} PG</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <i data-lucide="phone" class="w-3 h-3 text-slate-400"></i>
                          <span>${hostel.contact_number || '+91 98480 12345'}</span>
                        </p>
                      </div>
                      <div class="flex items-center gap-1">
                        <button data-action="edit-hostel" data-id="${hostel.id}" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Hostel">
                          <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button data-action="delete-hostel" data-id="${hostel.id}" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Hostel">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Complete Address Box -->
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4 space-y-1">
                      <div class="font-semibold text-slate-800 flex items-center gap-1.5">
                        <i data-lucide="map-pin" class="w-3.5 h-3.5 text-blue-600"></i>
                        <span>Complete Hostel Address:</span>
                      </div>
                      <p class="leading-relaxed">${hostel.address || (hostel.area + ', Hyderabad, Telangana')}</p>
                      <p class="text-slate-500">Area: <span class="font-medium text-slate-700">${hostel.area}</span> • City: <span class="font-medium text-slate-700">${hostel.city}</span> • PIN: <span class="font-medium text-slate-700">${hostel.pincode}</span></p>
                    </div>

                    <!-- Capacity & Occupancy -->
                    <div class="space-y-2 mb-4 text-xs">
                      <div class="flex justify-between font-medium">
                        <span class="text-slate-500">Bed Occupancy:</span>
                        <span class="text-slate-900 font-bold">${occupiedBeds} / ${totalBeds} Beds (${occupancyPct}%)</span>
                      </div>
                      <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div class="bg-blue-600 h-full rounded-full" style="width: ${occupancyPct}%"></div>
                      </div>
                      <div class="flex justify-between text-[11px] text-slate-500 pt-1">
                        <span>Floors: <b class="text-slate-700">${hostel.total_floors || 3} Floors</b></span>
                        <span>Rooms: <b class="text-slate-700">${rooms.length}</b></span>
                        <span class="text-emerald-600 font-semibold">${availableBeds} Vacant Beds</span>
                      </div>
                    </div>
                  </div>

                  <!-- Google Maps Action Link -->
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a href="${hostel.maps_url}" target="_blank" rel="noopener noreferrer" class="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                      <i data-lucide="map" class="w-3.5 h-3.5 text-blue-600"></i>
                      <span>Open Location in Google Maps</span>
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ==========================================
    // 3. FLOOR MANAGEMENT VIEW (Module 2)
    // ==========================================
    renderFloorsView() {
      const hostels = this.db.getHostels();
      const targetHostelId = this.selectedHostelFilter !== 'all' ? this.selectedHostelFilter : (hostels[0] ? hostels[0].id : null);
      const activeHostel = this.db.getHostelById(targetHostelId);
      const floors = this.db.getFloors(targetHostelId);

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Floor Management</h1>
              <p class="text-sm text-slate-500 mt-0.5">Organize rooms and beds floor-wise across hostel properties</p>
            </div>
            <button id="add-custom-floor-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Custom Floor</span>
            </button>
          </div>

          <!-- Floor List & Floor-wise Room Breakdown -->
          <div class="space-y-4">
            ${floors.map(floorName => {
              const roomsOnFloor = this.db.state.rooms.filter(r => 
                (targetHostelId ? r.hostel_id === targetHostelId : true) && 
                (r.floor_name === floorName || r.floor === floorName)
              );
              const roomIds = roomsOnFloor.map(r => r.id);
              const bedsOnFloor = this.db.state.beds.filter(b => roomIds.includes(b.room_id));
              const activeStudents = this.db.state.students.filter(s => roomIds.includes(s.room_id) && s.student_status === 'Active');
              const vacantBeds = Math.max(0, bedsOnFloor.length - activeStudents.length);

              return `
                <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm">
                        <i data-lucide="layers" class="w-4 h-4"></i>
                      </div>
                      <div>
                        <h3 class="text-base font-bold text-slate-900">${floorName}</h3>
                        <p class="text-xs text-slate-500">${roomsOnFloor.length} rooms • ${bedsOnFloor.length} total beds • <span class="text-emerald-600 font-semibold">${vacantBeds} available beds</span></p>
                      </div>
                    </div>
                    <button data-action="add-room-to-floor" data-floor="${floorName}" class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center gap-1 self-start sm:self-auto">
                      <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                      <span>Add Room Here</span>
                    </button>
                  </div>

                  <!-- Rooms Grid on this Floor -->
                  ${roomsOnFloor.length > 0 ? `
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-3">
                      ${roomsOnFloor.map(room => {
                        const roomBeds = this.db.state.beds.filter(b => b.room_id === room.id);
                        const occ = this.db.state.students.filter(s => s.room_id === room.id && s.student_status === 'Active').length;
                        const avail = Math.max(0, roomBeds.length - occ);
                        return `
                          <div class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer" data-action="view-room" data-id="${room.id}">
                            <div class="flex justify-between items-center mb-1">
                              <span class="font-bold text-sm text-slate-900">Room ${room.room_number}</span>
                              <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full ${avail > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
                                ${avail > 0 ? `${avail} Avail` : 'Full'}
                              </span>
                            </div>
                            <div class="text-[11px] text-slate-500 space-y-0.5">
                              <div>${room.sharing_type} Sharing • ${this.formatCurrency(room.monthly_rent)}/mo</div>
                              <div>${room.ac ? 'AC' : 'Non-AC'} • ${room.attached_washroom ? 'Attached Washroom' : 'Common Washroom'}</div>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  ` : `
                    <p class="text-xs text-slate-400 italic pt-3">No rooms configured on this floor yet. Click "Add Room Here" to create a room.</p>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ==========================================
    // 4. ROOMS & BEDS MANAGEMENT VIEW (Module 2)
    // ==========================================
    renderRoomsView() {
      const hostels = this.db.getHostels();
      const floors = this.db.getFloors(this.selectedHostelFilter);

      let rooms = this.db.getRooms(this.selectedHostelFilter);

      // Floor Filter
      if (this.selectedFloorFilter !== 'all') {
        rooms = rooms.filter(r => (r.floor_name || r.floor) === this.selectedFloorFilter);
      }
      // Sharing Filter
      if (this.selectedSharingFilter !== 'all') {
        rooms = rooms.filter(r => r.sharing_type === parseInt(this.selectedSharingFilter, 10));
      }
      // Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        rooms = rooms.filter(r => r.room_number.toLowerCase().includes(q));
      }

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Rooms & Beds Management</h1>
              <p class="text-sm text-slate-500 mt-0.5">Real-time room occupancy, washroom amenities, and bed allocations</p>
            </div>
            <button id="add-room-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Room</span>
            </button>
          </div>

          <!-- Filter Toolbar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex flex-wrap items-center gap-2.5">
              <!-- Search Room -->
              <div class="relative">
                <input id="room-search-input" type="text" placeholder="Search Room Number..." value="${this.searchQuery}" class="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                  <i data-lucide="search" class="w-3.5 h-3.5"></i>
                </div>
              </div>

              <!-- Floor Dropdown -->
              <select id="room-floor-filter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all" ${this.selectedFloorFilter === 'all' ? 'selected' : ''}>All Floors</option>
                ${floors.map(fl => `<option value="${fl}" ${this.selectedFloorFilter === fl ? 'selected' : ''}>${fl}</option>`).join('')}
              </select>

              <!-- Sharing Dropdown -->
              <select id="room-sharing-filter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all" ${this.selectedSharingFilter === 'all' ? 'selected' : ''}>All Sharing Types</option>
                <option value="1" ${this.selectedSharingFilter === '1' ? 'selected' : ''}>Single Sharing</option>
                <option value="2" ${this.selectedSharingFilter === '2' ? 'selected' : ''}>2 Sharing</option>
                <option value="3" ${this.selectedSharingFilter === '3' ? 'selected' : ''}>3 Sharing</option>
                <option value="4" ${this.selectedSharingFilter === '4' ? 'selected' : ''}>4 Sharing</option>
                <option value="5" ${this.selectedSharingFilter === '5' ? 'selected' : ''}>5 Sharing</option>
              </select>
            </div>

            <div class="text-slate-500 font-semibold">
              Showing <span class="text-slate-900">${rooms.length}</span> rooms
            </div>
          </div>

          <!-- Room Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${rooms.map(room => {
              const details = this.db.getRoomDetails(room.id);
              if (!details) return '';

              // Washroom string
              let washroomStr = 'None';
              if (room.attached_washroom && room.common_washroom) washroomStr = 'Attached & Common';
              else if (room.attached_washroom) washroomStr = 'Attached';
              else if (room.common_washroom) washroomStr = 'Common';

              return `
                <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between interactive-card">
                  <div>
                    <!-- Header with Room Number & Actions -->
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <h2 class="text-xl font-bold text-slate-900">Room ${details.room_number}</h2>
                          <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full ${details.availableBeds > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
                            ${details.availabilityStatus}
                          </span>
                        </div>
                        <p class="text-xs text-blue-600 font-semibold mt-0.5">${details.hostel ? details.hostel.name : 'PG Hostel'}</p>
                      </div>
                      <div class="flex items-center gap-1">
                        <button data-action="edit-room" data-id="${details.id}" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Room">
                          <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button data-action="delete-room" data-id="${details.id}" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Room">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Exact Room Specification Format Required by User -->
                    <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1.5 mb-4">
                      <div class="flex justify-between"><span class="text-slate-500 font-medium">Floor:</span> <span class="font-bold text-slate-800">${details.floor_name || details.floor || 'Ground Floor'}</span></div>
                      <div class="flex justify-between"><span class="text-slate-500 font-medium">Sharing:</span> <span class="font-bold text-slate-800">${details.sharing_type} Sharing</span></div>
                      <div class="flex justify-between"><span class="text-slate-500 font-medium">Monthly Rent:</span> <span class="font-bold text-blue-700">${this.formatCurrency(details.monthly_rent)} per person</span></div>
                      <div class="flex justify-between"><span class="text-slate-500 font-medium">Washroom:</span> <span class="font-bold text-slate-800">${washroomStr}</span></div>
                      <div class="flex justify-between"><span class="text-slate-500 font-medium">AC:</span> <span class="font-bold text-slate-800">${details.ac ? 'AC' : 'Non-AC'}</span></div>
                      <div class="flex justify-between pt-1 border-t border-slate-200/60 font-semibold">
                        <span class="text-slate-600">Occupied Beds: <b class="text-slate-900">${details.occupiedBeds}</b></span>
                        <span class="text-emerald-600">Available Beds: <b>${details.availableBeds}</b></span>
                      </div>
                    </div>

                    <!-- Bed Allocation Slots -->
                    <div class="space-y-1.5 mb-4">
                      <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bed Slot Occupancy:</div>
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        ${details.beds.map(bed => {
                          return `
                            <div class="p-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center text-center ${bed.isOccupied ? 'bed-slot-occupied' : 'bed-slot-available'}">
                              <span class="text-[10px] uppercase font-bold">Bed ${bed.bed_number}</span>
                              <span class="truncate w-full text-[11px] font-medium mt-0.5">
                                ${bed.isOccupied ? (bed.student ? bed.student.full_name : 'Occupied') : 'Vacant'}
                              </span>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  </div>

                  <!-- Quick Action Button -->
                  <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
                    ${details.availableBeds > 0 ? `
                      <button data-action="checkin-student-to-room" data-room-id="${details.id}" data-hostel-id="${details.hostel_id}" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                        <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
                        <span>Assign Resident to Room</span>
                      </button>
                    ` : `
                      <div class="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold text-center">
                        Room Full (All Beds Occupied)
                      </div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ==========================================
    // 5. SHARING-WISE PRICING VIEW (Module 3)
    // ==========================================
    renderPricingView() {
      const hostels = this.db.getHostels();
      const targetHostelId = this.selectedHostelFilter !== 'all' ? this.selectedHostelFilter : (hostels[0] ? hostels[0].id : null);
      const activeHostel = this.db.getHostelById(targetHostelId);
      const currentPricing = targetHostelId ? this.db.getPricing(targetHostelId) : {};

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Sharing-Wise Rent Pricing</h1>
              <p class="text-sm text-slate-500 mt-0.5">Configure monthly rent per person according to room sharing types</p>
            </div>
            ${activeHostel ? `
              <span class="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200">
                Active Property: ${activeHostel.name}
              </span>
            ` : ''}
          </div>

          <!-- Critical Constraint Notice -->
          <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <i data-lucide="info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
            <div class="text-xs text-blue-900 space-y-1">
              <p class="font-bold">CRITICAL SYSTEM RULE: Student Agreed Rent Protection</p>
              <p class="text-blue-800 leading-relaxed">
                When you update room prices here, existing students' agreed monthly rent is <b>NEVER</b> automatically changed.
                Their agreed rate remains permanently locked in their profile. New prices will only apply to future room creations and newly admitted students.
              </p>
            </div>
          </div>

          <!-- Pricing Configuration Form -->
          ${targetHostelId ? `
            <form id="pricing-form" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <input type="hidden" name="hostel_id" value="${targetHostelId}">
              <div class="border-b border-slate-100 pb-4">
                <h2 class="text-base font-bold text-slate-900">Monthly Rent Per Person for ${activeHostel.name}</h2>
                <p class="text-xs text-slate-500">Enter custom prices in Indian Rupees (₹) per sharing tier</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                ${[1, 2, 3, 4, 5].map(type => {
                  const cfg = window.SHARING_CONFIG ? window.SHARING_CONFIG[type] : { name: `${type} Sharing`, defaultRent: 6000 };
                  const currentVal = currentPricing[type] || cfg.defaultRent;
                  return `
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-sm text-slate-900">${cfg.name}</span>
                        <span class="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full">${type} Bed${type > 1 ? 's' : ''}</span>
                      </div>
                      <div class="text-[11px] text-slate-400">Default: ${this.formatCurrency(cfg.defaultRent)}</div>
                      <div>
                        <label class="block text-[11px] font-semibold text-slate-600 mb-1">Monthly Rent (₹)</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-semibold text-xs">₹</span>
                          <input type="number" name="pricing_${type}" value="${currentVal}" min="1000" step="100" required class="w-full pl-6 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition">
                  <i data-lucide="save" class="w-4 h-4"></i>
                  <span>Save Pricing Configuration</span>
                </button>
              </div>
            </form>
          ` : `
            <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              Please select a hostel from the top dropdown to configure its sharing prices.
            </div>
          `}
        </div>
      `;
    }

    // ==========================================
    // 6. STUDENT MANAGEMENT VIEW (Module 4)
    // ==========================================
    renderStudentsView() {
      const students = this.db.getStudents({
        hostel_id: this.selectedHostelFilter,
        search: this.searchQuery
      });

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
              <p class="text-sm text-slate-500 mt-0.5">Manage student admissions, bed assignments, agreed rents, and vacating</p>
            </div>
            <button id="add-student-btn" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              <span>Register New Student</span>
            </button>
          </div>

          <!-- Search & Filter Toolbar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="relative w-full sm:w-72">
              <input id="student-search-input" type="text" placeholder="Search student name, phone, code..." value="${this.searchQuery}" class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
              </div>
            </div>

            <div class="text-slate-500 font-semibold">
              Total: <span class="text-slate-900 font-bold">${students.length}</span> students listed
            </div>
          </div>

          <!-- Students Table -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3">Student Info</th>
                    <th class="px-4 py-3">Hostel & Room</th>
                    <th class="px-4 py-3">Agreed Rent</th>
                    <th class="px-4 py-3">Next Due Date</th>
                    <th class="px-4 py-3">Emergency Contact</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                  ${students.length > 0 ? students.map(student => {
                    const hostel = this.db.getHostelById(student.hostel_id);
                    const room = this.db.state.rooms.find(r => r.id === student.room_id);
                    const bed = this.db.state.beds.find(b => b.id === student.bed_id);

                    const isVacated = student.student_status === 'Vacated';
                    const isToday = student.next_payment_due_date === todayStr;
                    const isTomorrow = student.next_payment_due_date === tomorrowStr;
                    const isOverdue = student.next_payment_due_date < todayStr;

                    let badgeClass = 'badge-paid';
                    let statusLabel = 'Paid';
                    if (isVacated) {
                      badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                      statusLabel = 'Vacated';
                    } else if (isOverdue) {
                      badgeClass = 'badge-overdue';
                      statusLabel = 'Overdue';
                    } else if (isToday) {
                      badgeClass = 'badge-due-today';
                      statusLabel = 'Due Today';
                    } else if (isTomorrow) {
                      badgeClass = 'badge-due-tomorrow';
                      statusLabel = 'Due Tomorrow';
                    }

                    return `
                      <tr class="hover:bg-slate-50 transition">
                        <td class="px-4 py-3 font-semibold text-slate-900">
                          <div class="flex items-center gap-2">
                            <span>${student.full_name}</span>
                            <span class="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono">${student.student_id_code}</span>
                          </div>
                          <div class="text-[11px] text-slate-400 font-normal mt-0.5">${student.mobile_number} • ${student.email || 'No email'}</div>
                        </td>
                        <td class="px-4 py-3">
                          <div class="font-semibold text-slate-800">${hostel ? hostel.name : '-'}</div>
                          <div class="text-[11px] text-slate-500 font-normal">
                            Room ${room ? room.room_number : '-'} • Bed ${bed ? bed.bed_number : '-'} (${room ? room.sharing_type : '-'} Sharing)
                          </div>
                        </td>
                        <td class="px-4 py-3 font-bold text-blue-700">${this.formatCurrency(student.agreed_monthly_rent)}/mo</td>
                        <td class="px-4 py-3">
                          <div class="font-semibold text-slate-800">${student.next_payment_due_date || '-'}</div>
                          <div class="text-[10px] text-slate-400">Joined: ${student.joining_date}</div>
                        </td>
                        <td class="px-4 py-3">
                          <div class="text-slate-800">${student.emergency_contact || '-'}</div>
                          <div class="text-[10px] text-slate-400">${student.emergency_phone || ''}</div>
                        </td>
                        <td class="px-4 py-3">
                          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}">${statusLabel}</span>
                        </td>
                        <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          ${!isVacated ? `
                            <button data-action="quick-pay" data-student-id="${student.id}" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Record Payment">
                              <i data-lucide="credit-card" class="w-4 h-4"></i>
                            </button>
                            <button data-action="whatsapp-reminder" data-student-id="${student.id}" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Send WhatsApp Reminder">
                              <i data-lucide="message-circle" class="w-4 h-4"></i>
                            </button>
                            <button data-action="edit-student" data-student-id="${student.id}" class="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition" title="Edit Student">
                              <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                            <button data-action="vacate-student" data-student-id="${student.id}" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Vacate Student (Release Bed)">
                              <i data-lucide="user-minus" class="w-4 h-4"></i>
                            </button>
                          ` : `
                            <button data-action="delete-student" data-student-id="${student.id}" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Delete Record">
                              <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="7" class="px-4 py-8 text-center text-slate-400 italic">No students found matching your criteria.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================
    // 7. PAYMENTS VIEW (Module 6)
    // ==========================================
    renderPaymentsView() {
      const payments = this.db.getPayments({
        hostel_id: this.selectedHostelFilter
      });
      const finMetrics = this.db.getFinancialMetrics(this.selectedHostelFilter);

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Payments & Receipts</h1>
              <p class="text-sm text-slate-500 mt-0.5">Record rent collections, generate official receipts, and export payment records</p>
            </div>
            <div class="flex items-center gap-2">
              <button id="record-payment-btn" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition">
                <i data-lucide="credit-card" class="w-4 h-4"></i>
                <span>Record Rent Payment</span>
              </button>
              <button id="export-payments-csv-btn" class="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition">
                <i data-lucide="download" class="w-4 h-4 text-slate-500"></i>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <!-- Financial Snapshot Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-xl border border-slate-200">
              <span class="text-xs text-slate-400 uppercase font-semibold">Total Collected</span>
              <div class="text-xl font-bold text-emerald-600 mt-1">${this.formatCurrency(finMetrics.totalRentCollected)}</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200">
              <span class="text-xs text-slate-400 uppercase font-semibold">Pending Revenue</span>
              <div class="text-xl font-bold text-amber-600 mt-1">${this.formatCurrency(finMetrics.pendingRevenue)}</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200">
              <span class="text-xs text-slate-400 uppercase font-semibold">Paid Residents</span>
              <div class="text-xl font-bold text-slate-900 mt-1">${finMetrics.paidCount} Students</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200">
              <span class="text-xs text-slate-400 uppercase font-semibold">Overdue Residents</span>
              <div class="text-xl font-bold text-rose-600 mt-1">${finMetrics.overdueCount} Students</div>
            </div>
          </div>

          <!-- Payments Table -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3">Receipt #</th>
                    <th class="px-4 py-3">Resident Student</th>
                    <th class="px-4 py-3">Amount Paid</th>
                    <th class="px-4 py-3">Payment Date</th>
                    <th class="px-4 py-3">Mode & Ref</th>
                    <th class="px-4 py-3">Billing Cycle</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                  ${payments.length > 0 ? payments.map(pay => {
                    const student = this.db.state.students.find(s => s.id === pay.student_id);
                    const hostel = this.db.getHostelById(pay.hostel_id);

                    return `
                      <tr class="hover:bg-slate-50 transition">
                        <td class="px-4 py-3 font-mono font-bold text-blue-600">${pay.receipt_number || 'RCP-2026-000'}</td>
                        <td class="px-4 py-3">
                          <div class="font-bold text-slate-900">${student ? student.full_name : 'Student'}</div>
                          <div class="text-[11px] text-slate-400">${hostel ? hostel.name : ''}</div>
                        </td>
                        <td class="px-4 py-3 font-bold text-emerald-600">${this.formatCurrency(pay.amount_paid)}</td>
                        <td class="px-4 py-3">${pay.payment_date}</td>
                        <td class="px-4 py-3">
                          <div class="font-semibold text-slate-800">${pay.payment_method || 'UPI'}</div>
                          <div class="text-[10px] text-slate-400 font-mono">${pay.transaction_ref || 'N/A'}</div>
                        </td>
                        <td class="px-4 py-3">${pay.billing_cycle_month || 'Current'}</td>
                        <td class="px-4 py-3">
                          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${pay.pending_balance === 0 ? 'badge-paid' : 'badge-due-today'}">
                            ${pay.payment_status || 'Paid'}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                          <button data-action="view-receipt" data-payment-id="${pay.id}" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg inline-flex items-center gap-1 transition">
                            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                            <span>Print Receipt</span>
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="8" class="px-4 py-8 text-center text-slate-400 italic">No payments recorded yet. Click "Record Rent Payment" to add one.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================
    // 8. RENT REMINDERS VIEW (Module 5)
    // ==========================================
    renderRemindersView() {
      const logs = this.db.state.notification_logs || [];
      const config = this.db.state.messaging_config || { provider: 'whatsapp_cloud_api', test_mode: true };

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Automated Rent Expiry Reminders</h1>
              <p class="text-sm text-slate-500 mt-0.5">Automated 1-day before & expiry date reminders in Asia/Kolkata timezone</p>
            </div>
            <button id="run-daily-reminders-btn" class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="bell-ring" class="w-4 h-4"></i>
              <span>Run Daily Reminders Now (IST)</span>
            </button>
          </div>

          <!-- Scheduler Specs Card -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-2xl border border-slate-200">
              <div class="flex items-center gap-2 text-slate-700 font-bold text-sm mb-1">
                <i data-lucide="clock" class="w-4 h-4 text-blue-600"></i>
                <span>Automated Scheduler</span>
              </div>
              <p class="text-xs text-slate-500">Executes daily at 09:00 AM IST (<b class="text-slate-800">Asia/Kolkata</b>)</p>
              <div class="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Background Worker Running</span>
              </div>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200">
              <div class="flex items-center gap-2 text-slate-700 font-bold text-sm mb-1">
                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
                <span>Duplicate Prevention</span>
              </div>
              <p class="text-xs text-slate-500">Logs each reminder per student, due date & type to ensure no repeated messages.</p>
              <div class="mt-2 text-[11px] text-slate-700 font-semibold">
                Auto-Stop on Payment: <b class="text-emerald-700">Enabled</b>
              </div>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200">
              <div class="flex items-center gap-2 text-slate-700 font-bold text-sm mb-1">
                <i data-lucide="send" class="w-4 h-4 text-amber-600"></i>
                <span>Delivery Mode</span>
              </div>
              <p class="text-xs text-slate-500">Provider: WhatsApp Business & Twilio SMS Gateway</p>
              <div class="mt-2 text-[11px] font-semibold text-amber-800">
                Mode: ${config.test_mode ? '🧪 Test / Simulation Mode' : '🚀 Live Delivery'}
              </div>
            </div>
          </div>

          <!-- Official Message Templates Display -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-900 uppercase">Template 1: One Day Before Due Date</span>
                <span class="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-800 font-semibold rounded-full">24h Prior</span>
              </div>
              <pre class="bg-white p-3 rounded-xl border border-amber-200/80 text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
Hello [Student Name],

Your hostel rent payment is due tomorrow ([Due Date]).

Your monthly hostel rent is ₹[Agreed Amount].

Kindly complete your payment tomorrow to avoid any inconvenience.

Thank you.
[Hostel Name]</pre>
            </div>

            <div class="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-orange-900 uppercase">Template 2: On Expiry / Due Date</span>
                <span class="text-[10px] px-2 py-0.5 bg-orange-200 text-orange-800 font-semibold rounded-full">Due Day</span>
              </div>
              <pre class="bg-white p-3 rounded-xl border border-orange-200/80 text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
Hello [Student Name],

Today is your hostel rent payment due date.

Your payment of ₹[Agreed Amount] is due today.

Kindly make your payment today.

Thank you.
[Hostel Name]</pre>
            </div>
          </div>

          <!-- Notification History Logs -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 class="text-sm font-bold text-slate-900">Notification History Logs (${logs.length})</h3>
              <span class="text-xs text-slate-500 font-medium">Logged securely with timestamp and channel</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3">Student & Mobile</th>
                    <th class="px-4 py-3">Reminder Type</th>
                    <th class="px-4 py-3">Due Date</th>
                    <th class="px-4 py-3">Channel</th>
                    <th class="px-4 py-3">Timestamp (IST)</th>
                    <th class="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                  ${logs.length > 0 ? logs.slice().reverse().map(log => {
                    const student = this.db.state.students.find(s => s.id === log.student_id);
                    return `
                      <tr class="hover:bg-slate-50">
                        <td class="px-4 py-3">
                          <div class="font-bold text-slate-900">${student ? student.full_name : 'Student'}</div>
                          <div class="text-[11px] text-slate-400">${log.recipient_mobile}</div>
                        </td>
                        <td class="px-4 py-3">
                          <span class="px-2 py-0.5 rounded font-mono text-[10px] ${log.reminder_type === 'due_date' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'}">
                            ${log.reminder_type}
                          </span>
                        </td>
                        <td class="px-4 py-3 font-semibold">${log.due_date}</td>
                        <td class="px-4 py-3">${log.channel || 'WhatsApp'}</td>
                        <td class="px-4 py-3 text-slate-500">${new Date(log.sent_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                        <td class="px-4 py-3">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ${log.status || 'Sent'}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="6" class="px-4 py-8 text-center text-slate-400 italic">No reminder logs recorded yet. Click "Run Daily Reminders Now" to trigger notifications.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================
    // 9. STUDENT PORTAL VIEW (Module 8)
    // ==========================================
    renderStudentPortalView() {
      const user = this.db.currentUser;
      const student = this.db.state.students.find(s => s.user_id === user.id || s.email.toLowerCase() === user.email.toLowerCase()) || this.db.state.students[0];
      if (!student) {
        return `
          <div class="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <h2 class="text-lg font-bold text-slate-900">Student Profile Not Linked</h2>
            <p class="text-xs text-slate-500 mt-1">Please contact your hostel owner to link your registered student profile.</p>
          </div>
        `;
      }

      const hostel = this.db.getHostelById(student.hostel_id);
      const room = this.db.state.rooms.find(r => r.id === student.room_id);
      const bed = this.db.state.beds.find(b => b.id === student.bed_id);
      const payments = this.db.state.payments.filter(p => p.student_id === student.id).sort((a,b) => new Date(b.payment_date) - new Date(a.payment_date));

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const isOverdue = student.next_payment_due_date < todayStr;
      const isToday = student.next_payment_due_date === todayStr;

      let statusBadge = 'badge-paid';
      let statusText = 'Paid / Up to Date';
      if (isOverdue) {
        statusBadge = 'badge-overdue';
        statusText = 'Payment Overdue';
      } else if (isToday) {
        statusBadge = 'badge-due-today';
        statusText = 'Payment Due Today';
      }

      return `
        <div class="space-y-6">
          <!-- Student Banner -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="px-2.5 py-1 bg-white/20 text-white rounded-full text-xs font-semibold uppercase tracking-wider">Student ID: ${student.student_id_code}</span>
                <h1 class="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">${student.full_name}</h1>
                <p class="text-blue-100 text-xs sm:text-sm mt-1">${student.mobile_number} • ${student.email}</p>
              </div>
              <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 self-start sm:self-auto text-right">
                <span class="text-xs uppercase font-semibold text-blue-200">Agreed Monthly Rent</span>
                <div class="text-2xl sm:text-3xl font-black text-white mt-0.5">${this.formatCurrency(student.agreed_monthly_rent)}</div>
                <span class="text-[11px] text-blue-100">Fixed rate locked to your profile</span>
              </div>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Card 1: Assigned Hostel -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i data-lucide="building-2" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900">${hostel ? hostel.name : 'PG Hostel'}</h3>
                    <span class="text-[10px] text-blue-600 font-semibold">${hostel ? hostel.type : 'Boys'} PG</span>
                  </div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1 mb-4">
                  <p class="font-semibold text-slate-800">${hostel ? hostel.address : 'Hyderabad, Telangana'}</p>
                  <p>Area: <b class="text-slate-700">${hostel ? hostel.area : 'Hyderabad'}</b></p>
                  <p>PIN Code: <b class="text-slate-700">${hostel ? hostel.pincode : '500081'}</b></p>
                  <p>Contact: <b class="text-slate-700">${hostel ? hostel.contact_number : '+91 98480 12345'}</b></p>
                </div>
              </div>
              ${hostel && hostel.maps_url ? `
                <a href="${hostel.maps_url}" target="_blank" rel="noopener noreferrer" class="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                  <span>Open Location in Google Maps</span>
                </a>
              ` : ''}
            </div>

            <!-- Card 2: Assigned Room & Bed -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <i data-lucide="bed" class="w-4 h-4"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Room ${room ? room.room_number : '-'}</h3>
                  <span class="text-[10px] text-emerald-600 font-semibold">Bed #${bed ? bed.bed_number : '-'} Assigned</span>
                </div>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2">
                <div class="flex justify-between"><span class="text-slate-500">Floor:</span> <b class="text-slate-900">${room ? (room.floor_name || room.floor) : '-'}</b></div>
                <div class="flex justify-between"><span class="text-slate-500">Sharing:</span> <b class="text-slate-900">${student.sharing_type} Sharing</b></div>
                <div class="flex justify-between"><span class="text-slate-500">Air Conditioning:</span> <b class="text-slate-900">${room && room.ac ? 'AC Room' : 'Non-AC Room'}</b></div>
                <div class="flex justify-between"><span class="text-slate-500">Attached Washroom:</span> <b class="text-slate-900">${room && room.attached_washroom ? 'Yes' : 'No'}</b></div>
                <div class="flex justify-between"><span class="text-slate-500">Common Washroom:</span> <b class="text-slate-900">${room && room.common_washroom ? 'Yes' : 'No'}</b></div>
              </div>
            </div>

            <!-- Card 3: Due Date & Status -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <i data-lucide="calendar" class="w-4 h-4"></i>
                    </div>
                    <h3 class="font-bold text-slate-900">Rent Payment Status</h3>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadge}">${statusText}</span>
                </div>
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1 my-3">
                  <span class="text-[11px] uppercase font-semibold text-slate-400">Next Payment Due Date</span>
                  <div class="text-xl font-black text-slate-900">${student.next_payment_due_date || 'Due Soon'}</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-400 text-center">Contact your hostel manager to complete payments via UPI or Cash.</p>
            </div>
          </div>

          <!-- Payment History & Receipts -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 class="text-sm font-bold text-slate-900">My Payment History & Official Receipts</h3>
              <span class="text-xs text-slate-500 font-medium">${payments.length} Payments on Record</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-3">Receipt #</th>
                    <th class="px-4 py-3">Date Paid</th>
                    <th class="px-4 py-3">Billing Cycle</th>
                    <th class="px-4 py-3">Amount Paid</th>
                    <th class="px-4 py-3">Payment Method</th>
                    <th class="px-4 py-3">Transaction ID</th>
                    <th class="px-4 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                  ${payments.length > 0 ? payments.map(pay => `
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3 font-mono font-bold text-blue-600">${pay.receipt_number || 'RCP-2026-000'}</td>
                      <td class="px-4 py-3">${pay.payment_date}</td>
                      <td class="px-4 py-3 font-semibold">${pay.billing_cycle_month || 'Monthly'}</td>
                      <td class="px-4 py-3 font-bold text-emerald-600">${this.formatCurrency(pay.amount_paid)}</td>
                      <td class="px-4 py-3">${pay.payment_method || 'UPI'}</td>
                      <td class="px-4 py-3 font-mono text-slate-400">${pay.transaction_ref || '-'}</td>
                      <td class="px-4 py-3 text-right">
                        <button data-action="view-receipt" data-payment-id="${pay.id}" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg inline-flex items-center gap-1 transition">
                          <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="7" class="px-4 py-8 text-center text-slate-400 italic">No past payments found for your account.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================
    // AUTH VIEW & QUICK SWITCHER
    // ==========================================
    renderAuthView() {
      return `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            <!-- Brand -->
            <div class="text-center space-y-2">
              <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                <i data-lucide="building-2" class="w-7 h-7"></i>
              </div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">Narasimha PG Manager</h1>
              <p class="text-xs text-slate-500">Enterprise PG Hostel & Bed Management SaaS</p>
            </div>

            <!-- Role Switcher -->
            <div class="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
              <button id="auth-role-owner-btn" class="flex-1 py-2 text-center rounded-lg transition ${this.authRole === 'owner' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'}">
                Hostel Owner
              </button>
              <button id="auth-role-student-btn" class="flex-1 py-2 text-center rounded-lg transition ${this.authRole === 'student' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'}">
                Student Portal
              </button>
            </div>

            <!-- 1-Click Quick Demo Accounts -->
            <div class="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
              <div class="text-[11px] font-bold text-blue-900 uppercase">⚡ 1-Click Quick Demo Sign-In:</div>
              <div class="grid grid-cols-1 gap-1.5">
                <button id="quick-login-owner" class="w-full py-1.5 px-2.5 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition">
                  <span>🏢 Owner: Narasimha Rao</span>
                  <span class="text-[10px] text-blue-500 font-mono">owner1@hostel.com</span>
                </button>
                <button id="quick-login-student1" class="w-full py-1.5 px-2.5 bg-white hover:bg-emerald-100/60 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition">
                  <span>🎓 Student: Ravi Kumar</span>
                  <span class="text-[10px] text-emerald-600 font-mono">ravi@gmail.com</span>
                </button>
                <button id="quick-login-student2" class="w-full py-1.5 px-2.5 bg-white hover:bg-emerald-100/60 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition">
                  <span>🎓 Student: Suresh Varma</span>
                  <span class="text-[10px] text-emerald-600 font-mono">suresh@gmail.com</span>
                </button>
              </div>
            </div>

            <!-- Auth Form -->
            <form id="auth-form" class="space-y-4">
              <div id="auth-error" class="hidden p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium"></div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input id="auth-email" type="email" required placeholder="name@example.com" value="${this.authRole === 'owner' ? 'owner1@hostel.com' : 'ravi@gmail.com'}" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input id="auth-password" type="password" required placeholder="••••••••" value="${this.authRole === 'owner' ? 'password123' : 'student123'}" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition">
                Sign In to ${this.authRole === 'owner' ? 'Hostel Management' : 'Student Portal'}
              </button>
            </form>
          </div>
        </div>
      `;
    }

    renderFooter() {
      return `
        <footer class="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span class="font-bold text-slate-700">Narasimha PG Hostel Manager v3.0</span> • Professional SaaS Platform • Hyderabad, Telangana
            </div>
            <div class="flex items-center space-x-3">
              <span>Timezone: Asia/Kolkata (IST)</span>
              <span>•</span>
              <button id="footer-reset-btn" class="hover:text-rose-600 transition font-medium">Reset Sample Data</button>
            </div>
          </div>
        </footer>
      `;
    }

    // ==========================================
    // MODALS RENDERER
    // ==========================================
    renderModal() {
      const container = document.getElementById('modal-container');
      if (!container || !this.activeModal) return;

      switch (this.activeModal) {
        case 'add-hostel':
        case 'edit-hostel':
          container.innerHTML = this.renderHostelModal(this.modalPayload);
          this.bindHostelModalEvents();
          break;
        case 'add-room':
        case 'edit-room':
          container.innerHTML = this.renderRoomModal(this.modalPayload);
          this.bindRoomModalEvents();
          break;
        case 'add-student':
        case 'edit-student':
          container.innerHTML = this.renderStudentModal(this.modalPayload);
          this.bindStudentModalEvents();
          break;
        case 'record-payment':
          container.innerHTML = this.renderPaymentModal(this.modalPayload);
          this.bindPaymentModalEvents();
          break;
        case 'printable-receipt':
          container.innerHTML = this.renderReceiptModal(this.modalPayload);
          this.bindReceiptModalEvents();
          break;
        case 'whatsapp-reminder':
          container.innerHTML = this.renderWhatsAppModal(this.modalPayload);
          this.bindWhatsAppModalEvents();
          break;
        case 'custom-floor':
          container.innerHTML = this.renderCustomFloorModal(this.modalPayload);
          this.bindCustomFloorModalEvents();
          break;
        case 'db-settings':
          container.innerHTML = this.renderDbModal();
          this.bindDbModalEvents();
          break;
      }

      if (window.lucide) window.lucide.createIcons();
    }

    // Modal 1: Add / Edit Hostel
    renderHostelModal(hostel = null) {
      const isEdit = !!hostel;
      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">${isEdit ? 'Edit Hostel Details' : 'Add New Hostel Property'}</h3>
              <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="hostel-form" class="space-y-3.5 text-xs">
              <input type="hidden" name="hostel_id" value="${hostel ? hostel.id : ''}">

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Hostel Name</label>
                <input type="text" name="name" required value="${hostel ? hostel.name : ''}" placeholder="e.g. Sri Sai Boys Hostel" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Hostel Type</label>
                  <select name="type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="Boys" ${hostel && hostel.type === 'Boys' ? 'selected' : ''}>Boys PG</option>
                    <option value="Girls" ${hostel && hostel.type === 'Girls' ? 'selected' : ''}>Girls PG</option>
                    <option value="Co-living" ${hostel && hostel.type === 'Co-living' ? 'selected' : ''}>Co-living</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input type="tel" name="contact_number" required value="${hostel ? hostel.contact_number : '+91 98480 12345'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Complete Address</label>
                <input type="text" name="address" required value="${hostel ? hostel.address : ''}" placeholder="e.g. Beside Metro Pillar A1042, Ameerpet" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Area / Locality</label>
                  <input type="text" name="area" required value="${hostel ? hostel.area : 'Ameerpet'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">City</label>
                  <input type="text" name="city" required value="${hostel ? hostel.city : 'Hyderabad'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input type="text" name="pincode" required value="${hostel ? hostel.pincode : '500038'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Total Floors</label>
                  <input type="number" name="total_floors" min="1" max="15" value="${hostel ? (hostel.total_floors || 3) : 3}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">State</label>
                  <input type="text" name="state" readonly value="Telangana" class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500">
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Google Maps URL (Optional)</label>
                <input type="url" name="maps_url" value="${hostel ? (hostel.maps_url || '') : ''}" placeholder="https://maps.google.com/..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                <span class="text-[10px] text-slate-400">Leave blank to auto-generate from address.</span>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" id="cancel-modal-btn" class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20">Save Hostel</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    // Modal 2: Add / Edit Room
    renderRoomModal(room = null) {
      const isEdit = !!room;
      const hostels = this.db.getHostels();
      const targetHostelId = room ? room.hostel_id : (this.selectedHostelFilter !== 'all' ? this.selectedHostelFilter : (hostels[0] ? hostels[0].id : ''));
      const floors = this.db.getFloors(targetHostelId);
      const pricing = targetHostelId ? this.db.getPricing(targetHostelId) : {};

      const currentSharing = room ? room.sharing_type : 3;
      const currentRent = room ? room.monthly_rent : (pricing[currentSharing] || 6000);

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">${isEdit ? `Edit Room ${room.room_number}` : 'Add New Room'}</h3>
              <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="room-form" class="space-y-3.5 text-xs">
              <input type="hidden" name="room_id" value="${room ? room.id : ''}">

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Hostel</label>
                  <select name="hostel_id" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    ${hostels.map(h => `<option value="${h.id}" ${h.id === targetHostelId ? 'selected' : ''}>${h.name}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Room Number</label>
                  <input type="text" name="room_number" required value="${room ? room.room_number : ''}" placeholder="e.g. 205" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Floor Number</label>
                  <select name="floor_name" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    ${floors.map(fl => `<option value="${fl}" ${room && (room.floor_name === fl || room.floor === fl) ? 'selected' : ''}>${fl}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Room Sharing Type</label>
                  <select id="modal-room-sharing" name="sharing_type" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="1" ${currentSharing === 1 ? 'selected' : ''}>Single Sharing</option>
                    <option value="2" ${currentSharing === 2 ? 'selected' : ''}>2 Sharing</option>
                    <option value="3" ${currentSharing === 3 ? 'selected' : ''}>3 Sharing</option>
                    <option value="4" ${currentSharing === 4 ? 'selected' : ''}>4 Sharing</option>
                    <option value="5" ${currentSharing === 5 ? 'selected' : ''}>5 Sharing</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Monthly Rent per Person (₹)</label>
                  <input type="number" id="modal-room-rent" name="monthly_rent" required value="${currentRent}" min="1000" step="100" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">AC / Non-AC</label>
                  <select name="ac" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="false" ${room && !room.ac ? 'selected' : ''}>Non-AC</option>
                    <option value="true" ${room && room.ac ? 'selected' : ''}>AC</option>
                  </select>
                </div>
              </div>

              <!-- Washroom Options -->
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span class="font-bold text-slate-800">Washroom Facilities</span>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-slate-600 mb-1">Attached Washroom</label>
                    <select name="attached_washroom" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg">
                      <option value="true" ${!room || room.attached_washroom ? 'selected' : ''}>Yes</option>
                      <option value="false" ${room && !room.attached_washroom ? 'selected' : ''}>No</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-slate-600 mb-1">Common Washroom</label>
                    <select name="common_washroom" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg">
                      <option value="false" ${!room || !room.common_washroom ? 'selected' : ''}>No</option>
                      <option value="true" ${room && room.common_washroom ? 'selected' : ''}>Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Room Status</label>
                <select name="room_status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="Available" ${!room || room.room_status === 'Available' ? 'selected' : ''}>Available</option>
                  <option value="Maintenance" ${room && room.room_status === 'Maintenance' ? 'selected' : ''}>Under Maintenance</option>
                </select>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" id="cancel-modal-btn" class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    // Modal 3: Add / Edit Student (Module 4)
    renderStudentModal(payload = null) {
      const isEdit = payload && payload.student;
      const student = isEdit ? payload.student : null;
      const prefilledHostelId = payload && payload.hostelId ? payload.hostelId : (this.selectedHostelFilter !== 'all' ? this.selectedHostelFilter : '');
      const prefilledRoomId = payload && payload.roomId ? payload.roomId : '';

      const hostels = this.db.getHostels();
      const currentHostelId = student ? student.hostel_id : (prefilledHostelId || (hostels[0] ? hostels[0].id : ''));
      const availableRooms = this.db.getRooms(currentHostelId);

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">${isEdit ? `Edit Student: ${student.full_name}` : 'Register New Student (Check-in)'}</h3>
              <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="student-form" class="space-y-3.5 text-xs">
              <input type="hidden" name="student_id" value="${student ? student.id : ''}">

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                  <input type="text" name="full_name" required value="${student ? student.full_name : ''}" placeholder="e.g. Ramesh Kumar" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input type="tel" name="mobile_number" required value="${student ? student.mobile_number : '+91 '}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Email Address (For Student Portal Login)</label>
                <input type="email" name="email" value="${student ? student.email : ''}" placeholder="student@example.com" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Select Hostel</label>
                  <select id="modal-student-hostel" name="hostel_id" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    ${hostels.map(h => `<option value="${h.id}" ${h.id === currentHostelId ? 'selected' : ''}>${h.name}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Select Room</label>
                  <select id="modal-student-room" name="room_id" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    ${availableRooms.map(r => `<option value="${r.id}" ${student && student.room_id === r.id ? 'selected' : (r.id === prefilledRoomId ? 'selected' : '')}>Room ${r.room_number} (${r.sharing_type} Sharing)</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Select Bed Slot</label>
                  <select id="modal-student-bed" name="bed_id" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <!-- Populated dynamically via JS -->
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Agreed Monthly Rent (₹)</label>
                  <input type="number" id="modal-student-rent" name="agreed_monthly_rent" required value="${student ? student.agreed_monthly_rent : 6000}" min="1000" step="100" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <span class="text-[10px] text-slate-400">Locked permanently to student profile</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Admission / Joining Date</label>
                  <input type="date" name="joining_date" required value="${student ? student.joining_date : new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Next Payment Due Date</label>
                  <input type="date" name="next_payment_due_date" required value="${student ? student.next_payment_due_date : ''}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                  <input type="text" name="emergency_contact" value="${student ? (student.emergency_contact || '') : ''}" placeholder="e.g. Father Name" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <input type="tel" name="emergency_phone" value="${student ? (student.emergency_phone || '') : ''}" placeholder="+91 9..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" id="cancel-modal-btn" class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20">${isEdit ? 'Update Student' : 'Admit Student'}</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    // Modal 4: Record Payment (Module 6)
    renderPaymentModal(studentId = null) {
      const activeStudents = this.db.getStudents({ status: 'Active' });
      const selectedStudent = studentId ? this.db.state.students.find(s => s.id === studentId) : (activeStudents[0] || null);

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">Record Rent Payment</h3>
              <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="payment-form" class="space-y-3.5 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Resident Student</label>
                <select id="modal-pay-student" name="student_id" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                  ${activeStudents.map(s => `<option value="${s.id}" ${selectedStudent && selectedStudent.id === s.id ? 'selected' : ''}>${s.full_name} (${this.formatCurrency(s.agreed_monthly_rent)}/mo) — Due: ${s.next_payment_due_date}</option>`).join('')}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Amount Paid (₹)</label>
                  <input type="number" id="modal-pay-amount" name="amount_paid" required value="${selectedStudent ? selectedStudent.agreed_monthly_rent : 6000}" min="100" step="50" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input type="date" name="payment_date" required value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select name="payment_method" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / IMPS</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Transaction Ref / UTR</label>
                  <input type="text" name="transaction_ref" placeholder="e.g. UPI/2026/88912" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Payment Notes (Optional)</label>
                <input type="text" name="notes" placeholder="e.g. Rent for current billing cycle" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
              </div>

              <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 space-y-1">
                <div class="flex items-center gap-1 font-bold">
                  <i data-lucide="check" class="w-3.5 h-3.5"></i>
                  <span>Automatic Cycle Advancement:</span>
                </div>
                <p>Upon recording this payment, student's next due date will automatically advance by 1 month and rent reminders will automatically stop for this billing cycle.</p>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" id="cancel-modal-btn" class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-500/20">Generate Official Receipt</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    // Modal 5: Printable Receipt Modal
    renderReceiptModal(paymentId) {
      const payment = this.db.state.payments.find(p => p.id === paymentId);
      if (!payment) return '';
      const student = this.db.state.students.find(s => s.id === payment.student_id);
      const hostel = this.db.getHostelById(payment.hostel_id) || { name: 'Narasimha PG Hostel', address: 'Hyderabad, Telangana', contact_number: '+91 98480 12345' };
      const room = this.db.state.rooms.find(r => r.id === payment.room_id);

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Payment Receipt</span>
              <div class="flex items-center gap-2">
                <button id="print-receipt-btn" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition">
                  <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                  <span>Print Receipt</span>
                </button>
                <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                  <i data-lucide="x" class="w-5 h-5"></i>
                </button>
              </div>
            </div>

            <!-- Printable Receipt Area -->
            <div id="printable-receipt-modal" class="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-4 font-sans">
              <!-- Receipt Header -->
              <div class="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 class="text-lg font-black text-slate-900 tracking-tight">${hostel.name}</h2>
                  <p class="text-[11px] text-slate-500">${hostel.address || 'Hyderabad, Telangana'}</p>
                  <p class="text-[11px] text-slate-500">Contact: ${hostel.contact_number}</p>
                </div>
                <div class="text-right">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Receipt Number</span>
                  <div class="text-sm font-mono font-bold text-blue-700">${payment.receipt_number || 'RCP-2026-001'}</div>
                  <span class="text-[11px] text-slate-500">${payment.payment_date}</span>
                </div>
              </div>

              <!-- Student & Room Details -->
              <div class="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span class="text-[10px] uppercase font-semibold text-slate-400">Received From</span>
                  <div class="font-bold text-slate-900 text-sm mt-0.5">${student ? student.full_name : 'Resident'}</div>
                  <div class="text-slate-500 text-[11px]">${student ? student.student_id_code : ''} • ${student ? student.mobile_number : ''}</div>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-semibold text-slate-400">Accommodation</span>
                  <div class="font-bold text-slate-800 mt-0.5">Room ${room ? room.room_number : '-'} (${room ? room.sharing_type : '-'} Sharing)</div>
                  <div class="text-slate-500 text-[11px]">Floor: ${room ? (room.floor_name || room.floor) : '-'}</div>
                </div>
              </div>

              <!-- Payment Breakdown -->
              <div class="space-y-2">
                <div class="flex justify-between py-1 border-b border-slate-100">
                  <span class="text-slate-600">Monthly Hostel Rent</span>
                  <span class="font-semibold">${this.formatCurrency(payment.monthly_rent)}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-100 font-bold text-sm text-slate-900">
                  <span>Amount Paid</span>
                  <span class="text-emerald-600">${this.formatCurrency(payment.amount_paid)}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Remaining Pending Balance</span>
                  <span class="font-semibold text-slate-800">${this.formatCurrency(payment.pending_balance)}</span>
                </div>
                <div class="flex justify-between py-1 text-slate-600">
                  <span>Payment Mode & Reference</span>
                  <span class="font-mono text-[11px]">${payment.payment_method} (${payment.transaction_ref || 'N/A'})</span>
                </div>
              </div>

              <!-- Status Stamp & Next Due -->
              <div class="pt-2 flex justify-between items-center text-[11px]">
                <div>
                  <span class="text-slate-400">Next Due Date:</span>
                  <span class="font-bold text-slate-800 ml-1">${payment.next_due_date}</span>
                </div>
                <div class="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider rounded-md text-[10px] border border-emerald-300">
                  ✓ Verified Payment
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Modal 6: WhatsApp Reminder Modal
    renderWhatsAppModal(studentId) {
      const student = this.db.state.students.find(s => s.id === studentId);
      if (!student) return '';
      const hostel = this.db.getHostelById(student.hostel_id) || { name: 'Narasimha PG' };
      const amount = Number(student.agreed_monthly_rent).toLocaleString('en-IN');
      const dueDate = student.next_payment_due_date;

      const messageBody = `Hello ${student.full_name},\n\nYour monthly hostel rent payment of ₹${amount} for ${hostel.name} is scheduled for ${dueDate}.\n\nKindly complete your payment to avoid any inconvenience.\n\nThank you,\n${hostel.name}`;
      const phoneDigits = student.mobile_number.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(messageBody)}`;

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <i data-lucide="message-circle" class="w-5 h-5 text-emerald-600"></i>
                <h3 class="text-lg font-bold text-slate-900">Send Rent Reminder</h3>
              </div>
              <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="font-bold text-slate-900">${student.full_name} (${student.student_id_code})</div>
                <div class="text-slate-500">${student.mobile_number} • Due: ${student.next_payment_due_date}</div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Personalized Message Preview</label>
                <textarea id="whatsapp-message-body" rows="6" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500">${messageBody}</textarea>
              </div>

              <div class="flex flex-col gap-2 pt-2">
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" id="send-whatsapp-link-btn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition">
                  <i data-lucide="send" class="w-4 h-4"></i>
                  <span>Open WhatsApp Direct Chat</span>
                </a>
                <button type="button" id="log-manual-reminder-btn" data-student-id="${student.id}" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition">
                  Log as Sent & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Modal 7: Add Custom Floor Modal
    renderCustomFloorModal() {
      const hostels = this.db.getHostels();
      const targetHostelId = this.selectedHostelFilter !== 'all' ? this.selectedHostelFilter : (hostels[0] ? hostels[0].id : '');

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">Add Custom Floor</h3>
              <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <form id="custom-floor-form" class="space-y-3.5 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Target Hostel</label>
                <select name="hostel_id" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  ${hostels.map(h => `<option value="${h.id}" ${h.id === targetHostelId ? 'selected' : ''}>${h.name}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Custom Floor Name</label>
                <input type="text" name="floor_name" required placeholder="e.g. Penthouse, Terrace Floor, Lower Ground" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500">
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button type="button" id="cancel-modal-btn" class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">Add Floor</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    // Modal 8: Acceptance Test & Database Settings
    renderDbModal() {
      const stats = {
        hostels: this.db.state.hostels.length,
        rooms: this.db.state.rooms.length,
        beds: this.db.state.beds.length,
        students: this.db.state.students.length,
        payments: this.db.state.payments.length,
        logs: this.db.state.notification_logs.length
      };

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-900">System Database & Acceptance State</h3>
              <button id="close-modal-btn" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <div class="space-y-4 text-xs">
              <div class="grid grid-cols-3 gap-2">
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span class="text-slate-400 text-[10px] uppercase font-bold">Hostels</span>
                  <div class="text-lg font-bold text-slate-900">${stats.hostels}</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span class="text-slate-400 text-[10px] uppercase font-bold">Rooms</span>
                  <div class="text-lg font-bold text-slate-900">${stats.rooms}</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span class="text-slate-400 text-[10px] uppercase font-bold">Beds</span>
                  <div class="text-lg font-bold text-slate-900">${stats.beds}</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span class="text-slate-400 text-[10px] uppercase font-bold">Students</span>
                  <div class="text-lg font-bold text-slate-900">${stats.students}</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span class="text-slate-400 text-[10px] uppercase font-bold">Payments</span>
                  <div class="text-lg font-bold text-slate-900">${stats.payments}</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span class="text-slate-400 text-[10px] uppercase font-bold">Reminders</span>
                  <div class="text-lg font-bold text-slate-900">${stats.logs}</div>
                </div>
              </div>

              <div class="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                <span class="font-bold text-blue-900">Database Engine:</span>
                <p class="text-blue-800 leading-relaxed">
                  Persistent Browser LocalStorage Layer with Instant State Sync, Cross-Tab Refresh Survival, and Headless REST Backend Compatibility (<code class="bg-blue-100 px-1 py-0.5 rounded">server.js</code>).
                </p>
              </div>

              <div class="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <button id="download-db-json-btn" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition">
                  <i data-lucide="download" class="w-4 h-4"></i>
                  <span>Download Full JSON Database</span>
                </button>
                <button id="modal-reset-db-btn" class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold transition">
                  Reset Database to Default Seed Data
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================
    // EVENT BINDINGS
    // ==========================================
    bindAuthEvents() {
      const ownerBtn = document.getElementById('auth-role-owner-btn');
      const studentBtn = document.getElementById('auth-role-student-btn');
      if (ownerBtn && studentBtn) {
        ownerBtn.addEventListener('click', () => {
          this.authRole = 'owner';
          this.render();
        });
        studentBtn.addEventListener('click', () => {
          this.authRole = 'student';
          this.render();
        });
      }

      const qOwner = document.getElementById('quick-login-owner');
      if (qOwner) {
        qOwner.addEventListener('click', async () => {
          try {
            await this.db.signIn('owner1@hostel.com', 'password123', 'owner');
            this.currentView = 'dashboard';
            this.render();
            this.showToast('Signed in as Owner: Narasimha Rao');
          } catch (e) {
            this.showToast(e.message, 'error');
          }
        });
      }

      const qStudent1 = document.getElementById('quick-login-student1');
      if (qStudent1) {
        qStudent1.addEventListener('click', async () => {
          try {
            await this.db.signIn('ravi@gmail.com', 'student123', 'student');
            this.currentView = 'student-portal';
            this.render();
            this.showToast('Signed in to Student Portal: Ravi Kumar');
          } catch (e) {
            this.showToast(e.message, 'error');
          }
        });
      }

      const qStudent2 = document.getElementById('quick-login-student2');
      if (qStudent2) {
        qStudent2.addEventListener('click', async () => {
          try {
            await this.db.signIn('suresh@gmail.com', 'student123', 'student');
            this.currentView = 'student-portal';
            this.render();
            this.showToast('Signed in to Student Portal: Suresh Varma');
          } catch (e) {
            this.showToast(e.message, 'error');
          }
        });
      }

      const authForm = document.getElementById('auth-form');
      if (authForm) {
        authForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('auth-email').value;
          const password = document.getElementById('auth-password').value;
          const errDiv = document.getElementById('auth-error');

          try {
            await this.db.signIn(email, password, this.authRole);
            this.currentView = this.authRole === 'student' ? 'student-portal' : 'dashboard';
            this.render();
            this.showToast(`Signed in successfully as ${this.authRole}`);
          } catch (err) {
            if (errDiv) {
              errDiv.textContent = err.message;
              errDiv.classList.remove('hidden');
            }
          }
        });
      }
    }

    bindHeaderEvents() {
      // Global hostel filter
      const hostelSel = document.getElementById('global-hostel-selector');
      if (hostelSel) {
        hostelSel.addEventListener('change', (e) => {
          this.selectedHostelFilter = e.target.value;
          this.render();
        });
      }

      // Nav Tabs
      const tabs = ['dashboard', 'hostels', 'floors', 'rooms', 'pricing', 'students', 'payments', 'reminders'];
      tabs.forEach(tab => {
        const btn = document.getElementById(`nav-tab-${tab}`) || document.getElementById(`mobile-nav-${tab}`);
        if (btn) {
          btn.addEventListener('click', () => {
            this.currentView = tab;
            this.render();
          });
        }
        const mobBtn = document.getElementById(`mobile-nav-${tab}`);
        if (mobBtn) {
          mobBtn.addEventListener('click', () => {
            this.currentView = tab;
            this.render();
          });
        }
      });

      // Brand btn
      const brandBtn = document.getElementById('nav-brand-btn');
      if (brandBtn) {
        brandBtn.addEventListener('click', () => {
          this.currentView = this.db.currentUser.role === 'student' ? 'student-portal' : 'dashboard';
          this.render();
        });
      }

      // DB Modal btn
      const dbBtn = document.getElementById('open-db-modal-btn');
      if (dbBtn) {
        dbBtn.addEventListener('click', () => {
          this.openModal('db-settings');
        });
      }

      // Sign out
      const signoutBtn = document.getElementById('signout-btn');
      if (signoutBtn) {
        signoutBtn.addEventListener('click', () => {
          this.db.signOut();
          this.currentView = 'dashboard';
          this.render();
          this.showToast('Signed out successfully.');
        });
      }

      // Footer reset
      const footerReset = document.getElementById('footer-reset-btn');
      if (footerReset) {
        footerReset.addEventListener('click', () => {
          if (confirm('Reset database to default seed records? All changes will revert to initial state.')) {
            this.db.resetSampleData();
            this.render();
            this.showToast('Database reset to seed data.');
          }
        });
      }
    }

    bindViewEvents() {
      // Quick Actions on Dashboard
      const qAddRoom = document.getElementById('quick-add-room-btn') || document.getElementById('add-room-btn');
      if (qAddRoom) qAddRoom.addEventListener('click', () => this.openModal('add-room'));

      const qAddHostel = document.getElementById('quick-add-hostel-btn') || document.getElementById('add-hostel-btn');
      if (qAddHostel) qAddHostel.addEventListener('click', () => this.openModal('add-hostel'));

      const qAddStudent = document.getElementById('quick-add-student-btn') || document.getElementById('add-student-btn');
      if (qAddStudent) qAddStudent.addEventListener('click', () => this.openModal('add-student'));

      const qRecordPay = document.getElementById('quick-record-payment-btn') || document.getElementById('record-payment-btn');
      if (qRecordPay) qRecordPay.addEventListener('click', () => this.openModal('record-payment'));

      const qTriggerReminders = document.getElementById('run-daily-reminders-quick-btn') || document.getElementById('run-daily-reminders-btn');
      if (qTriggerReminders) {
        qTriggerReminders.addEventListener('click', () => {
          const res = this.db.runDailyReminders();
          this.render();
          this.showToast(`Evaluated reminders in Asia/Kolkata timezone. ${res.sent} reminder(s) generated.`);
        });
      }

      const addFloorBtn = document.getElementById('add-custom-floor-btn');
      if (addFloorBtn) addFloorBtn.addEventListener('click', () => this.openModal('custom-floor'));

      // View Pricing Shortcut
      const viewPricingShortcut = document.getElementById('view-pricing-shortcut');
      if (viewPricingShortcut) {
        viewPricingShortcut.addEventListener('click', () => {
          this.currentView = 'pricing';
          this.render();
        });
      }

      // Export Payments CSV
      const exportCsvBtn = document.getElementById('export-payments-csv-btn');
      if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
          const payments = this.db.getPayments({ hostel_id: this.selectedHostelFilter });
          let csv = 'Receipt,Student,Hostel,Amount Paid,Monthly Rent,Payment Date,Method,Transaction Ref,Status\n';
          payments.forEach(p => {
            const student = this.db.state.students.find(s => s.id === p.student_id);
            const hostel = this.db.getHostelById(p.hostel_id);
            csv += `"${p.receipt_number}","${student ? student.full_name : ''}","${hostel ? hostel.name : ''}",${p.amount_paid},${p.monthly_rent},"${p.payment_date}","${p.payment_method}","${p.transaction_ref || ''}","${p.payment_status}"\n`;
          });
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `PG_Payments_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          this.showToast('Payments CSV exported.');
        });
      }

      // Room search & filters
      const roomSearch = document.getElementById('room-search-input');
      if (roomSearch) {
        roomSearch.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.renderRoomsViewOnly();
        });
      }
      const roomFloorFilter = document.getElementById('room-floor-filter');
      if (roomFloorFilter) {
        roomFloorFilter.addEventListener('change', (e) => {
          this.selectedFloorFilter = e.target.value;
          this.renderRoomsViewOnly();
        });
      }
      const roomSharingFilter = document.getElementById('room-sharing-filter');
      if (roomSharingFilter) {
        roomSharingFilter.addEventListener('change', (e) => {
          this.selectedSharingFilter = e.target.value;
          this.renderRoomsViewOnly();
        });
      }

      // Student search
      const studentSearch = document.getElementById('student-search-input');
      if (studentSearch) {
        studentSearch.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.renderStudentsViewOnly();
        });
      }

      // Pricing Form Submit
      const pricingForm = document.getElementById('pricing-form');
      if (pricingForm) {
        pricingForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const hostelId = pricingForm.elements['hostel_id'].value;
          const updates = {};
          [1, 2, 3, 4, 5].forEach(type => {
            updates[type] = parseFloat(pricingForm.elements[`pricing_${type}`].value) || 6000;
          });
          this.db.updatePricing(hostelId, updates);
          this.showToast('Sharing pricing updated successfully. (Existing students\' agreed rents preserved)');
          this.render();
        });
      }

      // Delegated Action Clicks
      document.body.onclick = (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.getAttribute('data-action');

        if (action === 'edit-hostel') {
          const id = target.getAttribute('data-id');
          const hostel = this.db.getHostelById(id);
          this.openModal('edit-hostel', hostel);
        } else if (action === 'delete-hostel') {
          const id = target.getAttribute('data-id');
          const hostel = this.db.getHostelById(id);
          if (confirm(`Are you sure you want to delete hostel "${hostel.name}"? This cannot be undone.`)) {
            try {
              this.db.deleteHostel(id);
              this.showToast(`Deleted ${hostel.name}`);
              this.render();
            } catch (err) {
              this.showToast(err.message, 'error');
            }
          }
        } else if (action === 'edit-room') {
          const id = target.getAttribute('data-id');
          const room = this.db.state.rooms.find(r => r.id === id);
          this.openModal('edit-room', room);
        } else if (action === 'delete-room') {
          const id = target.getAttribute('data-id');
          if (confirm('Delete this room? Room must have no active resident students.')) {
            try {
              this.db.deleteRoom(id);
              this.showToast('Room deleted successfully.');
              this.render();
            } catch (err) {
              this.showToast(err.message, 'error');
            }
          }
        } else if (action === 'checkin-student-to-room') {
          const roomId = target.getAttribute('data-room-id');
          const hostelId = target.getAttribute('data-hostel-id');
          this.openModal('add-student', { hostelId, roomId });
        } else if (action === 'add-room-to-floor') {
          const floor = target.getAttribute('data-floor');
          this.openModal('add-room', { floor_name: floor });
        } else if (action === 'quick-pay') {
          const studentId = target.getAttribute('data-student-id');
          this.openModal('record-payment', studentId);
        } else if (action === 'whatsapp-reminder') {
          const studentId = target.getAttribute('data-student-id');
          this.openModal('whatsapp-reminder', studentId);
        } else if (action === 'edit-student') {
          const studentId = target.getAttribute('data-student-id');
          const student = this.db.state.students.find(s => s.id === studentId);
          this.openModal('edit-student', { student });
        } else if (action === 'vacate-student') {
          const studentId = target.getAttribute('data-student-id');
          const student = this.db.state.students.find(s => s.id === studentId);
          if (confirm(`Vacate student "${student.full_name}"? Their bed slot will be immediately marked Available.`)) {
            this.db.vacateStudent(studentId);
            this.showToast(`Student ${student.full_name} vacated. Bed released.`);
            this.render();
          }
        } else if (action === 'delete-student') {
          const studentId = target.getAttribute('data-student-id');
          if (confirm('Permanently remove this student record?')) {
            this.db.deleteStudent(studentId);
            this.showToast('Student record removed.');
            this.render();
          }
        } else if (action === 'view-receipt') {
          const payId = target.getAttribute('data-payment-id');
          this.openModal('printable-receipt', payId);
        }
      };
    }

    renderRoomsViewOnly() {
      const main = document.querySelector('main');
      if (main && this.currentView === 'rooms') {
        main.innerHTML = this.renderRoomsView();
        this.bindViewEvents();
        if (window.lucide) window.lucide.createIcons();
      }
    }

    renderStudentsViewOnly() {
      const main = document.querySelector('main');
      if (main && this.currentView === 'students') {
        main.innerHTML = this.renderStudentsView();
        this.bindViewEvents();
        if (window.lucide) window.lucide.createIcons();
      }
    }

    // Modal Events Binding
    bindHostelModalEvents() {
      this.bindModalCloseBtns();
      const form = document.getElementById('hostel-form');
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = form.elements['hostel_id'].value;
        const data = {
          name: form.elements['name'].value,
          type: form.elements['type'].value,
          contact_number: form.elements['contact_number'].value,
          address: form.elements['address'].value,
          area: form.elements['area'].value,
          city: form.elements['city'].value,
          pincode: form.elements['pincode'].value,
          total_floors: form.elements['total_floors'].value,
          maps_url: form.elements['maps_url'].value
        };

        try {
          if (id) {
            this.db.updateHostel(id, data);
            this.showToast('Hostel updated successfully.');
          } else {
            this.db.createHostel(data);
            this.showToast('New hostel property added.');
          }
          this.closeModal();
          this.render();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    bindRoomModalEvents() {
      this.bindModalCloseBtns();
      const form = document.getElementById('room-form');
      if (!form) return;

      const sharingSel = document.getElementById('modal-room-sharing');
      const rentInput = document.getElementById('modal-room-rent');
      if (sharingSel && rentInput) {
        sharingSel.addEventListener('change', () => {
          const hostelId = form.elements['hostel_id'].value;
          const pricing = this.db.getPricing(hostelId);
          const type = parseInt(sharingSel.value, 10);
          if (pricing[type]) rentInput.value = pricing[type];
        });
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = form.elements['room_id'].value;
        const data = {
          hostel_id: form.elements['hostel_id'].value,
          room_number: form.elements['room_number'].value,
          floor_name: form.elements['floor_name'].value,
          sharing_type: parseInt(form.elements['sharing_type'].value, 10),
          monthly_rent: parseFloat(form.elements['monthly_rent'].value),
          ac: form.elements['ac'].value === 'true',
          attached_washroom: form.elements['attached_washroom'].value === 'true',
          common_washroom: form.elements['common_washroom'].value === 'true',
          room_status: form.elements['room_status'].value
        };

        try {
          if (id) {
            this.db.updateRoom(id, data);
            this.showToast(`Room ${data.room_number} updated.`);
          } else {
            this.db.createRoom(data);
            this.showToast(`Room ${data.room_number} created with bed slots.`);
          }
          this.closeModal();
          this.render();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    bindStudentModalEvents() {
      this.bindModalCloseBtns();
      const form = document.getElementById('student-form');
      if (!form) return;

      const hostelSel = document.getElementById('modal-student-hostel');
      const roomSel = document.getElementById('modal-student-room');
      const bedSel = document.getElementById('modal-student-bed');
      const rentInput = document.getElementById('modal-student-rent');

      const updateBedSlots = () => {
        const roomId = roomSel.value;
        if (!roomId) {
          bedSel.innerHTML = '<option value="">No room selected</option>';
          return;
        }
        const room = this.db.state.rooms.find(r => r.id === roomId);
        const beds = this.db.state.beds.filter(b => b.room_id === roomId);
        const studentId = form.elements['student_id'].value;

        bedSel.innerHTML = beds.map(b => {
          const occ = this.db.state.students.find(s => s.bed_id === b.id && s.student_status === 'Active' && s.id !== studentId);
          const isOcc = !!occ;
          return `<option value="${b.id}" ${isOcc ? 'disabled' : ''}>Bed ${b.bed_number} ${isOcc ? `(Occupied by ${occ.full_name})` : '(Available)'}</option>`;
        }).join('');

        if (room && rentInput && !form.elements['student_id'].value) {
          rentInput.value = room.monthly_rent;
        }
      };

      if (hostelSel) {
        hostelSel.addEventListener('change', () => {
          const rooms = this.db.getRooms(hostelSel.value);
          roomSel.innerHTML = rooms.map(r => `<option value="${r.id}">Room ${r.room_number} (${r.sharing_type} Sharing)</option>`).join('');
          updateBedSlots();
        });
      }

      if (roomSel) {
        roomSel.addEventListener('change', updateBedSlots);
      }

      updateBedSlots();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = form.elements['student_id'].value;
        const data = {
          hostel_id: form.elements['hostel_id'].value,
          room_id: form.elements['room_id'].value,
          bed_id: form.elements['bed_id'].value,
          full_name: form.elements['full_name'].value,
          mobile_number: form.elements['mobile_number'].value,
          email: form.elements['email'].value,
          agreed_monthly_rent: parseFloat(form.elements['agreed_monthly_rent'].value),
          joining_date: form.elements['joining_date'].value,
          next_payment_due_date: form.elements['next_payment_due_date'].value,
          emergency_contact: form.elements['emergency_contact'].value,
          emergency_phone: form.elements['emergency_phone'].value
        };

        try {
          if (id) {
            this.db.updateStudent(id, data);
            this.showToast('Student details updated.');
          } else {
            this.db.addStudent(data);
            this.showToast(`Student ${data.full_name} admitted and bed assigned.`);
          }
          this.closeModal();
          this.render();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    bindPaymentModalEvents() {
      this.bindModalCloseBtns();
      const form = document.getElementById('payment-form');
      if (!form) return;

      const studentSel = document.getElementById('modal-pay-student');
      const amountInput = document.getElementById('modal-pay-amount');

      if (studentSel && amountInput) {
        studentSel.addEventListener('change', () => {
          const s = this.db.state.students.find(st => st.id === studentSel.value);
          if (s) amountInput.value = s.agreed_monthly_rent;
        });
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          student_id: form.elements['student_id'].value,
          amount_paid: form.elements['amount_paid'].value,
          payment_date: form.elements['payment_date'].value,
          payment_method: form.elements['payment_method'].value,
          transaction_ref: form.elements['transaction_ref'].value,
          notes: form.elements['notes'].value
        };

        try {
          const pay = this.db.recordPayment(data);
          this.closeModal();
          this.render();
          this.openModal('printable-receipt', pay.id);
          this.showToast(`Payment of ₹${pay.amount_paid} recorded. Receipt generated!`);
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    bindReceiptModalEvents() {
      this.bindModalCloseBtns();
      const printBtn = document.getElementById('print-receipt-btn');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          window.print();
        });
      }
    }

    bindWhatsAppModalEvents() {
      this.bindModalCloseBtns();
      const logBtn = document.getElementById('log-manual-reminder-btn');
      if (logBtn) {
        logBtn.addEventListener('click', () => {
          const studentId = logBtn.getAttribute('data-student-id');
          this.db.sendManualReminder(studentId);
          this.closeModal();
          this.render();
          this.showToast('Reminder logged in notification history.');
        });
      }
    }

    bindCustomFloorModalEvents() {
      this.bindModalCloseBtns();
      const form = document.getElementById('custom-floor-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const hostelId = form.elements['hostel_id'].value;
        const floorName = form.elements['floor_name'].value;

        try {
          this.db.addCustomFloor(hostelId, floorName);
          this.showToast(`Custom floor "${floorName}" added.`);
          this.closeModal();
          this.render();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    bindDbModalEvents() {
      this.bindModalCloseBtns();
      const dlBtn = document.getElementById('download-db-json-btn');
      if (dlBtn) {
        dlBtn.addEventListener('click', () => {
          const str = JSON.stringify(this.db.state, null, 2);
          const blob = new Blob([str], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Narasimha_Hostel_DB_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          this.showToast('Database JSON exported.');
        });
      }

      const resetBtn = document.getElementById('modal-reset-db-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('Reset database to default seed state?')) {
            this.db.resetSampleData();
            this.closeModal();
            this.render();
            this.showToast('Database reset to seed data.');
          }
        });
      }
    }

    bindModalCloseBtns() {
      const closeBtn = document.getElementById('close-modal-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
      const cancelBtn = document.getElementById('cancel-modal-btn');
      if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
    }
  }

  // Export & Initialize
  window.AppController = AppController;

  document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
  });
})();
