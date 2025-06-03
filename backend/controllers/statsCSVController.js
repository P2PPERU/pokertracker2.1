// backend/controllers/statsCSVController.js
const StatsCSVModel = require('../models/statsCSVModel');
const { EventLogger } = require('../utils/eventLogger');

const StatsCSVController = {
  // Subir y procesar archivo CSV
  uploadStatsCSV: async (req, res) => {
    try {
      const { contenidoCSV, tipoPeriodo, fecha, sala } = req.body;
      const usuarioId = req.usuario.id;

      // Validaciones básicas
      if (!contenidoCSV || !tipoPeriodo || !fecha) {
        return res.status(400).json({
          error: 'contenidoCSV, tipoPeriodo y fecha son obligatorios'
        });
      }

      if (!['total', 'semana', 'mes'].includes(tipoPeriodo)) {
        return res.status(400).json({
          error: 'tipoPeriodo debe ser: total, semana, o mes'
        });
      }

      console.log(`📊 Iniciando procesamiento CSV: ${tipoPeriodo} - ${fecha}`);

      // Parsear CSV
      const lineas = contenidoCSV.split('\n').filter(linea => linea.trim());
      if (lineas.length < 2) {
        return res.status(400).json({
          error: 'El archivo CSV debe tener al menos headers y una fila de datos'
        });
      }

      // Extraer headers y validar estructura
      const headers = lineas[0].split(',').map(h => h.replace(/"/g, '').trim());
      const requiredHeaders = ['Site', 'Player', 'Hands', 'BB/100', 'VPIP', 'PFR'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        return res.status(400).json({
          error: `Headers faltantes: ${missingHeaders.join(', ')}`
        });
      }

      // Procesar datos en batches de 1000
      const BATCH_SIZE = 1000;
      let totalProcesados = 0;
      let totalErrores = 0;
      const errores = [];

      for (let i = 1; i < lineas.length; i += BATCH_SIZE) {
        const batch = lineas.slice(i, i + BATCH_SIZE);
        const jugadoresData = [];

        for (const linea of batch) {
          try {
            const valores = StatsCSVController.parseCSVLine(linea);
            if (valores.length < headers.length) continue;

            const jugadorData = StatsCSVController.mapCSVToJugador(headers, valores);
            
            // Mapear sala y stake
            jugadorData.sala = StatsCSVModel.mapSala(jugadorData.site);
            jugadorData.stake_category = StatsCSVModel.mapStakeToCategory(jugadorData.stake_original);
            
            // Validar datos mínimos
            if (!jugadorData.jugador_nombre || jugadorData.hands < 1) {
              continue;
            }

            // Generar hash simple para detección de cambios
            jugadorData.hash_datos = StatsCSVController.generateSimpleHash(
              `${jugadorData.jugador_nombre}-${jugadorData.hands}-${jugadorData.bb_100}`
            );

            jugadoresData.push(jugadorData);
            
          } catch (error) {
            totalErrores++;
            errores.push(`Línea ${i + jugadoresData.length}: ${error.message}`);
          }
        }

        // Insertar batch en BD
        if (jugadoresData.length > 0) {
          await StatsCSVModel.upsertBatch(fecha, tipoPeriodo, jugadoresData);
          totalProcesados += jugadoresData.length;
        }
      }

      // Log del evento
      EventLogger.log(usuarioId, 'csv_upload', {
        tipo_periodo: tipoPeriodo,
        fecha: fecha,
        total_procesados: totalProcesados,
        total_errores: totalErrores
      }, req).catch(console.error);

      res.json({
        success: true,
        message: 'CSV procesado exitosamente',
        estadisticas: {
          total_procesados: totalProcesados,
          total_errores: totalErrores,
          fecha_snapshot: fecha,
          tipo_periodo: tipoPeriodo
        },
        errores: errores.slice(0, 10) // Solo primeros 10 errores
      });

    } catch (error) {
      console.error('❌ Error procesando CSV:', error);
      res.status(500).json({
        error: 'Error interno procesando el archivo CSV',
        details: error.message
      });
    }
  },

  // Helper: Parsear línea CSV manualmente (para manejar comillas)
  parseCSVLine: (linea) => {
    const valores = [];
    let valorActual = '';
    let dentroComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      
      if (char === '"') {
        dentroComillas = !dentroComillas;
      } else if (char === ',' && !dentroComillas) {
        valores.push(valorActual.trim());
        valorActual = '';
      } else {
        valorActual += char;
      }
    }
    
    valores.push(valorActual.trim());
    return valores;
  },

  // Helper: Mapear CSV row a objeto jugador
  mapCSVToJugador: (headers, valores) => {
    const jugador = {};
    
    // Mapeo de campos del CSV a campos de BD
    const fieldMap = {
      'Site': 'site',
      'Player': 'jugador_nombre',
      'All-In Adj BB/100': 'all_in_adj_bb_100',
      'BB/100': 'bb_100',
      'My C Won': 'my_c_won',
      'Hands': 'hands',
      'VPIP': 'vpip',
      'PFR': 'pfr',
      '3Bet PF NO SQZ': 'three_bet_pf_no_sqz',
      '3Bet PF & Fold': 'three_bet_pf_fold',
      '2Bet PF & Fold': 'two_bet_pf_fold',
      'Raise & 4Bet+ PF ': 'raise_4bet_plus_pf',
      'PF Squeeze': 'pf_squeeze',
      'Donk F': 'donk_f',
      'XR Flop': 'xr_flop',
      'CBet F (non-3B nMW, non SB vs BB)': 'cbet_f_non_3b_nmw_non_sb_vs_bb',
      'CBet F (non-3B nMW)': 'cbet_f_non_3b_nmw',
      'CBet F': 'cbet_f',
      'Float F': 'float_f',
      'CBet T': 'cbet_t',
      'CBet R': 'cbet_r',
      'WWSF': 'wwsf',
      'WSD': 'wsd',
      'Probe T': 'probe_t',
      'T_OB%': 't_ob_pct',
      'Fold T OverBet': 'fold_t_overbet',
      'Fold R OverBet': 'fold_r_overbet',
      'Steal T': 'steal_t',
      'XR Turn': 'xr_turn',
      'Limp/Fold': 'limp_fold',
      'Limp': 'limp',
      'Limp/Raise': 'limp_raise',
      'Bet R': 'bet_r',
      'Fold R Bet': 'fold_r_bet',
      'WSDWBR': 'wsdwbr',
      'R_OVB%': 'r_ovb_pct',
      'WSDWOBR': 'wsdwobr',
      'WSDWRR': 'wsdwrr',
      'Bet R & Fold': 'bet_r_fold',
      'Bet R Small Pot': 'bet_r_small_pot',
      'WWRB SMALL': 'wwrb_small',
      'Bet R Big Pot': 'bet_r_big_pot',
      'WWRB BIG': 'wwrb_big'
    };

    headers.forEach((header, index) => {
      const dbField = fieldMap[header];
      if (dbField && valores[index] !== undefined) {
        let valor = valores[index];
        
        // Limpiar y convertir valores
        if (dbField === 'my_c_won') {
          valor = parseFloat(valor.replace(/[$,]/g, '')) || 0;
        } else if (dbField === 'hands') {
          valor = parseInt(valor.replace(/,/g, '')) || 0;
        } else if (dbField === 'jugador_nombre' || dbField === 'site') {
          valor = valor.toString().trim();
        } else {
          valor = parseFloat(valor) || 0;
        }
        
        jugador[dbField] = valor;
      }
    });

    // Guardar stake original para mapeo
    jugador.stake_original = jugador.site; // Temporal, se extrae del site o contexto
    
    return jugador;
  },

  // Helper: Generar hash simple
  generateSimpleHash: (texto) => {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash).toString(16);
  },

  // Obtener estadísticas del último upload
  getUploadStats: async (req, res) => {
    try {
      const stats = await StatsCSVModel.getLatestSnapshot();
      
      res.json({
        success: true,
        ultimo_snapshot: stats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error obteniendo estadísticas',
        details: error.message
      });
    }
  }
};

module.exports = StatsCSVController;