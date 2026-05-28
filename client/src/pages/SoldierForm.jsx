import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User } from 'lucide-react';

const GRADUACOES = ['Soldado','Cabo','3º Sargento','2º Sargento','1º Sargento','Subtenente','Aspirante','2º Tenente','1º Tenente','Capitão','Major','Tenente-Coronel','Coronel','General'];

export default function SoldierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    graduacao: '', nomeCompleto: '', nomeDeGuerra: '',
    numeroRegistro: '', subunidade: '', endereco: '',
    telefone: '', dataIncorporacao: '',
  });
  const [customFields, setCustomFields] = useState([]);
  const [customValues, setCustomValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    api.get('/fields').then(r => setCustomFields(r.data)).catch(() => {});
    if (isEdit) {
      api.get(`/soldiers/${id}`)
        .then(r => {
          const { customFields: cf, ...rest } = r.data;
          setForm(rest);
          const vals = {};
          if (cf) Object.entries(cf).forEach(([k, v]) => { vals[k] = v; });
          setCustomValues(vals);
        })
        .catch(() => { toast.error('Registro não encontrado'); navigate('/soldiers'); })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, customFields: customValues };
      if (isEdit) {
        await api.put(`/soldiers/${id}`, payload);
        toast.success('Registro atualizado com sucesso');
      } else {
        await api.post('/soldiers', payload);
        toast.success('Militar cadastrado com sucesso');
      }
      navigate('/soldiers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding:'32px', maxWidth:800, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
        <button onClick={() => navigate('/soldiers')} style={{
          display:'flex', alignItems:'center', gap:8,
          background:'none', border:'1px solid var(--border-mid)',
          borderRadius:8, padding:'8px 14px',
          color:'var(--text-muted)', cursor:'pointer',
          fontFamily:"'Cinzel', serif", fontSize:'0.68rem',
          letterSpacing:'0.08em', transition:'all 0.18s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--gold)'; e.currentTarget.style.color='var(--gold)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.color='var(--text-muted)'; }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <div>
          <div style={{ fontFamily:"'Cinzel', serif", fontSize:'0.62rem', color:'var(--text-muted)', letterSpacing:'0.18em', marginBottom:4 }}>
            {isEdit ? '✦ EDITAR REGISTRO' : '✦ NOVO REGISTRO'}
          </div>
          <h1 style={{
            fontFamily:"'Cinzel Decorative', serif", fontSize:'1.2rem',
            background:'linear-gradient(135deg, var(--ivory), var(--gold))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            {isEdit ? 'Editar Militar' : 'Cadastrar Militar'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Core fields card */}
        <Card title="Dados Principais" icon={<User size={16} />}>
          <Grid>
            <FormField label="Graduação" required>
              <select
                value={form.graduacao}
                onChange={e => setForm(p => ({ ...p, graduacao: e.target.value }))}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              >
                <option value="">Selecionar...</option>
                {GRADUACOES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormField>

            <FormField label="Nome Completo" required>
              <input
                value={form.nomeCompleto}
                onChange={e => setForm(p => ({ ...p, nomeCompleto: e.target.value }))}
                placeholder="Nome completo"
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              />
            </FormField>

            <FormField label="Nome de Guerra">
              <input
                value={form.nomeDeGuerra}
                onChange={e => setForm(p => ({ ...p, nomeDeGuerra: e.target.value.toUpperCase() }))}
                placeholder="NOME DE GUERRA"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              />
            </FormField>

            <FormField label="Nº de Registro / Identidade Militar">
              <input
                value={form.numeroRegistro}
                onChange={e => setForm(p => ({ ...p, numeroRegistro: e.target.value }))}
                placeholder="Ex: 12345678"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              />
            </FormField>

            <FormField label="Subunidade / Seção">
              <input
                value={form.subunidade}
                onChange={e => setForm(p => ({ ...p, subunidade: e.target.value }))}
                placeholder="Ex: 1ª Cia, Seção de Inf."
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              />
            </FormField>

            <FormField label="Telefone">
              <input
                value={form.telefone}
                onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                placeholder="(XX) XXXXX-XXXX"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              />
            </FormField>

            <FormField label="Data de Incorporação">
              <input
                type="date"
                value={form.dataIncorporacao}
                onChange={e => setForm(p => ({ ...p, dataIncorporacao: e.target.value }))}
                style={{ ...inputStyle, colorScheme:'dark' }}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              />
            </FormField>

            <FormField label="Endereço" span>
              <input
                value={form.endereco}
                onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))}
                placeholder="Endereço residencial"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border-mid)'}
              />
            </FormField>
          </Grid>
        </Card>

        {/* Custom fields */}
        {customFields.length > 0 && (
          <Card title="Campos Adicionais" icon={<span style={{ fontSize:'0.9rem' }}>⚙</span>} style={{ marginTop:16 }}>
            <Grid>
              {customFields.map(f => (
                <FormField key={f._id} label={f.label} required={f.required} span={f.type === 'text' && f.label.length > 20}>
                  {f.type === 'select' ? (
                    <select
                      value={customValues[f.key] || ''}
                      onChange={e => setCustomValues(p => ({ ...p, [f.key]: e.target.value }))}
                      required={f.required} style={inputStyle}
                      onFocus={e => e.target.style.borderColor='var(--gold)'}
                      onBlur={e => e.target.style.borderColor='var(--border-mid)'}
                    >
                      <option value="">Selecionar...</option>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                      value={customValues[f.key] || ''}
                      onChange={e => setCustomValues(p => ({ ...p, [f.key]: e.target.value }))}
                      required={f.required}
                      placeholder={f.label}
                      style={{ ...inputStyle, colorScheme: f.type === 'date' ? 'dark' : undefined }}
                      onFocus={e => e.target.style.borderColor='var(--gold)'}
                      onBlur={e => e.target.style.borderColor='var(--border-mid)'}
                    />
                  )}
                </FormField>
              ))}
            </Grid>
          </Card>
        )}

        {/* Submit */}
        <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
          <button type="button" onClick={() => navigate('/soldiers')} style={{
            padding:'11px 24px', background:'none',
            border:'1px solid var(--border-mid)', borderRadius:9,
            color:'var(--text-muted)', cursor:'pointer',
            fontFamily:"'Cinzel', serif", fontSize:'0.72rem', letterSpacing:'0.1em',
            transition:'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-mid)'; e.currentTarget.style.color='var(--text-muted)'; }}
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'11px 28px',
            background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--crimson-deep), var(--crimson))',
            border:'1px solid var(--crimson)', borderRadius:9,
            color:'var(--ivory)', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily:"'Cinzel', serif", fontSize:'0.72rem', fontWeight:700,
            letterSpacing:'0.12em', boxShadow:'0 4px 16px rgba(139,13,32,0.3)',
            transition:'all 0.2s',
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(139,13,32,0.5)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 16px rgba(139,13,32,0.3)'; }}
          >
            {loading ? <><div className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Salvando...</> : <><Save size={15} /> {isEdit ? 'ATUALIZAR' : 'CADASTRAR'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Card({ title, icon, children, style }) {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
      borderRadius:14, overflow:'hidden', ...style,
    }}>
      <div style={{
        padding:'14px 22px',
        borderBottom:'1px solid var(--border-subtle)',
        display:'flex', alignItems:'center', gap:10,
        background:'var(--bg-elevated)',
      }}>
        <span style={{ color:'var(--gold)' }}>{icon}</span>
        <span style={{ fontFamily:"'Cinzel', serif", fontSize:'0.72rem', color:'var(--gold)', letterSpacing:'0.12em', textTransform:'uppercase' }}>{title}</span>
      </div>
      <div style={{ padding:22 }}>{children}</div>
    </div>
  );
}

function Grid({ children }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
      {children}
    </div>
  );
}

function FormField({ label, children, required, span }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <label style={{
        display:'block', marginBottom:7,
        fontFamily:"'Cinzel', serif", fontSize:'0.63rem',
        letterSpacing:'0.14em', color:'var(--gold)',
        textTransform:'uppercase',
      }}>
        {label}{required && <span style={{ color:'var(--crimson-light)', marginLeft:4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'10px 13px',
  background:'var(--bg-input)', border:'1px solid var(--border-mid)',
  borderRadius:8, color:'var(--text-primary)',
  fontSize:'0.9rem', outline:'none', transition:'border-color 0.2s',
};
