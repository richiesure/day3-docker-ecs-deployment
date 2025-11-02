# Day 3: Docker Containerization & ECS Deployment

## Project Description
This project demonstrates containerizing a Node.js web application with Docker and deploying it to AWS ECS (Elastic Container Service) using Fargate for serverless container orchestration.

## Architecture
```
Docker Image (ECR) → ECS Fargate Tasks (4 containers) → Public IPs
                           ↓
                    CloudWatch Logs
```

## What This Does
- **Containerizes** a Node.js web application using Docker
- **Pushes** Docker image to AWS ECR (Elastic Container Registry)
- **Deploys** containers to ECS Fargate (serverless container service)
- **Scales** horizontally (2-4+ containers)
- **Monitors** with CloudWatch Logs
- **Health checks** ensure container availability

## Components Created

### 1. Docker Container
- **Base Image**: Node.js 18 Alpine (lightweight, 127MB)
- **Application**: Node.js web server with health endpoint
- **Ports**: Exposes port 3000
- **Health Check**: `/health` endpoint

### 2. AWS ECR Repository
- **Name**: devops-day3-app
- **Scanning**: Enabled (security vulnerability scanning)
- **Encryption**: AES256
- **Tags**: 1.0.0 and latest

### 3. ECS Cluster
- **Name**: devops-day3-cluster
- **Type**: Fargate (serverless)
- **Container Insights**: Enabled (monitoring)
- **Tasks**: 4 running containers

### 4. ECS Service
- **Launch Type**: Fargate
- **Desired Count**: 4 (scaled from 2)
- **Network**: Public IPs assigned
- **Health Checks**: Automated container health monitoring

### 5. CloudWatch Logging
- **Log Group**: /ecs/devops-day3-app
- **Retention**: 7 days
- **Streams**: One per container

## Files Structure
```
.
├── app/
│   ├── server.js          # Node.js application
│   ├── package.json       # NPM dependencies
│   ├── Dockerfile         # Container build instructions
│   └── .dockerignore      # Files to exclude from image
├── main.tf                # ECS infrastructure config
├── variables.tf           # Input variables
├── outputs.tf             # Output values
└── README.md              # This file
```

## Prerequisites
- Docker installed
- AWS CLI configured
- Terraform installed
- AWS account with ECS permissions

## Deployment Steps

### Step 1: Build Docker Image
```bash
cd app
docker build -t devops-day3-app:1.0.0 .
docker run -d -p 3000:3000 devops-day3-app:1.0.0
curl http://localhost:3000  # Test locally
```

### Step 2: Push to ECR
```bash
# Create ECR repository
aws ecr create-repository --repository-name devops-day3-app --region eu-west-2

# Authenticate Docker to ECR
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-2.amazonaws.com

# Tag and push
docker tag devops-day3-app:1.0.0 <ACCOUNT_ID>.dkr.ecr.eu-west-2.amazonaws.com/devops-day3-app:1.0.0
docker push <ACCOUNT_ID>.dkr.ecr.eu-west-2.amazonaws.com/devops-day3-app:1.0.0
```

### Step 3: Deploy to ECS
```bash
cd ..
terraform init
terraform plan
terraform apply
```

### Step 4: Get Container IPs
```bash
TASK_ARNS=$(aws ecs list-tasks --cluster devops-day3-cluster --region eu-west-2 --output text --query 'taskArns[]')

for TASK in $TASK_ARNS; do
  ENI=$(aws ecs describe-tasks --cluster devops-day3-cluster --tasks $TASK --region eu-west-2 --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
  PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region eu-west-2 --query 'NetworkInterfaces[0].Association.PublicIp' --output text)
  echo "http://$PUBLIC_IP:3000"
done
```

## Scaling

### Scale Up
```bash
aws ecs update-service \
  --cluster devops-day3-cluster \
  --service devops-day3-service \
  --desired-count 6 \
  --region eu-west-2
```

