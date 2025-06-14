// backend/controllers/graficosCSVController.js
const pool = require('../config/db');
const { EventLogger } = require('../utils/eventLogger');

const GraficosCSVController = {
  // Subir y procesar archivo CSV de gráficos
  uploadGraficosCSV: async (req, res) => {
    try {
      const { contenidoCSV } = req.body;
      const usuarioId = req.usuario.id;

      // Validaciones básicas
      if (!contenidoCSV) {
        return res.status(400).json({
          error: 'contenidoCSV es obligatorio'
        });
      }

      console.log(`📊 Iniciando procesamiento CSV de gráficos`);

      // Parsear CSV
      const lineas = contenidoCSV.split('\n').filter(linea => linea.trim());
      console.log(`📋 Total líneas detectadas: ${lineas.length}`);
      
      if (lineas.length < 2) {
        return res.status(400).json({
          error: 'El archivo CSV debe tener al menos headers y una fila de datos'
        });
      }

      // Parsear headers
      const headers = lineas[0].split(',').map(h => h.trim());
      console.log(`🏷️ Headers detectados:`, headers);
      
      // Validar headers requeridos
      const requiredHeaders = ['player_name', 'hand_group', 'total_money_won', 'money_won_nosd', 'money_won_sd'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        return res.status(400).json({
          error: `Headers faltantes: ${missingHeaders.join(', ')}`
        });
      }

      // Limpiar tabla existente (opcional, o podrías hacer upsert)
      console.log(`🧹 Limpiando datos anteriores...`);
      await pool.query('TRUNCATE TABLE graficos_precalculados RESTART IDENTITY');

      // Procesar datos
      const BATCH_SIZE = 1000;
      let totalProcesados = 0;
      let totalErrores = 0;
      const errores = [];

      for (let i = 1; i < lineas.length; i += BATCH_SIZE) {
        const batch = lineas.slice(i, i + BATCH_SIZE);
        const graficosData = [];
        
        console.log(`📦 Procesando batch ${Math.floor(i/BATCH_SIZE) + 1}: líneas ${i} a ${i + batch.length - 1}`);

        for (let j = 0; j < batch.length; j++) {
          const linea = batch[j];
          const lineaNumero = i + j;
          
          try {
            const valores = linea.split(',').map(v => v.trim());
            
            if (valores.length !== headers.length) {
              totalErrores++;
              continue;
            }

            // Mapear valores según headers
            const graficoData = {};
            headers.forEach((header, index) => {
              graficoData[header] = valores[index];
            });

            // Validar y convertir datos
            const playerName = graficoData.player_name;
            const handGroup = parseInt(graficoData.hand_group);
            const totalMoneyWon = parseFloat(graficoData.total_money_won) || 0;
            const moneyWonNosd = parseFloat(graficoData.money_won_nosd) || 0;
            const moneyWonSd = parseFloat(graficoData.money_won_sd) || 0;

            if (!playerName || isNaN(handGroup)) {
              totalErrores++;
              continue;
            }

            graficosData.push({
              player_name: playerName,
              hand_group: handGroup,
              total_money_won: totalMoneyWon,
              money_won_nosd: moneyWonNosd,
              money_won_sd: moneyWonSd
            });

          } catch (error) {
            totalErrores++;
            errores.push(`Línea ${lineaNumero}: ${error.message}`);
          }
        }

        // Insertar batch en BD
        if (graficosData.length > 0) {
          console.log(`💾 Insertando batch de ${graficosData.length} registros...`);
          
          try {
            // Insertar datos del batch
            for (const data of graficosData) {
              await pool.query(`
                INSERT INTO graficos_precalculados 
                (player_name, hand_group, total_money_won, money_won_nosd, money_won_sd)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (player_name, hand_group) 
                DO UPDATE SET
                  total_money_won = EXCLUDED.total_money_won,
                  money_won_nosd = EXCLUDED.money_won_nosd,
                  money_won_sd = EXCLUDED.money_won_sd,
                  fecha_calculo = CURRENT_TIMESTAMP
              `, [
                data.player_name,
                data.hand_group,
                data.total_money_won,
                data.money_won_nosd,
                data.money_won_sd
              ]);
            }
            
            totalProcesados += graficosData.length;
            console.log(`✅ Batch insertado exitosamente`);
          } catch (dbError) {
            console.error(`❌ Error insertando batch:`, dbError.message);
            totalErrores += graficosData.length;
          }
        }
      }

      // Actualizar información adicional del jugador
      console.log(`📊 Actualizando información adicional de jugadores...`);
      
      await pool.query(`
        UPDATE graficos_precalculados gp
        SET 
          total_hands = subq.max_hand_group + 100,
          total_winnings = subq.final_winnings
        FROM (
          SELECT 
            player_name,
            MAX(hand_group) as max_hand_group,
            MAX(total_money_won) as final_winnings
          FROM graficos_precalculados
          GROUP BY player_name
        ) subq
        WHERE gp.player_name = subq.player_name
      `);

      // Log del evento
      EventLogger.log(usuarioId, 'graficos_csv_upload', {
        total_procesados: totalProcesados,
        total_errores: totalErrores,
        total_jugadores: await pool.query('SELECT COUNT(DISTINCT player_name) as count FROM graficos_precalculados').then(r => r.rows[0].count)
      }, req).catch(console.error);

      res.json({
        success: true,
        message: 'CSV de gráficos procesado exitosamente',
        estadisticas: {
          total_procesados: totalProcesados,
          total_errores: totalErrores,
          total_lineas: lineas.length - 1
        },
        errores: errores.slice(0, 10) // Solo primeros 10 errores
      });

    } catch (error) {
      console.error('❌ Error procesando CSV de gráficos:', error);
      res.status(500).json({
        error: 'Error interno procesando el archivo CSV',
        details: error.message
      });
    }
  },

  // Obtener estadísticas del último upload
  getGraficosStats: async (req, res) => {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(DISTINCT player_name) as total_jugadores,
          COUNT(*) as total_puntos_datos,
          MAX(fecha_calculo) as ultima_actualizacion,
          MIN(fecha_calculo) as primera_carga
        FROM graficos_precalculados
      `);
      
      const topJugadores = await pool.query(`
        SELECT 
          player_name,
          COUNT(*) as puntos_grafico,
          MAX(total_money_won) as ganancia_final
        FROM graficos_precalculados
        GROUP BY player_name
        ORDER BY ganancia_final DESC
        LIMIT 10
      `);
      
      res.json({
        success: true,
        estadisticas: stats.rows[0],
        top_jugadores: topJugadores.rows
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

module.exports = GraficosCSVController;