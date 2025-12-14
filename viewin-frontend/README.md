# 🎨 ViewIn Frontend

Frontend da aplicação **ViewIn** - Sistema de Entrevistas com IA. Interface moderna e responsiva construída com React, TypeScript e Vite.

---

## 📋 Sobre o Projeto

O frontend do **ViewIn** é uma aplicação web moderna que permite aos usuários:

- 🎯 Simular entrevistas de emprego com IA
- 🎤 Interagir com assistente de voz em tempo real
- 📝 Preencher descrições de vagas para personalizar entrevistas
- 📊 Visualizar relatórios detalhados de desempenho
- 📈 Acompanhar histórico e analytics de entrevistas
- 🔐 Sistema completo de autenticação e gerenciamento de usuários

---

## 🛠️ Tecnologias Utilizadas

### Core
- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite 7** - Build tool e dev server ultra-rápido

### Roteamento
- **React Router DOM 7** - Roteamento client-side

### Estilização
- **Tailwind CSS 4** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e customizáveis
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-label`
  - `@radix-ui/react-separator`
  - `@radix-ui/react-slot`
- **Lucide React** - Ícones modernos
- **Motion** - Animações fluidas

### Gráficos e Visualizações
- **Three.js** - Renderização 3D
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Helpers úteis para React Three Fiber
- **Cobe** - Globo 3D interativo
- **svg-dotted-map** - Mapas pontilhados

### Utilitários
- **date-fns** - Manipulação de datas
- **react-day-picker** - Seletor de datas
- **class-variance-authority** - Gerenciamento de variantes de classes
- **clsx** - Utilitário para construção de classes CSS
- **tailwind-merge** - Merge inteligente de classes Tailwind

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (vem com Node.js) ou **yarn**
- **Git** ([Download](https://git-scm.com/downloads))

---

## 🚀 Instalação

### 1️⃣ Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd viewin/viewin-frontend
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

### 3️⃣ Configurar Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto `viewin-frontend`:

```env
VITE_API_URL=http://localhost:8080
```

> **Nota:** Se não criar o arquivo `.env`, o frontend tentará se conectar ao backend em `http://localhost:8080` por padrão.

### 4️⃣ Executar o Projeto

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

---

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor de desenvolvimento com Hot Module Replacement (HMR). O projeto será recarregado automaticamente quando você fizer alterações.

### Build para Produção

```bash
npm run build
```

Compila o projeto para produção. Os arquivos otimizados serão gerados na pasta `dist/`.

### Preview do Build

```bash
npm run preview
```

Visualiza o build de produção localmente antes de fazer deploy.

### Linting

```bash
npm run lint
```

Executa o ESLint para verificar problemas no código.

---

## 📁 Estrutura do Projeto

