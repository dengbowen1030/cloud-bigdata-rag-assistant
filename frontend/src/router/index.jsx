import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import RouteFallback from "../components/RouteFallback";
import MainLayout from "../layouts/MainLayout";

const Upload = lazy(() => import("../pages/Upload"));
const KnowledgeBase = lazy(() => import("../pages/KnowledgeBase"));
const Chat = lazy(() => import("../pages/Chat"));
const Logs = lazy(() => import("../pages/Logs"));
const Dashboard = lazy(() => import("../pages/Dashboard"));

export default function AppRouter() {
  return (
    <MainLayout>
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </MainLayout>
  );
}
