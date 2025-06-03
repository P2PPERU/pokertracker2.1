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
      console.log(`📋 Total líneas detectadas: ${lineas.length}`);
      
      if (lineas.length < 2) {
        return res.status(400).json({
          error: 'El archivo CSV debe tener al menos headers y una fila de datos'
        });
      }

      // ✅ CORREGIDO: Usar el mismo parser para headers y datos
      const headers = StatsCSVController.parseCSVLine(lineas[0]);
      console.log(`🏷️ Headers detectados (${headers.length}):`, headers);
      
      const requiredHeaders = ['Site', 'Player', 'Hands', 'BB/100', 'VPIP', 'PFR'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        console.log(`❌ Headers faltantes:`, missingHeaders);
        return res.status(400).json({
          error: `Headers faltantes: ${missingHeaders.join(', ')}`
        });
      }

      console.log(`✅ Headers válidos encontrados`);

      // 🔍 DEBUG: Mostrar primeras líneas para análisis
      console.log(`🔍 Primeras 3 líneas de datos:`);
      for (let i = 1; i <= Math.min(3, lineas.length - 1); i++) {
        const valoresLinea = StatsCSVController.parseCSVLine(lineas[i]);
        console.log(`   Línea ${i}: ${valoresLinea.length} campos (${valoresLinea.slice(0, 3).join(', ')}, ...)`);
      }

      // Procesar datos en batches de 1000
      const BATCH_SIZE = 1000;
      let totalProcesados = 0;
      let totalErrores = 0;
      let totalValidados = 0;
      let totalRechazados = 0;
      const errores = [];

      console.log(`🔄 Iniciando procesamiento por batches de ${BATCH_SIZE}...`);

      for (let i = 1; i < lineas.length; i += BATCH_SIZE) {
        const batch = lineas.slice(i, i + BATCH_SIZE);
        const jugadoresData = [];
        
        console.log(`📦 Procesando batch ${Math.floor(i/BATCH_SIZE) + 1}: líneas ${i} a ${i + batch.length - 1}`);

        for (let j = 0; j < batch.length; j++) {
          const linea = batch[j];
          const lineaNumero = i + j;
          
          try {
            const valores = StatsCSVController.parseCSVLine(linea);
            
            // 🔍 DEBUG: Log cada 50 líneas para no saturar
            if (lineaNumero % 50 === 0 || lineaNumero <= 5) {
              console.log(`   📝 Línea ${lineaNumero}: ${valores.length} campos vs ${headers.length} headers`);
            }
            
            // ✅ CORREGIDO: Verificar si tienen el mismo número de campos
            if (valores.length !== headers.length) {
              if (lineaNumero <= 5) {
                console.log(`   ⚠️ Línea ${lineaNumero} saltada: ${valores.length} campos ≠ ${headers.length} headers`);
              }
              totalRechazados++;
              continue;
            }

            const jugadorData = StatsCSVController.mapCSVToJugador(headers, valores);
            
            // 🔍 DEBUG: Log del jugador mapeado
            if (lineaNumero <= 5) {
              console.log(`   🎯 Jugador mapeado:`, {
                nombre: jugadorData.jugador_nombre,
                site: jugadorData.site,
                hands: jugadorData.hands,
                bb_100: jugadorData.bb_100
              });
            }
            
            // Mapear sala y stake
            jugadorData.sala = StatsCSVModel.mapSala(jugadorData.site);
            jugadorData.stake_category = StatsCSVModel.mapStakeToCategory(jugadorData.stake_original);
            
            // 🔍 DEBUG: Log del mapeo
            if (lineaNumero <= 5) {
              console.log(`   🏢 Mapeo: ${jugadorData.site} → ${jugadorData.sala}, stake: ${jugadorData.stake_category}`);
            }
            
            // Validar datos mínimos
            if (!jugadorData.jugador_nombre || jugadorData.hands < 1) {
              if (lineaNumero <= 5) {
                console.log(`   ❌ Jugador rechazado - Nombre: "${jugadorData.jugador_nombre}", Hands: ${jugadorData.hands}`);
              }
              totalRechazados++;
              continue;
            }

            // Generar hash simple para detección de cambios
            jugadorData.hash_datos = StatsCSVController.generateSimpleHash(
              `${jugadorData.jugador_nombre}-${jugadorData.hands}-${jugadorData.bb_100}`
            );

            jugadoresData.push(jugadorData);
            totalValidados++;
            
            if (lineaNumero <= 5) {
              console.log(`   ✅ Jugador validado: ${jugadorData.jugador_nombre} (${jugadorData.hands} manos)`);
            }
            
          } catch (error) {
            totalErrores++;
            const errorMsg = `Línea ${lineaNumero}: ${error.message}`;
            errores.push(errorMsg);
            
            if (lineaNumero <= 5) {
              console.log(`   💥 Error en línea ${lineaNumero}:`, error.message);
            }
          }
        }

        // Insertar batch en BD
        if (jugadoresData.length > 0) {
          console.log(`💾 Insertando batch de ${jugadoresData.length} jugadores en BD...`);
          
          try {
            await StatsCSVModel.upsertBatch(fecha, tipoPeriodo, jugadoresData);
            totalProcesados += jugadoresData.length;
            console.log(`✅ Batch insertado exitosamente: ${jugadoresData.length} jugadores`);
          } catch (dbError) {
            console.log(`❌ Error insertando batch:`, dbError.message);
            totalErrores += jugadoresData.length;
          }
        } else {
          console.log(`⚠️ Batch vacío, no hay jugadores para insertar`);
        }
      }

      // 📊 RESUMEN FINAL
      console.log(`📊 RESUMEN DEL PROCESAMIENTO:`);
      console.log(`   📋 Total líneas: ${lineas.length - 1}`);
      console.log(`   ✅ Jugadores validados: ${totalValidados}`);
      console.log(`   ❌ Jugadores rechazados: ${totalRechazados}`);
      console.log(`   💾 Jugadores procesados: ${totalProcesados}`);
      console.log(`   💥 Errores totales: ${totalErrores}`);

      // Log del evento
      EventLogger.log(usuarioId, 'csv_upload', {
        tipo_periodo: tipoPeriodo,
        fecha: fecha,
        total_procesados: totalProcesados,
        total_errores: totalErrores,
        total_validados: totalValidados,
        total_rechazados: totalRechazados
      }, req).catch(console.error);

      res.json({
        success: true,
        message: 'CSV procesado exitosamente',
        estadisticas: {
          total_procesados: totalProcesados,
          total_errores: totalErrores,
          total_validados: totalValidados,
          total_rechazados: totalRechazados,
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

  // ✅ MEJORADO: Parser CSV más robusto que maneja comillas correctamente
  parseCSVLine: (linea) => {
    const valores = [];
    let valorActual = '';
    let dentroComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      
      if (char === '"') {
        // Toggle estado de comillas
        dentroComillas = !dentroComillas;
      } else if (char === ',' && !dentroComillas) {
        // Solo dividir por coma si NO estamos dentro de comillas
        valores.push(valorActual.replace(/^"|"$/g, '').trim()); // Quitar comillas y espacios
        valorActual = '';
      } else {
        valorActual += char;
      }
    }
    
    // Agregar el último valor
    valores.push(valorActual.replace(/^"|"$/g, '').trim());
    
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
      'Raise & 4Bet+ PF': 'raise_4bet_plus_pf', // ✅ Quitado espacio extra
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