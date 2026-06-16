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
        'relatorios/hub':                   'Relatórios',
        'relatorios/vendas':                'Relatórios &rsaquo; Vendas',
        'relatorios/vendas/diario':         'Relatórios &rsaquo; Faturamento Diário',
        'relatorios/vendas/categoria':      'Relatórios &rsaquo; Faturamento por Categoria',
        'relatorios/vendas/pagamento':      'Relatórios &rsaquo; Vendas por Pagamento',
        'relatorios/financas':              'Relatórios &rsaquo; Finanças',
        'relatorios/financas/movimentos':   'Relatórios &rsaquo; Entradas x Saídas',
        'relatorios/financas/evolucao':     'Relatórios &rsaquo; Evolução do Faturamento',
        'relatorios/margem':                'Relatórios &rsaquo; Margem de Lucro',
        'relatorios/margem/analise':        'Relatórios &rsaquo; Análise de Lucratividade',
        'relatorios/margem/evolucao':       'Relatórios &rsaquo; Evolução da Margem',
        'relatorios/margem/contribuicao':   'Relatórios &rsaquo; Margem de Contribuição x Receita',
        'relatorios/clientes':              'Relatórios &rsaquo; Clientes',
        'relatorios/receitas':              'Relatórios &rsaquo; Receitas',
        'relatorios/receitas/composicao':   'Relatórios &rsaquo; Composição da Receita',
        'relatorios/receitas/rentabilidade':'Relatórios &rsaquo; Rentabilidade Média',
        'relatorios/receitas/evolucao':     'Relatórios &rsaquo; Evolução da Receita',
        'relatorios/estoque':               'Relatórios &rsaquo; Insumos',
        'relatorios/estoque/situacao':      'Relatórios &rsaquo; Situação do Estoque',
        'relatorios/resumo':                'Relatórios &rsaquo; Resumo Geral',
        'relatorios/fornecedores':          'Relatórios &rsaquo; Fornecedores',
        'relatorios/producao':              'Relatórios &rsaquo; Produção',
        'relatorios/producao/mais':         'Relatórios &rsaquo; Mais Produzidos',
        'relatorios/producao/insumos':      'Relatórios &rsaquo; Insumos Consumidos',
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
            sub2:   parts[2] || '',
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
        const { module, sub, sub2, full } = parseHash();
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
                page = Pages.relatorios;
                param = sub2 ? sub + '/' + sub2 : (sub || 'hub');
                break;
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
