/* pages/saidas.js — Saídas por cliente e parceiro */
(function () {

    function subNav(ativo) {
        return `<div style="display:flex;gap:8px;margin-bottom:24px;">
            <a href="#/saidas/clientes"  style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;background:${ativo==='clientes'?'#0D5B2A':'white'};color:${ativo==='clientes'?'white':'#555'};border:1px solid ${ativo==='clientes'?'#0D5B2A':'#ddd'};">Clientes</a>
            <a href="#/saidas/parceiros" style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;background:${ativo==='parceiros'?'#0D5B2A':'white'};color:${ativo==='parceiros'?'white':'#555'};border:1px solid ${ativo==='parceiros'?'#0D5B2A':'#ddd'};">Parceiros</a>
        </div>`;
    }

    function tabelaLinhas(tipo) {
        /* gera 1 linha vazia de formulário */
        const opProd = DB.produtos.map(p=>`<option value="${p.id}">${p.nome}</option>`).join('');
        const opEnt  = tipo === 'clientes'
            ? DB.clientes.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('')
            : DB.parceiros.map(p=>`<option value="${p.id}">${p.nome}</option>`).join('');
        return `
        <tr class="linhaSaida">
            <td><select class="campoProduto" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px;"><option disabled selected>Selecione o produto...</option>${opProd}</select></td>
            <td><input type="number" class="campoQtd" min="1" value="1" style="width:70px;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px;text-align:center;"></td>
            <td><select class="campoEntidade" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px;"><option disabled selected>Selecione...</option>${opEnt}</select></td>
            <td><div class="campoValorUnit" style="color:#555;font-size:13px;padding:8px;">R$ 0,00</div></td>
            <td><div class="campoValorTotal" style="font-weight:700;font-size:13px;padding:8px;">R$ 0,00</div></td>
            <td><button type="button" class="btnAcaoExcluir btnRemoverLinha" title="Remover">&#128465;</button></td>
        </tr>`;
    }

    function renderSaidas(tipo) {
        const label = tipo === 'clientes' ? 'cliente' : 'parceiro';
        const titulo = tipo === 'clientes' ? 'Saída por Cliente' : 'Saída por Parceiro';

        return `
        <h1 class="tituloPagina">Saídas</h1>
        <p class="subtituloPagina">Registre os produtos que estão saindo do estoque.</p>
        ${subNav(tipo)}

        <div class="conteinerTabela" id="formSaida">
            <h2 class="tituloTabela" style="margin:0 0 4px 0;">${titulo}</h2>
            <p class="subtituloTabela" style="margin:0 0 20px 0;">Preencha os produtos, quantidades e ${label}s</p>

            <form id="formSaidaForm">
                <table class="tabelaGeral" id="tabelaSaida">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>${tipo === 'clientes' ? 'Cliente' : 'Parceiro'}</th>
                            <th>Valor unitário</th>
                            <th>Valor total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="tbodySaida">${tabelaLinhas(tipo)}${tabelaLinhas(tipo)}</tbody>
                </table>

                <div style="margin-top:12px;">
                    <button type="button" class="btnVoltar" id="btnAdicionarLinha">+ Adicionar produto</button>
                </div>

                <div style="display:flex;justify-content:flex-end;align-items:center;gap:24px;margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <label style="font-size:13px;font-weight:600;">Desconto (%)</label>
                        <input type="number" id="campoDesconto" value="0" min="0" max="100" style="width:70px;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px;text-align:center;">
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:14px;font-weight:600;">Total final:</span>
                        <div id="totalFinal" style="background:#DDF7C9;color:#0D4B24;font-weight:700;font-size:18px;padding:8px 16px;border-radius:6px;">R$ 0,00</div>
                    </div>
                </div>

                <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
                    <button type="button" class="btnVoltar" onclick="Router.go('saidas/${tipo}')">Cancelar</button>
                    <button type="submit" class="btnVerde" id="btnCadastrarSaida">&#10003; Registrar saída</button>
                </div>
            </form>
        </div>

        <div class="conteinerTabela" style="margin-top:24px;">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Histórico de saídas — ${tipo === 'clientes' ? 'Clientes' : 'Parceiros'}</h2>
                    <p class="subtituloTabela">Registro de saídas anteriores</p>
                </div>
                <input type="text" id="buscaSaida" placeholder="Buscar..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
            </div>
            <table class="tabelaGeral" id="tabelaHistSaida">
                <thead><tr><th>Data</th><th>Produto</th><th>${tipo === 'clientes' ? 'Cliente' : 'Parceiro'}</th><th>Qtd.</th><th>Total</th></tr></thead>
                <tbody>
                    ${DB.vendas
                        .filter(v => v.tipo === (tipo === 'clientes' ? 'Cliente' : 'Parceiro'))
                        .map(v => `<tr>
                            <td>${CL.fmt.data(v.data)}</td>
                            <td>${v.produto}</td>
                            <td>${v.cliente}</td>
                            <td>${v.qtd}</td>
                            <td>${CL.fmt.moeda(v.valor)}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    }

    /* ======================================================
       LÓGICA DINÂMICA DO FORMULÁRIO
       ====================================================== */
    function initSaidas(tipo) {
        const { fmt } = CL;
        const tbody  = document.getElementById('tbodySaida');
        const totalEl = document.getElementById('totalFinal');
        const descontoEl = document.getElementById('campoDesconto');

        function calcularTotal() {
            let subtotal = 0;
            document.querySelectorAll('#tabelaSaida .linhaSaida').forEach(tr => {
                const val = parseFloat(tr.querySelector('.campoValorTotal').dataset.valor || 0);
                subtotal += val;
            });
            const desc = parseFloat(descontoEl?.value || 0) / 100;
            const total = subtotal * (1 - desc);
            if (totalEl) totalEl.textContent = fmt.moeda(total);
        }

        function bindLinha(tr) {
            const prodSel  = tr.querySelector('.campoProduto');
            const qtdInput = tr.querySelector('.campoQtd');
            const unitEl   = tr.querySelector('.campoValorUnit');
            const totEl    = tr.querySelector('.campoValorTotal');
            const btnRem   = tr.querySelector('.btnRemoverLinha');

            function atualizar() {
                const prod = DB.produtos.find(p => p.id === parseInt(prodSel.value));
                if (!prod) return;
                const qtd   = parseInt(qtdInput.value) || 0;
                const total = prod.preco * qtd;
                unitEl.textContent = fmt.moeda(prod.preco);
                totEl.textContent  = fmt.moeda(total);
                totEl.dataset.valor = total;
                calcularTotal();
            }

            prodSel?.addEventListener('change', atualizar);
            qtdInput?.addEventListener('input',  atualizar);
            btnRem?.addEventListener('click', () => {
                if (document.querySelectorAll('#tabelaSaida .linhaSaida').length > 1) {
                    tr.remove();
                    calcularTotal();
                }
            });
        }

        /* bind linhas existentes */
        document.querySelectorAll('#tabelaSaida .linhaSaida').forEach(bindLinha);

        /* adicionar linha */
        document.getElementById('btnAdicionarLinha')?.addEventListener('click', () => {
            const tmp = document.createElement('tbody');
            tmp.innerHTML = tabelaLinhas(tipo);
            const nova = tmp.querySelector('tr');
            tbody.appendChild(nova);
            bindLinha(nova);
        });

        /* desconto */
        descontoEl?.addEventListener('input', calcularTotal);

        /* submit */
        document.getElementById('formSaidaForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const desc = parseFloat(document.getElementById('campoDesconto')?.value || 0) / 100;
            let registradas = 0;
            document.querySelectorAll('#tabelaSaida .linhaSaida').forEach(tr => {
                const prodId   = parseInt(tr.querySelector('.campoProduto')?.value);
                const entId    = parseInt(tr.querySelector('.campoEntidade')?.value);
                const qtd      = parseInt(tr.querySelector('.campoQtd')?.value) || 0;
                if (!prodId || !entId || qtd <= 0) return;

                const prod = DB.getById('produtos', prodId);
                if (!prod) return;

                const valorUnit  = prod.preco * (1 - desc);
                const valorTotal = valorUnit * qtd;
                const entidade   = tipo === 'clientes'
                    ? DB.getById('clientes', entId)
                    : DB.getById('parceiros', entId);
                const nomeEnt = entidade?.nome || '—';

                DB.add('vendas', {
                    data:     new Date().toISOString().slice(0, 10),
                    produto:  prod.nome,
                    qtd,
                    valor:    valorTotal,
                    tipo:     tipo === 'clientes' ? 'Cliente' : 'Parceiro',
                    cliente:  nomeEnt,
                });

                /* descontar estoque */
                const novoEstoque = Math.max(0, (prod.estoque || 0) - qtd);
                const novoStatus  = novoEstoque === 0 ? 'zerado' : novoEstoque <= 5 ? 'baixo' : 'normal';
                DB.update('produtos', prodId, { estoque: novoEstoque, status: novoStatus });

                /* atualizar totais do cliente/parceiro */
                if (tipo === 'clientes' && entidade) {
                    DB.update('clientes', entId, {
                        totalCompras: (entidade.totalCompras || 0) + 1,
                        valorTotal:   (entidade.valorTotal   || 0) + valorTotal,
                    });
                } else if (tipo === 'parceiros' && entidade) {
                    DB.update('parceiros', entId, {
                        totalPedidos: (entidade.totalPedidos || 0) + 1,
                        valorTotal:   (entidade.valorTotal   || 0) + valorTotal,
                    });
                }
                registradas++;
            });

            if (registradas === 0) {
                CL.toast('Preencha ao menos um produto e destinatário.', 'erro');
                return;
            }
            CL.abrirModal(`
                <div class="iconeModal" style="background:#e6f7ee;font-size:30px;">✓</div>
                <h3 style="color:#0D5B2A;">Saída registrada!</h3>
                <p style="color:#555;font-size:14px;">${registradas} item(s) registrado(s) com sucesso e estoque atualizado.</p>
                <div class="botoesModal" style="justify-content:center;">
                    <button class="btnVerde" onclick="CL.fecharModal();Router.navigate();">OK</button>
                </div>`);
        });

        /* busca histórico */
        CL.bindSearch('#buscaSaida', '#tabelaHistSaida tbody');
    }

    /* ======================================================
       MÓDULO EXPORTADO
       ====================================================== */
    window.Pages.saidas = {
        render(sub) {
            return renderSaidas(sub === 'parceiros' ? 'parceiros' : 'clientes');
        },
        init(sub) {
            initSaidas(sub === 'parceiros' ? 'parceiros' : 'clientes');
        }
    };

})();
