/**
 * Serviço de email para envio de notificações
 * 
 * Nota: Este é um serviço simulado para desenvolvimento.
 * Em produção, você usaria um serviço real como SendGrid, Mailgun, etc.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private static readonly DEFAULT_FROM = 'noreply@igreja.com';
  private static readonly DEFAULT_REPLY_TO = 'suporte@igreja.com';

  /**
   * Envia um email
   * 
   * Nota: Esta é uma implementação simulada que apenas registra o email no console.
   * Em produção, você integraria com um serviço de email real.
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, text, html, from = this.DEFAULT_FROM, replyTo = this.DEFAULT_REPLY_TO } = options;

      // Validar campos obrigatórios
      if (!to || !subject || (!text && !html)) {
        throw new Error('Missing required email fields');
      }

      // Em produção, aqui você chamaria a API do seu serviço de email
      console.log('\n========== EMAIL ENVIADO ==========');
      console.log(`De: ${from}`);
      console.log(`Responder para: ${replyTo}`);
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${subject}`);
      
      if (text) {
        console.log('\n--- CONTEÚDO (TEXTO) ---');
        console.log(text);
      }
      
      if (html) {
        console.log('\n--- CONTEÚDO (HTML) ---');
        console.log(html);
      }
      
      console.log('===================================\n');

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Envia um email de recuperação de senha
   */
  static async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<boolean> {
    // URL base do frontend (em produção, isso viria de uma variável de ambiente)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const subject = 'Recuperação de Senha - Sistema de Gestão da Igreja';
    
    const text = `
Olá ${userName},

Recebemos uma solicitação para redefinir sua senha no Sistema de Gestão da Igreja.

Para redefinir sua senha, clique no link abaixo ou cole-o em seu navegador:
${resetUrl}

Este link é válido por 24 horas.

Se você não solicitou a redefinição de senha, ignore este email e sua senha permanecerá a mesma.

Atenciosamente,
Equipe de Suporte
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a69bd; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4a69bd; color: white; 
              text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Recuperação de Senha</h2>
    </div>
    <div class="content">
      <p>Olá ${userName},</p>
      <p>Recebemos uma solicitação para redefinir sua senha no Sistema de Gestão da Igreja.</p>
      <p>Para redefinir sua senha, clique no botão abaixo:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Redefinir Senha</a>
      </p>
      <p>Ou copie e cole o seguinte link em seu navegador:</p>
      <p>${resetUrl}</p>
      <p>Este link é válido por 24 horas.</p>
      <p>Se você não solicitou a redefinição de senha, ignore este email e sua senha permanecerá a mesma.</p>
    </div>
    <div class="footer">
      <p>Atenciosamente,<br>Equipe de Suporte</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject,
      text,
      html
    });
  }

  /**
   * Envia uma confirmação de alteração de senha
   */
  static async sendPasswordChangedEmail(to: string, userName: string): Promise<boolean> {
    const subject = 'Confirmação de Alteração de Senha - Sistema de Gestão da Igreja';
    
    const text = `
Olá ${userName},

Sua senha foi alterada com sucesso no Sistema de Gestão da Igreja.

Se você não realizou esta alteração, entre em contato com o suporte imediatamente.

Atenciosamente,
Equipe de Suporte
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a69bd; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .alert { color: #721c24; background-color: #f8d7da; padding: 10px; border-radius: 4px; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Confirmação de Alteração de Senha</h2>
    </div>
    <div class="content">
      <p>Olá ${userName},</p>
      <p>Sua senha foi alterada com sucesso no Sistema de Gestão da Igreja.</p>
      <p class="alert">Se você não realizou esta alteração, entre em contato com o suporte imediatamente.</p>
    </div>
    <div class="footer">
      <p>Atenciosamente,<br>Equipe de Suporte</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to,
      subject,
      text,
      html
    });
  }
}

export default EmailService;