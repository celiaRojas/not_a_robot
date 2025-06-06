import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterLink],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.scss'
})
export class InscriptionComponent implements OnInit {
  signinForm!: FormGroup
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  errorMessage: any = [];
  constructor(private fb: FormBuilder, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.createForm()
  }
  resetValueOnClik(controlName: string) {
    this.signinForm?.get(controlName)?.reset();
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  createForm() {
    this.signinForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.customPasswordValidator()]],
      confirmPassword: ['', [Validators.required, this.customPasswordIdenticalValidator()]],
    });
  }

  validateForm() {
    if (this.signinForm.valid) {
      const formData = this.getFormData();
      this.userService.signin(formData).subscribe(
        response => {
          console.log('signin  successfully:', response);
          this.router.navigate(['/login'])
        },
        error => {
          console.error('Error signin :', error);
        }
      );
    } else {
      this.getFormErrors(this.signinForm)
      console.log(this.errorMessage)
    }
  }

  getFormData() {
    return {
      firstname: this.signinForm.get('firstname')?.value,
      lastname: this.signinForm.get('lastname')?.value,
      password: this.signinForm.get('password')?.value,
      mail: this.signinForm.get('mail')?.value,
    };
  }

  customPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const errors: ValidationErrors = [];

      const hasUpperCase = /[A-Z]/.test(value);
      const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 8;

      if (!hasUpperCase) {
        errors['upperCase'] = true;
      }
      if (!hasSpecialCharacter) {
        errors['specialCharacter'] = true;
      }
      if (!hasMinLength) {
        errors['minLength'] = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  customPasswordIdenticalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const isPasswordIdentical = value === this.signinForm.get('password')?.value

      return !isPasswordIdentical ? { 'passwordNotIdentical': true } : null;
    };

  }

  getFormErrors(form: FormGroup) {
    this.errorMessage = []
    for (const controlName in form.controls) {
      const control = form.controls[controlName];
      if (control.invalid) {
        for (const errorName in control.errors) {
          this.errorMessage[controlName] = this.getErrorMessage(controlName, errorName);
        }
      }
    }
    return this.errorMessage;
  }

  getErrorMessage(controlName: string, errorName: string) {
    switch (errorName) {
      case 'required':
        return `Le champ est requis.`;
      case 'upperCase':
        return `Le mot de passe doit contenir au moins une majuscule`;
      case 'specialCharacter':
        return 'Le mot de passe doit contenir un caractère spécial';
      case 'passwordNotIdentical':
        return 'Les mots de passe ne sont pas identiques.';
      case 'minLength':
        return 'Le mot de passe doit contenir minimum 8 charactère.'
      default:
        return `Le champ ${controlName} est invalide.`;
    }
  }

}
