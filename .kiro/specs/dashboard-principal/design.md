# Design Document - Dashboard Principal

## Overview

O Dashboard Principal será uma interface moderna, responsiva e altamente funcional que serve como centro de controle do Sistema de Gestão de Igrejas. O design expandirá o dashboard existente, transformando-o em uma ferramenta dinâmica que se adapta ao role do usuário e fornece insights valiosos através de visualizações interativas.

O dashboard utilizará um layout baseado em grid responsivo, com widgets modulares que podem ser personalizados conforme o perfil do usuário. A interface seguirá o design system existente com paleta azul claro, mantendo consistência visual com o resto da aplicação.

## Architecture

### Component Architecture

```
DashboardPage
├── DashboardHeader
│   ├── WelcomeMessage
│   ├── QuickActions
│   └── NotificationBell
├── DashboardGrid
│   ├── StatsCardsSection
│   │   ├── StatCard (Membros)
│   │   ├── StatCard (Grupos)
│   │   ├── StatCard (Financeiro)
│   │   └── StatCard (Aniversariantes)
│   ├── ChartsSection
│   │   ├── FinancialChart
│   │   ├── MembersDistributionChart
│   │   └── EventsTimelineChart
│   ├── TablesSection
│   │   ├── UpcomingEventsTable
│   │   ├── BirthdayTable
│   │   └── RecentActivitiesTable
│   └── WidgetsSection
│       ├── QuickActionsWidget
│       ├── NotificationsWidget
│       └── CustomizableWidget
└── DashboardSettings
    ├── LayoutCustomizer
    └── WidgetSelector
```

### Data Flow Architecture

```
API Layer
├── /api/dashboard/stats - Estatísticas gerais
├── /api/dashboard/charts - Dados para gráficos
├── /api/dashboard/events - Próximos eventos
├── /api/dashboard/birthdays - Aniversariantes
├── /api/dashboard/notifications - Notificações
└── /api/dashboard/activities - Atividades recentes

Service Layer
├── DashboardService
│   ├── fetchDashboardData()
│   ├── updateDashboardConfig()
│   └── refreshData()
├── ChartService
│   ├── processFinancialData()
│   ├── processMemberData()
│   └── processEventData()
└── NotificationService
    ├── fetchNotifications()
    └── markAsRead()

State Management
├── DashboardContext
│   ├── dashboardData
│   ├── userConfig
│   ├── loading states
│   └── error states
└── Custom Hooks
    ├── useDashboardData()
    ├── useChartData()
    ├── useNotifications()
    └── useDashboardConfig()
```

## Components and Interfaces

### Core Components

#### 1. DashboardPage Component
```typescript
interface DashboardPageProps {
  userRole: UserRole;
  userId: string;
}

interface DashboardState {
  data: DashboardData;
  config: DashboardConfig;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}
```

#### 2. StatCard Component
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  onClick?: () => void;
  loading?: boolean;
}
```

#### 3. Interactive Charts
```typescript
interface ChartProps {
  data: ChartData[];
  type: 'bar' | 'pie' | 'line' | 'area';
  title: string;
  height?: number;
  interactive?: boolean;
  onDataPointClick?: (data: any) => void;
}

interface FinancialChartProps extends ChartProps {
  period: 'month' | 'quarter' | 'year';
  showComparison?: boolean;
}
```

#### 4. EventsTable Component
```typescript
interface EventsTableProps {
  events: Event[];
  maxItems?: number;
  showActions?: boolean;
  onEventClick?: (event: Event) => void;
  onCreateEvent?: () => void;
}
```

#### 5. NotificationWidget Component
```typescript
interface NotificationWidgetProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  maxItems?: number;
}
```

### Role-Based Widget Configuration

#### Admin Dashboard Layout
```typescript
const adminWidgets: WidgetConfig[] = [
  { type: 'stats', position: { row: 1, col: 1, span: 4 } },
  { type: 'financial-chart', position: { row: 2, col: 1, span: 2 } },
  { type: 'members-chart', position: { row: 2, col: 3, span: 2 } },
  { type: 'events-table', position: { row: 3, col: 1, span: 2 } },
  { type: 'notifications', position: { row: 3, col: 3, span: 1 } },
  { type: 'quick-actions', position: { row: 3, col: 4, span: 1 } },
  { type: 'recent-activities', position: { row: 4, col: 1, span: 4 } }
];
```

#### Pastor Dashboard Layout
```typescript
const pastorWidgets: WidgetConfig[] = [
  { type: 'stats', position: { row: 1, col: 1, span: 4 } },
  { type: 'members-chart', position: { row: 2, col: 1, span: 2 } },
  { type: 'events-timeline', position: { row: 2, col: 3, span: 2 } },
  { type: 'birthdays', position: { row: 3, col: 1, span: 2 } },
  { type: 'groups-overview', position: { row: 3, col: 3, span: 2 } }
];
```

#### Tesoureiro Dashboard Layout
```typescript
const tesoureiroWidgets: WidgetConfig[] = [
  { type: 'financial-stats', position: { row: 1, col: 1, span: 4 } },
  { type: 'financial-chart', position: { row: 2, col: 1, span: 3 } },
  { type: 'expense-breakdown', position: { row: 2, col: 4, span: 1 } },
  { type: 'pending-transactions', position: { row: 3, col: 1, span: 2 } },
  { type: 'budget-alerts', position: { row: 3, col: 3, span: 2 } }
];
```

## Data Models

### Dashboard Data Structure
```typescript
interface DashboardData {
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalGroups: number;
    activeGroups: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    todayBirthdays: number;
    monthBirthdays: number;
    upcomingEvents: number;
  };
  
  trends: {
    membersTrend: TrendData;
    financialTrend: TrendData;
    eventsTrend: TrendData;
  };
  
  charts: {
    financialData: FinancialChartData[];
    membersDistribution: MemberDistributionData[];
    eventsTimeline: EventTimelineData[];
  };
  
  tables: {
    upcomingEvents: Event[];
    todayBirthdays: Person[];
    monthBirthdays: Person[];
    recentActivities: Activity[];
  };
  
  notifications: Notification[];
}

interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

interface FinancialChartData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface MemberDistributionData {
  category: string;
  value: number;
  color: string;
  percentage: number;
}
```

### User Configuration
```typescript
interface DashboardConfig {
  userId: string;
  layout: WidgetLayout[];
  preferences: {
    autoRefresh: boolean;
    refreshInterval: number;
    defaultChartPeriod: 'month' | 'quarter' | 'year';
    showTrends: boolean;
    compactMode: boolean;
  };
  customWidgets: CustomWidget[];
}

interface WidgetLayout {
  id: string;
  type: WidgetType;
  position: GridPosition;
  visible: boolean;
  config: WidgetConfig;
}
```

## Error Handling

### Error Types and Handling Strategy

#### 1. API Connection Errors
```typescript
interface APIError {
  type: 'connection' | 'timeout' | 'server' | 'auth';
  message: string;
  retryable: boolean;
}

// Error handling strategy
const handleAPIError = (error: APIError) => {
  switch (error.type) {
    case 'connection':
      showOfflineMode();
      enableRetryMechanism();
      break;
    case 'timeout':
      showLoadingTimeout();
      offerManualRefresh();
      break;
    case 'server':
      showServerError();
      logErrorForSupport();
      break;
    case 'auth':
      redirectToLogin();
      break;
  }
};
```

#### 2. Data Loading States
```typescript
interface LoadingState {
  stats: boolean;
  charts: boolean;
  tables: boolean;
  notifications: boolean;
}

// Progressive loading strategy
const loadDashboardData = async () => {
  // Load critical data first
  await loadStats();
  setStatsLoaded(true);
  
  // Load secondary data
  Promise.all([
    loadCharts(),
    loadTables(),
    loadNotifications()
  ]);
};
```

#### 3. Fallback Mechanisms
- Cache previous data when API fails
- Show skeleton loaders during loading
- Graceful degradation for missing data
- Offline mode with cached data

## Testing Strategy

### Unit Testing
- Test individual components in isolation
- Mock API responses for consistent testing
- Test error handling scenarios
- Validate role-based widget rendering

### Integration Testing
- Test data flow from API to components
- Verify chart interactions and drill-downs
- Test responsive behavior across devices
- Validate user configuration persistence

### Performance Testing
- Measure initial load time
- Test with large datasets
- Validate memory usage with auto-refresh
- Test mobile performance

### User Experience Testing
- Test with different user roles
- Validate accessibility compliance
- Test keyboard navigation
- Verify mobile touch interactions

## Performance Optimizations

### 1. Data Loading Optimization
```typescript
// Implement progressive loading
const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>();
  
  useEffect(() => {
    // Load critical data first
    loadCriticalData().then(setData);
    
    // Load non-critical data in background
    loadSecondaryData().then(updateData);
  }, []);
};
```

### 2. Chart Rendering Optimization
- Use React.memo for chart components
- Implement data virtualization for large datasets
- Lazy load chart libraries
- Cache processed chart data

### 3. Auto-refresh Strategy
```typescript
const useAutoRefresh = (interval: number) => {
  useEffect(() => {
    const timer = setInterval(() => {
      // Only refresh if tab is active
      if (document.visibilityState === 'visible') {
        refreshDashboardData();
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval]);
};
```

### 4. Mobile Optimization
- Implement touch-friendly interactions
- Optimize chart rendering for mobile
- Use responsive grid system
- Minimize data transfer on mobile

## Security Considerations

### 1. Data Access Control
- Validate user permissions on backend
- Filter sensitive data based on user role
- Implement rate limiting for API calls
- Log access attempts for audit

### 2. Client-Side Security
- Sanitize all user inputs
- Validate data before rendering
- Implement CSRF protection
- Secure local storage usage

### 3. API Security
- Use JWT tokens for authentication
- Implement request signing
- Validate all API responses
- Handle authentication errors gracefully

## Accessibility Features

### 1. Screen Reader Support
- Proper ARIA labels for all interactive elements
- Semantic HTML structure
- Alt text for chart visualizations
- Keyboard navigation support

### 2. Visual Accessibility
- High contrast mode support
- Scalable text and UI elements
- Color-blind friendly chart colors
- Focus indicators for keyboard users

### 3. Motor Accessibility
- Large touch targets for mobile
- Keyboard shortcuts for common actions
- Voice control compatibility
- Reduced motion options

## Deployment and Monitoring

### 1. Performance Monitoring
- Track page load times
- Monitor API response times
- Alert on error rates
- Track user engagement metrics

### 2. Error Tracking
- Implement error boundary components
- Log client-side errors
- Track API failures
- Monitor user feedback

### 3. Analytics
- Track widget usage patterns
- Monitor user customization preferences
- Measure feature adoption
- A/B test new features