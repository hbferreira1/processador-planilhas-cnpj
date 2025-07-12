// Import empresas from upload.js
let empresas = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      res.json(empresas);
    } catch (erro) {
      console.error('Erro ao listar empresas:', erro);
      res.status(500).json({ erro: 'Erro ao listar empresas' });
    }
  } else if (req.method === 'DELETE') {
    try {
      empresas = [];
      res.json({ sucesso: true, mensagem: 'Dados limpos com sucesso' });
    } catch (erro) {
      console.error('Erro ao limpar dados:', erro);
      res.status(500).json({ erro: 'Erro ao limpar dados' });
    }
  } else {
    res.status(405).json({ erro: 'Método não permitido' });
  }
}

// Export empresas for other API routes
export { empresas };