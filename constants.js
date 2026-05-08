export const ADMIN_EMAIL = 'jhon.aguirre@itspereira.edu.co';

export const mensajesExito = ["¡Excelente deducción!", "¡Felicidades!", "¡Muy bien hecho!", "¡Brillante!"];
export const mensajesFallo = ["No te desanimes.", "Revisa con calma.", "¡Intenta de nuevo!"];

export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Reemplaza con tu clave API de Gemini

export const COLLECTIVE_CHALLENGE_GOAL = 500; // Meta de retos superados por toda la escuela

export const JERARQUIA_GRADOS = {
  "6-7": { nivel: "Explorador", descripcion: "Introducción lúdica y bloques básicos." },
  "8-9": { nivel: "Constructor", descripcion: "Lógica algorítmica y sensores estándar." },
  "10-11": { nivel: "Ingeniero", descripcion: "Protocolos avanzados (I2C), registros y optimización." }
};

export const PERFILES_PIAR = {
  "ninguno": { nombre: "Estándar", ajustes: "Sin ajustes adicionales." },
  "cognitivo": { nombre: "Ajuste Cognitivo", ajustes: "Instrucciones simplificadas, retos de un solo paso, pistas automáticas." },
  "visual": { nombre: "Ajuste Visual", ajustes: "Interfaz de alto contraste, lectura de voz, tamaños de fuente aumentados." },
  "motriz": { nombre: "Ajuste Motriz", ajustes: "Atajos de teclado, autocompletado agresivo, clics simplificados." },
  "profundizacion": { nombre: "Profundización/Talento", ajustes: "Retos extra de optimización y manejo de memoria." }
};

export const ARDUINO_QUICK_COMMANDS = [
  "pinMode(", "digitalWrite(", "digitalRead(", "analogWrite(", "analogRead(", 
  "delay(", "if (", "else {", "void setup() {", "void loop() {", "HIGH", "LOW", "OUTPUT", "INPUT_PULLUP", "Serial.print("
];

export const competenciasMapa = {
  1: "Fundamentos de Electrónica y Pines Digitales", 2: "Lógica Condicional y Secuencias Temporales",
  3: "Lectura de Sensores y Entradas Digitales", 4: "Modulación por Ancho de Pulsos (PWM)",
  5: "Generación de Frecuencias y Sonido", 6: "Cálculo de Distancias con Ultrasonido",
  7: "Control de Actuadores y Servomotores", 8: "Lectura de Sensores Climáticos (DHT11)",
  9: "Comunicación I2C y Pantallas LCD", 10: "Integración de Sistemas (Proyecto Final)"
};

