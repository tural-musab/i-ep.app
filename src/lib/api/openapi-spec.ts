import { OpenAPIV3 } from 'openapi-types'

export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  summary: string
  description: string
  tags: string[]
  parameters?: OpenAPIV3.ParameterObject[]
  requestBody?: OpenAPIV3.RequestBodyObject
  responses: { [key: string]: OpenAPIV3.ResponseObject }
  security?: OpenAPIV3.SecurityRequirementObject[]
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  // Authentication endpoints
  {
    path: '/api/auth/login',
    method: 'POST',
    summary: 'User login',
    description: 'Authenticate user and return session token',
    tags: ['Authentication'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                user: { $ref: '#/components/schemas/User' },
                session: { $ref: '#/components/schemas/Session' }
              }
            }
          }
        }
      },
      '401': {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  },
  
  // Assignment endpoints
  {
    path: '/api/assignments',
    method: 'GET',
    summary: 'List assignments',
    description: 'Get all assignments for the authenticated user',
    tags: ['Assignments'],
    parameters: [
      {
        name: 'page',
        in: 'query',
        description: 'Page number',
        required: false,
        schema: { type: 'integer', minimum: 1, default: 1 }
      },
      {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      {
        name: 'status',
        in: 'query',
        description: 'Filter by assignment status',
        required: false,
        schema: { type: 'string', enum: ['draft', 'published', 'closed'] }
      }
    ],
    responses: {
      '200': {
        description: 'List of assignments',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                assignments: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Assignment' }
                },
                pagination: { $ref: '#/components/schemas/Pagination' }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  
  {
    path: '/api/assignments',
    method: 'POST',
    summary: 'Create assignment',
    description: 'Create a new assignment',
    tags: ['Assignments'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AssignmentCreate' }
        }
      }
    },
    responses: {
      '201': {
        description: 'Assignment created',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Assignment' }
          }
        }
      },
      '400': {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  
  // Grade endpoints
  {
    path: '/api/grades',
    method: 'GET',
    summary: 'List grades',
    description: 'Get grades for the authenticated user',
    tags: ['Grades'],
    parameters: [
      {
        name: 'student_id',
        in: 'query',
        description: 'Filter by student ID',
        required: false,
        schema: { type: 'string', format: 'uuid' }
      },
      {
        name: 'subject',
        in: 'query',
        description: 'Filter by subject',
        required: false,
        schema: { type: 'string' }
      },
      {
        name: 'term',
        in: 'query',
        description: 'Filter by term',
        required: false,
        schema: { type: 'string' }
      }
    ],
    responses: {
      '200': {
        description: 'List of grades',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                grades: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Grade' }
                },
                statistics: { $ref: '#/components/schemas/GradeStatistics' }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  
  // Attendance endpoints
  {
    path: '/api/attendance',
    method: 'POST',
    summary: 'Record attendance',
    description: 'Record student attendance',
    tags: ['Attendance'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AttendanceRecord' }
        }
      }
    },
    responses: {
      '201': {
        description: 'Attendance recorded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Attendance' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  
  // Communication endpoints
  {
    path: '/api/messages',
    method: 'GET',
    summary: 'List messages',
    description: 'Get messages for the authenticated user',
    tags: ['Communication'],
    parameters: [
      {
        name: 'type',
        in: 'query',
        description: 'Filter by message type',
        required: false,
        schema: { type: 'string', enum: ['inbox', 'sent', 'archived'] }
      }
    ],
    responses: {
      '200': {
        description: 'List of messages',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                messages: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Message' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  
  // Reports endpoints
  {
    path: '/api/reports/generate',
    method: 'POST',
    summary: 'Generate report',
    description: 'Generate a custom report',
    tags: ['Reports'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ReportRequest' }
        }
      }
    },
    responses: {
      '200': {
        description: 'Report generated',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Report' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  }
]

export const SCHEMAS: { [key: string]: OpenAPIV3.SchemaObject } = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      role: { type: 'string', enum: ['student', 'teacher', 'parent', 'admin'] },
      tenant_id: { type: 'string', format: 'uuid' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'email', 'name', 'role', 'tenant_id']
  },
  
  Session: {
    type: 'object',
    properties: {
      access_token: { type: 'string' },
      refresh_token: { type: 'string' },
      expires_at: { type: 'string', format: 'date-time' },
      user: { $ref: '#/components/schemas/User' }
    },
    required: ['access_token', 'expires_at', 'user']
  },
  
  Assignment: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      title: { type: 'string' },
      description: { type: 'string' },
      subject: { type: 'string' },
      due_date: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['draft', 'published', 'closed'] },
      max_points: { type: 'number' },
      attachments: {
        type: 'array',
        items: { $ref: '#/components/schemas/Attachment' }
      },
      created_by: { type: 'string', format: 'uuid' },
      tenant_id: { type: 'string', format: 'uuid' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'title', 'subject', 'due_date', 'status', 'created_by', 'tenant_id']
  },
  
  AssignmentCreate: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string' },
      subject: { type: 'string', minLength: 1, maxLength: 100 },
      due_date: { type: 'string', format: 'date-time' },
      max_points: { type: 'number', minimum: 0 },
      class_id: { type: 'string', format: 'uuid' },
      attachments: {
        type: 'array',
        items: { type: 'string', format: 'uuid' }
      }
    },
    required: ['title', 'subject', 'due_date', 'class_id']
  },
  
  Grade: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      student_id: { type: 'string', format: 'uuid' },
      assignment_id: { type: 'string', format: 'uuid' },
      points: { type: 'number' },
      max_points: { type: 'number' },
      grade_letter: { type: 'string' },
      feedback: { type: 'string' },
      subject: { type: 'string' },
      term: { type: 'string' },
      graded_by: { type: 'string', format: 'uuid' },
      graded_at: { type: 'string', format: 'date-time' },
      tenant_id: { type: 'string', format: 'uuid' }
    },
    required: ['id', 'student_id', 'points', 'max_points', 'subject', 'tenant_id']
  },
  
  GradeStatistics: {
    type: 'object',
    properties: {
      average: { type: 'number' },
      highest: { type: 'number' },
      lowest: { type: 'number' },
      total_assignments: { type: 'integer' },
      completed_assignments: { type: 'integer' },
      grade_distribution: {
        type: 'object',
        properties: {
          A: { type: 'integer' },
          B: { type: 'integer' },
          C: { type: 'integer' },
          D: { type: 'integer' },
          F: { type: 'integer' }
        }
      }
    }
  },
  
  Attendance: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      student_id: { type: 'string', format: 'uuid' },
      class_id: { type: 'string', format: 'uuid' },
      date: { type: 'string', format: 'date' },
      status: { type: 'string', enum: ['present', 'absent', 'late', 'excused'] },
      notes: { type: 'string' },
      recorded_by: { type: 'string', format: 'uuid' },
      tenant_id: { type: 'string', format: 'uuid' },
      created_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'student_id', 'class_id', 'date', 'status', 'tenant_id']
  },
  
  AttendanceRecord: {
    type: 'object',
    properties: {
      student_id: { type: 'string', format: 'uuid' },
      class_id: { type: 'string', format: 'uuid' },
      date: { type: 'string', format: 'date' },
      status: { type: 'string', enum: ['present', 'absent', 'late', 'excused'] },
      notes: { type: 'string' }
    },
    required: ['student_id', 'class_id', 'date', 'status']
  },
  
  Message: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      sender_id: { type: 'string', format: 'uuid' },
      recipient_id: { type: 'string', format: 'uuid' },
      subject: { type: 'string' },
      content: { type: 'string' },
      attachments: {
        type: 'array',
        items: { $ref: '#/components/schemas/Attachment' }
      },
      read_at: { type: 'string', format: 'date-time' },
      tenant_id: { type: 'string', format: 'uuid' },
      created_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'sender_id', 'recipient_id', 'subject', 'content', 'tenant_id']
  },
  
  Report: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      type: { type: 'string' },
      title: { type: 'string' },
      generated_at: { type: 'string', format: 'date-time' },
      generated_by: { type: 'string', format: 'uuid' },
      file_url: { type: 'string', format: 'uri' },
      parameters: { type: 'object' },
      tenant_id: { type: 'string', format: 'uuid' }
    },
    required: ['id', 'type', 'title', 'generated_at', 'generated_by', 'tenant_id']
  },
  
  ReportRequest: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['student_progress', 'grade_summary', 'attendance_report', 'class_performance'] },
      title: { type: 'string', minLength: 1, maxLength: 255 },
      parameters: {
        type: 'object',
        properties: {
          student_ids: {
            type: 'array',
            items: { type: 'string', format: 'uuid' }
          },
          class_ids: {
            type: 'array',
            items: { type: 'string', format: 'uuid' }
          },
          date_range: {
            type: 'object',
            properties: {
              start_date: { type: 'string', format: 'date' },
              end_date: { type: 'string', format: 'date' }
            },
            required: ['start_date', 'end_date']
          },
          subjects: {
            type: 'array',
            items: { type: 'string' }
          },
          format: { type: 'string', enum: ['pdf', 'excel', 'csv'] }
        }
      }
    },
    required: ['type', 'title', 'parameters']
  },
  
  Attachment: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      filename: { type: 'string' },
      size: { type: 'integer' },
      mime_type: { type: 'string' },
      url: { type: 'string', format: 'uri' },
      uploaded_by: { type: 'string', format: 'uuid' },
      uploaded_at: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'filename', 'size', 'mime_type', 'url']
  },
  
  Pagination: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1 },
      total: { type: 'integer', minimum: 0 },
      total_pages: { type: 'integer', minimum: 0 },
      has_next: { type: 'boolean' },
      has_previous: { type: 'boolean' }
    },
    required: ['page', 'limit', 'total', 'total_pages', 'has_next', 'has_previous']
  },
  
  Error: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
      code: { type: 'string' },
      details: { type: 'object' }
    },
    required: ['error', 'message']
  }
}

