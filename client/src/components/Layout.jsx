import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Users, Shield, LogOut, Menu, X, Sun, Moon, Database } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',      end: true },
  { to: '/soldiers',  icon: Users,           label: 'Banco Militar' },
  { to: '/databases', icon: Database,         label: 'Inventários'   },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const nl = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: open ? '10px 14px' : '10px',
    borderRadius: 8, textDecoration: 'none',
    fontFamily: "'Cinzel', serif", fontSize: '0.72rem',
    letterSpacing: '0.06em', fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--crimson)' : 'var(--text-muted)',
    background: isActive ? 'var(--crimson-glow)' : 'transparent',
    borderLeft: isActive ? '2px solid var(--crimson)' : '2px solid transparent',
    transition: 'all 0.18s', overflow: 'hidden', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      <aside style={{
        width: open ? 250 : 66,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0, overflow: 'hidden', position: 'relative', zIndex: 10,
        boxShadow: '2px 0 16px rgba(0,0,0,0.06)',
      }}>

        {/* Logo */}
        <div style={{
          padding: open ? '22px 18px 18px' : '22px 14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden',
        }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
            border: '2px solid rgba(139,13,32,0.3)',
            borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Cinzel Decorative', serif", fontSize: '0.95rem',
            color: '#fff', fontWeight: 900,
            boxShadow: '0 3px 12px rgba(139,13,32,0.35)',
          }}>C</div>
          {open && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.82rem', color: 'var(--crimson)', fontWeight: 700, whiteSpace: 'nowrap' }}>CHDI</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: "'Cinzel', serif", whiteSpace: 'nowrap' }}>DRAGÕES DA INDEPENDÊNCIA</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setOpen(p => !p)} style={{
          position: 'absolute', top: 24, right: -12, zIndex: 20,
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--crimson)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {open ? <X size={11} /> : <Menu size={11} />}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => nl(isActive)}>
              <Icon size={17} style={{ flexShrink: 0 }} />
              {open && label}
            </NavLink>
          ))}

          {/* Divider */}
          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 6px' }} />
              <NavLink to="/admin" style={({ isActive }) => nl(isActive)}>
                <Shield size={17} style={{ flexShrink: 0 }} />
                {open && 'Administração'}
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Theme toggle */}
          <button onClick={toggle} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: open ? '8px 12px' : '8px',
            borderRadius: 8, border: '1px solid var(--border-subtle)',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-muted)', transition: 'all 0.2s',
            fontFamily: "'Cinzel', serif", fontSize: '0.67rem',
            letterSpacing: '0.07em', whiteSpace: 'nowrap', overflow: 'hidden',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-gold)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            {dark ? <Sun size={15} style={{ flexShrink: 0 }} /> : <Moon size={15} style={{ flexShrink: 0 }} />}
            {open && (dark ? 'Modo Claro' : 'Modo Escuro')}
          </button>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: open ? '8px 10px' : '8px', overflow: 'hidden' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
              border: '1px solid rgba(139,13,32,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cinzel', serif", fontSize: '0.72rem', color: '#fff', fontWeight: 700,
            }}>{user?.nomeDeGuerra?.[0]}</div>
            {open && (
              <>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nomeDeGuerra}</div>
                  <div style={{ fontSize: '0.57rem', color: 'var(--text-muted)', fontFamily: "'Cinzel', serif", letterSpacing: '0.06em' }}>{user?.role === 'admin' ? 'ADMINISTRADOR' : 'USUÁRIO'}</div>
                </div>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex', transition: 'color 0.18s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--crimson-light)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                ><LogOut size={15} /></button>
              </>
            )}
          </div>
        </div>
      </aside>

      <main style={{
        flex: 1, overflow: 'auto',
        background: `radial-gradient(ellipse 80% 50% at 50% -5%, var(--crimson-glow) 0%, transparent 55%), var(--bg-base)`,
        transition: 'background 0.3s ease',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
