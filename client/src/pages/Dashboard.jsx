import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, PlusCircle, Shield, Activity, ChevronRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/soldiers/stats/overview').then(r => setStats(r.data)).catch(() => {});
    api.get('/soldiers?limit=5').then(r => setRecent(r.data.slice(0, 5))).catch(() => {});
    if (isAdmin) api.get('/auth/pending').then(r => setPending(r.data.length)).catch(() => {});
  }, [isAdmin]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div style={{ padding:'32px', maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:36, animation:'fadeIn 0.4s ease forwards' }}>
        <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.2em', marginBottom:8 }}>
          ✦ PAINEL DE CONTROLE ✦
        </div>
        <h1 style={{
          fontFamily:"'Cinzel Decorative', serif", fontSize:'1.6rem',
          background:'linear-gradient(135deg, var(--ivory), var(--gold))',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          letterSpacing:'0.05em', marginBottom:6,
        }}>
          {greeting}, {user?.nomeDeGuerra}
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>
          Centro Hípico Dragões da Independência — Sistema de Gestão
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:32 }}>
        <StatCard
          icon={<Users size={22} color="var(--gold)" />}
          label="Total de Militares"
          value={stats?.total ?? '—'}
          color="var(--gold)"
          delay={0}
        />
        <StatCard
          icon={<Activity size={22} color="#60D090" />}
          label="Graduações"
          value={stats?.byGraduacao?.length ?? '—'}
          color="#60D090"
          delay={0.05}
        />
        {isAdmin && (
          <StatCard
            icon={<Clock size={22} color="#E8C97A" />}
            label="Registros Pendentes"
            value={pending}
            color="#E8C97A"
            delay={0.1}
            alert={pending > 0}
            linkTo="/admin"
          />
        )}
        <StatCard
          icon={<Shield size={22} color="var(--crimson-light)" />}
          label="Campos Personalizados"
          value="Ilimitado"
          color="var(--crimson-light)"
          delay={0.15}
        />
      </div>

      {/* Quick actions + recent */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Quick actions */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
          borderRadius:14, padding:24, animation:'fadeIn 0.5s ease 0.2s both',
        }}>
          <div className="section-title" style={{ marginBottom:20 }}>Ações Rápidas</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <ActionLink to="/soldiers/new" icon={<PlusCircle size={18} />} label="Adicionar Militar" desc="Cadastrar novo registro" primary />
            <ActionLink to="/soldiers" icon={<Users size={18} />} label="Ver Banco de Dados" desc="Consultar todos os registros" />
            {isAdmin && <ActionLink to="/admin" icon={<Shield size={18} />} label="Administração" desc="Gerenciar usuários e campos" alert={pending > 0} alertCount={pending} />}
          </div>
        </div>

        {/* Recent soldiers */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
          borderRadius:14, padding:24, animation:'fadeIn 0.5s ease 0.25s both',
        }}>
          <div className="section-title" style={{ marginBottom:20 }}>Últimos Cadastros</div>
          {recent.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:'0.85rem', padding:'20px 0', fontFamily:"'Cinzel', serif" }}>
              Nenhum registro ainda
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {recent.map(s => (
                <Link key={s._id} to={`/soldiers/${s._id}`} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'10px 12px', borderRadius:8, textDecoration:'none',
                  background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
                  transition:'all 0.18s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.background='var(--bg-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.background='var(--bg-elevated)'; }}
                >
                  <div style={{
                    width:34, height:34, borderRadius:6, flexShrink:0,
                    background:'var(--crimson-deep)', border:'1px solid rgba(139,13,32,0.5)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:"'Cinzel', serif", fontSize:'0.7rem', color:'var(--gold)', fontWeight:700,
                  }}>{s.nomeDeGuerra?.[0] || s.nomeCompleto[0]}</div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.75rem', color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.nomeDeGuerra || s.nomeCompleto}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--gold)', letterSpacing:'0.05em' }}>{s.graduacao}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          )}
          {recent.length > 0 && (
            <Link to="/soldiers" style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              marginTop:14, padding:'8px', borderRadius:8,
              color:'var(--gold)', textDecoration:'none',
              fontFamily:"'Cinzel', serif", fontSize:'0.68rem',
              letterSpacing:'0.1em', transition:'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              Ver todos <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* Graduação breakdown */}
      {stats?.byGraduacao?.length > 0 && (
        <div style={{
          marginTop:20, background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
          borderRadius:14, padding:24, animation:'fadeIn 0.5s ease 0.3s both',
        }}>
          <div className="section-title" style={{ marginBottom:20 }}>Efetivo por Graduação</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {stats.byGraduacao.map(g => (
              <div key={g._id} style={{
                padding:'8px 18px', borderRadius:6,
                background:'var(--bg-elevated)', border:'1px solid var(--border-mid)',
                display:'flex', gap:12, alignItems:'center',
              }}>
                <span style={{ fontFamily:"'Cinzel', serif", fontSize:'0.72rem', color:'var(--text-secondary)' }}>{g._id}</span>
                <span style={{
                  background:'var(--crimson-deep)', color:'var(--gold)',
                  padding:'2px 8px', borderRadius:4,
                  fontFamily:"'Cinzel', serif", fontSize:'0.7rem', fontWeight:700,
                }}>{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, delay, alert, linkTo }) {
  const content = (
    <div style={{
      background:'var(--bg-card)', border:`1px solid ${alert ? color + '55' : 'var(--border-subtle)'}`,
      borderRadius:14, padding:'22px', animation:`fadeIn 0.5s ease ${delay}s both`,
      position:'relative', overflow:'hidden',
      boxShadow: alert ? `0 0 20px ${color}22` : 'none',
      transition:'all 0.2s',
    }}>
      <div style={{ position:'absolute', top:0, right:0, width:60, height:60,
        background:`radial-gradient(circle at top right, ${color}15, transparent 70%)` }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ padding:10, borderRadius:8, background:`${color}18`, border:`1px solid ${color}30` }}>{icon}</div>
        {alert && <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }} />}
      </div>
      <div style={{ fontFamily:"'Cinzel Decorative', serif", fontSize:'1.8rem', color, fontWeight:700, lineHeight:1, marginBottom:6 }}>{value}</div>
      <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{label}</div>
    </div>
  );
  if (linkTo) return <Link to={linkTo} style={{ textDecoration:'none' }}>{content}</Link>;
  return content;
}

function ActionLink({ to, icon, label, desc, primary, alert, alertCount }) {
  return (
    <Link to={to} style={{
      display:'flex', alignItems:'center', gap:14, padding:'12px 14px',
      borderRadius:9, textDecoration:'none',
      background: primary ? 'linear-gradient(135deg, var(--crimson-deep), rgba(139,13,32,0.5))' : 'var(--bg-elevated)',
      border: primary ? '1px solid var(--crimson)' : '1px solid var(--border-subtle)',
      transition:'all 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.transform='translateX(3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = primary ? 'var(--crimson)' : 'var(--border-subtle)'; e.currentTarget.style.transform='none'; }}
    >
      <div style={{ color: primary ? 'var(--gold-light)' : 'var(--gold)', flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.75rem', color: primary ? 'var(--ivory)' : 'var(--text-primary)', fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:1 }}>{desc}</div>
      </div>
      {alert && alertCount > 0 && (
        <div style={{
          background:'var(--crimson)', color:'var(--ivory)',
          width:20, height:20, borderRadius:'50%',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:"'Cinzel', serif", fontSize:'0.65rem', fontWeight:700,
        }}>{alertCount}</div>
      )}
      <ChevronRight size={14} color="var(--text-muted)" />
    </Link>
  );
}
