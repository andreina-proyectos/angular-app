;('use strict')
const { v4: uuidv4, validate } = require('uuid')
const moment = require('moment')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { Schema, model } = mongoose
const app = express()
const PORT = 5000

mongoose
  .connect('mongodb://localhost:27017/usersInfo', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true,
  })
  .then((res) => console.log('mongo connected!!'))

const UserSchema = new Schema({
  _id: { type: String },
  nombre: { type: String },
  apellidos: { type: String },
  edad: { type: String },
  dni: { type: String },
  cumpleanos: { type: String },
  colorFavorito: { type: String },
  sexo: { type: String },
})

const genderOptions = ['hombre', 'mujer', 'otro', 'No especificado']

const User = model('usersInfo', UserSchema)

app
  // CORS
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method',
    )
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, DELETE',
    )
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
    next()
  })
  .use(express.urlencoded({ extended: true }))
  .use(express.json())

app.get('/users', async (req, res) => {
  const userList = await User.find()
  res.json(userList)
})

app.post('/user', async (req, res) => {
  const newUser = new User(req.body)
  newUser._id = uuidv4()
  const errorList = validateUser(newUser)

  if (errorList.length > 0) {
    res.status(400).send({
      message:
        '⚠ There is an error about user information. Please read the error list and check it',
      errorList: errorList,
    })
  } else {
    await newUser.save()
    res.json({ message: 'New user created :)', userData: newUser })
  }
})

app.put('/user/:id', async (req, res) => {
  const paramId = req.params.id
  const updates = req.body
  const newUser = new User(req.body)
  const errorList = validateUser(newUser)
  console.log('newUser->', newUser)
  console.log('errorList->', errorList)

  if (!paramId) {
    res.status(400).send({
      message:
        '⚠ There is an error about user information to update. Id is null or undefined or empty',
      errorList: errorList,
    })
  }
  if (errorList.length > 0) {
    res.status(400).send({
      message:
        '⚠ There is an error about user information to update. Please read the error list and check it',
      errorList: errorList,
    })
  } else {
    User.findOneAndUpdate({ _id: paramId }, newUser, {
      useFindAndModify: true,
      new: false,
    })
      .then((updatedUser) => {
        res.status(200).send({
          message: `User with the id ${paramId} was updated! :)`,
          userData: newUser,
        })
      })
      .catch((err) => res.status(400).json('Error: ' + err))
  }
})

app.delete('/user/:id', async function (req, res) {
  const paramId = req.params.id
  await User.findByIdAndDelete(paramId)
  res.json({ message: `User with id ${paramId} deleted! :O` })
})

const onlyCharRgx = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/

function validateUser(newUser) {
  const errorList = []
  const {
    nombre,
    apellidos,
    edad,
    cumpleanos,
    dni,
    sexo,
    colorFavorito,
  } = newUser

  if (!nombre) {
    errorList.push(returnCommonError('nombre'))
  }
  if (nombre && nombre.length <= 3) {
    errorList.push(returnMoreThanThreeError('nombre'))
  }
  if (nombre && !onlyCharRgx.test(nombre)) {
    errorList.push('⚠ The field nombre must not contain numbers')
  }

  if (!apellidos) {
    errorList.push(returnCommonError('apellidos'))
  }
  if (apellidos && apellidos.length <= 3) {
    errorList.push(returnMoreThanThreeError('apellidos'))
  }
  if (apellidos && !onlyCharRgx.test(apellidos)) {
    console.log('error en el objeto apellidos:', apellidos)
    errorList.push('⚠ The field apellidos must not contain numbers')
  }

  if (!edad) {
    errorList.push(returnCommonError('edad'))
  }
  if (!dni) {
    errorList.push(returnCommonError('dni'))
  }
  if (!cumpleanos) {
    errorList.push(returnCommonError('cumpleanos'))
  }

  if (cumpleanos && !moment(cumpleanos, 'YYYY-M-D', true).isValid()) {
    errorList.push(
      '⚠ The field cumpleanos must have the ISO 8601 format. For example: YYYY-M-D',
    )
  }

  if (edad < 0 || edad > 125) {
    errorList.push('⚠ Your age must be greater than 0 and less than 125')
  }
  if (dni.length != 9) {
    errorList.push('⚠ Your DNI must have 9 char')
  }
  if (!colorFavorito) {
    errorList.push(returnCommonError('colorFavorito'))
  }
  if (colorFavorito && colorFavorito.length <= 3) {
    errorList.push(returnMoreThanThreeError('colorFavorito'))
  }
  if (colorFavorito && !onlyCharRgx.test(colorFavorito)) {
    errorList.push('⚠ The field apellidos must not contain numbers')
  }

  if (!sexo) {
    errorList.push('⚠ Your gender must have a selected option')
  }

  if (
    sexo &&
    genderOptions.filter(
      (gender) => gender.toUpperCase() === sexo.toUpperCase(),
    ).length == 0
  ) {
    errorList.push(
      '⚠ Your gender must be: hombre, mujer, otro, No especificado',
    )
  }

  return errorList
}

function returnCommonError(field) {
  return `⚠ The field ${field} must be present`
}

function returnMoreThanThreeError(field) {
  return `⚠ The field ${field} must have more than 3 characters`
}

app.listen(PORT, (req, res) => {
  console.log('API is working :)!')
})
