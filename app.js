/* ============================================================
   app.js — Chás da Laura
   Utilidades globales + DB con persistencia en localStorage
   ============================================================ */

window.Pages = window.Pages || {};

/* ----------------------------------------------------------
   UTILIDADES (CL)
   ---------------------------------------------------------- */
window.CL = (function () {

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    const fmt = {
        moeda: v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        data:  iso => { const [y,m,d] = String(iso).split('-'); return `${d}/${m}/${y}`; },
        num:   v => Number(v).toLocaleString('pt-BR'),
    };

    function abrirModal(html) {
        const fundo = document.getElementById('modalGlobal');
        const cont  = document.getElementById('modalConteudo');
        if (!fundo || !cont) return;
        cont.innerHTML = html;
        fundo.style.display = 'flex';
        fundo.onclick = e => { if (e.target === fundo) fecharModal(); };
    }

    function fecharModal() {
        const el = document.getElementById('modalGlobal');
        if (el) el.style.display = 'none';
    }

    function bindSearch(inputSel, tbodySel, ctx = document) {
        const input = $(inputSel, ctx);
        const tbody = $(tbodySel, ctx);
        if (!input || !tbody) return;
        input.addEventListener('input', () => {
            const q = input.value.toLowerCase();
            $$('tr', tbody).forEach(tr => {
                tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    function toast(msg, tipo = 'ok') {
        const el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText = `
            position:fixed;bottom:24px;right:24px;z-index:9999;
            padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;
            color:white;background:${tipo === 'ok' ? '#0D5B2A' : '#e53e3e'};
            box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:opacity 0.4s;`;
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 2500);
    }

    return { $, $$, delay, fmt, abrirModal, fecharModal, bindSearch, toast };
})();

/* ----------------------------------------------------------
   BASE DE DADOS com localStorage
   ---------------------------------------------------------- */
window.DB = (function () {

    const PREFIX = 'chl_';
    const HOJE   = new Date().toISOString().slice(0, 10);

    /* ---- dados iniciais (seed) ---- */
    const SEED = {
        produtos: [
            { id:1, nome:'Blend Felicita',       categoria:'Blend',     estoque:48, unidade:'lata', preco:60.00,  status:'normal' },
            { id:2, nome:'Blend Calme',           categoria:'Blend',     estoque:32, unidade:'lata', preco:55.00,  status:'normal' },
            { id:3, nome:'Blend Airmid',          categoria:'Blend',     estoque:5,  unidade:'lata', preco:58.00,  status:'baixo'  },
            { id:4, nome:'Blend Anime',           categoria:'Blend',     estoque:0,  unidade:'lata', preco:55.00,  status:'zerado' },
            { id:5, nome:'Home Spray Airmid',     categoria:'Home Spray',estoque:20, unidade:'und',  preco:75.00,  status:'normal' },
            { id:6, nome:'Home Spray Maternitea', categoria:'Home Spray',estoque:12, unidade:'und',  preco:75.00,  status:'normal' },
            { id:7, nome:'Kit Presente',          categoria:'Acessório', estoque:8,  unidade:'kit',  preco:150.00, status:'baixo'  },
        ],
        insumos: [
            { id:1, nome:'Camomila',    categoria:'Flor',       fornecedor:'Ervas do Vale',   estoque:0.5, unidade:'kg', preco:28.00, status:'crítico' },
            { id:2, nome:'Erva-doce',   categoria:'Erva',       fornecedor:'Ervas do Vale',   estoque:3.2, unidade:'kg', preco:22.00, status:'normal'  },
            { id:3, nome:'Lavanda',     categoria:'Flor',       fornecedor:'Flora Natural',   estoque:1.0, unidade:'kg', preco:65.00, status:'baixo'   },
            { id:4, nome:'Canela',      categoria:'Especiaria', fornecedor:'Temperos & Cia',  estoque:500, unidade:'g',  preco:0.18,  status:'normal'  },
            { id:5, nome:'Gengibre',    categoria:'Especiaria', fornecedor:'Temperos & Cia',  estoque:2.5, unidade:'kg', preco:15.00, status:'normal'  },
            { id:6, nome:'Capim-limão', categoria:'Erva',       fornecedor:'Bio Insumos SP',  estoque:4.0, unidade:'kg', preco:30.00, status:'normal'  },
            { id:7, nome:'Hibisco',     categoria:'Flor',       fornecedor:'Bio Insumos SP',  estoque:0.8, unidade:'kg', preco:42.00, status:'crítico' },
        ],
        clientes: [
            { id:1, nome:'Maria Silva',      cpf:'123.456.789-00', telefone:'(11) 98765-4321', email:'maria@email.com',  totalCompras:8,  valorTotal:720.00  },
            { id:2, nome:'João Oliveira',    cpf:'987.654.321-00', telefone:'(11) 91234-5678', email:'joao@email.com',   totalCompras:5,  valorTotal:450.00  },
            { id:3, nome:'Ana Paula Santos', cpf:'456.789.123-00', telefone:'(11) 99876-5432', email:'ana@email.com',    totalCompras:12, valorTotal:1100.00 },
            { id:4, nome:'Carlos Mendes',    cpf:'321.654.987-00', telefone:'(11) 95432-1876', email:'carlos@email.com', totalCompras:3,  valorTotal:270.00  },
        ],
        fornecedores: [
            { id:1, nome:'Ervas do Vale',    cnpj:'11.222.333/0001-44', telefone:'(11) 3333-1111', insumos:8,  ultimaCompra:'2026-06-10', valorTotal:3200.00, ativo:true  },
            { id:2, nome:'Flora Natural',    cnpj:'22.333.444/0001-55', telefone:'(11) 3333-2222', insumos:5,  ultimaCompra:'2026-06-05', valorTotal:1850.00, ativo:true  },
            { id:3, nome:'Temperos & Cia',   cnpj:'33.444.555/0001-66', telefone:'(11) 3333-3333', insumos:12, ultimaCompra:'2026-05-28', valorTotal:4700.00, ativo:true  },
            { id:4, nome:'Bio Insumos SP',   cnpj:'44.555.666/0001-77', telefone:'(11) 3333-4444', insumos:9,  ultimaCompra:'2026-06-12', valorTotal:5100.00, ativo:true  },
            { id:5, nome:'Aromas do Brasil', cnpj:'55.666.777/0001-88', telefone:'(11) 3333-5555', insumos:4,  ultimaCompra:'2026-04-15', valorTotal:980.00,  ativo:false },
        ],
        parceiros: [
            { id:1, nome:'Empório Natural',   cnpj:'66.777.888/0001-99', telefone:'(11) 4444-1111', email:'emporio@email.com', totalPedidos:15, valorTotal:2250.00 },
            { id:2, nome:'Loja Bem-Estar',    cnpj:'77.888.999/0001-00', telefone:'(11) 4444-2222', email:'loja@email.com',    totalPedidos:8,  valorTotal:1200.00 },
            { id:3, nome:'Spa Relax Center',  cnpj:'88.999.000/0001-11', telefone:'(11) 4444-3333', email:'spa@email.com',     totalPedidos:22, valorTotal:3300.00 },
        ],
        receitas: [
            { id:1, nome:'Blend Anti-estresse', rendimento:'10 latas 50g', custo:85.00,  preco:600.00, margem:'86%' },
            { id:2, nome:'Blend Energizante',   rendimento:'8 latas 50g',  custo:72.00,  preco:480.00, margem:'85%' },
            { id:3, nome:'Blend Detox',         rendimento:'12 latas 50g', custo:96.00,  preco:720.00, margem:'87%' },
            { id:4, nome:'Blend Relaxante',     rendimento:'10 latas 50g', custo:90.00,  preco:550.00, margem:'84%' },
        ],
        producoes: [
            { id:1, receita:'Blend Anti-estresse', data:'2026-06-12', qtd:50, responsavel:'Laura', status:'concluída' },
            { id:2, receita:'Blend Energizante',   data:'2026-06-08', qtd:40, responsavel:'Laura', status:'concluída' },
            { id:3, receita:'Blend Detox',         data:'2026-06-03', qtd:60, responsavel:'Laura', status:'concluída' },
        ],
        vendas: [
            { id:1, data:'2026-06-15', produto:'Blend Felicita',    qtd:12, valor:720.00,  tipo:'Cliente',  cliente:'Maria Silva'     },
            { id:2, data:'2026-06-14', produto:'Home Spray Airmid', qtd:5,  valor:375.00,  tipo:'Parceiro', cliente:'Empório Natural'  },
            { id:3, data:'2026-06-13', produto:'Blend Calme',       qtd:20, valor:1100.00, tipo:'Cliente',  cliente:'Ana Paula Santos' },
            { id:4, data:'2026-06-12', produto:'Kit Presente',      qtd:3,  valor:450.00,  tipo:'Cliente',  cliente:'João Oliveira'    },
            { id:5, data:'2026-06-11', produto:'Blend Anime',       qtd:8,  valor:480.00,  tipo:'Parceiro', cliente:'Loja Bem-Estar'   },
            { id:6, data:'2026-06-10', produto:'Blend Felicita',    qtd:6,  valor:360.00,  tipo:'Cliente',  cliente:'Carlos Mendes'    },
        ],
    };

    /* ---- persistência ---- */
    function _key(col)  { return PREFIX + col; }

    function _load(col) {
        try {
            const raw = localStorage.getItem(_key(col));
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function _save(col, data) {
        try { localStorage.setItem(_key(col), JSON.stringify(data)); } catch(e) { console.warn('localStorage error', e); }
    }

    function _nextId(arr) {
        return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;
    }

    /* ---- inicialização: carrega do localStorage ou usa seed ---- */
    const state = {};
    Object.keys(SEED).forEach(col => {
        state[col] = _load(col) || JSON.parse(JSON.stringify(SEED[col]));
    });

    /* ---- API pública ---- */
    function getAll(col)       { return state[col] || []; }
    function getById(col, id)  { return (state[col] || []).find(i => i.id === id); }

    function add(col, item) {
        item.id = _nextId(state[col]);
        state[col].push(item);
        _save(col, state[col]);
        return item;
    }

    function update(col, id, changes) {
        const idx = state[col].findIndex(i => i.id === id);
        if (idx === -1) return null;
        state[col][idx] = { ...state[col][idx], ...changes };
        _save(col, state[col]);
        return state[col][idx];
    }

    function remove(col, id) {
        state[col] = state[col].filter(i => i.id !== id);
        _save(col, state[col]);
    }

    function reset() {
        Object.keys(SEED).forEach(col => {
            state[col] = JSON.parse(JSON.stringify(SEED[col]));
            _save(col, state[col]);
        });
        CL.toast('Dados restaurados para o estado inicial.');
        Router.go('');
    }

    /* ---- atalhos de leitura (compatibilidade com módulos) ---- */
    const proxy = new Proxy({}, {
        get(_, col) {
            if (col in state) return state[col];
            return undefined;
        }
    });

    return { getAll, getById, add, update, remove, reset, _proxy: proxy };
})();

/* Atalho de leitura: DB.produtos, DB.clientes, etc. */
Object.defineProperties(window.DB, {
    produtos:     { get() { return DB.getAll('produtos');     }, enumerable: true },
    insumos:      { get() { return DB.getAll('insumos');      }, enumerable: true },
    clientes:     { get() { return DB.getAll('clientes');     }, enumerable: true },
    fornecedores: { get() { return DB.getAll('fornecedores'); }, enumerable: true },
    parceiros:    { get() { return DB.getAll('parceiros');    }, enumerable: true },
    receitas:     { get() { return DB.getAll('receitas');     }, enumerable: true },
    producoes:    { get() { return DB.getAll('producoes');    }, enumerable: true },
    vendas:       { get() { return DB.getAll('vendas');       }, enumerable: true },
});
