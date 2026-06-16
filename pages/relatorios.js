/* pages/relatorios.js */
(function () {
    const { fmt } = CL;

    /* ---------- exportar CSV ---------- */
    function csvDownload(headers, rows, filename) {
        const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
        const lines = [headers.map(esc).join(',')].concat(rows.map(r => r.map(esc).join(',')));
        const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        a.click(); URL.revokeObjectURL(url);
    }

    /* ---------- botões export ---------- */
    function botoesExport(csvId) {
        return `<div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button id="${csvId}" style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:#0D5B2A;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
                &#128202; Exportar Excel (.xlsx)
            </button>
            <button onclick="window.print()" style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:white;color:#0D5B2A;border:1px solid #0D5B2A;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
                &#128196; Baixar PDF (.pdf)
            </button>
        </div>`;
    }

    /* ---------- filtro período ---------- */
    function filtrosPeriodo(id, extras) {
        extras = extras || '';
        return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:20px;">
            <label style="font-size:13px;font-weight:600;">Período:</label>
            <input type="date" style="padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
            <span style="font-size:13px;color:#555;">até</span>
            <input type="date" style="padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
            ${extras}
            <button onclick="CL.toast('Filtro aplicado')" class="btnVerde">Filtrar</button>
            <button class="btnVoltar">Limpar Filtros</button>
        </div>`;
    }

    /* ---------- nav principal ---------- */
    function mainNav(ativo) {
        var tabs = [
            ['hub',          'Início'],
            ['vendas',       'Vendas'],
            ['financas',     'Finanças'],
            ['margem',       'Margem de Lucro'],
            ['clientes',     'Clientes'],
            ['estoque',      'Estoque'],
            ['receitas',     'Receitas'],
            ['producao',     'Produção'],
            ['resumo',       'Resumo Geral'],
            ['fornecedores', 'Fornecedores'],
        ];
        return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:24px;">' +
            tabs.map(function(t) {
                var k = t[0], l = t[1];
                return '<a href="#/relatorios/' + k + '" style="padding:7px 14px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;' +
                    'background:' + (ativo === k ? '#0D5B2A' : 'white') + ';' +
                    'color:' + (ativo === k ? 'white' : '#555') + ';' +
                    'border:1px solid ' + (ativo === k ? '#0D5B2A' : '#ddd') + ';">' + l + '</a>';
            }).join('') + '</div>';
    }

    /* ---------- inner tabs ---------- */
    function innerTab(group, tabs, ativo) {
        return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;border-bottom:2px solid #f0f0f0;padding-bottom:12px;">' +
            tabs.map(function(t) {
                var k = t[0], l = t[1];
                return '<button data-tab="' + k + '" data-group="' + group + '" ' +
                    'style="padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;' +
                    'background:' + (ativo === k ? '#0D5B2A' : '#f5f5f5') + ';' +
                    'color:' + (ativo === k ? 'white' : '#666') + ';">' + l + '</button>';
            }).join('') + '</div>';
    }

    /* ---------- init inner tabs ---------- */
    function initTabs(group) {
        var cap = group.charAt(0).toUpperCase() + group.slice(1);
        document.querySelectorAll('[data-group="' + group + '"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tab = this.dataset.tab;
                document.querySelectorAll('[id^="tab' + cap + '_"]').forEach(function(el) { el.style.display = 'none'; });
                var el = document.getElementById('tab' + cap + '_' + tab);
                if (el) el.style.display = 'block';
                document.querySelectorAll('[data-group="' + group + '"]').forEach(function(b) {
                    b.style.background = '#f5f5f5'; b.style.color = '#666';
                });
                this.style.background = '#0D5B2A'; this.style.color = 'white';
            });
        });
    }

    /* =====================================================
       HUB
       ===================================================== */
    function renderHub() {
        var totalFat = DB.vendas.reduce(function(s, v) { return s + v.valor; }, 0);
        var custos = DB.producoes.reduce(function(s, p) {
            var r = DB.receitas.find(function(r) { return r.nome === p.receita; });
            return s + (r ? r.custo : 0);
        }, 0);
        var lucro = totalFat - custos;

        var cards = [
            { icon: '&#128200;', label: 'Vendas',         sub: 'Detalhamento e faturamento',   href: '#/relatorios/vendas'       },
            { icon: '&#128202;', label: 'Finanças',  sub: 'Entradas, saídas e saldo', href: '#/relatorios/financas'     },
            { icon: '&#128198;', label: 'Margem de Lucro', sub: 'Lucratividade por produto',   href: '#/relatorios/margem'       },
            { icon: '&#128101;', label: 'Clientes',        sub: 'Desempenho e ticket médio', href: '#/relatorios/clientes'  },
            { icon: '&#128230;', label: 'Estoque',         sub: 'Situação e valor',  href: '#/relatorios/estoque'      },
            { icon: '&#127807;', label: 'Receitas',        sub: 'Lucratividade dos insumos',   href: '#/relatorios/receitas'     },
            { icon: '&#127981;', label: 'Produção', sub: 'Produção por período', href: '#/relatorios/producao' },
            { icon: '&#127968;', label: 'Fornecedores',    sub: 'Desempenho dos fornecedores', href: '#/relatorios/fornecedores' },
            { icon: '&#128203;', label: 'Resumo Geral',    sub: 'Visão consolidada',      href: '#/relatorios/resumo'       },
        ];

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Análises detalhadas do negócio. Selecione uma categoria abaixo.</p>' +
            '<section class="cardsResumo" style="margin-bottom:28px;">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Faturamento total</span><strong class="cardNumero">' + fmt.moeda(totalFat) + '</strong><a href="#/relatorios/vendas">Ver vendas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Custos de produção</span><strong class="cardNumero">' + fmt.moeda(custos) + '</strong><a href="#/relatorios/producao">Ver produção</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Lucro estimado</span><strong class="cardNumero" style="color:' + (lucro >= 0 ? '#0D5B2A' : '#e53e3e') + '">' + fmt.moeda(lucro) + '</strong><a href="#/relatorios/margem">Ver margem</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Clientes ativos</span><strong class="cardNumero">' + DB.clientes.length + '</strong><a href="#/relatorios/clientes">Ver clientes</a></div>' +
            '</section>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;">' +
                cards.map(function(c) {
                    return '<a href="' + c.href + '" style="text-decoration:none;display:block;background:white;border:1px solid #e8e8e8;border-radius:12px;padding:20px;" ' +
                        'onmouseenter="this.style.boxShadow=\'0 4px 16px rgba(13,91,42,0.12)\'" onmouseleave="this.style.boxShadow=\'\'">' +
                        '<div style="font-size:28px;margin-bottom:10px;">' + c.icon + '</div>' +
                        '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">' + c.label + '</div>' +
                        '<div style="font-size:12px;color:#888;">' + c.sub + '</div>' +
                        '<div style="margin-top:14px;font-size:12px;color:#0D5B2A;font-weight:600;">Ver relatório →</div>' +
                    '</a>';
                }).join('') +
            '</div>';
    }

    /* =====================================================
       VENDAS
       ===================================================== */
    function renderVendas() {
        var total = DB.vendas.reduce(function(s, v) { return s + v.valor; }, 0);

        var porDia = {};
        DB.vendas.forEach(function(v) {
            if (!porDia[v.data]) porDia[v.data] = { fat: 0, pedidos: 0, clientes: {}, itens: 0 };
            porDia[v.data].fat += v.valor;
            porDia[v.data].pedidos++;
            porDia[v.data].clientes[v.cliente] = true;
            porDia[v.data].itens += v.qtd;
        });
        var rowsDiario = Object.keys(porDia).sort(function(a,b){return b.localeCompare(a);}).map(function(data) {
            var d = porDia[data];
            return '<tr><td>' + fmt.data(data) + '</td><td>' + fmt.moeda(d.fat) + '</td><td>' + d.pedidos + '</td><td>' +
                fmt.moeda(d.fat / d.pedidos) + '</td><td>' + Object.keys(d.clientes).length + '</td><td>' + d.itens + '</td><td>R$ 0,00</td></tr>';
        }).join('');

        var porCat = {};
        DB.vendas.forEach(function(v) {
            var prod = DB.produtos.find(function(p) { return p.nome === v.produto; });
            var cat = prod ? prod.categoria : 'Outros';
            if (!porCat[cat]) porCat[cat] = { fat: 0, pedidos: 0, itens: 0, clientes: {} };
            porCat[cat].fat += v.valor; porCat[cat].pedidos++;
            porCat[cat].itens += v.qtd; porCat[cat].clientes[v.cliente] = true;
        });
        var rowsCat = Object.keys(porCat).map(function(cat) {
            var d = porCat[cat];
            return '<tr><td>' + cat + '</td><td>' + fmt.moeda(d.fat) + '</td><td>' + d.pedidos + '</td><td>' +
                fmt.moeda(d.fat / d.pedidos) + '</td><td>' + (d.fat / total * 100).toFixed(1) + '%</td><td>' +
                d.itens + '</td><td>' + Object.keys(d.clientes).length + '</td></tr>';
        }).join('');

        var pagamentos = [
            { tipo: 'Pix',      fat: total * 0.45, pedidos: Math.round(DB.vendas.length * 0.45) },
            { tipo: 'Dinheiro', fat: total * 0.25, pedidos: Math.round(DB.vendas.length * 0.25) },
            { tipo: 'Débito',   fat: total * 0.18, pedidos: Math.round(DB.vendas.length * 0.18) },
            { tipo: 'Crédito',  fat: total * 0.12, pedidos: Math.round(DB.vendas.length * 0.12) },
        ];
        var rowsPag = pagamentos.map(function(p) {
            return '<tr><td>' + p.tipo + '</td><td>' + fmt.moeda(p.fat) + '</td><td>' + p.pedidos + '</td><td>' +
                fmt.moeda(p.fat / (p.pedidos || 1)) + '</td><td>' + (p.fat / total * 100).toFixed(1) + '%</td></tr>';
        }).join('');

        var rowsDetalhe = DB.vendas.map(function(v) {
            var prod = DB.produtos.find(function(p) { return p.nome === v.produto; });
            return '<tr><td>' + fmt.data(v.data) + '</td><td>' + (prod ? prod.categoria : '-') + '</td><td>' +
                v.produto + '</td><td>' + v.cliente + '</td><td>' + v.qtd + '</td><td>' +
                fmt.moeda(v.valor / v.qtd) + '</td><td>' + fmt.moeda(v.valor) + '</td>' +
                '<td><span class="badgeAtivo">Concluído</span></td></tr>';
        }).join('');

        var dados = [8200,7400,9100,10500,11200,12840];
        var meses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
        var max = Math.max.apply(null, dados);
        var barras = dados.map(function(v,i) {
            return '<div class="barraItem"><div class="barra" style="height:' + Math.round(v/max*160) + 'px;background:#0D5B2A;" title="' + fmt.moeda(v) + '"></div><span>' + meses[i] + '</span></div>';
        }).join('');

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Análises detalhadas de vendas.</p>' +
            mainNav('vendas') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Total de vendas</span><strong class="cardNumero">' + DB.vendas.length + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Faturamento</span><strong class="cardNumero">' + fmt.moeda(total) + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Ticket médio</span><strong class="cardNumero">' + fmt.moeda(total / DB.vendas.length) + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Clientes atendidos</span><strong class="cardNumero">' + (new Set(DB.vendas.map(function(v){return v.cliente;}))).size + '</strong><a href="#/relatorios/clientes">Ver clientes</a></div>' +
            '</section>' +
            innerTab('vendas', [['detalhamento','Detalhamento'],['diario','Faturamento Diário'],['categoria','Por Categoria'],['pagamento','Por Pagamento']], 'detalhamento') +

            '<div id="tabVendas_detalhamento">' +
                '<div class="linhaDashboard" style="margin-bottom:20px;">' +
                    '<div class="cardDashboard"><h2 class="tituloTabela" style="margin:0 0 16px 0;">Faturamento mensal (R$)</h2><div class="graficoBarras">' + barras + '</div></div>' +
                    '<div class="cardDashboard" style="background:#DDF7C9;"><h3 style="margin:0 0 14px 0;color:#0D4B24;font-size:14px;">Vendas por tipo</h3>' +
                        '<div class="linhaResumo"><span>Clientes diretos</span><strong>' + DB.vendas.filter(function(v){return v.tipo==='Cliente';}).length + ' vendas</strong></div>' +
                        '<div class="linhaResumo"><span>Parceiros</span><strong>' + DB.vendas.filter(function(v){return v.tipo==='Parceiro';}).length + ' vendas</strong></div>' +
                        '<div class="linhaResumo" style="margin-top:12px;padding-top:12px;border-top:1px solid #c8f0b0;"><span><strong>Total</strong></span><strong>' + fmt.moeda(total) + '</strong></div>' +
                    '</div>' +
                '</div>' +
                '<div class="conteinerTabela"><div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Detalhamento de vendas</h2></div>' +
                    '<div style="display:flex;gap:8px;align-items:center;"><input type="text" id="buscaVendas" placeholder="Buscar..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:200px;">' +
                    botoesExport('csvVendas') + '</div></div>' +
                    '<table class="tabelaGeral" id="tabelaVendasRel"><thead><tr><th>Data</th><th>Categoria</th><th>Produto</th><th>Cliente/Parceiro</th><th>Qtd.</th><th>Valor un.</th><th>Total</th><th>Situação</th></tr></thead><tbody>' + rowsDetalhe + '</tbody></table>' +
                '</div>' +
            '</div>' +

            '<div id="tabVendas_diario" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Faturamento diário</h2></div>' + botoesExport('csvDiario') + '</div>' +
                filtrosPeriodo('diario') +
                '<table class="tabelaGeral"><thead><tr><th>Data</th><th>Faturamento R$</th><th>Pedidos</th><th>Ticket médio</th><th>Clientes atendidos</th><th>Itens vendidos</th><th>Cancelamentos</th></tr></thead><tbody>' + rowsDiario + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabVendas_categoria" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Faturamento por categoria</h2></div>' + botoesExport('csvCategoria') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Categoria</th><th>Faturamento R$</th><th>Pedidos</th><th>Ticket médio</th><th>% do total</th><th>Un. vendidas</th><th>Clientes</th></tr></thead><tbody>' + rowsCat + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabVendas_pagamento" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Vendas por tipo de pagamento</h2></div>' + botoesExport('csvPagamento') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Forma de pagamento</th><th>Faturamento R$</th><th>Pedidos</th><th>Ticket médio</th><th>% do total</th></tr></thead><tbody>' + rowsPag + '</tbody></table>' +
            '</div></div>';
    }

    /* =====================================================
       FINANÇAS
       ===================================================== */
    function renderFinancas() {
        var totalEntradas = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totalSaidas = DB.producoes.reduce(function(s,p){
            var r = DB.receitas.find(function(r){return r.nome===p.receita;});
            return s+(r?r.custo:0);
        },0);
        var saldo = totalEntradas - totalSaidas;
        var margemPct = totalEntradas > 0 ? (saldo/totalEntradas*100).toFixed(1) : 0;

        var entClientes = DB.vendas.filter(function(v){return v.tipo==='Cliente';}).reduce(function(s,v){return s+v.valor;},0);
        var entParceiros = DB.vendas.filter(function(v){return v.tipo==='Parceiro';}).reduce(function(s,v){return s+v.valor;},0);

        var rowsResumo =
            '<tr><td>Vendas a clientes</td><td><span class="badgeAtivo">Entrada</span></td><td>' + fmt.moeda(entClientes) + '</td><td>R$ 0,00</td><td style="color:#0D5B2A;font-weight:600;">' + fmt.moeda(entClientes) + '</td></tr>' +
            '<tr><td>Vendas a parceiros</td><td><span class="badgeAtivo">Entrada</span></td><td>' + fmt.moeda(entParceiros) + '</td><td>R$ 0,00</td><td style="color:#0D5B2A;font-weight:600;">' + fmt.moeda(entParceiros) + '</td></tr>' +
            '<tr><td>Custo de produção</td><td><span style="background:#fde;color:#c00;font-size:11px;padding:2px 8px;border-radius:20px;">Saída</span></td><td>R$ 0,00</td><td>' + fmt.moeda(totalSaidas) + '</td><td style="color:#e53e3e;font-weight:600;">-' + fmt.moeda(totalSaidas) + '</td></tr>';

        var movimentos = DB.vendas.map(function(v){
            return {data:v.data,cat:'Vendas',tipo:'Entrada',pag:'Variado',entrada:v.valor,saida:0};
        }).concat(DB.producoes.map(function(p){
            var r = DB.receitas.find(function(r){return r.nome===p.receita;});
            return {data:p.data,cat:'Produção',tipo:'Saída',pag:'-',entrada:0,saida:r?r.custo:0};
        })).sort(function(a,b){return b.data.localeCompare(a.data);});

        var rowsMov = movimentos.map(function(m) {
            var cor = m.tipo==='Entrada';
            return '<tr><td>' + fmt.data(m.data) + '</td><td>' + m.cat + '</td>' +
                '<td><span ' + (cor ? 'class="badgeAtivo"' : 'style="background:#fde;color:#c00;font-size:11px;padding:2px 8px;border-radius:20px;"') + '>' + m.tipo + '</span></td>' +
                '<td>' + m.pag + '</td><td>' + (m.entrada>0?fmt.moeda(m.entrada):'-') + '</td><td>' + (m.saida>0?fmt.moeda(m.saida):'-') + '</td>' +
                '<td style="color:' + (m.entrada-m.saida>=0?'#0D5B2A':'#e53e3e') + ';font-weight:600;">' + fmt.moeda(m.entrada-m.saida) + '</td></tr>';
        }).join('');

        var rowsEvol = DB.vendas.sort(function(a,b){return b.data.localeCompare(a.data);}).map(function(v) {
            var custo = v.valor * 0.18;
            var lucro = v.valor - custo;
            return '<tr><td>' + fmt.data(v.data) + '</td><td>' + fmt.moeda(v.valor) + '</td><td>' + fmt.moeda(custo) + '</td>' +
                '<td style="color:' + (lucro>=0?'#0D5B2A':'#e53e3e') + ';font-weight:600;">' + fmt.moeda(lucro) + '</td><td>1</td></tr>';
        }).join('');

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Análise financeira de entradas, saídas e saldo do negócio.</p>' +
            mainNav('financas') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Receita total</span><strong class="cardNumero" style="color:#0D5B2A;">' + fmt.moeda(totalEntradas) + '</strong><a href="#">Ver entradas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Despesas totais</span><strong class="cardNumero" style="color:#e53e3e;">' + fmt.moeda(totalSaidas) + '</strong><a href="#">Ver saídas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Lucro líquido</span><strong class="cardNumero" style="color:' + (saldo>=0?'#0D5B2A':'#e53e3e') + ';">' + fmt.moeda(saldo) + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Margem de lucro</span><strong class="cardNumero">' + margemPct + '%</strong><a href="#/relatorios/margem">Ver margem</a></div>' +
            '</section>' +
            innerTab('financas',[['resumo','Resumo Financeiro'],['movimentos','Entradas x Saídas'],['evolucao','Evolução']],'resumo') +

            '<div id="tabFinancas_resumo"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Resumo Financeiro</h2></div>' + botoesExport('csvFinResumo') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Categoria</th><th>Tipo</th><th>Entradas R$</th><th>Saídas R$</th><th>Saldo R$</th></tr></thead>' +
                '<tbody>' + rowsResumo + '</tbody>' +
                '<tfoot><tr style="font-weight:700;background:#f5f5f5;"><td colspan="2">TOTAL GERAL</td><td>' + fmt.moeda(totalEntradas) + '</td><td>' + fmt.moeda(totalSaidas) + '</td><td style="color:' + (saldo>=0?'#0D5B2A':'#e53e3e') + ';">' + fmt.moeda(saldo) + '</td></tr></tfoot>' +
            '</table></div></div>' +

            '<div id="tabFinancas_movimentos" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Entradas x Saídas</h2></div>' + botoesExport('csvFinMov') + '</div>' +
                filtrosPeriodo('finMov') +
                '<table class="tabelaGeral"><thead><tr><th>Data</th><th>Categoria</th><th>Tipo</th><th>Forma de pagamento</th><th>Entradas R$</th><th>Saídas R$</th><th>Saldo R$</th></tr></thead><tbody>' + rowsMov + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabFinancas_evolucao" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Evolução do Faturamento</h2></div>' + botoesExport('csvFinEvol') + '</div>' +
                filtrosPeriodo('finEvol') +
                '<table class="tabelaGeral"><thead><tr><th>Data</th><th>Faturamento Bruto</th><th>Custos</th><th>Lucro Líquido</th><th>Pedidos</th></tr></thead><tbody>' + rowsEvol + '</tbody></table>' +
            '</div></div>';
    }

    /* =====================================================
       MARGEM DE LUCRO
       ===================================================== */
    function renderMargem() {
        var totalFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totalCusto = DB.receitas.reduce(function(s,r){return s+r.custo;},0);
        var totalMargem = DB.receitas.reduce(function(s,r){return s+(parseFloat(r.preco)-r.custo);},0);
        var margemMedia = totalFat > 0 ? (totalMargem/totalFat*100).toFixed(1) : 0;

        var rowsAnalise = DB.receitas.map(function(r) {
            var preco = parseFloat(r.preco);
            var lucro = preco - r.custo;
            var embalagem = r.custo * 0.15;
            var insumos = r.custo * 0.85;
            return '<tr><td><strong>' + r.nome + '</strong></td><td>Blend</td><td>' + fmt.moeda(preco) + '</td><td>' +
                fmt.moeda(insumos) + '</td><td>' + fmt.moeda(embalagem) + '</td><td>' + fmt.moeda(r.custo) + '</td><td>' +
                fmt.moeda(lucro*0.7) + '</td><td>' + fmt.moeda(lucro) + '</td><td><strong style="color:#0D5B2A;">' + r.margem + '</strong></td></tr>';
        }).join('');

        var rowsEvol = DB.vendas.map(function(v) {
            var custo = v.valor * 0.18;
            var mc = v.valor - custo;
            return '<tr><td>' + fmt.data(v.data) + '</td><td>' + v.produto + '</td><td>Blend</td><td>' +
                fmt.moeda(v.valor) + '</td><td>' + fmt.moeda(custo) + '</td><td>' + fmt.moeda(mc) + '</td><td>' +
                (mc/totalFat*100).toFixed(1) + '%</td><td>' + (totalMargem>0?(mc/totalMargem*100).toFixed(1):'0') + '%</td></tr>';
        }).join('');

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Análise de lucratividade e margem de contribuição por produto.</p>' +
            mainNav('margem') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Receita bruta</span><strong class="cardNumero">' + fmt.moeda(totalFat) + '</strong><a href="#">Ver vendas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Custos variáveis</span><strong class="cardNumero">' + fmt.moeda(totalCusto) + '</strong><a href="#">Ver custos</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Margem de contribuição</span><strong class="cardNumero">' + fmt.moeda(totalMargem) + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Margem de lucro</span><strong class="cardNumero">' + margemMedia + '%</strong><a href="#">Ver análise</a></div>' +
            '</section>' +
            innerTab('margem',[['analise','Análise de Lucratividade'],['evolucao','Evolução da Margem']],'analise') +

            '<div id="tabMargem_analise"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Análise de lucratividade por receita</h2></div>' + botoesExport('csvMargem') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Receita</th><th>Categoria</th><th>Receita Líquida</th><th>Insumos</th><th>Embalagem</th><th>Custo Total</th><th>Margem Contribuição</th><th>Lucro Líquido</th><th>Margem %</th></tr></thead><tbody>' + rowsAnalise + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabMargem_evolucao" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Evolução da margem de lucro</h2></div>' + botoesExport('csvMargemEvol') + '</div>' +
                filtrosPeriodo('margEvol') +
                '<table class="tabelaGeral"><thead><tr><th>Data</th><th>Produto</th><th>Categoria</th><th>Receita Líquida</th><th>Custos Variáveis</th><th>Margem Contribuição</th><th>% Particip. Receita</th><th>% Particip. Margem</th></tr></thead><tbody>' + rowsEvol + '</tbody></table>' +
            '</div></div>';
    }

    /* =====================================================
       CLIENTES (analytics)
       ===================================================== */
    function renderClientesRel() {
        var totalFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totalPedidos = DB.vendas.length;
        var ticketMedio = totalPedidos > 0 ? totalFat / totalPedidos : 0;

        var rowsClientes = DB.clientes.map(function(c) {
            var compras = DB.vendas.filter(function(v){return v.cliente===c.nome;});
            var fat = compras.reduce(function(s,v){return s+v.valor;},0) || c.valorTotal;
            var qtdCompras = compras.length || c.totalCompras;
            var datas = compras.map(function(v){return v.data;}).sort();
            var primeira = datas[0] ? fmt.data(datas[0]) : '-';
            var ultima = datas[datas.length-1] ? fmt.data(datas[datas.length-1]) : '-';
            var prods = (new Set(compras.map(function(v){return v.produto;}))).size || '-';
            return '<tr>' +
                '<td><div style="display:flex;align-items:center;gap:8px;"><div class="avatarCircular" style="width:32px;height:32px;font-size:11px;">' + c.nome.slice(0,2).toUpperCase() + '</div>' + c.nome + '</div></td>' +
                '<td>' + primeira + '</td><td>' + ultima + '</td><td>' + qtdCompras + '</td><td>' +
                fmt.moeda(fat) + '</td><td>' + fmt.moeda(fat/(qtdCompras||1)) + '</td><td>' + prods + '</td></tr>';
        }).join('');

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Desempenho dos clientes, frequência de compra e ticket médio.</p>' +
            mainNav('clientes') +
            filtrosPeriodo('clientes', '<select style="padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;"><option>Todos os clientes</option>' +
                DB.clientes.map(function(c){return '<option>'+c.nome+'</option>';}).join('') + '</select>') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Clientes ativos</span><strong class="cardNumero">' + DB.clientes.length + '</strong><a href="#/cadastros/clientes">Ver clientes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Novos clientes</span><strong class="cardNumero">' + Math.ceil(DB.clientes.length/2) + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Pedidos realizados</span><strong class="cardNumero">' + totalPedidos + '</strong><a href="#/relatorios/vendas">Ver vendas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Ticket médio geral</span><strong class="cardNumero">' + fmt.moeda(ticketMedio) + '</strong><a href="#">Ver detalhes</a></div>' +
            '</section>' +
            '<div class="conteinerTabela" style="margin-top:20px;">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Desempenho dos clientes</h2></div>' +
                    '<div style="display:flex;gap:8px;align-items:center;"><input type="text" id="buscaClientesRel" placeholder="Buscar..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:180px;">' + botoesExport('csvClientes') + '</div>' +
                '</div>' +
                '<table class="tabelaGeral" id="tabelaClientesRel"><thead><tr><th>Cliente</th><th>Primeira compra</th><th>Última compra</th><th>Total de compras</th><th>Faturamento</th><th>Ticket médio</th><th>Produtos comprados</th></tr></thead><tbody>' + rowsClientes + '</tbody></table>' +
            '</div>';
    }

    /* =====================================================
       ESTOQUE (expandido)
       ===================================================== */
    function renderEstoqueRel() {
        var valProd = DB.produtos.reduce(function(s,p){return s+p.estoque*p.preco;},0);
        var valIns  = DB.insumos.reduce(function(s,i){return s+i.estoque*i.preco;},0);
        var valTotal = valProd + valIns;
        var itensBaixo = DB.produtos.filter(function(p){return p.status==='baixo';}).length + DB.insumos.filter(function(i){return i.status==='baixo';}).length;
        var itensSem   = DB.produtos.filter(function(p){return p.status==='zerado';}).length + DB.insumos.filter(function(i){return i.status==='crítico';}).length;
        var totalItens = DB.produtos.length + DB.insumos.length;

        function statusStyle(s) {
            if (s==='normal') return 'background:#e6f7ee;color:#0D5B2A;';
            if (s==='baixo')  return 'background:#fff3e0;color:#e65c00;';
            return 'background:#fde;color:#c00;';
        }

        var rowsValTipo = DB.produtos.map(function(p) {
            return '<tr><td>Produto</td><td>' + p.nome + '</td><td>' + p.estoque + ' ' + p.unidade + '</td><td>' +
                fmt.moeda(p.estoque*p.preco) + '</td><td>' + (valTotal>0?(p.estoque*p.preco/valTotal*100).toFixed(1):0) + '%</td><td>' +
                fmt.moeda(p.preco) + '</td><td><span class="badgeAtivo" style="' + statusStyle(p.status) + '">' + p.status + '</span></td></tr>';
        }).concat(DB.insumos.map(function(i) {
            return '<tr><td>Insumo</td><td>' + i.nome + '</td><td>' + i.estoque + ' ' + i.unidade + '</td><td>' +
                fmt.moeda(i.estoque*i.preco) + '</td><td>' + (valTotal>0?(i.estoque*i.preco/valTotal*100).toFixed(1):0) + '%</td><td>' +
                fmt.moeda(i.preco) + '</td><td><span class="badgeAtivo" style="' + statusStyle(i.status) + '">' + i.status + '</span></td></tr>';
        })).join('');

        var grupos = [
            { sit:'Em estoque',    itens:DB.produtos.filter(function(p){return p.status==='normal';}), tipo:'Produtos' },
            { sit:'Estoque baixo', itens:DB.produtos.filter(function(p){return p.status==='baixo';}),  tipo:'Produtos' },
            { sit:'Sem estoque',   itens:DB.produtos.filter(function(p){return p.status==='zerado';}), tipo:'Produtos' },
            { sit:'Em estoque',    itens:DB.insumos.filter(function(i){return i.status==='normal';}),   tipo:'Insumos'  },
            { sit:'Estoque baixo', itens:DB.insumos.filter(function(i){return i.status==='baixo';}),    tipo:'Insumos'  },
            { sit:'Crítico',  itens:DB.insumos.filter(function(i){return i.status==='crítico';}),  tipo:'Insumos'  },
        ];
        var rowsSit = grupos.map(function(g) {
            var qtdTotal = g.itens.reduce(function(s,i){return s+i.estoque;},0);
            var valG = g.itens.reduce(function(s,i){return s+i.estoque*i.preco;},0);
            var valMed = g.itens.length > 0 ? g.itens.reduce(function(s,i){return s+i.preco;},0)/g.itens.length : 0;
            return '<tr><td>' + g.sit + '</td><td>' + g.tipo + '</td><td>' + g.itens.length + '</td><td>' + qtdTotal.toFixed(1) + '</td><td>' +
                (g.itens.length/totalItens*100).toFixed(1) + '%</td><td>' + fmt.moeda(valG) + '</td><td>' + (valMed>0?fmt.moeda(valMed):'-') + '</td></tr>';
        }).join('');

        var rowsProd = DB.produtos.map(function(p) {
            return '<tr><td>' + p.nome + '</td><td>' + p.categoria + '</td><td>' + p.estoque + ' ' + p.unidade + '</td><td>' +
                fmt.moeda(p.preco) + '</td><td>' + fmt.moeda(p.estoque*p.preco) + '</td>' +
                '<td><span class="badgeAtivo" style="' + statusStyle(p.status) + '">' + p.status + '</span></td></tr>';
        }).join('');
        var rowsIns = DB.insumos.map(function(i) {
            return '<tr><td>' + i.nome + '</td><td>' + i.categoria + '</td><td>' + i.estoque + ' ' + i.unidade + '</td><td>' +
                fmt.moeda(i.preco) + '</td><td>' + fmt.moeda(i.estoque*i.preco) + '</td>' +
                '<td><span class="badgeAtivo" style="' + statusStyle(i.status) + '">' + i.status + '</span></td></tr>';
        }).join('');

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Situação, valor e movimentações do estoque.</p>' +
            mainNav('estoque') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Valor total em estoque</span><strong class="cardNumero">' + fmt.moeda(valTotal) + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Itens com estoque baixo</span><strong class="cardNumero" style="color:#e65c00;">' + itensBaixo + '</strong><a href="#">Ver lista</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Itens sem estoque</span><strong class="cardNumero" style="color:#e53e3e;">' + itensSem + '</strong><a href="#">Ver lista</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Total de itens</span><strong class="cardNumero">' + totalItens + '</strong><a href="#">Ver tudo</a></div>' +
            '</section>' +
            innerTab('estoque',[['geral','Visão Geral'],['valtipo','Valor por Tipo'],['situacao','Situação']],'geral') +

            '<div id="tabEstoque_geral">' +
                '<div class="conteinerTabela" style="margin-bottom:20px;">' +
                    '<h2 class="tituloTabela" style="margin:0 0 12px 0;">Produtos</h2>' +
                    '<table class="tabelaGeral"><thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Preço</th><th>Valor total</th><th>Status</th></tr></thead><tbody>' + rowsProd + '</tbody></table>' +
                '</div>' +
                '<div class="conteinerTabela">' +
                    '<h2 class="tituloTabela" style="margin:0 0 12px 0;">Insumos</h2>' +
                    '<table class="tabelaGeral"><thead><tr><th>Insumo</th><th>Categoria</th><th>Estoque</th><th>Preço/un.</th><th>Valor total</th><th>Status</th></tr></thead><tbody>' + rowsIns + '</tbody></table>' +
                '</div>' +
            '</div>' +

            '<div id="tabEstoque_valtipo" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Valor de estoque por tipo</h2></div>' + botoesExport('csvEstValTipo') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Tipo</th><th>Item</th><th>Estoque atual</th><th>Valor total</th><th>% do total</th><th>Valor médio unitário</th><th>Situação</th></tr></thead><tbody>' + rowsValTipo + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabEstoque_situacao" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Situação do estoque</h2></div>' + botoesExport('csvEstSit') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Situação</th><th>Tipo de estoque</th><th>Itens</th><th>Qtd. total</th><th>% do total</th><th>Valor total R$</th><th>Valor médio unitário</th></tr></thead><tbody>' + rowsSit + '</tbody></table>' +
            '</div></div>';
    }

    /* =====================================================
       RECEITAS / INSUMOS (analytics)
       ===================================================== */
    function renderReceitasRel() {
        var totalFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totalCusto = DB.receitas.reduce(function(s,r){return s+r.custo;},0);
        var totalLucro = DB.receitas.reduce(function(s,r){return s+(parseFloat(r.preco)-r.custo);},0);

        var rowsInsumos = DB.insumos.map(function(i) {
            var unids = (i.estoque * 0.3).toFixed(1);
            var custo = i.preco * parseFloat(unids);
            var receita = custo * 4.5;
            var mc = receita - custo;
            var rent = receita > 0 ? (mc/receita*100).toFixed(1) : 0;
            return '<tr><td>' + i.nome + '</td><td>' + unids + ' ' + i.unidade + '</td><td>' +
                fmt.moeda(custo) + '</td><td>' + fmt.moeda(i.preco) + '</td><td>' +
                fmt.moeda(mc) + '</td><td><strong style="color:#0D5B2A;">' + rent + '%</strong></td></tr>';
        }).join('');

        var porCat = {};
        DB.insumos.forEach(function(i) {
            if (!porCat[i.categoria]) porCat[i.categoria] = {rec:0, custo:0, lucro:0};
            var unids = i.estoque * 0.3;
            var custo = i.preco * unids;
            var receita = custo * 4.5;
            porCat[i.categoria].rec += receita;
            porCat[i.categoria].custo += custo;
            porCat[i.categoria].lucro += receita - custo;
        });
        var totalRecCat = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].rec;},0);
        var rowsComp = Object.keys(porCat).map(function(cat) {
            var d = porCat[cat];
            return '<tr><td>' + cat + '</td><td>' + fmt.moeda(d.rec) + '</td><td>' +
                (totalRecCat>0?(d.rec/totalRecCat*100).toFixed(1):0) + '%</td><td>' +
                fmt.moeda(d.custo) + '</td><td>' + fmt.moeda(d.lucro) + '</td><td><strong style="color:#0D5B2A;">' +
                (d.rec>0?(d.lucro/d.rec*100).toFixed(1):0) + '%</strong></td></tr>';
        }).join('');
        var totCusto = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].custo;},0);
        var totLucro = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].lucro;},0);

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Lucratividade, margem de contribuição e rentabilidade dos insumos.</p>' +
            mainNav('receitas') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Receita total</span><strong class="cardNumero">' + fmt.moeda(totalFat) + '</strong><a href="#">Ver vendas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Custo total</span><strong class="cardNumero">' + fmt.moeda(totalCusto) + '</strong><a href="#">Ver custos</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Lucro bruto</span><strong class="cardNumero" style="color:#0D5B2A;">' + fmt.moeda(totalLucro) + '</strong><a href="#/relatorios/margem">Ver margem</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Receitas cadastradas</span><strong class="cardNumero">' + DB.receitas.length + '</strong><a href="#/cadastros/receitas">Ver receitas</a></div>' +
            '</section>' +
            innerTab('receitas',[['desempenho','Desempenho dos Insumos'],['composicao','Composição por Categoria']],'desempenho') +

            '<div id="tabReceitas_desempenho"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Desempenho e rentabilidade dos insumos</h2></div>' + botoesExport('csvInsDesemp') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Insumo</th><th>Un. utilizadas</th><th>Custo total R$</th><th>Custo por unidade R$</th><th>Margem de contribuição R$</th><th>Rentabilidade</th></tr></thead><tbody>' + rowsInsumos + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabReceitas_composicao" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Composição da receita por categoria</h2></div>' + botoesExport('csvInsComp') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Categoria de insumo</th><th>Receita gerada R$</th><th>Participação %</th><th>Custo utilizado R$</th><th>Lucro gerado R$</th><th>Rentabilidade</th></tr></thead>' +
                '<tbody>' + rowsComp + '</tbody>' +
                '<tfoot><tr style="font-weight:700;background:#f5f5f5;"><td>TOTAL GERAL</td><td>' + fmt.moeda(totalRecCat) + '</td><td>100%</td><td>' + fmt.moeda(totCusto) + '</td><td>' + fmt.moeda(totLucro) + '</td><td>' + (totalRecCat>0?(totLucro/totalRecCat*100).toFixed(1):0) + '%</td></tr></tfoot>' +
            '</table></div></div>';
    }

    /* =====================================================
       PRODUÇÃO (sub-reports)
       ===================================================== */
    function renderProducaoRel() {
        var totalProd = DB.producoes.reduce(function(s,p){return s+p.qtd;},0);
        var prodDistintos = (new Set(DB.producoes.map(function(p){return p.receita;}))).size;
        var totalCusto = DB.producoes.reduce(function(s,p){
            var r = DB.receitas.find(function(r){return r.nome===p.receita;});
            return s+(r?r.custo:0);
        },0);

        var rowsTotal = DB.producoes.map(function(p) {
            var r = DB.receitas.find(function(r){return r.nome===p.receita;});
            return '<tr><td>' + fmt.data(p.data) + '</td><td>' + p.receita + '</td><td>' + p.qtd + '</td><td>' +
                (r?r.nome:'-') + '</td><td>' + (r?fmt.moeda(r.custo):'-') + '</td><td>' + p.responsavel + '</td></tr>';
        }).join('');

        var porReceita = {};
        DB.producoes.forEach(function(p) {
            if (!porReceita[p.receita]) porReceita[p.receita] = {qtd:0};
            porReceita[p.receita].qtd += p.qtd;
        });
        var rowsMais = Object.keys(porReceita).sort(function(a,b){return porReceita[b].qtd-porReceita[a].qtd;}).map(function(nome) {
            var d = porReceita[nome];
            var r = DB.receitas.find(function(r){return r.nome===nome;});
            var valor = r ? parseFloat(r.preco)/10*d.qtd : 0;
            return '<tr><td>' + nome + '</td><td>' + d.qtd + '</td><td>' + (totalProd>0?(d.qtd/totalProd*100).toFixed(1):0) + '%</td><td>' +
                fmt.moeda(valor) + '</td><td>' + (d.qtd>0?fmt.moeda(valor/d.qtd):'-') + '</td></tr>';
        }).join('');

        var rowsIns = DB.insumos.slice(0,4).map(function(i) {
            var qtdCons = (i.estoque * 0.2).toFixed(2);
            return '<tr><td>' + (DB.producoes[0]?fmt.data(DB.producoes[0].data):'-') + '</td><td>' + i.nome + '</td><td>' +
                i.unidade + '</td><td>' + qtdCons + '</td><td>' + fmt.moeda(i.preco) + '</td><td>' +
                fmt.moeda(i.preco * parseFloat(qtdCons)) + '</td><td>' + (DB.producoes[0]?DB.producoes[0].receita:'-') + '</td></tr>';
        }).join('');

        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Análise de produção por período, receitas e insumos consumidos.</p>' +
            mainNav('producao') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Produção total</span><strong class="cardNumero">' + totalProd + ' un.</strong><a href="#/producao">Ver histórico</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Produtos produzidos</span><strong class="cardNumero">' + prodDistintos + '</strong><a href="#/cadastros/receitas">Ver receitas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Custo total de produção</span><strong class="cardNumero">' + fmt.moeda(totalCusto) + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Insumos cadastrados</span><strong class="cardNumero">' + DB.insumos.length + '</strong><a href="#/estoque/insumos">Ver insumos</a></div>' +
            '</section>' +
            innerTab('producao',[['total','Total por Período'],['maisProd','Mais Produzidos'],['insumos','Insumos Consumidos']],'total') +

            '<div id="tabProducao_total"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Produção total por período</h2></div>' + botoesExport('csvProdTotal') + '</div>' +
                filtrosPeriodo('prodTotal') +
                '<table class="tabelaGeral"><thead><tr><th>Data</th><th>Produto</th><th>Qtd. produzida</th><th>Receita utilizada</th><th>Custo da produção</th><th>Responsável</th></tr></thead><tbody>' + rowsTotal + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabProducao_maisProd" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Produtos mais produzidos</h2></div>' + botoesExport('csvProdMais') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Produto</th><th>Qtd. produzida</th><th>% do total</th><th>Valor total R$</th><th>Média por unidade R$</th></tr></thead><tbody>' + rowsMais + '</tbody></table>' +
            '</div></div>' +

            '<div id="tabProducao_insumos" style="display:none;"><div class="conteinerTabela">' +
                '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Insumos consumidos por período</h2></div>' + botoesExport('csvProdIns') + '</div>' +
                '<table class="tabelaGeral"><thead><tr><th>Data</th><th>Insumo</th><th>Unidade</th><th>Qtd. consumida</th><th>Custo unitário R$</th><th>Custo total R$</th><th>Utilizado em</th></tr></thead><tbody>' + rowsIns + '</tbody></table>' +
            '</div></div>';
    }

    /* =====================================================
       RESUMO GERAL
       ===================================================== */
    function renderResumo() {
        var totalFaturamento = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var dados = [8200,7400,9100,10500,11200,12840];
        var meses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
        var max = Math.max.apply(null, dados);
        var barras = dados.map(function(v,i) {
            return '<div class="barraItem"><div class="barra" style="height:' + Math.round(v/max*160) + 'px;background:#0D5B2A;"></div><span>' + meses[i] + '</span></div>';
        }).join('');
        var categorias = [
            {cat:'Blends de chá', qtd:380, fat:9120, pct:'71%'},
            {cat:'Home spray',       qtd:75,  fat:2625, pct:'20%'},
            {cat:'Acessórios',  qtd:40,  fat:1095, pct:'9%'},
        ];
        var rowsCat = categorias.map(function(c) {
            return '<tr><td>' + c.cat + '</td><td>' + c.qtd + '</td><td>' + fmt.moeda(c.fat) + '</td><td>' + c.pct + '</td></tr>';
        }).join('');
        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Visão consolidada do negócio.</p>' +
            mainNav('resumo') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Faturamento</span><strong class="cardNumero">' + fmt.moeda(totalFaturamento) + '</strong><a href="#/relatorios/vendas">Ver vendas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Produtos em estoque</span><strong class="cardNumero">' + DB.produtos.reduce(function(s,p){return s+p.estoque;},0) + '</strong><a href="#/estoque/produtos">Ver estoque</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Receitas</span><strong class="cardNumero">' + DB.receitas.length + '</strong><a href="#/cadastros/receitas">Ver receitas</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Produções</span><strong class="cardNumero">' + DB.producoes.length + '</strong><a href="#/producao">Ver produções</a></div>' +
            '</section>' +
            '<div class="linhaDashboard" style="margin-top:24px;">' +
                '<div class="cardDashboard"><h2 class="tituloTabela" style="margin:0 0 16px 0;">Faturamento mensal (R$)</h2><div class="graficoBarras">' + barras + '</div></div>' +
                '<div class="cardDashboard" style="background:#DDF7C9;"><h3 style="margin:0 0 14px 0;color:#0D4B24;font-size:14px;">Destaques</h3>' +
                    '<div class="linhaResumo"><span>Produto mais vendido</span><strong>Blend Felicita</strong></div>' +
                    '<div class="linhaResumo"><span>Receita mais produzida</span><strong>Blend Anti-estresse</strong></div>' +
                    '<div class="linhaResumo"><span>Ticket médio</span><strong>' + fmt.moeda(totalFaturamento/DB.vendas.length) + '</strong></div>' +
                    '<div class="linhaResumo"><span>Clientes únicos</span><strong>' + (new Set(DB.vendas.map(function(v){return v.cliente;}))).size + '</strong></div>' +
                '</div>' +
            '</div>' +
            '<div class="conteinerTabela" style="margin-top:24px;">' +
                '<h2 class="tituloTabela" style="margin:0 0 16px 0;">Consolidado por categoria</h2>' +
                '<table class="tabelaGeral"><thead><tr><th>Categoria</th><th>Qtd. vendida</th><th>Faturamento</th><th>% do total</th></tr></thead><tbody>' + rowsCat + '</tbody></table>' +
            '</div>';
    }

    /* =====================================================
       FORNECEDORES
       ===================================================== */
    function renderFornecedores() {
        var totalVal = DB.fornecedores.reduce(function(s,f){return s+f.valorTotal;},0);
        var destaque = DB.fornecedores.slice().sort(function(a,b){return b.valorTotal-a.valorTotal;})[0];
        var rows = DB.fornecedores.map(function(f) {
            return '<tr>' +
                '<td><div style="display:flex;align-items:center;gap:8px;"><div class="avatarCircular" style="width:32px;height:32px;font-size:11px;">' + f.nome.slice(0,2).toUpperCase() + '</div>' + f.nome + '</div></td>' +
                '<td>' + f.insumos + '</td><td>' + fmt.data(f.ultimaCompra) + '</td><td>' + fmt.moeda(f.valorTotal) + '</td>' +
                '<td><span class="' + (f.ativo?'badgeAtivo':'') + '" style="' + (!f.ativo?'background:#fde;color:#c00;font-size:11px;padding:2px 8px;border-radius:20px;':'') + '">' + (f.ativo?'Ativo':'Inativo') + '</span></td>' +
                '<td><button class="btnAcaoEditar">&#9998;</button></td></tr>';
        }).join('');
        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Desempenho e análise dos fornecedores.</p>' +
            mainNav('fornecedores') +
            '<section class="cardsResumo">' +
                '<div class="cardResumo"><span class="cardSubtitulo">Total de fornecedores</span><strong class="cardNumero">' + DB.fornecedores.length + '</strong><a href="#/cadastros/fornecedores">Gerenciar</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Fornecedores ativos</span><strong class="cardNumero">' + DB.fornecedores.filter(function(f){return f.ativo;}).length + '</strong><a href="#">Ver detalhes</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Total em compras</span><strong class="cardNumero">' + fmt.moeda(totalVal) + '</strong><a href="#">Ver compras</a></div>' +
                '<div class="cardResumo"><span class="cardSubtitulo">Insumos cadastrados</span><strong class="cardNumero">' + DB.insumos.length + '</strong><a href="#/estoque/insumos">Ver insumos</a></div>' +
            '</section>' +
            '<div class="areaDoisPaineis" style="margin-top:24px;">' +
                '<div class="painelPrincipal"><div class="conteinerTabela">' +
                    '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Fornecedores</h2></div>' +
                        '<input type="text" id="buscaFornRel" placeholder="Buscar..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">' +
                    '</div>' +
                    '<table class="tabelaGeral" id="tabelaFornRel"><thead><tr><th>Fornecedor</th><th>Insumos</th><th>Última compra</th><th>Valor total</th><th>Status</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table>' +
                '</div></div>' +
                '<div class="painelLateral"><div class="cardInfoLateral">' +
                    '<div class="topoCard"><div class="avatarCircular">' + destaque.nome.slice(0,2).toUpperCase() + '</div>' +
                        '<div><h3>' + destaque.nome + '</h3><span class="badgeAtivo">Destaque</span></div>' +
                    '</div>' +
                    '<div class="itemInfoCard"><span>Insumos</span><strong>' + destaque.insumos + '</strong></div>' +
                    '<div class="itemInfoCard"><span>Valor total</span><strong>' + fmt.moeda(destaque.valorTotal) + '</strong></div>' +
                    '<div class="itemInfoCard"><span>Última compra</span><strong>' + fmt.data(destaque.ultimaCompra) + '</strong></div>' +
                '</div></div>' +
            '</div>';
    }

    /* =====================================================
       MÓDULO
       ===================================================== */
    window.Pages.relatorios = {
        render: function(sub) {
            switch (sub) {
                case 'hub':          return renderHub();
                case 'vendas':       return renderVendas();
                case 'financas':     return renderFinancas();
                case 'margem':       return renderMargem();
                case 'clientes':     return renderClientesRel();
                case 'estoque':      return renderEstoqueRel();
                case 'receitas':     return renderReceitasRel();
                case 'producao':     return renderProducaoRel();
                case 'resumo':       return renderResumo();
                case 'fornecedores': return renderFornecedores();
                default:             return renderHub();
            }
        },
        init: function(sub) {
            var tabGroups = ['vendas','financas','margem','estoque','receitas','producao'];
            if (tabGroups.indexOf(sub) !== -1) initTabs(sub);

            var searchMap = {
                vendas:       ['#buscaVendas',      '#tabelaVendasRel tbody'],
                clientes:     ['#buscaClientesRel', '#tabelaClientesRel tbody'],
                fornecedores: ['#buscaFornRel',     '#tabelaFornRel tbody'],
            };
            if (searchMap[sub]) CL.bindSearch(searchMap[sub][0], searchMap[sub][1]);

            /* CSV exports */
            var csvMap = {
                csvVendas: function() {
                    csvDownload(
                        ['Data','Categoria','Produto','Cliente','Qtd','Valor Un.','Total','Situação'],
                        DB.vendas.map(function(v) {
                            var p = DB.produtos.find(function(p){return p.nome===v.produto;});
                            return [fmt.data(v.data), p?p.categoria:'-', v.produto, v.cliente, v.qtd, v.valor/v.qtd, v.valor, 'Conclúído'];
                        }), 'vendas.csv');
                },
                csvClientes: function() {
                    csvDownload(
                        ['Cliente','Primeira compra','Última compra','Total compras','Faturamento','Ticket médio'],
                        DB.clientes.map(function(c) {
                            return [c.nome, '-', '-', c.totalCompras, c.valorTotal, (c.valorTotal/c.totalCompras).toFixed(2)];
                        }), 'clientes.csv');
                },
            };
            Object.keys(csvMap).forEach(function(id) {
                var btn = document.getElementById(id);
                if (btn) btn.addEventListener('click', csvMap[id]);
            });
        }
    };
})();
