import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  /* Reset CSS */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* HTML e Body */
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.normal};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Tipografia */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.typography.fontFamily.secondary};
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    color: ${theme.colors.primaryDark};
    margin-bottom: ${theme.spacing.md};
  }

  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
  }

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
  }

  p {
    margin-bottom: ${theme.spacing.md};
    line-height: ${theme.typography.lineHeight.relaxed};
  }

  /* Links */
  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primaryDark};
    }

    &:focus {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
  }

  /* Botões */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all ${theme.transitions.normal};

    &:focus {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  /* Formulários */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    outline: none;
    border: 1px solid ${theme.colors.gray};
    border-radius: ${theme.borderRadius.sm};
    transition: border-color ${theme.transitions.fast}, box-shadow ${theme.transitions.fast};

    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    &:disabled {
      background-color: ${theme.colors.grayLight};
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  /* Listas */
  ul, ol {
    padding-left: ${theme.spacing.lg};
  }

  li {
    margin-bottom: ${theme.spacing.xs};
  }

  /* Imagens */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Tabelas */
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    text-align: left;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-bottom: 1px solid ${theme.colors.gray};
  }

  th {
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.textLight};
    background-color: ${theme.colors.grayLight};
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.grayLight};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray};
    border-radius: ${theme.borderRadius.sm};

    &:hover {
      background: ${theme.colors.grayDark};
    }
  }

  /* Animações */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Classes utilitárias */
  .fade-in {
    animation: fadeIn 0.3s ease;
  }

  .slide-in {
    animation: slideIn 0.3s ease;
  }

  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }

  .d-flex { display: flex; }
  .d-block { display: block; }
  .d-none { display: none; }

  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }

  .align-center { align-items: center; }
  .align-start { align-items: flex-start; }
  .align-end { align-items: flex-end; }

  .flex-column { flex-direction: column; }
  .flex-wrap { flex-wrap: wrap; }

  .font-bold {
    font-weight: ${theme.typography.fontWeight.bold};
  }

  .font-semibold {
    font-weight: ${theme.typography.fontWeight.semibold};
  }

  .font-medium {
    font-weight: ${theme.typography.fontWeight.medium};
  }

  /* Responsividade */
  @media (max-width: ${theme.breakpoints.md}) {
    html {
      font-size: 14px;
    }

    h1 {
      font-size: ${theme.typography.fontSize['3xl']};
    }

    h2 {
      font-size: ${theme.typography.fontSize['2xl']};
    }

    h3 {
      font-size: ${theme.typography.fontSize.xl};
    }
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    html {
      font-size: 13px;
    }
  }

  /* Utilitários */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;