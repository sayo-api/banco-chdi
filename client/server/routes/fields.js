const router = require('express').Router();
const CustomField = require('../models/CustomField');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const fields = await CustomField.find().sort({ order: 1, createdAt: 1 });
  res.json(fields);
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { label, type, options, required } = req.body;
    const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const count = await CustomField.countDocuments();
    const field = await CustomField.create({ label, key, type, options, required, order: count });
    res.status(201).json(field);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const field = await CustomField.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(field);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await CustomField.findByIdAndDelete(req.params.id);
  res.json({ message: 'Campo removido' });
});

module.exports = router;
