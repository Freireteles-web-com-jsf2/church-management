import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';
import { FixedSizeList as List } from 'react-window';

export interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showItemsPerPageSelect?: boolean;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (value: number) => void;
}

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
`;

const TableHead = styled.thead`
  background-color: ${theme.colors.grayLight};
  border-bottom: 1px solid ${theme.colors.gray};
`;

const TableHeadCell = styled.th<{ width?: string; align?: 'left' | 'center' | 'right'; sortable?: boolean }>`
  padding: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textLight};
  text-align: ${({ align }) => align || 'left'};
  white-space: nowrap;
  ${({ width }) => width && `width: ${width};`}
  
  ${({ sortable }) => sortable && css`
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background-color: ${theme.colors.gray};
    }
  `}
`;

const SortIcon = styled.span<{ direction?: 'asc' | 'desc' }>`
  display: inline-block;
  margin-left: ${theme.spacing.xs};
  
  &::after {
    content: '${({ direction }) => {
      if (direction === 'asc') return '↑';
      if (direction === 'desc') return '↓';
      return '↕';
    }}';
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ clickable?: boolean }>`
  border-bottom: 1px solid ${theme.colors.gray};
  transition: background-color ${theme.transitions.fast};
  
  &:last-child {
    border-bottom: none;
  }
  
  ${({ clickable }) => clickable && css`
    cursor: pointer;
    
    &:hover {
      background-color: ${theme.colors.primaryVeryLight};
    }
  `}
`;

const TableCell = styled.td<{ align?: 'left' | 'center' | 'right' }>`
  padding: ${theme.spacing.md};
  text-align: ${({ align }) => align || 'left'};
  color: ${theme.colors.text};
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textLight};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${theme.colors.grayLight};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.gray};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const PaginationInfo = styled.div`
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSize.sm};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const PageButton = styled.button<{ isActive?: boolean }>`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${({ isActive }) => (isActive ? theme.colors.primary : theme.colors.gray)};
  background-color: ${({ isActive }) => (isActive ? theme.colors.primary : theme.colors.white)};
  color: ${({ isActive }) => (isActive ? theme.colors.white : theme.colors.text)};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background-color: ${({ isActive }) => (isActive ? theme.colors.primaryDark : theme.colors.grayLight)};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ItemsPerPageSelect = styled.select`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.white};
  margin-left: ${theme.spacing.md};
`;

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado',
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  className,
}: TableProps<T>) {
  const handleHeaderClick = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.accessor as string);
    }
  };

  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    
    return item[column.accessor] as React.ReactNode;
  };

  return (
    <TableContainer className={className}>
      {isLoading && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
      
      <StyledTable>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableHeadCell
                key={index}
                width={column.width}
                align={column.align}
                sortable={column.sortable}
                onClick={() => handleHeaderClick(column)}
              >
                {column.header}
                {column.sortable && (
                  <SortIcon 
                    direction={sortColumn === column.accessor ? sortDirection : undefined} 
                  />
                )}
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 50 ? (
            <List
              height={400}
              itemCount={data.length}
              itemSize={48}
              width="100%"
              style={{ width: '100%' }}
            >
              {({ index, style }) => {
                const item = data[index];
                return (
                  <TableRow 
                    key={keyExtractor(item)}
                    clickable={!!onRowClick}
                    onClick={() => onRowClick && onRowClick(item)}
                    style={style}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} align={column.align}>
                        {renderCell(item, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              }}
            </List>
          ) : (
            data.length > 0 ? (
              data.map((item) => (
                <TableRow 
                  key={keyExtractor(item)}
                  clickable={!!onRowClick}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, index) => (
                    <TableCell key={index} align={column.align}>
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState>{emptyMessage}</EmptyState>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  showItemsPerPageSelect = false,
  itemsPerPageOptions = [10, 25, 50, 100],
  onItemsPerPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);
  
  // Gerar array de páginas para exibição
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Mostrar todas as páginas se o total for menor que o máximo
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostrar a primeira página
      pages.push(1);
      
      // Calcular páginas do meio
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Ajustar se estiver próximo do início ou fim
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Adicionar elipses se necessário
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Adicionar páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Adicionar elipses se necessário
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Sempre mostrar a última página
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <PaginationContainer>
      {totalItems !== undefined && (
        <PaginationInfo>
          Mostrando {startItem} a {endItem} de {totalItems} registros
          {showItemsPerPageSelect && (
            <>
              <span style={{ marginLeft: theme.spacing.sm }}>Itens por página:</span>
              <ItemsPerPageSelect
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange && onItemsPerPageChange(Number(e.target.value))}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </ItemsPerPageSelect>
            </>
          )}
        </PaginationInfo>
      )}
      
      <PaginationControls>
        <PageButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </PageButton>
        
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lsaquo;
        </PageButton>
        
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <PageButton
              key={index}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PageButton>
          ) : (
            <span key={index} style={{ margin: '0 4px' }}>{page}</span>
          )
        ))}
        
        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &rsaquo;
        </PageButton>
        
        <PageButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </PageButton>
      </PaginationControls>
    </PaginationContainer>
  );
};

export default Table;