import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ nomeDeGuerra: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Bem-vindo, ${data.user.nomeDeGuerra}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `
        radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,13,32,0.18) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 80% 80%, rgba(201,168,76,0.06) 0%, transparent 60%),
        var(--bg-void)
      `,
      padding: '20px',
    }}>
      {/* Animated corner ornaments */}
      <div style={{ position:'fixed', top:20, left:20, width:80, height:80, borderTop:'1px solid var(--border-subtle)', borderLeft:'1px solid var(--border-subtle)', borderRadius:'4px 0 0 0', opacity:0.5 }} />
      <div style={{ position:'fixed', top:20, right:20, width:80, height:80, borderTop:'1px solid var(--border-subtle)', borderRight:'1px solid var(--border-subtle)', borderRadius:'0 4px 0 0', opacity:0.5 }} />
      <div style={{ position:'fixed', bottom:20, left:20, width:80, height:80, borderBottom:'1px solid var(--border-subtle)', borderLeft:'1px solid var(--border-subtle)', borderRadius:'0 0 0 4px', opacity:0.5 }} />
      <div style={{ position:'fixed', bottom:20, right:20, width:80, height:80, borderBottom:'1px solid var(--border-subtle)', borderRight:'1px solid var(--border-subtle)', borderRadius:'0 0 4px 0', opacity:0.5 }} />

      <div style={{ width:'100%', maxWidth:420, animation:'fadeIn 0.5s ease forwards' }}>
        {/* Emblem */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width:90, height:90, margin:'0 auto 18px',
            background:'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
            border:'2px solid var(--gold-dark)',
            borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 40px rgba(139,13,32,0.4), 0 0 80px rgba(139,13,32,0.15), inset 0 1px 0 rgba(201,168,76,0.2)',
            position:'relative',
          }}>
            <div style={{
              position:'absolute', inset:4, border:'1px solid rgba(201,168,76,0.2)',
              borderRadius:8,
            }} />
            <Shield size={38} color="var(--gold-light)" strokeWidth={1.5} />
          </div>
          <div style={{
            fontFamily:"'Cinzel Decorative', serif",
            fontSize:'1.6rem', fontWeight:900,
            background:'linear-gradient(180deg, var(--gold-pale) 0%, var(--gold) 50%, var(--gold-dark) 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'0.15em', marginBottom:6,
          }}>CHDI</div>
          <div style={{
            fontFamily:"'Cinzel', serif", fontSize:'0.62rem',
            color:'var(--text-muted)', letterSpacing:'0.22em',
            textTransform:'uppercase',
          }}>Centro Hípico Dragões da Independência</div>
        </div>

        {/* Card */}
        <div style={{
          background:'var(--bg-card)',
          border:'1px solid var(--border-mid)',
          borderRadius:16,
          padding:'36px 32px',
          boxShadow:'var(--shadow-deep), inset 0 1px 0 rgba(201,168,76,0.06)',
          position:'relative', overflow:'hidden',
        }}>
          {/* top gold line */}
          <div style={{
            position:'absolute', top:0, left:'15%', right:'15%', height:1,
            background:'linear-gradient(90deg, transparent, var(--gold), transparent)',
          }} />

          <div style={{ marginBottom:28 }}>
            <div className="section-title" style={{ marginBottom:20 }}>Acesso ao Sistema</div>
          </div>

          <form onSubmit={handle}>
            <Field label="Nome de Guerra" id="nomeDeGuerra">
              <input
                id="nomeDeGuerra"
                value={form.nomeDeGuerra}
                onChange={e => setForm(p => ({ ...p, nomeDeGuerra: e.target.value.toUpperCase() }))}
                placeholder="SEU NOME DE GUERRA"
                required autoFocus
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
            </Field>

            <Field label="Senha" id="password" style={{ marginTop:18 }}>
              <div style={{ position:'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight:46 }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'var(--text-muted)',
                  cursor:'pointer', display:'flex', alignItems:'center',
                  transition:'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <button type="submit" disabled={loading} style={{
              marginTop:28, width:'100%', padding:'13px',
              background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--crimson-deep) 0%, var(--crimson) 50%, var(--crimson-light) 100%)',
              border:'1px solid var(--crimson-light)',
              borderRadius:8, color:'var(--ivory)',
              fontFamily:"'Cinzel', serif", fontSize:'0.8rem',
              fontWeight:700, letterSpacing:'0.15em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'all 0.25s',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(139,13,32,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            }}
              onMouseEnter={e => { if(!loading){ e.currentTarget.style.boxShadow='0 6px 28px rgba(139,13,32,0.6)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(139,13,32,0.4)'; e.currentTarget.style.transform='none'; }}
            >
              {loading ? <><div className="spinner" style={{ width:18, height:18, borderWidth:2 }} /> Verificando...</> : 'ENTRAR'}
            </button>
          </form>

          <div style={{ marginTop:22, textAlign:'center' }}>
            <div className="divider" style={{ marginBottom:16 }}>ou</div>
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontFamily:"'Cinzel', serif" }}>
              Não tem acesso?{' '}
              <Link to="/register" style={{ color:'var(--gold)', textDecoration:'none', fontWeight:600 }}
                onMouseEnter={e => e.target.style.color='var(--gold-pale)'}
                onMouseLeave={e => e.target.style.color='var(--gold)'}
              >
                Solicitar Registro
              </Link>
            </span>
          </div>

          {/* bottom gold line */}
          <div style={{
            position:'absolute', bottom:0, left:'15%', right:'15%', height:1,
            background:'linear-gradient(90deg, transparent, var(--border-mid), transparent)',
          }} />
        </div>

        <div style={{ textAlign:'center', marginTop:20, fontSize:'0.6rem', color:'var(--text-muted)', fontFamily:"'Cinzel', serif", letterSpacing:'0.12em' }}>
          SISTEMA RESTRITO — USO EXCLUSIVO DO QUARTEL
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, children, style }) {
  return (
    <div style={style}>
      <label htmlFor={id} style={{
        display:'block', marginBottom:7,
        fontFamily:"'Cinzel', serif", fontSize:'0.65rem',
        letterSpacing:'0.14em', color:'var(--gold)',
        textTransform:'uppercase',
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'11px 14px',
  background:'var(--bg-input)',
  border:'1px solid var(--border-mid)',
  borderRadius:8, color:'var(--text-primary)',
  fontSize:'0.95rem', outline:'none',
  transition:'border-color 0.2s',
  letterSpacing:'0.05em',
};
