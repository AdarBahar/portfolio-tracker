const express = require('express');
const {
  createBullPen,
  listBullPens,
  getBullPen,
  updateBullPen,
  deleteBullPen,
} = require('../controllers/bullPensController');

const router = express.Router();

router.get('/', listBullPens);
router.post('/', createBullPen);
router.get('/:id', getBullPen);
router.patch('/:id', updateBullPen);
router.delete('/:id', deleteBullPen);

module.exports = router;