export async function getOpenAPISpec(): Promise<OpenAPIV3.Document> {
  const spec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
      title: 'İ-EP.APP API',
      version: '1.0.0',
      description: 'Comprehensive school management system API for İ-EP.APP',
      contact: {
        name: 'İ-EP.APP Support',
        email: 'support@i-ep.app',
        url: 'https://i-ep.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://i-ep.app',
        description: 'Production server'
      },
      {
        url: 'https://staging.i-ep.app',
        description: 'Staging server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    paths: {},
    components: {
      schemas: SCHEMAS,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Assignments',
        description: 'Assignment creation, submission, and management'
      },
      {
        name: 'Grades',
        description: 'Grade management and analytics'
      },
      {
        name: 'Attendance',
        description: 'Student attendance tracking'
      },
      {
        name: 'Communication',
        description: 'Parent-teacher communication'
      },
      {
        name: 'Reports',
        description: 'Report generation and analytics'
      }
    ]
  }

  // Build paths from endpoints
  for (const endpoint of API_ENDPOINTS) {
    if (!spec.paths[endpoint.path]) {
      spec.paths[endpoint.path] = {}
    }
    
    const operation: OpenAPIV3.OperationObject = {
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses,
      security: endpoint.security
    }
    
    spec.paths[endpoint.path][endpoint.method.toLowerCase() as keyof OpenAPIV3.PathItemObject] = operation
  }

  return spec
}

