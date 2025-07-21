import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Card, CardHeader, CardBody, Button, Input, Alert, PasswordChangeForm, UserPreferences } from '../../components';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

const PerfilContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

const PerfilHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  border: 4px solid ${theme.colors.primary};
  background: ${theme.colors.grayLight};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  color: ${theme.colors.grayDark};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const AvatarUploadButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.borderRadius.full};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const InfoCard = styled(Card)`
  margin-bottom: ${theme.spacing.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const StatCard = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const ActivitySection = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.md};
`;

const ActivityText = styled.span`
  color: ${theme.colors.text};
`;

const ActivityTime = styled.span`
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSize.sm};
`;

const TabsContainer = styled.div`
  border-bottom: 1px solid ${theme.colors.gray};
  margin-bottom: ${theme.spacing.lg};
`;

const TabsList = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  background: none;
  cursor: pointer;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${({ active }) => active ? theme.colors.primary : theme.colors.textLight};
  border-bottom: 2px solid ${({ active }) => active ? theme.colors.primary : 'transparent'};
  transition: ${theme.transitions.normal};
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const TabContent = styled.div`
  display: block;
`;

const Perfil: React.FC = () => {
  const { user, updateProfile, changePassword, isLoading, getMyLoginAttempts } = useLocalAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar tentativas de login do usuário
  React.useEffect(() => {
    const loadLoginAttempts = async () => {
      try {
        const attempts = await getMyLoginAttempts();
        setLoginAttempts(attempts);
      } catch (error) {
        console.error('Erro ao carregar tentativas de login:', error);
      }
    };

    if (user) {
      loadLoginAttempts();
    }
  }, [user, getMyLoginAttempts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        avatar: avatar || user?.avatar
      });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil' });
    }
  };



  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'Administrador',
      pastor: 'Pastor',
      lider: 'Líder',
      tesoureiro: 'Tesoureiro',
      voluntario: 'Voluntário',
      membro: 'Membro'
    };
    return roleNames[role] || role;
  };

  if (!user) {
    return (
      <Layout>
        <PerfilContainer>
          <Alert variant="error" message="Usuário não encontrado" />
        </PerfilContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PerfilContainer>
        <PerfilHeader>
          <Title>Meu Perfil</Title>
          {activeTab === 'profile' && !isEditing && !isChangingPassword && (
            <Button onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </PerfilHeader>

        {message && (
          <Alert
            variant={message.type}
            message={message.text}
            dismissible
            onClose={() => setMessage(null)}
          />
        )}

        <TabsContainer>
          <TabsList>
            <Tab 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            >
              👤 Perfil
            </Tab>
            <Tab 
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')}
            >
              🔒 Segurança
            </Tab>
            <Tab 
              active={activeTab === 'preferences'} 
              onClick={() => setActiveTab('preferences')}
            >
              ⚙️ Preferências
            </Tab>
          </TabsList>
        </TabsContainer>

        <TabContent>
          {activeTab === 'profile' && (
            <ProfileGrid>
              {/* Seção do Avatar */}
              <div>
                <InfoCard>
                  <CardHeader>
                    <h3>Foto do Perfil</h3>
                  </CardHeader>
                  <CardBody>
                    <AvatarSection>
                      <AvatarContainer>
                        {avatar || user.avatar ? (
                          <AvatarImage src={avatar || user.avatar} alt="Avatar" />
                        ) : (
                          <AvatarPlaceholder>
                            {getInitials(user.name)}
                          </AvatarPlaceholder>
                        )}
                        {isEditing && (
                          <AvatarUploadButton>
                            📷
                            <HiddenFileInput
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </AvatarUploadButton>
                        )}
                      </AvatarContainer>
                      <div style={{ textAlign: 'center' }}>
                        <h3>{user.name}</h3>
                        <p style={{ color: theme.colors.textLight }}>
                          {getRoleDisplayName(user.role)}
                        </p>
                      </div>
                    </AvatarSection>
                  </CardBody>
                </InfoCard>

                {/* Estatísticas do Usuário */}
                <InfoCard>
                  <CardHeader>
                    <h3>Estatísticas</h3>
                  </CardHeader>
                  <CardBody>
                    <StatsGrid>
                      <StatCard>
                        <StatValue>{loginAttempts?.recentAttempts?.length || 0}</StatValue>
                        <StatLabel>Logins Recentes</StatLabel>
                      </StatCard>
                      <StatCard>
                        <StatValue>
                          {loginAttempts?.lockoutInfo?.isLocked ? 'Bloqueada' : 'Ativa'}
                        </StatValue>
                        <StatLabel>Status da Conta</StatLabel>
                      </StatCard>
                    </StatsGrid>
                  </CardBody>
                </InfoCard>
              </div>

              {/* Seção de Informações */}
              <InfoSection>
                {/* Informações Pessoais */}
                <InfoCard>
                  <CardHeader>
                    <h3>Informações Pessoais</h3>
                  </CardHeader>
                  <CardBody>
                    {isEditing ? (
                      <Form onSubmit={handleProfileSubmit}>
                        <FormRow>
                          <Input
                            label="Nome"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            fullWidth
                          />
                          <Input
                            label="E-mail"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            fullWidth
                          />
                        </FormRow>
                        <Input
                          label="Função"
                          name="role"
                          value={getRoleDisplayName(formData.role)}
                          disabled
                          fullWidth
                          helperText="A função só pode ser alterada por um administrador"
                        />
                        <FormActions>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: user.name,
                                email: user.email,
                                role: user.role
                              });
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" loading={isLoading}>
                            Salvar Alterações
                          </Button>
                        </FormActions>
                      </Form>
                    ) : (
                      <div>
                        <p><strong>Nome:</strong> {user.name}</p>
                        <p><strong>E-mail:</strong> {user.email}</p>
                        <p><strong>Função:</strong> {getRoleDisplayName(user.role)}</p>
                      </div>
                    )}
                  </CardBody>
                </InfoCard>
              </InfoSection>
            </ProfileGrid>
          )}

          {activeTab === 'security' && (
            <div>
              {/* Alterar Senha */}
              <InfoCard>
                <CardHeader>
                  <h3>Alterar Senha</h3>
                </CardHeader>
                <CardBody>
                  {isChangingPassword ? (
                    <PasswordChangeForm
                      onSuccess={() => {
                        setIsChangingPassword(false);
                        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
                      }}
                      onCancel={() => setIsChangingPassword(false)}
                    />
                  ) : (
                    <div>
                      <p>Mantenha sua conta segura alterando sua senha regularmente.</p>
                      <Button
                        onClick={() => setIsChangingPassword(true)}
                        style={{ marginTop: theme.spacing.md }}
                      >
                        Alterar Senha
                      </Button>
                    </div>
                  )}
                </CardBody>
              </InfoCard>

              {/* Atividade Recente */}
              {loginAttempts?.recentAttempts && (
                <InfoCard>
                  <CardHeader>
                    <h3>Atividade Recente</h3>
                  </CardHeader>
                  <CardBody>
                    <ActivitySection>
                      <ActivityList>
                        {loginAttempts.recentAttempts.slice(0, 10).map((attempt: any, index: number) => (
                          <ActivityItem key={index}>
                            <ActivityText>
                              {attempt.success ? '✅ Login realizado' : '❌ Tentativa de login falhada'}
                              {attempt.ipAddress && ` de ${attempt.ipAddress}`}
                              {attempt.failureReason && ` (${attempt.failureReason})`}
                            </ActivityText>
                            <ActivityTime>
                              {new Date(attempt.timestamp).toLocaleString('pt-BR')}
                            </ActivityTime>
                          </ActivityItem>
                        ))}
                      </ActivityList>
                    </ActivitySection>
                  </CardBody>
                </InfoCard>
              )}

              {/* Status de Segurança */}
              <InfoCard>
                <CardHeader>
                  <h3>Status de Segurança</h3>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Status da Conta:</span>
                      <span style={{ 
                        color: loginAttempts?.lockoutInfo?.isLocked ? theme.colors.danger : theme.colors.success,
                        fontWeight: theme.typography.fontWeight.medium
                      }}>
                        {loginAttempts?.lockoutInfo?.isLocked ? '🔒 Bloqueada' : '✅ Ativa'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Tentativas de Login Falhadas:</span>
                      <span style={{ 
                        color: (loginAttempts?.lockoutInfo?.failedAttempts || 0) > 3 ? theme.colors.warning : theme.colors.text
                      }}>
                        {loginAttempts?.lockoutInfo?.failedAttempts || 0}
                      </span>
                    </div>
                    {loginAttempts?.lockoutInfo?.lastAttemptAt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Última Tentativa:</span>
                        <span style={{ color: theme.colors.textLight }}>
                          {new Date(loginAttempts.lockoutInfo.lastAttemptAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </InfoCard>
            </div>
          )}

          {activeTab === 'preferences' && (
            <UserPreferences
              onSave={(preferences) => {
                setMessage({ type: 'success', text: 'Preferências salvas com sucesso!' });
              }}
            />
          )}
        </TabContent>
      </PerfilContainer>
    </Layout>
  );
};

export default Perfil;