export const weeks = {
  // ESTRUCTURA: "P{Periodo}-W{Semana}"
  "P1-W1": {
    period: 1,
    week: 1,
    title: "Primer Contacto (LED)",
    introduccion: "Aprenderás cómo Arduino envía electricidad al mundo físico.",
    challenge: "Simula el código base. Luego supera los retos modificando el parpadeo.",
    components: ["Arduino UNO", "LED", "Resistor 220Ω"], 
    wiring: ["PIN 13 → Ánodo LED", "Cátodo LED → Resistencia → GND"], 
    code: `void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Señales Digitales", contenido: "Un pin digital en Arduino funciona como un interruptor electrónico. Solo puede estar en dos estados: HIGH (encendido, 5V) o LOW (apagado, 0V). Antes de usar un pin, debemos avisarle a Arduino si enviará energía (OUTPUT) o la recibirá (INPUT) usando la función pinMode().", ejemplo: "pinMode(13, OUTPUT);\ndigitalWrite(13, HIGH);", monedas: 10, quiz: { pregunta: "¿Qué función se utiliza para definir si un pin enviará o recibirá energía?", opciones: ["digitalWrite()", "pinMode()", "delay()", "loop()"], correcta: 1 } },
      alto: { titulo: "Alto: Resistencias", contenido: "Los componentes electrónicos tienen límites. Un LED típico solo soporta unos 2V. Si lo conectas directo a los 5V de Arduino, la corriente será tan alta que el filamento interno se fundirá. La resistencia actúa como una 'aduana' que frena el paso excesivo de electrones.", ejemplo: "int ledPin = 13;\nint resPin = 220;\n// La resistencia protege el componente", monedas: 15, quiz: { pregunta: "¿Cuál es la función principal de una resistencia en un circuito con LED?", opciones: ["Aumentar el brillo", "Almacenar energía", "Limitar la corriente", "Cambiar el color"], correcta: 2 } },
      superior: { titulo: "Superior: Control de Tiempo", contenido: "La función delay() detiene la ejecución del programa por un tiempo determinado. Es vital entender que Arduino no hace nada más mientras está en un delay. El valor se expresa en milisegundos, por lo que 1000 es igual a 1 segundo de espera real.", ejemplo: "digitalWrite(13, HIGH);\ndelay(500); // Espera medio segundo\ndigitalWrite(13, LOW);", monedas: 20, quiz: { pregunta: "Si queremos que Arduino espere exactamente 2 segundos, ¿qué valor debemos poner?", opciones: ["delay(2);", "delay(20);", "delay(200);", "delay(2000);"], correcta: 3 } }
    },
    explicacion: [ { codigo: "pinMode(13, OUTPUT);", texto: "⚙️ <strong>Configuración:</strong> El pin 13 enviará energía." } ], 
    retos: { 
      basico: { desc: "Agrega un 2do LED en el PIN 12. Enciéndelos a la vez.", match: ["pinMode(12,OUTPUT)", "digitalWrite(12,HIGH)"], pistas: ["Prepara el pin en el setup().", "Usa pinMode(12, OUTPUT);", "En el loop(), usa digitalWrite(12, HIGH);"] }, 
      alto: { desc: "Haz que parpadeen ALTERNADOS: uno prendido mientras el otro apagado.", match: ["13", "12", "HIGH", "LOW"], pistas: ["Si el pin 13 está en HIGH, ¿cómo debería estar el 12?", "Escribe digitalWrite(12, LOW); justo después del 13.", "Invierte los estados después del primer delay()."] }, 
      superior: { desc: "Efecto 'Latido': dos parpadeos rápidos (50ms) y una pausa larga.", match: ["delay(50)"], minCount: { "delay(50": 2 }, pistas: ["Cambia los delay a 50ms para que sea muy rápido.", "Copia el bloque de encender/apagar dos veces seguidas."] } 
    }
  },
  2: {
    title: "Semáforo Inteligente", 
    introduccion: "Aprenderás sobre lógica secuencial. Entenderás cómo el programa lee el código línea por línea.",
    challenge: "Programa la secuencia correcta de un semáforo de 3 colores.", components: ["3x LED (Verde, Amarillo, Rojo)", "3x Resistor 220Ω"], wiring: ["Verde→PIN 2", "Amarillo→PIN 3", "Rojo→PIN 4"], code: `int verde=2, amarillo=3, rojo=4;\nvoid setup() {\n  pinMode(verde, OUTPUT);\n  pinMode(amarillo, OUTPUT);\n  pinMode(rojo, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(verde, HIGH);\n  delay(3000);\n  digitalWrite(verde, LOW);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Bucle Loop", contenido: "Todo dentro de loop() se repite infinitamente.", ejemplo: "digitalWrite(verde, HIGH);\ndelay(1000);", monedas: 10 },
      alto: { titulo: "Alto: Variables", contenido: "En lugar de escribir números de pines todo el tiempo, les ponemos un nombre.", ejemplo: "int verde = 2;", monedas: 15 },
      superior: { titulo: "Superior: Tiempos Diferenciales", contenido: "Los semáforos no tienen el mismo tiempo. Usa delays diferentes para cada color.", ejemplo: "delay(3000); // Verde largo\ndelay(1000); // Amarillo corto", monedas: 20 }
    },
    explicacion: [ { codigo: "int verde=2;", texto: "📦 <strong>Variables:</strong> Guardamos el pin en un nombre." } ], 
    retos: { 
      basico: { desc: "El Verde debe parpadear antes de pasar al amarillo.", match: ["delay("], minCount: {"delay(": 3}, pistas: ["Haz que el verde se apague y prenda rápidamente.", "Pon un delay(200); después de apagar el verde."] }, 
      alto: { desc: "Añade una luz de giro (PIN 5) que parpadee junto al verde.", match: ["pinMode(5,OUTPUT)", "digitalWrite(5,HIGH)"], pistas: ["Declara el pin 5 en la parte de arriba.", "Añade pinMode(5, OUTPUT) en el setup.", "Escribe digitalWrite(5, HIGH) junto al verde."] }, 
      superior: { desc: "Agrega un Buzzer (PIN 9) que pite solo en luz Roja.", match: ["9", "OUTPUT", "tone("], pistas: ["Prepara el pin 9 como OUTPUT.", "Cuando el rojo sea HIGH, lanza tone(9, 440);", "Usa noTone(9); cuando el rojo se apague."] } 
    }
  },
  3: {
    title: "Botón de Pánico", 
    introduccion: "Empezaremos a recibir energía usando resistencias PULLUP internas para leer botones.",
    challenge: "Lee el estado de un botón (Entrada digital) para encender un LED.", components: ["Pushbutton", "LED"], wiring: ["LED→PIN 8", "Botón→PIN 7 (usar GND)"], code: `void setup() {\n  pinMode(8, OUTPUT);\n  pinMode(7, INPUT_PULLUP);\n}\nvoid loop() {\n  if(digitalRead(7) == LOW) {\n    digitalWrite(8, HIGH);\n  } else {\n    digitalWrite(8, LOW);\n  }\n}`, 
    teoria: {
      basico: { titulo: "Básico: Lectura Digital", contenido: "Usamos digitalRead() para leer pines. INPUT_PULLUP evita ruidos eléctricos.", ejemplo: "int estado = digitalRead(7);", monedas: 10 },
      alto: { titulo: "Alto: IF/ELSE", contenido: "Permite decidir qué hacer. Si pasa esto, haz X. Si no, haz Y.", ejemplo: "if (estado == LOW) { }", monedas: 15 },
      superior: { titulo: "Superior: Variables Booleanas", contenido: "Un booleano es 'true' o 'false'. Sirve para guardar estados temporales.", ejemplo: "bool prendido = false;\nprendido = !prendido;", monedas: 20 }
    },
    explicacion: [ { codigo: "if(digitalRead(7) == LOW)", texto: "🔄 <strong>Lógica:</strong> Si el botón es presionado, ejecuta las llaves." } ], 
    retos: { 
      basico: { desc: "Agrega otro LED (PIN 9). Si presionas: prende 9 y apaga 8.", match: ["9", "OUTPUT", "HIGH"], pistas: ["Añade el pinMode para el 9 en el setup.", "Dentro del IF, prende el 9 y apaga el 8."] }, 
      alto: { desc: "Al presionar, el LED debe parpadear simulando una alarma policial.", match: ["digitalWrite(8,HIGH)", "digitalWrite(8,LOW)", "delay("], minCount: {"delay(": 2}, pistas: ["Necesitas pausas de tiempo dentro del IF.", "Agrega digitalWrite y delay intercalados."] }, 
      superior: { desc: "Hazlo un interruptor (una pulsación prende, otra apaga).", match: ["bool", "!"], pistas: ["Crea una variable booleana arriba.", "Inviértela: estado = !estado;", "Usa otro IF para evaluar si 'estado' es verdadero o falso."] } 
    }
  },
  4: {
    title: "Dimmer Analógico (PWM)", 
    introduccion: "Aprenderás la Modulación por Ancho de Pulsos (PWM) para simular valores intermedios.",
    challenge: "Usa un potenciómetro para variar el brillo de un LED suavemente.", components: ["Potenciómetro", "LED (en Pin PWM ~)"], wiring: ["Potenciómetro→A0", "LED→PIN 9"], code: `int pot = A0;\nint led = 9;\nvoid setup() {\n  pinMode(led, OUTPUT);\n}\nvoid loop() {\n  int val = analogRead(pot);\n  int brillo = map(val, 0, 1023, 0, 255);\n  analogWrite(led, brillo);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Entradas Analógicas", contenido: "El potenciómetro envía niveles de voltaje que analogRead() lee de 0 a 1023.", ejemplo: "int val = analogRead(A0);", monedas: 10 },
      alto: { titulo: "Alto: La función MAP", contenido: "MAP convierte proporcionalmente una escala a otra de forma automática.", ejemplo: "map(valor, 0, 1023, 0, 255);", monedas: 15 },
      superior: { titulo: "Superior: Salidas PWM", contenido: "Los pines con '~' simulan voltajes intermedios parpadeando muy rápido.", ejemplo: "analogWrite(9, 127);", monedas: 20 }
    },
    explicacion: [ { codigo: "map(val, 0, 1023, 0, 255);", texto: "📏 <strong>Mapeo:</strong> Convierte la escala de 1023 a 255." } ], 
    retos: { 
      basico: { desc: "Imprime el valor del potenciómetro en el Monitor Serie.", match: ["Serial.begin", "Serial.print"], pistas: ["Inicia la consola en el setup() con Serial.begin(9600);", "Usa Serial.println(val); en el loop()."] }, 
      alto: { desc: "Agrega un segundo LED (PIN 10) que funcione al revés (inversamente proporcional).", match: ["10", "OUTPUT", "255-"], pistas: ["Si el brillo del 9 sube, el del 10 debe bajar.", "Usa analogWrite(10, 255 - brillo);"] }, 
      superior: { desc: "Crea una 'zona muerta'. Si el valor analógico es menor a 100, ambos LEDs se apagan.", match: ["if", "100", "0"], pistas: ["Usa un IF para evaluar la variable 'val'.", "Si val < 100, pon analogWrite a 0."] } 
    }
  },
  5: {
    title: "Sintetizador (Buzzer)", 
    introduccion: "Exploraremos el mundo de las frecuencias de sonido convirtiendo señales en notas usando tone().",
    challenge: "Genera frecuencias y melodías utilizando código.", components: ["Buzzer Piezoeléctrico"], wiring: ["Buzzer Positivo→PIN 8", "Negativo→GND"], code: `int buzzer = 8;\nvoid setup() {\n  pinMode(buzzer, OUTPUT);\n}\nvoid loop() {\n  tone(buzzer, 440);\n  delay(500);\n  noTone(buzzer);\n  delay(1000);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Frecuencias (Hz)", contenido: "tone() envía pulsos eléctricos al Buzzer. 440Hz equivale a la nota 'La'.", ejemplo: "tone(8, 440);", monedas: 10 },
      alto: { titulo: "Alto: Silencios Obligatorios", contenido: "Para separar notas se necesita pausarlo usando noTone().", ejemplo: "noTone(8);", monedas: 15 },
      superior: { titulo: "Superior: Ciclo FOR", contenido: "Para no repetir código, usamos bucles (FOR) que repiten las acciones.", ejemplo: "for(int i=0; i<3; i++) { }", monedas: 20 }
    },
    explicacion: [ { codigo: "tone(buzzer, 440);", texto: "🎵 <strong>Frecuencia:</strong> Vibra 440 veces por segundo." } ], 
    retos: { 
      basico: { desc: "Toca 3 notas distintas creando una pequeña melodía.", match: ["tone(", "delay("], minCount: {"tone(": 3}, pistas: ["Copia y pega el bloque tone y delay 3 veces.", "Cambia los números (440) por otros valores."] }, 
      alto: { desc: "Conecta un LED (PIN 7) que se encienda SOLO cuando esté sonando la melodía.", match: ["7", "OUTPUT", "HIGH"], pistas: ["Usa digitalWrite(7, HIGH) justo antes del primer tone.", "Apágalo en LOW justo después de la melodía."] }, 
      superior: { desc: "Reproduce la melodía usando un bucle FOR.", match: ["for("], pistas: ["La estructura es: for(int i=0; i<3; i++) { ... }", "Pon tu tone() dentro de las llaves del for."] } 
    }
  },
  6: {
    title: "Radar Automotriz", 
    introduccion: "Aprenderemos sobre ecolocalización para calcular distancias enviando pulsos ultrasónicos.",
    challenge: "Mide distancias usando un sensor ultrasónico HC-SR04.", components: ["Sensor HC-SR04"], wiring: ["Trig→PIN 3", "Echo→PIN 2"], code: `int trig=3; int echo=2;\nvoid setup() {\n Serial.begin(9600);\n pinMode(trig, OUTPUT);\n pinMode(echo, INPUT);\n}\nvoid loop() {\n digitalWrite(trig, LOW); delayMicroseconds(2);\n digitalWrite(trig, HIGH); delayMicroseconds(10);\n digitalWrite(trig, LOW);\n long t = pulseIn(echo, HIGH);\n long d = t / 59;\n Serial.println(d);\n delay(100);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Disparo Ultrasónico", contenido: "El pin 'Trig' envía un pulso de solo 10 microsegundos.", ejemplo: "delayMicroseconds(10);", monedas: 10 },
      alto: { titulo: "Alto: Recepción y pulseIn()", contenido: "El pin 'Echo' cuenta el tiempo que tarda el eco en regresar.", ejemplo: "long tiempo = pulseIn(echo, HIGH);", monedas: 15 },
      superior: { titulo: "Superior: La Matemática", contenido: "Dividimos el tiempo de vuelo entre 59 para obtener los centímetros.", ejemplo: "long d = t / 59;", monedas: 20 }
    },
    explicacion: [ { codigo: "pulseIn(echo, HIGH);", texto: "⏱️ <strong>Escucha:</strong> Cuenta el tiempo del eco." } ], 
    retos: { 
      basico: { desc: "Enciende un LED de alerta (PIN 4) si un objeto está a menos de 20cm.", match: ["if", "20", "4", "HIGH"], pistas: ["Necesitas un condicional IF evaluando la variable 'd'.", "La condición es: if (d < 20)", "Dentro del if, enciende el pin 4."] }, 
      alto: { desc: "Agrega un Buzzer (PIN 5) que pite solo si la distancia es menor a 10cm.", match: ["5", "OUTPUT", "10", "tone("], pistas: ["Agrega el pin 5 en el setup.", "Crea un if secundario que pregunte si d < 10."] }, 
      superior: { desc: "Sensor de reversa real: Haz que el delay del pitido dependa de la distancia.", match: ["*"], pistas: ["Cambia el delay fijo del final por una fórmula usando d * 10."] } 
    }
  },
  7: {
    title: "Barrera de Peaje (Servo)", 
    introduccion: "Descubrirás cómo incluir Librerías para controlar motores indicándoles un ángulo exacto.",
    challenge: "Usa librerías para controlar un motor con precisión milimétrica.", components: ["Micro Servo SG90"], wiring: ["Cable Naranja (Señal) → PIN 9"], code: `#include <Servo.h>\nServo miServo;\nvoid setup() {\n miServo.attach(9);\n}\nvoid loop() {\n miServo.write(0);\n delay(1000);\n miServo.write(90);\n delay(1000);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Librerías", contenido: "Las librerías enseñan a Arduino comandos complejos nuevos.", ejemplo: "#include <Servo.h>", monedas: 10 },
      alto: { titulo: "Alto: Objetos", contenido: "Debemos crear un 'objeto' (clon) del motor para darle órdenes.", ejemplo: "Servo miServo;", monedas: 15 },
      superior: { titulo: "Superior: write()", contenido: "Los servos se mueven de 0° a 180° grados exactos.", ejemplo: "miServo.write(90);", monedas: 20 }
    },
    explicacion: [ { codigo: "miServo.write(90);", texto: "📐 <strong>Ángulo:</strong> Gira el eje a 90 grados." } ], 
    retos: { 
      basico: { desc: "Modifica la barrera para que se abra totalmente (hasta 180 grados).", match: ["180"], pistas: ["Solo tienes que cambiar el 90 por 180 en el .write()"] }, 
      alto: { desc: "Conecta un Botón (PIN 7). Si lo presionas abre a 90, si lo sueltas vuelve a 0.", match: ["digitalRead(7)"], pistas: ["Crea un if (digitalRead(7) == LOW) para abrir."] }, 
      superior: { desc: "Haz que la barrera suba LENTAMENTE usando un bucle FOR.", match: ["for(", "++"], pistas: ["La estructura es: for(int i=0; i<=90; i++)", "Dentro del for pon: miServo.write(i); delay(15);"] } 
    }
  },
  8: {
    title: "Estación Climática", 
    introduccion: "Usaremos Operadores Lógicos como AND (&&) y OR (||) para múltiples condiciones.",
    challenge: "Lee la temperatura de tu entorno utilizando el DHT11.", components: ["Sensor DHT11"], wiring: ["Data (OUT) → PIN 2"], code: `#include <DHT.h>\nDHT dht(2, DHT11);\nvoid setup() {\n Serial.begin(9600);\n dht.begin();\n}\nvoid loop() {\n float t = dht.readTemperature();\n Serial.println(t);\n delay(2000);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Sensores de Datos", contenido: "El DHT11 envía un 'paquete' de datos decodificado.", ejemplo: "dht.readTemperature();", monedas: 10 },
      alto: { titulo: "Alto: Variables Float", contenido: "'float' permite guardar decimales para datos no enteros.", ejemplo: "float t = 24.5;", monedas: 15 },
      superior: { titulo: "Superior: Operadores Lógicos", contenido: "Usamos && (Y) para requerir dos condiciones obligatorias simultáneas.", ejemplo: "if (temp > 30 && hum > 70)", monedas: 20 }
    },
    explicacion: [ { codigo: "float t = dht.readTemperature();", texto: "🌡️ <strong>Lectura:</strong> Guarda los grados con decimales." } ], 
    retos: { 
      basico: { desc: "Imprime también la humedad (h) usando dht.readHumidity().", match: ["readHumidity", "Serial.print"], pistas: ["Crea una variable llamada 'h' tipo float.", "Usa h = dht.readHumidity();"] }, 
      alto: { desc: "Agrega un ventilador (LED en PIN 5) que se encienda si la temperatura supera 30°C.", match: ["if", "30", "5", "HIGH"], pistas: ["Usa la condicional: if(t > 30)", "Prende el 5 dentro de ese IF."] }, 
      superior: { desc: "Alerta climática: El LED parpadea SÓLO si temperatura > 30 Y humedad > 70.", match: ["&&", "70"], pistas: ["Combina dos condiciones en el mismo IF usando &&."] } 
    }
  },
  9: {
    title: "Panel Publicitario", 
    introduccion: "Aprenderás sobre el protocolo de comunicación serial I2C.",
    challenge: "Muestra texto en una pantalla LCD 16x2 vía I2C.", components: ["Pantalla LCD 16x2 I2C"], wiring: ["SDA→A4", "SCL→A5"], code: `#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nvoid setup() {\n lcd.init();\n lcd.backlight();\n lcd.setCursor(0,0);\n lcd.print("Hola Mundo");\n}\nvoid loop() {\n}`, 
    teoria: {
      basico: { titulo: "Básico: Protocolo I2C", contenido: "I2C reduce cables a 2 (SDA y SCL). Cada pantalla tiene una dirección (0x27).", ejemplo: "LiquidCrystal_I2C lcd(0x27, 16, 2);", monedas: 10 },
      alto: { titulo: "Alto: El Cursor", contenido: "Debes indicarle columna (0-15) y fila (0-1) para ubicar el lápiz invisible.", ejemplo: "lcd.setCursor(0, 1);", monedas: 15 },
      superior: { titulo: "Superior: Limpiar (Clear)", contenido: "Si no borras el texto anterior, las letras nuevas se enciman como una sopa.", ejemplo: "lcd.clear();", monedas: 20 }
    },
    explicacion: [ { codigo: "lcd.setCursor(0,0);", texto: "📍 <strong>Cursor:</strong> Lápiz en columna 0, fila 0 (arriba)." } ], 
    retos: { 
      basico: { desc: "Escribe tu nombre abajo: Muévelo a la Fila 1 (setCursor(0,1)).", match: ["setCursor(0,1)", "print"], pistas: ["Añade comandos nuevos justo después del 'Hola Mundo'.", "Usa lcd.setCursor(0, 1);"] }, 
      alto: { desc: "Haz que el texto parpadee en el loop() limpiando la pantalla con lcd.clear().", match: ["clear()", "delay("], pistas: ["Corta los comandos del setup() y pásalos al loop().", "Agrega delay(500) y luego el comando lcd.clear()"] }, 
      superior: { desc: "Haz un mensaje marquesina deslizándose a la izquierda usando scrollDisplayLeft().", match: ["scrollDisplayLeft()"], pistas: ["Dentro del loop, solo debes poner lcd.scrollDisplayLeft();"] } 
    }
  },
  10: {
    title: "BOSS FINAL", 
    introduccion: "¡Llegó la hora de la verdad! En este proyecto integrador tendrás que combinar TODO tu conocimiento.",
    challenge: "Integra radar, servo, luces y sonido en un solo código maestro.", components: ["Radar", "Servo", "Buzzer", "Botón", "2x LED"], wiring: ["Radar(3,2)", "Servo(9)", "Buzzer(8)", "Boton(7)", "LEDs(5,4)"], code: `// ⚠️ BOSS FINAL ⚠️\n// Crea tu propia lógica desde cero.\nvoid setup() {\n  \n}\nvoid loop() {\n  \n}`, 
    teoria: {
      basico: { titulo: "Básico: Planificación", contenido: "Imagina: ¿Qué lee datos (INPUT)? ¿Qué actúa (OUTPUT)?", ejemplo: "// 1. Leer radar\n// 2. Decidir", monedas: 10 },
      alto: { titulo: "Alto: Modularidad", contenido: "No escribas todo de golpe. Primero radar, comprueba. Luego servo.", ejemplo: "Serial.println(distancia);", monedas: 15 },
      superior: { titulo: "Superior: Lógica Maestra", contenido: "Unirás compuertas (&&) y condicionales gigantes para gobernar el circuito.", ejemplo: "if (d < 20 && boton == LOW)", monedas: 20 }
    },
    explicacion: [ { codigo: "// ¡Todo depende de ti!", texto: "🏆 <strong>Evaluación Final:</strong> Integra librerías, configura pines y haz la lógica." } ], 
    retos: { 
      basico: { desc: "Abre la talanquera (Servo a 90°) SOLO si el radar lee menos de 15cm.", match: ["pulseIn", "write(90)", "15"], pistas: ["Agrega el código completo del Radar de la Semana 6.", "Usa if (distancia < 15) { miServo.write(90); }"] }, 
      alto: { desc: "La talanquera solo abre si el auto está cerca Y presionan el botón.", match: ["&&", "digitalRead"], pistas: ["En el mismo IF de la distancia, usa && para evaluar el botón."] }, 
      superior: { desc: "Sistema Full: LED Verde al abrir, LED Rojo y pitido al cerrar.", match: ["tone", "HIGH", "LOW"], pistas: ["El LED Rojo y el sonido es cuando se cierra (dentro del ELSE)."] } 
    }
  }
};

