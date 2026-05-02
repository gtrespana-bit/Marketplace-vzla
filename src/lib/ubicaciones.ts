// Todos los estados y ciudades de Venezuela — orden alfabético
// Fuente: compartido entre registro, filtros de búsqueda y catálogo

export const ESTADOS = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Distrito Capital',
  'Falcón',
  'Guárico',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'Vargas',
  'Yaracuy',
  'Zulia',
]

export const CIUDADES_POR_ESTADO: Record<string, string[]> = {
  'Amazonas': ['Puerto Ayacucho'],
  'Anzoátegui': ['Anaco', 'Aragua de Barcelona', 'Barcelona', 'Boca de Uchire', 'Cantaura', 'Clarines', 'El Chaparro', 'El Pao', 'El Tigre', 'El Tigrito', 'Guanape', 'Guanta', 'Lechería', 'Onoto', 'Pariaguán', 'Píritu', 'Puerto La Cruz', 'Puerto Píritu', 'Sabana de Uchire', 'San Mateo', 'San Pablo', 'San Tomé', 'Santa Ana', 'Santa Fe', 'Santa Rosa', 'Soledad', 'Urica'],
  'Apure': ['Achaguas', 'Biruaca', 'Bruzual', 'El Amparo', 'El Nula', 'Elorza', 'Guasdualito', 'Mantecal', 'Puerto Páez', 'San Fernando de Apure', 'San Juan de Payara'],
  'Aragua': ['Cagua', 'Camatagua', 'Choroní', 'El Consejo', 'La Victoria', 'Las Tejerías', 'Magdaleno', 'Maracay', 'Ocumare de la Costa', 'Palo Negro', 'San Casimiro', 'San Mateo', 'San Sebastián', 'Tovar', 'Turmero', 'Villa de Cura', 'Zuata'],
  'Barinas': ['Barinas', 'Barinitas', 'Barrancas', 'Calderas', 'Capitanejo', 'Ciudad Bolivia', 'El Cantón', 'Las Veguitas', 'Libertad', 'Sabaneta', 'Santa Bárbara', 'Socopó'],
  'Bolívar': ['Caicara del Orinoco', ' Ciudad Bolívar', 'Ciudad Guayana', 'Ciudad Piar', 'El Callao', 'El Dorado', 'El Manteco', 'El Palmar', 'El Pao', 'Guri', 'Guasipati', 'Icabarú', 'La Paragua', 'Santa Elena de Uairén', 'Tumeremo', 'Upata'],
  'Carabobo': ['Bejuma', 'Belén', 'Campo de Carabobo', 'Canoabo', 'Central Tacarigua', 'Chirgua', 'Ciudad Alianza', 'El Palito', 'Guacara', 'Las Trincheras', 'Los Guayos', 'Mariara', 'Miranda', 'Montalbán', 'Morón', 'Naguanagua', 'Puerto Cabello', 'San Joaquín', 'Tacarigua', 'Tocuyito', 'Urama', 'Valencia'],
  'Cojedes': ['Anzoátegui', 'Apartaderos', 'Arismendi', 'Camuriquito', 'El Baúl', 'El Limón', 'El Pao', 'El Socorro', 'La Aguadita', 'Las Vegas', 'Libertad de Cojedes', 'Macapo', 'Tinaco', 'Tinaquillo', 'Vallecito'],
  'Delta Amacuro': ['Curiapo', 'Imataca', 'Pedernales', 'San José', 'Tucupita'],
  'Distrito Capital': ['Caracas'],
  'Falcón': ['Adícora', 'Baraived', 'Boconó Falcón', 'Boca del Pozo', 'Capadare', 'Capatárida', 'Chichiriviche', 'Churuguara', 'Coro', 'Cumarebo', 'Dabajuro', 'Judibana', 'La Cruz', 'La Vela de Coro', 'Los Taques', 'Maparari', 'Mirimire', 'Mene de Mauroa', 'Pedregal', 'Pueblo Nuevo Falcón', 'Punta Cardón', 'Píritu Falcón', 'San Juan de los Cayos', 'Santa Ana Falcón', 'Tucacas'],
  'Guárico': ['Altagracia de Orituco', 'Cabruta', 'Calabozo', 'Camaguán', 'Chaguaramas', 'El Sombrero', 'Las Mercedes', 'Lezama', 'Onoto', 'Ortíz', 'San José de Guaribe', 'San Juan de los Morros', 'San Rafael de Laya', 'Santa María de Ipire', 'Tucupido', 'Valle de la Pascua', 'Zaraza'],
  'Lara': ['Aguada Grande', 'Atarigua', 'Barquisimeto', 'Bobare', 'Cabudare', 'Carora', 'Cubiro', 'Cují', 'Duaca', 'El Manzano', 'El Tocuyo', 'Guaríco Lara', 'Humocaro Alto', 'Humocaro Bajo', 'La Miel', 'Morán', 'Quíbor', 'Río Claro', 'Sanare', 'Santa Inés', 'Sarare', 'Siquisique', 'Tintorero'],
  'Mérida': ['Apartaderos', 'Arapuey', 'Bailadores', 'Caja Seca', 'Canaguá', 'Chachopo', 'Ejido', 'El Vigía', 'La Azulita', 'La Playa', 'Lagunillas', 'Mérida', 'Mesa de Bolívar', 'Mucuchíes', 'Mucujepe', 'Mucurubá', 'Nueva Bolivia', 'Pueblo Nuevo Mérida', 'Sabana de Mendoza', 'Santa Cruz de Mora', 'Santa Elena de Arenales', 'Santo Domingo', 'Tabay', 'Timotes', 'Tovar', 'Tucaní', 'Zea'],
  'Miranda': ['Aragüita', 'Carrizal', 'Caucagüita', 'Chaguaramas Miranda', 'Charallave', 'Chirimire', 'Cúa', 'Cupira', 'El Guapo', 'El Jarillo', 'Filas de Mariche', 'Guarenas', 'Guatire', 'Higuerote', 'Los Anaucos', 'Los Teques', 'Ocumare del Tuy', 'Panamericano', 'Paracotos', 'Petare', 'Río Chico', 'San Antonio de los Altos', 'San Diego', 'San Fernando del Guapo', 'San Francisco de Yare', 'San José de los Altos', 'San José de Río Chico', 'Santa Lucía', 'Santa Teresa del Tuy', 'Tacarigua de la Laguna', 'Tacarigua de Mamporal', 'Turumo'],
  'Monagas': ['Aguasay', 'Aragua de Maturín', 'Barrancas del Orinoco', 'Caicara de Maturín', 'Caripito', 'Chaguaramas Monagas', 'Chaguaramal', 'El Furrial', 'El Tejero', 'Jusepín', 'La Toscana', 'Maturín', 'Miraflores', 'Punta de Mata', 'Quiriquire', 'San Antonio de Maturín', 'San Vicente', 'Santa Cruz de Maturín', 'Temblador', 'Tos de Tejerías', 'Uverito', 'Uracoa'],
  'Nueva Esparta': ['Altagracia', 'Boca de Pozo', 'Boca de Río', 'El Espinal', 'El Valle', 'El Yaque', 'Juan Griego', 'La Asunción', 'La Guardia', 'Pedro González', 'Pampatar', 'Porlamar', 'Punta de Piedras', 'San Francisco', 'San Juan Bautista', 'San Pedro de Coche', 'Villa Rosa'],
  'Portuguesa': ['Agua Blanca', 'Araure', 'Biscucuy', 'Boconoíto', 'Chabasquén', 'Guanare', 'Guanarito', 'La Aparición', 'La Misión', 'Mesa de Cavacas', 'Ospino', 'Papelón', 'Payara', 'Píritu de Portuguesa', 'San Rafael de Onoto', 'Santa Rosalía', 'Turén'],
  'Sucre': ['Araya', 'Cariaco', 'Carúpano', 'Casanay', 'Cumaná', 'Cumanacoa', 'El Morro', 'El Pao Sucre', 'El Pilar', 'Guaca', 'Güiria', 'Irapa', 'Manicuare', 'Mariguita', 'Río Caribe', 'San Antonio del Golfo', 'San Vicente Sucre', 'Santa Fe Sucre', 'Tunapuy', 'Unare Sucre', 'Yaguaraparo', 'Yoco'],
  'Táchira': ['Abejales', 'Borota', 'Bramón', 'Capacho', 'Colón', 'Coloncito', 'Cordero', 'El Cobre', 'El Pinal', 'Independencia', 'La Fría', 'La Grita', 'La Tendida', 'Lobatera', 'Michelena', 'Palmira', 'Pregonero', 'Queniquea', 'Rubio', 'San Antonio del Táchira', 'San Cristóbal', 'San José de Bolívar', 'San José del Valle', 'San Pedro del Río', 'Santa Ana del Táchira', 'Seboruco', 'Táriba', 'Ureña'],
  'Trujillo': ['Batatal', 'Betijoque', 'Boconó', 'Carache', 'Chejendé', 'Chiquinquirá', 'El Dividive', 'El Jagüito', 'Escuque', 'Isnotú', 'Jajó', 'La Concepción', 'La Mesa de Esnujaque', 'La Puerta', 'La Quebrada', 'Mendoza', 'Meseta de Chimpire', 'Monay', 'Motatán', 'Pampán', 'Pampanito', 'Sabana de Mendoza', 'San Lázaro', 'Santa Ana Trujillo', 'Tostós', 'Trujillo', 'Valera'],
  'Vargas': ['Caraballeda', 'Carayaca', 'La Guaira', 'Macuto', 'Maiquetía', 'Naiguatá', 'Ostional', 'Urimare'],
  'Yaracuy': ['Aroa', 'Boraure', 'Campo Elías', 'Chivacoa', 'Cocorote', 'Farriar', 'Guama', 'Marín', 'Nirgua', 'Salom', 'San Felipe', 'San Pablo', 'Urachiche', 'Yaritagua'],
  'Zulia': ['Bachaquero', 'Bobures', 'Cabimas', 'Campo Concepción', 'Campo Mara', 'Campo Rojo', 'Carrasquero', 'Casigua', 'Colón Zulia', 'El Batey', 'El Carmelo', 'El Chivo', 'El Danto', 'El Guasare', 'El Mene', 'Encontrados', 'Gibraltar', 'Isla de Toas', 'La Concepción Zulia', 'La Paz Zulia', 'La Sierrita', 'Lagunillas', 'Machiques', 'Maracaibo', 'Palmarejo', 'Pueblo Nuevo Zulia', 'Puertos de Altagracia', 'Punta Gorda', 'San Francisco', 'San Rafael del Moján', 'Santa Bárbara del Zulia', 'Santa Cruz de Mara', 'Santa Cruz del Zulia', 'Santa Rita', 'Sinamaica', 'Tamare', 'Tía Juana', 'Villa del Rosario'],
}

export function getCiudades(estado: string): string[] {
  const c = CIUDADES_POR_ESTADO[estado] || []
  return [...c].sort((a, b) => a.localeCompare(b, 'es'))
}
