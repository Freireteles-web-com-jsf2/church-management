import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Form, FormRow, FormColumn, FormGroup } from '../../components/Form';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import userManagementService from '../../services/userManagement';
import type {
    UserWithDetails,
    CreateUserData,
    UpdateUserData,
    UserRole
} from '../../services/userManagement';

const FormContainer = styled.div`
  max-height: 70vh;
  overflow-y: auto;
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.white};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primaryLight};
  }
  
  &:disabled {
    background-color: ${theme.colors.grayLight};
    cursor: not-allowed;
  }
`;



const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.gray};
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
`;

interface UserFormProps {
    user?: UserWithDetails | null;
    onSave: () => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        password: '',
        confirmPassword: '',
        funcao: 'membro' as UserRole,
        dataNascimento: '',
        genero: '',
        estadoCivil: '',
        telefone: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        grupoId: '',
        fotoUrl: '',
        dataIngresso: '',
        batizado: false,
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Initialize form data when editing
    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.name || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                funcao: user.role || 'membro',
                dataNascimento: user.dataNascimento ? new Date(user.dataNascimento).toISOString().split('T')[0] : '',
                genero: user.genero || '',
                estadoCivil: user.estadoCivil || '',
                telefone: user.telefone || '',
                endereco: user.endereco || '',
                numero: user.numero || '',
                complemento: user.complemento || '',
                bairro: user.bairro || '',
                cidade: user.cidade || '',
                estado: user.estado || '',
                grupoId: user.grupoId || '',
                fotoUrl: user.fotoUrl || '',
                dataIngresso: user.dataIngresso ? new Date(user.dataIngresso).toISOString().split('T')[0] : '',
                batizado: user.batizado || false,
                isActive: user.isActive
            });
        } else {
            // Set default date for new users
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                dataIngresso: today
            }));
        }
    }, [user]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear validation errors when user starts typing
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    const handlePhoneChange = (value: string) => {
        // Format phone number as user types
        const formatted = userManagementService.formatPhone(value);
        handleInputChange('telefone', formatted);
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];

        // Required fields
        if (!formData.nome.trim()) errors.push('Nome é obrigatório');
        if (!formData.email.trim()) errors.push('Email é obrigatório');
        if (!user && !formData.password.trim()) errors.push('Senha é obrigatória para novos usuários');
        if (!formData.dataNascimento) errors.push('Data de nascimento é obrigatória');
        if (!formData.genero) errors.push('Gênero é obrigatório');
        if (!formData.estadoCivil) errors.push('Estado civil é obrigatório');
        if (!formData.telefone.trim()) errors.push('Telefone é obrigatório');
        if (!formData.endereco.trim()) errors.push('Endereço é obrigatório');
        if (!formData.numero.trim()) errors.push('Número é obrigatório');
        if (!formData.bairro.trim()) errors.push('Bairro é obrigatório');
        if (!formData.cidade.trim()) errors.push('Cidade é obrigatória');
        if (!formData.estado.trim()) errors.push('Estado é obrigatório');
        if (!formData.dataIngresso) errors.push('Data de ingresso é obrigatória');

        // Password confirmation for new users
        if (!user && formData.password !== formData.confirmPassword) {
            errors.push('Confirmação de senha não confere');
        }

        // Use service validation
        const serviceValidation = userManagementService.validateUserData(formData);
        if (!serviceValidation.isValid) {
            errors.push(...serviceValidation.errors);
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (user) {
                // Update existing user
                const updateData: UpdateUserData = {
                    nome: formData.nome,
                    email: formData.email,
                    funcao: formData.funcao,
                    dataNascimento: formData.dataNascimento,
                    genero: formData.genero,
                    estadoCivil: formData.estadoCivil,
                    telefone: formData.telefone,
                    endereco: formData.endereco,
                    numero: formData.numero,
                    complemento: formData.complemento || undefined,
                    bairro: formData.bairro,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    grupoId: formData.grupoId || undefined,
                    fotoUrl: formData.fotoUrl || undefined,
                    dataIngresso: formData.dataIngresso,
                    batizado: formData.batizado,
                    isActive: formData.isActive
                };

                await userManagementService.updateUser(user.id, updateData);
            } else {
                // Create new user
                const createData: CreateUserData = {
                    nome: formData.nome,
                    email: formData.email,
                    password: formData.password,
                    funcao: formData.funcao,
                    dataNascimento: formData.dataNascimento,
                    genero: formData.genero,
                    estadoCivil: formData.estadoCivil,
                    telefone: formData.telefone,
                    endereco: formData.endereco,
                    numero: formData.numero,
                    complemento: formData.complemento || undefined,
                    bairro: formData.bairro,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    grupoId: formData.grupoId || undefined,
                    fotoUrl: formData.fotoUrl || undefined,
                    dataIngresso: formData.dataIngresso,
                    batizado: formData.batizado,
                    camposPersonalizados: {}
                };

                await userManagementService.createUser(createData);
            }

            onSave();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar usuário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <Form onSubmit={handleSubmit}>
                {error && (
                    <Alert
                        variant="danger"
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                {validationErrors.length > 0 && (
                    <Alert
                        variant="danger"
                        message={`Corrija os seguintes erros: ${validationErrors.join(', ')}`}
                        onClose={() => setValidationErrors([])}
                    />
                )}

                <FormRow>
                    <FormColumn width={6}>
                        <FormGroup label="Nome" required>
                            <Input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                placeholder="Nome completo"
                            />
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={6}>
                        <FormGroup label="Função" required>
                            <Select
                                value={formData.funcao}
                                onChange={(e) => handleInputChange('funcao', e.target.value as UserRole)}
                            >
                                {userManagementService.getAllRoles().map(role => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </Select>
                        </FormGroup>
                    </FormColumn>
                </FormRow>

                <FormRow>
                    <FormColumn width={6}>
                        <FormGroup label="Email" required>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="email@exemplo.com"
                            />
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={6}>
                        <FormGroup label="Telefone" required>
                            <Input
                                type="tel"
                                value={formData.telefone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="(11) 99999-9999"
                            />
                        </FormGroup>
                    </FormColumn>
                </FormRow>

                {!user && (
                    <FormRow>
                        <FormColumn width={6}>
                            <FormGroup label="Senha" required>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </FormGroup>
                        </FormColumn>
                        <FormColumn width={6}>
                            <FormGroup label="Confirmar Senha" required>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    placeholder="Confirme a senha"
                                />
                            </FormGroup>
                        </FormColumn>
                    </FormRow>
                )}

                <FormRow>
                    <FormColumn width={4}>
                        <FormGroup label="Data de Nascimento" required>
                            <Input
                                type="date"
                                value={formData.dataNascimento}
                                onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                            />
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={4}>
                        <FormGroup label="Gênero" required>
                            <Select
                                value={formData.genero}
                                onChange={(e) => handleInputChange('genero', e.target.value)}
                            >
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </Select>
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={4}>
                        <FormGroup label="Estado Civil" required>
                            <Select
                                value={formData.estadoCivil}
                                onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
                            >
                                <option value="">Selecione</option>
                                <option value="Solteiro(a)">Solteiro(a)</option>
                                <option value="Casado(a)">Casado(a)</option>
                                <option value="Divorciado(a)">Divorciado(a)</option>
                                <option value="Viúvo(a)">Viúvo(a)</option>
                            </Select>
                        </FormGroup>
                    </FormColumn>
                </FormRow>

                <FormRow>
                    <FormColumn width={6}>
                        <FormGroup label="Endereço" required>
                            <Input
                                type="text"
                                value={formData.endereco}
                                onChange={(e) => handleInputChange('endereco', e.target.value)}
                                placeholder="Rua, Avenida, etc."
                            />
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={6}>
                        <FormGroup label="Número" required>
                            <Input
                                type="text"
                                value={formData.numero}
                                onChange={(e) => handleInputChange('numero', e.target.value)}
                                placeholder="123"
                            />
                        </FormGroup>
                    </FormColumn>
                </FormRow>

                <FormRow>
                    <FormColumn width={4}>
                        <FormGroup label="Complemento">
                            <Input
                                type="text"
                                value={formData.complemento}
                                onChange={(e) => handleInputChange('complemento', e.target.value)}
                                placeholder="Apto, Casa, etc."
                            />
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={4}>
                        <FormGroup label="Bairro" required>
                            <Input
                                type="text"
                                value={formData.bairro}
                                onChange={(e) => handleInputChange('bairro', e.target.value)}
                                placeholder="Nome do bairro"
                            />
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={4}>
                        <FormGroup label="Cidade" required>
                            <Input
                                type="text"
                                value={formData.cidade}
                                onChange={(e) => handleInputChange('cidade', e.target.value)}
                                placeholder="Nome da cidade"
                            />
                        </FormGroup>
                    </FormColumn>
                </FormRow>

                <FormRow>
                    <FormColumn width={4}>
                        <FormGroup label="Estado" required>
                            <Select
                                value={formData.estado}
                                onChange={(e) => handleInputChange('estado', e.target.value)}
                            >
                                <option value="">Selecione</option>
                                <option value="AC">Acre</option>
                                <option value="AL">Alagoas</option>
                                <option value="AP">Amapá</option>
                                <option value="AM">Amazonas</option>
                                <option value="BA">Bahia</option>
                                <option value="CE">Ceará</option>
                                <option value="DF">Distrito Federal</option>
                                <option value="ES">Espírito Santo</option>
                                <option value="GO">Goiás</option>
                                <option value="MA">Maranhão</option>
                                <option value="MT">Mato Grosso</option>
                                <option value="MS">Mato Grosso do Sul</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="PA">Pará</option>
                                <option value="PB">Paraíba</option>
                                <option value="PR">Paraná</option>
                                <option value="PE">Pernambuco</option>
                                <option value="PI">Piauí</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="RN">Rio Grande do Norte</option>
                                <option value="RS">Rio Grande do Sul</option>
                                <option value="RO">Rondônia</option>
                                <option value="RR">Roraima</option>
                                <option value="SC">Santa Catarina</option>
                                <option value="SP">São Paulo</option>
                                <option value="SE">Sergipe</option>
                                <option value="TO">Tocantins</option>
                            </Select>
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={4}>
                        <FormGroup label="Data de Ingresso" required>
                            <Input
                                type="date"
                                value={formData.dataIngresso}
                                onChange={(e) => handleInputChange('dataIngresso', e.target.value)}
                            />
                        </FormGroup>
                    </FormColumn>
                    <FormColumn width={4}>
                        <FormGroup label="Foto (URL)">
                            <Input
                                type="url"
                                value={formData.fotoUrl}
                                onChange={(e) => handleInputChange('fotoUrl', e.target.value)}
                                placeholder="https://exemplo.com/foto.jpg"
                            />
                        </FormGroup>
                    </FormColumn>
                </FormRow>

                <FormRow>
                    <FormColumn width={6}>
                        <CheckboxGroup>
                            <CheckboxLabel>
                                <input
                                    type="checkbox"
                                    checked={formData.batizado}
                                    onChange={(e) => handleInputChange('batizado', e.target.checked)}
                                />
                                Batizado
                            </CheckboxLabel>
                        </CheckboxGroup>
                    </FormColumn>
                    {user && (
                        <FormColumn width={6}>
                            <CheckboxGroup>
                                <CheckboxLabel>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                    />
                                    Usuário Ativo
                                </CheckboxLabel>
                            </CheckboxGroup>
                        </FormColumn>
                    )}
                </FormRow>

                <ButtonGroup>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
                    </Button>
                </ButtonGroup>
            </Form>
        </FormContainer>
    );
};

export default UserForm;