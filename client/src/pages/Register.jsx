import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ nomeDeGuerra: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('As senhas não coincidem'); return; }
    if (form.password.length < 6) { toast.error('Senha mínima de 6 caracteres'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { nomeDeGuerra: form.nomeDeGuerra, password: form.password });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,13,32,0.18) 0%, transparent 65%), var(--bg-void)',
      padding:20,
    }}>
      <div style={{ textAlign:'center', animation:'fadeIn 0.5s ease forwards', maxWidth:400 }}>
        <div style={{ fontSize:'3rem', marginBottom:16 }}>⚔️</div>
        <h2 style={{ fontFamily:"'Cinzel Decorative', serif", color:'var(--gold)', marginBottom:12 }}>Solicitação Enviada</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.95rem', lineHeight:1.7, marginBottom:24 }}>
          Seu registro foi enviado ao administrador. Aguarde a aprovação para acessar o sistema.
        </p>
        <Link to="/login" style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'11px 24px', background:'var(--crimson-deep)',
          border:'1px solid var(--crimson)', borderRadius:8,
          color:'var(--ivory)', textDecoration:'none',
          fontFamily:"'Cinzel', serif", fontSize:'0.75rem',
          letterSpacing:'0.1em',
        }}>
          <ArrowLeft size={15} /> Voltar ao Login
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,13,32,0.18) 0%, transparent 65%), var(--bg-void)',
      padding:20,
    }}>
      <div style={{ width:'100%', maxWidth:420, animation:'fadeIn 0.5s ease forwards' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:80, height:80, margin:'0 auto 16px',
            background:'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
            border:'1px solid var(--border-mid)', borderRadius:12,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'var(--shadow-gold)',
          }}>
            <UserPlus size={34} color="var(--gold)" strokeWidth={1.5} />
          </div>
          <h1 style={{
            fontFamily:"'Cinzel', serif", fontSize:'1.1rem',
            color:'var(--gold-light)', letterSpacing:'0.1em', marginBottom:6,
          }}>Solicitar Acesso</h1>
          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:"'Cinzel', serif", letterSpacing:'0.05em' }}>
            Seu registro será revisado pelo administrador
          </p>
        </div>

        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border-mid)',
          borderRadius:16, padding:'32px', boxShadow:'var(--shadow-deep)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <Field label="Nome de Guerra">
              <input
                value={form.nomeDeGuerra}
                onChange={e => setForm(p => ({ ...p, nomeDeGuerra: e.target.value.toUpperCase() }))}
                placeholder="SEU NOME DE GUERRA"
                required autoFocus
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
            </Field>

            <Field label="Senha">
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  required
                  style={{ ...inputStyle, paddingRight:46 }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar Senha">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repita a senha"
                required
                style={{
                  ...inputStyle,
                  borderColor: form.confirm && form.confirm !== form.password ? 'var(--crimson)' : 'var(--border-mid)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = form.confirm !== form.password ? 'var(--crimson)' : 'var(--border-mid)'}
              />
            </Field>

            <button type="submit" disabled={loading} style={{
              marginTop:8, width:'100%', padding:'13px',
              background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
              border:'1px solid var(--crimson)', borderRadius:8,
              color:'var(--ivory)', fontFamily:"'Cinzel', serif",
              fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.15em',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow:'0 4px 20px rgba(139,13,32,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              transition:'all 0.2s',
            }}>
              {loading ? <><div className="spinner" style={{ width:18, height:18, borderWidth:2 }} /> Enviando...</> : 'SOLICITAR REGISTRO'}
            </button>
          </form>

          <div style={{ marginTop:20, textAlign:'center' }}>
            <div className="divider" style={{ marginBottom:14 }}>ou</div>
            <Link to="/login" style={{
              display:'inline-flex', alignItems:'center', gap:6,
              fontSize:'0.78rem', color:'var(--text-muted)',
              textDecoration:'none', fontFamily:"'Cinzel', serif",
              transition:'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color='var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
            >
              <ArrowLeft size={14} /> Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:'block', marginBottom:7, fontFamily:"'Cinzel', serif", fontSize:'0.65rem', letterSpacing:'0.14em', color:'var(--gold)', textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'11px 14px',
  background:'var(--bg-input)', border:'1px solid var(--border-mid)',
  borderRadius:8, color:'var(--text-primary)',
  fontSize:'0.95rem', outline:'none', transition:'border-color 0.2s',
};
