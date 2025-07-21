import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { EmptyState } from './EmptyState';

export interface MemberDistributionData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface Props {
  data: MemberDistributionData[];
}

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`;

const CustomLegend = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0 0 0;
  padding: 0;
`;

const LegendItem = styled.li<{ color: string; active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
`;

const ColorDot = styled.span<{ color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: inline-block;
`;

export const MembersDistributionChart: React.FC<Props> = React.memo(({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data.length) {
    return (
      <EmptyState
        icon="👥"
        title="Nenhum dado de membros disponível"
        description="Cadastre membros da igreja para visualizar a distribuição por faixa etária e acompanhar o crescimento da comunidade."
        actionText="Cadastrar Membro"
        actionLink="/pessoas"
      />
    );
  }

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);
  const onPieClick = (_: any, index: number) => setActiveIndex(index);

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={true}
            activeIndex={activeIndex ?? undefined}
            activeShape={props => (
              <g>
                <Pie {...props} />
                <text x={props.cx} y={props.cy - 120} textAnchor="middle" fill={theme.colors.primary} fontWeight="bold">
                  {data[props.index]?.name}
                </text>
              </g>
            )}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={onPieClick}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} membros`} />
        </PieChart>
      </ResponsiveContainer>
      <CustomLegend>
        {data.map((entry, idx) => (
          <LegendItem key={entry.name} color={entry.color} active={activeIndex === null || activeIndex === idx}>
            <ColorDot color={entry.color} />
            <span>{entry.name} ({entry.value} membros, {entry.percentage}%)</span>
          </LegendItem>
        ))}
      </CustomLegend>
    </ChartContainer>
  );
}); 