'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  RefreshCw,
  Users,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';

// Teacher data interface
interface Teacher {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  metadata: {
    phone?: string;
    address?: string;
    subjects?: string[];
    specialties?: string[];
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface TeacherListResponse {
  data: Teacher[];
  pagination: {
    current: number;
    total: number;
    pages: number;
    limit: number;
  };
}

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Create teacher dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    subjects: [] as string[],
    specialties: [] as string[]
  });

  // Fetch teachers data
  const fetchTeachers = async (page = 1, search = '') => {
    return Sentry.startSpan(
      { op: "ui.action", name: "Fetch Teachers" },
      async () => {
        try {
          setLoading(true);
          setError(null);

          const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            ...(search && { search })
          });

          const response = await fetch(`/api/teachers?${params}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: TeacherListResponse = await response.json();
          
          setTeachers(data.data || []);
          setCurrentPage(data.pagination.current);
          setTotalPages(data.pagination.pages);
          setTotalCount(data.pagination.total);

        } catch (err) {
          console.error('Fetch teachers error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teachers';
          setError(errorMessage);
          Sentry.captureException(err);
          toast.error('Failed to load teachers');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Create new teacher
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    return Sentry.startSpan(
      { op: "ui.action", name: "Create Teacher" },
      async () => {
        try {
          setLoading(true);

          const response = await fetch('/api/teachers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTeacher),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create teacher');
          }

          toast.success('Teacher created successfully');
          setIsCreateDialogOpen(false);
          setNewTeacher({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address: '',
            subjects: [],
            specialties: []
          });
          
          // Refresh the list
          await fetchTeachers(currentPage, searchTerm);

        } catch (err) {
          console.error('Create teacher error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to create teacher';
          toast.error(errorMessage);
          Sentry.captureException(err);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchTeachers(1, value);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTeachers(page, searchTerm);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTeachers(currentPage, searchTerm);
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Loading state
  if (loading && (teachers || []).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Teacher Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading teachers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Teacher Management
          </h1>
          <p className="text-muted-foreground">
            Manage teachers in your school
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Create a new teacher account for your school.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTeacher} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name *</label>
                    <Input
                      value={newTeacher.first_name}
                      onChange={(e) => setNewTeacher({...newTeacher, first_name: e.target.value})}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name *</label>
                    <Input
                      value={newTeacher.last_name}
                      onChange={(e) => setNewTeacher({...newTeacher, last_name: e.target.value})}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    type="tel"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={newTeacher.address}
                    onChange={(e) => setNewTeacher({...newTeacher, address: e.target.value})}
                    placeholder="Enter address"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subjects</label>
                  <Input
                    value={newTeacher.subjects.join(', ')}
                    onChange={(e) => setNewTeacher({
                      ...newTeacher, 
                      subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    placeholder="Enter subjects (comma separated)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: Mathematics, Physics, Chemistry
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Specialties</label>
                  <Input
                    value={newTeacher.specialties.join(', ')}
                    onChange={(e) => setNewTeacher({
                      ...newTeacher, 
                      specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    placeholder="Enter specialties (comma separated)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: Advanced Mathematics, Laboratory Sciences
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Teacher'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Active Teachers</p>
                <p className="text-2xl font-bold">{teachers.filter(t => t.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Page</p>
                <p className="text-2xl font-bold">{currentPage} / {totalPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Teachers ({totalCount})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">
              <p className="font-medium">Error loading teachers</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(teachers || []).map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {teacher.first_name} {teacher.last_name}
                        </div>
                        {teacher.metadata?.phone && (
                          <div className="text-sm text-muted-foreground">
                            {teacher.metadata.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.metadata?.subjects?.slice(0, 2).map((subject, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {(teacher.metadata?.subjects?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(teacher.metadata?.subjects?.length || 0) - 2} more
                          </Badge>
                        )}
                        {(!teacher.metadata?.subjects || teacher.metadata.subjects.length === 0) && (
                          <span className="text-sm text-muted-foreground">No subjects</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(teacher.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {(teachers || []).length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No teachers found</h3>
              <p className="mt-2 text-muted-foreground">
                Get started by adding your first teacher.
              </p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} teachers
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement; 