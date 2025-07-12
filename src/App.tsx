import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Upload, FileText, Building2, ExternalLink, Trash2, Home } from 'lucide-react';

interface Empresa {
  id: number;
  razaoSocial: string;
  cnpj: string;
  url: string;
}

function HomePage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      }
    } catch (erro) {
      console.error('Erro ao carregar empresas:', erro);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      setMensagem('');
    }
  };

  const handleUpload = async () => {
    if (!arquivo) {
      setMensagem('Por favor, selecione um arquivo');
      return;
    }

    setCarregando(true);
    setMensagem('');

    const formData = new FormData();
    formData.append('planilha', arquivo);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMensagem(`✅ ${result.mensagem}`);
        setArquivo(null);
        // Resetar o input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Recarregar empresas
        await carregarEmpresas();
      } else {
        setMensagem(`❌ Erro: ${result.erro}`);
      }
    } catch (erro) {
      setMensagem('❌ Erro ao enviar arquivo');
      console.error('Erro:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const limparDados = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
      try {
        await fetch('/api/empresas', {
          method: 'DELETE',
        });
        setEmpresas([]);
        setMensagem('✅ Dados limpos com sucesso');
      } catch (erro) {
        setMensagem('❌ Erro ao limpar dados');
        console.error('Erro:', erro);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Processador de Planilhas CNPJ
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Faça upload de planilhas CSV ou Excel com dados de empresas
          </p>
          <div className="mt-2 text-sm text-gray-500">
            <p>✨ Versão serverless - dados temporários em memória</p>
          </div>
        </div>

        {/* Seção de Upload */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Upload className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Upload de Planilha
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-4">
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500">
                  Formatos suportados: CSV, Excel (.xlsx, .xls)
                </p>
                <p className="text-xs text-gray-400">
                  Certifique-se de que a planilha contém as colunas: "Razão Social" e "CNPJ"
                </p>
              </div>
            </div>

            {arquivo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Arquivo selecionado:</strong> {arquivo.name}
                </p>
                <p className="text-sm text-blue-600">
                  Tamanho: {(arquivo.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!arquivo || carregando}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {carregando ? 'Processando...' : 'Processar Planilha'}
            </button>

            {mensagem && (
              <div className={`p-4 rounded-lg ${
                mensagem.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {mensagem}
              </div>
            )}
          </div>
        </div>

        {/* Lista de Empresas */}
        {empresas.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  Empresas Processadas ({empresas.length})
                </h2>
              </div>
              <button
                onClick={limparDados}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Dados
              </button>
            </div>

            <div className="grid gap-4">
              {empresas.map((empresa) => (
                <div
                  key={empresa.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/empresa/${empresa.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {empresa.razaoSocial}
                      </h3>
                      <p className="text-sm text-gray-600">
                        CNPJ: {empresa.cnpj}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-blue-600">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmpresaPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.location.pathname.split('/')[2];
    carregarEmpresa(id);
  }, []);

  const carregarEmpresa = async (id: string) => {
    try {
      const response = await fetch(`/api/empresa/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setEmpresa(data);
      } else {
        setErro('Empresa não encontrada');
      }
    } catch (erro) {
      setErro('Erro ao carregar empresa');
      console.error('Erro:', erro);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando empresa...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
            <p className="text-red-600 mb-4">{erro}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Início
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Building2 className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Detalhes da Empresa
            </h1>
          </div>

          {empresa && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Informações da Empresa
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Razão Social
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {empresa.razaoSocial}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      CNPJ
                    </label>
                    <p className="text-lg font-mono text-gray-900">
                      {empresa.cnpj}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      ID
                    </label>
                    <p className="text-sm text-gray-500">
                      {empresa.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  Link Gerado
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-sm text-gray-600 mb-1">URL:</p>
                    <p className="font-mono text-sm text-blue-600 break-all">
                      {empresa.url}
                    </p>
                  </div>
                  <a
                    href={empresa.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Link
                  </a>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Os dados são armazenados em memória e serão perdidos quando o servidor for reiniciado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/empresa/:id" element={<EmpresaPage />} />
      </Routes>
    </Router>
  );
}

export default App;