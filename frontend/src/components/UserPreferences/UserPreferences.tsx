import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button, Alert, Card, CardHeader, CardBody } from '../';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

export interface UserPreferencesData {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  notifications: {
    email: boolean;
    push: boolean;
    security: boolean;
    updates: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowProfileView: boolean;
    shareActivity: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
  dashboard: {
    defaultView: 'grid' | 'list';
    itemsPerPage: 10 | 25 | 50 | 100;
    showWelcomeMessage: boolean;
  };
}

export interface UserPreferencesProps {
  onSave?: (preferences: UserPreferencesData) => void;
  className?: string;
}

const PreferencesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const PreferenceSection = styled(Card)`
  height: fit-content;
`;

const PreferenceGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PreferenceLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text};
`;

const PreferenceDescription = styled.p`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textLight};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.white};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text};
`;

const Radio = styled.input.attrs({ type: 'radio' })`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
`;

const SaveButton = styled(Button)`
  align-self: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const PreviewBox = styled.div<{ theme: 'light' | 'dark' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.gray};
  background: ${props => props.theme === 'dark' ? '#2c3e50' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.sm};
`;

const defaultPreferences: UserPreferencesData = {
  theme: 'light',
  language: 'pt-BR',
  notifications: {
    email: true,
    push: true,
    security: true,
    updates: false
  },
  privacy: {
    showOnlineStatus: true,
    allowProfileView: true,
    shareActivity: false
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false
  },
  dashboard: {
    defaultView: 'grid',
    itemsPerPage: 25,
    showWelcomeMessage: true
  }
};

export const UserPreferences: React.FC<UserPreferencesProps> = ({
  onSave,
  className
}) => {
  const { saveAppState, loadAppState, isLoading } = useLocalAuth();
  const [preferences, setPreferences] = useState<UserPreferencesData>(defaultPreferences);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar preferências salvas
  useEffect(() => {
    const savedState = loadAppState();
    if (savedState?.preferences) {
      setPreferences(prev => ({ ...prev, ...savedState.preferences }));
    }
  }, [loadAppState]);

  const handlePreferenceChange = (
    section: keyof UserPreferencesData,
    key: string,
    value: any
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
    setMessage(null);
  };

  const handleDirectChange = (key: keyof UserPreferencesData, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
    setMessage(null);
  };

  const handleSave = async () => {
    try {
      // Salvar no contexto de autenticação
      saveAppState({ preferences });
      
      // Aplicar algumas preferências imediatamente
      applyPreferences(preferences);
      
      setMessage({ type: 'success', text: 'Preferências salvas com sucesso!' });
      setHasChanges(false);
      
      if (onSave) {
        onSave(preferences);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar preferências' });
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
    setMessage(null);
  };

  const applyPreferences = (prefs: UserPreferencesData) => {
    // Aplicar tema
    if (prefs.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (prefs.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      // Auto - usar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Aplicar tamanho da fonte
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.fontSize = fontSizeMap[prefs.accessibility.fontSize];

    // Aplicar alto contraste
    if (prefs.accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Aplicar redução de movimento
    if (prefs.accessibility.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'English (US)',
      'es-ES': 'Español (España)'
    };
    return languages[code] || code;
  };

  return (
    <PreferencesContainer className={className}>
      {message && (
        <Alert
          variant={message.type}
          message={message.text}
          dismissible
          onClose={() => setMessage(null)}
        />
      )}

      <PreferencesGrid>
        {/* Aparência */}
        <PreferenceSection>
          <CardHeader>
            <h3>🎨 Aparência</h3>
          </CardHeader>
          <CardBody>
            <PreferenceGroup>
              <PreferenceLabel>Tema</PreferenceLabel>
              <PreferenceDescription>
                Escolha como o sistema deve aparecer para você
              </PreferenceDescription>
              <RadioGroup>
                <RadioLabel>
                  <Radio
                    name="theme"
                    value="light"
                    checked={preferences.theme === 'light'}
                    onChange={(e) => handleDirectChange('theme', e.target.value)}
                  />
                  Claro
                </RadioLabel>
                <RadioLabel>
                  <Radio
                    name="theme"
                    value="dark"
                    checked={preferences.theme === 'dark'}
                    onChange={(e) => handleDirectChange('theme', e.target.value)}
                  />
                  Escuro
                </RadioLabel>
                <RadioLabel>
                  <Radio
                    name="theme"
                    value="auto"
                    checked={preferences.theme === 'auto'}
                    onChange={(e) => handleDirectChange('theme', e.target.value)}
                  />
                  Automático (seguir sistema)
                </RadioLabel>
              </RadioGroup>
              <PreviewBox theme={preferences.theme === 'dark' ? 'dark' : 'light'}>
                Prévia do tema {preferences.theme === 'dark' ? 'escuro' : 'claro'}
              </PreviewBox>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>Idioma</PreferenceLabel>
              <PreferenceDescription>
                Selecione o idioma da interface
              </PreferenceDescription>
              <Select
                value={preferences.language}
                onChange={(e) => handleDirectChange('language', e.target.value)}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español (España)</option>
              </Select>
            </PreferenceGroup>
          </CardBody>
        </PreferenceSection>

        {/* Notificações */}
        <PreferenceSection>
          <CardHeader>
            <h3>🔔 Notificações</h3>
          </CardHeader>
          <CardBody>
            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.notifications.email}
                  onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                />
                Notificações por E-mail
              </PreferenceLabel>
              <PreferenceDescription>
                Receber notificações importantes por e-mail
              </PreferenceDescription>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.notifications.push}
                  onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                />
                Notificações Push
              </PreferenceLabel>
              <PreferenceDescription>
                Receber notificações no navegador
              </PreferenceDescription>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.notifications.security}
                  onChange={(e) => handlePreferenceChange('notifications', 'security', e.target.checked)}
                />
                Alertas de Segurança
              </PreferenceLabel>
              <PreferenceDescription>
                Notificações sobre atividades de segurança na conta
              </PreferenceDescription>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.notifications.updates}
                  onChange={(e) => handlePreferenceChange('notifications', 'updates', e.target.checked)}
                />
                Atualizações do Sistema
              </PreferenceLabel>
              <PreferenceDescription>
                Notificações sobre novas funcionalidades e atualizações
              </PreferenceDescription>
            </PreferenceGroup>
          </CardBody>
        </PreferenceSection>

        {/* Privacidade */}
        <PreferenceSection>
          <CardHeader>
            <h3>🔒 Privacidade</h3>
          </CardHeader>
          <CardBody>
            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.privacy.showOnlineStatus}
                  onChange={(e) => handlePreferenceChange('privacy', 'showOnlineStatus', e.target.checked)}
                />
                Mostrar Status Online
              </PreferenceLabel>
              <PreferenceDescription>
                Permitir que outros vejam quando você está online
              </PreferenceDescription>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.privacy.allowProfileView}
                  onChange={(e) => handlePreferenceChange('privacy', 'allowProfileView', e.target.checked)}
                />
                Permitir Visualização do Perfil
              </PreferenceLabel>
              <PreferenceDescription>
                Permitir que outros membros vejam seu perfil
              </PreferenceDescription>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.privacy.shareActivity}
                  onChange={(e) => handlePreferenceChange('privacy', 'shareActivity', e.target.checked)}
                />
                Compartilhar Atividade
              </PreferenceLabel>
              <PreferenceDescription>
                Mostrar sua atividade recente para outros membros
              </PreferenceDescription>
            </PreferenceGroup>
          </CardBody>
        </PreferenceSection>

        {/* Acessibilidade */}
        <PreferenceSection>
          <CardHeader>
            <h3>♿ Acessibilidade</h3>
          </CardHeader>
          <CardBody>
            <PreferenceGroup>
              <PreferenceLabel>Tamanho da Fonte</PreferenceLabel>
              <PreferenceDescription>
                Ajuste o tamanho do texto para melhor legibilidade
              </PreferenceDescription>
              <Select
                value={preferences.accessibility.fontSize}
                onChange={(e) => handlePreferenceChange('accessibility', 'fontSize', e.target.value)}
              >
                <option value="small">Pequena</option>
                <option value="medium">Média</option>
                <option value="large">Grande</option>
              </Select>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.accessibility.highContrast}
                  onChange={(e) => handlePreferenceChange('accessibility', 'highContrast', e.target.checked)}
                />
                Alto Contraste
              </PreferenceLabel>
              <PreferenceDescription>
                Aumentar o contraste para melhor visibilidade
              </PreferenceDescription>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.accessibility.reduceMotion}
                  onChange={(e) => handlePreferenceChange('accessibility', 'reduceMotion', e.target.checked)}
                />
                Reduzir Movimento
              </PreferenceLabel>
              <PreferenceDescription>
                Minimizar animações e transições
              </PreferenceDescription>
            </PreferenceGroup>
          </CardBody>
        </PreferenceSection>

        {/* Dashboard */}
        <PreferenceSection>
          <CardHeader>
            <h3>📊 Dashboard</h3>
          </CardHeader>
          <CardBody>
            <PreferenceGroup>
              <PreferenceLabel>Visualização Padrão</PreferenceLabel>
              <PreferenceDescription>
                Como os dados devem ser exibidos por padrão
              </PreferenceDescription>
              <RadioGroup>
                <RadioLabel>
                  <Radio
                    name="defaultView"
                    value="grid"
                    checked={preferences.dashboard.defaultView === 'grid'}
                    onChange={(e) => handlePreferenceChange('dashboard', 'defaultView', e.target.value)}
                  />
                  Grade
                </RadioLabel>
                <RadioLabel>
                  <Radio
                    name="defaultView"
                    value="list"
                    checked={preferences.dashboard.defaultView === 'list'}
                    onChange={(e) => handlePreferenceChange('dashboard', 'defaultView', e.target.value)}
                  />
                  Lista
                </RadioLabel>
              </RadioGroup>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>Itens por Página</PreferenceLabel>
              <PreferenceDescription>
                Quantos itens mostrar em cada página
              </PreferenceDescription>
              <Select
                value={preferences.dashboard.itemsPerPage}
                onChange={(e) => handlePreferenceChange('dashboard', 'itemsPerPage', parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </PreferenceGroup>

            <PreferenceGroup>
              <PreferenceLabel>
                <Checkbox
                  checked={preferences.dashboard.showWelcomeMessage}
                  onChange={(e) => handlePreferenceChange('dashboard', 'showWelcomeMessage', e.target.checked)}
                />
                Mostrar Mensagem de Boas-vindas
              </PreferenceLabel>
              <PreferenceDescription>
                Exibir mensagem de boas-vindas no dashboard
              </PreferenceDescription>
            </PreferenceGroup>
          </CardBody>
        </PreferenceSection>
      </PreferencesGrid>

      <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={isLoading}
        >
          Restaurar Padrões
        </Button>
        <SaveButton
          onClick={handleSave}
          loading={isLoading}
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Preferências'}
        </SaveButton>
      </div>
    </PreferencesContainer>
  );
};

export default UserPreferences;