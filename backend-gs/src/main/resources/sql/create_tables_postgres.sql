-- ============================================
-- Script para criar as tabelas do sistema (PostgreSQL)
-- ViewIn - Sistema de Entrevistas com IA
-- ============================================
-- Execute este script para criar todas as tabelas necessárias
-- com seus relacionamentos e índices no PostgreSQL

-- ============================================
-- 1. CRIAR TABELA USERS
-- ============================================
-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. CRIAR TABELA JOB_REPORT
-- ============================================
-- Tabela de relatórios de vagas/entrevistas
CREATE TABLE IF NOT EXISTS job_report (
    id_job_report BIGSERIAL PRIMARY KEY,
    id_user BIGINT NOT NULL,
    company VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    session_id VARCHAR(100),
    report_url VARCHAR(2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_job_report_user 
        FOREIGN KEY (id_user) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_job_report_user ON job_report(id_user);
CREATE INDEX IF NOT EXISTS idx_job_report_session_id ON job_report(session_id);

-- ============================================
-- 3. CRIAR TABELA AUDIO_FILES
-- ============================================
-- Tabela de arquivos de áudio das entrevistas
CREATE TABLE IF NOT EXISTS audio_files (
    id_audio_file BIGSERIAL PRIMARY KEY,
    id_job_report BIGINT NOT NULL,
    s3_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_audio_files_job_report 
        FOREIGN KEY (id_job_report) 
        REFERENCES job_report(id_job_report) 
        ON DELETE CASCADE
);

-- Índice para melhorar performance nas consultas por id_job_report
CREATE INDEX IF NOT EXISTS idx_audio_files_job_report ON audio_files(id_job_report);

-- ============================================
-- RELACIONAMENTOS
-- ============================================
-- USERS 1:N JOB_REPORT (Um usuário pode ter vários relatórios)
-- JOB_REPORT 1:N AUDIO_FILES (Um relatório pode ter vários áudios)

