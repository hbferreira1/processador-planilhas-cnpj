/*
  # Criar tabela de empresas

  1. Nova Tabela
    - `empresas`
      - `id` (uuid, primary key)
      - `razao_social` (text)
      - `cnpj` (text)
      - `url` (text)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `empresas`
    - Adicionar política para permitir operações públicas (já que não há autenticação)
*/

CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL,
  cnpj text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso público (sem autenticação)
CREATE POLICY "Permitir acesso público"
  ON empresas
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);