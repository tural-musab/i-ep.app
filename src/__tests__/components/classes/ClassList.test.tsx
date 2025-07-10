import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClassList } from "@/components/classes/ClassList";
import * as Sentry from "@sentry/nextjs";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  startSpan: jest.fn((_, fn) => fn()),
  captureException: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("ClassList Component", () => {
  const mockClasses = [
    {
      id: "123",
      name: "6-A",
      grade_level: 6,
      capacity: 30,
      academic_year: "2023-2024",
      is_active: true,
      homeroom_teacher: {
        id: "teacher-1",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      },
      student_count: 25,
      teacher_count: 3,
    },
    {
      id: "456",
      name: "7-B",
      grade_level: 7,
      capacity: 25,
      academic_year: "2023-2024",
      is_active: true,
      homeroom_teacher: null,
      student_count: 20,
      teacher_count: 2,
    },
  ];

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("should render class list", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClasses,
    });

    render(<ClassList />);

    // Yükleme durumunu kontrol et
    expect(screen.getByText("Sınıflar yükleniyor...")).toBeInTheDocument();

    // Sınıf listesinin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
      expect(screen.getByText("7-B")).toBeInTheDocument();
    });

    // Sınıf detaylarını kontrol et
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("25/30")).toBeInTheDocument(); // Öğrenci sayısı/kapasite
  });

  it("should handle API error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    render(<ClassList />);

    await waitFor(() => {
      expect(screen.getByText("Sınıf listesi alınamadı")).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("should open new class dialog", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClasses,
    });

    render(<ClassList />);

    // Yeni Sınıf butonuna tıkla
    fireEvent.click(screen.getByText("Yeni Sınıf"));

    // Dialog'un açıldığını kontrol et
    expect(screen.getByText("Yeni Sınıf Oluştur")).toBeInTheDocument();
  });

  it("should filter classes by name", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClasses,
    });

    render(<ClassList />);

    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
    });

    // Arama kutusuna "7-B" yaz
    fireEvent.change(screen.getByPlaceholderText("Sınıf ara..."), {
      target: { value: "7-B" },
    });

    // Sadece "7-B" sınıfının görünür olduğunu kontrol et
    expect(screen.queryByText("6-A")).not.toBeInTheDocument();
    expect(screen.getByText("7-B")).toBeInTheDocument();
  });

  it("should filter classes by grade level", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClasses,
    });

    render(<ClassList />);

    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
    });

    // 7. sınıfları seç
    fireEvent.change(screen.getByLabelText("Sınıf Seviyesi"), {
      target: { value: "7" },
    });

    // Sadece 7. sınıfların görünür olduğunu kontrol et
    expect(screen.queryByText("6-A")).not.toBeInTheDocument();
    expect(screen.getByText("7-B")).toBeInTheDocument();
  });

  it("should sort classes by name", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClasses,
    });

    render(<ClassList />);

    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
    });

    // Sıralama butonuna tıkla
    fireEvent.click(screen.getByText("Sınıf Adı"));

    // Sıralama yönünü kontrol et
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("7-B"); // İlk satır başlık satırı
    expect(rows[2]).toHaveTextContent("6-A");
  });
}); 