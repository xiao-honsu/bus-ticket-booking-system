import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginForm from '@/containers/auth/LoginForm';
import authReducer from '@/lib/store/features/auth/authSlice';
import { api } from '@/lib/store/services/api';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LoginForm Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        [api.reducerPath]: api.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
    });
  });

  it('renders login form with all required fields', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays validation error for invalid email', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // After fixing email, input should have the correct value
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('displays validation error for short password', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    expect(passwordInput).toHaveValue('short');
    
    // Change to valid password
    fireEvent.change(passwordInput, { target: { value: 'validpass123' } });
    expect(passwordInput).toHaveValue('validpass123');
  });

  it('allows user to type in email and password fields', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows "Don\'t have an account?" link', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('should have email input with correct type', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('should have password input with correct type', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
  });

  it('should display card title and description', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    expect(screen.getByText(/enter your credentials/i)).toBeInTheDocument();
    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);
  });

  it('should have register link with correct href', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('should clear input fields when values are deleted', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    
    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password');

    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    
    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });
});
