/* ============================================================
   router.js — SPA hash router
   URLs: index.html#/modulo/sub
   ============================================================ */

(function () {

    const BREADCRUMBS = {
        '':                      'Painel inicial',
        'cadastros/clientes':    'Cadastros &rsaquo; Clientes',
        'cadastros/fornecedores':'Cadastros &rsaquo; Fornecedores',
        'cadastros/insumos':     'Cadastros &rsaquo; Insumos',
        'cadastros/produtos':    'Cadastros &rsaquo; Produtos',
        'cadastros/receitas':    'Cadastros &rsaquo; Receitas',
        'cadastros/parceiros':   'Cadastros &rsaquo; Parceiros',
        'estoque/produtos':      'Estoque &rsaquo; Produtos',
        'estoque/insumos':       'Estoque &rsaquo; Insumos',
        'relatorios/hub':         'Relatórios',
        'relatorios/vendas':     'Relatórios &rsaquo; Vendas',
        'relatorios/financas':   'Relatórios &rsaquo; Finanças',
        'relatorios/margem':     'Relatórios &rsaquo; Margem de Lucro',
        'relatorios/clientes':   'Relatórios &rsaquo; Clientes',
        'relatorios/receitas':   'Relatórios &rsaquo; Receitas',
        'relatorios/estoque':    'Relatórios &rsaquo; Estoque',
        'relatorios/resumo':     'Relatórios &rsaquo; Resumo Geral',
        'relatorios/fornecedores':'Relatórios &rsaquo; Fornecedores',
        'relatorios/producao':   'Relatórios &rsaquo; Produção',
        'producao':              'Produção',
        'producao/nova':         'Produção &rsaquo; Nova produção',
        'saidas/clientes':       'Saídas &rsaquo; Clientes',
        'saidas/parceiros':      'Saídas &rsaquo; Parceiros',
    };

    /* ---------- helpers ---------- */
    function parseHash() {
        const raw = window.location.hash.replace(/^#\/?/, '');
        const parts = raw.split('/');
        return {
            module: parts[0] || '',
            sub:    parts[1] || '',
            full:   raw,
        };
    }

    function updateBreadcrumb(full) {
        const el = document.getElementById('breadcrumb');
        if (el) el.innerHTML = BREADCRUMBS[full] || full;
    }

    function updateSidebarActive(full) {
        /* remove all active styles */
        document.querySelectorAll('.menuLateral a').forEach(a => a.style.fontWeight = '');

        /* open the right details group */
        document.querySelectorAll('details[data-group]').forEach(d => {
            const grp = d.dataset.group;
            if (full.startsWith(grp)) {
                d.setAttribute('open', '');
            } else {
                d.removeAttribute('open');
            }
        });

        /* highlight matching link */
        document.querySelectorAll('.menuLateral a[href]').forEach(a => {
            const href = a.getAttribute('href').replace(/^#\/?/, '');
            if (href === full) a.style.fontWeight = '700';
        });
    }

    /* ---------- route ---------- */
    function navigate() {
        const { module, sub, full } = parseHash();
        const app = document.getElementById('app');
        if (!app) return;

        updateBreadcrumb(full);
        updateSidebarActive(full);

        /* scroll to top */
        app.scrollTop = 0;

        const Pages = window.Pages || {};

        let page, param;

        switch (module) {
            case '':
            case 'dashboard':
                page = Pages.dashboard; param = null; break;
            case 'cadastros':
                page = Pages.cadastros; param = sub || 'clientes'; break;
            case 'estoque':
                page = Pages.estoque;   param = sub || 'produtos'; break;
            case 'relatorios':
                page = Pages.relatorios; param = sub || 'hub'; break;
            case 'producao':
                page = Pages.producao;  param = sub || ''; break;
            case 'saidas':
                page = Pages.saidas;    param = sub || 'clientes'; break;
            default:
                app.innerHTML = `<h2 style="margin-top:40px;color:#aaa;">Página não encontrada: ${full}</h2>`;
                return;
        }

        if (!page) {
            app.innerHTML = `<p style="color:red;">Módulo "${module}" não carregado.</p>`;
            return;
        }

        app.innerHTML = page.render(param);
        if (typeof page.init === 'function') page.init(param);
    }

    window.addEventListener('hashchange', navigate);
    document.addEventListener('DOMContentLoaded', navigate);

    /* expose for programmatic navigation */
    window.Router = { navigate, go: (path) => { window.location.hash = '#/' + path; } };

})();
