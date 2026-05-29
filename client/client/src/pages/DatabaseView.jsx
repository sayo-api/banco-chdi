import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Trash2, Check, X, Search,
  ChevronUp, ChevronDown, ChevronsUpDown, FileDown,
  Edit2, Save, Upload, List, AlertCircle,
} from 'lucide-react';

/* ─── helpers ───────────────────────────────────────────── */

/**
 * Parse a text list in the format:
 *   Item name (123)
 *   Another item (45)
 *   Plain item      ← no qty → quantity = ""
 *
 * Also accepts:
 *   Item name - 123
 *   Item name: 123
 */
function parseItemList(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    // Try "(number)" at end
    const parenMatch = line.match(/^(.+?)\s*[(\[]\s*(\d+[\d.,]*)\s*[)\]]\s*$/);
    if (parenMatch) return { item: parenMatch[1].trim(), qty: parenMatch[2].replace(',', '.') };

    // Try "item - number" or "item: number"
    const sepMatch = line.match(/^(.+?)\s*[-:]\s*(\d+[\d.,]*)\s*$/);
    if (sepMatch) return { item: sepMatch[1].trim(), qty: sepMatch[2].replace(',', '.') };

    // Just the name
    return { item: line, qty: '' };
  }).filter(r => r.item.length > 0);
}

/* ─── main component ────────────────────────────────────── */

