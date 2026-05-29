import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Search, PlusCircle, Trash2, Edit2, X,
  Filter, Users, ChevronUp, ChevronDown,
  ChevronsUpDown, FileDown,
} from 'lucide-react';

const GRADUACOES = [
  'Soldado','Cabo','3º Sargento','2º Sargento','1º Sargento',
  'Subtenente','Aspirante','2º Tenente','1º Tenente',
  'Capitão','Major','Tenente-Coronel','Coronel','General',
];

export default function Soldiers() {
  const { isAdmin } = useAuth();
  const [soldiers, setSoldiers]     = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [graduacao, setGraduacao]   = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [sort, setSort]             = useState({ col: 'graduacao', dir: 'asc' });
  const [page, setPage]             = useState(1);
  const PER_PAGE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)    params.search    = search;
      if (graduacao) params.graduacao = graduacao;
      const [solRes, fldRes] = await Promise.all([
        api.get('/soldiers', { params }),
        api.get('/fields'),
      ]);
      setSoldiers(solRes.data);
      setCustomFields(fldRes.data);
      setPage(1);
    } catch { toast.error('Erro ao carregar militares'); }
    finally { setLoading(false); }
  }, [search, graduacao]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const handleDelete = async id => {
    setDeleting(id);
    try {
      await api.delete(`/soldiers/${id}`);
      setSoldiers(p => p.filter(s => s._id !== id));
      toast.success('Registro removido');
    } catch { toast.error('Erro ao remover'); }
    finally { setDeleting(null); setShowConfirm(null); }
  };

  // Sorting
  const sorted = [...soldiers].sort((a, b) => {
    let av = a[sort.col] ?? '';
    let bv = b[sort.col] ?? '';
    // Ordinal sort for graduacao
    if (sort.col === 'graduacao') {
      av = GRADUACOES.indexOf(av);
      bv = GRADUACOES.indexOf(bv);
    }
    if (av < bv) return sort.dir === 'asc' ? -1 : 1;
    if (av > bv) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = col => {
    setSort(p => p.col === col ? { col, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' });
  };

  const SortIcon = ({ col }) => {
    if (sort.col !== col) return <ChevronsUpDown size={11} style={{ opacity: 0.35 }} />;
    return sort.dir === 'asc'
      ? <ChevronUp size={11} style={{ color: 'var(--crimson)' }} />
      : <ChevronDown size={11} style={{ color: 'var(--crimson)' }} />;
  };

  const exportCSV = () => {
    const baseHeaders = ['Graduação','Nome Completo','Nome de Guerra','Nº Registro','Subunidade','Telefone','Endereço','Data Incorporação'];
    const cfHeaders   = customFields.map(f => f.label);
    const allHeaders  = [...baseHeaders, ...cfHeaders];

    const rows = sorted.map(s => {
      const base = [
        s.graduacao, s.nomeCompleto, s.nomeDeGuerra, s.numeroRegistro,
        s.subunidade, s.telefone, s.endereco, s.dataIncorporacao,
      ].map(v => `"${(v || '').replace(/"/g, '""')}"`);
      const cf = customFields.map(f => `"${(s.customFields?.[f.key] || '').replace(/"/g, '""')}"`);
      return [...base, ...cf].join(',');
    });

    const csv  = [allHeaders.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = 'chdi_efetivo.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Column definitions ── */
  const BASE_COLS = [
    { key: 'graduacao',       label: 'Graduação',   sortable: true,  width: 130 },
    { key: 'nomeDeGuerra',    label: 'Nome de Guerra', sortable: true, width: 140 },
    { key: 'nomeCompleto',    label: 'Nome Completo',  sortable: true, width: 200 },
    { key: 'numeroRegistro',  label: 'Nº Registro',    sortable: false, width: 110 },
    { key: 'subunidade',      label: 'Subunidade',     sortable: true,  width: 140 },
    { key: 'telefone',        label: 'Telefone',        sortable: false, width: 130 },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1300, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.22em', marginBottom: 6 }}>✦ BANCO DE DADOS ✦</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem',
            color: 'var(--text-primary)', letterSpacing: '0.04em',
          }}>Efetivo do Quartel</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportCSV} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: "'Cinzel', serif", fontSize: '0.68rem',
            letterSpacing: '0.08em', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <FileDown size={14} /> Exportar CSV
          </button>
          <Link to="/soldiers/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', borderRadius: 8,
            background: 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
            border: '1px solid var(--crimson-light)',
            color: 'var(--ivory)', textDecoration: 'none',
            fontFamily: "'Cinzel', serif", fontSize: '0.7rem',
            fontWeight: 700, letterSpacing: '0.1em',
            boxShadow: '0 3px 14px rgba(139,13,32,0.3)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(139,13,32,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 14px rgba(139,13,32,0.3)'; }}
          >
            <PlusCircle size={15} /> Novo Registro
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap',
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 10, padding: '12px 14px',
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, graduação, registro..."
            style={{
              width: '100%', padding: '8px 34px',
              background: 'var(--bg-input)', border: '1px solid var(--border-mid)',
              borderRadius: 7, color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--crimson)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Graduação filter */}
        <div style={{ position: 'relative', minWidth: 170 }}>
          <Filter size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <select
            value={graduacao} onChange={e => setGraduacao(e.target.value)}
            style={{
              padding: '8px 12px 8px 30px', appearance: 'none',
              background: 'var(--bg-input)', border: '1px solid var(--border-mid)',
              borderRadius: 7, color: graduacao ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.85rem', outline: 'none', cursor: 'pointer', width: '100%',
            }}
          >
            <option value="">Todas as Graduações</option>
            {GRADUACOES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {(search || graduacao) && (
          <button onClick={() => { setSearch(''); setGraduacao(''); }} style={{
            padding: '8px 12px', background: 'none', border: '1px solid var(--border-subtle)',
            borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: "'Cinzel', serif", fontSize: '0.65rem', letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--crimson)'; e.currentTarget.style.color = 'var(--text-crimson)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={12} /> Limpar
          </button>
        )}

        {/* Count badge */}
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center',
          fontFamily: "'Cinzel', serif", fontSize: '0.65rem',
          color: 'var(--text-muted)', letterSpacing: '0.08em', gap: 6,
        }}>
          <span style={{
            background: 'var(--crimson-glow)', color: 'var(--crimson)',
            border: '1px solid rgba(139,13,32,0.2)',
            padding: '2px 10px', borderRadius: 20,
            fontWeight: 700, fontSize: '0.72rem',
          }}>{soldiers.length}</span>
          registro{soldiers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" />
        </div>
      ) : soldiers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 20px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12,
        }}>
          <Users size={38} color="var(--text-muted)" style={{ marginBottom: 14 }} />
          <div style={{ fontFamily: "'Cinzel', serif", color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            {search || graduacao ? 'Nenhum resultado encontrado' : 'Nenhum militar cadastrado'}
          </div>
          {!search && !graduacao && (
            <Link to="/soldiers/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 20px', background: 'var(--crimson-deep)',
              border: '1px solid var(--crimson)', borderRadius: 8,
              color: 'var(--ivory)', textDecoration: 'none',
              fontFamily: "'Cinzel', serif", fontSize: '0.7rem',
            }}>
              <PlusCircle size={14} /> Adicionar Primeiro Registro
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="chdi-table-wrap">
            <table className="chdi-table">
              <thead>
                <tr>
                  <th style={{ width: 36, padding: '13px 10px 13px 16px' }}>#</th>
                  {BASE_COLS.map(col => (
                    <th
                      key={col.key}
                      className={col.sortable ? 'sortable' : ''}
                      style={{ width: col.width }}
                      onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {col.label}
                        {col.sortable && <SortIcon col={col.key} />}
                      </div>
                    </th>
                  ))}
                  {customFields.map(f => (
                    <th key={f._id} style={{ minWidth: 120 }}>{f.label}</th>
                  ))}
                  <th style={{ width: 120, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => (
                  <tr key={s._id} style={{ animation: `fadeIn 0.25s ease ${i * 0.02}s both` }}>
                    <td style={{ padding: '12px 10px 12px 16px', color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: "'Cinzel', serif" }}>
                      {(page - 1) * PER_PAGE + i + 1}
                    </td>
                    <td className="td-grad">
                      <span className="grad-pill">{s.graduacao}</span>
                    </td>
                    <td className="td-name">{s.nomeDeGuerra || '—'}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{s.nomeCompleto}</td>
                    <td>{s.numeroRegistro || <Dash />}</td>
                    <td>{s.subunidade || <Dash />}</td>
                    <td>{s.telefone || <Dash />}</td>
                    {customFields.map(f => (
                      <td key={f._id}>{s.customFields?.[f.key] || <Dash />}</td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <Link to={`/soldiers/${s._id}`} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 11px', borderRadius: 6, textDecoration: 'none',
                          background: 'var(--bg-surface)', border: '1px solid var(--border-mid)',
                          color: 'var(--text-muted)', fontFamily: "'Cinzel', serif",
                          fontSize: '0.62rem', letterSpacing: '0.05em', transition: 'all 0.16s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--text-gold)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <Edit2 size={11} /> Editar
                        </Link>

                        {isAdmin && (
                          showConfirm === s._id ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => handleDelete(s._id)} disabled={deleting === s._id} style={{
                                padding: '5px 9px', borderRadius: 6, cursor: 'pointer',
                                background: 'var(--crimson-deep)', border: '1px solid var(--crimson)',
                                color: 'var(--ivory)', fontSize: '0.6rem',
                                fontFamily: "'Cinzel', serif",
                              }}>
                                {deleting === s._id ? '...' : 'OK'}
                              </button>
                              <button onClick={() => setShowConfirm(null)} style={{
                                padding: '5px 9px', borderRadius: 6, cursor: 'pointer',
                                background: 'none', border: '1px solid var(--border-mid)',
                                color: 'var(--text-muted)', fontSize: '0.6rem',
                                fontFamily: "'Cinzel', serif",
                              }}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setShowConfirm(s._id)} style={{
                              display: 'flex', alignItems: 'center', padding: '5px 8px',
                              background: 'none', border: '1px solid var(--border-subtle)',
                              borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
                              transition: 'all 0.16s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--crimson)'; e.currentTarget.style.color = 'var(--text-crimson)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                Página {page} de {totalPages} · {soldiers.length} registros
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <PageBtn onClick={() => setPage(1)}        disabled={page === 1}          label="«" />
                <PageBtn onClick={() => setPage(p => p-1)} disabled={page === 1}          label="‹" />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)} style={{
                      width: 32, height: 32, borderRadius: 7, border: '1px solid',
                      borderColor: p === page ? 'var(--crimson)' : 'var(--border-subtle)',
                      background: p === page ? 'var(--crimson-glow)' : 'var(--bg-card)',
                      color: p === page ? 'var(--crimson)' : 'var(--text-muted)',
                      cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: '0.72rem',
                      fontWeight: p === page ? 700 : 400,
                    }}>{p}</button>
                  );
                })}
                <PageBtn onClick={() => setPage(p => p+1)} disabled={page === totalPages} label="›" />
                <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const Dash = () => <span style={{ color: 'var(--text-muted)', opacity: 0.5, fontSize: '0.8rem' }}>—</span>;

const PageBtn = ({ onClick, disabled, label }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: 32, height: 32, borderRadius: 7,
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-card)', color: disabled ? 'var(--border-mid)' : 'var(--text-muted)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Cinzel', serif", fontSize: '0.8rem', transition: 'all 0.15s',
  }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = disabled ? 'var(--border-mid)' : 'var(--text-muted)'; }}
  >{label}</button>
);
