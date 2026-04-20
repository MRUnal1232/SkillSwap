import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatSocketProvider } from "@/context/ChatSocketContext";
import { ToastStack } from "@/components/ToastStack";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import Profile from "@/pages/Profile";
import BookSession from "@/pages/BookSession";
import MySlots from "@/pages/MySlots";
import MySessions from "@/pages/MySessions";
import Chat from "@/pages/Chat";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
        Loading…
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatSocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <Login />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuthed>
                  <Register />
                </RedirectIfAuthed>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/:mentorId"
              element={
                <ProtectedRoute>
                  <BookSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-slots"
              element={
                <ProtectedRoute>
                  <MySlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-sessions"
              element={
                <ProtectedRoute>
                  <MySessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastStack />
        </ChatSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
