import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import RootLayout from '@/components/layout/RootLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { ProtectedRoute, RoleRoute } from '@/components/layout/guards';
import { Spinner } from '@/components/ui/misc';

const Landing = lazy(() => import('@/pages/public/Landing'));
const Login = lazy(() => import('@/pages/public/Login'));
const Register = lazy(() => import('@/pages/public/Register'));
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'));
const VerifyOtp = lazy(() => import('@/pages/public/VerifyOtp'));
const JobSearch = lazy(() => import('@/pages/public/JobSearch'));
const JobDetail = lazy(() => import('@/pages/public/JobDetail'));
const Companies = lazy(() => import('@/pages/public/Companies'));
const CompanyDetail = lazy(() => import('@/pages/public/CompanyDetail'));

const ProfileBuilder = lazy(() => import('@/pages/seeker/ProfileBuilder'));
const MyApplications = lazy(() => import('@/pages/seeker/MyApplications'));
const SavedJobs = lazy(() => import('@/pages/seeker/SavedJobs'));

const EmployerDashboard = lazy(() => import('@/pages/employer/EmployerDashboard'));
const EmployerCompany = lazy(() => import('@/pages/employer/EmployerCompany'));
const EmployerJobs = lazy(() => import('@/pages/employer/EmployerJobs'));
const PostJob = lazy(() => import('@/pages/employer/PostJob'));
const Applicants = lazy(() => import('@/pages/employer/Applicants'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminCompanies = lazy(() => import('@/pages/admin/AdminCompanies'));
const AdminJobs = lazy(() => import('@/pages/admin/AdminJobs'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'));

const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function Loader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

function RouteFallback({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route
                path="/"
                element={
                  <RouteFallback>
                    <Landing />
                  </RouteFallback>
                }
              />
              <Route
                path="/login"
                element={
                  <RouteFallback>
                    <Login />
                  </RouteFallback>
                }
              />
              <Route
                path="/register"
                element={
                  <RouteFallback>
                    <Register />
                  </RouteFallback>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <RouteFallback>
                    <ForgotPassword />
                  </RouteFallback>
                }
              />
              <Route
                path="/verify"
                element={
                  <RouteFallback>
                    <VerifyOtp />
                  </RouteFallback>
                }
              />
              <Route
                path="/jobs"
                element={
                  <RouteFallback>
                    <JobSearch />
                  </RouteFallback>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <RouteFallback>
                    <JobDetail />
                  </RouteFallback>
                }
              />
              <Route
                path="/companies"
                element={
                  <RouteFallback>
                    <Companies />
                  </RouteFallback>
                }
              />
              <Route
                path="/companies/:slug"
                element={
                  <RouteFallback>
                    <CompanyDetail />
                  </RouteFallback>
                }
              />

              <Route element={<ProtectedRoute />}>
                <Route
                  path="/applications"
                  element={
                    <RouteFallback>
                      <MyApplications />
                    </RouteFallback>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <RouteFallback>
                      <SavedJobs />
                    </RouteFallback>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RouteFallback>
                      <ProfileBuilder />
                    </RouteFallback>
                  }
                />
              </Route>

              <Route element={<RoleRoute role="EMPLOYER" />}>
                <Route
                  path="/employer"
                  element={
                    <RouteFallback>
                      <EmployerDashboard />
                    </RouteFallback>
                  }
                />
                <Route
                  path="/employer/company"
                  element={
                    <RouteFallback>
                      <EmployerCompany />
                    </RouteFallback>
                  }
                />
                <Route
                  path="/employer/jobs"
                  element={
                    <RouteFallback>
                      <EmployerJobs />
                    </RouteFallback>
                  }
                />
                <Route
                  path="/employer/jobs/new"
                  element={
                    <RouteFallback>
                      <PostJob />
                    </RouteFallback>
                  }
                />
                <Route
                  path="/employer/jobs/:id/edit"
                  element={
                    <RouteFallback>
                      <PostJob />
                    </RouteFallback>
                  }
                />
                <Route
                  path="/employer/jobs/:jobId/applicants"
                  element={
                    <RouteFallback>
                      <Applicants />
                    </RouteFallback>
                  }
                />
              </Route>

              <Route element={<RoleRoute role="ADMIN" />}>
                <Route element={<AdminLayout />}>
                  <Route
                    path="/admin"
                    element={
                      <RouteFallback>
                        <AdminDashboard />
                      </RouteFallback>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <RouteFallback>
                        <AdminUsers />
                      </RouteFallback>
                    }
                  />
                  <Route
                    path="/admin/companies"
                    element={
                      <RouteFallback>
                        <AdminCompanies />
                      </RouteFallback>
                    }
                  />
                  <Route
                    path="/admin/jobs"
                    element={
                      <RouteFallback>
                        <AdminJobs />
                      </RouteFallback>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <RouteFallback>
                        <AdminCategories />
                      </RouteFallback>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <RouteFallback>
                        <AdminReports />
                      </RouteFallback>
                    }
                  />
                </Route>
              </Route>

              <Route
                path="*"
                element={
                  <RouteFallback>
                    <NotFound />
                  </RouteFallback>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
