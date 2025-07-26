// @ts-nocheck
/**
 * Assignment Dashboard Integration Tests
 * Phase 6.1: Frontend-Backend Integration
 * Testing real API integration with Assignment Dashboard
 */

import { render, screen, waitFor } from '@testing-library/react';
import { AssignmentDashboard } from '@/components/assignments/assignment-dashboard';
import { useAssignmentData } from '@/hooks/use-assignment-data';

// Mock the hook
jest.mock('@/hooks/use-assignment-data');
const mockUseAssignmentData = useAssignmentData as jest.MockedFunction<typeof useAssignmentData>;

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('Assignment Dashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state correctly', () => {
    mockUseAssignmentData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<AssignmentDashboard />);

    expect(screen.getByText('Ödev verileri yükleniyor...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner') || screen.getByText(/yükleniyor/i)).toBeInTheDocument();
  });

  it('displays error state with retry functionality', () => {
    const mockRefetch = jest.fn();
    mockUseAssignmentData.mockReturnValue({
      data: null,
      loading: false,
      error: 'API connection failed',
      refetch: mockRefetch,
    });

    render(<AssignmentDashboard />);

    expect(screen.getByText('Veri yükleme hatası')).toBeInTheDocument();
    expect(screen.getByText('API connection failed')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Tekrar Dene');
    expect(retryButton).toBeInTheDocument();
    
    retryButton.click();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('displays real API data correctly', async () => {
    const mockData = {
      stats: {
        totalAssignments: 15,
        activeAssignments: 8,
        pendingGrades: 12,
        completedAssignments: 7,
        averageScore: 85.4,
        completionRate: 78,
      },
      recentAssignments: [
        {
          id: 'assignment-001',
          title: 'Türkçe Kompozisyon - Okulum',
          type: 'homework' as const,
          class: 'Türkçe',
          dueDate: '2025-01-25T00:00:00.000Z',
          submissions: 23,
          totalStudents: 30,
          graded: 20,
          status: 'active' as const,
        },
        {
          id: 'assignment-002',
          title: 'Matematik - Kesirler Konusu',
          type: 'homework' as const,
          class: 'Matematik',
          dueDate: '2025-01-22T00:00:00.000Z',
          submissions: 18,
          totalStudents: 28,
          graded: 15,
          status: 'active' as const,
        },
      ],
      upcomingDeadlines: [
        {
          id: 'deadline-001',
          title: 'İngilizce Kelime Testi',
          class: '5-A',
          dueDate: '2025-01-24T00:00:00.000Z',
          daysLeft: 2,
        },
      ],
    };

    mockUseAssignmentData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AssignmentDashboard />);

    // Check header and data source indicator
    expect(screen.getByText('Ödev Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('🔗 Canlı Veri')).toBeInTheDocument();

    // Check statistics cards
    expect(screen.getByText('15')).toBeInTheDocument(); // Total assignments
    expect(screen.getByText('8')).toBeInTheDocument(); // Active assignments
    expect(screen.getByText('12')).toBeInTheDocument(); // Pending grades
    expect(screen.getByText('85.4')).toBeInTheDocument(); // Average score

    // Check recent assignments
    await waitFor(() => {
      expect(screen.getByText('Türkçe Kompozisyon - Okulum')).toBeInTheDocument();
      expect(screen.getByText('Matematik - Kesirler Konusu')).toBeInTheDocument();
    });

    // Check upcoming deadlines
    expect(screen.getByText('İngilizce Kelime Testi')).toBeInTheDocument();
    expect(screen.getByText('2 gün kaldı')).toBeInTheDocument();

    // Check assignment status badges
    expect(screen.getAllByText('Aktif')).toHaveLength(2);
    expect(screen.getAllByText('Ödev')).toHaveLength(2);
  });

  it('falls back to mock data when API returns empty results', () => {
    const mockData = {
      stats: {
        totalAssignments: 0,
        activeAssignments: 0,
        pendingGrades: 0,
        completedAssignments: 0,
        averageScore: 0,
        completionRate: 0,
      },
      recentAssignments: [],
      upcomingDeadlines: [],
    };

    mockUseAssignmentData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AssignmentDashboard />);

    // Should show zero stats
    expect(screen.getByText('Ödev Yönetimi')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(4); // All stats should be 0

    // Should show empty state for upcoming deadlines
    expect(screen.getByText('Yaklaşan son tarih bulunmuyor')).toBeInTheDocument();
  });

  it('displays Turkish date formatting correctly', () => {
    const mockData = {
      stats: {
        totalAssignments: 5,
        activeAssignments: 3,
        pendingGrades: 2,
        completedAssignments: 2,
        averageScore: 80,
        completionRate: 75,
      },
      recentAssignments: [
        {
          id: 'assignment-001',
          title: 'Test Assignment',
          type: 'homework' as const,
          class: 'Test Class',
          dueDate: '2025-01-25T00:00:00.000Z',
          submissions: 10,
          totalStudents: 20,
          graded: 8,
          status: 'active' as const,
        },
      ],
      upcomingDeadlines: [],
    };

    mockUseAssignmentData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AssignmentDashboard />);

    // Check Turkish date format (DD.MM.YYYY)
    const turkishDate = new Date('2025-01-25T00:00:00.000Z').toLocaleDateString('tr-TR');
    expect(screen.getByText(turkishDate)).toBeInTheDocument();
  });

  it('handles assignment type badges correctly', () => {
    const mockData = {
      stats: {
        totalAssignments: 4,
        activeAssignments: 4,
        pendingGrades: 0,
        completedAssignments: 0,
        averageScore: 0,
        completionRate: 0,
      },
      recentAssignments: [
        {
          id: 'hw-001',
          title: 'Homework Assignment',
          type: 'homework' as const,
          class: 'Math',
          dueDate: '2025-01-25T00:00:00.000Z',
          submissions: 5,
          totalStudents: 10,
          graded: 0,
          status: 'active' as const,
        },
        {
          id: 'proj-001',
          title: 'Science Project',
          type: 'project' as const,
          class: 'Science',
          dueDate: '2025-01-26T00:00:00.000Z',
          submissions: 3,
          totalStudents: 10,
          graded: 0,
          status: 'active' as const,
        },
        {
          id: 'exam-001',
          title: 'Midterm Exam',
          type: 'exam' as const,
          class: 'History',
          dueDate: '2025-01-27T00:00:00.000Z',
          submissions: 8,
          totalStudents: 10,
          graded: 0,
          status: 'active' as const,
        },
        {
          id: 'quiz-001',
          title: 'Quick Quiz',
          type: 'quiz' as const,
          class: 'English',
          dueDate: '2025-01-28T00:00:00.000Z',
          submissions: 10,
          totalStudents: 10,
          graded: 0,
          status: 'active' as const,
        },
      ],
      upcomingDeadlines: [],
    };

    mockUseAssignmentData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AssignmentDashboard />);

    // Check type badges
    expect(screen.getByText('Ödev')).toBeInTheDocument(); // homework
    expect(screen.getByText('Proje')).toBeInTheDocument(); // project
    expect(screen.getByText('Sınav')).toBeInTheDocument(); // exam
    expect(screen.getByText('Quiz')).toBeInTheDocument(); // quiz
  });

  it('renders quick action buttons with correct links', () => {
    mockUseAssignmentData.mockReturnValue({
      data: {
        stats: {
          totalAssignments: 10,
          activeAssignments: 5,
          pendingGrades: 3,
          completedAssignments: 2,
          averageScore: 75,
          completionRate: 80,
        },
        recentAssignments: [],
        upcomingDeadlines: [],
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AssignmentDashboard />);

    // Check quick action buttons
    expect(screen.getByText('Yeni Ödev Oluştur')).toBeInTheDocument();
    expect(screen.getByText('Notlandır (3)')).toBeInTheDocument();
    expect(screen.getByText('Aktif Ödevler (5)')).toBeInTheDocument();
    expect(screen.getByText('Analitik & Raporlar')).toBeInTheDocument();

    // Check links
    const createButton = screen.getByText('Yeni Ödev Oluştur').closest('a');
    expect(createButton).toHaveAttribute('href', '/dashboard/assignments/create');

    const gradingButton = screen.getByText('Notlandır (3)').closest('a');
    expect(gradingButton).toHaveAttribute('href', '/dashboard/assignments?tab=grading');

    const activeButton = screen.getByText('Aktif Ödevler (5)').closest('a');
    expect(activeButton).toHaveAttribute('href', '/dashboard/assignments?tab=active');

    const analyticsButton = screen.getByText('Analitik & Raporlar').closest('a');
    expect(analyticsButton).toHaveAttribute('href', '/dashboard/assignments?tab=analytics');
  });
});