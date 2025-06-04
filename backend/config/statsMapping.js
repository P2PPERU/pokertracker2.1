// backend/config/statsMapping.js
// Configuración central para mapeo de estadísticas del CSV

const STATS_MAPPING = {
  // Información básica
  'Site': {
    dbField: 'site',
    frontendField: 'site',
    category: 'basic',
    description: 'Sala donde se jugó'
  },
  'Player': {
    dbField: 'jugador_nombre',
    frontendField: 'player_name',
    category: 'basic',
    description: 'Nombre del jugador'
  },
  'All-In Adj BB/100': {
    dbField: 'all_in_adj_bb_100',
    frontendField: 'all_in_adj_bb_100',
    category: 'winrate',
    description: 'BB/100 ajustado por all-ins'
  },
  'BB/100': {
    dbField: 'bb_100',
    frontendField: 'bb_100',
    category: 'winrate',
    description: 'Big blinds ganadas por cada 100 manos'
  },
  'My C Won': {
    dbField: 'my_c_won',
    frontendField: 'win_usd',
    category: 'winrate',
    description: 'Dinero total ganado'
  },
  'Hands': {
    dbField: 'hands',
    frontendField: 'total_manos',
    category: 'basic',
    description: 'Total de manos jugadas'
  },

  // Estadísticas Preflop
  'VPIP': {
    dbField: 'vpip',
    frontendField: 'vpip',
    category: 'preflop',
    description: 'Voluntarily Put money In Pot'
  },
  'PFR': {
    dbField: 'pfr',
    frontendField: 'pfr',
    category: 'preflop',
    description: 'Pre-Flop Raise'
  },
  '3Bet PF NO SQZ': {
    dbField: 'three_bet_pf_no_sqz',
    frontendField: 'three_bet',
    category: 'preflop',
    description: '3 BET (sin squeeze)',
    displayName: '3 BET'
  },
  '3Bet PF & Fold': {
    dbField: 'three_bet_pf_fold',
    frontendField: 'fold_to_4bet_pct',
    category: 'preflop',
    description: 'FOLD al 4BET',
    displayName: 'Fold to 4-Bet'
  },
  '2Bet PF & Fold': {
    dbField: 'two_bet_pf_fold',
    frontendField: 'fold_to_3bet_pct',
    category: 'preflop',
    description: 'FOLD al 3BET',
    displayName: 'Fold to 3-Bet'
  },
  'Raise & 4Bet+ PF': {
    dbField: 'raise_4bet_plus_pf',
    frontendField: 'four_bet_preflop_pct',
    category: 'preflop',
    description: '4BET o más preflop',
    displayName: '4-Bet+'
  },
  'PF Squeeze': {
    dbField: 'pf_squeeze',
    frontendField: 'squeeze',
    category: 'preflop',
    description: 'Squeeze preflop'
  },

  // Estadísticas Flop
  'Donk F': {
    dbField: 'donk_f',
    frontendField: 'donk_flop',
    category: 'flop',
    description: 'Donk bet en flop'
  },
  'XR Flop': {
    dbField: 'xr_flop',
    frontendField: 'check_raise_flop',
    category: 'flop',
    description: 'Check-raise en flop'
  },
  'CBet F (non-3B nMW, non SB vs BB)': {
    dbField: 'cbet_f_non_3b_nmw_non_sb_vs_bb',
    frontendField: 'cbet_flop_oop',
    category: 'flop',
    description: 'CBET FLOP OP (Out of Position)',
    displayName: 'CBet Flop OOP'
  },
  'CBet F (non-3B nMW)': {
    dbField: 'cbet_f_non_3b_nmw',
    frontendField: 'cbet_flop_ip',
    category: 'flop',
    description: 'CBET FLOP IP (In Position)',
    displayName: 'CBet Flop IP'
  },
  'CBet F': {
    dbField: 'cbet_f',
    frontendField: 'cbet_flop',
    category: 'flop',
    description: 'Continuation bet en flop'
  },
  'Fold to F CBet (non-3B)': {
    dbField: 'fold_to_f_cbet_non_3b',
    frontendField: 'fold_to_flop_cbet_pct',
    category: 'flop',
    description: 'FOLD FLOP CBET',
    displayName: 'Fold to Flop CBet'
  },
  'Float F': {
    dbField: 'float_f',
    frontendField: 'float_flop',
    category: 'flop',
    description: 'Float (call) en flop vs CBet'
  },

  // Estadísticas Turn
  'CBet T': {
    dbField: 'cbet_t',
    frontendField: 'cbet_turn',
    category: 'turn',
    description: 'Continuation bet en turn'
  },
  'Probe T': {
    dbField: 'probe_t',
    frontendField: 'probe_bet_turn_pct',
    category: 'turn',
    description: 'Probe bet en turn'
  },
  'T_OB%': {
    dbField: 't_ob_pct',
    frontendField: 'overbet_turn_pct',
    category: 'turn',
    description: 'TURN OVERBET',
    displayName: 'Turn Overbet %'
  },
  'Fold T OverBet': {
    dbField: 'fold_t_overbet',
    frontendField: 'fold_to_turn_overbet',
    category: 'turn',
    description: 'Fold ante overbet en turn'
  },
  'Steal T': {
    dbField: 'steal_t',
    frontendField: 'steal_turn',
    category: 'turn',
    description: 'Steal en turn'
  },
  'XR Turn': {
    dbField: 'xr_turn',
    frontendField: 'check_raise_turn',
    category: 'turn',
    description: 'Check-raise en turn'
  },
  'Fold to T CBet': {
    dbField: 'fold_to_t_cbet',
    frontendField: 'fold_to_turn_cbet_pct',
    category: 'turn',
    description: 'FOLD TURNO CBET',
    displayName: 'Fold to Turn CBet'
  },

  // Estadísticas River
  'CBet R': {
    dbField: 'cbet_r',
    frontendField: 'cbet_river',
    category: 'river',
    description: 'Continuation bet en river'
  },
  'Bet R': {
    dbField: 'bet_r',
    frontendField: 'bet_river_pct',
    category: 'river',
    description: 'Bet en river'
  },
  'Fold R Bet': {
    dbField: 'fold_r_bet',
    frontendField: 'fold_to_river_bet_pct',
    category: 'river',
    description: 'Fold ante bet en river'
  },
  'R_OVB%': {
    dbField: 'r_ovb_pct',
    frontendField: 'overbet_river_pct',
    category: 'river',
    description: 'RIVER OVERBET',
    displayName: 'River Overbet %'
  },
  'Fold R OverBet': {
    dbField: 'fold_r_overbet',
    frontendField: 'fold_to_river_overbet',
    category: 'river',
    description: 'Fold ante overbet en river'
  },
  'Bet R & Fold': {
    dbField: 'bet_r_fold',
    frontendField: 'bet_river_fold',
    category: 'river',
    description: 'Bet y fold en river'
  },
  'Bet R Small Pot': {
    dbField: 'bet_r_small_pot',
    frontendField: 'bet_river_small_pot',
    category: 'river',
    description: 'Bet pequeño en river'
  },
  'Bet R Big Pot': {
    dbField: 'bet_r_big_pot',
    frontendField: 'bet_river_big_pot',
    category: 'river',
    description: 'Bet grande en river'
  },

  // Estadísticas de Showdown
  'WWSF': {
    dbField: 'wwsf',
    frontendField: 'wwsf',
    category: 'showdown',
    description: 'Won When Saw Flop'
  },
  'WSD': {
    dbField: 'wsd',
    frontendField: 'wsd',
    category: 'showdown',
    description: 'Won at ShowDown'
  },
  'WSDWBR': {
    dbField: 'wsdwbr',
    frontendField: 'wsdwbr_pct',
    category: 'showdown',
    description: 'Won SD When Bet River'
  },
  'WSDWOBR': {
    dbField: 'wsdwobr',
    frontendField: 'wsdwobr',
    category: 'showdown',
    description: 'CUANTO GANA CUANDO HACE OVERBET',
    displayName: 'WSD con Overbet River'
  },
  'WSDWRR': {
    dbField: 'wsdwrr',
    frontendField: 'wsdwrr',
    category: 'showdown',
    description: 'CUANTO GANA CUANDO HACE RAISE RIVER',
    displayName: 'WSD con Raise River'
  },
  'WWRB SMALL': {
    dbField: 'wwrb_small',
    frontendField: 'wwrb_small',
    category: 'showdown',
    description: 'Won When River Bet Small'
  },
  'WWRB BIG': {
    dbField: 'wwrb_big',
    frontendField: 'wwrb_big',
    category: 'showdown',
    description: 'Won When River Bet Big'
  },

  // Estadísticas de Limp
  'Limp/Fold': {
    dbField: 'limp_fold',
    frontendField: 'limp_fold_pct',
    category: 'limp',
    description: 'Limp y fold ante raise'
  },
  'Limp': {
    dbField: 'limp',
    frontendField: 'limp_pct',
    category: 'limp',
    description: 'Frecuencia de limp'
  },
  'Limp/Raise': {
    dbField: 'limp_raise',
    frontendField: 'limp_raise_pct',
    category: 'limp',
    description: 'Limp-raise'
  }
};

