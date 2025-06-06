import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  forgottenPasswordForm!: FormGroup
  hidePassword: boolean = true;
  isPasswordForgotten: boolean = false
  constructor(private fb: FormBuilder, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.createLoginForm()
    this.createForgottenPasswordForm()
  }
  resetValueOnClik(controlName: string) {
    this.loginForm?.get(controlName)?.reset();
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  createLoginForm() {
    this.loginForm = this.fb.group({
      mail: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  createForgottenPasswordForm() {
    this.forgottenPasswordForm = this.fb.group({
      mail: ['', [Validators.required]],
    })
  }

  validateLoginForm() {
    if (this.loginForm.valid) {
      const formData = this.getLoginFormData();
      this.userService.login(formData).subscribe(
        response => {
          console.log('Logged in successfully:', response);
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.router.navigate(['/inscription'])
        },
        error => {
          console.error('Error logging in:', error);
        }
      );
    }
  }

  getLoginFormData() {
    return {
      mail: this.loginForm.get('mail')?.value,
      password: this.loginForm.get('password')?.value,
    };
  }

  onClickChangeForgottenPassword() {
    this.isPasswordForgotten = !this.isPasswordForgotten
    this.createForgottenPasswordForm()
  }

  sendMailResetPassword() {
    const email = this.forgottenPasswordForm.get('mail')?.value
    console.log(email)
  }
}
