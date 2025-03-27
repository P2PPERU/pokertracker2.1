import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

const GraficoGanancias = ({ nombre }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get(`/grafico-ganancias/${nombre}`)
      .then(res => {
        const {
          handGroups,
          totalMoneyWon,
          totalMWNSD,
          totalMWSD
        } = res.data;

        if (handGroups.length > 0) {
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
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        style={{ backgroundColor: '#FAFAFA', borderRadius: '12px', padding: '10px' }}
      >
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis dataKey="hand_group" />
        <YAxis />
        
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #ccc' }}
          formatter={(value) => `${value.toFixed(2)} USD`}
          labelFormatter={(label) => `Mano: ${label}`}
        />
        
        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 10 }} />
        <ReferenceLine y={0} stroke="#000" strokeWidth={2} />

        <Line
          type="monotone"
          dataKey="total_money_won"
          stroke="#00AA00"   // 🟢 Verde para Net Won
          strokeWidth={2.5}
          dot={false}
          name="Net Won"
        />
        <Line
          type="monotone"
          dataKey="total_mwnsd"
          stroke="#FF0000"   // 🔴 Rojo para No Showdown
          strokeWidth={2}
          dot={false}
          name="Won Without Showdown"
        />
        <Line
          type="monotone"
          dataKey="total_mwsd"
          stroke="#0000FF"   // 🔵 Azul para With Showdown
          strokeWidth={2}
          dot={false}
          name="Won With Showdown"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GraficoGanancias;
