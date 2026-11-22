export const environment = {
  production: false,
  /** Spring Boot rodando localmente. */
  apiUrl: 'http://localhost:8080/api',
  /** true = services usam os dados de core/mocks; false = chamam o backend via HttpClient. */
  useMock: true,
};
