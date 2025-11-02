# variables.tf - Input variables for ECS deployment

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-west-2"
}

variable "ecr_repository_url" {
  description = "ECR repository URL for the Docker image"
  type        = string
  default     = "494376414941.dkr.ecr.eu-west-2.amazonaws.com/devops-day3-app"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "devops-day3-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "development"
}