export default function DatabaseView() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [db, setDb]           = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState({ col: null, dir: 'asc' });
  const [page, setPage]       = useState(1);
  const PER_PAGE = 20;

  // Inline add row
  const [addingRow, setAddingRow] = useState(false);
  const [newRow, setNewRow]       = useState({});
  const [savingRow, setSavingRow] = useState(false);

  // Inline edit
  const [editingId, setEditingId]   = useState(null);
  const [editValues, setEditValues] = useState({});

  // Delete confirm
  const [delConfirm, setDelConfirm] = useState(null);

  // ── Import list modal ──
  const [showImport, setShowImport]       = useState(false);
  const [importText, setImportText]       = useState('');
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting]         = useState(false);
  const [importColItem, setImportColItem] = useState('');
  const [importColQty, setImportColQty]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dbRes, entRes] = await Promise.all([
        api.get(`/databases/${id}`),
        api.get(`/databases/${id}/entries`, { params: search ? { search } : {} }),
      ]);
      setDb(dbRes.data);
      setEntries(entRes.data);
      setPage(1);

      // Auto-detect columns for import mapping
      const cols = dbRes.data.columns || [];
      const itemCol = cols.find(c =>
        c.type === 'text' && /item|nome|material|descri/i.test(c.label)
      ) || cols.find(c => c.type === 'text') || cols[0];
      const qtyCol = cols.find(c =>
        c.type === 'number' && /qtd|quant|qty|amount|total/i.test(c.label)
      ) || cols.find(c => c.type === 'number');

      setImportColItem(itemCol?.key || '');
      setImportColQty(qtyCol?.key || '');
    } catch {
      toast.error('Erro ao carregar');
      navigate('/databases');
    } finally { setLoading(false); }
  }, [id, search, navigate]);

  useEffect(() => { const t = setTimeout(load, search ? 300 : 0); return () => clearTimeout(t); }, [load]);

  // Update import preview whenever text or column mapping changes
  useEffect(() => {
    setImportPreview(parseItemList(importText));
  }, [importText]);

  /* ── sorting ── */
  const sorted = [...entries].sort((a, b) => {
    if (!sort.col) return 0;
    let av = a.data?.[sort.col] ?? '';
    let bv = b.data?.[sort.col] ?? '';
    const isNum = db?.columns?.find(c => c.key === sort.col)?.type === 'number';
    if (isNum) { av = parseFloat(av) || 0; bv = parseFloat(bv) || 0; }
    if (av < bv) return sort.dir === 'asc' ? -1 : 1;
    if (av > bv) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const toggleSort = col => setSort(p =>
    p.col === col ? { col, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' }
  );

  const SortIcon = ({ col }) => {
    if (sort.col !== col) return <ChevronsUpDown size={10} style={{ opacity: 0.3 }} />;
    return sort.dir === 'asc'
      ? <ChevronUp size={10} style={{ color: 'var(--crimson)' }} />
      : <ChevronDown size={10} style={{ color: 'var(--crimson)' }} />;
  };

  /* ── add row ── */
  const handleAddRow = async () => {
    const missing = db.columns.filter(c => c.required && !newRow[c.key]?.trim?.());
    if (missing.length > 0) { toast.error(`Preencha: ${missing.map(c => c.label).join(', ')}`); return; }
    setSavingRow(true);
    try {
      const { data } = await api.post(`/databases/${id}/entries`, { data: newRow });
      setEntries(p => [data, ...p]);
      setNewRow({});
      setAddingRow(false);
      toast.success('Registro adicionado');
    } catch { toast.error('Erro ao adicionar'); }
    finally { setSavingRow(false); }
  };

  /* ── edit row ── */
  const startEdit = (entry) => {
    setEditingId(entry._id);
    const vals = {};
    if (entry.data) Object.entries(entry.data).forEach(([k, v]) => { vals[k] = v; });
    setEditValues(vals);
  };

  const saveEdit = async (entryId) => {
    try {
      const { data } = await api.put(`/databases/${id}/entries/${entryId}`, { data: editValues });
      setEntries(p => p.map(e => e._id === entryId ? data : e));
      setEditingId(null);
      toast.success('Atualizado');
    } catch { toast.error('Erro ao salvar'); }
  };

  /* ── delete row ── */
  const handleDelete = async (entryId) => {
    try {
      await api.delete(`/databases/${id}/entries/${entryId}`);
      setEntries(p => p.filter(e => e._id !== entryId));
      toast.success('Removido');
    } catch { toast.error('Erro ao remover'); }
    finally { setDelConfirm(null); }
  };

  /* ── export CSV ── */
  const exportCSV = () => {
    if (!db) return;
    const headers = db.columns.map(c => c.label);
    const rows = sorted.map(e =>
      db.columns.map(c => `"${(e.data?.[c.key] || '').toString().replace(/"/g, '""')}"`).join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `${db.name.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  /* ── bulk import ── */
  const handleImport = async () => {
    if (importPreview.length === 0) { toast.error('Nenhum item para importar'); return; }
    if (!importColItem) { toast.error('Selecione a coluna de Item'); return; }

    setImporting(true);
    try {
      const entries = importPreview.map(row => {
        const data = {};
        data[importColItem] = row.item;
        if (importColQty && row.qty !== '') {
          data[importColQty] = parseFloat(row.qty);
        }
        return data;
      });

      const { data: result } = await api.post(`/databases/${id}/entries/bulk`, { entries });
      toast.success(`${result.inserted} itens importados com sucesso!`);
      setShowImport(false);
      setImportText('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao importar');
    } finally { setImporting(false); }
  };

  /* ── numeric totals ── */
  const totals = db?.columns?.reduce((acc, col) => {
    if (col.type === 'number') {
      acc[col.key] = entries.reduce((s, e) => s + (parseFloat(e.data?.[col.key]) || 0), 0);
    }
    return acc;
  }, {});

  /* ── loading guard ── */
  if (loading && !db) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!db) return null;

  /* ─────────────────────────────────────────────────────── */
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1300, margin: '0 auto' }}>

      {/* ── Import modal overlay ── */}
      {showImport && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setShowImport(false); }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
            borderRadius: 16, width: '100%', maxWidth: 680,
            boxShadow: 'var(--shadow-deep)',
            animation: 'fadeIn 0.2s ease forwards',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)', borderRadius: '16px 16px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <List size={16} color="var(--text-gold)" />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.75rem', color: 'var(--text-gold)', letterSpacing: '0.14em' }}>
                  IMPORTAR LISTA DE ITENS
                </span>
              </div>
              <button onClick={() => setShowImport(false)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6,
                transition: 'color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              ><X size={18} /></button>
            </div>

            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

              {/* Instruction */}
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: `${db.color}10`, border: `1px solid ${db.color}28`,
                fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: 'var(--text-muted)',
                letterSpacing: '0.04em', lineHeight: 1.7,
              }}>
                Cole a lista abaixo. Formatos aceitos:<br />
                <span style={{ color: db.color }}>Manta leve (116)</span>
                {' · '}
                <span style={{ color: db.color }}>Chinela - 12</span>
                {' · '}
                <span style={{ color: db.color }}>Cantil/Caneco: 444</span>
                {' · '}
                <span style={{ color: db.color }}>Item sem quantidade</span>
              </div>

              {/* Textarea */}
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={
                  "Manta leve (116)\nChinela (12)\nMeia branca (35)\nMijões (45)\nCamisa camuflada (7)"
                }
                style={{
                  width: '100%', minHeight: 180, padding: '12px 14px',
                  background: 'var(--bg-input)', border: `1px solid ${db.color}40`,
                  borderRadius: 10, color: 'var(--text-primary)',
                  fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'monospace', lineHeight: 1.7,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = db.color}
                onBlur={e => e.target.style.borderColor = `${db.color}40`}
                autoFocus
              />

              {/* Column mapping */}
              {db.columns.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  <div>
                    <ILabel>Coluna → Item/Nome</ILabel>
                    <select value={importColItem} onChange={e => setImportColItem(e.target.value)}
                      style={selectSt}>
                      <option value="">— Não importar —</option>
                      {db.columns.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <ILabel>Coluna → Quantidade</ILabel>
                    <select value={importColQty} onChange={e => setImportColQty(e.target.value)}
                      style={selectSt}>
                      <option value="">— Não importar —</option>
                      {db.columns.filter(c => c.type === 'number').map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Preview */}
              {importPreview.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: '0.62rem',
                    color: 'var(--text-gold)', letterSpacing: '0.14em', marginBottom: 10,
                  }}>
                    PRÉ-VISUALIZAÇÃO · {importPreview.length} ITEM{importPreview.length !== 1 ? 'S' : ''}
                  </div>
                  <div style={{
                    maxHeight: 220, overflowY: 'auto',
                    border: '1px solid var(--border-subtle)', borderRadius: 10,
                    background: 'var(--bg-surface)',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontFamily: "'Cinzel', serif", fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>#</th>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontFamily: "'Cinzel', serif", fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>ITEM</th>
                          <th style={{ padding: '8px 14px', textAlign: 'right', fontFamily: "'Cinzel', serif", fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>QTD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.12s' }}
                            onMouseEnter={e => e.currentTarget.style.background = `${db.color}08`}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '7px 14px', fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                            <td style={{ padding: '7px 14px', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{row.item}</td>
                            <td style={{ padding: '7px 14px', textAlign: 'right', fontFamily: "'Cinzel', serif", fontSize: '0.8rem', fontWeight: 700, color: row.qty !== '' ? db.color : 'var(--text-muted)' }}>
                              {row.qty !== '' ? row.qty : <span style={{ opacity: 0.35, fontWeight: 400 }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{
              padding: '14px 24px', borderTop: '1px solid var(--border-subtle)',
              display: 'flex', gap: 10, justifyContent: 'flex-end',
              background: 'var(--bg-elevated)', borderRadius: '0 0 16px 16px',
            }}>
              <button onClick={() => { setShowImport(false); setImportText(''); }} style={{
                padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                background: 'none', border: '1px solid var(--border-mid)',
                color: 'var(--text-muted)',
                fontFamily: "'Cinzel', serif", fontSize: '0.68rem',
              }}>Cancelar</button>
              <button onClick={handleImport} disabled={importing || importPreview.length === 0} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 22px', borderRadius: 8, cursor: importing ? 'not-allowed' : 'pointer',
                background: importPreview.length > 0
                  ? `linear-gradient(135deg, ${db.color}cc, ${db.color})`
                  : 'var(--bg-surface)',
                border: `1px solid ${importPreview.length > 0 ? db.color : 'var(--border-mid)'}`,
                color: importPreview.length > 0 ? '#fff' : 'var(--text-muted)',
                fontFamily: "'Cinzel', serif", fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.08em',
                boxShadow: importPreview.length > 0 ? `0 3px 14px ${db.color}40` : 'none',
                opacity: importing ? 0.7 : 1,
                transition: 'all 0.2s',
              }}>
                {importing
                  ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Importando...</>
                  : <><Upload size={14} /> Importar {importPreview.length > 0 ? `${importPreview.length} Itens` : ''}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/databases" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 14px', background: 'none',
            border: '1px solid var(--border-mid)', borderRadius: 8,
            color: 'var(--text-muted)', textDecoration: 'none',
            fontFamily: "'Cinzel', serif", fontSize: '0.66rem',
            letterSpacing: '0.07em', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={13} /> Bancos
          </Link>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${db.color}18`, border: `1px solid ${db.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{db.icon}</div>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.18em', marginBottom: 4 }}>INVENTÁRIO</div>
            <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.2rem', color: 'var(--text-primary)' }}>{db.name}</h1>
            {db.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{db.description}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={exportCSV} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: "'Cinzel', serif", fontSize: '0.66rem', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <FileDown size={14} /> CSV
          </button>

          {/* ── Import List button ── */}
          <button onClick={() => { setImportText(''); setShowImport(true); }} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8,
            background: 'var(--bg-card)', border: `1px solid ${db.color}50`,
            color: db.color, cursor: 'pointer',
            fontFamily: "'Cinzel', serif", fontSize: '0.66rem', letterSpacing: '0.06em',
            transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = db.color; e.currentTarget.style.background = `${db.color}12`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${db.color}50`; e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            <List size={14} /> Importar Lista
          </button>

          <button onClick={() => { setAddingRow(true); setNewRow({}); }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 8,
            background: `linear-gradient(135deg, ${db.color}cc, ${db.color})`,
            border: `1px solid ${db.color}`, color: '#FFF',
            cursor: 'pointer', fontFamily: "'Cinzel', serif",
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
            boxShadow: `0 3px 14px ${db.color}40`, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
          >
            <Plus size={15} /> Novo Registro
          </button>
        </div>
      </div>

      {/* ── Filters + stats bar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nos registros..."
            style={{ width: '100%', padding: '8px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.87rem', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = db.color}
            onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
          />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={13} /></button>}
        </div>

        {db.columns.filter(c => c.type === 'number').map(col => (
          <div key={col.key} style={{
            padding: '6px 14px', borderRadius: 8,
            background: `${db.color}12`, border: `1px solid ${db.color}28`,
            fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: db.color,
          }}>
            Total {col.label}: <strong>{totals?.[col.key] ?? 0}</strong>
          </div>
        ))}

        <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {entries.length} reg.
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner" /></div>
      ) : (
        <>
          <div className="chdi-table-wrap">
            <table className="chdi-table">
              <thead>
                <tr>
                  <th style={{ width: 36, padding: '12px 10px 12px 14px' }}>#</th>
                  {db.columns.map(col => (
                    <th key={col.key} className="sortable" style={{ minWidth: col.width || 120 }} onClick={() => toggleSort(col.key)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {col.label} <SortIcon col={col.key} />
                      </div>
                    </th>
                  ))}
                  <th style={{ width: 110, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {/* Add row inline */}
                {addingRow && (
                  <tr style={{ background: `${db.color}08` }}>
                    <td style={{ padding: '8px 10px 8px 14px' }}>
                      <Plus size={13} color={db.color} />
                    </td>
                    {db.columns.map(col => (
                      <td key={col.key} style={{ padding: '6px 8px' }}>
                        <InlineInput col={col} value={newRow[col.key] || ''} color={db.color}
                          onChange={val => setNewRow(p => ({ ...p, [col.key]: val }))}
                        />
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                        <button onClick={handleAddRow} disabled={savingRow} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: `${db.color}cc`, border: 'none', color: '#fff', fontFamily: "'Cinzel', serif", fontSize: '0.62rem' }}>
                          {savingRow ? '...' : <><Check size={12} /> Salvar</>}
                        </button>
                        <button onClick={() => { setAddingRow(false); setNewRow({}); }} style={{ padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: 'none', border: '1px solid var(--border-mid)', color: 'var(--text-muted)', display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {paginated.length === 0 && !addingRow ? (
                  <tr>
                    <td colSpan={db.columns.length + 2} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: "'Cinzel', serif", fontSize: '0.8rem' }}>
                      {search
                        ? 'Nenhum resultado encontrado.'
                        : <>Nenhum registro. Use <strong style={{ color: db.color }}>Importar Lista</strong> para adicionar em massa ou clique em <strong style={{ color: db.color }}>+ Novo Registro</strong>.</>
                      }
                    </td>
                  </tr>
                ) : paginated.map((entry, i) => (
                  <tr key={entry._id} style={{ animation: `fadeIn 0.2s ease ${i * 0.02}s both` }}>
                    <td style={{ padding: '10px 10px 10px 14px', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: "'Cinzel', serif" }}>
                      {(page - 1) * PER_PAGE + i + 1}
                    </td>
                    {db.columns.map(col => (
                      <td key={col.key} style={{ padding: editingId === entry._id ? '6px 8px' : '10px 16px' }}>
                        {editingId === entry._id ? (
                          <InlineInput col={col} value={editValues[col.key] || ''} color={db.color}
                            onChange={val => setEditValues(p => ({ ...p, [col.key]: val }))}
                          />
                        ) : (
                          <CellValue col={col} value={entry.data?.[col.key]} color={db.color} />
                        )}
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                        {editingId === entry._id ? (
                          <>
                            <button onClick={() => saveEdit(entry._id)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: `${db.color}cc`, border: 'none', color: '#fff', fontFamily: "'Cinzel', serif", fontSize: '0.6rem' }}>
                              <Save size={11} /> OK
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: 'none', border: '1px solid var(--border-mid)', color: 'var(--text-muted)', display: 'flex' }}>
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(entry)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', color: 'var(--text-muted)', fontFamily: "'Cinzel', serif", fontSize: '0.6rem', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-gold)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            ><Edit2 size={11} /></button>
                            {delConfirm === entry._id ? (
                              <>
                                <button onClick={() => handleDelete(entry._id)} style={{ padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: 'var(--crimson-deep)', border: '1px solid var(--crimson)', color: 'var(--ivory)', fontSize: '0.6rem', fontFamily: "'Cinzel', serif" }}>OK</button>
                                <button onClick={() => setDelConfirm(null)} style={{ padding: '5px 7px', borderRadius: 6, cursor: 'pointer', background: 'none', border: '1px solid var(--border-mid)', color: 'var(--text-muted)', display: 'flex' }}><X size={11} /></button>
                              </>
                            ) : (
                              <button onClick={() => setDelConfirm(entry._id)} style={{ display: 'flex', padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--crimson)'; e.currentTarget.style.color = 'var(--text-crimson)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                              ><Trash2 size={12} /></button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals footer */}
              {db.columns.some(c => c.type === 'number') && entries.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--table-header-bg)', borderTop: '2px solid var(--border-mid)' }}>
                    <td style={{ padding: '10px 10px 10px 14px', fontFamily: "'Cinzel', serif", fontSize: '0.62rem', color: db.color, letterSpacing: '0.1em' }}>TOTAL</td>
                    {db.columns.map(col => (
                      <td key={col.key} style={{ padding: '10px 16px' }}>
                        {col.type === 'number' ? (
                          <strong style={{ fontFamily: "'Cinzel', serif", fontSize: '0.8rem', color: db.color }}>
                            {totals?.[col.key] ?? 0}
                          </strong>
                        ) : null}
                      </td>
                    ))}
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                Página {page} / {totalPages} · {entries.length} registros
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {[1, page - 1, ...Array.from({ length: 3 }, (_, i) => page + i - 1), page + 1, totalPages]
                  .filter((p, i, a) => p >= 1 && p <= totalPages && a.indexOf(p) === i)
                  .sort((a, b) => a - b)
                  .map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{
                      width: 30, height: 30, borderRadius: 6, border: '1px solid',
                      borderColor: p === page ? db.color : 'var(--border-subtle)',
                      background: p === page ? `${db.color}18` : 'var(--bg-card)',
                      color: p === page ? db.color : 'var(--text-muted)',
                      cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: '0.7rem',
                      fontWeight: p === page ? 700 : 400,
                    }}>{p}</button>
                  ))
                }
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── sub-components ─────────────────────────────────────── */

function InlineInput({ col, value, onChange, color }) {
  const st = {
    width: '100%', padding: '6px 9px',
    background: 'var(--bg-input)', border: `1px solid ${color}50`,
    borderRadius: 6, color: 'var(--text-primary)',
    fontSize: '0.85rem', outline: 'none',
  };
  if (col.type === 'select') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={st}>
      <option value="">—</option>
      {col.options?.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  return (
    <input
      type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={col.label}
      style={{ ...st, colorScheme: col.type === 'date' ? 'dark' : undefined }}
      autoFocus={col.order === 0}
    />
  );
}

function CellValue({ col, value, color }) {
  if (!value && value !== 0) return <span style={{ color: 'var(--text-muted)', opacity: 0.4, fontSize: '0.8rem' }}>—</span>;
  if (col.type === 'number') return (
    <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.82rem', color, fontWeight: 600 }}>{value}</span>
  );
  if (col.type === 'date') return (
    <span style={{ fontSize: '0.83rem' }}>{new Date(value + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
  );
  return <span style={{ fontSize: '0.88rem' }}>{value}</span>;
}

const ILabel = ({ children }) => (
  <label style={{ display: 'block', marginBottom: 6, fontFamily: "'Cinzel', serif", fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--text-gold)', textTransform: 'uppercase' }}>{children}</label>
);

const selectSt = {
  width: '100%', padding: '8px 12px',
  background: 'var(--bg-input)', border: '1px solid var(--border-mid)',
  borderRadius: 8, color: 'var(--text-primary)',
  fontSize: '0.85rem', outline: 'none',
};
