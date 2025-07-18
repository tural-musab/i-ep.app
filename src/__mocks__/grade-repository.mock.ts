export const mockRepository = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByStudent: jest.fn(),
  findByClass: jest.fn(),
  generateReport: jest.fn(),
};

export const mockValidation = {
  safeParse: jest.fn(),
};
