export interface Categoria {
  id: string;
  nome: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoriaId: string;
  categoria?: Categoria;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}export interface Categoria {
  id: string;
  nome: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoriaId: string;
  categoria?: Categoria;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}