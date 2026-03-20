# Nova Custom - E-commerce de Mantos Exclusivos

Nova Custom é uma plataforma de e-commerce premium especializada em camisas de futebol (Clubes, Seleções, Retrô) com foco em personalização e experiência do usuário.

## 🚀 Tecnologias

### Frontend
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS** (Estilização)
- **Lucide React** (Ícones)
- **Sonner** (Notificações Toast)
- **React Router Dom** (Navegação)
- **Framer Motion** (Animações)

### Backend & Infraestrutura
- **Node.js** com **Express**
- **Supabase** (Banco de dados PostgreSQL, Autenticação e Storage)
- **Mercado Pago API** (Integração de pagamentos via Cartão e Pix)
- **Zod** (Validação de dados)
- **Express Rate Limit** (Segurança)
- **Swagger/OpenAPI** (Documentação da API)

## ✨ Funcionalidades Principais

- **📦 Catálogo Dinâmico**: Filtros avançados por categoria, preço e disponibilidade.
- **🎨 Personalização de Produtos**: Adição de nome e número com taxa dinâmica (+ R$ 30,00).
- **🛒 Carrinho Inteligente**: Gerenciamento de itens com persistência local.
- **🔐 Autenticação Obrigatória**: Sistema de login e cadastro via Supabase para acompanhamento de pedidos.
- **💳 Checkout Completo**:
  - Pagamento via **PIX Copia e Cola** (com 5% de desconto automático).
  - Pagamento via **Cartão de Crédito** integrado ao Mercado Pago.
- **📱 Área do Cliente**: Histórico de pedidos, status de pagamento em tempo real e lista de desejos.
- **🛠 Painel Administrativo**: Gestão de estoque, controle de produtos e dashboard de vendas.
- **🔄 Recuperação de Senha**: Fluxo completo de redefinição de senha via e-mail.

## 🛠 Configuração Local

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/n0vacustom.git
    cd n0vacustom
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Variáveis de Ambiente**:
    Crie um arquivo `.env` na raiz com as seguintes chaves:
    ```env
    VITE_SUPABASE_URL=sua_url_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anon_supabase
    SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
    MERCADOPAGO_ACCESS_TOKEN=seu_token_mp
    ```

4.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    - Frontend: `http://localhost:5174`
    - API: `http://localhost:3001`
    - Docs API: `http://localhost:3001/api-docs`

## 📄 Licença

Este projeto está sob a licença MIT.
