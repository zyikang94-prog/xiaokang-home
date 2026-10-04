import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import HomePage from '@/pages/HomePage/HomePage';
import IncomePage from '@/pages/IncomePage/IncomePage';
import ExpensePage from '@/pages/ExpensePage/ExpensePage';
import AssetsPage from '@/pages/AssetsPage/AssetsPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="income" element={<IncomePage />} />
        <Route path="expense" element={<ExpensePage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
