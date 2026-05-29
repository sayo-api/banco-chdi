import { useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Lock, Unlock, Shield } from 'lucide-react';

export default function PermissionsManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);

  const PAGES = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'Página inicial' },
    { id: 'soldiers', label: 'Militares', icon: '👤', desc: 'Gestão de militares' },
    { id: 'databases', label: 'Bancos de Dados', icon: '📁', desc: 'Consulta de dados' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/permissions');
      setUsers(r.data);
    } catch {
      toast.error('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePermission = async (userId, page) => {
    try {
      const user = users.find(u => u._id === userId);
      const currentValue = user.permissions?.[page] || false;
      
      await api.patch(`/permissions/user/${userId}/page/${page}`, {
        allowed: !currentValue
      });
      
      // Atualizar localmente
      setUsers(prev => prev.map(u => {
        if (u._id === userId) {
          return {
            ...u,
            permissions: {
              ...u.permissions,
              [page]: !currentValue
            }
          };
        }
        return u;
      }));
      
      toast.success(`Permissão atualizada`);
    } catch {
      toast.error('Erro ao atualizar permissão');
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ 
          fontFamily: "'Cinzel', serif", 
          fontSize: '0.9rem', 
          color: 'var(--gold)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12
        }}>
          <Shield size={16} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
          Gerenciar Permissões por Página
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Configure qual usuário tem acesso a quais páginas do sistema. Admins têm acesso total automaticamente.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div className="spinner" />
        </div>
      ) : users.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 14,
        }}>
          <Shield size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: "'Cinzel', serif", color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Nenhum usuário para gerenciar
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {users.map(user => (
            <div
              key={user._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              {/* User Header */}
              <button
                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: 'var(--gold)',
                }}>
                  {user.nomeDeGuerra[0]}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {user.nomeDeGuerra}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {Object.values(user.permissions || {}).filter(Boolean).length} / {PAGES.length} páginas autorizadas
                  </div>
                </div>
                <div style={{
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s',
                  transform: expandedUser === user._id ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </div>
              </button>

              {/* Expanded Permissions */}
              {expandedUser === user._id && (
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  padding: '16px 18px',
                  background: 'var(--bg-elevated)',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 12,
                }}>
                  {PAGES.map(page => {
                    const isAllowed = user.permissions?.[page.id] || false;
                    return (
                      <div
                        key={page.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: 'var(--bg-card)',
                          border: `1px solid ${isAllowed ? 'rgba(201,168,76,0.3)' : 'var(--border-subtle)'}`,
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{page.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.76rem', color: 'var(--text-primary)' }}>
                            {page.label}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {page.desc}
                          </div>
                        </div>
                        <button
                          onClick={() => togglePermission(user._id, page.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            border: `2px solid ${isAllowed ? 'var(--gold)' : 'var(--border-mid)'}`,
                            background: isAllowed ? 'rgba(201,168,76,0.15)' : 'var(--bg-input)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: isAllowed ? 'var(--gold)' : 'var(--text-muted)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--gold)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = isAllowed ? 'var(--gold)' : 'var(--border-mid)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {isAllowed ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
