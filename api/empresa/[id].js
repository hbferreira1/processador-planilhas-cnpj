// Import empresas from upload.js
let empresas = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { id } = req.query;
    const empresaId = parseInt(id);
    
    if (isNaN(empresaId) || empresaId < 0 || empresaId >= empresas.length) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }

    const empresa = empresas[empresaId];
    res.json(empresa);
  } catch (erro) {
    console.error('Erro ao buscar empresa:', erro);
    res.status(500).json({ erro: 'Erro ao buscar empresa' });
  }
}