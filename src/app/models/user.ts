export interface User {
  nombre: String;
  apellidos: String;
  edad: Number;
  dni: String;
  cumpleanos: Date;
  colorFavorito: String;
  sexo: GenderOptions;
}
export enum GenderOptions {
  Hombre = 'hombre',
  Mujer = 'mujer',
  Otro = 'otro',
  NoEspecifica = 'No especificado',
}
