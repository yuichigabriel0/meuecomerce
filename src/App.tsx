import { useEffect, useState } from 'react';
import { ShoppingCart, Store, Tag, Plus, Minus, Trash2 } from 'lucide-react';
import { api } from './services/api';
import type { Produto, Categoria, ItemCarrinho } from './types';

export function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('TODAS');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Carregar dados iniciais da API
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resProdutos, resCategorias] = await Promise.all([
          api.get<Produto[]>('/produtos'),
          api.get<Categoria[]>('/categorias')
        ]);

        setProdutos(resProdutos.data);
        setCategorias(resCategorias.data);
      } catch (error) {
        console.error('Erro ao conectar com a API:', error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((carrinhoAtual) => {
      const itemExistente = carrinhoAtual.find(item => item.produto.id === produto.id);

      if (itemExistente) {
        if (itemExistente.quantidade >= produto.estoque) {
          alert('Quantidade limite do estoque atingida!');
          return carrinhoAtual;
        }
        return carrinhoAtual.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...carrinhoAtual, { produto, quantidade: 1 }];
    });
  };

  // Alterar quantidade do item no carrinho
  const alterarQuantidade = (produtoId: string, delta: number) => {
    setCarrinho(carrinhoAtual =>
      carrinhoAtual
        .map(item => {
          if (item.produto.id === produtoId) {
            const novaQtd = item.quantidade + delta;
            return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemCarrinho[]
    );
  };

  const totalCarrinho = carrinho.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  );

  const totalItensCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  const produtosFiltrados = categoriaAtiva === 'TODAS'
    ? produtos
    : produtos.filter(p => p.categoriaId === categoriaAtiva);

  return (
    <div style={estilos.container}>
      {/* Navbar */}
      <header style={estilos.header}>
        <div style={estilos.logo}>
          <Store size={28} />
          <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Mercado Dev</h1>
        </div>

        <button
          style={estilos.botaoCarrinho}
          onClick={() => setCarrinhoAberto(!carrinhoAberto)}
        >
          <ShoppingCart size={20} />
          <span>Carrinho ({totalItensCarrinho})</span>
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main style={estilos.main}>
        <h2>Catálogo de Produtos</h2>

        {/* Categorias */}
        <div style={estilos.categoriasContainer}>
          <button
            style={categoriaAtiva === 'TODAS' ? estilos.categoriaAtiva : estilos.categoriaBotao}
            onClick={() => setCategoriaAtiva('TODAS')}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              style={categoriaAtiva === cat.id ? estilos.categoriaAtiva : estilos.categoriaBotao}
              onClick={() => setCategoriaAtiva(cat.id)}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Grid de Produtos */}
        {carregando ? (
          <p>Carregando produtos do banco...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p>Nenhum produto cadastrado nesta categoria.</p>
        ) : (
          <div style={estilos.grid}>
            {produtosFiltrados.map(produto => (
              <div key={produto.id} style={estilos.card}>
                <div>
                  <div style={estilos.tagCategoria}>
                    <Tag size={14} />
                    <span>{produto.categoria?.nome ?? 'Geral'}</span>
                  </div>
                  <h3 style={estilos.produtoNome}>{produto.nome}</h3>
                  <p style={estilos.estoque}>Estoque: {produto.estoque} un</p>
                </div>

                <div style={estilos.cardRodape}>
                  <span style={estilos.preco}>
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </span>
                  <button
                    style={produto.estoque === 0 ? estilos.botaoDesabilitado : estilos.botaoComprar}
                    disabled={produto.estoque === 0}
                    onClick={() => adicionarAoCarrinho(produto)}
                  >
                    {produto.estoque === 0 ? 'Esgotado' : 'Adicionar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Drawer/Painel do Carrinho (Lateral) */}
      {carrinhoAberto && (
        <div style={estilos.modalOverlay}>
          <div style={estilos.carrinhoPainel}>
            <div style={estilos.carrinhoHeader}>
              <h3>Seu Carrinho</h3>
              <button style={estilos.botaoFechar} onClick={() => setCarrinhoAberto(false)}>X</button>
            </div>

            <div style={estilos.carrinhoItens}>
              {carrinho.length === 0 ? (
                <p>Seu carrinho está vazio.</p>
              ) : (
                carrinho.map(item => (
                  <div key={item.produto.id} style={estilos.carrinhoItem}>
                    <div>
                      <strong style={{ display: 'block' }}>{item.produto.nome}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        R$ {item.produto.preco.toFixed(2).replace('.', ',')} cada
                      </span>
                    </div>

                    <div style={estilos.controlesQtd}>
                      <button onClick={() => alterarQuantidade(item.produto.id, -1)} style={estilos.btnQtd}>
                        {item.quantidade === 1 ? <Trash2 size={14} color="#ef4444" /> : <Minus size={14} />}
                      </button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => alterarQuantidade(item.produto.id, 1)} style={estilos.btnQtd}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrinho.length > 0 && (
              <div style={estilos.carrinhoRodape}>
                <div style={estilos.totalContainer}>
                  <span>Total:</span>
                  <strong style={{ fontSize: '1.25rem', color: '#16a34a' }}>
                    R$ {totalCarrinho.toFixed(2).replace('.', ',')}
                  </strong>
                </div>
                <button style={estilos.botaoFinalizar}>
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const estilos = {
  container: { fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', margin: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#0f172a', color: '#fff' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  botaoCarrinho: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const },
  main: { maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' },
  categoriasContainer: { display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' as const },
  categoriaBotao: { padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '20px', cursor: 'pointer' },
  categoriaAtiva: { padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: '#fff', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' as const },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', border: '1px solid #e2e8f0' },
  tagCategoria: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' },
  produtoNome: { margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a' },
  estoque: { color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' },
  cardRodape: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
  preco: { fontSize: '1.2rem', fontWeight: 'bold' as const, color: '#16a34a' },
  botaoComprar: { padding: '6px 12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  botaoDesabilitado: { padding: '6px 12px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'not-allowed' },
  modalOverlay: { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end' },
  carrinhoPainel: { width: '360px', backgroundColor: '#fff', height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between', boxSizing: 'border-box' as const },
  carrinhoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', pb: '1rem' },
  botaoFechar: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' },
  carrinhoItens: { flex: 1, overflowY: 'auto' as const, margin: '1rem 0' },
  carrinhoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' },
  controlesQtd: { display: 'flex', alignItems: 'center', gap: '8px' },
  btnQtd: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' },
  carrinhoRodape: { borderTop: '1px solid #e2e8f0', paddingTop: '1rem' },
  totalContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  botaoFinalizar: { width: '100%', padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' as const, cursor: 'pointer' }
};

export default App;