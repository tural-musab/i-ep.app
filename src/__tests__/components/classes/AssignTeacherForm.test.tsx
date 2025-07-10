import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssignTeacherForm } from "@/components/classes/AssignTeacherForm";
import * as Sentry from "@sentry/nextjs";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  startSpan: jest.fn((_, fn) => fn()),
  captureException: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("AssignTeacherForm Component", () => {
  const mockTeachers = [
    {
      id: "teacher-1",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      is_active: true,
    },
    {
      id: "teacher-2",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
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

  it("should render teacher list", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeachers,
    });

    render(<AssignTeacherForm {...mockProps} />);

    // Yükleme durumunu kontrol et
    expect(screen.getByText("Öğretmenler yükleniyor...")).toBeInTheDocument();

    // Öğretmen listesinin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  it("should handle API error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    render(<AssignTeacherForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("Öğretmen listesi alınamadı")).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("should filter teachers by name", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeachers,
    });

    render(<AssignTeacherForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Arama kutusuna "Jane" yaz
    fireEvent.change(screen.getByPlaceholderText("Öğretmen ara..."), {
      target: { value: "Jane" },
    });

    // Sadece "Jane Smith"in görünür olduğunu kontrol et
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should assign selected teacher as subject teacher", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Öğretmen başarıyla eklendi" }),
      });

    render(<AssignTeacherForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Öğretmeni seç
    fireEvent.click(screen.getByText("John Doe"));

    // Branş öğretmeni olarak seç
    fireEvent.click(screen.getByLabelText("Branş Öğretmeni"));

    // Ekle butonuna tıkla
    fireEvent.click(screen.getByText("Ekle"));

    // onAssigned fonksiyonunun çağrıldığını kontrol et
    await waitFor(() => {
      expect(mockProps.onAssigned).toHaveBeenCalled();
    });
  });

  it("should assign selected teacher as homeroom teacher", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Öğretmen başarıyla eklendi" }),
      });

    render(<AssignTeacherForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Öğretmeni seç
    fireEvent.click(screen.getByText("John Doe"));

    // Sınıf öğretmeni olarak seç
    fireEvent.click(screen.getByLabelText("Sınıf Öğretmeni"));

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
        json: async () => mockTeachers,
      })
      .mockRejectedValueOnce(new Error("Assignment error"));

    render(<AssignTeacherForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Öğretmeni seç
    fireEvent.click(screen.getByText("John Doe"));

    // Branş öğretmeni olarak seç
    fireEvent.click(screen.getByLabelText("Branş Öğretmeni"));

    // Ekle butonuna tıkla
    fireEvent.click(screen.getByText("Ekle"));

    // Hata mesajının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("Öğretmen eklenemedi")).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(mockProps.onAssigned).not.toHaveBeenCalled();
  });

  it("should handle cancel", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeachers,
    });

    render(<AssignTeacherForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // İptal butonuna tıkla
    fireEvent.click(screen.getByText("İptal"));

    // onCancel fonksiyonunun çağrıldığını kontrol et
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
}); 