export const tiendaItems = {
  avatars: [
    { id: 'user', icon: 'user', name: 'Estudiante', price: 0 },
    { id: 'bot', icon: 'bot', name: 'Robo Wokwi', price: 50 },
    { id: 'rocket', icon: 'rocket', name: 'Cohete', price: 100 },
    { id: 'alien', icon: 'alien', name: 'Alien', price: 150 },
    { id: 'ghost', icon: 'ghost', name: 'Fantasma', price: 200 },
    { id: 'sword', icon: 'sword', name: 'Guerrero', price: 300 }
  ],
  themes: [
    { id: 'blue', color: '#2f81f7', name: 'Wokwi Azul (Default)', price: 0 },
    { id: 'green', color: '#22c55e', name: 'Hacker Matrix', price: 100 },
    { id: 'purple', color: '#a855f7', name: 'Neón Morado', price: 150 },
    { id: 'orange', color: '#f97316', name: 'Fuego Carmesí', price: 200 },
    { id: 'pink', color: '#ec4899', name: 'Rosa Cyberpunk', price: 300 }
  ],
  powerups: [
    { id: 'shield', icon: 'shield', name: 'Escudo Protector', price: 50, desc: 'Evita perder 1 vida en el próximo fallo.' }
  ]
};

export const skillWeights = {
  1: { electronica: 5, codigo: 2, logica: 1 },
  2: { electronica: 1, codigo: 3, logica: 5 },
  3: { electronica: 4, codigo: 2, logica: 4 },
  4: { electronica: 3, codigo: 5, logica: 2 },
  5: { electronica: 1, codigo: 4, logica: 5 },
  6: { electronica: 5, codigo: 2, logica: 3 },
  7: { electronica: 2, codigo: 5, logica: 3 },
  8: { electronica: 4, codigo: 3, logica: 3 },
  9: { electronica: 2, codigo: 5, logica: 3 },
  10: { electronica: 4, codigo: 4, logica: 4 }
};

export const logrosDefiniciones = [
  { id: 'first_win', name: 'Primeros Pasos', desc: 'Completa tu primer reto', icon: 'award', color: '#2f81f7' },
  { id: 'speedrun', name: 'Velocista', desc: 'Resuelve un reto en menos de 30 segundos', icon: 'zap', color: '#e3b341' },
  { id: 'perfect_logic', name: 'Lógica Perfecta', desc: 'Resuelve un nivel superior sin perder vidas', icon: 'shield-check', color: '#238636' },
  { id: 'night_owl', name: 'Búho Programador', desc: 'Resuelve un reto después de las 10:00 PM', icon: 'moon', color: '#a371f7' }
];