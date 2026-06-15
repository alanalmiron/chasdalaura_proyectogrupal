/* pages/relatorios.js — Todos os relatórios */
(function () {

    function subNav(ativo) {
        const tabs = [
            ['vendas',      'Vendas'],
            ['receitas',    'Receitas'],
            ['estoque',     'Estoque'],
            ['resumo',      'Resumo Geral'],
            ['fornecedores','Fornecedores'],
        ];
        return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;">
            ${tabs.map(([k,l]) => `
                <a href="#/relatorios/${k}"
                   style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;
                          background:${ativo===k?'#0D5B2A':'white'};
                          color:${ativo===k?'white':'#555'};
                          border:1px solid ${ativo===k?'#0D5B2A':'#ddd'};">${l}</a>`
            ).join('')}
        </div>`;
    }

    function filtrosPeriodo(id) {
        return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:20px;">
            <label style="font-size:13px;font-weight:600;">Período:</label>
            <input type="date" style="padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
            <span style="font-size:13px;color:#555;">até</span>
            <input type="date" style="padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
            <button class="btnVerde" id="${id}">Filtrar</button>
            <button class="btnVoltar">Limpar</button>
        </div>`;
    }

    /* ======================================================
       VENDAS
       ====================================================== */
    function renderVendas() {
        const { fmt } = CL;
        const total = DB.vendas.reduce((s,v) => s+v.valor, 0);
        const rows = DB.vendas.map(v => `
            <tr>
                <td>${fmt.data(v.data)}</td>
                <td>${v.produto}</td>
                <td>${v.cliente}</td>
                <td>${v.qtd}</td>
                <td>${fmt.moeda(v.valor/v.qtd)}</td>
                <td>${fmt.moeda(v.valor)}</td>
                <td><span class="${v.tipo==='Cliente'?'tagCriacao':'tagAtualizacao'}">${v.tipo}</span></td>
            </tr>`).join('');

        const barras = (() => {
            const dados = [8200,7400,9100,10500,11200,12840];
            const meses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
            const max   = Math.max(...dados);
            return dados.map((v,i) => `
                <div class="barraItem">
                    <div class="barra" style="height:${Math.round(v/max*160)}px;background:#0D5B2A;" title="${fmt.moeda(v)}"></div>
                    <span>${meses[i]}</span>
                </div>`).join('');
        })();

        return `
        <h1 class="tituloPagina">Relatórios</h1>
        <p class="subtituloPagina">Análises detalhadas de vendas, estoque, receitas e fornecedores.</p>
        ${subNav('vendas')}
        ${filtrosPeriodo('btnFiltrarVendas')}

        <section class="cardsResumo">
            <div class="cardResumo">
                <span class="cardSubtitulo">Total de vendas</span>
                <strong class="cardNumero">${DB.vendas.length}</strong>
                <a href="#">Ver detalhes</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Faturamento</span>
                <strong class="cardNumero">${fmt.moeda(total)}</strong>
                <a href="#">Ver detalhes</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Ticket médio</span>
                <strong class="cardNumero">${fmt.moeda(total/DB.vendas.length)}</strong>
                <a href="#">Ver detalhes</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Clientes atendidos</span>
                <strong class="cardNumero">${new Set(DB.vendas.map(v=>v.cliente)).size}</strong>
                <a href="#">Ver clientes</a>
            </div>
        </section>

        <div class="linhaDashboard" style="margin-top:24px;">
            <div class="cardDashboard">
                <h2 class="tituloTabela" style="margin:0 0 16px 0;">Faturamento mensal (R$)</h2>
                <div class="graficoBarras">${barras}</div>
            </div>
            <div class="cardDashboard" style="background:#DDF7C9;">
                <h3 style="margin:0 0 14px 0;color:#0D4B24;font-size:14px;">Vendas por tipo</h3>
                <div class="linhaResumo">
                    <span>Clientes diretos</span>
                    <strong>${DB.vendas.filter(v=>v.tipo==='Cliente').length} vendas</strong>
                </div>
                <div class="linhaResumo">
                    <span>Parceiros</span>
                    <strong>${DB.vendas.filter(v=>v.tipo==='Parceiro').length} vendas</strong>
                </div>
                <div class="linhaResumo" style="margin-top:12px;padding-top:12px;border-top:1px solid #c8f0b0;">
                    <span><strong>Total</strong></span>
                    <strong>${fmt.moeda(total)}</strong>
                </div>
            </div>
        </div>

        <div class="conteinerTabela" style="margin-top:24px;">
            <div class="barraBusca">
                <div><h2 class="tituloTabela" style="margin:0;">Detalhamento de vendas</h2></div>
                <input type="text" id="buscaVendas" placeholder="Buscar..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
            </div>
            <table class="tabelaGeral" id="tabelaVendasRel">
                <thead><tr><th>Data</th><th>Produto</th><th>Cliente/Parceiro</th><th>Qtd.</th><th>Valor un.</th><th>Total</th><th>Tipo</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    /* ======================================================
       RECEITAS (relatório)
       ====================================================== */
    function renderReceitas() {
        const { fmt } = CL;
        const rows = DB.receitas.map(r => `
            <tr>
                <td>${r.nome}</td>
                <td>${r.rendimento}</td>
                <td>${fmt.moeda(r.custo)}</td>
                <td>${fmt.moeda(parseFloat(r.preco))}</td>
                <td>${fmt.moeda(parseFloat(r.preco) - r.custo)}</td>
                <td><strong style="color:#0D5B2A;">${r.margem}</strong></td>
            </tr>`).join('');

        return `
        <h1 class="tituloPagina">Relatórios</h1>
        <p class="subtituloPagina">Análises detalhadas de vendas, estoque, receitas e fornecedores.</p>
        ${subNav('receitas')}

        <div class="conteinerTabela">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Análise de Receitas</h2>
                    <p class="subtituloTabela">Custo, preço e margem de cada receita</p>
                </div>
                <input type="text" id="buscaRecRel" placeholder="Buscar receita..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
            </div>
            <table class="tabelaGeral" id="tabelaReceitasRel">
                <thead><tr><th>Receita</th><th>Rendimento</th><th>Custo total</th><th>Preço venda</th><th>Lucro</th><th>Margem</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    /* ======================================================
       ESTOQUE (relatório)
       ====================================================== */
    function renderEstoque() {
        const { fmt } = CL;
        const rowsProd = DB.produtos.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.categoria}</td>
                <td>${p.estoque} ${p.unidade}</td>
                <td>${fmt.moeda(p.preco)}</td>
                <td>${fmt.moeda(p.estoque * p.preco)}</td>
                <td><span class="badgeAtivo" style="background:${p.status==='normal'?'#e6f7ee':p.status==='baixo'?'#fff3e0':'#fde'};color:${p.status==='normal'?'#0D5B2A':p.status==='baixo'?'#e65c00':'#c00'};">${p.status}</span></td>
            </tr>`).join('');

        const rowsIns = DB.insumos.map(i => `
            <tr>
                <td>${i.nome}</td>
                <td>${i.categoria}</td>
                <td>${i.estoque} ${i.unidade}</td>
                <td>${fmt.moeda(i.preco)}</td>
                <td>${fmt.moeda(i.estoque * i.preco)}</td>
                <td><span class="badgeAtivo" style="background:${i.status==='normal'?'#e6f7ee':i.status==='baixo'?'#fff3e0':'#fde'};color:${i.status==='normal'?'#0D5B2A':i.status==='baixo'?'#e65c00':'#c00'};">${i.status}</span></td>
            </tr>`).join('');

        const valProd = DB.produtos.reduce((s,p) => s+p.estoque*p.preco,0);
        const valIns  = DB.insumos.reduce((s,i)  => s+i.estoque*i.preco,0);

        return `
        <h1 class="tituloPagina">Relatórios</h1>
        <p class="subtituloPagina">Análises detalhadas de vendas, estoque, receitas e fornecedores.</p>
        ${subNav('estoque')}

        <section class="cardsResumo">
            <div class="cardResumo"><span class="cardSubtitulo">Valor em produtos</span><strong class="cardNumero">${fmt.moeda(valProd)}</strong><a href="#/estoque/produtos">Ver estoque</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Valor em insumos</span><strong class="cardNumero">${fmt.moeda(valIns)}</strong><a href="#/estoque/insumos">Ver estoque</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Valor total</span><strong class="cardNumero">${fmt.moeda(valProd+valIns)}</strong><a href="#">Ver detalhes</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Itens críticos</span><strong class="cardNumero" style="color:#e53e3e;">${DB.insumos.filter(i=>i.status!=='normal').length + DB.produtos.filter(p=>p.status!=='normal').length}</strong><a href="#">Ver lista</a></div>
        </section>

        <div class="conteinerTabela" style="margin-top:24px;">
            <h2 class="tituloTabela" style="margin:0 0 16px 0;">Produtos</h2>
            <table class="tabelaGeral"><thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Preço</th><th>Valor total</th><th>Status</th></tr></thead><tbody>${rowsProd}</tbody></table>
        </div>
        <div class="conteinerTabela" style="margin-top:20px;">
            <h2 class="tituloTabela" style="margin:0 0 16px 0;">Insumos</h2>
            <table class="tabelaGeral"><thead><tr><th>Insumo</th><th>Categoria</th><th>Estoque</th><th>Preço/un.</th><th>Valor total</th><th>Status</th></tr></thead><tbody>${rowsIns}</tbody></table>
        </div>`;
    }

    /* ======================================================
       RESUMO GERAL
       ====================================================== */
    function renderResumo() {
        const { fmt } = CL;
        const totalFaturamento = DB.vendas.reduce((s,v)=>s+v.valor,0);
        const barras = (() => {
            const dados = [8200,7400,9100,10500,11200,12840];
            const meses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
            const max   = Math.max(...dados);
            return dados.map((v,i) => `<div class="barraItem"><div class="barra" style="height:${Math.round(v/max*160)}px;background:#0D5B2A;"></div><span>${meses[i]}</span></div>`).join('');
        })();
        const categorias = [
            {cat:'Blends de chá', qtd:380, fat:9120, pct:'71%'},
            {cat:'Home spray',    qtd:75,  fat:2625, pct:'20%'},
            {cat:'Acessórios',    qtd:40,  fat:1095, pct:'9%' },
        ];
        const rowsCat = categorias.map(c=>`<tr><td>${c.cat}</td><td>${c.qtd}</td><td>${fmt.moeda(c.fat)}</td><td>${c.pct}</td></tr>`).join('');
        return `
        <h1 class="tituloPagina">Relatórios</h1>
        <p class="subtituloPagina">Análises detalhadas de vendas, estoque, receitas e fornecedores.</p>
        ${subNav('resumo')}

        <section class="cardsResumo">
            <div class="cardResumo"><span class="cardSubtitulo">Faturamento</span><strong class="cardNumero">${fmt.moeda(totalFaturamento)}</strong><a href="#/relatorios/vendas">Ver vendas</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Produtos em estoque</span><strong class="cardNumero">${DB.produtos.reduce((s,p)=>s+p.estoque,0)}</strong><a href="#/estoque/produtos">Ver estoque</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Receitas</span><strong class="cardNumero">${DB.receitas.length}</strong><a href="#/cadastros/receitas">Ver receitas</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Produções</span><strong class="cardNumero">${DB.producoes.length}</strong><a href="#/producao">Ver produções</a></div>
        </section>

        <div class="linhaDashboard" style="margin-top:24px;">
            <div class="cardDashboard"><h2 class="tituloTabela" style="margin:0 0 16px 0;">Faturamento mensal (R$)</h2><div class="graficoBarras">${barras}</div></div>
            <div class="cardDashboard" style="background:#DDF7C9;">
                <h3 style="margin:0 0 14px 0;color:#0D4B24;font-size:14px;">Destaques</h3>
                <div class="linhaResumo"><span>Produto mais vendido</span><strong>Blend Felicita</strong></div>
                <div class="linhaResumo"><span>Receita mais produzida</span><strong>Blend Anti-estresse</strong></div>
                <div class="linhaResumo"><span>Ticket médio</span><strong>${fmt.moeda(totalFaturamento/DB.vendas.length)}</strong></div>
                <div class="linhaResumo"><span>Clientes únicos</span><strong>${new Set(DB.vendas.map(v=>v.cliente)).size}</strong></div>
            </div>
        </div>

        <div class="conteinerTabela" style="margin-top:24px;">
            <h2 class="tituloTabela" style="margin:0 0 16px 0;">Consolidado por categoria</h2>
            <table class="tabelaGeral"><thead><tr><th>Categoria</th><th>Qtd. vendida</th><th>Faturamento</th><th>% do total</th></tr></thead><tbody>${rowsCat}</tbody></table>
        </div>`;
    }

    /* ======================================================
       FORNECEDORES (relatório)
       ====================================================== */
    function renderFornecedores() {
        const { fmt } = CL;
        const rows = DB.fornecedores.map(f => `
            <tr>
                <td><div style="display:flex;align-items:center;gap:8px;"><div class="avatarCircular" style="width:32px;height:32px;font-size:11px;">${f.nome.slice(0,2).toUpperCase()}</div>${f.nome}</div></td>
                <td>${f.insumos}</td>
                <td>${fmt.data(f.ultimaCompra)}</td>
                <td>${fmt.moeda(f.valorTotal)}</td>
                <td><span class="${f.ativo?'badgeAtivo':''}" style="${f.ativo?'':'background:#fde;color:#c00;font-size:11px;padding:2px 8px;border-radius:20px;'}">${f.ativo?'Ativo':'Inativo'}</span></td>
                <td><button class="btnAcaoEditar">&#9998;</button></td>
            </tr>`).join('');

        const totalVal = DB.fornecedores.reduce((s,f)=>s+f.valorTotal,0);
        const destaque = [...DB.fornecedores].sort((a,b)=>b.valorTotal-a.valorTotal)[0];

        return `
        <h1 class="tituloPagina">Relatórios</h1>
        <p class="subtituloPagina">Análises detalhadas de vendas, estoque, receitas e fornecedores.</p>
        ${subNav('fornecedores')}

        <section class="cardsResumo">
            <div class="cardResumo"><span class="cardSubtitulo">Total de fornecedores</span><strong class="cardNumero">${DB.fornecedores.length}</strong><a href="#/cadastros/fornecedores">Gerenciar</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Fornecedores ativos</span><strong class="cardNumero">${DB.fornecedores.filter(f=>f.ativo).length}</strong><a href="#">Ver detalhes</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Total em compras</span><strong class="cardNumero">${fmt.moeda(totalVal)}</strong><a href="#">Ver compras</a></div>
            <div class="cardResumo"><span class="cardSubtitulo">Insumos cadastrados</span><strong class="cardNumero">${DB.insumos.length}</strong><a href="#/estoque/insumos">Ver insumos</a></div>
        </section>

        <div class="areaDoisPaineis" style="margin-top:24px;">
            <div class="painelPrincipal">
                <div class="conteinerTabela">
                    <div class="barraBusca">
                        <div><h2 class="tituloTabela" style="margin:0;">Fornecedores</h2></div>
                        <input type="text" id="buscaFornRel" placeholder="Buscar..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    </div>
                    <table class="tabelaGeral" id="tabelaFornRel">
                        <thead><tr><th>Fornecedor</th><th>Insumos</th><th>Última compra</th><th>Valor total</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
            <div class="painelLateral">
                <div class="cardInfoLateral">
                    <div class="topoCard">
                        <div class="avatarCircular">${destaque.nome.slice(0,2).toUpperCase()}</div>
                        <div><h3>${destaque.nome}</h3><span class="badgeAtivo">Destaque</span></div>
                    </div>
                    <div class="itemInfoCard"><span>Insumos</span><strong>${destaque.insumos}</strong></div>
                    <div class="itemInfoCard"><span>Valor total</span><strong>${fmt.moeda(destaque.valorTotal)}</strong></div>
                    <div class="itemInfoCard"><span>Última compra</span><strong>${fmt.data(destaque.ultimaCompra)}</strong></div>
                </div>
            </div>
        </div>`;
    }

    /* ======================================================
       MÓDULO EXPORTADO
       ====================================================== */
    window.Pages.relatorios = {
        render(sub) {
            switch (sub) {
                case 'receitas':     return renderReceitas();
                case 'estoque':      return renderEstoque();
                case 'resumo':       return renderResumo();
                case 'fornecedores': return renderFornecedores();
                default:             return renderVendas();
            }
        },
        init(sub) {
            const searchMap = {
                vendas:      ['#buscaVendas',   '#tabelaVendasRel tbody'],
                receitas:    ['#buscaRecRel',   '#tabelaReceitasRel tbody'],
                fornecedores:['#buscaFornRel',  '#tabelaFornRel tbody'],
            };
            if (searchMap[sub]) CL.bindSearch(...searchMap[sub]);
        }
    };

})();
