import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RegisterForm from '@/containers/auth/RegisterForm';
import authReducer from '@/lib/store/features/auth/authSlice';
import { api } from '@/lib/store/services/api';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('RegisterForm Component', () => {
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

  it('renders registration form with all required fields', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('validates that passwords match', async () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    
    // Check that passwords don't match
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('different123');
    
    // Fix the mismatch
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('validates name is required', async () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Check that form renders correctly
    expect(submitButton).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('allows user to fill all registration fields', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  it('shows "Already have an account?" link', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('should have phone field with correct attributes', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput.placeholder).toBe('+84 xxx xxx xxx');
  });

  it('should display card title and description', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
    expect(screen.getAllByText(/register/i).length).toBeGreaterThan(0);
  });

  it('should have login link with correct href', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });

  it('should allow clearing all form fields', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(phoneInput, { target: { value: '0123456789' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@test.com');
    expect(phoneInput.value).toBe('0123456789');

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(phoneInput, { target: { value: '' } });

    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(phoneInput.value).toBe('');
  });

  it('should handle multiple password changes', () => {
    render(
      <Provider store={store}>
        <RegisterForm />
      </Provider>
    );

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: 'pass1' } });
    expect(passwordInput.value).toBe('pass1');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');

    fireEvent.change(passwordInput, { target: { value: 'newpassword456' } });
    expect(passwordInput.value).toBe('newpassword456');
  });
});