```
viewin-frontend/
├── public/                 # Arquivos estáticos
│   ├── favicon.svg
│   └── vite.svg
│
├── src/
│   ├── assets/            # Imagens, fontes, etc.
│   │   └── react.svg
│   │
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes de UI reutilizáveis
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── ...
│   │   ├── kokonutui/    # Componentes customizados
│   │   │   ├── ai-voice.tsx
│   │   │   ├── animated-beam-demo.tsx
│   │   │   ├── bento-demo.tsx
│   │   │   └── ...
│   │   ├── ProtectedRoute.tsx  # Rota protegida
│   │   └── VoiceCircle.tsx      # Componente de círculo de voz
│   │
│   ├── hooks/            # Custom Hooks
│   │   ├── useAuth.ts              # Hook de autenticação
│   │   ├── useAudioPlayer.ts      # Hook para player de áudio
│   │   ├── useAudioRecorder.ts    # Hook para gravação de áudio
│   │   ├── useInterviewAudioQueue.ts  # Hook para fila de áudios
│   │   └── useJobReportStatus.ts   # Hook para status de relatórios
│   │
│   ├── pages/            # Páginas da aplicação
│   │   ├── AgentPage.tsx           # Página do agente de entrevista
│   │   ├── Dashboard.tsx           # Dashboard principal
│   │   ├── DetailedReports.tsx     # Relatórios detalhados
│   │   ├── InterviewLoading.tsx    # Tela de carregamento
│   │   ├── InterviewReport.tsx     # Relatório de entrevista
│   │   ├── JobDescriptionForm.tsx  # Formulário de descrição de vaga
│   │   ├── LoginPage.tsx           # Página de login
│   │   ├── RegisterPage.tsx        # Página de registro
│   │   ├── NotFound.tsx            # Página 404
│   │   └── UnderConstruction.tsx    # Página em construção
│   │
│   ├── services/         # Serviços e integrações
│   │   └── AudioManager.ts         # Gerenciador de áudio
│   │
│   ├── types/            # Definições de tipos TypeScript
│   │   └── report.ts               # Tipos relacionados a relatórios
│   │
│   ├── utils/            # Funções utilitárias
│   │   ├── audioConverter.ts       # Conversão de áudio
│   │   ├── audioUpload.ts          # Upload de áudio
│   │   └── transcription.ts        # Transcrição
│   │
│   ├── lib/              # Bibliotecas e helpers
│   │   └── utils.ts                # Utilitários gerais (cn, etc.)
│   │
│   ├── App.tsx           # Componente raiz da aplicação
│   ├── main.tsx          # Ponto de entrada da aplicação
│   └── index.css         # Estilos globais
│
├── components.json       # Configuração do shadcn/ui
├── eslint.config.js      # Configuração do ESLint
├── index.html           # HTML base
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração TypeScript
├── tsconfig.app.json    # Config TS para app
├── tsconfig.node.json   # Config TS para Node
├── vite.config.ts       # Configuração do Vite
└── README.md           # Este arquivo
```

---

## 🗺️ Rotas da Aplicação

### Rotas Públicas

- `/` - Página inicial (landing page)
- `/login` - Página de login
- `/register` - Página de registro
- `/job-description` - Formulário de descrição de vaga
- `/agent` - Página do agente de entrevista
- `/interview-loading` - Tela de carregamento da entrevista
- `/interview-report` - Relatório de entrevista
- `/detailed-reports` - Relatórios detalhados

### Rotas Protegidas (requerem autenticação)

- `/dashboard` - Dashboard principal do usuário
- `/dashboard/history` - Histórico de entrevistas (em construção)
- `/dashboard/analytics` - Analytics e métricas (em construção)
- `/dashboard/reports` - Relatórios (em construção)
- `/dashboard/calendar` - Calendário e agendamentos (em construção)
- `/dashboard/settings` - Configurações (em construção)

### Rota de Erro

- `*` - Página 404 (Not Found)

---

## 🎨 Componentes Principais

### Componentes de UI

Componentes baseados em **Radix UI** e **shadcn/ui**:

- `Button` - Botões customizáveis
- `Card` - Cards e containers
- `Input` - Campos de entrada
- `Label` - Labels para formulários
- `Textarea` - Áreas de texto
- `DropdownMenu` - Menus dropdown
- `Separator` - Separadores visuais
- `Calendar` - Seletor de datas

### Componentes Customizados

- `AI_Voice` - Componente de interação com voz IA
- `VoiceCircle` - Círculo animado de voz
- `BentoDemo` - Grid de features (Bento Grid)
- `AnimatedBeamDemo` - Animações de feixe
- `AnimatedListDemo` - Lista animada
- `ProtectedRoute` - Componente para proteger rotas

---

## 🪝 Custom Hooks

### `useAuth`
Gerencia autenticação do usuário, login, logout e estado da sessão.

### `useAudioPlayer`
Controla reprodução de áudios, play, pause, seek, etc.

### `useAudioRecorder`
Gerencia gravação de áudio, start, stop, e acesso ao blob de áudio.