export function generateApiDocumentation(): string {
  let docs = `# İ-EP.APP API Documentation

## Overview
The İ-EP.APP API provides comprehensive endpoints for school management functionality including assignments, grades, attendance, communication, and reporting.

## Authentication
All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Base URLs
- Production: https://i-ep.app
- Staging: https://staging.i-ep.app
- Development: http://localhost:3000

## Rate Limiting
API requests are rate-limited to prevent abuse:
- Development: 1000 requests per minute
- Production: 100 requests per minute

## Endpoints

`

  for (const endpoint of API_ENDPOINTS) {
    docs += `### ${endpoint.method} ${endpoint.path}
**${endpoint.summary}**

${endpoint.description}

**Tags:** ${endpoint.tags.join(', ')}

`
    
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      docs += `**Parameters:**
`
      for (const param of endpoint.parameters) {
        docs += `- \`${param.name}\` (${param.in}) - ${param.description || 'No description'}\n`
      }
      docs += '\n'
    }
    
    if (endpoint.requestBody) {
      docs += `**Request Body:** Required\n\n`
    }
    
    docs += `**Responses:**
`
    for (const [code, response] of Object.entries(endpoint.responses)) {
      docs += `- \`${code}\` - ${response.description}\n`
    }
    docs += '\n---\n\n'
  }

  return docs
}