const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://pskaimoanrxcsjeaalrz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza2FpbW9hbnJ4Y3NqZWFhbHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjYxMjAyOCwiZXhwIjoyMDY4MTg4MDI4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Você precisa da service key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário administrador...');
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@igreja.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Administrador',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário no auth:', authError);
      return;
    }

    console.log('✅ Usuário criado no auth:', authData.user.id);

    // Criar registro na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: 'admin@igreja.com',
          name: 'Administrador',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ]);

    if (userError) {
      console.error('❌ Erro ao criar registro na tabela users:', userError);
      return;
    }

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email: admin@igreja.com');
    console.log('🔑 Senha: admin123');
    console.log('👤 Perfil: Administrador');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createAdminUser();