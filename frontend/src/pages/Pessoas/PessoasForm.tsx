import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button, Card, CardBody, Input, Form, FormRow, FormColumn, FormGroup, Alert } from '../../components';

const PessoasFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const PessoasFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const PhotoUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const PhotoPreview = styled.div<{ hasImage: boolean }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: ${({ hasImage }) => hasImage ? 'transparent' : theme.colors.gray};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid ${theme.colors.gray};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PhotoUploadButton = styled.label`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  
  &:hover {
    background-color: ${theme.colors.primaryDark};
  }
  
  input {
    display: none;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  user-select: none;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

interface PessoaFormData {
  nome: string;
  dataNascimento: string;
  genero: string;
  estadoCivil: string;
  email: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  funcao: string;
  grupo: string;
  dataIngresso: string;
  foto: string | null;
  batizado: boolean;
  status: string;
}

const initialFormData: PessoaFormData = {
  nome: '',
  dataNascimento: '',
  genero: '',
  estadoCivil: '',
  email: '',
  telefone: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  funcao: '',
  grupo: '',
  dataIngresso: '',
  foto: null,
  batizado: false,
  status: 'ativo'
};

const PessoasForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PessoaFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      // Simulação de carregamento de dados
      setTimeout(() => {
        // Dados de exemplo para edição
        setFormData({
          nome: 'João Silva',
          dataNascimento: '1985-05-15',
          genero: 'masculino',
          estadoCivil: 'casado',
          email: 'joao.silva@exemplo.com',
          telefone: '(11) 98765-4321',
          endereco: 'Rua das Flores',
          numero: '123',
          complemento: 'Apto 45',
          bairro: 'Jardim Primavera',
          cidade: 'São Paulo',
          estado: 'SP',
          funcao: 'Pastor',
          grupo: 'Louvor',
          dataIngresso: '2018-03-10',
          foto: null,
          batizado: true,
          status: 'ativo'
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          foto: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Simulação de envio de dados
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(isEditing
        ? 'Pessoa atualizada com sucesso!'
        : 'Pessoa cadastrada com sucesso!'
      );

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/pessoas');
      }, 2000);
    } catch (err) {
      setError((err as Error).message || 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <PessoasFormContainer>
        <PessoasFormHeader>
          <h1>{isEditing ? 'Editar Pessoa' : 'Nova Pessoa'}</h1>
          <Button variant="outline" onClick={() => navigate('/pessoas')}>
            Voltar
          </Button>
        </PessoasFormHeader>

        {error && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <Alert
              variant="danger"
              message={error}
              dismissible
              onClose={() => setError(null)}
            />
          </div>
        )}

        {success && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <Alert
              variant="success"
              message={success}
              dismissible
              onClose={() => setSuccess(null)}
            />
          </div>
        )}

        <Card>
          <CardBody>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormColumn width={3}>
                  <PhotoUploadContainer>
                    <PhotoPreview hasImage={!!photoPreview}>
                      {photoPreview ? (
                        <img src={photoPreview} alt="Foto de perfil" />
                      ) : (
                        <span>👤</span>
                      )}
                    </PhotoPreview>
                    <PhotoUploadButton>
                      {photoPreview ? 'Alterar foto' : 'Adicionar foto'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </PhotoUploadButton>
                  </PhotoUploadContainer>
                </FormColumn>

                <FormColumn width={6}>
                  <FormRow>
                    <FormColumn width={12}>
                      <FormGroup>
                        <Input
                          label="Nome completo"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          placeholder="Nome completo"
                          required
                          fullWidth
                        />
                      </FormGroup>
                    </FormColumn>
                  </FormRow>

                  <FormRow>
                    <FormColumn width={4}>
                      <FormGroup>
                        <Input
                          label="Data de nascimento"
                          type="date"
                          name="dataNascimento"
                          value={formData.dataNascimento}
                          onChange={handleChange}
                          required
                          fullWidth
                        />
                      </FormGroup>
                    </FormColumn>

                    <FormColumn width={4}>
                      <FormGroup>
                        <label htmlFor="genero">Gênero</label>
                        <select
                          id="genero"
                          name="genero"
                          value={formData.genero}
                          onChange={handleChange}
                          required
                          style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            border: `1px solid ${theme.colors.gray}`,
                            borderRadius: theme.borderRadius.sm
                          }}
                        >
                          <option value="">Selecione</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                        </select>
                      </FormGroup>
                    </FormColumn>

                    <FormColumn width={4}>
                      <FormGroup>
                        <label htmlFor="estadoCivil">Estado civil</label>
                        <select
                          id="estadoCivil"
                          name="estadoCivil"
                          value={formData.estadoCivil}
                          onChange={handleChange}
                          required
                          style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            border: `1px solid ${theme.colors.gray}`,
                            borderRadius: theme.borderRadius.sm
                          }}
                        >
                          <option value="">Selecione</option>
                          <option value="solteiro">Solteiro(a)</option>
                          <option value="casado">Casado(a)</option>
                          <option value="divorciado">Divorciado(a)</option>
                          <option value="viuvo">Viúvo(a)</option>
                        </select>
                      </FormGroup>
                    </FormColumn>
                  </FormRow>
                </FormColumn>
              </FormRow>

              <FormRow>
                <FormColumn width={6}>
                  <FormGroup>
                    <Input
                      label="E-mail"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>

                <FormColumn width={6}>
                  <FormGroup>
                    <Input
                      label="Telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>
              </FormRow>

              <FormRow>
                <FormColumn width={6}>
                  <FormGroup>
                    <Input
                      label="Endereço"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      placeholder="Rua, Avenida, etc."
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>

                <FormColumn width={2}>
                  <FormGroup>
                    <Input
                      label="Número"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      placeholder="Nº"
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>

                <FormColumn width={4}>
                  <FormGroup>
                    <Input
                      label="Complemento"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      placeholder="Apto, Bloco, etc."
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>
              </FormRow>

              <FormRow>
                <FormColumn width={4}>
                  <FormGroup>
                    <Input
                      label="Bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      placeholder="Bairro"
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>

                <FormColumn width={4}>
                  <FormGroup>
                    <Input
                      label="Cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="Cidade"
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>

                <FormColumn width={4}>
                  <FormGroup>
                    <label htmlFor="estado">Estado</label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        border: `1px solid ${theme.colors.gray}`,
                        borderRadius: theme.borderRadius.sm
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </FormGroup>
                </FormColumn>
              </FormRow>

              <FormRow>
                <FormColumn width={4}>
                  <FormGroup>
                    <label htmlFor="funcao">Função/cargo</label>
                    <select
                      id="funcao"
                      name="funcao"
                      value={formData.funcao}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        border: `1px solid ${theme.colors.gray}`,
                        borderRadius: theme.borderRadius.sm
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="Pastor">Pastor</option>
                      <option value="Líder">Líder</option>
                      <option value="Membro">Membro</option>
                      <option value="Voluntário">Voluntário</option>
                      <option value="Tesoureiro">Tesoureiro</option>
                    </select>
                  </FormGroup>
                </FormColumn>

                <FormColumn width={4}>
                  <FormGroup>
                    <label htmlFor="grupo">Grupo vinculado</label>
                    <select
                      id="grupo"
                      name="grupo"
                      value={formData.grupo}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        border: `1px solid ${theme.colors.gray}`,
                        borderRadius: theme.borderRadius.sm
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="Jovens">Jovens</option>
                      <option value="Adultos">Adultos</option>
                      <option value="Louvor">Louvor</option>
                      <option value="Infantil">Infantil</option>
                      <option value="Adolescentes">Adolescentes</option>
                    </select>
                  </FormGroup>
                </FormColumn>

                <FormColumn width={4}>
                  <FormGroup>
                    <Input
                      label="Data de ingresso"
                      type="date"
                      name="dataIngresso"
                      value={formData.dataIngresso}
                      onChange={handleChange}
                      fullWidth
                    />
                  </FormGroup>
                </FormColumn>
              </FormRow>

              <FormRow>
                <FormColumn width={6}>
                  <FormGroup>
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        border: `1px solid ${theme.colors.gray}`,
                        borderRadius: theme.borderRadius.sm
                      }}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </FormGroup>
                </FormColumn>

                <FormColumn width={6}>
                  <CheckboxContainer>
                    <CheckboxLabel>
                      <Checkbox
                        type="checkbox"
                        name="batizado"
                        checked={formData.batizado}
                        onChange={handleChange}
                      />
                      Batizado
                    </CheckboxLabel>
                  </CheckboxContainer>
                </FormColumn>
              </FormRow>

              <FormActions>
                <Button
                  variant="outline"
                  onClick={() => navigate('/pessoas')}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </Button>
              </FormActions>
            </Form>
          </CardBody>
        </Card>
      </PessoasFormContainer>
    </Layout>
  );
};

export default PessoasForm;