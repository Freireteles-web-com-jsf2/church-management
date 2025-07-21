import styled from 'styled-components';

const Container = styled.div`
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f7f8fa;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
`;

const Header = styled.header`
  background: #2d3e50;
  color: #fff;
  padding: 2rem 0 1rem 0;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`;

const Button = styled.a`
  background: #3bb54a;
  color: #fff;
  padding: 0.8rem 2rem;
  border-radius: 30px;
  font-weight: bold;
  text-decoration: none;
  font-size: 1.1rem;
  transition: background 0.2s;
  &:hover {
    background: #2d8c3c;
  }
`;

const Section = styled.section`
  width: 100vw;
  margin: 2rem 0;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 2px 16px #0001;
  padding: 2rem 0;
`;

const SectionContent = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #2d3e50;
  margin-bottom: 1rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const FeatureCard = styled.div`
  background: #f7f8fa;
  border-radius: 12px;
  padding: 1.2rem;
  text-align: center;
  box-shadow: 0 1px 6px #0001;
  color: #223;
  font-weight: 500;
  h3 {
    color: #2d3e50;
    font-size: 1.18rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  p {
    color: #2d3e50;
    font-size: 1.05rem;
    font-weight: 500;
    margin: 0;
  }
`;

const Footer = styled.footer`
  text-align: center;
  color: #888;
  padding: 2rem 0 1rem 0;
  font-size: 0.95rem;
`;

export default function LandingPage() {
  return (
    <Container>
      <Header>
        <Title>Siltec Manager de Gestão de Igrejas</Title>
        <Subtitle>
          Organize sua igreja de forma simples, moderna e eficiente.<br />
          Controle de membros, grupos, finanças, agenda, patrimônio e muito mais!
        </Subtitle>
        <Button href="/cadastro">COMECE AGORA</Button>
      </Header>

      {/* Bloco de informações principais do projeto */}
      <Section style={{marginTop: 0, marginBottom: '1.5rem', background: '#f4fbf7', color: '#223', boxShadow: '0 1px 8px #0001'}}>
        <SectionContent>
          <SectionTitle style={{color: '#2d3e50'}}>Sobre o Projeto</SectionTitle>
          <p style={{fontSize: '1.15rem', marginBottom: '1.2rem', color: '#2d3e50', fontWeight: 500, textShadow: '0 1px 0 #fff'}}>Este sistema foi desenvolvido para facilitar a gestão de igrejas de qualquer porte, trazendo tecnologia, organização e praticidade para o dia a dia da administração e dos membros.</p>
          <ul style={{fontSize: '1.08rem', marginBottom: '1.2rem', lineHeight: 1.8, color: '#2d3e50', fontWeight: 400, textShadow: '0 1px 0 #fff'}}>
            <li><b style={{color: '#3bb54a'}}>Gestão completa</b> de pessoas, grupos, finanças, patrimônio, agenda e mural.</li>
            <li><b style={{color: '#3bb54a'}}>Permissões personalizáveis</b> para cada perfil: Administrador, Pastor, Líder, Tesoureiro, Voluntário e Membro.</li>
            <li><b style={{color: '#3bb54a'}}>Notificações</b> por e-mail e push para manter todos informados.</li>
            <li><b style={{color: '#3bb54a'}}>Exportação de dados</b> para Excel/CSV e relatórios detalhados.</li>
            <li><b style={{color: '#3bb54a'}}>Campos personalizados</b> para adaptar o sistema à realidade da sua igreja.</li>
            <li><b style={{color: '#3bb54a'}}>Segurança</b> com autenticação JWT e controle de acesso por perfil.</li>
            <li><b style={{color: '#3bb54a'}}>Interface moderna</b> e responsiva, acessível de qualquer dispositivo.</li>
          </ul>
          <p style={{fontSize: '1.08rem', color: '#1a2a3a', fontWeight: 500}}>
            <b>Tecnologias utilizadas:</b> React, TypeScript, Styled Components, Node.js, Express, Prisma, PostgreSQL, JWT, entre outras.
          </p>
          <p style={{fontSize: '1.08rem', color: '#1a2a3a', fontWeight: 500}}>
            <b>Contato:</b> lucianofreireteles@gmail.com &nbsp;|&nbsp; WhatsApp: (11) 91820-9519 | <b>Analista Desenvolvedor:</b> Luciano Teles Freire
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <SectionTitle>Módulos Principais</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <h3>Pessoas</h3>
              <p>Cadastro de membros, cargos, aniversariantes, permissões e campos personalizados.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Grupos & Células</h3>
              <p>Gestão de grupos, líderes, frequência, categorias e relatórios detalhados.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Financeiro</h3>
              <p>Controle de receitas, despesas, categorias, relatórios e exportação de dados.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Patrimônio</h3>
              <p>Cadastro de bens, categorias, localização, histórico e anexos.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Agenda & Mural</h3>
              <p>Eventos, notificações, mural de avisos e programação recorrente.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Permissões</h3>
              <p>Perfis personalizáveis para cada tipo de usuário: pastor, líder, tesoureiro, voluntário, membro.</p>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <SectionTitle>Diferenciais</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <h3>Fácil de Usar</h3>
              <p>Interface intuitiva, acessível pelo computador e celular.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Notificações</h3>
              <p>Envio de avisos e lembretes por e-mail ou push.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Exportação</h3>
              <p>Exporte dados para Excel/CSV com apenas um clique.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Segurança</h3>
              <p>Controle de acesso por perfil e logs de ações.</p>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContent>
      </Section>

      <Footer>
        &copy; {new Date().getFullYear()} Sistema de Gestão de Igrejas. Todos os direitos reservados.
      </Footer>
    </Container>
  );
} 