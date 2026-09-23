const express = require('express');
const router = express.Router();
const GAME_CONFIG = require('../config/games');
const DURATIONS = require('../config/durations');

router.get('/', (req, res) => {
  const games = GAME_CONFIG.filter(g => g.enabled).map(g => ({
    key: g.key,
    name: g.name,
    color: g.color,
    defaultHour: g.defaultHour,
    defaultDay: g.defaultDay,
    defaultDeposit: g.defaultDeposit,
    seedTags: g.seedTags,
    term: g.term
  }));
  res.json({ code: 0, data: { games, durations: DURATIONS } });
});

module.exports = router;