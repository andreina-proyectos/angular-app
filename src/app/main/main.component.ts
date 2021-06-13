import { Component, OnInit } from '@angular/core'
import { GenderOptions, User } from '../models/user'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { catchError, retry } from 'rxjs/operators'
import { Observable, throwError } from 'rxjs'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  resetUser = (): User => {
    return {
      _id: '',
      nombre: '',
      apellidos: '',
      edad: null,
      dni: '',
      cumpleanos: new Date(),
      colorFavorito: '',
      sexo: null,
    }
  }

  user: User = this.resetUser()
  userList: User[] = []

  formAction = 'addUser'
  userPosition = 0
  errorList: String[] = []
  showErrorList: Boolean = false

  updateUser = (): void => {
    if (!this.isFormValid()) {
      return
    }

    if (this.formAction === 'addUser') {
      this.http.post<any>('http://localhost:5000/user', this.user).subscribe(
        (user) => {
          this.userList.push({ ...user.userData })
          this.user = this.resetUser()
          this.restartToInitialValues()
        },
        (error) => this.handleError(error),
      )
    } else if (this.formAction === 'updateUser') {
      // this.userList[this.userPosition] = this.user
      this.http
        .put<any>(`http://localhost:5000/user/${this.user._id}`, this.user)
        .subscribe(
          (userUpdated) => {
            this.userList[this.userPosition] = userUpdated.userData
            this.userList = [...this.userList]
            this.user = this.resetUser()
            this.restartToInitialValues()
          },
          (error) => this.handleError(error),
        )
    }
  }

  editUser = (index: number): void => {
    const selectedUser = this.userList[index]
    this.user = { ...selectedUser }
    this.formAction = 'updateUser'
    this.userPosition = index
  }

  removeUser = (index: number): void => {
    const selectedUser = this.userList[index]
    this.user = { ...selectedUser }
    this.userPosition = index

    this.http.delete(`http://localhost:5000/user/${this.user._id}`).subscribe(
      () => {
        console.log('Borrado ok')
        this.userList.splice(this.userPosition, 1)
        this.userList = [...this.userList]
        this.restartToInitialValues()
      },
      (error) => {
        console.error(error)
        alert('Error al borrar user')
      },
    )
  }

  restartToInitialValues = () => {
    this.user = this.resetUser()
    this.formAction = 'addUser'
    this.userPosition = null
    this.showErrorList = false
  }

  isFormValid = (): Boolean => {
    this.errorList = []
    this.showErrorList = false

    const {
      nombre,
      apellidos,
      edad,
      dni,
      cumpleanos,
      colorFavorito,
      sexo,
    } = this.user

    if (!nombre) {
      this.errorList.push('⚠ The field nombre must be present')
    }
    if (nombre && this.hasNumber(nombre)) {
      this.errorList.push(
        '⚠ The field nombre must not contains numeric elements',
      )
    }
    if (nombre && nombre.length <= 3) {
      this.errorList.push(
        '⚠ The field nombre must contains at least 3 characters',
      )
    }
    if (!apellidos) {
      this.errorList.push('⚠ The field apellidos must be present')
    }
    if (apellidos && this.hasNumber(apellidos)) {
      this.errorList.push(
        '⚠ The field apellidos must not contains numeric elements',
      )
    }
    if (apellidos && apellidos.length <= 3) {
      this.errorList.push(
        '⚠ The field apellidos must contains at least 3 characters',
      )
    }
    if (!edad) {
      this.errorList.push('⚠ The field edad must be present')
    }
    if (!dni) {
      this.errorList.push('⚠ The field dni must be present')
    }
    if (!cumpleanos) {
      this.errorList.push('⚠ The field cumpleanos must be present')
    }
    if (edad < 0 || edad > 125) {
      this.errorList.push('⚠ Your age must be greater than 0 and less than 125')
    }
    if (dni.length != 9) {
      this.errorList.push('⚠ Your DNI must have 9 characters')
    }

    if (!sexo) {
      this.errorList.push('⚠ Your gender must have a selected option')
    }
    console.log(sexo)

    if (this.errorList.length != 0) {
      this.showErrorList = true
      return false
    } else {
      return true
    }
  }

  hasNumber = (myString) => {
    return /\d+/.test(myString)
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error)
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`,
      )
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.')
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get(`http://localhost:5000/users`)
      .subscribe((usersData: User[]) => {
        this.userList = usersData
      })
  }
}
