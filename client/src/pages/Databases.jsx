import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Database, Trash2, Settings, ChevronRight, Rows } from 'lucide-react';

const ICONS = ['📦','🗃️','⚔️','🐎','🛡️','📋','🔧','👔','🥾','🎒','🏕️','📊','🏇','🎖️','📁'];
const COLORS = [
  { label: 'Carmesim', value: '#8B0D20' },
  { label: 'Verde Militar', value: '#2D5A27' },
  { label: 'Azul Força', value: '#1A3A6B' },
  { label: 'Dourado', value: '#8A6010' },
  { label: 'Cinza Aço', value: '#4A5568' },
  { label: 'Marrom', value: '#6B4226' },
];

export default function Databases() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dbs, setDbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  // New DB form
  const [form, setForm] = useState({
    name: '', description: '', icon: '📦', color: '#8B0D20',
    columns: [
      { label: 'Item',        type: 'text',   required: true  },
      { label: 'Quantidade',  type: 'number', required: false },
      { label: 'Observações', type: 'text',   required: false },
    ],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/databases'); setDbs(r.data); }
    catch { toast.error('Erro ao carregar bancos de dados'); }
    finally { setLoading(false); }
  };

  const addColumn = () => setForm(p => ({ ...p, columns: [...p.columns, { label: '', type: 'text', required: false }] }));
  const removeCol = i => setForm(p => ({ ...p, columns: p.columns.filter((_, idx) => idx !== i) }));
  const updateCol = (i, field, val) => setForm(p => ({
    ...p, columns: p.columns.map((c, idx) => idx === i ? { ...c, [field]: val } : c),
  }));

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Nome obrigatório'); return; }
    if (form.columns.length === 0) { toast.error('Adicione pelo menos uma coluna'); return; }
    if (form.columns.some(c => !c.label.trim())) { toast.error('Todas as colunas precisam de nome'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/databases', form);
      setDbs(p => [{ ...data, entryCount: 0 }, ...p]);
      setShowCreate(false);
      setForm({ name: '', description: '', icon: '📦', color: '#8B0D20',
        columns: [
          { label: 'Item', type: 'text', required: true },
          { label: 'Quantidade', type: 'number', required: false },
          { label: 'Observações', type: 'text', required: false },
        ],
      });
      toast.success('Banco criado!');
      navigate(`/databases/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao criar');
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    try {
      await api.delete(`/databases/${id}`);
      setDbs(p => p.filter(d => d._id !== id));
      toast.success('Banco removido');
    } catch { toast.error('Erro ao remover'); }
    finally { setDelConfirm(null); }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.22em', marginBottom: 6 }}>✦ INVENTÁRIOS & REGISTROS ✦</div>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem', color: 'var(--text-primary)' }}>Bancos de Dados</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', borderRadius: 8,
            background: showCreate ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
            border: `1px solid ${showCreate ? 'var(--border-mid)' : 'var(--crimson-light)'}`,
            color: 'var(--ivory)', cursor: 'pointer',
            fontFamily: "'Cinzel', serif", fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.1em', boxShadow: showCreate ? 'none' : '0 3px 14px rgba(139,13,32,0.3)',
            transition: 'all 0.2s',
          }}>
            <Plus size={15} /> {showCreate ? 'Cancelar' : 'Novo Banco'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && isAdmin && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
          borderRadius: 14, overflow: 'hidden', marginBottom: 24,
          animation: 'fadeIn 0.3s ease forwards', boxShadow: 'var(--shadow-deep)',
        }}>
          {/* Form header */}
          <div style={{ padding: '14px 22px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={15} color="var(--text-gold)" />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.72rem', color: 'var(--text-gold)', letterSpacing: '0.12em' }}>NOVO BANCO DE DADOS</span>
          </div>
          <div style={{ padding: 22 }}>

            {/* Basic info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Nome do Banco</Label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Inventário da Subtenência, Armamento, Viaturas..."
                  style={inputSt} autoFocus
                  onFocus={e => e.target.style.borderColor = 'var(--crimson)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Breve descrição..."
                  style={inputSt}
                  onFocus={e => e.target.style.borderColor = 'var(--crimson)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                />
              </div>
              <div>
                <Label>Ícone & Cor</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                    style={{ ...inputSt, width: 80, fontSize: '1.1rem', textAlign: 'center', padding: '8px 6px' }}>
                    {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {COLORS.map(c => (
                      <button key={c.value} title={c.label} onClick={() => setForm(p => ({ ...p, color: c.value }))} style={{
                        width: 26, height: 26, borderRadius: '50%', border: '2px solid',
                        borderColor: form.color === c.value ? 'var(--text-primary)' : 'transparent',
                        background: c.value, cursor: 'pointer',
                        boxShadow: form.color === c.value ? '0 0 0 2px var(--bg-card)' : 'none',
                        transform: form.color === c.value ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Columns */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Label style={{ margin: 0 }}>Colunas da Tabela</Label>
                <button onClick={addColumn} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                  background: 'none', border: '1px solid var(--border-mid)',
                  borderRadius: 7, color: 'var(--text-gold)', cursor: 'pointer',
                  fontFamily: "'Cinzel', serif", fontSize: '0.65rem', letterSpacing: '0.08em',
                  transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--gold-glow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'none'; }}
                >
                  <Plus size={12} /> Adicionar Coluna
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.columns.map((col, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: 'var(--text-muted)', width: 18, flexShrink: 0 }}>{i + 1}</span>
                    <input value={col.label} onChange={e => updateCol(i, 'label', e.target.value)}
                      placeholder="Nome da coluna"
                      style={{ ...inputSt, flex: 1, padding: '7px 10px' }}
                      onFocus={e => e.target.style.borderColor = 'var(--crimson)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                    />
                    <select value={col.type} onChange={e => updateCol(i, 'type', e.target.value)}
                      style={{ ...inputSt, width: 110, padding: '7px 10px' }}>
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="date">Data</option>
                      <option value="select">Seleção</option>
                    </select>
                    <div onClick={() => updateCol(i, 'required', !col.required)} style={{
                      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                      fontFamily: "'Cinzel', serif", fontSize: '0.62rem', color: col.required ? 'var(--crimson)' : 'var(--text-muted)',
                      padding: '6px 10px', borderRadius: 6, border: '1px solid',
                      borderColor: col.required ? 'rgba(139,13,32,0.3)' : 'var(--border-subtle)',
                      background: col.required ? 'rgba(139,13,32,0.07)' : 'transparent',
                      transition: 'all 0.18s', userSelect: 'none', flexShrink: 0,
                    }}>
                      {col.required ? '★' : '☆'} Obrig.
                    </div>
                    {form.columns.length > 1 && (
                      <button onClick={() => removeCol(i)} style={{
                        background: 'none', border: '1px solid var(--border-subtle)',
                        borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
                        padding: '6px 8px', display: 'flex', alignItems: 'center',
                        transition: 'all 0.18s', flexShrink: 0,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--crimson)'; e.currentTarget.style.color = 'var(--text-crimson)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      ><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: 18, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>PRÉ-VISUALIZAÇÃO</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {form.columns.map((c, i) => (
                  <span key={i} style={{
                    padding: '3px 10px', borderRadius: 5,
                    background: `${form.color}18`, color: form.color,
                    border: `1px solid ${form.color}35`,
                    fontFamily: "'Cinzel', serif", fontSize: '0.62rem',
                  }}>
                    {c.label || `Coluna ${i + 1}`}
                    {c.required && <span style={{ marginLeft: 3, opacity: 0.7 }}>*</span>}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={handleCreate} disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 26px',
              background: 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
              border: '1px solid var(--crimson)', borderRadius: 9,
              color: 'var(--ivory)', cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Cinzel', serif", fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.1em', boxShadow: '0 3px 14px rgba(139,13,32,0.3)',
            }}>
              {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Criando...</> : <><Database size={14} /> Criar Banco</>}
            </button>
          </div>
        </div>
      )}

      {/* Database cards grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
      ) : dbs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14 }}>
          <Database size={40} color="var(--text-muted)" style={{ marginBottom: 14 }} />
          <div style={{ fontFamily: "'Cinzel', serif", color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nenhum banco de dados criado
          </div>
          {isAdmin && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6, opacity: 0.7 }}>Clique em "Novo Banco" para começar</div>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {dbs.map((db, i) => (
            <DBCard key={db._id} db={db} isAdmin={isAdmin}
              onDelete={() => setDelConfirm(db._id)}
              delConfirm={delConfirm === db._id}
              onDelCancel={() => setDelConfirm(null)}
              onDelConfirm={() => handleDelete(db._id)}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DBCard({ db, isAdmin, onDelete, delConfirm, onDelCancel, onDelConfirm, delay }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 14, overflow: 'hidden',
      animation: `fadeIn 0.35s ease ${delay}s both`,
      transition: 'all 0.2s', boxShadow: 'var(--shadow-deep)',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Color top strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${db.color}, ${db.color}88)` }} />

      <div style={{ padding: '18px 18px 14px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, flexShrink: 0,
            background: `${db.color}18`, border: `1px solid ${db.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>{db.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{db.name}</div>
            {db.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{db.description}</div>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Pill icon={<Rows size={11} />} label={`${db.entryCount} registro${db.entryCount !== 1 ? 's' : ''}`} color={db.color} />
          <Pill icon={<Settings size={11} />} label={`${db.columns.length} coluna${db.columns.length !== 1 ? 's' : ''}`} color={db.color} />
        </div>

        {/* Column preview */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {db.columns.slice(0, 5).map((c, i) => (
            <span key={i} style={{
              padding: '2px 8px', borderRadius: 4,
              background: `${db.color}12`, color: db.color,
              border: `1px solid ${db.color}28`,
              fontFamily: "'Cinzel', serif", fontSize: '0.58rem', letterSpacing: '0.05em',
            }}>{c.label}</span>
          ))}
          {db.columns.length > 5 && (
            <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--bg-surface)', color: 'var(--text-muted)', fontFamily: "'Cinzel', serif", fontSize: '0.58rem' }}>
              +{db.columns.length - 5}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/databases/${db._id}`} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '9px', borderRadius: 8, textDecoration: 'none',
            background: `linear-gradient(135deg, ${db.color}dd, ${db.color})`,
            color: '#FFFFFF', fontFamily: "'Cinzel', serif",
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
            boxShadow: `0 3px 12px ${db.color}40`, transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Abrir <ChevronRight size={13} />
          </Link>
          {isAdmin && (
            <>
              <Link to={`/databases/${db._id}/edit`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                background: 'var(--bg-surface)', border: '1px solid var(--border-mid)',
                color: 'var(--text-muted)', transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              ><Settings size={14} /></Link>
              {delConfirm ? (
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={onDelConfirm} style={{ padding: '7px 10px', borderRadius: 7, cursor: 'pointer', background: 'var(--crimson-deep)', border: '1px solid var(--crimson)', color: 'var(--ivory)', fontSize: '0.6rem', fontFamily: "'Cinzel', serif" }}>OK</button>
                  <button onClick={onDelCancel} style={{ padding: '7px 10px', borderRadius: 7, cursor: 'pointer', background: 'none', border: '1px solid var(--border-mid)', color: 'var(--text-muted)', fontSize: '0.6rem', fontFamily: "'Cinzel', serif" }}>✕</button>
                </div>
              ) : (
                <button onClick={onDelete} style={{
                  display: 'flex', alignItems: 'center', padding: '9px 11px',
                  background: 'none', border: '1px solid var(--border-subtle)',
                  borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--crimson)'; e.currentTarget.style.color = 'var(--text-crimson)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                ><Trash2 size={14} /></button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const Pill = ({ icon, label, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 9px', borderRadius: 5,
    background: `${color}12`, color: color,
    border: `1px solid ${color}25`,
    fontFamily: "'Cinzel', serif", fontSize: '0.63rem',
  }}>{icon}{label}</span>
);

const Label = ({ children, style }) => (
  <label style={{ display: 'block', marginBottom: 7, fontFamily: "'Cinzel', serif", fontSize: '0.63rem', letterSpacing: '0.14em', color: 'var(--text-gold)', textTransform: 'uppercase', ...style }}>{children}</label>
);

const inputSt = {
  width: '100%', padding: '9px 12px',
  background: 'var(--bg-input)', border: '1px solid var(--border-mid)',
  borderRadius: 8, color: 'var(--text-primary)',
  fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.2s',
};
