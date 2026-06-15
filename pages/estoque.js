/* pages/estoque.js — Estoque de produtos e insumos */
(function () {

    function subNav(ativo) {
        return `<div style="display:flex;gap:8px;margin-bottom:24px;">
            <a href="#/estoque/produtos" style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;background:${ativo==='produtos'?'#0D5B2A':'white'};color:${ativo==='produtos'?'white':'#555'};border:1px solid ${ativo==='produtos'?'#0D5B2A':'#ddd'};">Produtos</a>
            <a href="#/estoque/insumos"  style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;background:${ativo==='insumos'?'#0D5B2A':'white'};color:${ativo==='insumos'?'white':'#555'};border:1px solid ${ativo==='insumos'?'#0D5B2A':'#ddd'};">Insumos</a>
        </div>`;
    }

    /* ======================================================
       PRODUTOS
       ====================================================== */
    function renderProdutos() {
        const { fmt } = CL;
        const statusStyle = s => ({
            normal: 'background:#e6f7ee;color:#0D5B2A;',
            baixo:  'background:#fff3e0;color:#e65c00;',
            zerado: 'background:#fde;color:#c00;',
        }[s] || '');

        const totalUn = DB.produtos.reduce((s,p) => s + p.estoque, 0);
        const totalVal = DB.produtos.reduce((s,p) => s + p.estoque * p.preco, 0);
        const ativos   = DB.produtos.filter(p => p.estoque > 0).length;
        const criticos = DB.produtos.filter(p => p.status !== 'normal').length;

        const rows = DB.produtos.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.categoria}</td>
                <td><span class="badgeAtivo" style="${statusStyle(p.status)}">${p.status}</span></td>
                <td>${fmt.moeda(p.preco)}</td>
                <td>${fmt.num(p.estoque)} ${p.unidade}</td>
                <td>${fmt.moeda(p.estoque * p.preco)}</td>
                <td>
                    <button class="btnAcaoEditar" title="Editar">&#9998;</button>
                    <button class="btnAcaoExcluir" data-nome="${p.nome}">&#128465;</button>
                </td>
            </tr>`).join('');

        return `
        <h1 class="tituloPagina">Estoque</h1>
        <p class="subtituloPagina">Acompanhe o nível de estoque dos produtos e insumos.</p>
        ${subNav('produtos')}

        <section class="cardsResumo">
            <div class="cardResumo">
                <span class="cardSubtitulo">Total de produtos</span>
                <strong class="cardNumero">${DB.produtos.length}</strong>
                <a href="#/cadastros/produtos">Gerenciar</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Produtos com estoque</span>
                <strong class="cardNumero">${ativos}</strong>
                <a href="#">Ver detalhes</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Unidades em estoque</span>
                <strong class="cardNumero">${fmt.num(totalUn)}</strong>
                <a href="#">Ver detalhes</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Valor total em estoque</span>
                <strong class="cardNumero">${fmt.moeda(totalVal)}</strong>
                <a href="#/relatorios/estoque">Ver relatório</a>
            </div>
        </section>

        <div class="conteinerTabela" style="margin-top:24px;">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Lista de produtos</h2>
                    <p class="subtituloTabela">Veja e gerencie todos os produtos</p>
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="text" id="buscaProdEst" placeholder="Buscar produto..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    <select id="filtroStatusProd" style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
                        <option value="">Todos os status</option>
                        <option value="normal">Normal</option>
                        <option value="baixo">Estoque baixo</option>
                        <option value="zerado">Zerado</option>
                    </select>
                    <a href="#/cadastros/produtos" class="btnVerde">+ Novo produto</a>
                </div>
            </div>
            <table class="tabelaGeral" id="tabelaEstoqueProd">
                <thead><tr><th>Produto</th><th>Categoria</th><th>Status</th><th>Preço venda</th><th>Estoque</th><th>Valor total</th><th>Ações</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    /* ======================================================
       INSUMOS
       ====================================================== */
    function renderInsumos() {
        const { fmt } = CL;
        const statusStyle = s => ({
            normal:   'background:#e6f7ee;color:#0D5B2A;',
            baixo:    'background:#fff3e0;color:#e65c00;',
            'crítico':'background:#fde;color:#c00;',
        }[s] || '');

        const rows = DB.insumos.map(i => `
            <tr>
                <td>${i.nome}</td>
                <td>${i.categoria}</td>
                <td>${i.fornecedor}</td>
                <td><span class="badgeAtivo" style="${statusStyle(i.status)}">${i.status}</span></td>
                <td>${fmt.moeda(i.preco)}</td>
                <td>${i.estoque} ${i.unidade}</td>
                <td>${fmt.moeda(i.estoque * i.preco)}</td>
                <td>
                    <button class="btnAcaoEditar">&#9998;</button>
                    <button class="btnAcaoExcluir" data-nome="${i.nome}">&#128465;</button>
                </td>
            </tr>`).join('');

        const totalVal = DB.insumos.reduce((s,i) => s + i.estoque * i.preco, 0);
        const criticos = DB.insumos.filter(i => i.status !== 'normal');

        return `
        <h1 class="tituloPagina">Estoque</h1>
        <p class="subtituloPagina">Acompanhe o nível de estoque dos produtos e insumos.</p>
        ${subNav('insumos')}

        <section class="cardsResumo">
            <div class="cardResumo">
                <span class="cardSubtitulo">Total de insumos</span>
                <strong class="cardNumero">${DB.insumos.length}</strong>
                <a href="#/cadastros/insumos">Gerenciar</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Insumos normais</span>
                <strong class="cardNumero">${DB.insumos.filter(i=>i.status==='normal').length}</strong>
                <a href="#">Ver detalhes</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Em alerta / crítico</span>
                <strong class="cardNumero" style="color:#e53e3e;">${criticos.length}</strong>
                <a href="#">Ver lista</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Valor total em estoque</span>
                <strong class="cardNumero">${fmt.moeda(totalVal)}</strong>
                <a href="#/relatorios/estoque">Ver relatório</a>
            </div>
        </section>

        <div class="conteinerTabela" style="margin-top:24px;">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Lista de insumos</h2>
                    <p class="subtituloTabela">Matérias-primas utilizadas na produção</p>
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="text" id="buscaInsEst" placeholder="Buscar insumo..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    <a href="#/cadastros/insumos" class="btnVerde">+ Novo insumo</a>
                </div>
            </div>
            <table class="tabelaGeral" id="tabelaEstoqueIns">
                <thead><tr><th>Insumo</th><th>Categoria</th><th>Fornecedor</th><th>Status</th><th>Preço/un.</th><th>Estoque</th><th>Valor total</th><th>Ações</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    /* ======================================================
       MÓDULO EXPORTADO
       ====================================================== */
    window.Pages.estoque = {
        render(sub) {
            return sub === 'insumos' ? renderInsumos() : renderProdutos();
        },
        init(sub) {
            const { $, $$, bindSearch } = CL;

            if (sub === 'insumos') {
                bindSearch('#buscaInsEst', '#tabelaEstoqueIns tbody');
            } else {
                bindSearch('#buscaProdEst', '#tabelaEstoqueProd tbody');
                const filtro = $('#filtroStatusProd');
                const tbody  = document.querySelector('#tabelaEstoqueProd tbody');
                if (filtro && tbody) {
                    filtro.addEventListener('change', () => {
                        const val = filtro.value;
                        $$('tr', tbody).forEach(tr => {
                            tr.style.display = (!val || tr.textContent.toLowerCase().includes(val)) ? '' : 'none';
                        });
                    });
                }
            }

            $$('[data-nome]').forEach(btn => {
                btn.addEventListener('click', () => {
                    CL.abrirModal(`
                        <div class="iconeModal" style="background:#ffe0e0;">&#128465;</div>
                        <h3>Excluir item</h3>
                        <p style="color:#555;font-size:14px;">Excluir <strong>${btn.dataset.nome}</strong> do estoque?</p>
                        <div class="alertaModal">&#9888; Esta ação não pode ser desfeita.</div>
                        <div class="botoesModal">
                            <button class="btnVoltar" onclick="CL.fecharModal()">Cancelar</button>
                            <button style="background:red;color:white;border:none;padding:9px 16px;border-radius:6px;cursor:pointer;" onclick="CL.fecharModal()">Excluir</button>
                        </div>`);
                });
            });
        }
    };

})();
