// @ts-nocheck
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignStudentForm } from '@/components/classes/AssignStudentForm';
import * as Sentry from '@sentry/nextjs';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  startSpan: jest.fn((_, fn) => fn()),
  captureException: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AssignStudentForm Component', () => {
  const mockStudents = [
    {
      id: 'student-1',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      student_number: '2023001',
      is_active: true,
    },
    {
      id: 'student-2',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      student_number: '2023002',
      is_active: true,
    },
  ];

  const mockProps = {
    classId: 'class-1',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    mockProps.onSuccess.mockReset();
    mockProps.onCancel.mockReset();
  });

  it('should render student list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudents,
    });

    render(<AssignStudentForm {...mockProps} />);

    // Yükleme durumunu kontrol et
    expect(screen.getByText('Öğrenciler yükleniyor...')).toBeInTheDocument();

    // Öğrenci listesinin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.queryByText('Öğrenciler yükleniyor...')).not.toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Seçenekleri kontrol et
    expect(screen.getByText('2023001 - Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('2023002 - John Doe')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Öğrenci listesi alınamadı')).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it('should filter students by name', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudents,
    });

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      user.click(select);
    });

    // Arama kutusuna "John" yaz
    await user.type(screen.getByPlaceholderText('Öğrenci ara...'), 'John');

    // Select'i aç
    await user.click(screen.getByRole('combobox'));

    // Sadece "John Doe"nun görünür olduğunu kontrol et
    expect(screen.queryByText('2023001 - Jane Smith')).not.toBeInTheDocument();
    expect(screen.getByText('2023002 - John Doe')).toBeInTheDocument();
  });

  it('should assign selected student', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Öğrenci başarıyla eklendi' }),
      });

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      user.click(select);
    });

    // Öğrenciyi seç
    await user.click(screen.getByText('2023001 - Jane Smith'));

    // Ekle butonuna tıkla
    await user.click(screen.getByText('Ekle'));

    // onSuccess fonksiyonunun çağrıldığını kontrol et
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('should handle assignment error', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents,
      })
      .mockRejectedValueOnce(new Error('Assignment error'));

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      user.click(select);
    });

    // Öğrenciyi seç
    await user.click(screen.getByText('2023001 - Jane Smith'));

    // Ekle butonuna tıkla
    await user.click(screen.getByText('Ekle'));

    // Hata mesajının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Öğrenci eklenemedi')).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });

  it('should handle cancel', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudents,
    });

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      user.click(select);
    });

    // İptal butonuna tıkla
    await user.click(screen.getByText('İptal'));

    // onCancel fonksiyonunun çağrıldığını kontrol et
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
});
