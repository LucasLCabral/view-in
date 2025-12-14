terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  backend "s3" {
    # Configurado via backend.tf ou variáveis
    # bucket = "terraform-state-bucket"
    # key    = "viewin/infra/terraform.tfstate"
    # region = "us-east-1"
    # dynamodb_table = "terraform-state-lock"
    # encrypt = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ViewIn"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}

# Data source para obter informações da conta AWS
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}



