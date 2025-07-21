import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { supabase } from '../services/supabase';

const Bg = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(120deg, #2d3e50 0%, #3bb54a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px #0002;
  padding: 2.5rem 2rem 2rem 2rem;
  width: 100%;
  max-width: 370px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Title = styled.h2`
  color: #2d3e50;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  margin-bottom: 1.1rem;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  font-size: 1.08rem;
  background: #f7f8fa;
  color: #222;
  font-weight: 500;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #3bb54a;
    outline: none;
    background: #fff;
  }
  &::placeholder {
    color: #aaa;
    opacity: 1;
  }
`;

const Button = styled.button`
  width: 100%;
  background: #3bb54a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 1rem 0;
  font-size: 1.15rem;
  font-weight: bold;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px #3bb54a22;
  &:hover {
    background: #2d8c3c;
  }
`;

const ErrorMsg = styled.p`
  color: #c00;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const Footer = styled.div`
  margin-top: 1.2rem;
  font-size: 0.98rem;
  color: #666;
  text-align: center;
  width: 100%;
`;

const Link = styled.a`
  color: #3bb54a;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.2rem;
  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = React.useState('');

  const onSubmit = async (data: any) => {
    setError('');
    const { error, data: session } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    });
    if (error) {
      setError('E-mail ou senha inválidos!');
    } else {
      localStorage.setItem('token', session.session?.access_token || '');
      window.location.href = '/';
    }
  };

  return (
    <Bg>
      <Card>
        <Title>Entrar</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register('email', { required: true })}
            type="email"
            placeholder="E-mail"
            autoComplete="username"
            style={errors.email ? { borderColor: '#c00' } : {}}
          />
          <Input
            {...register('senha', { required: true })}
            type="password"
            placeholder="Senha"
            autoComplete="current-password"
            style={errors.senha ? { borderColor: '#c00' } : {}}
          />
          <Button type="submit">Entrar</Button>
        </form>
        <Footer>
          <span>Esqueceu a senha?</span>
          <Link href="/forgot-password">Recuperar</Link>
          <br />
          <span>Não tem conta?</span>
          <Link href="/register">Cadastre-se</Link>
        </Footer>
      </Card>
    </Bg>
  );
};

export default Login; 