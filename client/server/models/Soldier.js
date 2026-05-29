const mongoose = require('mongoose');

const soldierSchema = new mongoose.Schema({
  graduacao: { type: String, required: true, trim: true },
  nomeCompleto: { type: String, required: true, trim: true },
  nomeDeGuerra: { type: String, trim: true },
  numeroRegistro: { type: String, trim: true },
  subunidade: { type: String, trim: true },
  endereco: { type: String, trim: true },
  telefone: { type: String, trim: true },
  dataIncorporacao: { type: String, trim: true },
  // Dynamic custom fields: { fieldKey: value }
  customFields: { type: Map, of: String, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Soldier', soldierSchema);
