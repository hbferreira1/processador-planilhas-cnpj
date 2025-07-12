import multiparty from 'multiparty';
import XLSX from 'xlsx';

// Global in-memory storage (will reset on each cold start)
let empresas = [];

// Function to clean CNPJ (remove special characters)
function limparCNPJ(cnpj) {
  return cnpj.toString().replace(/[^\d]/g, '');
}

// Function to format CNPJ
function formatarCNPJ(cnpj) {
  const cnpjLimpo = limparCNPJ(cnpj);
  if (cnpjLimpo.length === 14) {
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cnpj;
}

// Function to process spreadsheet data
function processarDados(dados) {
  const empresasProcessadas = [];
  
  dados.forEach((linha, index) => {
    // Search for company name columns (various possible variations)
    const razaoSocial = linha['Razão Social'] || 
                       linha['razao_social'] || 
                       linha['RAZAO_SOCIAL'] || 
                       linha['Razao Social'] || 
                       linha['razaoSocial'] ||
                       linha['nome'] ||
                       linha['Nome'] ||
                       linha['NOME'];

    // Search for CNPJ columns (various possible variations)
    const cnpj = linha['CNPJ'] || 
                linha['cnpj'] || 
                linha['Cnpj'];

    if (razaoSocial && cnpj) {
      const cnpjFormatado = formatarCNPJ(cnpj);
      const cnpjLimpo = limparCNPJ(cnpj);
      
      empresasProcessadas.push({
        id: index,
        razaoSocial: razaoSocial.toString().trim(),
        cnpj: cnpjFormatado,
        url: `https://regularize.meinvalido.is/aviso.php?cnpj=${cnpjLimpo}`
      });
    }
  });

  return empresasProcessadas;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const form = new multiparty.Form();
    
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
    };

    const { files } = await parseForm();
    
    if (!files.planilha || !files.planilha[0]) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
    }

    const file = files.planilha[0];
    const fileExtension = file.originalFilename.toLowerCase().split('.').pop();

    let dados = [];

    if (fileExtension === 'csv') {
      // Process CSV file
      const fs = await import('fs');
      const csvParser = await import('csv-parser');
      
      const results = [];
      const stream = fs.default.createReadStream(file.path)
        .pipe(csvParser.default())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          try {
            empresas = processarDados(results);
            
            // Clean temporary file
            fs.default.unlinkSync(file.path);
            
            res.json({
              sucesso: true,
              mensagem: `${empresas.length} empresas processadas com sucesso`,
              total: empresas.length
            });
          } catch (erro) {
            console.error('Erro ao processar CSV:', erro);
            res.status(500).json({ erro: 'Erro ao processar arquivo CSV' });
          }
        })
        .on('error', (erro) => {
          console.error('Erro ao ler CSV:', erro);
          res.status(500).json({ erro: 'Erro ao ler arquivo CSV' });
        });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Process Excel file
      try {
        const fs = await import('fs');
        const fileBuffer = fs.default.readFileSync(file.path);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        empresas = processarDados(jsonData);
        
        // Clean temporary file
        fs.default.unlinkSync(file.path);
        
        res.json({
          sucesso: true,
          mensagem: `${empresas.length} empresas processadas com sucesso`,
          total: empresas.length
        });
      } catch (erro) {
        console.error('Erro ao processar Excel:', erro);
        res.status(500).json({ erro: 'Erro ao processar arquivo Excel' });
      }
    } else {
      // Clean temporary file
      const fs = await import('fs');
      fs.default.unlinkSync(file.path);
      res.status(400).json({ erro: 'Formato de arquivo não suportado. Use CSV ou Excel.' });
    }

  } catch (erro) {
    console.error('Erro no upload:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

// Export empresas for other API routes
export { empresas };