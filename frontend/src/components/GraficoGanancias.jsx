import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Box, useColorModeValue } from '@chakra-ui/react';
import api from '../services/api';

const GraficoGanancias = ({ nombre, chartWidth = 1150, chartHeight = 500 }) => {
  const [data, setData] = useState([]);

  // Colores para modo claro/oscuro
  const chartBg = useColorModeValue('#FAFAFA', '#2D3748');
  const axisColor = useColorModeValue('#333', '#ccc');
  const gridColor = useColorModeValue('#ccc', '#4A5568');
  const tooltipBg = useColorModeValue('#fff', '#1A202C');
  const tooltipBorder = useColorModeValue('#ccc', '#2D3748');
  const watermarkColor = useColorModeValue('gray.400', 'gray.500');

  useEffect(() => {
    api.get(`/grafico-ganancias/${nombre}`)
      .then(res => {
        const { handGroups, totalMoneyWon, totalMWNSD, totalMWSD } = res.data;

        if (handGroups && handGroups.length > 0) {
          const firstTotal = totalMoneyWon[0];
          const firstNoSD = totalMWNSD[0];
          const firstSD = totalMWSD[0];

          const formattedData = handGroups.map((group, index) => ({
            hand_group: group,
            total_money_won: totalMoneyWon[index] - firstTotal,
            total_mwnsd: totalMWNSD[index] - firstNoSD,
            total_mwsd: totalMWSD[index] - firstSD,
          }));

          setData(formattedData);
        } else {
          setData([]);
        }
      })
      .catch(error => console.error("Error al obtener gráfico de ganancias:", error));
  }, [nombre]);

  return (
    <Box
      width="100%"
      overflowX="auto"
      px={2}
    >
      <Box
        position="relative"
        width={`${chartWidth}px`}
        height={`${chartHeight}px`}
        m="0 auto"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
            style={{
              backgroundColor: chartBg,
              borderRadius: '12px',
              padding: '10px',
              transition: 'background-color 0.3s ease',
            }}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="hand_group" stroke={axisColor} />
            <YAxis stroke={axisColor} />

            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: '10px',
                border: `1px solid ${tooltipBorder}`,
              }}
              formatter={(value) => `${value.toFixed(2)} USD`}
              labelFormatter={(label) => `Mano: ${label}`}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 10 }} />
            <ReferenceLine y={0} stroke="#000" strokeWidth={2} />

            <Line
              type="monotone"
              dataKey="total_money_won"
              stroke="#00AA00"
              strokeWidth={2.5}
              dot={false}
              name="Net Won"
            />
            <Line
              type="monotone"
              dataKey="total_mwnsd"
              stroke="#FF0000"
              strokeWidth={2}
              dot={false}
              name="Won Without Showdown"
            />
            <Line
              type="monotone"
              dataKey="total_mwsd"
              stroke="#0000FF"
              strokeWidth={2}
              dot={false}
              name="Won With Showdown"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Marca de agua (centro) */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%) rotate(-30deg)"
          pointerEvents="none"
          opacity={0.15}
          fontSize="52px"
          fontWeight="bold"
          color={watermarkColor}
          userSelect="none"
          textAlign="center"
        >
          Poker Track PRO
        </Box>
      </Box>
    </Box>
  );
};

export default GraficoGanancias;
