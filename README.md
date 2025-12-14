# 🎤 ViewIn - Sistema de Entrevistas com IA

Sistema completo de entrevistas de emprego automatizadas com geração de áudio por IA, transcrição e relatórios detalhados.

---

## 👥 Autores

- **Lucas Cabral** - RM554589
- **Thiago Barros** - RM555485
- **Yuri Lopes** - RM555522

---

## 📋 Sobre o Projeto

O **ViewIn** é uma plataforma que automatiza o processo de entrevistas de emprego utilizando Inteligência Artificial. O sistema permite:

- 🎯 Ajudar o usuario a simular entrevistas para vagas desejadas
- 🎤 Geração automática de perguntas de entrevista
- 🔊 Geração de áudios com voz sintética
- 📝 Transcrição automática das respostas
- 📊 Geração de relatórios detalhados com análise por IA
- 👤 Sistema de autenticação e gerenciamento de usuários

---

## 🎥 Vídeos

- 🎯 **[Pitch do Projeto](https://youtu.be/cnVZKO3Y-pU)** - Apresentação do ViewIn
- 🔧 **[How We Built It](https://youtu.be/YnQi9F0burw)** - Como construímos o projeto

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **JDBC** (acesso direto ao banco)
- **Oracle Database 12c+**
- **JWT** (autenticação)
- **AWS SDK** (S3, Lambda)

### Frontend
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router**

### Infraestrutura
- **AWS Lambda** (funções serverless)
- **AWS S3** (armazenamento de áudios)
- **AWS SQS** (fila)
- **AWS SNS** (eventos)
- **AWS Transcribe** (transcricao)
- **AWS Bedrock** (análise com IA)

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Java 17+** ([Download](https://www.oracle.com/java/technologies/downloads/#java17))
- **Maven 3.6+** ([Download](https://maven.apache.org/download.cgi))
- **Node.js 18+** e **npm** ([Download](https://nodejs.org/))
- **Banco de Dados** (escolha uma opção):
  - **Oracle Database 12c+** (se tiver acesso ao banco FIAP)
  - **PostgreSQL 12+** (recomendado para desenvolvimento local)
  - **H2 Database** (mais simples, embutido, sem instalação)
- **Git** ([Download](https://git-scm.com/downloads))
- **ngrok** (opcional, para expor o backend localmente) ([Download](https://ngrok.com/))

---

## 🚀 Setup do Projeto

### 1️⃣ Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd viewin
```

---

### 2️⃣ Configurar o Banco de Dados

Você pode usar **Oracle** (se tiver acesso ao banco FIAP) ou um **banco local** (PostgreSQL ou H2) para desenvolvimento.

---

#### 📘 Opção A: Oracle Database (FIAP)

**2.1. Conectar ao Oracle**

Certifique-se de ter acesso ao banco Oracle da FIAP:
- **Host**: `oracle.fiap.com.br`
- **Port**: `1521`
- **SID**: `ORCL`

**2.2. Executar Scripts SQL**

Execute os scripts na ordem abaixo:

```bash
cd backend-gs/src/main/resources/sql
```

**Criar banco do zero (recomendado)**
```sql
sqlplus SEU_RM/SUA_SENHA@oracle.fiap.com.br:1521/ORCL @init_database.sql
```

**Criar apenas as tabelas**
```sql
sqlplus SEU_RM/SUA_SENHA@oracle.fiap.com.br:1521/ORCL @create_tables.sql
```

**2.3. Verificar Estrutura**

```sql
-- Verificar tabelas criadas
SELECT table_name FROM user_tables ORDER BY table_name;

-- Verificar estrutura
DESC USERS;
DESC JOB_REPORT;
DESC AUDIO_FILES;
```

---

#### 🐘 Opção B: PostgreSQL (Recomendado para Desenvolvimento Local)

**2.1. Instalar PostgreSQL**

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Baixe em: https://www.postgresql.org/download/windows/
```

**2.2. Criar Banco de Dados**

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE viewin_db;

# Criar usuário (opcional)
CREATE USER viewin_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE viewin_db TO viewin_user;

# Sair
\q
```

**2.3. Executar Scripts SQL**

Um script SQL adaptado para PostgreSQL já está disponível:

```bash
cd backend-gs/src/main/resources/sql
psql -U viewin_user -d viewin_db -f create_tables_postgres.sql
```

Ou execute diretamente no psql:

```bash
psql -U viewin_user -d viewin_db
\i create_tables_postgres.sql
```

**2.5. Configurar `application.properties`**

```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/viewin_db
spring.datasource.username=viewin_user
spring.datasource.password=sua_senha
spring.datasource.driver-class-name=org.postgresql.Driver
```

---

#### 💾 Opção C: H2 Database (Mais Simples - Sem Instalação)

**2.1. Configurar H2 no `application.properties`**

```properties
# H2 Database Configuration (embutido, sem instalação)
spring.datasource.url=jdbc:h2:mem:viewin_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Console (acessível em http://localhost:8080/h2-console)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

**2.2. Adicionar Dependência H2 no `pom.xml`**

Se ainda não estiver presente, adicione:

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**2.3. Criar Script de Inicialização**

Crie `src/main/resources/schema.sql` ou use o script fornecido:

```bash
# O script create_tables_h2.sql já está disponível
# O Spring Boot executará automaticamente se configurado
```

**Nota**: H2 é em memória por padrão. Para persistência, use:
```properties
spring.datasource.url=jdbc:h2:file:./data/viewin_db
```

---

### 3️⃣ Configurar o Backend

#### 3.1. Editar `application.properties`

Abra o arquivo `backend-gs/src/main/resources/application.properties` e configure:

**Para Oracle:**
```properties
# Oracle Database (substitua com suas credenciais)
oracle.host=oracle.fiap.com.br
oracle.port=1521
oracle.sid=ORCL
oracle.username=SEU_RM
oracle.password=SUA_SENHA

# JWT (mantenha ou altere para produção)
jwt.secret=suaChaveSecretaSuperSegura123
jwt.expiration=86400000

# AWS (configure com suas credenciais)
aws.region=us-east-1
s3.bucket.name=interview-ai-assets

# Lambda URLs (configure com suas URLs - veja seção de Infraestrutura)
lambda.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.presigned.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.upload.urls=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.check.report.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/

# Backend Public URL (ngrok - será atualizado automaticamente)
backend.public.url=https://sua-url-ngrok.ngrok-free.dev
```

**Para PostgreSQL:**
```properties
# PostgreSQL Database
spring.datasource.url=jdbc:postgresql://localhost:5432/viewin_db
spring.datasource.username=viewin_user
spring.datasource.password=sua_senha
spring.datasource.driver-class-name=org.postgresql.Driver

# JWT
jwt.secret=suaChaveSecretaSuperSegura123
jwt.expiration=86400000

# AWS
aws.region=us-east-1
s3.bucket.name=interview-ai-assets

# Lambda URLs
lambda.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.presigned.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.upload.urls=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.check.report.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/

# Backend Public URL
backend.public.url=https://sua-url-ngrok.ngrok-free.dev
```

**Para H2 (desenvolvimento local simples):**
```properties
# H2 Database (embutido, sem instalação)
spring.datasource.url=jdbc:h2:mem:viewin_db;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true

# JWT
jwt.secret=suaChaveSecretaSuperSegura123
jwt.expiration=86400000

# AWS
aws.region=us-east-1
s3.bucket.name=interview-ai-assets

# Lambda URLs
lambda.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.presigned.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.upload.urls=https://sua-lambda-url.lambda-url.us-east-1.on.aws/
lambda.check.report.url=https://sua-lambda-url.lambda-url.us-east-1.on.aws/

# Backend Public URL
backend.public.url=https://sua-url-ngrok.ngrok-free.dev
```

**⚠️ Importante:**
- Substitua `SEU_RM` e `SUA_SENHA` pelas suas credenciais reais
- Nunca commite o arquivo `application.properties` com credenciais reais
- Use variáveis de ambiente em produção

#### 3.2. Instalar Dependências

```bash
cd backend-gs
mvn clean install
```

#### 3.3. Rodar o Backend

```bash
mvn spring-boot:run
```

O backend estará disponível em: `http://localhost:8080`

---

### 4️⃣ Configurar o Frontend

#### 4.1. Instalar Dependências

```bash
cd viewin-frontend
npm install
```

#### 4.2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend (opcional, se necessário):

```env
VITE_API_URL=http://localhost:8080
```

#### 4.3. Rodar o Frontend

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

---

### 5️⃣ Configurar ngrok (Opcional)

Para expor o backend localmente para as Lambdas AWS:

#### 5.1. Instalar ngrok

```bash
# macOS
brew install ngrok

# Linux/Windows
# Baixe em: https://ngrok.com/download
```

#### 5.2. Autenticar ngrok

```bash
ngrok config add-authtoken <seu-token>
```

#### 5.3. Iniciar túnel

```bash
ngrok http 8080
```

Copie a URL gerada (ex: `https://xxxx.ngrok-free.dev`) e atualize no `application.properties`:

```properties
backend.public.url=https://xxxx.ngrok-free.dev
```

**Ou use o script automático:**

```bash
cd viewin-frontend
./update-ngrok-url.sh
```

---

## 🏃 Como Executar o Projeto

### Executar Backend e Frontend Simultaneamente

**Terminal 1 - Backend:**
```bash
cd backend-gs
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd viewin-frontend
npm run dev
```

**Terminal 3 - ngrok (se necessário):**
```bash
ngrok http 8080
```

---

## 📁 Estrutura do Projeto

```
viewin/
├── backend-gs/                 # Backend Java Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/backend/gs/
│   │   │   │       ├── controller/    # Controllers REST
│   │   │   │       ├── service/       # Lógica de negócio
│   │   │   │       ├── dao/           # Data Access Objects (JDBC)
│   │   │   │       ├── model/         # Entidades
│   │   │   │       ├── dto/           # Data Transfer Objects
│   │   │   │       ├── config/        # Configurações
│   │   │   │       ├── database/      # Conexão Oracle
│   │   │   │       └── utils/         # Utilitários
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── sql/               # Scripts SQL
│   │   └── test/
│   └── pom.xml
│
├── viewin-frontend/            # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas
│   │   ├── hooks/              # Custom Hooks
│   │   ├── services/           # Serviços API
│   │   ├── utils/              # Utilitários
│   │   └── types/               # Tipos TypeScript
│   ├── package.json
│   └── vite.config.ts
│
├── infra/                      # Infraestrutura AWS
│   ├── terraform/              # Configuração Terraform (IaC)
│   ├── GenerateInterview/      # Lambdas de geração de entrevista
│   └── GenerateReport/         # Lambdas de geração de relatório
│
└── README.md                   # Este arquivo
```

---

## 🔐 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/user/profile` - Perfil do usuário (requer autenticação)

### Job Reports
- `POST /api/jobReport/create` - Criar novo relatório
- `GET /api/jobReport/status/{id}` - Status do relatório
- `POST /api/jobReport/callback/audios-ready` - Callback de áudios prontos
- `POST /api/jobReport/callback/report-ready` - Callback de relatório pronto
- `POST /api/jobReport/generate-upload-urls` - Gerar URLs de upload

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas

1. **USERS** - Usuários do sistema
2. **JOB_REPORT** - Relatórios de entrevistas
3. **AUDIO_FILES** - Arquivos de áudio

### Relacionamentos

```
USERS (1) ──────< (N) JOB_REPORT (1) ──────< (N) AUDIO_FILES
```

- Um usuário pode ter vários relatórios
- Um relatório pode ter vários arquivos de áudio

---

## 📚 Documentação Adicional

- **Diagrama de Classes UML**: Ver `UML.png` na raiz do projeto
- **Diagrama ERD**: Ver `ERD.png` na raiz do projeto
- **Scripts SQL**: Ver `backend-gs/src/main/resources/sql/`

---

## 🧪 Testando o Sistema

### 1. Criar Usuário

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "email": "teste@teste.com",
    "password": "123456"
  }'
```

### 2. Fazer Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste",
    "password": "123456"
  }'
```

### 3. Criar Job Report

```bash
curl -X POST http://localhost:8080/api/jobReport/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{
    "company": "FIAP",
    "title": "Desenvolvedor Java",
    "description": "Vaga para desenvolvedor Java sênior",
    "callbackUrl": "http://localhost:8080/api/jobReport/callback/audios-ready"
  }'
```

---

## ⚠️ Troubleshooting

### Backend não conecta ao Banco de Dados

**Para Oracle:**
1. Verifique as credenciais no `application.properties`
2. Teste a conexão manualmente:
   ```sql
   sqlplus SEU_RM/SUA_SENHA@oracle.fiap.com.br:1521/ORCL
   ```
3. Verifique se o driver Oracle está no classpath
4. Verifique se tem acesso à rede da FIAP (VPN se necessário)

**Para PostgreSQL:**
1. Verifique se o PostgreSQL está rodando:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```
2. Teste a conexão:
   ```bash
   psql -U viewin_user -d viewin_db
   ```
3. Verifique se o banco e usuário foram criados corretamente

**Para H2:**
1. Verifique se a dependência H2 está no `pom.xml`
2. Acesse o console H2 em: `http://localhost:8080/h2-console`
3. Use JDBC URL: `jdbc:h2:mem:viewin_db`

### Frontend não conecta ao Backend

1. Verifique se o backend está rodando na porta 8080
2. Verifique CORS no `SecurityConfig.java`
3. Verifique a URL da API no frontend

### Erro ao criar tabelas

1. Execute `drop_tables.sql` primeiro (cuidado: apaga dados!)
2. Depois execute `create_tables.sql`
3. Ou use `init_database.sql` que faz tudo automaticamente

---

## 📝 Notas Importantes

- ⚠️ **Nunca commite** o arquivo `application.properties` com credenciais reais
- 🔒 Use variáveis de ambiente ou arquivos `.env` para produção
- 🗄️ Sempre faça backup antes de executar scripts de migração
- 📦 O projeto usa JDBC puro (não JPA/Hibernate) conforme requisitos
- 🏗️ **Infraestrutura AWS**: Use Terraform para criar recursos AWS. Veja `infra/terraform/README.md`
- 💾 **Banco Local**: Para desenvolvimento, use PostgreSQL ou H2 ao invés de Oracle se não tiver acesso

---

## 🎓 Critérios Acadêmicos Atendidos

✅ **Backend Java com POO** - Classes com encapsulamento, herança e polimorfismo  
✅ **Uso de JDBC** - Acesso direto ao banco com PreparedStatement  
✅ **Banco relacional com CRUD completo** - Todas as entidades têm operações CRUD  
✅ **3 entidades com relacionamentos** - User, JobReport, AudioFile com relacionamentos 1:N  

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

- **Lucas Cabral** - RM554589
- **Thiago Barros** - RM555485
- **Yuri Lopes** - RM555522

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

**Se prepare para o futuro do trabalho. View:In**

