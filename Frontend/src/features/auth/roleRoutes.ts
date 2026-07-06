const roleRoutes: Record<string, string> = {
  Administrador: '/admin',
  Funcionario: '/funcionario',
  Cajero: '/cajero'
};

export const getHomeRouteForRole = (role?: string) => {
  if (!role) return '/';
  return roleRoutes[role] ?? '/';
};
