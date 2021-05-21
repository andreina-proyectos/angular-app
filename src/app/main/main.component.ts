import { Component, OnInit } from '@angular/core';
import { GenderOptions, User } from '../models/user';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  cleanForm = (): User => {
    return {
      nombre: '',
      apellidos: '',
      edad: null,
      dni: '',
      cumpleanos: new Date(),
      colorFavorito: '',
      sexo: null,
    };
  };

  user: User = this.cleanForm();
  userList: Array<User> = [];

  formAction = 'addUser';
  userPosition = 0;
  errorList: String[] = [];
  showErrorList: Boolean = false;

  updateUser = (): void => {
    if (!this.isFormValid()) {
      return;
    }

    if (this.formAction === 'addUser') {
      this.userList.push(this.user);
      this.user = this.cleanForm();
    } else if (this.formAction === 'updateUser') {
      this.userList[this.userPosition] = this.user;
    }
    this.restartToInitialValues();
  };

  editUser = (index: number): void => {
    this.user = this.userList[index];
    this.formAction = 'updateUser';
    this.userPosition = index;
  };

  removeUser = (index: number): void => {
    this.userList.splice(index, 1);
  };

  restartToInitialValues = () => {
    this.user = this.cleanForm();
    this.formAction = 'addUser';
    this.userPosition = null;
    this.showErrorList = false;
  };

  isFormValid = (): Boolean => {
    this.errorList = [];
    this.showErrorList = false;

    const { nombre, apellidos, edad, dni, cumpleanos, colorFavorito, sexo } =
      this.user;

    if (!nombre) {
      this.errorList.push('⚠ The field nombre must be present');
    }
    if (!apellidos) {
      this.errorList.push('⚠ The field apellidos must be present');
    }
    if (!edad) {
      this.errorList.push('⚠ The field edad must be present');
    }
    if (!dni) {
      this.errorList.push('⚠ The field dni must be present');
    }
    if (!cumpleanos) {
      this.errorList.push('⚠ The field cumpleanos must be present');
    }
    if (edad < 0 || edad > 125) {
      this.errorList.push(
        '⚠ Your age must be greater than 0 and less than 125'
      );
    }
    if (dni.length != 9) {
      this.errorList.push('⚠ Your DNI must have 9 char');
    }

    if (!sexo) {
      this.errorList.push('⚠ Your gender must have a selected option');
    }
    console.log(sexo);

    if (this.errorList.length != 0) {
      this.showErrorList = true;
      return false;
    } else {
      return true;
    }
  };

  constructor() {}

  ngOnInit(): void {}
}
