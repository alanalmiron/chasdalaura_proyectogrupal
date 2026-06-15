/* pages/dashboard.js — Painel inicial */
(function () {

    window.Pages.dashboard = {

        render() {
            const { fmt } = CL;
            const { produtos, insumos, vendas } = DB;

            const totalEstoque = produtos.reduce((s, p) => s + p.estoque, 0);
            const baixoEstoque = produtos.filter(p => p.status === 'baixo' || p.status === 'zerado').length;
            const faturamento  = vendas.reduce((s, v) => s + v.valor, 0);
            const criticos     = insumos.filter(i => i.status === 'crítico' || i.status === 'baixo');

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

            const linhasVendas = vendas.slice(0,5).map(v => `
                <tr>
                    <td>${CL.fmt.data(v.data)}</td>
                    <td>${v.produto}</td>
                    <td>${v.cliente}</td>
                    <td>${fmt.moeda(v.valor)}</td>
                    <td><span class="${v.tipo==='Cliente'?'tagCriacao':'tagAtualizacao'}">${v.tipo}</span></td>
                </tr>`).join('');

            const linhasCriticos = criticos.map(i => `
                <div class="linhaResumo">
                    <span>${i.nome}</span>
                    <strong style="color:${i.status==='crítico'?'#e53e3e':'#e65c00'};">${i.estoque} ${i.unidade}</strong>
                </div>`).join('');

            return `
            <h1 class="tituloPagina">Painel inicial</h1>
            <p class="subtituloPagina">Olá Laura! Veja o resumo do seu negócio.</p>

            <section class="cardsResumo">
                <div class="cardResumo">
                    <span class="cardSubtitulo">Produtos cadastrados</span>
                    <strong class="cardNumero">${produtos.length}</strong>
                    <a href="#/estoque/produtos">Ver estoque</a>
                </div>
                <div class="cardResumo">
                    <span class="cardSubtitulo">Unidades em estoque</span>
                    <strong class="cardNumero">${fmt.num(totalEstoque)}</strong>
                    <a href="#/estoque/produtos">Ver detalhes</a>
                </div>
                <div class="cardResumo">
                    <span class="cardSubtitulo">Itens com estoque crítico</span>
                    <strong class="cardNumero" style="color:#e53e3e;">${baixoEstoque}</strong>
                    <a href="#/relatorios/estoque">Ver lista</a>
                </div>
                <div class="cardResumo">
                    <span class="cardSubtitulo">Faturamento (últimas vendas)</span>
                    <strong class="cardNumero">${fmt.moeda(faturamento)}</strong>
                    <a href="#/relatorios/vendas">Ver relatório</a>
                </div>
            </section>

            <div class="linhaDashboard" style="margin-top:24px;">
                <div class="cardDashboard">
                    <h2 class="tituloTabela" style="margin:0 0 16px 0;">Faturamento mensal <span style="font-size:14px;color:#555;">(R$)</span></h2>
                    <div class="graficoBarras">${barras}</div>
                </div>
                <div class="cardDashboard" style="background:#DDF7C9;">
                    <h3 style="margin:0 0 14px 0;font-size:14px;color:#0D4B24;">Insumos em alerta</h3>
                    ${linhasCriticos || '<p style="font-size:13px;color:#555;">Nenhum insumo crítico.</p>'}
                    <a href="#/estoque/insumos" class="linkVerTudo" style="display:block;margin-top:12px;">Ver todos os insumos →</a>
                </div>
            </div>

            <div class="secaoInferior">
                <div class="cardAtividades">
                    <h3>Últimas vendas</h3>
                    <table class="tabelaAtividades tabelaGeral">
                        <thead>
                            <tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Valor</th><th>Tipo</th></tr>
                        </thead>
                        <tbody>${linhasVendas}</tbody>
                    </table>
                    <a href="#/relatorios/vendas" class="linkVerTudo">Ver relatório completo →</a>
                </div>
                <div class="cardResumoPainel">
                    <h3>Ações rápidas</h3>
                    <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                        <a href="#/producao/nova" class="btnVerde" style="text-align:center;">+ Nova produção</a>
                        <a href="#/saidas/clientes" class="btnVerde" style="text-align:center;">+ Registrar saída</a>
                        <a href="#/cadastros/clientes" class="btnVoltar" style="text-align:center;">Cadastrar cliente</a>
                        <a href="#/relatorios/resumo" class="btnVoltar" style="text-align:center;">Resumo geral</a>
                    </div>
                </div>
            </div>`;
        },

        init() {
            /* nada extra necesario */
        }
    };

})();
