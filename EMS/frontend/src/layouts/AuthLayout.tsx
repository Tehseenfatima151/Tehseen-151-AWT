import { Outlet } from 'react-router-dom';

// Passthrough layout for auth pages (they handle their own full-page design)
export default function AuthLayout() {
  return <Outlet />;
}
