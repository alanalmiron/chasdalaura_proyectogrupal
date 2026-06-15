/* pages/cadastros.js — Todos os cadastros */
(function () {

    function subNav(ativo) {
        const tabs = [
            ['clientes',    'Clientes'],
            ['fornecedores','Fornecedores'],
            ['insumos',     'Insumos'],
            ['produtos',    'Produtos'],
            ['receitas',    'Receitas'],
            ['parceiros',   'Parceiros'],
        ];
        return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;">
            ${tabs.map(([k,l]) => `
                <a href="#/cadastros/${k}"
                   style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;
                          background:${ativo===k?'#0D5B2A':'white'};
                          color:${ativo===k?'white':'#555'};
                          border:1px solid ${ativo===k?'#0D5B2A':'#ddd'};">${l}</a>`
            ).join('')}
        </div>`;
    }

    /* ---- toggle Lista/Cards ---- */
    function botoesVista(pagina) {
        return `
        <div style="display:flex;gap:6px;">
            <button class="btnToggleView ativo" id="btnVista_lista_${pagina}" title="Lista">&#9776; Lista</button>
            <button class="btnToggleView" id="btnVista_cards_${pagina}" title="Cards">&#9633; Cards</button>
        </div>`;
    }

    function bindVista(pagina, listaId, cardsId) {
        const btnL = document.getElementById(`btnVista_lista_${pagina}`);
        const btnC = document.getElementById(`btnVista_cards_${pagina}`);
        const lista = document.getElementById(listaId);
        const cards = document.getElementById(cardsId);
        if (!btnL || !btnC) return;
        btnL.addEventListener('click', () => {
            lista.style.display = '';
            cards.style.display = 'none';
            btnL.classList.add('ativo'); btnC.classList.remove('ativo');
        });
        btnC.addEventListener('click', () => {
            lista.style.display = 'none';
            cards.style.display = '';
            btnL.classList.remove('ativo'); btnC.classList.add('ativo');
        });
    }

    /* ---- modal editar genérico ---- */
    function abrirModalEditar(html) {
        const cont = document.getElementById('modalConteudo');
        if (cont) cont.classList.add('modalLargo');
        CL.abrirModal(html);
        if (cont) cont.addEventListener('transitionend', () => {}, { once: true });
    }
    function fecharModalEditar() {
        const cont = document.getElementById('modalConteudo');
        if (cont) cont.classList.remove('modalLargo');
        CL.fecharModal();
    }

    /* ---- modal excluir detalhado ---- */
    function modalExcluirDetalhado({ col, id, nome, tipo, linhas }) {
        const linhasHtml = linhas.map(l => `
            <div class="infoLinha" style="font-size:12px;color:#555;display:flex;gap:5px;align-items:flex-start;">
                <span>${l.icon}</span><span>${l.texto}</span>
            </div>`).join('');
        return `
        <div class="iconeModal" style="background:#ffe0e0;font-size:28px;">&#128465;</div>
        <h3 style="margin:8px 0 4px;">Excluir ${tipo}</h3>
        <p style="color:#777;font-size:13px;margin:0 0 12px;">Tem certeza que deseja excluir este ${tipo}?<br>Esta ação não pode ser desfeita.</p>
        <div class="modalExcluirDetalhe">
            <div class="cardMiniEntidade">
                <div style="width:36px;height:36px;border-radius:50%;background:#0D4B24;color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">${nome.slice(0,2).toUpperCase()}</div>
                <strong style="font-size:13px;">${nome}</strong>
                ${linhasHtml}
            </div>
            <div style="flex:1;">
                <div style="background:#fff3f3;border:1px solid #fecaca;border-radius:8px;padding:12px;font-size:12px;color:#c00;">
                    &#9888; Todos os dados e históricos relacionados a este ${tipo} serão permanentemente apagados do sistema.
                </div>
            </div>
        </div>
        <div class="botoesModal">
            <button class="btnVoltar" onclick="CL.fecharModal()">Cancelar</button>
            <button style="background:#e53e3e;color:white;border:none;padding:9px 20px;border-radius:6px;cursor:pointer;font-weight:600;"
                onclick="DB.remove('${col}',${id});CL.fecharModal();CL.toast('${nome} removido.');Router.navigate();">Excluir ${tipo}</button>
        </div>`;
    }

    /* ======================================================
       CLIENTES
       ====================================================== */
    function renderClientes() {
        const rows = DB.clientes.map(c => `
            <tr>
                <td><div style="display:flex;align-items:center;gap:8px;">
                    <div class="avatarCircular" style="width:32px;height:32px;font-size:11px;">${c.nome.slice(0,2).toUpperCase()}</div>
                    ${c.nome}</div></td>
                <td>${c.cpf}</td>
                <td>${c.telefone}</td>
                <td>${c.email}</td>
                <td>${c.totalCompras}</td>
                <td>${CL.fmt.moeda(c.valorTotal)}</td>
                <td>
                    <button class="btnAcaoEditar btnEditarEntidade" data-col="clientes" data-id="${c.id}" title="Editar">&#9998;</button>
                    <button class="btnAcaoExcluir btnExcluirEntidade" data-col="clientes" data-id="${c.id}" data-nome="${c.nome}" data-tipo="cliente" data-info='${JSON.stringify({telefone:c.telefone,email:c.email})}'>&#128465;</button>
                </td>
            </tr>`).join('');

        const cardsHtml = DB.clientes.map(c => `
            <div class="cardEntidade">
                <div class="avatarTopo">${c.nome.slice(0,2).toUpperCase()}</div>
                <p class="nomeCard">${c.nome}</p>
                <div class="infoCard">&#128222; ${c.telefone}</div>
                <div class="infoCard">&#9993; ${c.email}</div>
                <div class="infoCard">&#128203; ${c.cpf}</div>
                <div class="acoesCard">
                    <button class="btnEditarEntidade" data-col="clientes" data-id="${c.id}" title="Editar">&#9998; Editar</button>
                    <button class="btnExcluirEntidade" data-col="clientes" data-id="${c.id}" data-nome="${c.nome}" data-tipo="cliente" data-info='${JSON.stringify({telefone:c.telefone,email:c.email})}'>&#128465;</button>
                </div>
            </div>`).join('');

        return `
        <h1 class="tituloPagina">Cadastros</h1>
        <p class="subtituloPagina">Gerencie clientes, fornecedores, insumos, produtos, receitas e parceiros.</p>
        ${subNav('clientes')}
        <div class="conteinerTabela">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Clientes</h2>
                    <p class="subtituloTabela">Gerencie os clientes cadastrados</p>
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="text" id="buscaCliente" placeholder="Buscar cliente..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    ${botoesVista('cli')}
                    <button class="btnVerde" id="btnNovoCliente">+ Novo cliente</button>
                </div>
            </div>
            <div id="vistaListaCli">
                <table class="tabelaGeral" id="tabelaClientes">
                    <thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>E-mail</th><th>Compras</th><th>Total gasto</th><th>Ações</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div id="vistaCardsCli" style="display:none;">
                <div class="gridCards">${cardsHtml}</div>
            </div>
        </div>
        <div class="conteinerTabela" style="margin-top:20px;display:none;" id="formNovoCliente">
            <h2 class="tituloTabela" style="margin:0 0 20px 0;">Novo cliente</h2>
            <div class="linhaForm2">
                <div><label>Nome completo</label><input type="text" id="cliNome" placeholder="Digite o nome completo"></div>
                <div><label>CPF/CNPJ</label><input type="text" id="cliCpf" placeholder="000.000.000-00"></div>
            </div>
            <div class="linhaForm2">
                <div><label>Telefone</label><input type="text" id="cliTel" placeholder="(00) 00000-0000"></div>
                <div><label>E-mail</label><input type="email" id="cliEmail" placeholder="exemplo@gmail.com"></div>
            </div>
            <div class="botoesFormulario" style="margin-top:20px;">
                <button class="btnVoltar" id="btnCancelarCliente">Cancelar</button>
                <button class="btnVerde" id="btnSalvarCliente">Salvar cliente</button>
            </div>
        </div>`;
    }

    /* ======================================================
       FORNECEDORES
       ====================================================== */
    function renderFornecedores() {
        const rows = DB.fornecedores.map(f => `
            <tr>
                <td>${f.nome}</td>
                <td>${f.cnpj}</td>
                <td>${f.telefone}</td>
                <td>${f.insumos}</td>
                <td>${CL.fmt.data(f.ultimaCompra)}</td>
                <td>${CL.fmt.moeda(f.valorTotal)}</td>
                <td><span class="${f.ativo?'badgeAtivo':''}" style="${f.ativo?'':'background:#fde;color:#c00;font-size:11px;padding:2px 8px;border-radius:20px;'}">${f.ativo?'Ativo':'Inativo'}</span></td>
                <td>
                    <button class="btnAcaoEditar btnEditarEntidade" data-col="fornecedores" data-id="${f.id}" title="Editar">&#9998;</button>
                    <button class="btnAcaoExcluir btnExcluirEntidade" data-col="fornecedores" data-id="${f.id}" data-nome="${f.nome}" data-tipo="fornecedor" data-info='${JSON.stringify({telefone:f.telefone,cnpj:f.cnpj})}'>&#128465;</button>
                </td>
            </tr>`).join('');

        return `
        <h1 class="tituloPagina">Cadastros</h1>
        <p class="subtituloPagina">Gerencie clientes, fornecedores, insumos, produtos, receitas e parceiros.</p>
        ${subNav('fornecedores')}
        <div class="conteinerTabela">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Fornecedores</h2>
                    <p class="subtituloTabela">Gerencie os fornecedores de insumos</p>
                </div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="buscaForn" placeholder="Buscar..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    <button class="btnVerde" id="btnNovoForn">+ Novo fornecedor</button>
                </div>
            </div>
            <table class="tabelaGeral" id="tabelaForn">
                <thead><tr><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>Insumos</th><th>Última compra</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="conteinerTabela" id="formNovoForn" style="display:none;margin-top:20px;">
            <h2 class="tituloTabela" style="margin:0 0 20px 0;">Novo fornecedor</h2>
            <div class="linhaForm2">
                <div><label>Razão social / Nome</label><input type="text" id="fornNome" placeholder="Nome do fornecedor"></div>
                <div><label>CNPJ</label><input type="text" id="fornCnpj" placeholder="00.000.000/0001-00"></div>
            </div>
            <div class="linhaForm2">
                <div><label>Telefone</label><input type="text" id="fornTel" placeholder="(00) 00000-0000"></div>
                <div><label>E-mail</label><input type="email" id="fornEmail" placeholder="contato@fornecedor.com"></div>
            </div>
            <div class="botoesFormulario" style="margin-top:20px;">
                <button class="btnVoltar" id="btnCancelarForn">Cancelar</button>
                <button class="btnVerde" id="btnSalvarForn">Salvar fornecedor</button>
            </div>
        </div>`;
    }

    /* ======================================================
       INSUMOS
       ====================================================== */
    function renderInsumos() {
        const statusColor = { 'normal':'#0D5B2A', 'baixo':'#e65c00', 'crítico':'#e53e3e' };
        const rows = DB.insumos.map(i => `
            <tr>
                <td>${i.nome}</td>
                <td>${i.categoria}</td>
                <td>${i.fornecedor}</td>
                <td>${i.estoque} ${i.unidade}</td>
                <td>${CL.fmt.moeda(i.preco)}</td>
                <td><span class="badgeAtivo" style="background:${(statusColor[i.status]||'#888')+'22'};color:${statusColor[i.status]||'#888'};">${i.status}</span></td>
                <td>
                    <button class="btnAcaoEditar btnEditarEntidade" data-col="insumos" data-id="${i.id}">&#9998;</button>
                    <button class="btnAcaoExcluir btnExcluirEntidade" data-col="insumos" data-id="${i.id}" data-nome="${i.nome}" data-tipo="insumo" data-info='${JSON.stringify({fornecedor:i.fornecedor,estoque:i.estoque+' '+i.unidade})}'>&#128465;</button>
                </td>
            </tr>`).join('');

        return `
        <h1 class="tituloPagina">Cadastros</h1>
        <p class="subtituloPagina">Gerencie clientes, fornecedores, insumos, produtos, receitas e parceiros.</p>
        ${subNav('insumos')}
        <div class="conteinerTabela">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Insumos</h2>
                    <p class="subtituloTabela">Matérias-primas utilizadas nas receitas</p>
                </div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="buscaInsumo" placeholder="Buscar insumo..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    <button class="btnVerde" id="btnNovoInsumo">+ Novo insumo</button>
                </div>
            </div>
            <table class="tabelaGeral" id="tabelaInsumos">
                <thead><tr><th>Insumo</th><th>Categoria</th><th>Fornecedor</th><th>Estoque</th><th>Preço/un.</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="conteinerTabela" id="formNovoInsumo" style="display:none;margin-top:20px;">
            <h2 class="tituloTabela" style="margin:0 0 20px 0;">Novo insumo</h2>
            <div class="linhaForm2">
                <div><label>Nome</label><input type="text" id="insNome" placeholder="Nome do insumo"></div>
                <div><label>Categoria</label>
                    <select id="insCat"><option>Flor</option><option>Erva</option><option>Especiaria</option><option>Embalagem</option></select>
                </div>
            </div>
            <div class="linhaForm2">
                <div><label>Fornecedor</label>
                    <select id="insForn">${DB.fornecedores.map(f=>`<option>${f.nome}</option>`).join('')}</select>
                </div>
                <div><label>Unidade</label>
                    <select id="insUnidade"><option>kg</option><option>g</option><option>L</option><option>ml</option><option>und</option></select>
                </div>
            </div>
            <div class="linhaForm2">
                <div><label>Estoque inicial</label><input type="number" id="insEstoque" placeholder="0" min="0"></div>
                <div><label>Preço unitário (R$)</label><input type="number" id="insPreco" placeholder="0.00" step="0.01"></div>
            </div>
            <div class="botoesFormulario" style="margin-top:20px;">
                <button class="btnVoltar" id="btnCancelarInsumo">Cancelar</button>
                <button class="btnVerde" id="btnSalvarInsumo">Salvar insumo</button>
            </div>
        </div>`;
    }

    /* ======================================================
       PRODUTOS
       ====================================================== */
    function renderProdutos() {
        const rows = DB.produtos.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.categoria}</td>
                <td>${p.estoque} ${p.unidade}</td>
                <td>${CL.fmt.moeda(p.preco)}</td>
                <td><span class="badgeAtivo" style="background:${p.status==='normal'?'#e6f7ee':p.status==='baixo'?'#fff3e0':'#fde'};color:${p.status==='normal'?'#0D5B2A':p.status==='baixo'?'#e65c00':'#c00'};">${p.status}</span></td>
                <td>
                    <button class="btnAcaoEditar btnEditarEntidade" data-col="produtos" data-id="${p.id}">&#9998;</button>
                    <button class="btnAcaoExcluir btnExcluirEntidade" data-col="produtos" data-id="${p.id}" data-nome="${p.nome}" data-tipo="produto" data-info='${JSON.stringify({categoria:p.categoria,estoque:p.estoque+' '+p.unidade})}'>&#128465;</button>
                </td>
            </tr>`).join('');

        return `
        <h1 class="tituloPagina">Cadastros</h1>
        <p class="subtituloPagina">Gerencie clientes, fornecedores, insumos, produtos, receitas e parceiros.</p>
        ${subNav('produtos')}
        <div class="conteinerTabela">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Produtos</h2>
                    <p class="subtituloTabela">Produtos finais à venda</p>
                </div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="buscaProduto" placeholder="Buscar produto..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    <button class="btnVerde" id="btnNovoProduto">+ Novo produto</button>
                </div>
            </div>
            <table class="tabelaGeral" id="tabelaProdutos">
                <thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Preço venda</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="conteinerTabela" id="formNovoProduto" style="display:none;margin-top:20px;">
            <h2 class="tituloTabela" style="margin:0 0 20px 0;">Novo produto</h2>
            <div class="linhaForm2">
                <div><label>Nome</label><input type="text" id="prodNome" placeholder="Nome do produto"></div>
                <div><label>Categoria</label>
                    <select id="prodCat"><option>Blend</option><option>Home Spray</option><option>Acessório</option></select>
                </div>
            </div>
            <div class="linhaForm2">
                <div><label>Estoque inicial</label><input type="number" id="prodEstoque" placeholder="0" min="0"></div>
                <div><label>Unidade</label>
                    <select id="prodUnidade"><option>lata</option><option>und</option><option>kit</option><option>sachê</option></select>
                </div>
            </div>
            <div class="linhaForm2">
                <div><label>Preço de venda (R$)</label><input type="number" id="prodPreco" placeholder="0.00" step="0.01"></div>
            </div>
            <div class="botoesFormulario" style="margin-top:20px;">
                <button class="btnVoltar" id="btnCancelarProduto">Cancelar</button>
                <button class="btnVerde" id="btnSalvarProduto">Salvar produto</button>
            </div>
        </div>`;
    }

    /* ======================================================
       RECEITAS
       ====================================================== */
    function renderReceitas() {
        const cards = DB.receitas.map(r => `
            <div class="cardReceita">
                <div class="bolinhaReceita">R${r.id}</div>
                <div class="infoReceita">
                    <h3>${r.nome}</h3>
                    <p>Rendimento: ${r.rendimento}</p>
                    <p>Custo: ${CL.fmt.moeda(r.custo)}</p>
                    <p>Preço: ${CL.fmt.moeda(r.preco)}</p>
                    <p>Margem: <strong>${r.margem}</strong></p>
                </div>
                <div class="acoesReceita">
                    <button class="btnAcaoEditar btnEditarEntidade" data-col="receitas" data-id="${r.id}" title="Editar receita">&#9998;</button>
                    <button class="btnAcaoExcluir btnExcluirEntidade" data-col="receitas" data-id="${r.id}" data-nome="${r.nome}" data-tipo="receita" data-info='${JSON.stringify({rendimento:r.rendimento,margem:r.margem})}'>&#128465;</button>
                </div>
            </div>`).join('');

        return `
        <h1 class="tituloPagina">Cadastros</h1>
        <p class="subtituloPagina">Gerencie clientes, fornecedores, insumos, produtos, receitas e parceiros.</p>
        ${subNav('receitas')}
        <div class="topoCardsReceitas">
            <div>
                <h2 class="tituloTabela" style="margin:0;">Receitas cadastradas</h2>
                <p class="subtituloTabela">Fórmulas de cada blend produzido</p>
            </div>
            <button class="btnVerde" id="btnNovaReceita">+ Nova receita</button>
        </div>
        <div class="cardsReceitas">${cards}</div>
        <div class="conteinerTabela" id="formNovaReceita" style="display:none;margin-top:20px;">
            <h2 class="tituloTabela" style="margin:0 0 20px 0;">Nova receita</h2>
            <div class="linhaForm2">
                <div><label>Nome</label><input type="text" id="recNome" placeholder="Ex: Blend Relaxante"></div>
                <div><label>Rendimento</label><input type="text" id="recRendimento" placeholder="Ex: 10 latas 50g"></div>
            </div>
            <div class="linhaForm2">
                <div><label>Custo total (R$)</label><input type="number" id="recCusto" placeholder="0.00" step="0.01"></div>
                <div><label>Preço de venda (R$)</label><input type="number" id="recPreco" placeholder="0.00" step="0.01"></div>
            </div>
            <div><label>Descrição</label><textarea id="recDesc" rows="3" placeholder="Descreva os ingredientes e preparo..."></textarea></div>
            <div class="botoesFormulario" style="margin-top:20px;">
                <button class="btnVoltar" id="btnCancelarReceita">Cancelar</button>
                <button class="btnVerde" id="btnSalvarReceita">Salvar receita</button>
            </div>
        </div>`;
    }

    /* ======================================================
       PARCEIROS
       ====================================================== */
    function renderParceiros() {
        const rows = DB.parceiros.map(p => `
            <tr>
                <td><div style="display:flex;align-items:center;gap:8px;">
                    <div class="avatarCircular" style="width:32px;height:32px;font-size:11px;">${p.nome.slice(0,2).toUpperCase()}</div>
                    ${p.nome}</div></td>
                <td>${p.cnpj}</td>
                <td>${p.telefone}</td>
                <td>${p.email}</td>
                <td>${p.totalPedidos}</td>
                <td>${CL.fmt.moeda(p.valorTotal)}</td>
                <td>
                    <button class="btnAcaoEditar btnEditarEntidade" data-col="parceiros" data-id="${p.id}" title="Editar">&#9998;</button>
                    <button class="btnAcaoExcluir btnExcluirEntidade" data-col="parceiros" data-id="${p.id}" data-nome="${p.nome}" data-tipo="parceiro" data-info='${JSON.stringify({telefone:p.telefone,email:p.email})}'>&#128465;</button>
                </td>
            </tr>`).join('');

        const cardsHtml = DB.parceiros.map(p => `
            <div class="cardEntidade">
                <div class="avatarTopo">${p.nome.slice(0,2).toUpperCase()}</div>
                <p class="nomeCard">${p.nome}</p>
                <div class="infoCard">&#128222; ${p.telefone}</div>
                <div class="infoCard">&#9993; ${p.email}</div>
                <div class="infoCard">&#128203; ${p.cnpj}</div>
                <div class="infoCard">&#128201; ${p.totalPedidos} pedidos · ${CL.fmt.moeda(p.valorTotal)}</div>
                <div class="acoesCard">
                    <button class="btnEditarEntidade" data-col="parceiros" data-id="${p.id}">&#9998; Editar</button>
                    <button class="btnExcluirEntidade" data-col="parceiros" data-id="${p.id}" data-nome="${p.nome}" data-tipo="parceiro" data-info='${JSON.stringify({telefone:p.telefone,email:p.email})}'>&#128465;</button>
                </div>
            </div>`).join('');

        return `
        <h1 class="tituloPagina">Cadastros</h1>
        <p class="subtituloPagina">Gerencie clientes, fornecedores, insumos, produtos, receitas e parceiros.</p>
        ${subNav('parceiros')}
        <div class="conteinerTabela">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Parceiros</h2>
                    <p class="subtituloTabela">Revendedores e distribuidores</p>
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="text" id="buscaParceiro" placeholder="Buscar parceiro..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    ${botoesVista('par')}
                    <button class="btnVerde" id="btnNovoParceiro">+ Novo parceiro</button>
                </div>
            </div>
            <div id="vistaListaPar">
                <table class="tabelaGeral" id="tabelaParceiros">
                    <thead><tr><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>E-mail</th><th>Pedidos</th><th>Total</th><th>Ações</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div id="vistaCardsPar" style="display:none;">
                <div class="gridCards">${cardsHtml}</div>
            </div>
        </div>
        <div class="conteinerTabela" id="formNovoParceiro" style="display:none;margin-top:20px;">
            <h2 class="tituloTabela" style="margin:0 0 20px 0;">Novo parceiro</h2>
            <div class="linhaForm2">
                <div><label>Nome / Razão social</label><input type="text" id="parNome" placeholder="Nome do parceiro"></div>
                <div><label>CNPJ</label><input type="text" id="parCnpj" placeholder="00.000.000/0001-00"></div>
            </div>
            <div class="linhaForm2">
                <div><label>Telefone</label><input type="text" id="parTel" placeholder="(00) 00000-0000"></div>
                <div><label>E-mail</label><input type="email" id="parEmail" placeholder="contato@parceiro.com"></div>
            </div>
            <div class="botoesFormulario" style="margin-top:20px;">
                <button class="btnVoltar" id="btnCancelarParceiro">Cancelar</button>
                <button class="btnVerde" id="btnSalvarParceiro">Salvar parceiro</button>
            </div>
        </div>`;
    }

    /* ======================================================
       MODAL EDITAR
       ====================================================== */
    function abrirEdicao(col, id) {
        const item = DB.getById(col, id);
        if (!item) return;

        const campos = {
            clientes: [
                { id:'eNome',  label:'Nome completo', value:item.nome   },
                { id:'eCpf',   label:'CPF/CNPJ',      value:item.cpf    },
                { id:'eTel',   label:'Telefone',       value:item.telefone },
                { id:'eEmail', label:'E-mail',         value:item.email  },
            ],
            parceiros: [
                { id:'eNome',  label:'Nome / Razão social', value:item.nome   },
                { id:'eCnpj',  label:'CNPJ',               value:item.cnpj   },
                { id:'eTel',   label:'Telefone',            value:item.telefone },
                { id:'eEmail', label:'E-mail',              value:item.email  },
            ],
            fornecedores: [
                { id:'eNome',  label:'Nome / Razão social', value:item.nome   },
                { id:'eCnpj',  label:'CNPJ',               value:item.cnpj   },
                { id:'eTel',   label:'Telefone',            value:item.telefone },
            ],
            insumos: [
                { id:'eNome',     label:'Nome',      value:item.nome      },
                { id:'eCat',      label:'Categoria', value:item.categoria },
                { id:'eEstoque',  label:'Estoque',   value:item.estoque, type:'number' },
                { id:'ePreco',    label:'Preço/un.', value:item.preco,   type:'number' },
            ],
            produtos: [
                { id:'eNome',    label:'Nome',      value:item.nome      },
                { id:'eCat',     label:'Categoria', value:item.categoria },
                { id:'eEstoque', label:'Estoque',   value:item.estoque,  type:'number' },
                { id:'ePreco',   label:'Preço venda', value:item.preco, type:'number' },
            ],
            receitas: [
                { id:'eNome',       label:'Nome',          value:item.nome       },
                { id:'eRendimento', label:'Rendimento',    value:item.rendimento  },
                { id:'eCusto',      label:'Custo (R$)',    value:item.custo,  type:'number' },
                { id:'ePreco',      label:'Preço venda (R$)', value:item.preco, type:'number' },
            ],
        };

        const labelsTipo = { clientes:'cliente', parceiros:'parceiro', fornecedores:'fornecedor', insumos:'insumo', produtos:'produto', receitas:'receita' };
        const tipo = labelsTipo[col] || col;

        const pares = campos[col] || [];
        const metade = Math.ceil(pares.length / 2);
        const linhasForm = [];
        for (let i = 0; i < pares.length; i += 2) {
            const a = pares[i], b = pares[i+1];
            linhasForm.push(`<div class="linhaForm2">
                <div><label>${a.label}</label><input type="${a.type||'text'}" id="${a.id}" value="${a.value||''}"></div>
                ${b ? `<div><label>${b.label}</label><input type="${b.type||'text'}" id="${b.id}" value="${b.value||''}"></div>` : '<div></div>'}
            </div>`);
        }

        /* painel lateral — info atual */
        const nomeExib = item.nome || item.nome;
        const infoLinhas = col === 'clientes' || col === 'parceiros' || col === 'fornecedores'
            ? `<div class="infoLinha">&#128222; ${item.telefone||'—'}</div>
               <div class="infoLinha">&#9993; ${item.email||item.cnpj||'—'}</div>`
            : col === 'receitas'
            ? `<div class="infoLinha">Rendimento: ${item.rendimento}</div>
               <div class="infoLinha">Custo: ${CL.fmt.moeda(item.custo)}</div>
               <div class="infoLinha">Margem: <strong>${item.margem}</strong></div>`
            : `<div class="infoLinha">Estoque: ${item.estoque} ${item.unidade||''}</div>
               <div class="infoLinha">Preço: ${CL.fmt.moeda(item.preco)}</div>`;

        const resumoHtml = col === 'clientes'
            ? `<div class="resumoCard">
                <h4>Resumo do cliente</h4>
                <div class="linhaResumo"><span>Total de compras</span><strong>${item.totalCompras||0}</strong></div>
                <div class="linhaResumo"><span>Total gasto</span><strong>${CL.fmt.moeda(item.valorTotal||0)}</strong></div>
               </div>`
            : col === 'parceiros'
            ? `<div class="resumoCard">
                <h4>Resumo do parceiro</h4>
                <div class="linhaResumo"><span>Total de pedidos</span><strong>${item.totalPedidos||0}</strong></div>
                <div class="linhaResumo"><span>Total em compras</span><strong>${CL.fmt.moeda(item.valorTotal||0)}</strong></div>
               </div>`
            : col === 'receitas'
            ? `<div class="resumoCard">
                <h4>Resumo da receita</h4>
                <div class="linhaResumo"><span>Custo total</span><strong>${CL.fmt.moeda(item.custo)}</strong></div>
                <div class="linhaResumo"><span>Preço de venda</span><strong>${CL.fmt.moeda(item.preco)}</strong></div>
                <div class="linhaResumo"><span>Margem</span><strong>${item.margem}</strong></div>
                <div class="linhaResumo"><span>Status</span><strong style="color:#0D5B2A;">Disponível</strong></div>
               </div>`
            : '';

        const html = `
        <div class="modalDoisPaineis">
            <div class="modalPainelForm">
                <h3 style="margin:0 0 4px;">Editar ${tipo}</h3>
                <p style="color:#777;font-size:13px;margin:0 0 20px;">Modifique as informações do ${tipo}</p>
                ${linhasForm.join('')}
                <div class="botoesModal" style="justify-content:flex-end;margin-top:20px;">
                    <button class="btnVoltar" onclick="document.getElementById('modalConteudo').classList.remove('modalLargo');CL.fecharModal();">Cancelar</button>
                    <button class="btnVerde" id="btnSalvarEdicao">&#10003; Salvar alterações</button>
                </div>
            </div>
            <div class="modalPainelInfo">
                <div class="cardInfoEntidade">
                    <div class="avatarGrande">${nomeExib.slice(0,2).toUpperCase()}</div>
                    <div class="nomeEntidade">${nomeExib}</div>
                    <span class="badgeAtivo" style="width:fit-content;">Ativo</span>
                    ${infoLinhas}
                </div>
                ${resumoHtml}
                <button class="btnExcluirVermelho" onclick="
                    const c='${col}';const iid=${id};const n='${item.nome.replace(/'/g,'\\\'') }';
                    document.getElementById('modalConteudo').classList.remove('modalLargo');
                    CL.fecharModal();
                    setTimeout(()=>{DB.remove(c,iid);CL.toast(n+' removido.');Router.navigate();},200);
                ">&#128465; Excluir ${tipo}</button>
            </div>
        </div>`;

        abrirModalEditar(html);

        /* bind salvar */
        setTimeout(() => {
            document.getElementById('btnSalvarEdicao')?.addEventListener('click', () => {
                const changes = {};
                pares.forEach(f => {
                    const el = document.getElementById(f.id);
                    if (!el) return;
                    const chave = f.label === 'Nome completo' || f.label === 'Nome / Razão social' || f.label === 'Nome' ? 'nome'
                        : f.id === 'eCpf' ? 'cpf'
                        : f.id === 'eCnpj' ? 'cnpj'
                        : f.id === 'eTel' ? 'telefone'
                        : f.id === 'eEmail' ? 'email'
                        : f.id === 'eCat' ? 'categoria'
                        : f.id === 'eEstoque' ? 'estoque'
                        : f.id === 'ePreco' ? 'preco'
                        : f.id === 'eCusto' ? 'custo'
                        : f.id === 'eRendimento' ? 'rendimento'
                        : f.id.replace('e','').toLowerCase();
                    changes[chave] = f.type === 'number' ? parseFloat(el.value)||0 : el.value;
                });

                /* recalc status para insumos/produtos */
                if (col === 'insumos') {
                    const e = parseFloat(changes.estoque)||0;
                    changes.status = e === 0 ? 'crítico' : e < 1 ? 'baixo' : 'normal';
                }
                if (col === 'produtos') {
                    const e = parseInt(changes.estoque)||0;
                    changes.status = e === 0 ? 'zerado' : e <= 5 ? 'baixo' : 'normal';
                }
                if (col === 'receitas') {
                    const c = parseFloat(changes.custo)||0;
                    const p = parseFloat(changes.preco)||0;
                    changes.margem = p > 0 ? Math.round((1 - c/p)*100)+'%' : '0%';
                }

                DB.update(col, id, changes);
                document.getElementById('modalConteudo').classList.remove('modalLargo');
                CL.fecharModal();
                CL.toast('Alterações salvas!');
                Router.navigate();
            });
        }, 50);
    }

    /* ======================================================
       HELPERS DE INIT
       ====================================================== */
    function toggleForm(btnId, formId, cancelId) {
        const btn = document.getElementById(btnId);
        const form = document.getElementById(formId);
        const cancel = document.getElementById(cancelId);
        if (btn && form) btn.addEventListener('click', () => { form.style.display = form.style.display === 'none' ? 'block' : 'none'; });
        if (cancel && form) cancel.addEventListener('click', () => { form.style.display = 'none'; });
    }

    function bindBotoesAcao() {
        /* editar */
        document.querySelectorAll('.btnEditarEntidade[data-col]').forEach(btn => {
            btn.addEventListener('click', () => {
                abrirEdicao(btn.dataset.col, parseInt(btn.dataset.id));
            });
        });
        /* excluir */
        document.querySelectorAll('.btnExcluirEntidade[data-col]').forEach(btn => {
            btn.addEventListener('click', () => {
                const { nome, tipo, col, id } = btn.dataset;
                let extra = {};
                try { extra = JSON.parse(btn.dataset.info || '{}'); } catch(e) {}
                const linhas = Object.entries(extra).map(([k,v]) => ({
                    icon: k === 'telefone' ? '📞' : k === 'email' ? '✉️' : k === 'cnpj' ? '🏢' : k === 'estoque' || k === 'rendimento' ? '📦' : '📌',
                    texto: v,
                }));
                CL.abrirModal(modalExcluirDetalhado({ col, id: parseInt(id), nome, tipo, linhas }));
            });
        });
    }

    /* ======================================================
       MÓDULO EXPORTADO
       ====================================================== */
    window.Pages.cadastros = {
        render(sub) {
            switch (sub) {
                case 'fornecedores': return renderFornecedores();
                case 'insumos':      return renderInsumos();
                case 'produtos':     return renderProdutos();
                case 'receitas':     return renderReceitas();
                case 'parceiros':    return renderParceiros();
                default:             return renderClientes();
            }
        },

        init(sub) {
            const { bindSearch } = CL;

            const buscaMap = {
                clientes:    ['#buscaCliente',  '#tabelaClientes tbody'],
                fornecedores:['#buscaForn',      '#tabelaForn tbody'],
                insumos:     ['#buscaInsumo',    '#tabelaInsumos tbody'],
                produtos:    ['#buscaProduto',   '#tabelaProdutos tbody'],
                parceiros:   ['#buscaParceiro',  '#tabelaParceiros tbody'],
            };
            if (buscaMap[sub]) bindSearch(...buscaMap[sub]);

            bindBotoesAcao();

            if (sub === 'clientes' || !sub) {
                bindVista('cli', 'vistaListaCli', 'vistaCardsCli');
                toggleForm('btnNovoCliente', 'formNovoCliente', 'btnCancelarCliente');
                document.getElementById('btnSalvarCliente')?.addEventListener('click', () => {
                    const nome = document.getElementById('cliNome')?.value.trim();
                    if (!nome) { CL.toast('Informe o nome do cliente.', 'erro'); return; }
                    DB.add('clientes', {
                        nome,
                        cpf:         document.getElementById('cliCpf')?.value.trim() || '—',
                        telefone:    document.getElementById('cliTel')?.value.trim() || '—',
                        email:       document.getElementById('cliEmail')?.value.trim() || '—',
                        totalCompras: 0, valorTotal: 0,
                    });
                    CL.toast('Cliente salvo!');
                    Router.navigate();
                });
            }

            if (sub === 'fornecedores') {
                toggleForm('btnNovoForn', 'formNovoForn', 'btnCancelarForn');
                document.getElementById('btnSalvarForn')?.addEventListener('click', () => {
                    const nome = document.getElementById('fornNome')?.value.trim();
                    if (!nome) { CL.toast('Informe o nome do fornecedor.', 'erro'); return; }
                    DB.add('fornecedores', {
                        nome,
                        cnpj:     document.getElementById('fornCnpj')?.value.trim() || '—',
                        telefone: document.getElementById('fornTel')?.value.trim() || '—',
                        insumos:  0, ultimaCompra: new Date().toISOString().slice(0,10),
                        valorTotal: 0, ativo: true,
                    });
                    CL.toast('Fornecedor salvo!');
                    Router.navigate();
                });
            }

            if (sub === 'insumos') {
                toggleForm('btnNovoInsumo', 'formNovoInsumo', 'btnCancelarInsumo');
                document.getElementById('btnSalvarInsumo')?.addEventListener('click', () => {
                    const nome = document.getElementById('insNome')?.value.trim();
                    if (!nome) { CL.toast('Informe o nome do insumo.', 'erro'); return; }
                    const estoque = parseFloat(document.getElementById('insEstoque')?.value) || 0;
                    DB.add('insumos', {
                        nome,
                        categoria:  document.getElementById('insCat')?.value || 'Erva',
                        fornecedor: document.getElementById('insForn')?.value || '—',
                        unidade:    document.getElementById('insUnidade')?.value || 'kg',
                        estoque,
                        preco:      parseFloat(document.getElementById('insPreco')?.value) || 0,
                        status:     estoque === 0 ? 'crítico' : estoque < 1 ? 'baixo' : 'normal',
                    });
                    CL.toast('Insumo salvo!');
                    Router.navigate();
                });
            }

            if (sub === 'produtos') {
                toggleForm('btnNovoProduto', 'formNovoProduto', 'btnCancelarProduto');
                document.getElementById('btnSalvarProduto')?.addEventListener('click', () => {
                    const nome = document.getElementById('prodNome')?.value.trim();
                    if (!nome) { CL.toast('Informe o nome do produto.', 'erro'); return; }
                    const estoque = parseInt(document.getElementById('prodEstoque')?.value) || 0;
                    DB.add('produtos', {
                        nome,
                        categoria: document.getElementById('prodCat')?.value || 'Blend',
                        unidade:   document.getElementById('prodUnidade')?.value || 'lata',
                        estoque,
                        preco:     parseFloat(document.getElementById('prodPreco')?.value) || 0,
                        status:    estoque === 0 ? 'zerado' : estoque <= 5 ? 'baixo' : 'normal',
                    });
                    CL.toast('Produto salvo!');
                    Router.navigate();
                });
            }

            if (sub === 'receitas') {
                toggleForm('btnNovaReceita', 'formNovaReceita', 'btnCancelarReceita');
                document.getElementById('btnSalvarReceita')?.addEventListener('click', () => {
                    const nome = document.getElementById('recNome')?.value.trim();
                    if (!nome) { CL.toast('Informe o nome da receita.', 'erro'); return; }
                    const custo = parseFloat(document.getElementById('recCusto')?.value) || 0;
                    const preco = parseFloat(document.getElementById('recPreco')?.value) || 0;
                    DB.add('receitas', {
                        nome,
                        rendimento: document.getElementById('recRendimento')?.value.trim() || '—',
                        custo, preco,
                        margem: preco > 0 ? Math.round((1 - custo/preco)*100)+'%' : '0%',
                    });
                    CL.toast('Receita salva!');
                    Router.navigate();
                });
            }

            if (sub === 'parceiros') {
                bindVista('par', 'vistaListaPar', 'vistaCardsPar');
                toggleForm('btnNovoParceiro', 'formNovoParceiro', 'btnCancelarParceiro');
                document.getElementById('btnSalvarParceiro')?.addEventListener('click', () => {
                    const nome = document.getElementById('parNome')?.value.trim();
                    if (!nome) { CL.toast('Informe o nome do parceiro.', 'erro'); return; }
                    DB.add('parceiros', {
                        nome,
                        cnpj:        document.getElementById('parCnpj')?.value.trim() || '—',
                        telefone:    document.getElementById('parTel')?.value.trim() || '—',
                        email:       document.getElementById('parEmail')?.value.trim() || '—',
                        totalPedidos: 0, valorTotal: 0,
                    });
                    CL.toast('Parceiro salvo!');
                    Router.navigate();
                });
            }
        }
    };

})();
