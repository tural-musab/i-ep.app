import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    mockProps.onSuccess.mockReset();
    mockProps.onCancel.mockReset();
  });

  it("should render teacher list and handle selection", async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeachers,
    });

    render(<AssignTeacherForm {...mockProps} />);

    // Yükleme durumunu kontrol et
    expect(screen.getByText("Öğretmenler yükleniyor...")).toBeInTheDocument();

    // Öğretmenlerin yüklendiğini bekle
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // Select'i tıkla ve öğretmen seç
    await user.click(screen.getByRole("combobox"));

    // Öğretmenleri kontrol et
    expect(screen.getByText("John Doe - john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith - jane@example.com")).toBeInTheDocument();

    // Öğretmen seç
    await user.click(screen.getByText("John Doe - john@example.com"));

    // Branş öğretmeni olarak seç
    await user.click(screen.getByLabelText("Branş Öğretmeni"));

    // API çağrısını ayarla
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Öğretmen başarıyla eklendi" }),
    });

    // Ekle butonuna tıkla
    await user.click(screen.getByText("Ekle"));

    // API çağrısının yapıldığını kontrol et
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/class-teachers/class-1",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            teacher_id: "teacher-1",
            role: "subject",
          }),
        })
      );
    });

    // onSuccess fonksiyonunun çağrıldığını kontrol et
    expect(mockProps.onSuccess).toHaveBeenCalled();
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
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeachers,
    });

    render(<AssignTeacherForm {...mockProps} />);

    // Öğretmenlerin yüklendiğini bekle
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // Arama kutusuna yaz
    await user.type(screen.getByPlaceholderText("Öğretmen ara..."), "Jane");

    // Select'i aç
    await user.click(screen.getByRole("combobox"));

    // Sadece filtrelenmiş öğretmenleri kontrol et
    expect(screen.queryByText("John Doe - john@example.com")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith - jane@example.com")).toBeInTheDocument();
  });

  it("should handle cancel", async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeachers,
    });

    render(<AssignTeacherForm {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // İptal butonuna tıkla
    await user.click(screen.getByText("İptal"));

    // onCancel fonksiyonunun çağrıldığını kontrol et
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
});