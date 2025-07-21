import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { EmptyState } from './EmptyState';

export interface TimelineEvent {
  id: string | number;
  name: string;
  date: string; // formato ISO ou dd/MM/yyyy
  important?: boolean;
}

interface Props {
  events: TimelineEvent[];
}

const TimelineContainer = styled.div`
  width: 100%;
  height: 220px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
`;

const Button = styled.button`
  background: ${theme.colors.info};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 0.95rem;
  &:hover { background: ${theme.colors.primary}; }
`;

export const EventsTimelineChart: React.FC<Props> = ({ events }) => {
  // Agrupar eventos por data (assumindo ordenação por data ascendente)
  const [range, setRange] = useState(7); // dias visíveis
  const [startIdx, setStartIdx] = useState(0);

  const sorted = useMemo(() =>
    [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );
  const visible = sorted.slice(startIdx, startIdx + range);

  const handlePrev = () => setStartIdx(idx => Math.max(0, idx - range));
  const handleNext = () => setStartIdx(idx => Math.min(sorted.length - range, idx + range));

  if (!events.length) {
    return (
      <EmptyState
        icon="📅"
        title="Nenhum evento futuro cadastrado"
        description="Crie eventos para manter a comunidade informada sobre atividades, cultos e reuniões da igreja."
        actionText="Criar Evento"
        actionLink="/agenda"
      />
    );
  }

  return (
    <TimelineContainer>
      <Controls>
        <Button onClick={handlePrev} disabled={startIdx === 0}>◀</Button>
        <Button onClick={handleNext} disabled={startIdx + range >= sorted.length}>▶</Button>
      </Controls>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={visible} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <Tooltip formatter={(value, name, props) => props.payload?.name} labelFormatter={label => `Data: ${label}`} />
          <Bar dataKey="important" name="Evento" fill={theme.colors.info}
            isAnimationActive={true}
            shape={props => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={payload.important ? theme.colors.danger : theme.colors.info}
                  rx={4}
                />
              );
            }}
            label={{ position: 'top', formatter: (v: any, p: any, props: any) => props.payload.name }}
          />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 12, color: theme.colors.textLight, marginTop: 4 }}>
        <span style={{ color: theme.colors.danger, fontWeight: 'bold' }}>■</span> Evento importante &nbsp;
        <span style={{ color: theme.colors.info, fontWeight: 'bold' }}>■</span> Evento comum
      </div>
    </TimelineContainer>
  );
}; 