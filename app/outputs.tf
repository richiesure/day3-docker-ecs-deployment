# outputs.tf - Output values after deployment

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.app.name
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for ECS tasks"
  value       = aws_cloudwatch_log_group.ecs_logs.name
}

output "task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = aws_ecs_task_definition.app.arn
}

output "next_steps" {
  description = "How to access your containers"
  value       = <<-EOT
    ✅ ECS Cluster deployed successfully!
    
    To get the public IPs of your running containers:
    aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name} --region ${var.aws_region} --output text --query 'taskArns' | \
    xargs -I {} aws ecs describe-tasks --cluster ${aws_ecs_cluster.main.name} --tasks {} --region ${var.aws_region} --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text | \
    xargs -I {} aws ec2 describe-network-interfaces --network-interface-ids {} --region ${var.aws_region} --query 'NetworkInterfaces[0].Association.PublicIp' --output text
    
    View ECS service:
    aws ecs describe-services --cluster ${aws_ecs_cluster.main.name} --services ${aws_ecs_service.app.name} --region ${var.aws_region}
    
    View logs:
    aws logs tail ${aws_cloudwatch_log_group.ecs_logs.name} --follow --region ${var.aws_region}
  EOT
}
