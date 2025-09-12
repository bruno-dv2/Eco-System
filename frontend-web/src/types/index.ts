export interface Usuario {
    id: number;
    nome: string;
    email: string;
  }
  
  export interface Material {
    id: number;
    nome: string;
    descricao?: string;
    unidade: string;
  }
  
  export interface Entrada {
    id: number;
    materialId: number;
    quantidade: number;
    preco: number;
    data: Date;
    material: Material;
  }
  
  export interface Saida {
    id: number;
    materialId: number;
    quantidade: number;
    data: Date;
    material: Material;
  }

  export interface MovimentacaoSaida {
    materialId: number;
    quantidade: number;
  }

  export interface MovimentacaoEntrada {
    materialId: number;
    quantidade: number;
    preco: number;
  }
  
  export interface SaldoMaterial {
    material: string;
    quantidade: number;
    unidade: string;
    precoMedio: number;
    valorTotal?: number;
  }
  
  export interface AuthResponse {
    usuario: Usuario;
    token: string;
  }