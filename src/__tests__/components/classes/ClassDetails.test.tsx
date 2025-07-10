import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClassDetails } from "@/components/classes/ClassDetails";
import * as Sentry from "@sentry/nextjs";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  startSpan: jest.fn((_, fn) => fn()),
  captureException: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("ClassDetails Component", () => {
  const mockClass = {
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
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("should render class details", async () => {
    render(<ClassDetails classId={mockClass.id} />);

    // Yükleme durumunu kontrol et
    expect(screen.getByText("Sınıf detayları yükleniyor...")).toBeInTheDocument();

    // API yanıtını simüle et
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClass,
    });

    // Detayların yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("25/30")).toBeInTheDocument();
    });
  });

  it("should handle API error", async () => {
    render(<ClassDetails classId={mockClass.id} />);

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    await waitFor(() => {
      expect(screen.getByText("Sınıf detayları alınamadı")).toBeInTheDocument();
    });

    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it("should open edit dialog", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClass,
    });

    render(<ClassDetails classId={mockClass.id} />);

    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
    });

    // Düzenle butonuna tıkla
    fireEvent.click(screen.getByText("Düzenle"));

    // Dialog'un açıldığını kontrol et
    expect(screen.getByText("Sınıf Düzenle")).toBeInTheDocument();

    // Form alanlarının doğru değerlerle doldurulduğunu kontrol et
    expect(screen.getByLabelText("Sınıf Adı")).toHaveValue("6-A");
    expect(screen.getByLabelText("Sınıf Seviyesi")).toHaveValue("6");
    expect(screen.getByLabelText("Kapasite")).toHaveValue("30");
  });

  it("should update class details", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockClass,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockClass,
          name: "6-B",
          capacity: 35,
        }),
      });

    render(<ClassDetails classId={mockClass.id} />);

    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
    });

    // Düzenle butonuna tıkla
    fireEvent.click(screen.getByText("Düzenle"));

    // Form alanlarını güncelle
    fireEvent.change(screen.getByLabelText("Sınıf Adı"), {
      target: { value: "6-B" },
    });
    fireEvent.change(screen.getByLabelText("Kapasite"), {
      target: { value: "35" },
    });

    // Kaydet butonuna tıkla
    fireEvent.click(screen.getByText("Kaydet"));

    // Güncellenen değerlerin görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("6-B")).toBeInTheDocument();
      expect(screen.getByText("35/35")).toBeInTheDocument();
    });
  });

  it("should handle validation errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClass,
    });

    render(<ClassDetails classId={mockClass.id} />);

    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
    });

    // Düzenle butonuna tıkla
    fireEvent.click(screen.getByText("Düzenle"));

    // Geçersiz değerler gir
    fireEvent.change(screen.getByLabelText("Sınıf Adı"), {
      target: { value: "" }, // Boş isim
    });
    fireEvent.change(screen.getByLabelText("Kapasite"), {
      target: { value: "0" }, // Geçersiz kapasite
    });

    // Kaydet butonuna tıkla
    fireEvent.click(screen.getByText("Kaydet"));

    // Hata mesajlarının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText("Sınıf adı gerekli")).toBeInTheDocument();
      expect(screen.getByText("Kapasite en az 1 olmalıdır")).toBeInTheDocument();
    });
  });

  it("should handle delete class", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockClass,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Sınıf başarıyla silindi" }),
      });

    const onDeleted = jest.fn();
    render(<ClassDetails classId={mockClass.id} onDeleted={onDeleted} />);

    await waitFor(() => {
      expect(screen.getByText("6-A")).toBeInTheDocument();
    });

    // Sil butonuna tıkla
    fireEvent.click(screen.getByText("Sil"));

    // Onay dialog'unun açıldığını kontrol et
    expect(screen.getByText("Sınıfı Sil")).toBeInTheDocument();
    expect(
      screen.getByText("Bu sınıfı silmek istediğinizden emin misiniz?")
    ).toBeInTheDocument();

    // Onayla butonuna tıkla
    fireEvent.click(screen.getByText("Onayla"));

    // onDeleted fonksiyonunun çağrıldığını kontrol et
    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalled();
    });
  });
}); 