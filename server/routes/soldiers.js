const router = require('express').Router();
const Soldier = require('../models/Soldier');
const { auth, adminOnly } = require('../middleware/auth');

// Get all soldiers (with search)
router.get('/', auth, async (req, res) => {
  try {
    const { search, graduacao } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { nomeCompleto: { $regex: search, $options: 'i' } },
        { nomeDeGuerra: { $regex: search, $options: 'i' } },
        { numeroRegistro: { $regex: search, $options: 'i' } },
        { graduacao: { $regex: search, $options: 'i' } },
      ];
    }
    if (graduacao) filter.graduacao = graduacao;
    const soldiers = await Soldier.find(filter).sort({ graduacao: 1, nomeCompleto: 1 });
    res.json(soldiers);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar militares' });
  }
});

// Get single soldier
router.get('/:id', auth, async (req, res) => {
  const soldier = await Soldier.findById(req.params.id);
  if (!soldier) return res.status(404).json({ message: 'Não encontrado' });
  res.json(soldier);
});

// Create soldier
router.post('/', auth, async (req, res) => {
  try {
    const soldier = await Soldier.create(req.body);
    res.status(201).json(soldier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update soldier
router.put('/:id', auth, async (req, res) => {
  try {
    const soldier = await Soldier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(soldier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete soldier
router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Soldier.findByIdAndDelete(req.params.id);
  res.json({ message: 'Militar removido' });
});

// Stats
router.get('/stats/overview', auth, async (req, res) => {
  const total = await Soldier.countDocuments();
  const byGraduacao = await Soldier.aggregate([
    { $group: { _id: '$graduacao', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ total, byGraduacao });
});

module.exports = router;
