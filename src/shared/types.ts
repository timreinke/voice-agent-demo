export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface HealthStatus {
  status: string
  timestamp: string
}

export interface EchoRequest {
  message: string
}

export interface EchoResponse {
  echo: any
}