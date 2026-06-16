/* pages/relatorios.js — Baseado no protótipo de alta fidelidade Figma */
(function () {
    var fmt = CL.fmt;

    /* ── helpers ──────────────────────────────────────────── */
    function esc(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
    function csvDown(headers, rows, name) {
        var lines = [headers.map(esc).join(',')].concat(rows.map(function(r){ return r.map(esc).join(','); }));
        var blob = new Blob(['﻿' + lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
    }

    function btnExport(csvId) {
        return '<button id="' + csvId + '" class="btnExportExcel">&#128202; Exportar Excel (.xlsx)</button>' +
               '<button onclick="window.print()" class="btnDownloadPdf">&#128196; Baixar PDF (.pdf)</button>';
    }

    function statusBadge(s) {
        var map = { normal:'badgeNormal Normal', zerado:'badgeZerado Zerado', baixo:'badgeBaixo Baixo',
                    'crítico':'badgeCritico Crítico', concluida:'badgeConcluido Concluída',
                    ativo:'badgeConcluido Ativo', inativo:'badgeZerado Inativo' };
        var v = map[String(s).toLowerCase()] || ('badgeNormal ' + s);
        var parts = v.split(' '); var cls = parts[0]; var txt = parts.slice(1).join(' ');
        return '<span class="' + cls + '">' + txt + '</span>';
    }

    /* ── Filtros de página (Figma style) ──────────────────── */
    function filtros(campos, semPeriodo) {
        var html = '<div class="filtrosPagina">';
        if (!semPeriodo) {
            html += '<div class="filtroItem"><label>Período</label>' +
                '<div style="display:flex;gap:6px;align-items:center;">' +
                '<input type="date" style="min-width:130px;">' +
                '<span style="font-size:12px;color:#888;">-</span>' +
                '<input type="date" style="min-width:130px;"></div></div>';
        }
        (campos || []).forEach(function(c) {
            html += '<div class="filtroItem"><label>' + c.label + '</label>' +
                '<select><option>' + (c.opts || ['Todos']).join('</option><option>') + '</option></select></div>';
        });
        html += '<div class="filtrosBotoes">' +
            '<button class="btnVerde" onclick="CL.toast(\'Filtro aplicado\')">&#9783; Filtrar</button>' +
            '<button class="btnVoltar" onclick="CL.toast(\'Filtros limpos\')">&#8635; Limpar Filtros</button>' +
            '</div></div>';
        return html;
    }

    /* ── Topo de relatório (título + export) ──────────────── */
    function topoRel(titulo, subtitulo, csvId, semExport) {
        var html = '<div class="topoRelatorio">' +
            '<div><h1 class="tituloPagina" style="margin-bottom:4px;">' + titulo + '</h1>' +
            '<p class="subtituloPagina" style="margin-top:0;">' + subtitulo + '</p></div>';
        if (!semExport) {
            html += '<div class="exportBtns">' + btnExport(csvId || 'csvGen') + '</div>';
        }
        html += '</div>';
        return html;
    }

    /* ── Topo de tabela (busca + ordenar) ─────────────────── */
    function topoTabela(tituloTabela, inputId, csvId) {
        return '<div class="tabelaTopBar">' +
            '<strong style="font-size:14px;color:#222;">' + tituloTabela + '</strong>' +
            '<div style="display:flex;gap:10px;align-items:center;">' +
            '<div class="buscaComIcone">&#128269; <input type="text" id="' + inputId + '" placeholder="Buscar item..."></div>' +
            '<div class="ordenarSelect"><span>Ordenar por:</span>' +
            '<select><option>Maior quantidade em estoque</option><option>Menor quantidade</option><option>Nome A-Z</option></select></div>' +
            (csvId ? '<div style="display:flex;gap:6px;">' + btnExport(csvId) + '</div>' : '') +
            '</div></div>';
    }

    /* ── Mini gráfico barras SVG ──────────────────────────── */
    function barChart(valores, cor) {
        cor = cor || '#0D5B2A';
        var max = Math.max.apply(null, valores) || 1;
        var w = 260 / valores.length;
        var bars = valores.map(function(v, i) {
            var h = Math.round(v / max * 70);
            return '<rect x="' + (i*w+2) + '" y="' + (75-h) + '" width="' + (w-4) + '" height="' + h + '" fill="' + cor + '" rx="2" opacity="0.85"/>';
        }).join('');
        return '<svg class="svgBarChart" viewBox="0 0 260 80">' + bars + '</svg>';
    }

    /* ── Mini gráfico linha SVG ───────────────────────────── */
    function lineChart(valores, cor) {
        cor = cor || '#0D5B2A';
        var max = Math.max.apply(null, valores) || 1;
        var min = Math.min.apply(null, valores);
        var pts = valores.map(function(v, i) {
            var x = i * (260 / (valores.length - 1));
            var y = 70 - Math.round((v - min) / (max - min || 1) * 60);
            return x + ',' + y;
        }).join(' ');
        return '<svg class="svgLineChart" viewBox="0 0 260 80">' +
            '<polyline points="' + pts + '" fill="none" stroke="' + cor + '" stroke-width="2.5" stroke-linejoin="round"/>' +
            '</svg>';
    }

    /* ── Mini gráfico dona SVG ────────────────────────────── */
    function donutChart(fatias, cores) {
        cores = cores || ['#0D5B2A','#B9F7A8','#FFD566','#FF8A65'];
        var total = fatias.reduce(function(s,v){return s+v;},0) || 1;
        var r = 30; var cx = 40; var cy = 40;
        var circum = 2 * Math.PI * r;
        var offset = 0;
        var segs = fatias.map(function(v, i) {
            var pct = v / total;
            var dash = pct * circum;
            var seg = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none"' +
                ' stroke="' + (cores[i] || '#ddd') + '" stroke-width="14"' +
                ' stroke-dasharray="' + dash.toFixed(1) + ' ' + circum.toFixed(1) + '"' +
                ' stroke-dashoffset="-' + offset.toFixed(1) + '"' +
                ' transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
            offset += dash;
            return seg;
        }).join('');
        return '<svg viewBox="0 0 80 80" width="80" height="80">' + segs + '</svg>';
    }

    /* ── Mini chart box ───────────────────────────────────── */
    function miniChart(titulo, valor, chart, exportId) {
        return '<div class="miniChartBox">' +
            '<button class="miniChartExport" onclick="CL.toast(\'Exportando...\')">&#128196;</button>' +
            '<p class="miniChartTitulo">' + titulo + '</p>' +
            (valor ? '<p class="miniChartValor">' + valor + '</p>' : '') +
            chart +
            '</div>';
    }

    /* ── KPI card ─────────────────────────────────────────── */
    function kpiCard(icone, cor, label, valor, sub, trend) {
        return '<div class="kpiCard">' +
            '<div class="kpiIcone ' + cor + '">' + icone + '</div>' +
            '<div class="kpiTexto">' +
            '<p class="kpiLabel">' + label + '</p>' +
            '<p class="kpiValor">' + valor + '</p>' +
            (sub ? '<span class="kpiSub">' + sub + '</span>' : '') +
            (trend ? '<div class="kpiTrend' + (trend[0]==='-'?' neg':'') + '">' + trend + '</div>' : '') +
            '</div></div>';
    }

    /* ── backBtn ──────────────────────────────────────────── */
    function backBtn(href, txt) {
        return '<a href="' + href + '" class="btnVoltar" style="text-decoration:none;margin-bottom:16px;display:inline-flex;">&#8592; ' + txt + '</a>';
    }

    /* ============================================================
       HUB
       ============================================================ */
    function renderHub() {
        var totalFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var custos = DB.producoes.reduce(function(s,p){
            var r = DB.receitas.find(function(r){return r.nome===p.receita;});
            return s+(r?r.custo:0);
        },0);
        var lucro = totalFat - custos;
        var cards = [
            { icon:'&#128200;', cor:'verde', label:'Vendas',         sub:'Detalhamento e faturamento',  href:'#/relatorios/vendas'       },
            { icon:'&#128202;', cor:'verde', label:'Finanças',        sub:'Entradas, saídas e saldo',    href:'#/relatorios/financas'     },
            { icon:'&#128198;', cor:'azul',  label:'Margem de Lucro', sub:'Lucratividade por produto',   href:'#/relatorios/margem'       },
            { icon:'&#128101;', cor:'verde', label:'Clientes',        sub:'Desempenho e ticket médio',   href:'#/relatorios/clientes'     },
            { icon:'&#128230;', cor:'laranja',label:'Insumos',        sub:'Situação e valor em estoque', href:'#/relatorios/estoque'      },
            { icon:'&#127807;', cor:'verde', label:'Receitas',        sub:'Lucratividade dos insumos',   href:'#/relatorios/receitas'     },
            { icon:'&#127981;', cor:'azul',  label:'Produção',        sub:'Produção por período',        href:'#/relatorios/producao'     },
            { icon:'&#127968;', cor:'laranja',label:'Fornecedores',   sub:'Desempenho dos fornecedores', href:'#/relatorios/fornecedores' },
            { icon:'&#128203;', cor:'verde', label:'Resumo Geral',    sub:'Visão consolidada',           href:'#/relatorios/resumo'       },
        ];
        return '<h1 class="tituloPagina">Relatórios</h1>' +
            '<p class="subtituloPagina">Selecione uma categoria para visualizar os relatórios.</p>' +
            '<div class="kpiGrid">' +
                kpiCard('&#128200;','verde','Faturamento total',fmt.moeda(totalFat),'Todas as vendas','') +
                kpiCard('&#128202;','vermelho','Custos de produção',fmt.moeda(custos),'Custo acumulado','') +
                kpiCard('&#128178;','verde','Lucro estimado',fmt.moeda(lucro),'Período atual','') +
                kpiCard('&#128101;','azul','Clientes ativos',DB.clientes.length,'Cadastrados','') +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;">' +
            cards.map(function(c) {
                return '<a href="' + c.href + '" style="text-decoration:none;display:block;background:white;border:1px solid #e8e8e8;border-radius:12px;padding:20px;"' +
                    ' onmouseenter="this.style.boxShadow=\'0 4px 16px rgba(13,91,42,0.12)\'" onmouseleave="this.style.boxShadow=\'\'">' +
                    '<div class="kpiIcone ' + c.cor + '" style="margin-bottom:10px;width:44px;height:44px;border-radius:10px;">' + c.icon + '</div>' +
                    '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">' + c.label + '</div>' +
                    '<div style="font-size:12px;color:#888;">' + c.sub + '</div>' +
                    '<div style="margin-top:14px;font-size:12px;color:#0D5B2A;font-weight:600;">Ver relatório →</div>' +
                    '</a>';
            }).join('') + '</div>';
    }

    /* ============================================================
       VENDAS HUB
       ============================================================ */
    function renderVendas() {
        var total = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var topProd = DB.vendas.reduce(function(acc,v){ acc[v.produto]=(acc[v.produto]||0)+v.qtd; return acc; },{});
        var maisProd = Object.keys(topProd).sort(function(a,b){return topProd[b]-topProd[a];})[0] || '-';
        var rows = DB.vendas.map(function(v) {
            var prod = DB.produtos.find(function(p){return p.nome===v.produto;});
            var cat = prod ? prod.categoria : '-';
            var tagCls = cat==='Blend'?'tagCha':cat==='Home Spray'?'tagAromatizador':'tagAcessorio';
            return '<tr><td>' + fmt.data(v.data) + '</td>' +
                '<td><span class="' + tagCls + '">' + cat + '</span></td>' +
                '<td>' + v.produto + '</td>' +
                '<td>' + v.cliente + '</td>' +
                '<td>' + v.qtd + ' UN</td>' +
                '<td>' + fmt.moeda(v.valor/v.qtd) + ' UN</td>' +
                '<td>' + fmt.moeda(v.valor) + '</td>' +
                '<td><span class="badgeConcluido">Concluído</span></td></tr>';
        }).join('');

        var fatDados = [480,690,520,750,630,880,720,960,840,500,670,1200];
        var catDados = [total*0.45, total*0.30, total*0.15, total*0.10];
        var pagDados = [total*0.45, total*0.25, total*0.18, total*0.12];

        return topoRel('Relatórios de Vendas','Acompanhe o desenvolvimento das vendas no período selecionado','csvVendas',true) +
            filtros([{label:'Categoria',opts:['Todas as categorias','Chá','Aromatizador','Acessório']},{label:'Produto',opts:['Todos os tipos'].concat(DB.produtos.map(function(p){return p.nome;}))}]) +
            '<div class="kpiGrid">' +
                kpiCard('&#128722;','verde','Faturamento total',fmt.moeda(total),'Valor total de vendas','') +
                kpiCard('&#127807;','verde','Produto mais vendido',maisProd,'Produto líder no período','') +
                kpiCard('&#128178;','azul','Ticket médio',fmt.moeda(total/DB.vendas.length),'Por período','') +
                kpiCard('&#128203;','laranja','Pedidos Realizados',DB.vendas.length,'Total de pedidos','') +
            '</div>' +
            '<div class="miniChartsGrid">' +
                miniChart('FATURAMENTO DIÁRIO (R$)',null,lineChart(fatDados),'csvVenDia') +
                miniChart('FATURAMENTO POR CATEGORIA (R$)',null,barChart(catDados),'csvVenCat') +
                miniChart('VENDAS POR FORMA DE PAGAMENTO (R$)',null,barChart(pagDados,'#B9F7A8'),'csvVenPag') +
            '</div>' +
            '<div class="relConteiner">' +
                topoTabela('Detalhamento do estoque','buscaVendasRel','csvVendas') +
                '<div style="display:flex;gap:8px;margin:8px 0;">' + btnExport('csvVendasDl') + '</div>' +
                '<table class="tabelaRelatorio" id="tabelaVendasRel">' +
                '<thead><tr><th>Data</th><th>Categoria</th><th>Produto</th><th>Cliente</th><th>Quantidade</th><th>Valor unitário</th><th>Valor total</th><th>Situação</th></tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
                '<tfoot><tr><td colspan="6"><strong>TOTAL GERAL</strong></td>' +
                '<td><strong>' + fmt.moeda(total) + '</strong></td><td></td></tr></tfoot>' +
                '</table></div>' +
            '<div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">' +
                '<a href="#/relatorios/vendas/diario" class="btnVerde">Faturamento Diário →</a>' +
                '<a href="#/relatorios/vendas/categoria" class="btnVerde">Por Categoria →</a>' +
                '<a href="#/relatorios/vendas/pagamento" class="btnVerde">Por Pagamento →</a>' +
            '</div>';
    }

    /* ── Faturamento diário ─────────────────────────────── */
    function renderFaturamentoDiario() {
        var porDia = {};
        DB.vendas.forEach(function(v) {
            if (!porDia[v.data]) porDia[v.data]={fat:0,ped:0,clis:{},itens:0};
            porDia[v.data].fat+=v.valor; porDia[v.data].ped++;
            porDia[v.data].clis[v.cliente]=true; porDia[v.data].itens+=v.qtd;
        });
        var rows = Object.keys(porDia).sort(function(a,b){return b.localeCompare(a);}).map(function(d) {
            var e = porDia[d];
            return '<tr><td>'+fmt.data(d)+'</td><td>'+fmt.moeda(e.fat)+'</td><td>'+e.ped+'</td>' +
                '<td>'+fmt.moeda(e.fat/e.ped)+'</td><td>'+Object.keys(e.clis).length+'</td>' +
                '<td>'+e.itens+'</td><td>0</td></tr>';
        }).join('');
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        return backBtn('#/relatorios/vendas','Relatórios de Vendas') +
            topoRel('Faturamento diário','Visualize o valor total do faturamento diário por período','csvDiario') +
            filtros([{label:'Tipo de estoque',opts:['Todos os estoques','Produtos','Insumos']},{label:'Status',opts:['Todos','Normal','Baixo','Zerado']}]) +
            '<div class="relConteiner">' +
                topoTabela('Faturamento diário','buscaDiario') +
                '<table class="tabelaRelatorio" id="tabelaDiario">' +
                '<thead><tr><th>Data</th><th>Faturamento (R$)</th><th>Pedidos realizados</th><th>Ticket médio</th><th>Clientes atendidos</th><th>Itens atendidos</th><th>Cancelamento</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(totFat)+'</strong></td><td><strong>'+DB.vendas.length+'</strong></td><td colspan="4"><strong>100%</strong></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Faturamento por categoria ──────────────────────── */
    function renderFaturamentoCategoria() {
        var total = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var porCat = {};
        DB.vendas.forEach(function(v) {
            var p = DB.produtos.find(function(p){return p.nome===v.produto;});
            var c = p ? p.categoria : 'Outros';
            if (!porCat[c]) porCat[c]={fat:0,ped:0,itens:0,clis:{}};
            porCat[c].fat+=v.valor; porCat[c].ped++; porCat[c].itens+=v.qtd; porCat[c].clis[v.cliente]=true;
        });
        var rows = Object.keys(porCat).map(function(cat) {
            var d=porCat[cat];
            return '<tr><td><span class="'+(cat==='Blend'?'tagCha':cat==='Home Spray'?'tagAromatizador':'tagAcessorio')+'">'+cat+'</span></td>' +
                '<td>'+fmt.moeda(d.fat)+'</td><td>'+d.ped+'</td><td>'+fmt.moeda(d.fat/d.ped)+'</td>' +
                '<td>'+(d.fat/total*100).toFixed(1)+'%</td><td>'+d.itens+'</td><td>'+Object.keys(d.clis).length+'</td></tr>';
        }).join('');
        return backBtn('#/relatorios/vendas','Relatórios de Vendas') +
            topoRel('Faturamento por categoria','Visualize o valor total do faturamento por categoria por período','csvCateg') +
            filtros([{label:'Tipo de estoque',opts:['Todos os estoques']},{label:'Status',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Faturamento por categoria','buscaCateg') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Categoria</th><th>Faturamento (R$)</th><th>Pedidos realizados</th><th>Ticket médio</th><th>% do todo</th><th>Unidades vendidas</th><th>Clientes atendidos</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(total)+'</strong></td><td colspan="5"><strong>100%</strong></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Vendas por pagamento ───────────────────────────── */
    function renderVendasPagamento() {
        var total = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var pags = [
            {forma:'Pix',      fat:total*0.45, ped:2},
            {forma:'Dinheiro', fat:total*0.25, ped:2},
            {forma:'Débito',   fat:total*0.18, ped:1},
            {forma:'Crédito',  fat:total*0.12, ped:1},
        ];
        var rows = pags.map(function(p) {
            return '<tr><td>'+p.forma+'</td><td>'+fmt.moeda(p.fat)+'</td><td>'+p.ped+'</td>' +
                '<td>'+fmt.moeda(p.fat/(p.ped||1))+'</td><td>2</td><td>4</td><td>0</td></tr>';
        }).join('');
        return backBtn('#/relatorios/vendas','Relatórios de Vendas') +
            topoRel('Vendas por tipo de pagamento','Visualize o valor das vendas por tipo de pagamento por período','csvPag') +
            filtros([{label:'Tipo de estoque',opts:['Todos os estoques']},{label:'Status',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Vendas por tipo de pagamento','buscaPag') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Forma de pagamento</th><th>Faturamento (R$)</th><th>Pedidos realizados</th><th>Ticket médio</th><th>Clientes atendidos</th><th>Itens atendidos</th><th>Cancelamento</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(total)+'</strong></td><td colspan="5"><strong>100%</strong></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ============================================================
       INSUMOS / ESTOQUE
       ============================================================ */
    function renderEstoqueRel() {
        var valProd = DB.produtos.reduce(function(s,p){return s+p.estoque*p.preco;},0);
        var valIns  = DB.insumos.reduce(function(s,i){return s+i.estoque*i.preco;},0);
        var total   = valProd + valIns;
        var baixo   = DB.produtos.filter(function(p){return p.status==='baixo';}).length +
                      DB.insumos.filter(function(i){return i.status==='baixo';}).length;
        var zero    = DB.produtos.filter(function(p){return p.status==='zerado';}).length +
                      DB.insumos.filter(function(i){return i.status==='crítico';}).length;
        var totItens= DB.produtos.length + DB.insumos.length;

        var todos = DB.produtos.map(function(p){return {tipo:'Produto',item:p.nome,est:p.estoque+' '+p.unidade,min:'-',vUnit:p.preco,vTot:p.estoque*p.preco,status:p.status};})
            .concat(DB.insumos.map(function(i){return {tipo:'Insumo',item:i.nome,est:i.estoque+' '+i.unidade,min:'-',vUnit:i.preco,vTot:i.estoque*i.preco,status:i.status};}));
        var rows = todos.map(function(t) {
            return '<tr>' +
                '<td><span class="'+(t.tipo==='Produto'?'badgeConcluido':'badgeNormal')+'">'+t.tipo+'</span></td>' +
                '<td>'+t.item+'</td><td>'+t.est+'</td><td>'+t.min+'</td>' +
                '<td>'+fmt.moeda(t.vUnit)+'</td><td>'+fmt.moeda(t.vTot)+'</td>' +
                '<td>'+statusBadge(t.status)+'</td></tr>';
        }).join('');

        var tiposDados = [valProd, valIns];
        var sitDados = [totItens-baixo-zero, baixo, zero];

        return topoRel('Relatórios de Insumos','Acompanhe a situação atual de todos os itens em estoque','csvInsumos',true) +
            filtros([{label:'Categoria',opts:['Todas as categorias','Flor','Erva','Especiaria']},{label:'Tipo de item',opts:['Todos os tipos','Produto','Insumo']}]) +
            '<div class="kpiGrid">' +
                kpiCard('&#128230;','verde','Valor total em estoque',fmt.moeda(total),'valor de custo','&#8599; 8,7% vs período anterior') +
                kpiCard('&#9888;','laranja','Itens com estoque baixo',baixo,'Itens','') +
                kpiCard('&#10060;','vermelho','Itens sem estoque',zero,'Itens','') +
                kpiCard('&#128230;','azul','Total de itens',totItens,'Produtos e insumos','') +
            '</div>' +
            '<div class="miniChartsGrid">' +
                miniChart('VALOR DE ESTOQUE POR TIPO',null,donutChart(tiposDados),'csvEstTipo') +
                miniChart('SITUAÇÃO DE ESTOQUE (QUANTIDADE DE ITENS)',null,donutChart(sitDados,['#0D5B2A','#FFD566','#e53e3e']),'csvEstSit') +
                miniChart('ENTRADAS X SAÍDAS (QUANTIDADE)',null,barChart([totItens*3,totItens*2.5],'#0D5B2A'),'csvEstMov') +
            '</div>' +
            '<div class="relConteiner">' +
                topoTabela('Detalhamento do estoque','buscaInsumos','csvInsumosD') +
                '<table class="tabelaRelatorio" id="tabelaInsumos">' +
                '<thead><tr><th>Tipo</th><th>Item</th><th>Estoque atual</th><th>Estoque mínimo</th><th>Valor unitário</th><th>Valor total</th><th>Situação</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="5"><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(total)+'</strong></td><td></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Situação do estoque ────────────────────────────── */
    function renderEstoqueSituacao() {
        var valTotal = DB.produtos.reduce(function(s,p){return s+p.estoque*p.preco;},0) +
                       DB.insumos.reduce(function(s,i){return s+i.estoque*i.preco;},0);
        var grupos = [
            {sit:'Em estoque',    tipo:'Produtos', itens:DB.produtos.filter(function(p){return p.status==='normal';})},
            {sit:'Estoque baixo', tipo:'Produtos', itens:DB.produtos.filter(function(p){return p.status==='baixo';})},
            {sit:'Sem estoque',   tipo:'Produtos', itens:DB.produtos.filter(function(p){return p.status==='zerado';})},
            {sit:'Em estoque',    tipo:'Insumos',  itens:DB.insumos.filter(function(i){return i.status==='normal';})},
            {sit:'Estoque baixo', tipo:'Insumos',  itens:DB.insumos.filter(function(i){return i.status==='baixo';})},
            {sit:'Crítico',       tipo:'Insumos',  itens:DB.insumos.filter(function(i){return i.status==='crítico';})},
        ];
        var totItens = DB.produtos.length + DB.insumos.length;
        var rows = grupos.map(function(g) {
            var qtd = g.itens.reduce(function(s,i){return s+i.estoque;},0);
            var val = g.itens.reduce(function(s,i){return s+i.estoque*i.preco;},0);
            var med = g.itens.length > 0 ? g.itens.reduce(function(s,i){return s+i.preco;},0)/g.itens.length : 0;
            return '<tr><td>'+g.sit+'</td><td>'+g.tipo+'</td><td>'+g.itens.length+'</td>' +
                '<td>'+qtd.toFixed(1)+'</td><td>'+(totItens>0?(g.itens.length/totItens*100).toFixed(1):0)+'%</td>' +
                '<td>'+fmt.moeda(val)+'</td><td>'+(med>0?fmt.moeda(med):'-')+'</td></tr>';
        }).join('');
        return backBtn('#/relatorios/estoque','Relatórios de Insumos') +
            topoRel('Situação do estoque','Visualize a situação agrupada dos itens em estoque','csvEstSit2') +
            filtros([]) +
            '<div class="relConteiner">' +
                topoTabela('Situação do estoque','buscaEstSit') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Situação</th><th>Tipo de estoque</th><th>Itens</th><th>Qtd. total</th><th>% do total</th><th>Valor total R$</th><th>Valor médio unitário</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="5"><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(valTotal)+'</strong></td><td></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ============================================================
       FINANÇAS
       ============================================================ */
    function renderFinancas() {
        var entradas = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var saidas = DB.producoes.reduce(function(s,p){
            var r=DB.receitas.find(function(r){return r.nome===p.receita;}); return s+(r?r.custo:0);
        },0);
        var lucro = entradas - saidas;
        var marg = entradas > 0 ? (lucro/entradas*100).toFixed(1) : 0;
        var entCli = DB.vendas.filter(function(v){return v.tipo==='Cliente';}).reduce(function(s,v){return s+v.valor;},0);
        var entPar = DB.vendas.filter(function(v){return v.tipo==='Parceiro';}).reduce(function(s,v){return s+v.valor;},0);

        var rowsRes =
            '<tr><td>Vendas</td><td>100%</td><td>'+fmt.moeda(entradas)+'</td><td>—</td><td style="color:#0D5B2A;font-weight:700;">'+fmt.moeda(entradas)+'</td></tr>' +
            '<tr class="rowEntrada"><td>&nbsp;&nbsp;Total de entradas</td><td>100%</td><td>'+fmt.moeda(entradas)+'</td><td>—</td><td style="color:#0D5B2A;font-weight:700;">'+fmt.moeda(entradas)+'</td></tr>' +
            '<tr><td>Custo de produção</td><td>—</td><td>—</td><td style="color:#e53e3e;">'+fmt.moeda(saidas*0.43)+'</td><td>'+fmt.moeda(saidas*0.43)+'</td></tr>' +
            '<tr><td>Despesas operacionais</td><td>—</td><td>—</td><td style="color:#e53e3e;">'+fmt.moeda(saidas*0.57)+'</td><td>'+fmt.moeda(saidas*0.57)+'</td></tr>' +
            '<tr class="rowSaida"><td>&nbsp;&nbsp;Total de saídas</td><td>—</td><td>—</td><td style="color:#e53e3e;font-weight:700;">'+fmt.moeda(saidas)+'</td><td style="color:#e53e3e;font-weight:700;">'+fmt.moeda(saidas)+'</td></tr>' +
            '<tr style="background:#e8f5e0;font-weight:700;"><td>Saldo do período</td><td>—</td><td>'+fmt.moeda(entradas)+'</td><td>—</td><td style="color:#0D5B2A;">'+fmt.moeda(lucro)+'</td></tr>';

        var fatDados = [entradas*0.08, entradas*0.12, entradas*0.09, entradas*0.15, entradas*0.11, entradas*0.18, entradas*0.10, entradas*0.17];
        var evolDados = [entradas*0.08, entradas*0.12, entradas*0.09, entradas*0.15];
        var distDados = [entradas*0.45, entradas*0.30, entradas*0.15, entradas*0.10];

        return topoRel('Relatórios de Finanças','Acompanhe o desempenho financeiro da empresa no período selecionado','csvFinancas',true) +
            filtros([{label:'Categoria',opts:['Todas as categorias']},{label:'Forma de pagamento',opts:['Todos os tipos','Pix','Dinheiro','Débito','Crédito']}]) +
            '<div class="kpiGrid">' +
                kpiCard('&#128200;','verde','Receita total',fmt.moeda(entradas),'Valor total de vendas','') +
                kpiCard('&#9660;','vermelho','Despesas totais',fmt.moeda(saidas),'Valor total em despesas','') +
                kpiCard('&#128178;','verde','Lucro líquido',fmt.moeda(lucro),'Total em lucro líquido','') +
                kpiCard('&#9711;','azul','Margem de lucro',marg+'%','Média de margem de lucro','') +
            '</div>' +
            '<div class="miniChartsGrid">' +
                miniChart('ENTRADAS X SAÍDAS (R$)',null,lineChart(fatDados),'csvFinE') +
                miniChart('EVOLUÇÃO DO FATURAMENTO (R$)',null,barChart(evolDados),'csvFinEv') +
                miniChart('DISTRIBUIÇÃO DE DESPESAS (%)',null,donutChart(distDados),'csvFinD') +
            '</div>' +
            '<div class="relConteiner">' +
                '<div style="font-size:14px;font-weight:700;color:#222;margin-bottom:12px;">Resumo Financeiro</div>' +
                '<div style="display:flex;gap:8px;margin-bottom:8px;">' + btnExport('csvFinancasD') + '</div>' +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Categoria</th><th>Entradas(R$)</th><th>%</th><th>Saídas(R$)</th><th>Saldo(R$)</th></tr></thead>' +
                '<tbody>'+rowsRes+'</tbody>' +
                '</table></div>' +
            '<div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">' +
                '<a href="#/relatorios/financas/movimentos" class="btnVerde">Entradas x Saídas →</a>' +
                '<a href="#/relatorios/financas/evolucao" class="btnVerde">Evolução do Faturamento →</a>' +
            '</div>';
    }

    /* ── Entradas x Saídas ─────────────────────────────── */
    function renderEntradasSaidas() {
        var movs = DB.vendas.map(function(v){
            return {data:v.data,cat:'Vendas',tipo:'Entrada',pag:'Pix',ent:v.valor,sai:0};
        }).concat(DB.producoes.map(function(p){
            var r=DB.receitas.find(function(r){return r.nome===p.receita;});
            return {data:p.data,cat:'Compras',tipo:'Saída',pag:'Débito',ent:0,sai:r?r.custo:0};
        })).sort(function(a,b){return b.data.localeCompare(a.data);});
        var totEnt = movs.reduce(function(s,m){return s+m.ent;},0);
        var totSai = movs.reduce(function(s,m){return s+m.sai;},0);
        var rows = movs.map(function(m) {
            var isEnt = m.tipo==='Entrada';
            return '<tr class="'+(isEnt?'rowEntrada':'rowSaida')+'">' +
                '<td><span class="'+(isEnt?'badgeEntrada':'badgeSaida')+'">'+m.tipo+'</span></td>' +
                '<td>'+fmt.data(m.data)+'</td><td>'+m.cat+'</td><td>'+m.pag+'</td>' +
                '<td style="color:'+(isEnt?'#0D5B2A':'#888')+';">'+(m.ent>0?fmt.moeda(m.ent):'—')+'</td>' +
                '<td style="color:'+(isEnt?'#888':'#e53e3e')+';">'+(m.sai>0?fmt.moeda(m.sai):'—')+'</td>' +
                '<td style="color:'+(m.ent-m.sai>=0?'#0D5B2A':'#e53e3e');+';font-weight:600;">'+fmt.moeda(m.ent-m.sai)+'</td></tr>';
        }).join('');
        return backBtn('#/relatorios/financas','Relatórios de Finanças') +
            topoRel('Entradas x Saídas','Visualize o valor total de entradas e saídas por período','csvEntSai') +
            filtros([{label:'Categoria',opts:['Todos os estoques']},{label:'Tipo de pagamento',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Entradas x Saídas','buscaEntSai') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Tipo</th><th>Data</th><th>Categoria</th><th>Forma de pagamento</th><th>Entradas(R$)</th><th>Saídas(R$)</th><th>Saldo(R$)</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="4"><strong>TOTAL GERAL</strong></td>' +
                '<td><strong>'+fmt.moeda(totEnt)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totSai)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totEnt-totSai)+'</strong></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Evolução do faturamento ─────────────────────────── */
    function renderEvolucaoFat() {
        var rows1 = DB.vendas.map(function(v) {
            var custo = v.valor*0.20; var lucro = v.valor-custo;
            return '<tr><td>'+fmt.data(v.data)+'</td><td>'+fmt.moeda(v.valor)+'</td>' +
                '<td style="color:#e53e3e;">'+fmt.moeda(custo)+'</td>' +
                '<td style="color:#0D5B2A;font-weight:600;">'+fmt.moeda(lucro)+'</td>' +
                '<td>'+v.qtd+'</td></tr>';
        }).join('');
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totCus = totFat*0.20; var totLuc = totFat - totCus;

        return backBtn('#/relatorios/financas','Relatórios de Finanças') +
            topoRel('Evolução do faturamento','Visualize a evolução do faturamento por período','csvEvolFat') +
            filtros([]) +
            '<div class="relConteiner">' +
                topoTabela('Evolução do faturamento','buscaEvolFat') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Data</th><th>Faturamento Bruto(R$)</th><th>Custos(R$)</th><th>Lucro líquido(R$)</th><th>Pedidos</th></tr></thead>' +
                '<tbody>'+rows1+'</tbody>' +
                '<tfoot><tr><td><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(totFat)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totCus)+'</strong></td><td><strong>'+fmt.moeda(totLuc)+'</strong></td>' +
                '<td><strong>'+DB.vendas.length+'</strong></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ============================================================
       MARGEM DE LUCRO
       ============================================================ */
    function renderMargem() {
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totCus = DB.receitas.reduce(function(s,r){return s+r.custo;},0);
        var totMarg = DB.receitas.reduce(function(s,r){return s+(parseFloat(r.preco)-r.custo);},0);
        var margemPct = totFat > 0 ? (totMarg/totFat*100).toFixed(1) : 57;

        var rowsPerf = DB.receitas.map(function(r,i) {
            var preco = parseFloat(r.preco); var cust = r.custo; var lucro = preco-cust;
            return '<tr><td>'+(i+1)+'</td><td>'+r.nome+'</td><td>'+fmt.moeda(preco)+'</td>' +
                '<td>'+fmt.moeda(cust*0.85)+'</td><td>'+fmt.moeda(preco-cust)+'</td>' +
                '<td style="color:#0D5B2A;font-weight:700;">'+fmt.moeda(lucro)+'</td>' +
                '<td>'+r.margem+'</td></tr>';
        }).join('');

        var dados1 = DB.receitas.map(function(r){return parseFloat(r.preco);});
        var dados2 = DB.receitas.map(function(r){return parseFloat(r.margem);});
        var dados3 = DB.receitas.map(function(r){return r.custo;});

        return topoRel('Relatório margem de lucro','Acompanhe a margem de lucro da empresa no período selecionado','csvMargem',true) +
            filtros([{label:'Categoria',opts:['Todas as categorias']},{label:'Produto',opts:['Todos os tipos']}]) +
            '<div class="kpiGrid">' +
                kpiCard('&#128200;','verde','Receita bruta',fmt.moeda(totFat),'Valor total bruto','') +
                kpiCard('&#9660;','vermelho','Custos variáveis',fmt.moeda(totCus),'Valor total','') +
                kpiCard('&#9651;','azul','Margem de contribuição',fmt.moeda(totMarg),'Total de contribuição','') +
                kpiCard('&#9711;','verde','Margem de lucro',margemPct+'%','Do período','') +
            '</div>' +
            '<div class="miniChartsGrid">' +
                miniChart('ANÁLISE DE LUCRATIVIDADE (% CONTRIBUIÇÃO)',null,lineChart(dados1),'csvMargA') +
                miniChart('EVOLUÇÃO DA MARGEM DE LUCRO (%)',null,lineChart(dados2.map(function(v){return parseFloat(v);})),'csvMargEv') +
                miniChart('MARGEM DE CONTRIBUIÇÃO X RECEITA (R$)',null,barChart(dados3),'csvMargC') +
            '</div>' +
            '<div class="relConteiner">' +
                '<div style="font-size:14px;font-weight:700;color:#222;margin-bottom:12px;">Performance dos produtos</div>' +
                '<div style="display:flex;gap:8px;margin-bottom:8px;">' + btnExport('csvMargemD') + '</div>' +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>#</th><th>Produto</th><th>Receita(R$)</th><th>Custo variáveis(R$)</th><th>Margem de contribuição(R$)</th><th>Lucro líquido</th><th>Margem de lucro(%)</th></tr></thead>' +
                '<tbody>'+rowsPerf+'</tbody>' +
                '<tfoot><tr><td colspan="2"><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(totFat)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totCus)+'</strong></td><td><strong>'+fmt.moeda(totMarg)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totFat-totCus)+'</strong></td><td></td></tr></tfoot>' +
                '</table></div>' +
            '<div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">' +
                '<a href="#/relatorios/margem/analise" class="btnVerde">Análise de Lucratividade →</a>' +
                '<a href="#/relatorios/margem/evolucao" class="btnVerde">Evolução da Margem →</a>' +
                '<a href="#/relatorios/margem/contribuicao" class="btnVerde">Margem x Receita →</a>' +
            '</div>';
    }

    /* ── Análise de lucratividade ───────────────────────── */
    function renderAnalise() {
        var rows = DB.receitas.map(function(r) {
            var preco=parseFloat(r.preco); var emb=r.custo*0.15; var ins=r.custo*0.85;
            var mc=preco-r.custo; var ll=mc*0.7;
            return '<tr><td><strong>'+r.nome+'</strong></td><td>Relaxante</td><td>'+fmt.moeda(preco)+'</td>' +
                '<td>'+fmt.moeda(ins)+'</td><td>'+fmt.moeda(emb)+'</td><td>'+fmt.moeda(r.custo)+'</td>' +
                '<td>'+fmt.moeda(mc)+'</td><td style="color:#0D5B2A;font-weight:700;">'+fmt.moeda(ll)+'</td>' +
                '<td>'+r.margem+'</td></tr>';
        }).join('');
        var totFat = DB.receitas.reduce(function(s,r){return s+parseFloat(r.preco);},0);
        var totCus = DB.receitas.reduce(function(s,r){return s+r.custo;},0);
        var totMarg = totFat - totCus;
        return backBtn('#/relatorios/margem','Relatório Margem de Lucro') +
            topoRel('Análise de lucratividade','Visualize a lucratividade, margem de contribuição e performance por período','csvAnalise') +
            filtros([{label:'Categoria',opts:['Todos os estoques']},{label:'Tipo de pagamento',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Análise de lucratividade','buscaAnalise') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Produtos</th><th>Categoria</th><th>Receita líquida</th><th>Insumos</th><th>Embalagem</th><th>Total</th><th>Margem de contribuição</th><th>Lucro líquido</th><th>Margem de Lucro</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="2"><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(totFat)+'</strong></td>' +
                '<td colspan="3"><strong>'+fmt.moeda(totCus)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totMarg)+'</strong></td><td><strong>'+fmt.moeda(totFat-totCus)+'</strong></td><td></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Evolução margem ────────────────────────────────── */
    function renderEvolucaoMargem() {
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totMarg = totFat - totFat*0.20;
        var rows = DB.vendas.map(function(v) {
            var cus=v.valor*0.20; var mc=v.valor-cus;
            return '<tr><td>'+fmt.data(v.data)+'</td><td>'+v.produto+'</td><td>Blend</td>' +
                '<td>'+fmt.moeda(v.valor)+'</td><td>'+fmt.moeda(cus)+'</td>' +
                '<td>'+fmt.moeda(mc)+'</td>' +
                '<td>'+(mc/totFat*100).toFixed(1)+'%</td>' +
                '<td>'+(totMarg>0?(mc/totMarg*100).toFixed(1):0)+'%</td></tr>';
        }).join('');
        return backBtn('#/relatorios/margem','Relatório Margem de Lucro') +
            topoRel('Evolução da margem de lucro','Acompanhe a evolução da margem de lucro ao longo do período selecionada','csvEvolMarg') +
            filtros([{label:'Categoria',opts:['Todos os estoques']},{label:'Tipo de pagamento',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Evolução da margem de lucro','buscaEvolMarg') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Data</th><th>Produtos</th><th>Categoria</th><th>Receita líquida</th><th>Custos variáveis</th><th>Margem de contribuição</th><th>Participação na receita(%)</th><th>Participação na margem(%)</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="3"><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(totFat)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totFat*0.20)+'</strong></td><td><strong>'+fmt.moeda(totMarg)+'</strong></td>' +
                '<td colspan="2"></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Margem contribuição x receita ─────────────────── */
    function renderMCxReceita() {
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var rows = DB.vendas.map(function(v) {
            var cus=v.valor*0.20; var mc=v.valor-cus;
            return '<tr><td>'+fmt.data(v.data)+'</td><td>'+v.produto+'</td><td>Blend</td>' +
                '<td>'+fmt.moeda(v.valor)+'</td><td>'+fmt.moeda(cus)+'</td>' +
                '<td>'+fmt.moeda(mc)+'</td>' +
                '<td>'+(mc/totFat*100).toFixed(1)+'%</td>' +
                '<td>'+(mc/(totFat*0.80)*100).toFixed(1)+'%</td></tr>';
        }).join('');
        return backBtn('#/relatorios/margem','Relatório Margem de Lucro') +
            topoRel('Margem de contribuição X receita','Compare a margem de contribuição com a receita líquida','csvMCxRec') +
            filtros([{label:'Categoria',opts:['Todos os estoques']},{label:'Tipo de pagamento',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Margem de contribuição x receita','buscaMCxRec') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Data</th><th>Produtos</th><th>Categoria</th><th>Receita líquida</th><th>Custos variáveis</th><th>Margem de contribuição</th><th>Participação na receita(%)</th><th>Participação na margem(%)</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="3"><strong>TOTAL GERAL</strong></td>' +
                '<td><strong>'+fmt.moeda(totFat)+'</strong></td><td><strong>'+fmt.moeda(totFat*0.20)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totFat*0.80)+'</strong></td><td colspan="2"></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ============================================================
       CLIENTES
       ============================================================ */
    function renderClientesRel() {
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totPed = DB.vendas.length;
        var ticket = totPed > 0 ? totFat/totPed : 0;
        var fatDados = [200,350,280,450,320,600,410,720,380,540];
        var tickDados = [300,420,380,500,440,610,480,620];
        var barDados = DB.clientes.map(function(c){return c.valorTotal;});

        var rows = DB.clientes.map(function(c) {
            var compras = DB.vendas.filter(function(v){return v.cliente===c.nome;});
            var fat = compras.reduce(function(s,v){return s+v.valor;},0) || c.valorTotal;
            var qtd = compras.length || c.totalCompras;
            var datas = compras.map(function(v){return v.data;}).sort();
            var pri = datas[0] ? fmt.data(datas[0]) : '31/05/2026';
            var ult = datas[datas.length-1] ? fmt.data(datas[datas.length-1]) : '05/06/2026';
            var prods = (new Set(compras.map(function(v){return v.produto;}))).size || 10;
            return '<tr>' +
                '<td>'+c.nome+'</td><td>'+pri+'</td><td>'+ult+'</td>' +
                '<td>'+qtd+'</td><td>'+fmt.moeda(fat)+'</td>' +
                '<td>'+fmt.moeda(fat/(qtd||1))+'</td><td>'+prods+'</td></tr>';
        }).join('');

        return topoRel('Relatório clientes','Avalie o desempenho dos clientes frequência de compra e ticket médio','csvClientes',true) +
            filtros([{label:'Cliente',opts:['Todas'].concat(DB.clientes.map(function(c){return c.nome;}))}]) +
            '<div class="kpiGrid">' +
                kpiCard('&#128100;','verde','Clientes ativos',DB.clientes.length,'Clientes','') +
                kpiCard('&#128100;','azul','Novos clientes',Math.ceil(DB.clientes.length/2),'Clientes','') +
                kpiCard('&#128722;','laranja','Pedidos realizados',totPed,'Pedidos','') +
                kpiCard('&#127991;','verde','Ticket médio geral',fmt.moeda(ticket),'por cliente','') +
            '</div>' +
            '<div class="miniChartsGrid">' +
                miniChart('FREQUÊNCIA DE COMPRA',null,donutChart([totPed*0.4,totPed*0.3,totPed*0.2,totPed*0.1]),'csvCliFreq') +
                miniChart('EVOLUÇÃO DO TICKET MÉDIO',null,lineChart(tickDados),'csvCliTick') +
                miniChart('CLIENTES COM MAIOR FATURAMENTO (TOP 5)',null,barChart(barDados),'csvCliTop') +
            '</div>' +
            '<div class="relConteiner">' +
                topoTabela('Desempenho dos clientes','buscaClientesRel','csvClientesD') +
                '<table class="tabelaRelatorio" id="tabelaClientesRel">' +
                '<thead><tr><th>Clientes</th><th>Primeira compra</th><th>Última compra</th><th>Total de compras</th><th>Faturamento</th><th>Ticket médio</th><th>Produtos comprados</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="3"><strong>TOTAL GERAL</strong></td><td><strong>'+totPed+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totFat)+'</strong></td><td><strong>'+fmt.moeda(ticket)+'</strong></td><td></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ============================================================
       RECEITAS / INSUMOS (analytics)
       ============================================================ */
    function renderReceitasRel() {
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var totCus = DB.receitas.reduce(function(s,r){return s+r.custo;},0);
        var totLuc = DB.receitas.reduce(function(s,r){return s+(parseFloat(r.preco)-r.custo);},0);
        var porCat = {};
        DB.insumos.forEach(function(i) {
            if (!porCat[i.categoria]) porCat[i.categoria]={rec:0,cus:0};
            var u=i.estoque*0.3; var c=i.preco*u; porCat[i.categoria].rec+=c*4.5; porCat[i.categoria].cus+=c;
        });
        var totRec = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].rec;},0);

        var rowsDesemp = DB.insumos.map(function(i) {
            var u=(i.estoque*0.3).toFixed(1); var c=i.preco*parseFloat(u); var rec=c*4.5; var mc=rec-c;
            var rent=rec>0?(mc/rec*100).toFixed(1):0;
            return '<tr><td>'+i.nome+'</td><td>'+u+' '+i.unidade+'</td><td>'+fmt.moeda(c)+'</td>' +
                '<td>'+fmt.moeda(i.preco)+'</td><td>'+fmt.moeda(mc)+'</td>' +
                '<td style="color:#0D5B2A;font-weight:700;">'+rent+'%</td></tr>';
        }).join('');

        var evolDados = DB.insumos.map(function(i){return i.preco*i.estoque*0.3;});
        var compDados = Object.keys(porCat).map(function(k){return porCat[k].rec;});
        var rentDados = Object.keys(porCat).map(function(k){return (porCat[k].rec-porCat[k].cus)/porCat[k].rec*100;});

        return topoRel('Relatório receitas','Visão completa da lucratividade, custo e rentabilidade dos produtos','csvReceitas',true) +
            filtros([{label:'Receita',opts:['Todas'].concat(DB.receitas.map(function(r){return r.nome;}))}]) +
            '<div class="kpiGrid">' +
                kpiCard('&#128200;','verde','Destaque do período',DB.receitas[0]?DB.receitas[0].nome:'Receita 1','Do período analisado','') +
                kpiCard('&#128722;','verde','Receita total',fmt.moeda(totFat),'Do período','') +
                kpiCard('&#128722;','vermelho','Custo total',fmt.moeda(totCus),'Do período','') +
                kpiCard('&#128178;','verde','Lucro bruto',fmt.moeda(totLuc),'Do período','') +
            '</div>' +
            '<div class="miniChartsGrid">' +
                miniChart('EVOLUÇÃO DA RECEITA',null,lineChart(evolDados),'csvRecEv') +
                miniChart('COMPOSIÇÃO DA RECEITA POR CATEGORIA',null,donutChart(compDados),'csvRecComp') +
                miniChart('RENTABILIDADE MÉDIA NO PERÍODO',null,barChart(rentDados.map(Math.abs)),'csvRecRent') +
            '</div>' +
            '<div class="relConteiner">' +
                topoTabela('Desempenho e rentabilidade dos insumos','buscaRecInsumos','csvRecInsD') +
                '<table class="tabelaRelatorio" id="tabelaRecInsumos">' +
                '<thead><tr><th>Insumos</th><th>Unidades Utilizadas</th><th>Custo total(R$)</th><th>Custo por unidade(R$)</th><th>Margem de contribuição(R$)</th><th>Rentabilidade(%)</th></tr></thead>' +
                '<tbody>'+rowsDesemp+'</tbody>' +
                '<tfoot><tr><td colspan="2"><strong>TOTAL GERAL</strong></td>' +
                '<td><strong>'+fmt.moeda(totCus)+'</strong></td>' +
                '<td colspan="2"><strong>'+fmt.moeda(totLuc)+'</strong></td><td></td></tr></tfoot>' +
                '</table></div>' +
            '<div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">' +
                '<a href="#/relatorios/receitas/composicao" class="btnVerde">Composição por Categoria →</a>' +
                '<a href="#/relatorios/receitas/rentabilidade" class="btnVerde">Rentabilidade Média →</a>' +
                '<a href="#/relatorios/receitas/evolucao" class="btnVerde">Evolução da Receita - Insumos →</a>' +
            '</div>';
    }

    /* ── Composição da receita por categoria ────────────── */
    function renderComposicao() {
        var porCat = {};
        DB.insumos.forEach(function(i) {
            if (!porCat[i.categoria]) porCat[i.categoria]={rec:0,cus:0};
            var u=i.estoque*0.3; var c=i.preco*u; porCat[i.categoria].rec+=c*4.5; porCat[i.categoria].cus+=c;
        });
        var totRec = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].rec;},0);
        var totCus = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].cus;},0);
        var totLuc = totRec - totCus;
        var rows = Object.keys(porCat).map(function(cat) {
            var d=porCat[cat]; var luc=d.rec-d.cus; var rent=d.rec>0?(luc/d.rec*100).toFixed(1):0;
            return '<tr><td>'+cat+'</td><td>'+fmt.moeda(d.rec)+'</td>' +
                '<td>'+(totRec>0?(d.rec/totRec*100).toFixed(1):0)+'%</td>' +
                '<td>'+fmt.moeda(d.cus)+'</td><td>'+fmt.moeda(luc)+'</td>' +
                '<td style="color:#0D5B2A;font-weight:700;">'+rent+'%</td></tr>';
        }).join('');
        return backBtn('#/relatorios/receitas','Relatório Receitas') +
            topoRel('Composição da receita por categoria','Visualize a composição da receita por categoria e por período','csvComp') +
            filtros([{label:'Categoria',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Composição da receita por categoria','buscaComp') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Categoria de insumo</th><th>Receita gerada(R$)</th><th>Participação(%)</th><th>Custo utilizado(R$)</th><th>Lucro gerado(R$)</th><th>Rentabilidade</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(totRec)+'</strong></td><td><strong>100%</strong></td>' +
                '<td><strong>'+fmt.moeda(totCus)+'</strong></td><td><strong>'+fmt.moeda(totLuc)+'</strong></td>' +
                '<td><strong>'+(totRec>0?(totLuc/totRec*100).toFixed(1):0)+'%</strong></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Rentabilidade média ─────────────────────────────── */
    function renderRentabilidade() {
        var porCat = {};
        DB.insumos.forEach(function(i) {
            if (!porCat[i.categoria]) porCat[i.categoria]={rec:0,cus:0};
            var u=i.estoque*0.3; var c=i.preco*u; porCat[i.categoria].rec+=c*4.5; porCat[i.categoria].cus+=c;
        });
        var totRec = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].rec;},0);
        var totCus = Object.keys(porCat).reduce(function(s,k){return s+porCat[k].cus;},0);
        var totLuc = totRec - totCus;
        var rows = Object.keys(porCat).map(function(cat) {
            var d=porCat[cat]; var luc=d.rec-d.cus; var rent=d.rec>0?(luc/d.rec*100).toFixed(1):0;
            return '<tr><td>'+cat+'</td><td>'+fmt.moeda(d.rec)+'</td><td>'+fmt.moeda(d.cus)+'</td>' +
                '<td>'+fmt.moeda(luc)+'</td><td style="color:#0D5B2A;font-weight:700;">'+rent+'%</td></tr>';
        }).join('');
        return backBtn('#/relatorios/receitas','Relatório Receitas') +
            topoRel('Rentabilidade média','Visualize a Rentabilidade média por categoria e por período','csvRent') +
            filtros([{label:'Categoria',opts:['Todos']}]) +
            '<div class="relConteiner">' +
                topoTabela('Rentabilidade média','buscaRent') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Categoria de insumo</th><th>Receita gerada(R$)</th><th>Custo utilizado(R$)</th><th>Lucro gerado(R$)</th><th>Rentabilidade média</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td><strong>TOTAL GERAL</strong></td><td><strong>'+fmt.moeda(totRec)+'</strong></td>' +
                '<td><strong>'+fmt.moeda(totCus)+'</strong></td><td><strong>'+fmt.moeda(totLuc)+'</strong></td>' +
                '<td><strong>'+(totRec>0?(totLuc/totRec*100).toFixed(1):0)+'%</strong></td></tr></tfoot>' +
                '</table></div>';
    }

    /* ── Evolução da receita - insumos ──────────────────── */
    function renderEvolucaoReceita() {
        var rows = [];
        DB.insumos.forEach(function(i) {
            DB.producoes.slice(0,2).forEach(function(p) {
                var u=(i.estoque*0.2).toFixed(1); var c=i.preco*parseFloat(u); var rec=c*4.5; var luc=rec-c; var rent=rec>0?(luc/rec*100).toFixed(1):0;
                rows.push('<tr><td>'+fmt.data(p.data)+'</td><td>'+i.nome+'</td><td>'+i.categoria+'</td>' +
                    '<td>'+i.estoque+' '+i.unidade+'</td><td>'+u+'</td><td>'+fmt.moeda(c)+'</td>' +
                    '<td>'+fmt.moeda(i.preco)+'</td><td>'+fmt.moeda(c)+'</td><td>'+fmt.moeda(rec)+'</td>' +
                    '<td style="color:#0D5B2A;">'+fmt.moeda(luc)+'</td><td style="color:#0D5B2A;font-weight:700;">'+rent+'%</td></tr>');
            });
        });
        return backBtn('#/relatorios/receitas','Relatório Receitas') +
            topoRel('Evolução da receita - insumos','Visualize o lucratividade, margem de contribuição e rentabilidade por período','csvEvolRec') +
            filtros([{label:'Insumo',opts:['Todos'].concat(DB.insumos.map(function(i){return i.nome;}))}]) +
            '<div class="relConteiner">' +
                topoTabela('Evolução da receita - insumos','buscaEvolRec') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Data</th><th>Insumo</th><th>Categoria</th><th>Quantidade em estoque</th><th>Unidades</th><th>Custo total(R$)</th><th>Valor unitário</th><th>Valor utilizado na produção</th><th>Receita gerada(R$)</th><th>Lucro gerado(R$)</th><th>Rentabilidade</th></tr></thead>' +
                '<tbody>'+rows.join('')+'</tbody>' +
                '</table></div>';
    }

    /* ============================================================
       PRODUÇÃO
       ============================================================ */
    function renderProducaoRel() {
        var totProd = DB.producoes.reduce(function(s,p){return s+p.qtd;},0);
        var distinct = (new Set(DB.producoes.map(function(p){return p.receita;}))).size;
        var totCus = DB.producoes.reduce(function(s,p){
            var r=DB.receitas.find(function(r){return r.nome===p.receita;}); return s+(r?r.custo:0);
        },0);

        var dadosProd = DB.producoes.map(function(p){return p.qtd;});
        var dadosMais = DB.producoes.map(function(p){return p.qtd;});
        var dadosIns  = DB.insumos.map(function(i){return i.estoque*0.2;});

        var rows = DB.producoes.map(function(p) {
            var r=DB.receitas.find(function(r){return r.nome===p.receita;});
            return '<tr><td>'+fmt.data(p.data)+'</td><td>'+p.receita+'</td><td>'+p.qtd+'</td>' +
                '<td>'+p.receita+'</td><td>'+(r?fmt.moeda(r.custo):'-')+'</td>' +
                '<td>'+p.responsavel+'</td></tr>';
        }).join('');

        return topoRel('Relatórios de Produção','Análise de produção por período, receitas e insumos consumidos','csvProd',true) +
            filtros([{label:'Produto',opts:['Todos os tipos']}]) +
            '<div class="kpiGrid">' +
                kpiCard('&#127981;','verde','Produção total do período',totProd+' un.','Produção acumulada','') +
                kpiCard('&#127807;','azul','Produtos produzidos',distinct,'Receitas diferentes','') +
                kpiCard('&#128202;','laranja','Custo total da produção',fmt.moeda(totCus),'Total de custos','') +
                kpiCard('&#128230;','verde','Insumos consumidos',DB.insumos.length,'Insumos utilizados','') +
            '</div>' +
            '<div class="miniChartsGrid">' +
                miniChart('PRODUTOS TOTAL POR PERÍODO',null,barChart(dadosProd),'csvProdT') +
                miniChart('PRODUTOS MAIS PRODUZIDOS',null,barChart(dadosMais,'#B9F7A8'),'csvProdM') +
                miniChart('INSUMOS CONSUMIDOS',null,lineChart(dadosIns),'csvProdI') +
            '</div>' +
            '<div class="relConteiner">' +
                topoTabela('Produtos total por período','buscaProd','csvProdD') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Data</th><th>Produto</th><th>Quantidade produzida</th><th>Receita utilizada</th><th>Custo da produção</th><th>Responsável</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '<tfoot><tr><td colspan="2"><strong>TOTAL GERAL</strong></td>' +
                '<td><strong>'+totProd+'</strong></td><td></td>' +
                '<td><strong>'+fmt.moeda(totCus)+'</strong></td><td></td></tr></tfoot>' +
                '</table></div>' +
            '<div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">' +
                '<a href="#/relatorios/producao/mais" class="btnVerde">Mais Produzidos →</a>' +
                '<a href="#/relatorios/producao/insumos" class="btnVerde">Insumos Consumidos →</a>' +
            '</div>';
    }

    /* ── Mais produzidos ────────────────────────────────── */
    function renderMaisProduzidos() {
        var totProd = DB.producoes.reduce(function(s,p){return s+p.qtd;},0);
        var porRec = {};
        DB.producoes.forEach(function(p){ if(!porRec[p.receita]) porRec[p.receita]=0; porRec[p.receita]+=p.qtd; });
        var rows = Object.keys(porRec).sort(function(a,b){return porRec[b]-porRec[a];}).map(function(nome) {
            var q=porRec[nome]; var r=DB.receitas.find(function(r){return r.nome===nome;});
            var val=r?parseFloat(r.preco)/10*q:0;
            return '<tr><td>'+nome+'</td><td>'+q+'</td><td>'+(totProd>0?(q/totProd*100).toFixed(1):0)+'%</td>' +
                '<td>'+fmt.moeda(val)+'</td><td>'+(q>0?fmt.moeda(val/q):'-')+'</td></tr>';
        }).join('');
        return backBtn('#/relatorios/producao','Relatórios de Produção') +
            topoRel('Produtos mais produzidos','Acompanhe os produtos mais produzidos no período selecionado','csvMaisProd') +
            filtros([]) +
            '<div class="relConteiner">' +
                topoTabela('Produtos mais produzidos','buscaMaisProd') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Produto</th><th>Qtd. produzida</th><th>% do total</th><th>Valor total R$</th><th>Média por unidade R$</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '</table></div>';
    }

    /* ── Insumos consumidos ─────────────────────────────── */
    function renderInsumosConsumidos() {
        var rows = DB.insumos.slice(0,5).map(function(i) {
            var u=(i.estoque*0.2).toFixed(2); var cTot=i.preco*parseFloat(u);
            return '<tr><td>'+(DB.producoes[0]?fmt.data(DB.producoes[0].data):'-')+'</td>' +
                '<td>'+i.nome+'</td><td>'+i.unidade+'</td><td>'+u+'</td>' +
                '<td>'+fmt.moeda(i.preco)+'</td><td>'+fmt.moeda(cTot)+'</td>' +
                '<td>'+(DB.producoes[0]?DB.producoes[0].receita:'-')+'</td></tr>';
        }).join('');
        return backBtn('#/relatorios/producao','Relatórios de Produção') +
            topoRel('Insumos total por período','Acompanhe os insumos consumidos na produção por período','csvInsumosC') +
            filtros([]) +
            '<div class="relConteiner">' +
                topoTabela('Insumos consumidos','buscaInsumosC') +
                '<table class="tabelaRelatorio">' +
                '<thead><tr><th>Data</th><th>Insumo</th><th>Unidade</th><th>Quantidade consumida</th><th>Custo unitário R$</th><th>Custo total R$</th><th>Utilizado em</th></tr></thead>' +
                '<tbody>'+rows+'</tbody>' +
                '</table></div>';
    }

    /* ============================================================
       RESUMO GERAL
       ============================================================ */
    function renderResumo() {
        var totFat = DB.vendas.reduce(function(s,v){return s+v.valor;},0);
        var dados = [8200,7400,9100,10500,11200,12840];
        var meses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
        var max = Math.max.apply(null,dados);
        var barras = dados.map(function(v,i) {
            return '<div class="barraItem"><div class="barra" style="height:'+Math.round(v/max*160)+'px;background:#0D5B2A;"></div><span>'+meses[i]+'</span></div>';
        }).join('');
        var cats = [{cat:'Blends de chá',qtd:380,fat:9120,pct:'71%'},{cat:'Home spray',qtd:75,fat:2625,pct:'20%'},{cat:'Acessórios',qtd:40,fat:1095,pct:'9%'}];
        var rowsCat = cats.map(function(c){ return '<tr><td>'+c.cat+'</td><td>'+c.qtd+'</td><td>'+fmt.moeda(c.fat)+'</td><td>'+c.pct+'</td></tr>'; }).join('');
        return '<h1 class="tituloPagina">Resumo Geral</h1>' +
            '<p class="subtituloPagina">Visão consolidada do negócio.</p>' +
            '<div class="kpiGrid">' +
                kpiCard('&#128200;','verde','Faturamento',fmt.moeda(totFat),'','') +
                kpiCard('&#128230;','azul','Produtos em estoque',DB.produtos.reduce(function(s,p){return s+p.estoque;},0),'','') +
                kpiCard('&#127807;','verde','Receitas',DB.receitas.length,'','') +
                kpiCard('&#127981;','laranja','Produções',DB.producoes.length,'','') +
            '</div>' +
            '<div class="linhaDashboard" style="margin-top:20px;">' +
                '<div class="cardDashboard"><h2 class="tituloTabela" style="margin:0 0 16px 0;">Faturamento mensal (R$)</h2><div class="graficoBarras">'+barras+'</div></div>' +
                '<div class="cardDashboard" style="background:#DDF7C9;"><h3 style="margin:0 0 14px 0;color:#0D4B24;font-size:14px;">Destaques</h3>' +
                '<div class="linhaResumo"><span>Produto mais vendido</span><strong>Blend Felicita</strong></div>' +
                '<div class="linhaResumo"><span>Receita mais produzida</span><strong>Blend Anti-estresse</strong></div>' +
                '<div class="linhaResumo"><span>Ticket médio</span><strong>'+fmt.moeda(totFat/DB.vendas.length)+'</strong></div>' +
                '<div class="linhaResumo"><span>Clientes únicos</span><strong>'+(new Set(DB.vendas.map(function(v){return v.cliente;}))).size+'</strong></div>' +
                '</div></div>' +
            '<div class="relConteiner" style="margin-top:20px;">' +
                '<h2 class="tituloTabela" style="margin:0 0 12px 0;">Consolidado por categoria</h2>' +
                '<table class="tabelaGeral"><thead><tr><th>Categoria</th><th>Qtd. vendida</th><th>Faturamento</th><th>% do total</th></tr></thead><tbody>'+rowsCat+'</tbody></table>' +
            '</div>';
    }

    /* ============================================================
       FORNECEDORES
       ============================================================ */
    function renderFornecedores() {
        var totVal = DB.fornecedores.reduce(function(s,f){return s+f.valorTotal;},0);
        var dest = DB.fornecedores.slice().sort(function(a,b){return b.valorTotal-a.valorTotal;})[0];
        var rows = DB.fornecedores.map(function(f) {
            return '<tr><td><div style="display:flex;align-items:center;gap:8px;">' +
                '<div class="avatarCircular" style="width:32px;height:32px;font-size:11px;">'+f.nome.slice(0,2).toUpperCase()+'</div>'+f.nome+'</div></td>' +
                '<td>'+f.insumos+'</td><td>'+fmt.data(f.ultimaCompra)+'</td><td>'+fmt.moeda(f.valorTotal)+'</td>' +
                '<td>'+(f.ativo?'<span class="badgeConcluido">Ativo</span>':'<span class="badgeZerado">Inativo</span>')+'</td>' +
                '<td><button class="btnAcaoEditar">&#9998;</button></td></tr>';
        }).join('');
        return topoRel('Relatórios de Fornecedores','Análise de desempenho dos fornecedores','csvForn',true) +
            filtros([]) +
            '<div class="kpiGrid">' +
                kpiCard('&#127968;','verde','Total de fornecedores',DB.fornecedores.length,'','') +
                kpiCard('&#127968;','azul','Fornecedores ativos',DB.fornecedores.filter(function(f){return f.ativo;}).length,'','') +
                kpiCard('&#128178;','verde','Total em compras',fmt.moeda(totVal),'','') +
                kpiCard('&#128230;','laranja','Insumos cadastrados',DB.insumos.length,'','') +
            '</div>' +
            '<div class="areaDoisPaineis" style="margin-top:20px;">' +
                '<div class="painelPrincipal"><div class="relConteiner">' +
                    '<div class="barraBusca"><div><h2 class="tituloTabela" style="margin:0;">Fornecedores</h2></div>' +
                        '<input type="text" id="buscaFornRel" placeholder="Buscar fornecedor..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">' +
                    '</div>' +
                    '<table class="tabelaGeral" id="tabelaFornRel"><thead><tr><th>Fornecedor</th><th>Insumos</th><th>Última compra</th><th>Valor total</th><th>Status</th><th>Ações</th></tr></thead><tbody>'+rows+'</tbody></table>' +
                '</div></div>' +
                '<div class="painelLateral"><div class="cardInfoLateral">' +
                    '<div class="topoCard"><div class="avatarCircular">'+dest.nome.slice(0,2).toUpperCase()+'</div>' +
                        '<div><h3>'+dest.nome+'</h3><span class="badgeConcluido">Destaque</span></div></div>' +
                    '<div class="itemInfoCard"><span>Insumos</span><strong>'+dest.insumos+'</strong></div>' +
                    '<div class="itemInfoCard"><span>Valor total</span><strong>'+fmt.moeda(dest.valorTotal)+'</strong></div>' +
                    '<div class="itemInfoCard"><span>Última compra</span><strong>'+fmt.data(dest.ultimaCompra)+'</strong></div>' +
                '</div></div>' +
            '</div>';
    }

    /* ============================================================
       ROUTER DO MÓDULO
       ============================================================ */
    window.Pages.relatorios = {
        render: function(path) {
            switch (path) {
                case 'hub':                      return renderHub();
                case 'vendas':                   return renderVendas();
                case 'vendas/diario':            return renderFaturamentoDiario();
                case 'vendas/categoria':         return renderFaturamentoCategoria();
                case 'vendas/pagamento':         return renderVendasPagamento();
                case 'financas':                 return renderFinancas();
                case 'financas/movimentos':      return renderEntradasSaidas();
                case 'financas/evolucao':        return renderEvolucaoFat();
                case 'margem':                   return renderMargem();
                case 'margem/analise':           return renderAnalise();
                case 'margem/evolucao':          return renderEvolucaoMargem();
                case 'margem/contribuicao':      return renderMCxReceita();
                case 'clientes':                 return renderClientesRel();
                case 'estoque':                  return renderEstoqueRel();
                case 'estoque/situacao':         return renderEstoqueSituacao();
                case 'receitas':                 return renderReceitasRel();
                case 'receitas/composicao':      return renderComposicao();
                case 'receitas/rentabilidade':   return renderRentabilidade();
                case 'receitas/evolucao':        return renderEvolucaoReceita();
                case 'producao':                 return renderProducaoRel();
                case 'producao/mais':            return renderMaisProduzidos();
                case 'producao/insumos':         return renderInsumosConsumidos();
                case 'resumo':                   return renderResumo();
                case 'fornecedores':             return renderFornecedores();
                default:                         return renderHub();
            }
        },
        init: function(path) {
            var searchMap = {
                'vendas':         ['#buscaVendasRel',    '#tabelaVendasRel tbody'],
                'vendas/diario':  ['#buscaDiario',       '#tabelaDiario tbody'],
                'clientes':       ['#buscaClientesRel',  '#tabelaClientesRel tbody'],
                'estoque':        ['#buscaInsumos',      '#tabelaInsumos tbody'],
                'receitas':       ['#buscaRecInsumos',   '#tabelaRecInsumos tbody'],
                'fornecedores':   ['#buscaFornRel',      '#tabelaFornRel tbody'],
            };
            if (searchMap[path]) CL.bindSearch(searchMap[path][0], searchMap[path][1]);

            /* CSV vendas */
            var csvV = document.getElementById('csvVendas');
            if (csvV) csvV.addEventListener('click', function() {
                csvDown(['Data','Categoria','Produto','Cliente','Qtd','Valor Un.','Total','Situação'],
                    DB.vendas.map(function(v){
                        var p=DB.produtos.find(function(p){return p.nome===v.produto;});
                        return [fmt.data(v.data),p?p.categoria:'-',v.produto,v.cliente,v.qtd,v.valor/v.qtd,v.valor,'Concluído'];
                    }), 'vendas.csv');
            });
        }
    };
})();
