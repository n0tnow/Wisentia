import dynamic from 'next/dynamic';

// SSR hatası almamak için dinamik olarak yüklenir
const LoginPage = dynamic(() => import('./LoginClient'), { ssr: false });

export default function Page() {
  return <LoginPage />;
}
