const router = require('express').Router();
const CustomDatabase = require('../models/CustomDatabase');
const DatabaseEntry  = require('../models/DatabaseEntry');
const { auth, adminOnly } = require('../middleware/auth');

/* ═══════════════════════════════════════
   DATABASE DEFINITIONS
═══════════════════════════════════════ */

// List all databases
router.get('/', auth, async (req, res) => {
  try {
    const dbs = await CustomDatabase.find().sort({ createdAt: -1 });
    // Attach entry count to each
    const withCounts = await Promise.all(dbs.map(async db => {
      const count = await DatabaseEntry.countDocuments({ databaseId: db._id });
      return { ...db.toObject(), entryCount: count };
    }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar bancos' });
  }
});

// Get single database definition
router.get('/:id', auth, async (req, res) => {
  const db = await CustomDatabase.findById(req.params.id);
  if (!db) return res.status(404).json({ message: 'Banco não encontrado' });
  res.json(db);
});

// Create database (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, icon, color, columns } = req.body;
    // Build column keys from labels
    const cols = (columns || []).map((c, i) => ({
      ...c,
      key: c.key || c.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      order: i,
    }));
    const db = await CustomDatabase.create({
      name, description, icon: icon || '📦', color: color || '#8B0D20',
      columns: cols, createdBy: req.user._id,
    });
    res.status(201).json(db);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update database definition
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, icon, color, columns } = req.body;
    const cols = (columns || []).map((c, i) => ({
      ...c,
      key: c.key || c.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      order: i,
    }));
    const db = await CustomDatabase.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, color, columns: cols },
      { new: true, runValidators: true }
    );
    res.json(db);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete database + all its entries
router.delete('/:id', auth, adminOnly, async (req, res) => {
  await DatabaseEntry.deleteMany({ databaseId: req.params.id });
  await CustomDatabase.findByIdAndDelete(req.params.id);
  res.json({ message: 'Banco removido' });
});

/* ═══════════════════════════════════════
   ENTRIES (rows)
═══════════════════════════════════════ */

// List entries (with search)
router.get('/:id/entries', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let entries = await DatabaseEntry.find({ databaseId: req.params.id }).sort({ createdAt: -1 });
    if (search) {
      const s = search.toLowerCase();
      entries = entries.filter(e => {
        for (const [, v] of e.data) {
          if (String(v).toLowerCase().includes(s)) return true;
        }
        return false;
      });
    }
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar entradas' });
  }
});

// Create entry
router.post('/:id/entries', auth, async (req, res) => {
  try {
    const entry = await DatabaseEntry.create({
      databaseId: req.params.id,
      data: req.body.data || {},
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update entry
router.put('/:id/entries/:entryId', auth, async (req, res) => {
  try {
    const entry = await DatabaseEntry.findByIdAndUpdate(
      req.params.entryId,
      { data: req.body.data },
      { new: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete entry
router.delete('/:id/entries/:entryId', auth, async (req, res) => {
  await DatabaseEntry.findByIdAndDelete(req.params.entryId);
  res.json({ message: 'Entrada removida' });
});

// Bulk import entries
router.post('/:id/entries/bulk', auth, async (req, res) => {
  try {
    const { entries } = req.body;
    const docs = entries.map(data => ({ databaseId: req.params.id, data }));
    const result = await DatabaseEntry.insertMany(docs);
    res.status(201).json({ inserted: result.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
