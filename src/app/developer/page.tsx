'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, ExternalLink, Code, Book, Shield, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  summary: string
  description: string
  tags: string[]
}

const SAMPLE_ENDPOINTS: ApiEndpoint[] = [
  {
    path: '/api/auth/login',
    method: 'POST',
    summary: 'User login',
    description: 'Authenticate user and return session token',
    tags: ['Authentication']
  },
  {
    path: '/api/assignments',
    method: 'GET',
    summary: 'List assignments',
    description: 'Get all assignments for the authenticated user',
    tags: ['Assignments']
  },
  {
    path: '/api/grades',
    method: 'GET',
    summary: 'List grades',
    description: 'Get grades for the authenticated user',
    tags: ['Grades']
  },
  {
    path: '/api/attendance',
    method: 'POST',
    summary: 'Record attendance',
    description: 'Record student attendance',
    tags: ['Attendance']
  }
]

const CODE_EXAMPLES = {
  javascript: `// Initialize the İ-EP.APP API client
import { IEPClient } from '@i-ep/api-client'

const client = new IEPClient({
  baseUrl: 'https://i-ep.app',
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id'
})

// Get assignments
const assignments = await client.assignments.list({
  page: 1,
  limit: 20,
  status: 'published'
})

// Create a new assignment
const newAssignment = await client.assignments.create({
  title: 'Math Homework',
  description: 'Complete exercises 1-10',
  subject: 'Mathematics',
  dueDate: '2024-02-15T23:59:59Z',
  classId: 'class-uuid'
})

// Record attendance
const attendance = await client.attendance.record({
  studentId: 'student-uuid',
  classId: 'class-uuid',
  date: '2024-02-01',
  status: 'present'
})`,
  
  python: `# İ-EP.APP Python SDK
import iep_client

# Initialize client
client = iep_client.IEPClient(
    base_url='https://i-ep.app',
    api_key='your-api-key',
    tenant_id='your-tenant-id'
)

# Get assignments
assignments = client.assignments.list(
    page=1,
    limit=20,
    status='published'
)

# Create assignment
new_assignment = client.assignments.create({
    'title': 'Math Homework',
    'description': 'Complete exercises 1-10',
    'subject': 'Mathematics',
    'due_date': '2024-02-15T23:59:59Z',
    'class_id': 'class-uuid'
})

# Record attendance
attendance = client.attendance.record({
    'student_id': 'student-uuid',
    'class_id': 'class-uuid',
    'date': '2024-02-01',
    'status': 'present'
})`,
  
  curl: `# Authentication
curl -X POST https://i-ep.app/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password"}'

# Get assignments
curl -X GET https://i-ep.app/api/assignments \\
  -H "Authorization: Bearer <your-jwt-token>" \\
  -H "X-Tenant-ID: your-tenant-id"

# Create assignment
curl -X POST https://i-ep.app/api/assignments \\
  -H "Authorization: Bearer <your-jwt-token>" \\
  -H "X-Tenant-ID: your-tenant-id" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Math Homework",
    "description": "Complete exercises 1-10",
    "subject": "Mathematics",
    "due_date": "2024-02-15T23:59:59Z",
    "class_id": "class-uuid"
  }'

# Record attendance
curl -X POST https://i-ep.app/api/attendance \\
  -H "Authorization: Bearer <your-jwt-token>" \\
  -H "X-Tenant-ID: your-tenant-id" \\
  -H "Content-Type: application/json" \\
  -d '{
    "student_id": "student-uuid",
    "class_id": "class-uuid",
    "date": "2024-02-01",
    "status": "present"
  }'`
}

const FEATURES = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with multi-tenant support and role-based access control'
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Optimized endpoints with caching, rate limiting, and efficient data retrieval'
  },
  {
    icon: Code,
    title: 'RESTful Design',
    description: 'Clean, intuitive API design following REST principles and OpenAPI specification'
  },
  {
    icon: Book,
    title: 'Comprehensive Docs',
    description: 'Complete documentation with examples, SDKs, and interactive API explorer'
  }
]

export default function DeveloperPortal() {
  const { toast } = useToast()
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
      duration: 2000
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">İ-EP.APP Developer Portal</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Build powerful educational applications with our comprehensive API
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              API Documentation
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Code className="w-4 h-4" />
              Interactive Explorer
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {FEATURES.map((feature, index) => (
            <Card key={index}>
              <CardHeader className="text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="sdks">SDKs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn how to integrate with the İ-EP.APP API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Authentication</h3>
                  <p className="text-muted-foreground">
                    All API requests require authentication using JWT tokens. 
                    Obtain your token through the login endpoint.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Base URLs</h3>
                  <div className="space-y-1">
                    <p><span className="font-mono text-sm bg-muted px-2 py-1 rounded">https://i-ep.app</span> - Production</p>
                    <p><span className="font-mono text-sm bg-muted px-2 py-1 rounded">https://staging.i-ep.app</span> - Staging</p>
                    <p><span className="font-mono text-sm bg-muted px-2 py-1 rounded">http://localhost:3000</span> - Development</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Rate Limiting</h3>
                  <p className="text-muted-foreground">
                    API requests are rate-limited to ensure fair usage. 
                    Production: 100 req/min, Development: 1000 req/min.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Available endpoints organized by functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SAMPLE_ENDPOINTS.map((endpoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                            {endpoint.method}
                          </Badge>
                          <span className="font-mono text-sm">{endpoint.path}</span>
                        </div>
                        <div className="flex gap-1">
                          {endpoint.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{endpoint.summary}</h4>
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Sample code for common API operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedLanguage === 'javascript' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLanguage('javascript')}
                    >
                      JavaScript
                    </Button>
                    <Button 
                      variant={selectedLanguage === 'python' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLanguage('python')}
                    >
                      Python
                    </Button>
                    <Button 
                      variant={selectedLanguage === 'curl' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLanguage('curl')}
                    >
                      cURL
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{CODE_EXAMPLES[selectedLanguage as keyof typeof CODE_EXAMPLES]}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(CODE_EXAMPLES[selectedLanguage as keyof typeof CODE_EXAMPLES])}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sdks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Official SDKs</CardTitle>
                <CardDescription>
                  Use our official SDKs for faster development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">JavaScript/TypeScript</h3>
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      npm install @i-ep/api-client
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full TypeScript support with automatic type generation
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Python</h3>
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      pip install iep-client
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pythonic API client with async support
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Go</h3>
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      go get github.com/i-ep/go-client
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Efficient Go client with context support
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">PHP</h3>
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      composer require i-ep/api-client
                    </div>
                    <p className="text-sm text-muted-foreground">
                      PSR-compliant PHP client with Laravel support
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete OpenAPI specification with all endpoints, schemas, and examples
              </p>
              <Button className="w-full">
                View Documentation
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interactive Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test API endpoints directly in your browser with our interactive explorer
              </p>
              <Button className="w-full" variant="outline">
                Try API Explorer
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get help with integration, report bugs, or request new features
              </p>
              <Button className="w-full" variant="outline">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}