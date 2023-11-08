const provinces = [
    'West-Vlaanderen' ,
    'Oost-Vlaanderen' ,
    'Antwerpen' ,
    'Vlaams-Brabant',
    'Limburg'
  ] as const;
  
  const europeanCountries = [
    "België",
    "Bulgarije",
    "Cyprus",
    "Denemarken",
    "Duitsland",
    "Estland",
    "Finland",
    "Frankrijk",
    "Griekenland",
    "Hongarije",
    "Ierland",
    "Italië",
    "Kroatië",
    "Letland",
    "Litouwen",
    "Luxemburg",
    "Malta",
    "Nederland",
    "Oostenrijk",
    "Polen",
    "Portugal",
    "Roemenië",
    "Slovenië",
    "Slowakije",
    "Spanje",
    "Tsjechië",
    "Zweden",
  ] as const;
  
  export type Province = typeof provinces[number];
  export type Country = typeof europeanCountries[number];

  export {
    provinces,
    europeanCountries,
  }