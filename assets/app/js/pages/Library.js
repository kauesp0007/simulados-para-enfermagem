/**
 * Biblioteca de Materiais
 * Armazenamento e organização de materiais de estudo
 */

var Library = (function() {
    'use strict';

    function Library(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.title = 'Biblioteca';
        this.materials = [];
    }

    Library.prototype.mount = async function(params) {
        await this.loadMaterials();
        this.render();
        this.bindEvents();
    };

    Library.prototype.loadMaterials = async function() {
        try {
            this.materials = await this.db.materials.toArray();
        } catch (error) {
            console.error('Erro ao carregar materiais:', error);
        }
    };

    Library.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        var self = this;
        
        mainContent.innerHTML = '<div class="page library">\
            <header class="page-header">\
                <h1>Biblioteca de Estudos</h1>\
                <p>Organize e acesse seus materiais de estudo</p>\
            </header>\
            <div class="library-toolbar">\
                <button class="btn btn-primary" onclick="libraryAddMaterial()">+ Adicionar Material</button>\
            </div>\
            <div class="library-content">\
                ' + (this.materials.length === 0 ? 
                    '<div class="empty-state">\
                        <h3>Sua biblioteca está vazia</h3>\
                        <p>Adicione seus primeiros materiais de estudo</p>\
                    </div>' :
                    '<div class="materials-grid">' +
                    this.materials.map(function(m) { return self.renderMaterialCard(m); }).join('') +
                    '</div>'
                ) + '\
            </div>\
        </div>';
    };

    Library.prototype.renderMaterialCard = function(material) {
        return '<div class="material-card">\
            <div class="material-header">\
                <span class="material-type">' + this.getTypeLabel(material.type) + '</span>\
            </div>\
            <h3 class="material-title">' + escapeHtml(material.title || '') + '</h3>\
            <p class="material-preview">' + escapeHtml((material.content || '').substring(0, 150)) + '</p>\
            <div class="material-footer">\
                <button class="btn btn-secondary btn-sm" onclick="libraryView(' + material.id + ')">Ver</button>\
                <button class="btn btn-danger btn-sm" onclick="libraryDelete(' + material.id + ')">Excluir</button>\
            </div>\
        </div>';
    };

    Library.prototype.getTypeLabel = function(type) {
        var labels = {'notes': 'Nota', 'links': 'Link', 'pdfs': 'PDF', 'images': 'Imagem'};
        return labels[type] || 'Material';
    };

    Library.prototype.bindEvents = function() {};

    Library.prototype.unmount = function() {};

    // Funções globais
    window.libraryAddMaterial = function() {
        var title = prompt('Título do material:');
        if (!title) return;
        
        var type = prompt('Tipo (notes, links, images, pdfs):', 'notes');
        var content = prompt('Conteúdo:');
        
        if (content) {
            db.materials.add({
                title: title,
                type: type || 'notes',
                content: content,
                createdAt: new Date(),
                updatedAt: new Date()
            }).then(function() {
                window.AppState.showToast('Material adicionado!', 'success');
                window.AppState.navigate('library');
            });
        }
    };

    window.libraryView = function(id) {
        db.materials.get(id).then(function(material) {
            if (material) {
                window.AppState.showModal({
                    title: escapeHtml(material.title),
                    content: '<div class="material-viewer"><p>' + escapeHtml(material.content).replace(/\n/g, '<br>') + '</p></div>',
                    actions: [{ label: 'Fechar', action: 'close', primary: true }]
                });
            }
        });
    };

    window.libraryDelete = function(id) {
        if (confirm('Tem certeza que deseja excluir este material?')) {
            db.materials.delete(id).then(function() {
                window.AppState.showToast('Material excluído!', 'success');
                window.AppState.navigate('library');
            });
        }
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return Library;
})();

// Library loaded
