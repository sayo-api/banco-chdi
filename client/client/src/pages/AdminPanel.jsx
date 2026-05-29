import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Plus, Settings, Users, Shield, ChevronDown, Lock } from 'lucide-react';
import PermissionsManager from '../components/PermissionsManager';

const TABS = [
  { id: 'pending', label: 'Registros Pendentes', icon: <Shield size={15} /> },
  { id: 'users',   label: 'Usuários',             icon: <Users size={15} /> },
  { id: 'permissions', label: 'Permissões',       icon: <Lock size={15} /> },
  { id: 'fields',  label: 'Campos Personalizados',icon: <Settings size={15} /> },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [users, setUsers]     = useState([]);
  const [fields, setFields]   = useState([]);
  const [loading, setLoading] = useState(false);

  // New field form
  const [newField, setNewField] = useState({ label:'', type:'text', required:false, options:'' });
  const [showNewField, setShowNewField] = useState(false);
  const [savingField, setSavingField] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'pending') { const r = await api.get('/auth/pending'); setPending(r.data); }
      if (tab === 'users')   { const r = await api.get('/auth/users');   setUsers(r.data); }
      if (tab === 'fields')  { const r = await api.get('/fields');       setFields(r.data); }
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async id => {
    await api.patch(`/auth/approve/${id}`);
    setPending(p => p.filter(u => u._id !== id));
    toast.success('Usuário aprovado');
  };

  const reject = async id => {
    await api.patch(`/auth/reject/${id}`);
    setPending(p => p.filter(u => u._id !== id));
    toast.success('Registro recusado');
  };

  const deleteUser = async id => {
    await api.delete(`/auth/users/${id}`);
    setUsers(p => p.filter(u => u._id !== id));
    toast.success('Usuário removido');
  };

  const deleteField = async id => {
    await api.delete(`/fields/${id}`);
    setFields(p => p.filter(f => f._id !== id));
    toast.success('Campo removido');
  };

  const addField = async () => {
    if (!newField.label.trim()) { toast.error('Nome do campo obrigatório'); return; }
    setSavingField(true);
    try {
      const payload = {
        label: newField.label,
        type: newField.type,
        required: newField.required,
        options: newField.type === 'select' ? newField.options.split(',').map(o => o.trim()).filter(Boolean) : [],
      };
      const { data } = await api.post('/fields', payload);
      setFields(p => [...p, data]);
      setNewField({ label:'', type:'text', required:false, options:'' });
      setShowNewField(false);
      toast.success('Campo adicionado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao criar campo');
    } finally {
      setSavingField(false);
    }
  };

  return (
    <div style={{ padding:'32px', maxWidth:1000, margin:'0 auto' }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.2em', marginBottom:8 }}>✦ PAINEL DO ADMINISTRADOR ✦</div>
        <h1 style={{
          fontFamily:"'Cinzel Decorative', serif", fontSize:'1.4rem',
          background:'linear-gradient(135deg, var(--ivory), var(--gold))',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>Administração do Sistema</h1>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:12, padding:6 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'10px 16px', borderRadius:8, border:'none',
            background: tab === t.id ? 'var(--bg-elevated)' : 'transparent',
            boxShadow: tab === t.id ? 'inset 0 0 0 1px var(--border-mid)' : 'none',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
            fontFamily:"'Cinzel', serif", fontSize:'0.68rem', letterSpacing:'0.07em',
            cursor:'pointer', transition:'all 0.18s',
          }}>
            {t.icon}{t.label}
            {t.id === 'pending' && pending.length > 0 && tab !== 'pending' && (
              <span style={{
                background:'var(--crimson)', color:'var(--ivory)',
                width:18, height:18, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.6rem', fontWeight:700,
              }}>{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Pending registrations */}
          {tab === 'pending' && (
            <div>
              {pending.length === 0 ? (
                <EmptyState icon={<Shield size={36} />} text="Nenhum registro pendente" />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {pending.map(u => (
                    <div key={u._id} style={{
                      display:'flex', alignItems:'center', gap:16,
                      background:'var(--bg-card)', border:'1px solid rgba(201,168,76,0.2)',
                      borderRadius:10, padding:'16px 18px',
                      animation:'fadeIn 0.3s ease forwards',
                    }}>
                      <div style={{
                        width:40, height:40, borderRadius:8, flexShrink:0,
                        background:'var(--bg-elevated)', border:'1px solid var(--border-mid)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:"'Cinzel', serif", fontSize:'0.85rem', color:'var(--gold)',
                      }}>{u.nomeDeGuerra[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.82rem', color:'var(--text-primary)', marginBottom:2 }}>{u.nomeDeGuerra}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                          Solicitado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <span className="badge badge-pending">PENDENTE</span>
                      <div style={{ display:'flex', gap:8 }}>
                        <ActionBtn onClick={() => approve(u._id)} color="green" icon={<Check size={14} />} label="Aprovar" />
                        <ActionBtn onClick={() => reject(u._id)} color="red" icon={<X size={14} />} label="Recusar" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Permissions */}
          {tab === 'permissions' && <PermissionsManager />}

          {/* Users list */}
          {tab === 'users' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {users.length === 0 ? (
                <EmptyState icon={<Users size={36} />} text="Nenhum usuário cadastrado" />
              ) : users.map(u => (
                <div key={u._id} style={{
                  display:'flex', alignItems:'center', gap:16,
                  background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
                  borderRadius:10, padding:'14px 18px',
                }}>
                  <div style={{
                    width:38, height:38, borderRadius:7, flexShrink:0,
                    background:'var(--bg-elevated)', border:'1px solid var(--border-mid)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:"'Cinzel', serif", fontSize:'0.78rem', color:'var(--gold)',
                  }}>{u.nomeDeGuerra[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.78rem', color:'var(--text-primary)', marginBottom:2 }}>{u.nomeDeGuerra}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Cadastro: {new Date(u.createdAt).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <span className={`badge badge-${u.status}`}>{u.status === 'approved' ? 'APROVADO' : u.status === 'pending' ? 'PENDENTE' : 'RECUSADO'}</span>
                  {u.status === 'pending' && <ActionBtn onClick={() => approve(u._id)} color="green" icon={<Check size={13} />} label="Aprovar" />}
                  <button onClick={() => deleteUser(u._id)} style={{
                    display:'flex', alignItems:'center', gap:5, padding:'7px 10px',
                    background:'none', border:'1px solid var(--border-subtle)',
                    borderRadius:7, color:'var(--text-muted)', cursor:'pointer', transition:'all 0.18s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--crimson)'; e.currentTarget.style.color='var(--text-crimson)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-muted)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom fields */}
          {tab === 'fields' && (
            <div>
              {/* Add button */}
              <div style={{ marginBottom:16 }}>
                <button onClick={() => setShowNewField(p => !p)} style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'10px 20px',
                  background: showNewField ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
                  border:`1px solid ${showNewField ? 'var(--border-mid)' : 'var(--crimson)'}`,
                  borderRadius:9, color:'var(--ivory)', cursor:'pointer',
                  fontFamily:"'Cinzel', serif", fontSize:'0.72rem', fontWeight:700,
                  letterSpacing:'0.1em', transition:'all 0.2s',
                  boxShadow: showNewField ? 'none' : '0 4px 16px rgba(139,13,32,0.3)',
                }}>
                  {showNewField ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Novo Campo</>}
                </button>
              </div>

              {/* New field form */}
              {showNewField && (
                <div style={{
                  background:'var(--bg-card)', border:'1px solid var(--border-mid)',
                  borderRadius:12, padding:22, marginBottom:16,
                  animation:'fadeIn 0.3s ease forwards',
                }}>
                  <div className="section-title" style={{ marginBottom:18 }}>Novo Campo Personalizado</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14 }}>
                    <FieldInput label="Nome do Campo">
                      <input
                        value={newField.label}
                        onChange={e => setNewField(p => ({ ...p, label: e.target.value }))}
                        placeholder="Ex: Sangue, Tamanho de Farda..."
                        style={inputSt}
                        onFocus={e => e.target.style.borderColor='var(--gold)'}
                        onBlur={e => e.target.style.borderColor='var(--border-mid)'}
                      />
                    </FieldInput>
                    <FieldInput label="Tipo">
                      <select value={newField.type} onChange={e => setNewField(p => ({ ...p, type: e.target.value }))} style={inputSt}>
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="date">Data</option>
                        <option value="select">Seleção (opções)</option>
                      </select>
                    </FieldInput>
                    {newField.type === 'select' && (
                      <FieldInput label="Opções (separadas por vírgula)" span>
                        <input
                          value={newField.options}
                          onChange={e => setNewField(p => ({ ...p, options: e.target.value }))}
                          placeholder="Opção 1, Opção 2, Opção 3"
                          style={inputSt}
                          onFocus={e => e.target.style.borderColor='var(--gold)'}
                          onBlur={e => e.target.style.borderColor='var(--border-mid)'}
                        />
                      </FieldInput>
                    )}
                    <FieldInput label="Obrigatório">
                      <div
                        onClick={() => setNewField(p => ({ ...p, required: !p.required }))}
                        style={{
                          display:'flex', alignItems:'center', gap:10, cursor:'pointer',
                          padding:'10px 13px', borderRadius:8,
                          background:'var(--bg-input)', border:`1px solid ${newField.required ? 'var(--gold)' : 'var(--border-mid)'}`,
                          transition:'all 0.2s',
                        }}
                      >
                        <div style={{
                          width:18, height:18, borderRadius:4,
                          background: newField.required ? 'var(--gold)' : 'var(--bg-elevated)',
                          border:`2px solid ${newField.required ? 'var(--gold)' : 'var(--border-mid)'}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          transition:'all 0.2s', flexShrink:0,
                        }}>
                          {newField.required && <Check size={10} color="var(--bg-void)" strokeWidth={3} />}
                        </div>
                        <span style={{ fontFamily:"'EB Garamond', serif", fontSize:'0.9rem', color: newField.required ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          Campo obrigatório
                        </span>
                      </div>
                    </FieldInput>
                  </div>
                  <button onClick={addField} disabled={savingField} style={{
                    marginTop:18, padding:'10px 24px',
                    background:'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
                    border:'1px solid var(--crimson)', borderRadius:8,
                    color:'var(--ivory)', cursor: savingField ? 'not-allowed' : 'pointer',
                    fontFamily:"'Cinzel', serif", fontSize:'0.72rem', fontWeight:700,
                    letterSpacing:'0.1em', display:'flex', alignItems:'center', gap:8,
                  }}>
                    {savingField ? <><div className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Salvando...</> : <><Plus size={15} /> Adicionar Campo</>}
                  </button>
                </div>
              )}

              {/* Existing fields */}
              {fields.length === 0 ? (
                <EmptyState icon={<Settings size={36} />} text="Nenhum campo personalizado criado" sub="Adicione campos para enriquecer o cadastro de militares" />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {fields.map(f => (
                    <div key={f._id} style={{
                      display:'flex', alignItems:'center', gap:14,
                      background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
                      borderRadius:10, padding:'14px 18px', transition:'all 0.18s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-mid)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-subtle)'}
                    >
                      <div style={{
                        padding:'6px 10px', borderRadius:6,
                        background:'var(--bg-elevated)', border:'1px solid var(--border-mid)',
                        fontFamily:"'Cinzel', serif", fontSize:'0.6rem', color:'var(--gold)',
                        letterSpacing:'0.08em',
                      }}>
                        {f.type === 'text' ? 'TXT' : f.type === 'number' ? 'NUM' : f.type === 'date' ? 'DATA' : 'SEL'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.76rem', color:'var(--text-primary)', marginBottom:2 }}>{f.label}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>
                          Chave: <code style={{ color:'var(--gold-dark)', fontFamily:'monospace' }}>{f.key}</code>
                          {f.required && <span style={{ marginLeft:8, color:'var(--text-crimson)' }}>• Obrigatório</span>}
                          {f.type === 'select' && f.options?.length > 0 && (
                            <span style={{ marginLeft:8, color:'var(--text-muted)' }}>• {f.options.join(', ')}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteField(f._id)} style={{
                        display:'flex', alignItems:'center', padding:'7px 10px',
                        background:'none', border:'1px solid var(--border-subtle)',
                        borderRadius:7, color:'var(--text-muted)', cursor:'pointer', transition:'all 0.18s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--crimson)'; e.currentTarget.style.color='var(--text-crimson)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-muted)'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActionBtn({ onClick, color, icon, label }) {
  const isGreen = color === 'green';
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:5, padding:'7px 14px',
      background: isGreen ? 'rgba(20,120,60,0.15)' : 'rgba(139,13,32,0.15)',
      border: `1px solid ${isGreen ? 'rgba(20,120,60,0.4)' : 'rgba(139,13,32,0.4)'}`,
      borderRadius:7, color: isGreen ? '#60D090' : 'var(--text-crimson)',
      cursor:'pointer', fontFamily:"'Cinzel', serif", fontSize:'0.65rem',
      letterSpacing:'0.07em', transition:'all 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity='0.8'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}
    >
      {icon}{label}
    </button>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div style={{
      textAlign:'center', padding:'48px 20px',
      background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
      borderRadius:14,
    }}>
      <div style={{ color:'var(--text-muted)', marginBottom:12 }}>{icon}</div>
      <div style={{ fontFamily:"'Cinzel', serif", color:'var(--text-muted)', fontSize:'0.82rem', marginBottom: sub ? 6 : 0 }}>{text}</div>
      {sub && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', opacity:0.7 }}>{sub}</div>}
    </div>
  );
}

function FieldInput({ label, children, span }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <label style={{ display:'block', marginBottom:7, fontFamily:"'Cinzel', serif", fontSize:'0.62rem', letterSpacing:'0.12em', color:'var(--gold)', textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

const inputSt = {
  width:'100%', padding:'10px 13px',
  background:'var(--bg-input)', border:'1px solid var(--border-mid)',
  borderRadius:8, color:'var(--text-primary)',
  fontSize:'0.9rem', outline:'none', transition:'border-color 0.2s',
};
