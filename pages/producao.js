/* pages/producao.js — Produção e histórico */
(function () {

    function subNav(ativo) {
        return `<div style="display:flex;gap:8px;margin-bottom:24px;">
            <a href="#/producao"      style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;background:${ativo===''?'#0D5B2A':'white'};color:${ativo===''?'white':'#555'};border:1px solid ${ativo===''?'#0D5B2A':'#ddd'};">Histórico</a>
            <a href="#/producao/nova" style="padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;background:${ativo==='nova'?'#0D5B2A':'white'};color:${ativo==='nova'?'white':'#555'};border:1px solid ${ativo==='nova'?'#0D5B2A':'#ddd'};">+ Nova produção</a>
        </div>`;
    }

    /* ======================================================
       HISTÓRICO DE PRODUÇÃO
       ====================================================== */
    function renderHistorico() {
        const { fmt } = CL;
        const rows = DB.producoes.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.receita}</td>
                <td>${fmt.data(p.data)}</td>
                <td>${p.qtd} un.</td>
                <td>${p.responsavel}</td>
                <td><span class="tagCriacao">${p.status}</span></td>
                <td><button class="btnAcaoEditar" title="Ver detalhes">&#128065;</button></td>
            </tr>`).join('');

        return `
        <h1 class="tituloPagina">Produção</h1>
        <p class="subtituloPagina">Registre e acompanhe as produções de blends e produtos.</p>
        ${subNav('')}

        <section class="cardsResumo">
            <div class="cardResumo">
                <span class="cardSubtitulo">Total de produções</span>
                <strong class="cardNumero">${DB.producoes.length}</strong>
                <a href="#">Ver todas</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Unidades produzidas</span>
                <strong class="cardNumero">${DB.producoes.reduce((s,p)=>s+p.qtd,0)}</strong>
                <a href="#">Ver detalhes</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Receitas utilizadas</span>
                <strong class="cardNumero">${new Set(DB.producoes.map(p=>p.receita)).size}</strong>
                <a href="#/cadastros/receitas">Ver receitas</a>
            </div>
            <div class="cardResumo">
                <span class="cardSubtitulo">Última produção</span>
                <strong class="cardNumero" style="font-size:18px;">${CL.fmt.data(DB.producoes[0].data)}</strong>
                <a href="#/producao/nova">Nova produção</a>
            </div>
        </section>

        <div class="conteinerTabela" style="margin-top:24px;">
            <div class="barraBusca">
                <div>
                    <h2 class="tituloTabela" style="margin:0;">Histórico de produções</h2>
                    <p class="subtituloTabela">Registro de todas as produções realizadas</p>
                </div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="buscaProducao" placeholder="Buscar receita..." style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:220px;">
                    <a href="#/producao/nova" class="btnVerde">+ Nova produção</a>
                </div>
            </div>
            <table class="tabelaGeral" id="tabelaProducao">
                <thead><tr><th>#</th><th>Receita</th><th>Data</th><th>Quantidade</th><th>Responsável</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    /* ======================================================
       NOVA PRODUÇÃO
       ====================================================== */
    function renderNova() {
        const opcoesReceitas = DB.receitas.map(r => `<option value="${r.id}">${r.nome} — ${r.rendimento}</option>`).join('');
        const insumosExemplo = [
            { nome:'Flor de camomila', qtdUnit:'20,00 g', qtdTotal:'1.000,00 g' },
            { nome:'Erva-doce',        qtdUnit:'15,00 g', qtdTotal:'750,00 g'   },
            { nome:'Lavanda',          qtdUnit:'10,00 g', qtdTotal:'500,00 g'   },
            { nome:'Lata 50g',         qtdUnit:'1 und',   qtdTotal:'50 und'     },
        ];
        const rowsInsumos = insumosExemplo.map(i => `
            <tr>
                <td><strong>${i.nome}</strong></td>
                <td>${i.qtdUnit}</td>
                <td>${i.qtdTotal}</td>
            </tr>`).join('');

        return `
        <h1 class="tituloPagina">Nova produção</h1>
        <p class="subtituloPagina">Registre a produção realizada utilizando uma receita cadastrada.</p>
        ${subNav('nova')}

        <div class="areaDoisPaineis">
            <div class="painelPrincipal">

                <div class="conteinerTabela" style="margin-bottom:20px;">
                    <h2 class="tituloTabela" style="margin:0 0 20px 0;">1. Informações de produção</h2>
                    <div class="linhaForm2">
                        <div>
                            <label>Receita</label>
                            <select id="selectReceita">${opcoesReceitas}</select>
                        </div>
                        <div>
                            <label>Data de produção</label>
                            <input type="date" id="dataProducao" value="${new Date().toISOString().slice(0,10)}">
                        </div>
                    </div>
                    <div class="linhaForm2">
                        <div>
                            <label>Quantidade produzida</label>
                            <input type="number" id="qtdProducao" value="50" min="1">
                        </div>
                        <div>
                            <label>Unidade</label>
                            <select><option>Lata 50g</option><option>Lata 100g</option><option>Sachê</option></select>
                        </div>
                        <div>
                            <label>Responsável</label>
                            <select><option>Laura</option></select>
                        </div>
                    </div>
                    <div>
                        <label>Observações</label>
                        <textarea rows="3" placeholder="Adicione observações sobre essa produção..."></textarea>
                    </div>
                </div>

                <div class="conteinerTabela">
                    <h2 class="tituloTabela" style="margin:0 0 8px 0;">2. Resumo de insumos utilizados</h2>
                    <p class="subtituloTabela" style="margin:0 0 16px 0;">Os insumos abaixo serão reservados do estoque</p>
                    <table class="tabelaGeral" id="tabelaInsumosProducao">
                        <thead><tr><th>Insumo</th><th>Qtd. por unidade</th><th>Qtd. total</th></tr></thead>
                        <tbody>${rowsInsumos}</tbody>
                    </table>
                </div>
            </div>

            <div class="painelLateral">
                <div class="cardResumoVerde2">
                    <h3>Resumo de produção</h3>
                    <div style="background:#c8f0b0;border-radius:6px;padding:10px;margin-bottom:16px;font-size:13px;color:#0D4B24;">
                        ✓ Produção será adicionada ao estoque de produtos
                    </div>
                    <div class="linhaResumo"><span>Produto final</span><strong id="resumoProduto">Blend Anti-estresse</strong></div>
                    <div class="linhaResumo"><span>Qtd. produzida</span><strong id="resumoQtd">50 latas</strong></div>
                    <div class="linhaResumo"><span>Data</span><strong id="resumoData">${new Date().toLocaleDateString('pt-BR')}</strong></div>
                    <div class="linhaResumo"><span>Rendimento</span><strong>10 latas/receita</strong></div>
                    <hr style="margin:14px 0;border:none;border-top:1px solid #b0e090;">
                    <div class="linhaResumo"><span>Estoque adicionado</span><strong style="color:#0D5B2A;">+ 50 latas</strong></div>
                    <button class="btnVerde" id="btnRegistrarProducao" style="width:100%;margin-top:20px;justify-content:center;">
                        ✓ Registrar produção
                    </button>
                    <a href="#/producao" class="btnVoltar" style="width:100%;margin-top:10px;text-align:center;display:block;box-sizing:border-box;">Cancelar</a>
                </div>
            </div>
        </div>`;
    }

    /* ======================================================
       MÓDULO EXPORTADO
       ====================================================== */
    window.Pages.producao = {
        render(sub) {
            return sub === 'nova' ? renderNova() : renderHistorico();
        },
        init(sub) {
            if (sub === '') {
                CL.bindSearch('#buscaProducao', '#tabelaProducao tbody');
            }
            if (sub === 'nova') {
                const btn = document.getElementById('btnRegistrarProducao');
                if (btn) {
                    btn.addEventListener('click', () => {
                        const recId = parseInt(document.getElementById('selectReceita')?.value);
                        const qtd   = parseInt(document.getElementById('qtdProducao')?.value) || 0;
                        const data  = document.getElementById('dataProducao')?.value || new Date().toISOString().slice(0,10);
                        const rec   = DB.getById('receitas', recId);

                        if (!rec || qtd <= 0) {
                            CL.toast('Selecione uma receita e informe a quantidade.', 'erro');
                            return;
                        }

                        DB.add('producoes', {
                            receita:     rec.nome,
                            data,
                            qtd,
                            responsavel: 'Laura',
                            status:      'concluída',
                        });

                        /* aumentar estoque do produto com mesmo nome, se existir */
                        const prod = DB.produtos.find(p => p.nome.toLowerCase().includes(rec.nome.toLowerCase().split(' ')[1] || rec.nome));
                        if (prod) {
                            const novoEstoque = (prod.estoque || 0) + qtd;
                            const novoStatus  = novoEstoque <= 5 ? 'baixo' : 'normal';
                            DB.update('produtos', prod.id, { estoque: novoEstoque, status: novoStatus });
                        }

                        CL.abrirModal(`
                            <div class="iconeModal" style="background:#e6f7ee;font-size:30px;">✓</div>
                            <h3 style="color:#0D5B2A;">Produção registrada!</h3>
                            <p style="color:#555;font-size:14px;">${qtd} unidades de <strong>${rec.nome}</strong> adicionadas com sucesso.</p>
                            <div class="botoesModal" style="justify-content:center;">
                                <button class="btnVerde" onclick="CL.fecharModal();Router.go('producao')">Ver histórico</button>
                                <button class="btnVoltar" onclick="CL.fecharModal()">Nova produção</button>
                            </div>`);
                    });
                }
            }
        }
    };

})();
