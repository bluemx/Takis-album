export interface Category {
  id: number;
  name: string;
  order: number;
}

export const categoriesDatabase: Category[] = [
  

  
  
  { id: 0, name: "Mascotas", order: 1 },
  { id: 1, name: "Jugadas", order: 2 },
  { id: 2, name: "Fans", order: 3 },
  { id: 3, name: "Murales", order: 6 },
  
  //{ id: 4, name: "Trofeos", order: 7 },
  //{ id: 5, name: "", order: 6 },
  /*
  { id: 6, name: "Países", order: 4 },
  { id: 7, name: "Mascotas", order: 5 },
  { id: 8, name: "Eliminatorias", order: 10 },
  { id: 9, name: "Trofeos", order: 7 },
  { id: 10, name: "Hechos históricos", order: 8 },
  { id: 11, name: "Murales urbanos", order: 9 },
  { id: 12, name: "Patrocinadores", order: 11 }
   */
];