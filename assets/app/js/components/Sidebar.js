/**
 * Sidebar Component
 * Componente de navegação lateral - Versão Simplificada e Funcional
 */

window.Sidebar = (function() {
    'use strict';

    var navItems = [
        { id: 'dashboard', title: 'Início', icon: 'home' },
        { id: 'my-contests', title: 'Meus Concursos', icon: 'calendar' },
        { id: 'my-questions', title: 'Minhas Questões', icon: 'book' },
        { id: 'pomodoro', title: 'Pomodoro', icon: 'clock' },
        { id: 'library', title: 'Biblioteca', icon: 'library' },
        { id: 'settings', title: 'Configurações', icon: 'settings' }
    ];

    var icons = {
        home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        calendar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        book: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        clock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        library: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 4v16"/><path d="M8 4v16"/><path d="M4 4v16"/></svg>',
        settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
    };

    var isMobileMenuOpen = false;

    function getUserInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(function(word) {
            return word.charAt(0).toUpperCase();
        }).slice(0, 2).join('');
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function openMobileMenu() {
        var sidebar = document.querySelector('.sidebar');
        var overlay = document.getElementById('mobile-overlay');
        var app = document.getElementById('app');
        
        if (sidebar) {
            sidebar.classList.add('open');
        }
        if (overlay) {
            overlay.classList.add('active');
        }
        if (app) {
            app.classList.add('sidebar-open');
        }
        isMobileMenuOpen = true;
    }

    function closeMobileMenu() {
        var sidebar = document.querySelector('.sidebar');
        var overlay = document.getElementById('mobile-overlay');
        var app = document.getElementById('app');
        
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
        if (app) {
            app.classList.remove('sidebar-open');
        }
        isMobileMenuOpen = false;
    }

    function toggleMobileMenu() {
        if (isMobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function render(container) {
        if (!container) {
            console.error('Sidebar: Container não encontrado');
            return;
        }

        var user = window.AuthService && window.AuthService.getCurrentUser ? window.AuthService.getCurrentUser() : null;
        var userName = user ? user.full_name : 'Usuário Teste';
        var userEmail = user ? user.email : 'teste@enfermagem.com';
        var initials = getUserInitials(userName);
        var streak = user && user.study_streak ? user.study_streak : 0;
        var totalQuizzes = user && user.total_quizzes ? user.total_quizzes : 0;

        var navHtml = navItems.map(function(item) {
            return '<li class="nav-item" data-page="' + item.id + '">' + 
                   icons[item.icon] + 
                   '<span>' + item.title + '</span></li>';
        }).join('');

        container.innerHTML = 
            '<div class="sidebar">' +
            '<div class="sidebar-header">' +
                '<div class="app-logo">' +
                    '<div class="logo-icon">' +
                        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none">' +
                            '<rect width="32" height="32" rx="8" fill="#0891b2"/>' +
                            '<path d="M16 8C12.32 8 9.333 10.987 9.333 14.667C9.333 16.973 10.4 18.36 12 20.333V24H20V20.333C21.6 18.36 22.667 16.973 22.667 14.667C22.667 10.987 19.68 8 16 8Z" fill="white"/>' +
                            '<path d="M13.333 12H18.667V14H13.333V12Z" fill="white"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="app-title">' +
                        '<h2>Enfermagem</h2>' +
                        '<span>Concurseira</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<nav class="sidebar-nav">' +
                '<ul class="nav-list" id="nav-menu">' + navHtml + '</ul>' +
            '</nav>' +
            '<div class="sidebar-footer">' +
                '<div class="user-info">' +
                    '<div class="user-avatar" id="user-avatar">' + escapeHtml(initials) + '</div>' +
                    '<div class="user-details">' +
                        '<span class="user-name" id="user-name">' + escapeHtml(userName) + '</span>' +
                        '<span class="user-email" id="user-email">' + escapeHtml(userEmail) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '</div>';

        bindEvents();
    }

    function bindEvents() {
        // Navigation items
        var items = document.querySelectorAll('.nav-item');
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                var page = item.dataset.page;
                if (page && window.App && window.App.navigate) {
                    window.App.navigate(page);
                }
                closeMobileMenu();
            });
        });

        // Mobile overlay click
        var overlay = document.getElementById('mobile-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }

        // Menu toggle button
        var menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMobileMenu);
        }

        // ESC key to close mobile menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                closeMobileMenu();
            }
        });
    }

    function updateUserInfo(user) {
        if (!user) return;

        var nameEl = document.getElementById('user-name');
        var emailEl = document.getElementById('user-email');
        var avatarEl = document.getElementById('user-avatar');

        if (nameEl) nameEl.textContent = user.full_name || 'Usuário';
        if (emailEl) emailEl.textContent = user.email || '';
        if (avatarEl) avatarEl.textContent = getUserInitials(user.full_name);
    }

    return {
        render: render,
        updateUserInfo: updateUserInfo,
        openMobileMenu: openMobileMenu,
        closeMobileMenu: closeMobileMenu,
        toggleMobileMenu: toggleMobileMenu
    };

})();

console.log('Sidebar.js carregado com sucesso');
