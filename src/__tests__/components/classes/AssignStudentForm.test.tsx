import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssignStudentForm } from "@/components/classes/AssignStudentForm";
import * as Sentry from "@sentry/nextjs";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  startSpan: jest.fn((_, fn) => fn()),
  captureException: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("AssignStudentForm Component", () => {
  const mockStudents = [
    {
      id: "student-1",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      student_number: "2023001",
      is_active: true,
    },
    {
      id: "student-2",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      student_number: "2023002",
      is_active: true,
    },
  ];

  const mockProps = {
    classId: "class-1",
    onAssigned: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    mockProps.onAssigned.mockReset();
    mockProps.onCancel.mockReset();
  });

  it("should render student list", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudents,
    });

    render(<AssignStudentForm {...mockProps} />);

    // Yükleme durumunu kontrol et
    expect(screen.getByText("Öğrenciler yükleniyor...")).toBeInTheDocument();

    // Öğrenci listesinin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("should handle API error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("Öğrenci listesi alınamadı")).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("should filter students by name", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudents,
    });

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Arama kutusuna "John" yaz
    fireEvent.change(screen.getByPlaceholderText("Öğrenci ara..."), {
      target: { value: "John" },
    });

    // Sadece "John Doe"nun görünür olduğunu kontrol et
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should assign selected student", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Öğrenci başarıyla eklendi" }),
      });

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Öğrenciyi seç
    fireEvent.click(screen.getByText("Jane Smith"));

    // Ekle butonuna tıkla
    fireEvent.click(screen.getByText("Ekle"));

    // onAssigned fonksiyonunun çağrıldığını kontrol et
    await waitFor(() => {
      expect(mockProps.onAssigned).toHaveBeenCalled();
    });
  });

  it("should handle assignment error", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudents,
      })
      .mockRejectedValueOnce(new Error("Assignment error"));

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Öğrenciyi seç
    fireEvent.click(screen.getByText("Jane Smith"));

    // Ekle butonuna tıkla
    fireEvent.click(screen.getByText("Ekle"));

    // Hata mesajının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("Öğrenci eklenemedi")).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(mockProps.onAssigned).not.toHaveBeenCalled();
  });

  it("should handle cancel", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudents,
    });

    render(<AssignStudentForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // İptal butonuna tıkla
    fireEvent.click(screen.getByText("İptal"));

    // onCancel fonksiyonunun çağrıldığını kontrol et
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
}); 