### `useInterviewAudioQueue`
Gerencia a fila de áudios durante uma entrevista.

### `useJobReportStatus`
Monitora o status de relatórios de entrevista.

---

## ⚙️ Configuração

### Vite Config

O arquivo `vite.config.ts` configura:

- **Alias `@`**: Aponta para `./src` para imports mais limpos
- **Plugins**: React e Tailwind CSS
- **Resolve**: Configuração de aliases de path

Exemplo de uso do alias:

```typescript
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
```

### Tailwind CSS

O projeto usa **Tailwind CSS 4** com o plugin Vite. A configuração está no `vite.config.ts`.

### TypeScript

O projeto possui três arquivos de configuração TypeScript:

- `tsconfig.json` - Configuração base
- `tsconfig.app.json` - Configuração para o app
- `tsconfig.node.json` - Configuração para Node (Vite, etc.)

---

## 🔧 Desenvolvimento

### Estrutura de Imports

Use o alias `@` para imports relativos ao diretório `src`:

```typescript
// ✅ Bom
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

// ❌ Evite
import { Button } from "../../components/ui/button"
```

### Convenções de Código

- Use **TypeScript** para todos os arquivos `.ts` e `.tsx`
- Componentes devem ser **function components** (não classes)
- Use **hooks** para lógica reutilizável
- Mantenha componentes pequenos e focados
- Use **Tailwind CSS** para estilização

### Hot Module Replacement (HMR)

O Vite oferece HMR extremamente rápido. Alterações em arquivos são refletidas instantaneamente no navegador sem perder o estado da aplicação.

---

## 🏗️ Build para Produção

### Gerar Build

```bash
npm run build
```

Isso irá:

1. Compilar TypeScript
2. Otimizar e minificar o código
3. Processar assets (imagens, CSS, etc.)
4. Gerar arquivos na pasta `dist/`

### Estrutura do Build

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

### Deploy

Os arquivos na pasta `dist/` podem ser servidos por qualquer servidor web estático:

- **Vercel**: Conecte o repositório e faça deploy automático
- **Netlify**: Arraste a pasta `dist/` ou conecte o repositório
- **AWS S3 + CloudFront**: Faça upload da pasta `dist/`
- **Nginx/Apache**: Configure para servir a pasta `dist/`

---

## 🔌 Integração com Backend

O frontend se comunica com o backend através de requisições HTTP. Certifique-se de que:

1. O backend está rodando (por padrão em `http://localhost:8080`)
2. O CORS está configurado no backend para aceitar requisições do frontend
3. As URLs da API estão corretas nos serviços

### Endpoints Utilizados

- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/user/profile` - Perfil do usuário
- `POST /api/jobReport/create` - Criar relatório
- `GET /api/jobReport/status/{id}` - Status do relatório
- `POST /api/jobReport/generate-upload-urls` - Gerar URLs de upload

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/...'"

Verifique se o alias `@` está configurado corretamente no `vite.config.ts` e `tsconfig.json`.

### Erro: "Failed to fetch" ao chamar API

1. Verifique se o backend está rodando
2. Verifique a URL da API no código
3. Verifique se o CORS está configurado no backend

### Erro: "Port 5173 is already in use"

Use outra porta:

```bash
npm run dev -- --port 3000
```

Ou pare o processo que está usando a porta 5173.

### Build falha com erros de TypeScript

Execute o TypeScript em modo de verificação:

```bash
npx tsc --noEmit
```

Corrija os erros antes de fazer build.

---

## 📚 Recursos Adicionais

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/)
- [Documentação do React Router](https://reactrouter.com/)
- [Radix UI](https://www.radix-ui.com/)

---

## 👥 Autores

- **Lucas Cabral** - RM554589
- **Thiago Barros** - RM555485
- **Yuri Lopes** - RM555522

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

**Se prepare para o futuro do trabalho. View:In** 🚀
