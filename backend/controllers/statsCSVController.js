// backend/controllers/statsCSVController.js
const StatsCSVModel = require('../models/statsCSVModel');
const { EventLogger } = require('../utils/eventLogger');
const { getFieldMapping } = require('../config/statsMapping');

const StatsCSVController = {
  // Subir y procesar archivo CSV
  uploadStatsCSV: async (req, res) => {
    try {
      const { contenidoCSV, tipoPeriodo, fecha, stake } = req.body; // Recibir stake
      const usuarioId = req.usuario.id;

      // Validaciones básicas
      if (!contenidoCSV || !tipoPeriodo || !fecha || !stake) {
        return res.status(400).json({
          error: 'contenidoCSV, tipoPeriodo, fecha y stake son obligatorios'
        });
      }

      // Validar stake
      const stakesValidos = ['microstakes', 'nl100', 'nl200', 'nl400', 'high-stakes'];
      if (!stakesValidos.includes(stake)) {
        return res.status(400).json({
          error: `Stake inválido. Valores permitidos: ${stakesValidos.join(', ')}`
        });
      }

      if (!['total', 'semana', 'mes'].includes(tipoPeriodo)) {
        return res.status(400).json({
          error: 'tipoPeriodo debe ser: total, semana, o mes'
        });
      }

      console.log(`📊 Iniciando procesamiento CSV: ${tipoPeriodo} - ${fecha} - Stake: ${stake}`);

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
        
        // 🔑 CAMBIO CLAVE: Mapear sala desde Site, pero stake desde parámetro
        jugadorData.sala = StatsCSVModel.mapSala(jugadorData.site);
        jugadorData.stake_category = stake; // Usar el stake del request, NO del CSV
        jugadorData.stake_original = stake; // Guardar referencia original
        
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
          `${jugadorData.jugador_nombre}-${jugadorData.hands}-${jugadorData.bb_100}-${stake}`
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
        
        // 🔍 AGREGAR ESTE LOG DE VERIFICACIÓN:
        console.log('🔍 Verificando stakes antes de insertar:', 
        jugadoresData.slice(0, 3).map(j => ({
          nombre: j.jugador_nombre,
          stake_category: j.stake_category,
          stake_original: j.stake_original,
          sala: j.sala,
          site: j.site
        }))
        );
        
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
      console.log(`   🎯 Stake aplicado: ${stake}`);

      // Log del evento
      EventLogger.log(usuarioId, 'csv_upload', {
        tipo_periodo: tipoPeriodo,
        fecha: fecha,
        stake: stake, // Incluir stake en el log
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
          tipo_periodo: tipoPeriodo,
          stake_procesado: stake // Confirmar el stake procesado
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

  // Helper: Mapear CSV row a objeto jugador - ACTUALIZADO CON MAPEO CENTRALIZADO
  mapCSVToJugador: (headers, valores) => {
    const jugador = {};
    
    // Obtener el mapeo de campos desde la configuración central
    const fieldMap = getFieldMapping();

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

    // Validación adicional para campos críticos
    if (!jugador.jugador_nombre) {
      console.warn('⚠️ Jugador sin nombre detectado');
    }
    
    if (!jugador.hands || jugador.hands < 1) {
      console.warn(`⚠️ Jugador ${jugador.jugador_nombre || 'sin nombre'} con ${jugador.hands || 0} manos`);
    }

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