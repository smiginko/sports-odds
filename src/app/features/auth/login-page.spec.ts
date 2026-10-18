import { TestBed } from '@angular/core/testing';
import { submit } from '@angular/forms/signals';
import { provideRouter, Router } from '@angular/router';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let page: LoginPage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    page = TestBed.createComponent(LoginPage).componentInstance;
  });

  it('rejects an invalid email and a weak password and saves nothing', async () => {
    page['model'].set({ email: 'abc', password: 'abc' });
    const form = page['loginForm'];
    const emailErrors = form.email().errors();
    const passwordErrors = form.password().errors();

    expect(emailErrors.map((error) => error.message)).toEqual(['Email nemá platný formát.']);
    expect(passwordErrors.map((error) => error.message)).toEqual([
      'Heslo musí mať aspoň 8 znakov.',
      'Heslo musí obsahovať veľké písmeno.',
      'Heslo musí obsahovať číslicu.',
    ]);
    expect(await submit(form)).toBe(false);
    expect(localStorage.length).toBe(0);
  });

  it('saves only the email and goes to /client when the form is valid', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    page['model'].set({ email: 'jan@firma.sk', password: 'Heslo123' });

    await submit(page['loginForm']);

    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem('email')).toBe('jan@firma.sk');
    expect(navigate).toHaveBeenCalledWith(['/client']);
  });
});
