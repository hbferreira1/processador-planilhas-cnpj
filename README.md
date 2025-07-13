# Processador de Planilhas CNPJ

Uma aplicação web serverless para upload e processamento de planilhas contendo dados de empresas (Razão Social e CNPJ). Funciona com Vercel API Routes e armazenamento temporário em memória.

## Funcionalidades

- 📁 Upload de planilhas CSV e Excel
- 🔍 Processamento automático dos dados
- 🌐 Geração de URLs personalizadas para cada CNPJ
- 📋 Lista de empresas processadas
- 🔗 Páginas individuais para cada empresa
- 🗑️ Função para limpar dados
- ☁️ Serverless com Vercel API Routes
- 💾 Armazenamento temporário em memória

## Como usar

1. **Preparar a planilha**: Certifique-se de que sua planilha contenha as colunas "Razão Social" e "CNPJ"
2. **Fazer upload**: Clique em "Escolher arquivo" e selecione sua planilha
3. **Processar**: Clique em "Processar Planilha" para processar os dados
4. **Visualizar**: Clique em qualquer empresa da lista para ver os detalhes

## Executar localmente

1. Instalar dependências:
```bash
npm install
```

2. Executar em modo desenvolvimento:
```bash
npm run dev
```

3. Para testar as API routes localmente, use Vercel CLI:
```bash
npx vercel dev
```

## Estrutura do projeto

- `api/upload.js` - API route para processar uploads
- `api/empresas.js` - API route para listar/limpar empresas
- `api/empresa/[id].js` - API route para empresa específica
- `src/App.tsx` - Aplicação React principal
- `vercel.json` - Configuração do Vercel

## API Routes

- `POST /api/upload` - Upload e processamento de planilha
- `GET /api/empresas` - Listar todas as empresas
- `DELETE /api/empresas` - Limpar todos os dados
- `GET /api/empresa/[id]` - Buscar empresa específica

## Formatos suportados

- CSV (.csv)
- Excel (.xlsx, .xls)

## Colunas obrigatórias

A planilha deve conter as seguintes colunas:
- **Razão Social** (ou variações como "razao_social", "RAZAO_SOCIAL")
- **CNPJ** (ou variações como "cnpj")

## URL gerada

Para cada CNPJ, será gerada uma URL no formato:
```
https://regularize.meinvalido.is/aviso.php?cnpj={CNPJ}
```

## Rotas da aplicação

- `/` - Página principal com upload
- `/empresa/0`, `/empresa/1`, etc. - Páginas individuais das empresas

## Características técnicas

- **Armazenamento**: Temporário em memória (serverless functions)
- **Persistência**: Dados são perdidos entre cold starts
- **Backend**: Vercel API Routes (serverless functions)
- **Frontend**: React com TypeScript e Tailwind CSS
- **Processamento**: Suporte a CSV e Excel (.xlsx, .xls)
- **Deploy**: Vercel com configuração automática

## Limitações

- Os dados são armazenados apenas em memória das funções serverless
- Cold starts resetam todos os dados processados
- Não há autenticação ou controle de acesso
- Adequado para prova de conceito e demonstrações
- Tempo limite de 30 segundos para processamento de arquivos

## Configuração Vercel

O arquivo `vercel.json` configura:
- Timeout de 30 segundos para funções
- Rewrites para SPAs (Single Page Applications)
- Roteamento correto para `/empresa/:id`
