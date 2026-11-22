export const environment = {
  production: true,
  /** Base da API. Em produção o nginx fará proxy de /api para o Spring Boot. */
  apiUrl: '/api',
  /** true = services usam os dados de core/mocks; false = chamam o backend via HttpClient. */
  useMock: true,
};