### Scale Down
```bash
aws ecs update-service \
  --cluster devops-day3-cluster \
  --service devops-day3-service \
  --desired-count 2 \
  --region eu-west-2
```

## Monitoring

### View Logs
```bash
# Tail logs in real-time
aws logs tail /ecs/devops-day3-app --follow --region eu-west-2

# View specific container logs
aws logs tail /ecs/devops-day3-app/ecs/devops-day3-app/<CONTAINER_ID> --region eu-west-2
```

### Check Service Health
```bash
aws ecs describe-services \
  --cluster devops-day3-cluster \
  --services devops-day3-service \
  --region eu-west-2
```

### View Running Tasks
```bash
aws ecs list-tasks --cluster devops-day3-cluster --region eu-west-2
```

## Cost Analysis

### Current Setup (4 containers, 24/7)
```
ECS Fargate (4 tasks):
- vCPU: 4 × 0.25 = 1 vCPU
- Memory: 4 × 0.5GB = 2GB
- Cost: ~$34/month

CloudWatch Logs: ~$0.50/month
ECR Storage: ~$0.10/month (compressed images)

Total: ~$35/month
```

**Cost Optimization Tips:**
- Scale down when not in use
- Use Fargate Spot for non-critical workloads (70% savings)
- Implement auto-scaling based on metrics

## Production Enhancements

For production, you would add:
1. **Application Load Balancer** (single endpoint, health checks)
2. **Auto Scaling** (CPU/memory-based scaling)
3. **Service Discovery** (AWS Cloud Map)
4. **Secrets Management** (AWS Secrets Manager)
5. **CI/CD Pipeline** (automated deployments)
6. **Blue-Green Deployments** (zero-downtime updates)
7. **Multi-AZ deployment** (high availability)
8. **Custom domain** (Route 53 + ALB)

## Learning Objectives

✅ **Docker**: Containerize applications with Dockerfile
✅ **ECR**: Manage Docker images in AWS
✅ **ECS**: Deploy and orchestrate containers
✅ **Fargate**: Serverless container compute
✅ **Scaling**: Horizontal scaling of containers
✅ **Monitoring**: CloudWatch Logs integration
✅ **Infrastructure as Code**: Terraform for ECS
✅ **Health Checks**: Container health monitoring

## Troubleshooting

### Container not starting
```bash
# Check task status
aws ecs describe-tasks --cluster devops-day3-cluster --tasks <TASK_ARN> --region eu-west-2

# View logs
aws logs tail /ecs/devops-day3-app --since 30m --region eu-west-2
```

### Can't access container
- Verify security group allows port 3000
- Check container has public IP assigned
- Ensure container is in RUNNING state

### Image pull error
```bash
# Re-authenticate to ECR
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-2.amazonaws.com

# Verify image exists
aws ecr describe-images --repository-name devops-day3-app --region eu-west-2
```

## Cleanup
```bash
# Scale down to 0
aws ecs update-service --cluster devops-day3-cluster --service devops-day3-service --desired-count 0 --region eu-west-2

# Wait for tasks to stop
sleep 60

# Destroy infrastructure
terraform destroy

# Delete ECR images
aws ecr batch-delete-image \
  --repository-name devops-day3-app \
  --image-ids imageTag=1.0.0 imageTag=latest \
  --region eu-west-2

# Delete ECR repository
aws ecr delete-repository --repository-name devops-day3-app --force --region eu-west-2
```

## Real-World Applications

This setup demonstrates patterns used by companies like:
- **Netflix**: Microservices on ECS/Kubernetes
- **Airbnb**: Container-based deployments
- **Uber**: Dynamic scaling based on demand
- **Amazon**: Internal services on ECS

## Next Steps - Day 4 Preview
- CI/CD pipelines with CodePipeline
- Blue-Green deployments
- Container security scanning
- Multi-region deployments

---

**Author:** DevOps Learning Journey - Day 3
**Container IPs:**
- http://18.133.187.21:3000
- http://13.42.19.189:3000
