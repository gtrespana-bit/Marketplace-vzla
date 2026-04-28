'use client'

// ============================================================
// Categorías, tipos y subtipos — pensados como busca un comprador
// ============================================================

export interface CatConfig {
  icon: string
  tipos: string[]
  marcasPorTipo: Record<string, string[]>
  camposEspeciales: Record<string, { label: string; type: string; placeholder: string; options?: string[] }[]>
}

export const categoriasConfig: Record<string, CatConfig> = {
  vehiculos: {
    icon: '🚗',
    tipos: ['Carros', 'Camionetas/SUV', 'Motos', 'Camiones', 'Furgonetas', 'Autobuses', 'Repuestos y Accesorios'],
    marcasPorTipo: {
      'Carros': ['Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Mazda', 'Renault', 'Peugeot', 'Suzuki', 'Volkswagen', 'Audi', 'Seat', 'Fiat', 'Skoda'],
      'Camionetas/SUV': ['Toyota', 'Ford', 'Chevrolet', 'Jeep', 'Nissan', 'Hyundai', 'Kia', 'Mitsubishi', 'Honda', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Mazda', 'Land Rover', 'Great Wall'],
      'Motos': ['Yamaha', 'Bera', 'Empire', 'Venom', 'Honda', 'Suzuki', 'Bajaj', 'Keeway', 'Haolue', 'Italika', 'Vento', 'KTM', 'Hero', 'Zongshen', 'Benelli'],
      'Camiones': ['Chevrolet', 'Ford', 'Toyota', 'Hino', 'Isuzu', 'International', 'Freightliner', 'Hyundai', 'Mitsubishi', 'Foton'],
      'Furgonetas': ['Ford', 'Chevrolet', 'Dodge', 'Volkswagen', 'Renault', 'Iveco', 'Hyundai', 'Foton'],
      'Autobuses': ['Yutong', 'King Long', 'Volkswagen', 'Chevrolet', 'Ford', 'International'],
      'Repuestos y Accesorios': ['OEM', 'Genérico'],
    },
    camposEspeciales: {
      'Carros': [
        { label: 'Año', type: 'select', placeholder: 'Selecciona...', options: [] },
        { label: 'Kilometraje (km)', type: 'number', placeholder: 'Ej: 45000' },
        { label: 'Transmisión', type: 'select', placeholder: 'Selecciona...', options: ['Automática', 'Manual', 'CVT', 'Semi-automática'] },
        { label: 'Combustible', type: 'select', placeholder: 'Selecciona...', options: ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido', 'GPL'] },
        { label: 'Color', type: 'text', placeholder: 'Ej: Blanco' },
      ],
      'Camionetas/SUV': [
        { label: 'Año', type: 'select', placeholder: 'Selecciona...', options: [] },
        { label: 'Kilometraje (km)', type: 'number', placeholder: 'Ej: 60000' },
        { label: 'Tracción', type: 'select', placeholder: 'Selecciona...', options: ['4x2', '4x4', 'AWD'] },
        { label: 'Transmisión', type: 'select', placeholder: 'Selecciona...', options: ['Automática', 'Manual'] },
        { label: 'Motor', type: 'text', placeholder: 'Ej: 2.7L V6' },
        { label: 'Color', type: 'text', placeholder: 'Ej: Negro' },
      ],
      'Motos': [
        { label: 'Año', type: 'select', placeholder: 'Selecciona...', options: [] },
        { label: 'Cilindraje', type: 'select', placeholder: 'Selecciona...', options: ['50cc', '110cc', '125cc', '150cc', '200cc', '250cc', '300cc', '400cc+', 'Eléctrica'] },
        { label: 'Tipo de moto', type: 'select', placeholder: 'Selecciona...', options: ['Calletera', 'Deportiva', 'Cross/Enduro', 'Scooter', 'Cuatrimoto', 'Triciclo', 'De trabajo'] },
        { label: 'Color', type: 'text', placeholder: 'Ej: Rojo' },
      ],
      'Camiones': [
        { label: 'Año', type: 'select', placeholder: 'Selecciona...', options: [] },
        { label: 'Capacidad de carga (ton)', type: 'number', placeholder: 'Ej: 5' },
        { label: 'Tipo', type: 'select', placeholder: 'Selecciona...', options: ['Furgón', 'Plataforma', 'Volteo', 'Cisterna', 'Grúa', 'Refrigerado'] },
      ],
      'Furgonetas': [
        { label: 'Año', type: 'select', placeholder: 'Selecciona...', options: [] },
        { label: 'Capacidad (m³)', type: 'text', placeholder: 'Ej: 10' },
        { label: 'Color', type: 'text', placeholder: 'Ej: Blanco' },
      ],
      'Autobuses': [
        { label: 'Año', type: 'select', placeholder: 'Selecciona...', options: [] },
        { label: 'Pasajeros', type: 'number', placeholder: 'Ej: 40' },
      ],
      'Repuestos y Accesorios': [
        { label: 'Compatible con marca/modelo', type: 'text', placeholder: 'Ej: Toyota Corolla 2015' },
      ],
    },
  },
  tecnologia: {
    icon: '💻',
    tipos: ['Celulares', 'Laptops', 'Tablets', 'PC de Escritorio', 'Consolas', 'Monitores', 'Accesorios', 'Audio', 'Cámaras', 'Redes e Internet', 'Impresoras', 'Smartwatches'],
    marcasPorTipo: {
      'Celulares': ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Motorola', 'LG', 'Sony', 'Oppo', 'Realme', 'OnePlus', 'Nokia', 'ZTE', 'Infinix', 'Tecno', 'Google Pixel', 'TCL'],
      'Laptops': ['Apple', 'HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'Microsoft', 'MSI', 'Razer', 'Samsung', 'Huawei', 'Toshiba'],
      'Tablets': ['Apple', 'Samsung', 'Huawei', 'Lenovo', 'Xiaomi', 'Amazon', 'Teclast', 'Alcatel'],
      'PC de Escritorio': ['Apple', 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Armado'],
      'Consolas': ['PlayStation', 'Xbox', 'Nintendo', 'Steam Deck'],
      'Monitores': ['Samsung', 'LG', 'AOC', 'Asus', 'Dell', 'BenQ', 'MSI', 'Gigabyte', 'HP'],
      'Accesorios': ['Logitech', 'Razer', 'Corsair', 'HyperX', 'SteelSeries', 'Anker', 'Xiaomi'],
      'Audio': ['JBL', 'Bose', 'Sony', 'Samsung', 'Apple', 'Xiaomi', 'Anker', 'Skullcandy'],
      'Cámaras': ['Canon', 'Nikon', 'Sony', 'GoPro', 'DJI', 'Fujifilm', 'Panasonic'],
      'Redes e Internet': ['TP-Link', 'Netgear', 'Mercusys', 'D-Link', 'Huawei', 'Tenda'],
      'Impresoras': ['HP', 'Epson', 'Canon', 'Brother', 'Xerox'],
      'Smartwatches': ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Garmin', 'Amazfit'],
    },
    camposEspeciales: {
      'Celulares': [
        { label: 'Modelo', type: 'text', placeholder: 'Ej: iPhone 15 Pro Max' },
        { label: 'Almacenamiento', type: 'select', placeholder: 'Selecciona...', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
        { label: 'RAM', type: 'select', placeholder: 'Selecciona...', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] },
        { label: 'Color', type: 'text', placeholder: 'Ej: Space Black' },
      ],
      'Laptops': [
        { label: 'Modelo', type: 'text', placeholder: 'Ej: MacBook Air M2' },
        { label: 'Procesador', type: 'text', placeholder: 'Ej: Apple M2, Intel i7...' },
        { label: 'RAM', type: 'select', placeholder: 'Selecciona...', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
        { label: 'Almacenamiento', type: 'select', placeholder: 'Selecciona...', options: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '1TB+'] },
        { label: 'Uso', type: 'select', placeholder: 'Selecciona...', options: ['Gaming', 'Diseño', 'Oficina', 'Estudiante', 'Programación'] },
      ],
      'Tablets': [
        { label: 'Modelo', type: 'text', placeholder: 'Ej: iPad Air 5' },
        { label: 'Almacenamiento', type: 'select', placeholder: 'Selecciona...', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
      ],
      'PC de Escritorio': [
        { label: 'Procesador', type: 'text', placeholder: 'Ej: Intel i5-12400, Ryzen 5 5600X' },
        { label: 'RAM', type: 'select', placeholder: 'Selecciona...', options: ['8GB', '16GB', '32GB', '64GB'] },
        { label: 'GPU', type: 'text', placeholder: 'Ej: RTX 3060, RX 6600...' },
        { label: 'Almacenamiento', type: 'text', placeholder: 'Ej: 512GB SSD + 1TB HDD' },
      ],
      'Consolas': [
        { label: 'Modelo', type: 'select', placeholder: 'Selecciona...', options: ['PS5', 'PS5 Digital', 'PS4', 'PS4 Pro', 'Xbox Series X', 'Xbox Series S', 'Xbox One', 'Nintendo Switch', 'Switch OLED', 'Steam Deck'] },
        { label: 'Almacenamiento', type: 'select', placeholder: 'Selecciona...', options: ['256GB', '512GB', '1TB', '2TB'] },
      ],
      'Audio': [
        { label: 'Tipo', type: 'select', placeholder: 'Selecciona...', options: ['Audífonos', 'Audífonos Bluetooth', 'Bocina', 'Barra de sonido', 'Parlantes', 'Micrófono', 'Amplificador'] },
      ],
      'default': [
        { label: 'Modelo', type: 'text', placeholder: 'Ej: modelo...' },
      ],
    },
  },
  moda: {
    icon: '👗',
    tipos: ['Ropa Hombre', 'Ropa Mujer', 'Calzado Hombre', 'Calzado Mujer', 'Calzado Niños', 'Relojes', 'Accesorios', 'Bolsos y Mochilas', 'Ropa Niños', 'Joyería'],
    marcasPorTipo: {
      'Ropa Hombre': ['Zara', 'H&M', 'Nike', 'Adidas', 'Calvin Klein', 'Tommy Hilfiger', 'Levi\'s', 'Ralph Lauren', 'Puma', 'Under Armour', 'Lacoste', 'The North Face', 'Gucci'],
      'Ropa Mujer': ['Zara', 'H&M', 'Mango', 'Shein', 'Nike', 'Adidas', 'Calvin Klein', 'Victoria\'s Secret', 'Guess', 'Bershka', 'Pull&Bear', 'Massimo Dutti'],
      'Calzado Hombre': ['Nike', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans', 'Nike Jordan', 'Timberland', 'Skechers', 'Clarks', 'Reebok'],
      'Calzado Mujer': ['Nike', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Vans', 'Steve Madden', 'Zara', 'Skechers', 'Birkenstock'],
      'Relojes': ['Casio', 'Citizen', 'Seiko', 'Rolex', 'Omega', 'Tag Heuer', 'Michael Kors', 'Fossil', 'G-Shock', 'Apple', 'Samsung', 'Garmin'],
      'Accesorios': ['Ray-Ban', 'Oakley', 'Gucci', 'Louis Vuitton', 'Coach'],
      'Bolsos y Mochilas': ['Nike', 'Adidas', 'Coach', 'Michael Kors', 'Kipling', 'JanSport', 'Vans', 'Zara'],
      'default': ['Genérico', 'Artesanal', 'Otra'],
    },
    camposEspeciales: {
      'default': [
        { label: 'Talla', type: 'select', placeholder: 'Selecciona...', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '34', '36', '38', '40', '42', '44'] },
        { label: 'Color', type: 'text', placeholder: 'Ej: Negro' },
      ],
    },
  },
  hogar: {
    icon: '🏠',
    tipos: ['Muebles', 'Electrodomésticos', 'Decoración', 'Jardín', 'Cocina', 'Baño', 'Iluminación', 'Electrónica del Hogar', 'Lencería de Cama'],
    marcasPorTipo: {
      'Muebles': ['IKEA', 'Genérico', 'Artesanal', 'A medida'],
      'Electrodomésticos': ['Samsung', 'LG', 'Mabe', 'Daewoo', 'Whirlpool', 'Indurama', ' Oster', 'Philips', 'Electrolux', 'Bosch', 'Taurus'],
      'Cocina': ['Tramontina', 'Oster', 'Philips', 'T-fal', 'Artesanal'],
      'Iluminación': ['Philips', 'IKEA', 'Genérica', 'LED', 'Sylvania'],
      'default': ['Genérico', 'Artesanal', 'Otra'],
    },
    camposEspeciales: {
      'Muebles': [
        { label: 'Tipo', type: 'select', placeholder: 'Selecciona...', options: ['Sofá', 'Mesa', 'Silla', 'Cama', 'Cómoda', 'Estante', 'Escritorio', 'Closet', 'Repisa', 'Otro'] },
        { label: 'Dimensiones (cm)', type: 'text', placeholder: 'Ej: 180x90x60' },
        { label: 'Material', type: 'text', placeholder: 'Ej: Madera, tela, cuero...' },
      ],
      'Electrodomésticos': [
        { label: 'Tipo', type: 'select', placeholder: 'Selecciona...', options: ['Lavadora', 'Secadora', 'Nevera', 'Cocina', 'Horno', 'Microondas', 'Aire acondicionado', 'Ventilador', 'Licuadora', 'Aspiradora'] },
        { label: 'Capacidad', type: 'text', placeholder: 'Ej: 18kg, 400L...' },
      ],
      'default': [
        { label: 'Dimensiones', type: 'text', placeholder: 'Ej: 30x20 cm' },
      ],
    },
  },
  herramientas: {
    icon: '🔧',
    tipos: ['Herramientas Manuales', 'Herramientas Eléctricas', 'Equipos de Construcción', 'Herramientas de Jardín'],
    marcasPorTipo: {
      'Herramientas Manuales': ['Stanley', 'Truper', 'Black+Decker', 'DeWalt', 'Bosch', 'Makita', 'Craftsman', 'Vorel'],
      'Herramientas Eléctricas': ['DeWalt', 'Makita', 'Bosch', 'Milwaukee', 'Black+Decker', 'Hitachi', 'Metabo', 'Festool'],
      'Equipos de Construcción': ['DeWalt', 'Bosch', 'Makita', 'Hilti', 'Genérico'],
      'Herramientas de Jardín': ['Stihl', 'Husqvarna', 'Truper', 'Black+Decker', 'Bosch'],
    },
    camposEspeciales: {
      'Herramientas Eléctricas': [
        { label: 'Voltaje', type: 'text', placeholder: 'Ej: 18V, 110V, 220V' },
        { label: 'Potencia', type: 'text', placeholder: 'Ej: 1500W, 2HP...' },
        { label: 'Tipo', type: 'text', placeholder: 'Ej: Taladro, sierra, amoladora...' },
      ],
      'default': [
        { label: 'Tipo específico', type: 'text', placeholder: 'Ej: llave inglesa, sierra...' },
      ],
    },
  },
  otros: {
    icon: '📦',
    tipos: ['Deportes y Fitness', 'Música', 'Libros', 'Juguetes', 'Mascotas', 'Inmuebles', 'Servicios', 'Empleos', 'Vehículos Especializados', 'Coleccionables', 'Otro'],
    marcasPorTipo: {
      'Deportes y Fitness': ['Nike', 'Adidas', 'Under Armour', 'Puma', 'Reebok', 'Wilson', 'Spalding'],
      'Inmuebles': [],
      'Servicios': [],
      'Música': ['Yamaha', 'Fender', 'Gibson', 'Roland', 'Korg'],
      'default': [],
    },
    camposEspeciales: {
      'Inmuebles': [
        { label: 'Tipo', type: 'select', placeholder: 'Selecciona...', options: ['Apartamento', 'Casa', 'Local comercial', 'Terreno', 'Oficina', 'Galpón'] },
        { label: 'm²', type: 'number', placeholder: 'Ej: 120' },
        { label: 'Habitaciones', type: 'number', placeholder: 'Ej: 3' },
        { label: 'Baños', type: 'number', placeholder: 'Ej: 2' },
      ],
      'default': [],
    },
  },
}

// Generar años para el selector
export const anos = Array.from({ length: 30 }, (_, i) => String(2026 - i))

export const estadosProducto = ['Nuevo', 'Como nuevo', 'Bueno', 'Usado', 'Para repuestos']

export const estadosVenezuela = [
  'Distrito Capital', 'Miranda', 'Carabobo', 'Lara', 'Zulia',
  'Aragua', 'Anzoátegui', 'Bolívar', 'Mérida', 'Táchira',
  'Trujillo', 'Portuguesa', 'Barinas', 'Apure', 'Guárico',
  'Cojedes', 'Yaracuy', 'Sucre', 'Monagas', 'Nueva Esparta',
  'Amazonas', 'Delta Amacuro', 'Vargas',
]

export default categoriasConfig
