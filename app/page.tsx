"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BuscadorDecisoes() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [dadosOriginais, setDadosOriginais] = useState<any[]>([]);
  const [form, setForm] = useState({
    titulo: "",
    corte: "",
    pais: "",
    ano: "",
    trecho: "",
    tags: ""
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ordenacao, setOrdenacao] = useState("maisRecentes");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroCorte, setFiltroCorte] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const itensPorPagina = 5;

  const API_URL = "https://sheetdb.io/api/v1/jdx7njbnx8myo";

  const carregarDados = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const tratados = data.map((item: any) => ({
          id: item.id,
          titulo: item.titulo,
          corte: item.corte,
          pais: item.pais,
          ano: parseInt(item.ano) || 0,
          trecho: item.trecho,
          tags: item.tags
            ? item.tags.split(",").map((t: string) => t.trim().toLowerCase())
            : [],
        }));
        setDadosOriginais(tratados);
        setResultados(tratados);
        setPaginaAtual(1);
      });
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    let filtrados = dadosOriginais;
    const termos = busca.toLowerCase().split(" ").filter(Boolean);
    if (termos.length > 0) {
      filtrados = filtrados.filter((item) =>
        termos.every(
          (termo) =>
            item.titulo.toLowerCase().includes(termo) ||
            item.corte.toLowerCase().includes(termo) ||
            item.pais.toLowerCase().includes(termo) ||
            item.trecho.toLowerCase().includes(termo) ||
            item.tags.some((tag: string) => tag.includes(termo))
        )
      );
    }
    if (filtroPais) filtrados = filtrados.filter((i) => i.pais === filtroPais);
    if (filtroCorte) filtrados = filtrados.filter((i) => i.corte === filtroCorte);
    if (filtroAno) filtrados = filtrados.filter((i) => String(i.ano) === filtroAno);

    if (ordenacao === "maisRecentes") {
      filtrados = filtrados.sort((a, b) => b.ano - a.ano);
    } else if (ordenacao === "maisAntigos") {
      filtrados = filtrados.sort((a, b) => a.ano - b.ano);
    } else if (ordenacao === "pais") {
      filtrados = filtrados.sort((a, b) => a.pais.localeCompare(b.pais));
    } else if (ordenacao === "corte") {
      filtrados = filtrados.sort((a, b) => a.corte.localeCompare(b.corte));
    }
    setResultados(filtrados);
    setPaginaAtual(1);
  }, [busca, dadosOriginais, ordenacao, filtroPais, filtroCorte, filtroAno]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const novoRegistro = { data: form };
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoRegistro),
    });
    alert("Decisão inserida com sucesso!");
    setForm({ titulo: "", corte: "", pais: "", ano: "", trecho: "", tags: "" });
    carregarDados();
  };

  const destacarTermos = (texto: string) => {
    if (!busca.trim()) return texto;
    let resultado = texto;
    const termos = busca.toLowerCase().split(" ").filter(Boolean);
    termos.forEach((termo) => {
      const regex = new RegExp(`(${termo})`, "gi");
      resultado = resultado.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    });
    return resultado;
  };

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = paginaAtual * itensPorPagina;
  const paginaAtualResultados = resultados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(resultados.length / itensPorPagina);

  const opcoesPais = Array.from(new Set(dadosOriginais.map((i) => i.pais))).sort();
  const opcoesCorte = Array.from(new Set(dadosOriginais.map((i) => i.corte))).sort();
  const opcoesAno = Array.from(new Set(dadosOriginais.map((i) => String(i.ano)))).sort().reverse();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-center text-blue-900">Buscador de Decisões sobre Direitos Humanos</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Input
              placeholder="Palavras-chave, país, corte ou tag..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select value={filtroPais} onChange={(e) => setFiltroPais(e.target.value)} className="border p-2 rounded-md">
                <option value="">País</option>
                {opcoesPais.map((pais) => (
                  <option key={pais} value={pais}>{pais}</option>
                ))}
              </select>
              <select value={filtroCorte} onChange={(e) => setFiltroCorte(e.target.value)} className="border p-2 rounded-md">
                <option value="">Corte</option>
                {opcoesCorte.map((corte) => (
                  <option key={corte} value={corte}>{corte}</option>
                ))}
              </select>
              <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} className="border p-2 rounded-md">
                <option value="">Ano</option>
                {opcoesAno.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="border p-2 rounded-md"
              >
                <option value="maisRecentes">Mais recentes</option>
                <option value="maisAntigos">Mais antigos</option>
                <option value="pais">País (A-Z)</option>
                <option value="corte">Corte (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {paginaAtualResultados.map((item) => (
              <Card key={item.id} className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-4 space-y-2">
                  <h2 className="text-lg font-semibold text-blue-800" dangerouslySetInnerHTML={{ __html: destacarTermos(item.titulo) }} />
                  <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: destacarTermos(`${item.corte} — ${item.pais}, ${item.ano}`) }} />
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: destacarTermos(item.trecho) }} />
                  <div className="text-sm text-blue-700">
                    Tags: <span dangerouslySetInnerHTML={{ __html: destacarTermos(item.tags.join(", ")) }} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {paginaAtualResultados.length === 0 && (
              <p className="text-center text-gray-500">Nenhum resultado encontrado.</p>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                variant={num === paginaAtual ? "default" : "outline"}
                onClick={() => setPaginaAtual(num)}
                className="px-3 py-1 text-sm"
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <Button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="mb-3">
            {mostrarFormulario ? "Ocultar formulário" : "Inserir nova decisão"}
          </Button>

          {mostrarFormulario && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} />
              <Input name="corte" placeholder="Corte" value={form.corte} onChange={handleChange} />
              <Input name="pais" placeholder="País" value={form.pais} onChange={handleChange} />
              <Input name="ano" placeholder="Ano" value={form.ano} onChange={handleChange} />
              <textarea
                name="trecho"
                placeholder="Trecho da decisão"
                value={form.trecho}
                onChange={handleChange}
                className="w-full border rounded-md p-2 col-span-1 md:col-span-2"
              />
              <Input name="tags" placeholder="Tags (separadas por vírgula)" value={form.tags} onChange={handleChange} />
              <div className="md:col-span-2">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