// Función helper para obtener el mapeo de campo CSV a BD
const getFieldMapping = () => {
  const mapping = {};
  Object.entries(STATS_MAPPING).forEach(([csvField, config]) => {
    mapping[csvField] = config.dbField;
  });
  return mapping;
};

// Función helper para obtener el mapeo de BD a Frontend
const getDbToFrontendMapping = () => {
  const mapping = {};
  Object.values(STATS_MAPPING).forEach(config => {
    mapping[config.dbField] = config.frontendField;
  });
  return mapping;
};

// Función helper para obtener stats por categoría
const getStatsByCategory = (category) => {
  return Object.entries(STATS_MAPPING)
    .filter(([_, config]) => config.category === category)
    .map(([csvField, config]) => ({
      csvField,
      ...config
    }));
};

// Función helper para validar que un stat existe
const isValidStat = (csvFieldName) => {
  return STATS_MAPPING.hasOwnProperty(csvFieldName);
};

// Función helper para obtener el nombre display de un stat
const getDisplayName = (frontendField) => {
  const stat = Object.values(STATS_MAPPING).find(config => 
    config.frontendField === frontendField
  );
  return stat?.displayName || stat?.description || frontendField;
};

module.exports = {
  STATS_MAPPING,
  getFieldMapping,
  getDbToFrontendMapping,
  getStatsByCategory,
  isValidStat,
  getDisplayName
};