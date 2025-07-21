import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '../../components';

const LandingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: ${theme.colors.white};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md} 0;
  position: fixed;
  width: 100%;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  
  img {
    height: 40px;
    width: auto;
  }
  
  span {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.primaryDark};
    margin-left: ${theme.spacing.sm};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: ${theme.colors.text};
  text-decoration: none;
  font-weight: ${theme.typography.fontWeight.medium};
  transition: ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.white} 100%);
  padding: 160px 0 80px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const HeroButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
  }
`;

const FeaturesSection = styled.section`
  padding: ${theme.spacing.xxl} 0;
  background-color: ${theme.colors.white};
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: ${theme.typography.fontSize['3xl']};
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.xl};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  transition: ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.md};
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.primary};
`;

const FeatureTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const FeatureDescription = styled.p`
  color: ${theme.colors.textLight};
`;

const AboutSection = styled.section`
  padding: ${theme.spacing.xxl} 0;
  background-color: ${theme.colors.grayLight};
`;

const AboutContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

const AboutList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: ${theme.spacing.lg} 0;
  
  li {
    margin-bottom: ${theme.spacing.md};
    display: flex;
    align-items: flex-start;
    
    &:before {
      content: "•";
      color: ${theme.colors.primary};
      font-weight: bold;
      font-size: 1.5rem;
      margin-right: ${theme.spacing.sm};
    }
  }
`;

const HighlightText = styled.span`
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const CTASection = styled.section`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: ${theme.spacing.xxl} 0;
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

const CTATitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  margin-bottom: ${theme.spacing.lg};
`;

const CTAText = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  margin-bottom: ${theme.spacing.xl};
  opacity: 0.9;
`;

const Footer = styled.footer`
  background-color: ${theme.colors.grayLight};
  padding: ${theme.spacing.xl} 0;
  text-align: center;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

const FooterText = styled.p`
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.md};
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const FooterLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DemoCredentials = styled.div`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  display: inline-block;
  text-align: left;
`;

const CredentialTitle = styled.h4`
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.primaryDark};
`;

const CredentialItem = styled.div`
  margin-bottom: ${theme.spacing.xs};
  
  strong {
    color: ${theme.colors.primary};
  }
`;

const LandingPage: React.FC = () => {
  return (
    <LandingContainer>
      <Header>
        <HeaderContent>
          <Logo>
            <img src="/logo-igreja.svg" alt="Logo" />
            <span>Siltec Manager</span>
          </Logo>

          <Nav>
            <NavLink href="#features">Funcionalidades</NavLink>
            <NavLink href="#about">Sobre</NavLink>
            <NavLink href="#contact">Contato</NavLink>
            <Link to="/login">
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
          </Nav>
        </HeaderContent>
      </Header>

      <HeroSection>
        <HeroContent>
          <HeroTitle>Siltec Manager de Gestão de Igrejas</HeroTitle>
          <HeroSubtitle>
            Organize sua igreja de forma simples, moderna e eficiente.
            Controle de membros, grupos, finanças, agenda, patrimônio e muito mais!
          </HeroSubtitle>
          <HeroButtons>
            <Button
              size="lg"
              onClick={() => window.location.href = '/cadastro'}
            >
              COMECE AGORA
            </Button>
            <a href="/features">
              <Button variant="outline" size="lg">Saiba Mais</Button>
            </a>
          </HeroButtons>

          <DemoCredentials>
            <CredentialTitle>Acesso de demonstração:</CredentialTitle>
            <CredentialItem><strong>E-mail:</strong> pastor@exemplo.com</CredentialItem>
            <CredentialItem><strong>Senha:</strong> senha123</CredentialItem>
            <CredentialItem><strong>Perfil:</strong> Administrador</CredentialItem>
          </DemoCredentials>
        </HeroContent>
      </HeroSection>

      <FeaturesSection id="features">
        <SectionTitle>Funcionalidades</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>👥</FeatureIcon>
            <FeatureTitle>Gestão de Membros</FeatureTitle>
            <FeatureDescription>
              Cadastre e gerencie todos os membros da igreja com informações detalhadas,
              histórico e acompanhamento.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureTitle>Controle Financeiro</FeatureTitle>
            <FeatureDescription>
              Gerencie receitas, despesas, dízimos e ofertas com relatórios
              detalhados e transparentes.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>👨‍👩‍👧‍👦</FeatureIcon>
            <FeatureTitle>Grupos e Células</FeatureTitle>
            <FeatureDescription>
              Organize e acompanhe grupos, células e ministérios com
              ferramentas específicas para cada necessidade.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📅</FeatureIcon>
            <FeatureTitle>Agenda e Eventos</FeatureTitle>
            <FeatureDescription>
              Planeje e divulgue eventos, cultos e reuniões com um
              calendário completo e sistema de notificações.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Relatórios e Estatísticas</FeatureTitle>
            <FeatureDescription>
              Visualize dados importantes sobre crescimento, frequência
              e finanças com gráficos e relatórios personalizados.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>Acesso em Qualquer Dispositivo</FeatureTitle>
            <FeatureDescription>
              Acesse o sistema de qualquer lugar, em computadores,
              tablets ou smartphones com interface responsiva.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <AboutSection id="about">
        <AboutContent>
          <SectionTitle>Sobre o Projeto</SectionTitle>
          <p>
            Este sistema foi desenvolvido para facilitar a gestão de igrejas de qualquer porte,
            trazendo tecnologia, organização e praticidade para o dia a dia da administração e dos membros.
          </p>

          <AboutList>
            <li><HighlightText>Gestão completa</HighlightText> de pessoas, grupos, finanças, patrimônio, agenda e mural.</li>
            <li><HighlightText>Permissões personalizáveis</HighlightText> para cada perfil: Administrador, Pastor, Líder, Tesoureiro, Voluntário e Membro.</li>
            <li><HighlightText>Notificações</HighlightText> por e-mail e push para manter todos informados.</li>
            <li><HighlightText>Exportação de dados</HighlightText> para Excel/CSV e relatórios detalhados.</li>
            <li><HighlightText>Campos personalizados</HighlightText> para adaptar o sistema à realidade da sua igreja.</li>
            <li><HighlightText>Segurança</HighlightText> com autenticação JWT e controle de acesso por perfil.</li>
          </AboutList>
        </AboutContent>
      </AboutSection>

      <CTASection id="contact">
        <CTAContent>
          <CTATitle>Pronto para transformar a gestão da sua igreja?</CTATitle>
          <CTAText>
            Comece agora mesmo a utilizar nosso sistema e veja como a tecnologia
            pode ajudar no crescimento e organização da sua comunidade.
          </CTAText>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/cadastro'}
          >
            Começar Agora
          </Button>
        </CTAContent>
      </CTASection>

      <Footer>
        <FooterContent>
          <FooterText>
            © {new Date().getFullYear()} Siltec Manager de Gestão de Igrejas. Todos os direitos reservados.
          </FooterText>
          <FooterLinks>
            <FooterLink href="#terms">Termos de Uso</FooterLink>
            <FooterLink href="#privacy">Política de Privacidade</FooterLink>
            <FooterLink href="#contact">Contato</FooterLink>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </LandingContainer>
  );
};

export default LandingPage;