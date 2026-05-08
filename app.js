// ==============================================================
// 1. IMPORTACIONES (Firebase Cloud SDKs 10.8.1 - CDN Oficial)
// ==============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==============================================================
// 2. CONFIGURACIÓN EXACTA DE TU FIREBASE (CodeQuestPro)
// ==============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDNBy-QKS5eNSinEI5ROOhR94YGKvbA0cg",
  authDomain: "codequestpro-78796.firebaseapp.com",
  projectId: "codequestpro-78796",
  storageBucket: "codequestpro-78796.firebasestorage.app",
  messagingSenderId: "383335669814",
  appId: "1:383335669814:web:70d1fd4e04b77aca63f897",
  measurementId: "G-V7GPL7TEQC"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// LA LLAVE MAESTRA DEL DOCENTE
const ADMIN_EMAIL = 'jhon.aguirre@itspereira.edu.co';
let esAdmin = false; // Variable para identificar al admin principal
let esDocenteSecundario = false; // Variable para docentes no-admin

// ==============================================================
// 3. BASE DE DATOS DE CONTENIDO (Las 10 Semanas)
// ==============================================================
const mensajesExito = ["¡Excelente deducción!", "¡Felicidades!", "¡Muy bien hecho!", "¡Brillante!"];
const mensajesFallo = ["No te desanimes.", "Revisa con calma.", "¡Intenta de nuevo!"];

const competenciasMapa = {
  1: "Fundamentos de Electrónica y Pines Digitales", 2: "Lógica Condicional y Secuencias Temporales",
  3: "Lectura de Sensores y Entradas Digitales", 4: "Modulación por Ancho de Pulsos (PWM)",
  5: "Generación de Frecuencias y Sonido", 6: "Cálculo de Distancias con Ultrasonido",
  7: "Control de Actuadores y Servomotores", 8: "Lectura de Sensores Climáticos (DHT11)",
  9: "Comunicación I2C y Pantallas LCD", 10: "Integración de Sistemas (Proyecto Final)"
};

const weeks = {
  1: {
    title: "Primer Contacto (LED)", 
    introduccion: "Aprenderás cómo Arduino envía electricidad al mundo físico.",
    challenge: "Simula el código base. Luego supera los retos modificando el parpadeo.", 
    components: ["Arduino UNO", "LED", "Resistor 220Ω"], 
    wiring: ["PIN 13 → Ánodo LED", "Cátodo LED → Resistencia → GND"], 
    code: `void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`,
    teoria: {
      basico: { titulo: "Básico: Señales Digitales", contenido: "Un pin digital solo tiene dos estados: HIGH (encendido, 5V) o LOW (apagado, 0V). La función `pinMode()` se usa en el `setup()` para configurar un pin como salida (OUTPUT) o entrada (INPUT).", ejemplo: "pinMode(13, OUTPUT);\ndigitalWrite(13, HIGH);", monedas: 10, quiz: { pregunta: "¿Qué función configura un pin para enviar energía?", opciones: ["digitalRead()", "analogWrite()", "pinMode()", "delay()"], correcta: 2, feedback: "`pinMode()` es la función que se usa en `setup()` para establecer el modo de trabajo de un pin." } },
      alto: { titulo: "Alto: Resistencias", contenido: "Un LED no puede conectarse directamente a los 5V de Arduino porque recibiría demasiada corriente y se quemaría. Una resistencia es un componente que 'limita' el paso de la electricidad, protegiendo al LED.", ejemplo: "// La resistencia de 220Ω es ideal para LEDs.", monedas: 15, quiz: { pregunta: "¿Cuál es el propósito de la resistencia junto al LED?", opciones: ["Aumentar el brillo", "Limitar la corriente y protegerlo", "Cambiar su color", "Almacenar energía"], correcta: 1, feedback: "La función principal de la resistencia en este circuito es limitar la corriente para evitar que el LED se dañe." } },
      superior: { titulo: "Superior: Control de Tiempo", contenido: "La función `delay()` pausa la ejecución del programa por un número específico de milisegundos. Es fundamental para controlar la duración de eventos, como cuánto tiempo un LED permanece encendido o apagado.", ejemplo: "delay(500); // Pausa de medio segundo", monedas: 20, quiz: { pregunta: "Si quieres que un LED parpadee 2 veces por segundo, ¿qué `delay()` usarías?", opciones: ["delay(1000);", "delay(500);", "delay(250);", "delay(2000);"], correcta: 2, feedback: "Para 2 parpadeos por segundo, cada ciclo (encendido + apagado) dura 500ms. El LED estaría encendido 250ms y apagado 250ms." } }
    },
    explicacion: [ { codigo: "pinMode(13, OUTPUT);", texto: "⚙️ <strong>Configuración:</strong> El pin 13 enviará energía." } ], 
    retos: { 
      basico: { desc: "Agrega un 2do LED en el PIN 12. Enciéndelos a la vez.", match: ["12", "OUTPUT", "HIGH"], pistas: ["Prepara el pin en el setup().", "Usa pinMode(12, OUTPUT);", "En el loop(), usa digitalWrite(12, HIGH);"] }, 
      alto: { desc: "Haz que parpadeen ALTERNADOS: uno prendido mientras el otro apagado.", match: ["13", "12", "HIGH", "LOW"], pistas: ["Si el pin 13 está en HIGH, ¿cómo debería estar el 12?", "Escribe digitalWrite(12, LOW); justo después del 13.", "Invierte los estados después del primer delay()."] }, 
      superior: { desc: "Efecto 'Latido': dos parpadeos rápidos (50ms) y una pausa larga.", match: ["delay(50)"], minCount: { "delay(50": 2 }, pistas: ["Cambia los delay a 50ms para que sea muy rápido.", "Copia el bloque de encender/apagar dos veces seguidas."] } 
    }
  },
  2: {
    title: "Semáforo Inteligente", 
    introduccion: "Aprenderás sobre lógica secuencial. Entenderás cómo el programa lee el código línea por línea.",
    challenge: "Programa la secuencia correcta de un semáforo de 3 colores.", components: ["3x LED (Verde, Amarillo, Rojo)", "3x Resistor 220Ω"], wiring: ["Verde→PIN 2", "Amarillo→PIN 3", "Rojo→PIN 4"], code: `int verde=2, amarillo=3, rojo=4;\nvoid setup() {\n  pinMode(verde, OUTPUT);\n  pinMode(amarillo, OUTPUT);\n  pinMode(rojo, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(verde, HIGH);\n  delay(3000);\n  digitalWrite(verde, LOW);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Bucle Loop", contenido: "El código dentro de la función `loop()` se ejecuta repetidamente, en un ciclo infinito, después de que `setup()` se ejecuta una sola vez al inicio.", ejemplo: "digitalWrite(verde, HIGH);\ndelay(1000);", monedas: 10, quiz: { pregunta: "¿La función `setup()` se ejecuta una o varias veces?", opciones: ["Varias veces", "Solo una vez al inicio", "Depende del código", "Nunca se ejecuta"], correcta: 1, feedback: "`setup()` se ejecuta una única vez cuando el Arduino enciende o se resetea." } },
      alto: { titulo: "Alto: Variables", contenido: "Una variable es un espacio en la memoria con un nombre donde guardamos un dato. Usar `int verde = 2;` es mejor que usar el número `2` directamente, ya que hace el código más legible y fácil de modificar.", ejemplo: "int verde = 2;", monedas: 15, quiz: { pregunta: "¿Para qué sirve una variable como `int led = 13;`?", opciones: ["Para declarar una función", "Para crear un bucle", "Para hacer el código más legible y fácil de cambiar", "Para finalizar el programa"], correcta: 2, feedback: "Las variables nos permiten dar nombres significativos a valores, mejorando la claridad y mantenibilidad del código." } },
      superior: { titulo: "Superior: Tiempos Diferenciales", contenido: "No todos los eventos deben durar lo mismo. En un semáforo, la luz verde dura mucho más que la amarilla. Esto se logra usando valores diferentes en cada llamada a `delay()`.", ejemplo: "delay(3000); // Verde largo\ndelay(1000); // Amarillo corto", monedas: 20, quiz: { pregunta: "¿Qué hace `delay(50)`?", opciones: ["Pausa 50 segundos", "Pausa 50 milisegundos", "Pausa 50 microsegundos", "Genera un error"], correcta: 1, feedback: "El valor dentro de `delay()` siempre se mide en milisegundos (ms)." } }
    },
    explicacion: [ { codigo: "int verde=2;", texto: "📦 <strong>Variables:</strong> Guardamos el pin en un nombre." } ], 
    retos: { 
      basico: { desc: "El Verde debe parpadear antes de pasar al amarillo.", match: ["delay("], minCount: {"delay(": 3}, pistas: ["Haz que el verde se apague y prenda rápidamente.", "Pon un delay(200); después de apagar el verde."] }, 
      alto: { desc: "Añade una luz de giro (PIN 5) que parpadee junto al verde.", match: ["5", "OUTPUT", "HIGH"], pistas: ["Declara el pin 5 en la parte de arriba.", "Añade pinMode(5, OUTPUT) en el setup.", "Escribe digitalWrite(5, HIGH) junto al verde."] }, 
      superior: { desc: "Agrega un Buzzer (PIN 9) que pite solo en luz Roja.", match: ["9", "OUTPUT", "tone("], pistas: ["Prepara el pin 9 como OUTPUT.", "Cuando el rojo sea HIGH, lanza tone(9, 440);", "Usa noTone(9); cuando el rojo se apague."] } 
    }
  },
  3: {
    title: "Botón de Pánico", 
    introduccion: "Empezaremos a recibir energía usando resistencias PULLUP internas para leer botones.",
    challenge: "Lee el estado de un botón (Entrada digital) para encender un LED.", components: ["Pushbutton", "LED"], wiring: ["LED→PIN 8", "Botón→PIN 7 (usar GND)"], code: `void setup() {\n  pinMode(8, OUTPUT);\n  pinMode(7, INPUT_PULLUP);\n}\nvoid loop() {\n  if(digitalRead(7) == LOW) {\n    digitalWrite(8, HIGH);\n  } else {\n    digitalWrite(8, LOW);\n  }\n}`, 
    teoria: {
      basico: { titulo: "Básico: Lectura Digital", contenido: "Con `digitalRead(pin)` podemos 'escuchar' el estado de un pin. `INPUT_PULLUP` es un modo especial que activa una resistencia interna, haciendo que el pin lea `HIGH` por defecto y `LOW` solo cuando se presiona el botón (conectado a GND).", ejemplo: "int estado = digitalRead(7);", monedas: 10, quiz: { pregunta: "Con `INPUT_PULLUP`, ¿qué valor lee `digitalRead()` cuando el botón NO está presionado?", opciones: ["LOW", "HIGH", "0", "Depende"], correcta: 1, feedback: "La resistencia PULL-UP interna 'jala' el voltaje hacia arriba, por lo que lee HIGH en reposo." } },
      alto: { titulo: "Alto: IF/ELSE", contenido: "La estructura `if (condicion) { ... } else { ... }` es el cerebro de nuestro código. Permite tomar decisiones: si la condición es verdadera, se ejecuta el primer bloque; si es falsa, se ejecuta el bloque `else`.", ejemplo: "if (estado == LOW) { }", monedas: 15, quiz: { pregunta: "En `if (x == 10)`, ¿qué significa el `==`?", opciones: ["Asignar 10 a x", "Comparar si x es igual a 10", "Sumar 10 a x", "Es un error de sintaxis"], correcta: 1, feedback: "Un solo `=` es para asignar un valor. Doble `==` es para comparar si dos valores son iguales." } },
      superior: { titulo: "Superior: Variables Booleanas", contenido: "Una variable de tipo `bool` solo puede tener dos valores: `true` (verdadero) o `false` (falso). Son perfectas para guardar estados, como 'la puerta está abierta' o 'la alarma está activada'. El operador `!` invierte su valor (`!true` es `false`).", ejemplo: "bool prendido = false;\nprendido = !prendido;", monedas: 20, quiz: { pregunta: "Si `estado` es `true`, ¿qué valor tendrá después de `estado = !estado;`?", opciones: ["true", "false", "1", "error"], correcta: 1, feedback: "El operador de negación `!` invierte el valor booleano. Si era `true`, se convierte en `false`." } }
    },
    explicacion: [ { codigo: "if(digitalRead(7) == LOW)", texto: "🔄 <strong>Lógica:</strong> Si el botón es presionado, ejecuta las llaves." } ], 
    retos: { 
      basico: { desc: "Agrega otro LED (PIN 9). Si presionas: prende 9 y apaga 8.", match: ["9", "OUTPUT", "HIGH"], pistas: ["Añade el pinMode para el 9 en el setup.", "Dentro del IF, prende el 9 y apaga el 8."] }, 
      alto: { desc: "Al presionar, el LED debe parpadear simulando una alarma policial.", match: ["delay("], pistas: ["Necesitas pausas de tiempo dentro del IF.", "Agrega digitalWrite y delay intercalados."] }, 
      superior: { desc: "Hazlo un interruptor (una pulsación prende, otra apaga).", match: ["bool", "!"], pistas: ["Crea una variable booleana arriba.", "Inviértela: estado = !estado;", "Usa otro IF para evaluar si 'estado' es verdadero o falso."] } 
    }
  },
  4: {
    title: "Dimmer Analógico (PWM)", 
    introduccion: "Aprenderás la Modulación por Ancho de Pulsos (PWM) para simular valores intermedios.",
    challenge: "Usa un potenciómetro para variar el brillo de un LED suavemente.", components: ["Potenciómetro", "LED (en Pin PWM ~)"], wiring: ["Potenciómetro→A0", "LED→PIN 9"], code: `int pot = A0;\nint led = 9;\nvoid setup() {\n  pinMode(led, OUTPUT);\n}\nvoid loop() {\n  int val = analogRead(pot);\n  int brillo = map(val, 0, 1023, 0, 255);\n  analogWrite(led, brillo);\n}`, 
    teoria: {
      basico: { titulo: "Básico: Entradas Analógicas", contenido: "A diferencia de las digitales, las entradas analógicas (pines A0, A1, etc.) pueden leer un rango de voltajes. `analogRead()` convierte ese voltaje en un número entre 0 (para 0V) y 1023 (para 5V).", ejemplo: "int val = analogRead(A0);", monedas: 10, quiz: { pregunta: "¿Cuál es el valor máximo que puede devolver `analogRead()`?", opciones: ["255", "5", "1023", "1024"], correcta: 2, feedback: "El conversor Analógico-Digital de Arduino tiene una resolución de 10 bits, lo que da 1024 valores (de 0 a 1023)." } },
      alto: { titulo: "Alto: La función MAP", contenido: "La función `map()` es una regla de tres. Re-escala un número de un rango a otro. Es útil para convertir el rango 0-1023 de `analogRead()` al rango 0-255 que necesita `analogWrite()`.", ejemplo: "map(valor, 0, 1023, 0, 255);", monedas: 15, quiz: { pregunta: "`map(512, 0, 1023, 0, 100)` ¿qué valor devuelve?", opciones: ["512", "100", "0", "50"], correcta: 3, feedback: "512 está justo a la mitad del rango 0-1023, por lo que `map` lo convierte a la mitad del rango 0-100, que es 50." } },
      superior: { titulo: "Superior: Salidas PWM", contenido: "Los pines marcados con `~` pueden simular una salida analógica usando PWM (Modulación por Ancho de Pulsos). `analogWrite(pin, valor)` enciende y apaga el pin muy rápido. Un valor de 127 significa que está encendido el 50% del tiempo, resultando en la mitad del brillo.", ejemplo: "analogWrite(9, 127);", monedas: 20, quiz: { pregunta: "¿Qué valor usarías en `analogWrite()` para apagar completamente un LED?", opciones: ["255", "1", "0", "-1"], correcta: 2, feedback: "Un valor de 0 en `analogWrite` significa que el pin estará apagado el 100% del tiempo." } }
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
      basico: { titulo: "Básico: Frecuencias (Hz)", contenido: "El sonido es una vibración. La función `tone(pin, frecuencia)` hace que un pin vibre a una frecuencia específica, medida en Hertz (Hz). 440Hz es la frecuencia de la nota musical 'La'.", ejemplo: "tone(8, 440);", monedas: 10, quiz: { pregunta: "¿Qué unidad se usa para la frecuencia en la función `tone()`?", opciones: ["Milisegundos", "Voltios", "Hertz (Hz)", "Ohms"], correcta: 2, feedback: "La frecuencia de una onda de sonido se mide en Hertz (ciclos por segundo)." } },
      alto: { titulo: "Alto: Silencios Obligatorios", contenido: "La función `tone()` inicia un sonido que continúa indefinidamente. Para detenerlo y poder tocar otra nota o crear un silencio, es obligatorio usar la función `noTone(pin)`.", ejemplo: "noTone(8);", monedas: 15, quiz: { pregunta: "Si tocas una nota con `tone()` y no usas `noTone()`, ¿qué pasa?", opciones: ["Suena por 1 segundo", "No suena nada", "Suena para siempre", "El Arduino se reinicia"], correcta: 2, feedback: "El sonido generado por `tone()` persiste hasta que se detiene explícitamente con `noTone()`." } },
      superior: { titulo: "Superior: Ciclo FOR", contenido: "Un bucle `for` es una estructura que repite un bloque de código un número determinado de veces. Es ideal para tareas repetitivas como tocar una melodía o hacer parpadear un LED varias veces seguidas.", ejemplo: "for(int i=0; i<3; i++) { }", monedas: 20, quiz: { pregunta: "El código `for(int i=0; i<5; i++)` ¿cuántas veces repite su contenido?", opciones: ["4 veces", "5 veces", "6 veces", "Infinitas veces"], correcta: 1, feedback: "El bucle se ejecuta para i=0, 1, 2, 3 y 4. Cuando i llega a 5, la condición `i<5` es falsa y el bucle termina." } }
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
      basico: { titulo: "Básico: Disparo Ultrasónico", contenido: "Para iniciar la medición, el pin 'Trig' (disparador) debe enviar un pulso sónico muy corto y preciso. Esto se logra poniéndolo en HIGH por 10 microsegundos (`delayMicroseconds(10)`).", ejemplo: "delayMicroseconds(10);", monedas: 10, quiz: { pregunta: "¿Qué función se usa para pausas de millonésimas de segundo?", opciones: ["delay()", "pause()", "delayMicroseconds()", "wait()"], correcta: 2, feedback: "`delayMicroseconds()` permite un control del tiempo mucho más fino que `delay()`." } },
      alto: { titulo: "Alto: Recepción y pulseIn()", contenido: "Después del disparo, el pin 'Echo' se pone a 'escuchar'. La función `pulseIn(pin, HIGH)` mide cuánto tiempo (en microsegundos) el pin 'Echo' permanece en estado HIGH, que es el tiempo que tarda el sonido en ir y volver.", ejemplo: "long tiempo = pulseIn(echo, HIGH);", monedas: 15, quiz: { pregunta: "`pulseIn()` devuelve el tiempo en...", opciones: ["Segundos", "Milisegundos", "Microsegundos", "Centímetros"], correcta: 2, feedback: "`pulseIn()` es una función de alta precisión que mide la duración de un pulso en microsegundos." } },
      superior: { titulo: "Superior: La Matemática", contenido: "El tiempo que nos da `pulseIn` es el de ida y vuelta del sonido. Para convertir ese tiempo a distancia en centímetros, se usa una fórmula física simplificada: dividir los microsegundos entre 59.", ejemplo: "long d = t / 59;", monedas: 20, quiz: { pregunta: "Si `pulseIn()` devuelve 590, ¿a qué distancia está el objeto?", opciones: ["590 cm", "1 cm", "10 cm", "59 cm"], correcta: 2, feedback: "Aplicando la fórmula: 590 / 59 = 10 centímetros." } }
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
      basico: { titulo: "Básico: Librerías", contenido: "Las librerías son colecciones de código pre-escrito que extienden las capacidades de Arduino. `#include <Servo.h>` le 'enseña' a nuestro programa cómo hablar con servomotores.", ejemplo: "#include <Servo.h>", monedas: 10, quiz: { pregunta: "¿Qué hace la directiva `#include`?", opciones: ["Define una variable", "Inicia el programa", "Importa una librería", "Crea una función"], correcta: 2, feedback: "`#include` es la forma de agregar librerías externas a nuestro sketch." } },
      alto: { titulo: "Alto: Objetos", contenido: "Después de incluir la librería, creamos una 'instancia' u 'objeto' del servo con `Servo miServo;`. `miServo` se convierte en nuestro control remoto para ese motor específico. Podemos tener varios objetos si tenemos varios servos.", ejemplo: "Servo miServo;", monedas: 15, quiz: { pregunta: "Si tienes dos servos, ¿cómo los declararías?", opciones: ["`Servo miServo1, miServo2;`", "`Servo miServo(2);`", "`Servo miServo[2];`", "No se puede"], correcta: 0, feedback: "Puedes crear múltiples objetos de la misma 'clase' (Servo) separándolos por comas o en líneas diferentes." } },
      superior: { titulo: "Superior: write()", contenido: "El comando principal para un servo es `miServo.write(angulo);`. Este mueve el eje del motor a una posición angular específica, que va desde 0 hasta 180 grados.", ejemplo: "miServo.write(90);", monedas: 20, quiz: { pregunta: "Para mover un servo a la mitad de su recorrido, ¿qué comando usarías?", opciones: ["`miServo.write(180);`", "`miServo.write(0);`", "`miServo.write(90);`", "`miServo.write(50);`"], correcta: 2, feedback: "El rango completo es de 0 a 180 grados, por lo que la mitad exacta es 90 grados." } }
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
      basico: { titulo: "Básico: Sensores de Datos", contenido: "Sensores como el DHT11 son más complejos que un botón. No envían un simple HIGH/LOW, sino un 'paquete' de datos digitales que la librería DHT decodifica por nosotros para obtener valores de temperatura y humedad.", ejemplo: "dht.readTemperature();", monedas: 10, quiz: { pregunta: "Para usar el DHT11, ¿necesitas una librería?", opciones: ["No, es nativo", "Sí, siempre", "Solo para la temperatura", "Solo para la humedad"], correcta: 1, feedback: "La comunicación con el DHT11 es un protocolo específico que requiere una librería para ser interpretado." } },
      alto: { titulo: "Alto: Variables Float", contenido: "La temperatura y la humedad rara vez son números enteros. El tipo de dato `float` nos permite almacenar variables con decimales, como `24.5` o `60.2`.", ejemplo: "float t = 24.5;", monedas: 15, quiz: { pregunta: "¿Qué tipo de dato es mejor para guardar el valor 3.1416?", opciones: ["int", "bool", "string", "float"], correcta: 3, feedback: "`int` solo guarda enteros. `float` es el tipo de dato para números con punto decimal." } },
      superior: { titulo: "Superior: Operadores Lógicos", contenido: "Los operadores lógicos nos permiten crear condiciones complejas. `&&` (Y) requiere que AMBAS condiciones sean verdaderas. `||` (O) requiere que AL MENOS UNA de las condiciones sea verdadera.", ejemplo: "if (temp > 30 && hum > 70)", monedas: 20, quiz: { pregunta: "La condición `if (x > 10 || y < 5)` es verdadera si...", opciones: ["x es 11 e y es 6", "x es 9 e y es 6", "x es 9 e y es 4", "x es 9 e y es 5"], correcta: 2, feedback: "Con el operador OR (||), basta con que una de las dos condiciones se cumpla. En este caso, `y < 5` es verdadero (4 < 5)." } }
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
      basico: { titulo: "Básico: Protocolo I2C", contenido: "I2C es un bus de comunicación que permite conectar múltiples dispositivos usando solo dos cables: SDA (datos) y SCL (reloj). Cada dispositivo en el bus tiene una dirección única (ej. `0x27`) para que Arduino sepa a cuál hablarle.", ejemplo: "LiquidCrystal_I2C lcd(0x27, 16, 2);", monedas: 10, quiz: { pregunta: "¿Qué ventaja principal ofrece I2C?", opciones: ["Mayor velocidad", "Ahorro de pines", "Mayor voltaje", "No necesita librería"], correcta: 1, feedback: "I2C es muy popular porque reduce drásticamente el número de cables necesarios para conectar componentes." } },
      alto: { titulo: "Alto: El Cursor", contenido: "Antes de escribir en la LCD, debemos posicionar el 'cursor' (el punto de escritura) con `lcd.setCursor(columna, fila)`. Las columnas van de 0 a 15 y las filas de 0 a 1.", ejemplo: "lcd.setCursor(0, 1);", monedas: 15, quiz: { pregunta: "Para escribir en la esquina inferior derecha de una LCD 16x2, ¿qué usarías?", opciones: ["`setCursor(16,2)`", "`setCursor(15,1)`", "`setCursor(2,16)`", "`setCursor(1,15)`"], correcta: 1, feedback: "Las coordenadas empiezan en 0, por lo que la última columna es la 15 y la última fila es la 1." } },
      superior: { titulo: "Superior: Limpiar (Clear)", contenido: "El texto impreso en una LCD permanece allí hasta que se sobrescribe o se borra. La función `lcd.clear()` borra toda la pantalla y reposiciona el cursor en la esquina superior izquierda (0,0).", ejemplo: "lcd.clear();", monedas: 20, quiz: { pregunta: "¿Qué hace `lcd.clear()` además de borrar el texto?", opciones: ["Apaga la luz de fondo", "Mueve el cursor a (0,0)", "Invierte los colores", "Nada más"], correcta: 1, feedback: "`lcd.clear()` es un comando 2 en 1: borra la pantalla y resetea la posición del cursor." } }
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
      basico: { titulo: "Básico: Planificación", contenido: "Antes de escribir una sola línea de código, es crucial hacer un plan. Dibuja el circuito. Escribe en pseudocódigo (lenguaje humano) los pasos que debe seguir tu programa. ¿Qué pines son INPUT y cuáles OUTPUT?", ejemplo: "// 1. Leer radar\n// 2. Decidir", monedas: 10, quiz: { pregunta: "En un proyecto, ¿qué es lo primero que deberías hacer?", opciones: ["Escribir el `loop()`", "Conectar los cables", "Hacer un plan y definir los pines", "Escribir el `setup()`"], correcta: 2, feedback: "Una buena planificación te ahorrará mucho tiempo y frustración durante la codificación y el testeo." } },
      alto: { titulo: "Alto: Modularidad", contenido: "No intentes construir todo el programa de una vez. Enfócate en una parte (ej. solo hacer funcionar el radar y ver los datos en el Monitor Serie). Una vez que esa parte funciona, intégrala con la siguiente (ej. el servo).", ejemplo: "Serial.println(distancia);", monedas: 15, quiz: { pregunta: "¿Qué es una buena práctica al programar un proyecto complejo?", opciones: ["Escribir todo el código y probar al final", "Probar y verificar cada módulo por separado", "Usar solo variables globales", "Evitar usar librerías"], correcta: 1, feedback: "El desarrollo modular (construir y probar en bloques) hace que la depuración de errores sea mucho más sencilla." } },
      superior: { titulo: "Superior: Lógica Maestra", contenido: "El corazón de un proyecto integrador es la lógica que une todo. Usarás condicionales anidados (`if` dentro de otro `if`) y operadores lógicos (`&&`, `||`) para crear un 'árbol de decisiones' que determine cómo reacciona el sistema a las diferentes entradas.", ejemplo: "if (d < 20 && boton == LOW)", monedas: 20, quiz: { pregunta: "¿Qué estructura es clave para la lógica de control principal?", opciones: ["`delay()`", "Los `pinMode()`", "Los `if/else` y operadores lógicos", "Las variables `int`"], correcta: 2, feedback: "Las estructuras condicionales y los operadores lógicos forman el cerebro que toma decisiones en tu programa." } }
    },
    explicacion: [ { codigo: "// ¡Todo depende de ti!", texto: "🏆 <strong>Evaluación Final:</strong> Integra librerías, configura pines y haz la lógica." } ], 
    retos: { 
      basico: { desc: "Abre la talanquera (Servo a 90°) SOLO si el radar lee menos de 15cm.", match: ["pulseIn", "write(90)", "15"], pistas: ["Agrega el código completo del Radar de la Semana 6.", "Usa if (distancia < 15) { miServo.write(90); }"] }, 
      alto: { desc: "La talanquera solo abre si el auto está cerca Y presionan el botón.", match: ["&&", "digitalRead"], pistas: ["En el mismo IF de la distancia, usa && para evaluar el botón."] }, 
      superior: { desc: "Sistema Full: LED Verde al abrir, LED Rojo y pitido al cerrar.", match: ["tone", "HIGH", "LOW"], pistas: ["El LED Rojo y el sonido es cuando se cierra (dentro del ELSE)."] } 
    }
  }
};


// ==============================================================
// 4. BASE DE DATOS DE LA TIENDA VIRTUAL
// ==============================================================
const tiendaItems = {
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
  ]
};

// ==============================================================
// 5. VARIABLES GLOBALES DEL SISTEMA Y USUARIO
// ==============================================================
let currentUser = null;
let currentRetoId = '1';
let timers = {}; let intervalos = {}; 
let fallos = { basico: 0, alto: 0, superior: 0 };
let pistasDesbloqueadas = { basico: 0, alto: 0, superior: 0 };
let vidas = { basico: 3, alto: 3, superior: 3 };

let allStudentsData = []; // Para el panel de administrador

let userData = {
  nombres: "", email: "", grado: "",
  volts: 0, monedas: 0, streak: 0, lastLogin: "",
  progress: {}, records: {}, savedCodes: {}, drafts: {}, teoria: {},
  avatar: "user", theme: "blue", themeMode: "dark", inventory: { avatars: ["user"], themes: ["blue"] }
};

// ==============================================================
// 6. AUTENTICACIÓN Y PANEL DOCENTE
// ==============================================================

onAuthStateChanged(auth, async (user) => {
  if (user && user.email.endsWith('@itspereira.edu.co')) {
    document.getElementById('login-loading').style.display = 'block';

    // ROL ADMIN PRINCIPAL (MODO DIOS)
    if (user.email === ADMIN_EMAIL) {
      esAdmin = true;
      currentUser = user;
      // Por defecto, el admin entra como estudiante para ver el juego
      iniciarAppEstudiante();
      return;
    }

    // VERIFICAR SI ES DOCENTE SECUNDARIO
    const rolesDoc = await getDoc(doc(db, "config", "roles"));
    if (rolesDoc.exists() && rolesDoc.data().docentes.includes(user.email)) {
      esDocenteSecundario = true;
      currentUser = user;
      // Los docentes secundarios van directo a su panel
      window.iniciarAppDocente();
      return;
    } else if (rolesDoc.exists() && !rolesDoc.data().docentes.includes(user.email) && user.email !== ADMIN_EMAIL) {
        // Si existe el doc de roles pero el email no está, no es ni admin ni docente.
        // Podría ser un estudiante con correo de docente, lo dejamos pasar.
    }

    // ROL ESTUDIANTE
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      userData = docSnap.data(); 
      if(!userData.savedCodes) userData.savedCodes = {};
      if(!userData.drafts) userData.drafts = {};
      if(!userData.teoria) userData.teoria = {};
      if(!userData.themeMode) userData.themeMode = 'dark';
      if(!userData.inventory) {
        userData.avatar = "user"; userData.theme = "blue";
        userData.inventory = { avatars: ["user"], themes: ["blue"] };
      }
    } else {
      let gradoIngresado = prompt("¡Bienvenido a Wokwi Academy!\nPor favor, ingresa tu grado (Ej: 10A, 11B):");
      userData = {
        nombres: user.displayName, email: user.email, grado: gradoIngresado || "Sin Grado",
        volts: 0, monedas: 0, streak: 0, lastLogin: "",
        progress: {}, records: {}, savedCodes: {}, drafts: {}, teoria: {},
        avatar: "user", theme: "blue", themeMode: "dark", inventory: { avatars: ["user"], themes: ["blue"] }
      };
      await saveToFirebase();
    }
    currentUser = user;
    iniciarAppEstudiante();
  } else {
    document.getElementById('screen-login').classList.add('active');
    document.getElementById('screen-app').classList.remove('active');
    document.getElementById('screen-teacher').classList.remove('active');
    if (window.lucide) lucide.createIcons();
  }
});

window.loginConGoogle = async function() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if(!user.email.endsWith('@itspereira.edu.co')) {
      await signOut(auth);
      document.getElementById('login-error').style.display = 'block';
      document.getElementById('login-error').textContent = 'Acceso denegado. Usa tu cuenta @itspereira.edu.co';
      return;
    }

    document.getElementById('login-error').style.display = 'none';
    document.getElementById('login-loading').style.display = 'block';

    // Se maneja el resto en onAuthStateChanged
  } catch (error) {
    console.error("Error en Login:", error);
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').textContent = 'Error de conexión. Intenta nuevamente.';
    document.getElementById('login-loading').style.display = 'none';
  }
};

window.logout = async function() {
  if(confirm("¿Deseas cerrar sesión? Tus datos están guardados en la Nube ☁️.")) {
    if (currentUser && !esAdmin && !esDocenteSecundario) await saveToFirebase(); 
    await signOut(auth);
    window.location.reload(); 
  }
};

async function saveToFirebase() {
  if(!currentUser || currentUser.email === ADMIN_EMAIL) return;
  try { await setDoc(doc(db, "users", currentUser.uid), userData, { merge: true }); }
  catch (e) { console.error("Error guardando en la nube:", e); }
}

let timeoutGuardado;
function autoGuardarEnNube() {
  clearTimeout(timeoutGuardado);
  timeoutGuardado = setTimeout(() => { saveToFirebase(); }, 2000); 
}

// ==============================================================
// 7. INICIO APP DOCENTE Y DASHBOARD
// ==============================================================
window.iniciarAppDocente = async function() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-teacher').classList.add('active');

  // El admin principal ve la pestaña de gestión de docentes
  if (esAdmin) {
    document.getElementById('teacher-tabs').style.display = 'flex';
    await window.renderTeacherManagementUI();
  } else if (esDocenteSecundario) {
    // Los docentes secundarios ven su propia UI de gestión de grupos
    document.getElementById('teacher-tabs').style.display = 'none';
    document.getElementById('filtro-grupo').style.display = 'none'; // Ocultamos el filtro global
    document.getElementById('teacher-secondary-controls').style.display = 'block';
    await window.renderSecondaryTeacherUI();
  }
  await window.renderTeacherDashboard();
}

window.renderTeacherDashboard = async function() {
  const tbody = document.getElementById('teacher-tbody');
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;"><i data-lucide="loader-2" class="lucide-spin"></i> Cargando estudiantes desde Firebase...</td></tr>`;
  if (window.lucide) lucide.createIcons();

  let filtroGrupos = [];
  // El admin ve todos los grupos o el que filtre
  if (esAdmin) {
      const filtroSeleccionado = document.getElementById('filtro-grupo').value;
      if (filtroSeleccionado !== "TODOS") {
          filtroGrupos.push(filtroSeleccionado);
      }
  }
  // El docente secundario solo ve los grupos que tiene asignados
  if (esDocenteSecundario) {
      const rolesDoc = await getDoc(doc(db, "config", "roles"));
      if (rolesDoc.exists()) {
          const docenteData = rolesDoc.data().gruposPorDocente?.[currentUser.email];
          if (docenteData) filtroGrupos = docenteData;
      }
  }

  try {
      // Si hay filtros de grupo, los aplicamos a la consulta
      const q = filtroGrupos.length > 0 
          ? query(collection(db, "users"), where("grado", "in", filtroGrupos))
          : query(collection(db, "users"));

      const querySnapshot = await getDocs(q);
      allStudentsData = [];
      querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if(data.email !== ADMIN_EMAIL) allStudentsData.push(data);
      });

      tbody.innerHTML = '';
      const totalRetos = Object.keys(weeks).length * 3;
      
      allStudentsData.forEach(est => {
          let completados = 0;
          if(est.progress) { Object.values(est.progress).forEach(val => { if(val===true) completados++; }); }
          
          const porcentaje = (completados / totalRetos) * 100;
          const notaFinal = ((porcentaje / 100) * 4.0) + 1.0; 

          tbody.innerHTML += `
            <tr>
              <td><strong>${est.nombres || 'Sin nombre'}</strong><br><small style="color:var(--text-muted)">${est.email}</small></td>
              <td>${est.grado || 'N/A'}</td>
              <td>
                ${Math.round(porcentaje)}% (${completados}/${totalRetos})
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: ${porcentaje}%"></div>
                </div>
              </td>
              <td style="color:#e3b341; font-weight:bold;">🪙 ${est.monedas || 0}</td>
              <td><strong style="color: ${notaFinal >= 3.0 ? 'var(--accent)' : 'var(--error-color)'}; font-size: 1.1em;">${notaFinal.toFixed(1)}</strong></td>
            </tr>
          `;
      });
      
      if (allStudentsData.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay estudiantes para los grupos seleccionados.</td></tr>`;
      }
      if (window.lucide) lucide.createIcons();
  } catch(e) {
      console.error("Error al cargar dashboard", e);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--error-color);">Error cargando datos de Firebase.</td></tr>`;
  }
}

window.exportarCSV = function() {
  let csvContent = "\uFEFFNombre,Correo,Grupo,Retos Completados,Porcentaje,Monedas,Nota Final (1.0 - 5.0)\n";
  const filtro = document.getElementById('filtro-grupo').value;
  const totalRetos = Object.keys(weeks).length * 3;

  const estudiantesFiltrados = allStudentsData.filter(est => {
      if(est.email === ADMIN_EMAIL) return false;
      return filtro === "TODOS" || est.grado === filtro;
  });

  if (estudiantesFiltrados.length === 0) return alert("No hay datos para exportar.");

  estudiantesFiltrados.forEach(est => {
      let completados = 0;
      if(est.progress) { Object.values(est.progress).forEach(val => { if(val===true) completados++; }); }
      
      const porcentaje = (completados / totalRetos) * 100;
      const notaFinal = ((porcentaje / 100) * 4.0) + 1.0;
      
      const fila = `"${est.nombres || ''}","${est.email}","${est.grado || ''}","${completados}/${totalRetos}","${porcentaje.toFixed(1)}%","${est.monedas || 0}","${notaFinal.toFixed(1)}"`;
      csvContent += fila + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `Planilla_Notas_Wokwi_${filtro}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==============================================================
// 8. INICIO APP ESTUDIANTE Y PERSONALIZACIÓN UI
// ==============================================================
function iniciarAppEstudiante() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-teacher').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  
  // Aplicar tema y avatar (si el admin tiene datos de estudiante)
  aplicarTemaYAvatarUI();

  const headerButtons = document.getElementById('header-buttons');
  if(!document.getElementById('header-user-badge')) {
    const badge = document.createElement('div'); 
    badge.id = 'header-user-badge';
    badge.className = 'user-badge flex-icon';
    
    // Si es el admin principal, añadir el botón de "Modo Dios"
    const adminButton = esAdmin 
      ? `<button class="btn-admin-mode flex-icon" onclick="window.iniciarAppDocente()" title="Modo Dios"><i data-lucide="crown"></i> Admin</button>` 
      : '';

    badge.innerHTML = `<i id="header-avatar" data-lucide="${userData.avatar || 'user'}"></i> <span>${(userData.nombres || 'Admin').split(' ')[0]}</span> ${adminButton} <button class="btn-logout flex-icon" onclick="window.logout()" title="Cerrar Sesión"><i data-lucide="log-out"></i> Salir</button>`;
    
    headerButtons.appendChild(badge);
  }

  cargarDatosGamificacion(); 
  window.loadWeek(); 
  updateProgress(); 
  if (window.lucide) lucide.createIcons();
}

function aplicarTemaYAvatarUI() {
  const themeObj = tiendaItems.themes.find(t => t.id === (userData.theme || 'blue')) || tiendaItems.themes[0];
  document.documentElement.style.setProperty('--wokwi-blue', themeObj.color);
  
  const iconEl = document.getElementById('header-avatar');
  if(iconEl) { iconEl.setAttribute('data-lucide', userData.avatar || 'user'); if (window.lucide) lucide.createIcons(); }

  if(userData.themeMode === 'light') {
    document.body.setAttribute('data-theme', 'light');
    document.getElementById('btn-theme').innerHTML = `<i data-lucide="moon"></i> Tema Oscuro`;
  } else {
    document.body.removeAttribute('data-theme');
    document.getElementById('btn-theme').innerHTML = `<i data-lucide="sun"></i> Tema Claro`;
  }
}

window.toggleTheme = function() {
  userData.themeMode = userData.themeMode === 'light' ? 'dark' : 'light';
  saveToFirebase(); aplicarTemaYAvatarUI();
}

// ==============================================================
// 9. GESTIÓN DE DOCENTES (MODO DIOS)
// ==============================================================

window.cambiarTabDocente = function(tab) {
  document.getElementById('tab-estudiantes').style.display = 'none';
  document.getElementById('tab-gestion-docentes').style.display = 'none';
  document.getElementById('btn-tab-estudiantes').classList.remove('active');
  document.getElementById('btn-tab-gestion').classList.remove('active');

  document.getElementById(`tab-${tab}`).style.display = 'block';
  document.getElementById(`btn-tab-${tab === 'estudiantes' ? 'estudiantes' : 'gestion'}`).classList.add('active');
  if (window.lucide) lucide.createIcons();
}

async function getRoles() {
    const rolesDoc = await getDoc(doc(db, "config", "roles"));
    if (rolesDoc.exists()) {
        return rolesDoc.data();
    }
    // Si no existe, lo creamos con valores por defecto
    const defaultRoles = { docentes: [], gruposPorDocente: {} };
    await setDoc(doc(db, "config", "roles"), defaultRoles);
    return defaultRoles;
}

window.renderTeacherManagementUI = async function() {
    const roles = await getRoles();
    const container = document.getElementById('docentes-list');
    container.innerHTML = roles.docentes.map(email => `
        <div class="docente-item">
            <span>${email}</span>
            <button class="btn-delete-docente" onclick="window.removeDocente('${email}')"><i data-lucide="trash-2"></i></button>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

window.addDocente = async function() {
    const input = document.getElementById('new-docente-email');
    const email = input.value.trim().toLowerCase();
    if (email && email.endsWith('@itspereira.edu.co')) {
        const roles = await getRoles();
        if (!roles.docentes.includes(email)) {
            roles.docentes.push(email);
            await setDoc(doc(db, "config", "roles"), roles, { merge: true });
            input.value = '';
            await renderTeacherManagementUI();
        } else {
            alert('Este docente ya existe en la lista.');
        }
    } else {
        alert('Por favor, ingresa un correo institucional válido.');
    }
}

window.removeDocente = async function(email) {
    if (confirm(`¿Seguro que deseas eliminar al docente ${email}? También se eliminarán sus grupos asignados.`)) {
        const roles = await getRoles();
        roles.docentes = roles.docentes.filter(d => d !== email);
        delete roles.gruposPorDocente[email]; // Elimina los grupos asociados
        await setDoc(doc(db, "config", "roles"), roles);
        await renderTeacherManagementUI();
    }
}

// --- Funciones para Docentes Secundarios ---

window.renderSecondaryTeacherUI = async function() {
    const roles = await getRoles();
    const misGrupos = roles.gruposPorDocente?.[currentUser.email] || [];
    const container = document.getElementById('my-groups-list');
    
    document.getElementById('docente-name').textContent = currentUser.displayName || currentUser.email;

    container.innerHTML = misGrupos.map(grupo => `
        <div class="docente-item">
            <span>${grupo}</span>
            <button class="btn-delete-docente" onclick="window.removeMyGroup('${grupo}')"><i data-lucide="trash-2"></i></button>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
    await window.renderTeacherDashboard(); // Actualizamos la tabla de estudiantes
}

window.addMyGroup = async function() {
    const input = document.getElementById('new-group-name');
    const grupo = input.value.trim().toUpperCase();
    if (grupo) {
        const roles = await getRoles();
        if (!roles.gruposPorDocente[currentUser.email]) {
            roles.gruposPorDocente[currentUser.email] = [];
        }
        if (!roles.gruposPorDocente[currentUser.email].includes(grupo)) {
            roles.gruposPorDocente[currentUser.email].push(grupo);
            await setDoc(doc(db, "config", "roles"), roles, { merge: true });
            input.value = '';
            await renderSecondaryTeacherUI();
        } else {
            alert('Ya tienes este grupo asignado.');
        }
    }
}

window.removeMyGroup = async function(grupo) {
    const roles = await getRoles();
    roles.gruposPorDocente[currentUser.email] = roles.gruposPorDocente[currentUser.email].filter(g => g !== grupo);
    await setDoc(doc(db, "config", "roles"), roles, { merge: true });
    await renderSecondaryTeacherUI();
}

// ==============================================================
// 9. MODAL DE GAMIFICACIÓN: RANKING Y TIENDA
// ==============================================================
window.abrirModalGamificacion = function() {
  document.getElementById('modal-gamificacion').style.display = 'flex';
  window.cambiarTabGamificacion('ranking');
}
window.cerrarModalGamificacion = function() { document.getElementById('modal-gamificacion').style.display = 'none'; }

window.cambiarTabGamificacion = function(tab) {
  document.getElementById('btn-tab-ranking').classList.remove('active'); document.getElementById('btn-tab-tienda').classList.remove('active');
  document.getElementById('tab-ranking').style.display = 'none'; document.getElementById('tab-tienda').style.display = 'none';
  document.getElementById(`btn-tab-${tab}`).classList.add('active'); document.getElementById(`tab-${tab}`).style.display = 'block';

  if (tab === 'ranking') cargarRankingNube();
  if (tab === 'tienda') renderTiendaUI();
}

async function cargarRankingNube() {
  const tbody = document.getElementById('ranking-tbody');
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;"><i data-lucide="loader-2" class="lucide-spin"></i> Conectando a la Nube...</td></tr>`;
  if (window.lucide) lucide.createIcons();

  try {
    const q = query(collection(db, "users"), orderBy("monedas", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    
    let html = ''; let rank = 1;
    querySnapshot.forEach((docSnap) => {
      let d = docSnap.data();
      if(d.email === ADMIN_EMAIL) return; // Omitir al profesor del ranking

      let iconColor = rank === 1 ? '#fbbf24' : (rank === 2 ? '#94a3b8' : (rank === 3 ? '#b45309' : 'var(--text-light)'));
      let badge = rank === 1 ? '👑' : `#${rank}`;
      
      html += `<tr>
        <td style="color:${iconColor}; font-size:1.1rem;">${badge}</td>
        <td><div class="flex-icon" style="justify-content:flex-start;"><i data-lucide="${d.avatar || 'user'}"></i> ${d.nombres}</div></td>
        <td>${d.grado || 'N/A'}</td>
        <td style="color:#e3b341; font-weight:bold;">🪙 ${d.monedas || 0}</td>
        <td style="color:#ff5722;">🔥 ${d.streak || 0}</td>
      </tr>`;
      rank++;
    });

    if(html === '') html = `<tr><td colspan="5" style="text-align:center;">No hay datos suficientes aún.</td></tr>`;
    tbody.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  } catch (error) {
    console.error("Error cargando ranking", error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--error-color);">Error de conexión al cargar Ranking.</td></tr>`;
  }
}

function renderTiendaUI() {
  document.getElementById('tienda-user-monedas').innerText = userData.monedas;

  const avContainer = document.getElementById('store-avatars');
  avContainer.innerHTML = tiendaItems.avatars.map(item => {
    let isOwned = userData.inventory.avatars.includes(item.id);
    let isActive = userData.avatar === item.id;
    let btnHtml = isActive ? `<button class="btn-equipped">Equipado</button>` : 
                 (isOwned ? `<button class="btn-equip" onclick="window.equiparArticulo('avatar', '${item.id}')">Equipar</button>` : 
                            `<button class="btn-buy" onclick="window.comprarArticulo('avatar', '${item.id}')">Comprar 🪙 ${item.price}</button>`);

    return `<div class="store-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}">
      <i data-lucide="${item.icon}" style="width:40px; height:40px; color:${isActive ? 'var(--wokwi-blue)' : 'var(--text-light)'};"></i>
      <div style="font-weight:bold;">${item.name}</div>
      ${btnHtml}
    </div>`;
  }).join('');

  const thContainer = document.getElementById('store-themes');
  thContainer.innerHTML = tiendaItems.themes.map(item => {
    let isOwned = userData.inventory.themes.includes(item.id);
    let isActive = userData.theme === item.id;
    let btnHtml = isActive ? `<button class="btn-equipped" style="background:${item.color};">Equipado</button>` : 
                 (isOwned ? `<button class="btn-equip" onclick="window.equiparArticulo('theme', '${item.id}')">Equipar</button>` : 
                            `<button class="btn-buy" onclick="window.comprarArticulo('theme', '${item.id}')">Comprar 🪙 ${item.price}</button>`);

    return `<div class="store-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}">
      <div style="width:40px; height:40px; border-radius:50%; background:${item.color}; border: 2px solid var(--border-color);"></div>
      <div style="font-weight:bold;">${item.name}</div>
      ${btnHtml}
    </div>`;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

window.comprarArticulo = function(tipo, id) {
  let list = tipo === 'avatar' ? tiendaItems.avatars : tiendaItems.themes;
  let invList = tipo === 'avatar' ? userData.inventory.avatars : userData.inventory.themes;
  let item = list.find(i => i.id === id);
  if(!item) return;

  if (userData.monedas >= item.price) {
    userData.monedas -= item.price;
    invList.push(item.id);
    if (tipo === 'avatar') userData.avatar = item.id;
    if (tipo === 'theme') userData.theme = item.id;

    saveToFirebase(); aplicarTemaYAvatarUI(); document.getElementById('user-monedas').innerText = userData.monedas;
    playCoinSound(); renderTiendaUI();
  } else { playErrorSound(); alert(`🪙 Monedas insuficientes (Cuesta ${item.price}).`); }
}

window.equiparArticulo = function(tipo, id) {
  if (tipo === 'avatar') userData.avatar = id;
  if (tipo === 'theme') userData.theme = id;
  saveToFirebase(); aplicarTemaYAvatarUI(); playLifeSound(); renderTiendaUI();
}

// ==============================================================
// 10. FUNCIONES GAMIFICACIÓN LOCAL (Pistas, Vida, Teoría)
// ==============================================================
function cargarDatosGamificacion() {
  document.getElementById('stats-panel').style.display = 'flex';
  document.getElementById('volts-count').innerText = userData.volts || 0;
  document.getElementById('user-monedas').innerText = userData.monedas || 0;

  const hoy = new Date().toDateString();
  if (userData.lastLogin !== hoy) {
    if (userData.lastLogin) {
      const diffDias = Math.ceil(Math.abs(new Date(hoy) - new Date(userData.lastLogin)) / (1000 * 60 * 60 * 24));
      if (diffDias === 1) userData.streak += 1; else userData.streak = 1; 
    } else userData.streak = 1; 
    userData.lastLogin = hoy; saveToFirebase();
  }
  document.getElementById('streak-count').innerText = userData.streak || 0;
}

window.reclamarMonedas = function(semanaId, nivel, cantidad) {
  const claveReclamada = `teoria_leida_${semanaId}_${nivel}`;
  if (userData.teoria[claveReclamada] === true) return;
  userData.monedas += cantidad; userData.teoria[claveReclamada] = true;
  document.getElementById('user-monedas').innerText = userData.monedas; saveToFirebase();
  const btn = document.getElementById(`btn-teoria-${nivel}`); btn.classList.add('reclamado'); btn.innerText = '✔️ Recompensa Reclamada'; btn.onclick = null;
  playCoinSound(); confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
};

window.abrirModalTeoria = function(semanaId, nivel) {
  const teoriaData = weeks[semanaId]?.teoria?.[nivel];
  if (!teoriaData) return;

  const modal = document.getElementById('modal-teoria');
  modal.innerHTML = `
    <div class="modal-box teoria-modal-content">
      <div class="modal-header">
        <h2 class="flex-icon" style="border:none; margin:0; padding:0;"><i data-lucide="book-open-check"></i> Módulo de Teoría</h2>
        <button class="close-btn" onclick="document.getElementById('modal-teoria').style.display='none'"><i data-lucide="x"></i></button>
      </div>
      <div class="teoria-modal-body">
        <h3>${teoriaData.titulo}</h3>
        <p>${teoriaData.contenido}</p>
        <div class="teoria-ejemplo">${teoriaData.ejemplo}</div>
      </div>
      <div id="quiz-container" class="quiz-container">
        <h4><i data-lucide="file-question"></i> Quiz de Verificación</h4>
        <p class="quiz-pregunta">${teoriaData.quiz.pregunta}</p>
        <div class="quiz-opciones">
          ${teoriaData.quiz.opciones.map((op, i) => `<button id="opcion-${i}" onclick="window.verificarQuiz('${semanaId}', '${nivel}', ${i})">${op}</button>`).join('')}
        </div>
        <div id="quiz-feedback" class="quiz-feedback"></div>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();
}

window.verificarQuiz = function(semanaId, nivel, opcionSeleccionada) {
  const quizData = weeks[semanaId].teoria[nivel].quiz;
  const feedbackEl = document.getElementById('quiz-feedback');

  if (opcionSeleccionada === quizData.correcta) {
    feedbackEl.innerHTML = `<i data-lucide="check-circle"></i> ¡Correcto! Recompensa obtenida.`;
    feedbackEl.className = 'quiz-feedback success';
    
    const claveReclamada = `teoria_leida_${semanaId}_${nivel}`;
    if (userData.teoria[claveReclamada] !== true) {
      userData.monedas += weeks[semanaId].teoria[nivel].monedas;
      userData.teoria[claveReclamada] = true;
      document.getElementById('user-monedas').innerText = userData.monedas; saveToFirebase(); playCoinSound();
    }
    setTimeout(() => { document.getElementById('modal-teoria').style.display = 'none'; window.loadWeek(); confetti(); }, 1500);
  } else {
    feedbackEl.innerHTML = `<i data-lucide="x-circle"></i> Incorrecto. ${quizData.feedback} ¡Intenta de nuevo!`;
    feedbackEl.className = 'quiz-feedback error';
  }
}

window.ganarVolts = function(cantidad) { userData.volts += cantidad; document.getElementById('volts-count').innerText = userData.volts; playCoinSound(); saveToFirebase(); }

window.comprarEnergia = function(nivel) {
  if (userData.monedas >= 10) {
    userData.monedas -= 10; document.getElementById('user-monedas').innerText = userData.monedas; saveToFirebase();
    vidas[nivel] = 3; document.getElementById(`vidas-${nivel}`).innerHTML = '❤️❤️❤️';
    document.getElementById(`input-${nivel}`).disabled = false; document.getElementById(`feedback-${nivel}`).style.display = 'none';
    document.getElementById(`btn-container-${nivel}`).innerHTML = `<button id="btn-${nivel}" class="btn-verify flex-icon" onclick="window.verifyCode('${nivel}')" style="flex:1;"><i data-lucide="play"></i> Verificar</button><button class="btn-verify flex-icon" onclick="window.llevarAlSimulador('${nivel}')" style="flex:1; background:var(--wokwi-blue);"><i data-lucide="external-link"></i> Probar en Simulador</button>`;
    playLifeSound(); if (window.lucide) lucide.createIcons();
  } else { playErrorSound(); alert("🪙 Monedas insuficientes (Necesitas 10)."); }
};

window.comprarPista = function(nivel) {
  const reto = weeks[currentRetoId].retos[nivel];
  if (pistasDesbloqueadas[nivel] >= reto.pistas.length) return;
  if (userData.volts >= 5) {
    userData.volts -= 5; document.getElementById('volts-count').innerText = userData.volts; saveToFirebase();
    playCoinSound(); pistasDesbloqueadas[nivel]++; renderPistas(nivel, reto);
  } else { playErrorSound(); alert("⚡ Volts insuficientes (Necesitas 5)."); }
};

function renderPistas(nivel, reto) {
  const pistaBox = document.getElementById(`pista-${nivel}`); pistaBox.classList.add('visible'); pistaBox.innerHTML = ''; 
  for(let i=0; i < pistasDesbloqueadas[nivel]; i++) { pistaBox.innerHTML += `<div class="pista-item"><strong>Pista ${i+1}:</strong> ${reto.pistas[i]}</div>`; }
  if (pistasDesbloqueadas[nivel] < reto.pistas.length) { pistaBox.innerHTML += `<button class="btn-comprar-pista flex-icon" onclick="window.comprarPista('${nivel}')"><i data-lucide="unlock"></i> Comprar Pista (5 ⚡)</button>`; }
  if (window.lucide) lucide.createIcons();
}

// ==============================================================
// 11. MOTOR EVALUADOR Y SIMULADOR
// ==============================================================
window.llevarAlSimulador = function(nivel) {
  const txt = document.getElementById(`input-${nivel}`).value;
  if (txt.trim().length < 5) return alert("Escribe un poco de código primero para probarlo.");
  
  navigator.clipboard.writeText(txt).then(() => {
    const iframe = document.getElementById('wokwi-iframe');
    iframe.classList.add('iframe-highlight');
    setTimeout(() => iframe.classList.remove('iframe-highlight'), 3000);

    const fb = document.getElementById(`feedback-${nivel}`);
    fb.className = "feedback success"; fb.style.borderColor = "var(--wokwi-blue)"; fb.style.backgroundColor = "rgba(47, 129, 247, 0.1)"; fb.style.display = "block";
    fb.innerHTML = `<div class="flex-icon"><i data-lucide="copy-check"></i> ¡Código Copiado! Haz clic dentro del Simulador y presiona Ctrl + V</div>`;
    if (window.lucide) lucide.createIcons();
  });
}

function limpiarCodigo(codigoRaw) { return codigoRaw.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''); }

function linterDidactico(codigoLimpio) {
  let errores = []; let llaves = 0, parentesis = 0;
  for (let char of codigoLimpio) {
    if (char === '{') llaves++; if (char === '}') llaves--;
    if (char === '(') parentesis++; if (char === ')') parentesis--;
  }
  if (llaves !== 0) errores.push("⚖️ <strong>¡Desbalance de llaves {}!</strong> Todo bloque que abres debes cerrarlo.");
  if (parentesis !== 0) errores.push("⚖️ <strong>¡Paréntesis huérfano ()!</strong> Revisa las condiciones, te falta cerrar un paréntesis.");

  const lineas = codigoLimpio.split('\n');
  lineas.forEach((linea) => {
    let l = linea.trim();
    if (l.length === 0 || l.startsWith('#') || l.endsWith('{') || l === '}') return;
    if (l.startsWith('if') || l.startsWith('for') || l.startsWith('while') || l.startsWith('else')) return;
    const inst = /pinMode|digitalWrite|analogWrite|delay|Serial|lcd|servo|tone|noTone|int|float|bool|long/i;
    if (inst.test(l) && !l.endsWith(';')) {
      let lineaCorta = l.length > 30 ? l.substring(0, 30) + '...' : l;
      errores.push(`🔍 Arduino no sabe dónde termina la orden <code>${lineaCorta}</code>. ¿Olvidaste el punto y coma (;) al final?`);
    }
  });
  return errores;
}

window.validarSintaxis = function(nivel) {
  const txt = document.getElementById(`input-${nivel}`); if(!txt) return;
  const val = txt.value; 
  if(currentUser) { if(!userData.drafts) userData.drafts = {}; userData.drafts[`draft_${currentRetoId}_${nivel}`] = val; autoGuardarEnNube(); }

  const bar = document.getElementById(`syntax-${nivel}`); let tags = [];
  if (val.length < 5) { txt.classList.remove('syntax-ok','syntax-error'); bar.innerHTML = '<span class="syntax-chip chip-info">Escribe para analizar...</span>'; return; }
  
  let ok = true;
  if(val.includes('setup()') && val.includes('loop()')) tags.push('<span class="syntax-chip chip-ok"><i data-lucide="check"></i> Estructura</span>'); else { tags.push('<span class="syntax-chip chip-error"><i data-lucide="x"></i> Falta setup/loop</span>'); ok = false; }
  if (ok) { txt.classList.add('syntax-ok'); txt.classList.remove('syntax-error'); } else { txt.classList.add('syntax-error'); txt.classList.remove('syntax-ok'); }
  bar.innerHTML = tags.join(''); if (window.lucide) lucide.createIcons();
}

window.verifyCode = function(nivel) {
  if (vidas[nivel] <= 0) return;
  initAudio(); 
  const btn = document.getElementById(`btn-${nivel}`); btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> Analizando...`; btn.disabled = true;

  setTimeout(() => {
    const originalCode = document.getElementById(`input-${nivel}`).value;
    const fb = document.getElementById(`feedback-${nivel}`);
    const codigoLimpio = limpiarCodigo(originalCode);
    const erroresSintaxis = linterDidactico(codigoLimpio);

    if (erroresSintaxis.length > 0) {
       fb.className = "feedback error"; fb.style.borderColor = "var(--warning-color)"; fb.style.backgroundColor = "rgba(214,158,46,0.1)"; 
       let listaErrores = erroresSintaxis.map(e => `<li style="margin-bottom:6px; color: var(--text-light);">${e}</li>`).join('');
       fb.innerHTML = `<div style="color: var(--warning-color); margin-bottom: 10px; font-size: 1rem;" class="flex-icon"><i data-lucide="bot"></i> <strong>Asistente de Sintaxis dice:</strong></div><ul style="margin-left: 20px; font-size: 0.9rem;">${listaErrores}</ul><div style="margin-top: 12px; font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 8px;">💡 Los errores de escritura no te quitan corazones ❤️. ¡Corrige y reintenta!</div>`;
       btn.innerHTML = `<i data-lucide="play"></i> Verificar`; btn.disabled = false; if (window.lucide) lucide.createIcons(); return; 
    }

    const cleanCode = codigoLimpio.replace(/\s+/g, '');
    const reto = weeks[currentRetoId].retos[nivel];
    let success = true;

    if (reto.match) { reto.match.forEach(str => { if (!cleanCode.includes(str)) success = false; }); }
    if (reto.minCount) {
      for (const [key, val] of Object.entries(reto.minCount)) {
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'), 'g');
        if ((cleanCode.match(regex) || []).length < val) success = false;
      }
    }
    
    if (success) {
      fb.className = "feedback success"; fb.style.borderColor = ""; fb.style.backgroundColor = ""; 
      fb.innerHTML = `<div class="flex-icon"><i data-lucide="check-circle-2"></i> ${mensajesExito[Math.floor(Math.random()*mensajesExito.length)]}</div>`;
      confetti(); stopTimer(nivel);
      
      userData.savedCodes[`code_${currentRetoId}_${nivel}`] = originalCode;
      
      const isAlreadyDone = userData.progress[`reto_${currentRetoId}_${nivel}`] === true;
      if (!isAlreadyDone) { window.ganarVolts(nivel === 'basico' ? 10 : (nivel === 'alto' ? 20 : 30)); } else playCoinSound(); 

      userData.progress[`reto_${currentRetoId}_${nivel}`] = true;
      const currentRecord = userData.records[`record_${currentRetoId}_${nivel}`];
      if (!currentRecord || timers[nivel] < parseInt(currentRecord)) { userData.records[`record_${currentRetoId}_${nivel}`] = timers[nivel]; }
      
      saveToFirebase(); updateProgress(); setTimeout(() => { window.loadWeek(); }, 3500); 

    } else {
      fallos[nivel]++; vidas[nivel]--; playErrorSound(); 
      let corazones = ''; for(let i=0; i<3; i++) corazones += (i < vidas[nivel]) ? '❤️' : '🖤';
      document.getElementById(`vidas-${nivel}`).innerHTML = corazones;
      
      fb.className = "feedback error"; fb.style.borderColor = ""; fb.style.backgroundColor = ""; 
      
      if (vidas[nivel] <= 0) {
        fb.innerHTML = `<div class="flex-icon" style="margin-bottom:8px;"><i data-lucide="skull"></i> Lógica incorrecta. Sin energía.</div>`;
        document.getElementById(`input-${nivel}`).disabled = true; stopTimer(nivel);
        document.getElementById(`btn-container-${nivel}`).innerHTML = `<button class="btn-comprar-vida flex-icon" onclick="window.comprarEnergia('${nivel}')"><i data-lucide="battery-charging"></i> Recuperar 3 ❤️ (10 🪙)</button>`;
      } else {
        fb.innerHTML = `<div class="flex-icon"><i data-lucide="x-circle"></i> ${mensajesFallo[Math.floor(Math.random()*mensajesFallo.length)]}</div>`;
        if (pistasDesbloqueadas[nivel] === 0) pistasDesbloqueadas[nivel] = 1;
        renderPistas(nivel, reto);
      }
    }
    if (vidas[nivel] > 0) { btn.innerHTML = `<i data-lucide="play"></i> Verificar`; btn.disabled = false; }
    if (window.lucide) lucide.createIcons();
  }, 800);
}

// ==============================================================
// 12. RENDERIZADO DE LAS SEMANAS Y EL EDITOR
// ==============================================================
window.loadWeek = function() {
  currentRetoId = document.getElementById('week-select').value;
  const data = weeks[currentRetoId]; if (!data) return;

  document.getElementById('w-competencia').innerHTML = `<strong style="color:var(--wokwi-blue)">Competencia: ${competenciasMapa[currentRetoId]}</strong><br><span style="color:var(--text-light); font-size:0.95rem; display:block; margin-top:5px;">${data.introduccion}</span>`;
  
  const container = document.getElementById('teoria-container'); container.innerHTML = ''; 
  ['basico', 'alto', 'superior'].forEach(nivel => {
    if(!data.teoria[nivel]) return;

    const t = data.teoria[nivel]; 
    const claveReclamada = `teoria_leida_${currentRetoId}_${nivel}`; 
    const yaReclamado = userData.teoria[claveReclamada] === true;
    
    let isLocked = false;
    if (nivel === 'alto' && !userData.teoria[`teoria_leida_${currentRetoId}_basico`]) {
      isLocked = true;
    }
    if (nivel === 'superior' && !userData.teoria[`teoria_leida_${currentRetoId}_alto`]) {
      isLocked = true;
    }

    const tarjeta = document.createElement('div'); tarjeta.className = `teoria-card border-${nivel}`;
    const yaReclamadoIcon = yaReclamado ? '<i data-lucide="check-circle-2" class="reclamado-check"></i>' : '';

    tarjeta.innerHTML = `<div class="teoria-header"><h4><i data-lucide="book-open"></i> ${t.titulo}</h4><span class="recompensa-badge">🪙 +${t.monedas} ${yaReclamadoIcon}</span></div>`;

    if (isLocked) {
      tarjeta.classList.add('locked');
      tarjeta.innerHTML += `<div class="teoria-locked-overlay"><i data-lucide="lock"></i> Completa el nivel anterior para desbloquear</div>`;
    } else if (!yaReclamado) {
      tarjeta.classList.add('clickable');
      tarjeta.onclick = () => window.abrirModalTeoria(currentRetoId, nivel);
    }

    container.appendChild(tarjeta);
  });

  document.getElementById('w-challenge').innerHTML = data.challenge; document.getElementById('w-code').textContent = data.code;
  document.getElementById('w-components').innerHTML = data.components.map(c => `<span class="tag">${c}</span>`).join('');
  document.getElementById('w-wiring').innerHTML = data.wiring.map(w => `<li>${w}</li>`).join('');

  const expContainer = document.getElementById('w-explicacion'); expContainer.innerHTML = ''; 
  if (data.explicacion) data.explicacion.forEach(p => expContainer.innerHTML += `<div class="step-card"><div class="step-code">${p.codigo.replace(/\n/g, '<br>')}</div><div class="step-text">${p.texto}</div></div>`);

  ['basico', 'alto', 'superior'].forEach(nivel => {
    stopTimer(nivel); timers[nivel] = 0; fallos[nivel] = 0; vidas[nivel] = 3; pistasDesbloqueadas[nivel] = 0;
    document.getElementById(`timer-${nivel}`).textContent = `⏱ 00:00`; document.getElementById(`vidas-${nivel}`).innerHTML = '❤️❤️❤️';
    const input = document.getElementById(`input-${nivel}`); 
    if(input) { input.disabled = false; input.classList.remove('syntax-ok','syntax-error'); }
    const btnCont = document.getElementById(`btn-container-${nivel}`);
    if(btnCont) btnCont.innerHTML = `<button id="btn-${nivel}" class="btn-verify flex-icon" onclick="window.verifyCode('${nivel}')" style="flex:1;"><i data-lucide="play"></i> Verificar</button><button class="btn-verify flex-icon" onclick="window.llevarAlSimulador('${nivel}')" style="flex:1; background:var(--wokwi-blue);"><i data-lucide="external-link"></i> Probar en Simulador</button>`;
    document.getElementById(`feedback-${nivel}`).style.display = 'none'; document.getElementById(`pista-${nivel}`).classList.remove('visible');
    
    if(data.retos[nivel]) {
      document.getElementById(`r-container-${nivel}`).style.display = 'block'; document.getElementById(`r-desc-${nivel}`).innerHTML = data.retos[nivel].desc;
      const isDone = userData.progress[`reto_${currentRetoId}_${nivel}`] === true;
      const record = userData.records[`record_${currentRetoId}_${nivel}`];
      const doneBadge = document.getElementById(`done-${nivel}`); const evalBox = document.getElementById(`eval-${nivel}`);
      const codeFinal = userData.savedCodes[`code_${currentRetoId}_${nivel}`]; const borrador = userData.drafts[`draft_${currentRetoId}_${nivel}`];
      
      if (input) { if (isDone && codeFinal) input.value = codeFinal; else if (borrador) input.value = borrador; else input.value = ""; }
      if (isDone) {
        doneBadge.style.display = 'flex'; evalBox.style.display = 'block'; if(btnCont) btnCont.style.display = 'none';
        if(record) { document.getElementById(`record-done-${nivel}`).style.display = 'inline-block'; document.getElementById(`record-done-${nivel}`).textContent = `⏱ Récord: ${formatTime(parseInt(record))}`; }
      } else {
        doneBadge.style.display = 'none'; evalBox.style.display = 'block'; if(btnCont) btnCont.style.display = 'flex';
        if(record) { document.getElementById(`record-${nivel}`).style.display = 'inline-block'; document.getElementById(`record-${nivel}`).textContent = `🏆 Mejor: ${formatTime(parseInt(record))}`; } else document.getElementById(`record-${nivel}`).style.display = 'none';
      }
      window.validarSintaxis(nivel);
    } else document.getElementById(`r-container-${nivel}`).style.display = 'none';
  });
  if (window.lucide) lucide.createIcons();
};

window.resetProgress = function() {
  if(confirm('¿Seguro que deseas reiniciar tu código? Se borrarán tus borradores no verificados de esta semana.')) {
    ['basico', 'alto', 'superior'].forEach(nivel => {
      delete userData.drafts[`draft_${currentRetoId}_${nivel}`];
      const isDone = userData.progress[`reto_${currentRetoId}_${nivel}`] === true;
      const input = document.getElementById(`input-${nivel}`);
      if (input && !isDone) input.value = '';
    });
    saveToFirebase(); window.loadWeek(); 
  }
}

// ==============================================================
// 13. FUNCIONES AUXILIARES (Utilidades)
// ==============================================================
window.copyCode = function() { navigator.clipboard.writeText(document.getElementById('w-code').textContent).then(() => { const btn = document.getElementById('btnCopy'); const orig = btn.innerHTML; btn.innerHTML = `<i data-lucide="check"></i> Copiado`; lucide.createIcons(); setTimeout(() => { btn.innerHTML = orig; lucide.createIcons(); }, 2000); }); }
function formatTime(sec) { return `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`; }
function iniciarTimerSiNecesario(nivel) { if (!intervalos[nivel] && vidas[nivel] > 0) { timers[nivel] = 0; document.getElementById(`timer-${nivel}`).textContent = `⏱ 00:00`; intervalos[nivel] = setInterval(() => { timers[nivel]++; document.getElementById(`timer-${nivel}`).textContent = `⏱ ${formatTime(timers[nivel])}`; }, 1000); } }
function stopTimer(nivel) { if (intervalos[nivel]) { clearInterval(intervalos[nivel]); intervalos[nivel] = null; } }

function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
function playCoinSound() { initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.type = 'square'; osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1); gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.4); }
function playErrorSound() { initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3); gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.3); }
function playLifeSound() { initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.5); }

function updateProgress() {
  if (!currentUser || currentUser.email === ADMIN_EMAIL) return;
  const totalRetos = Object.keys(weeks).length * 3; let completados = 0; const container = document.getElementById('progreso-semanas'); container.innerHTML = '';
  Object.keys(weeks).forEach(sem => {
    let semCompletados = 0;
    ['basico', 'alto', 'superior'].forEach(n => { if(userData.progress[`reto_${sem}_${n}`] === true) { completados++; semCompletados++; } });
    const dot = document.createElement('div'); dot.className = 'semana-dot';
    if(semCompletados > 0 && semCompletados < 3) dot.classList.add('parcial'); else if(semCompletados === 3) dot.classList.add('completa');
    if(sem === currentRetoId) dot.classList.add('activa'); container.appendChild(dot);
  });
  document.getElementById('progreso-fill').style.width = (completados / totalRetos) * 100 + '%'; document.getElementById('progreso-texto').textContent = `${completados} / ${totalRetos} retos`;
}

window.imprimirPortafolio = function() {
  if(!currentUser) return alert('Debes iniciar sesión para imprimir tu portafolio.');
  let htmlContenido = `<div class="print-header"><h1>Portafolio de Códigos - Arduino</h1><h2>Instituto Técnico Superior</h2><h2><strong>Estudiante:</strong> ${userData.nombres} - <strong>Grado:</strong> ${userData.grado}</h2></div>`;
  let codigosEncontrados = 0;
  Object.keys(weeks).forEach(sem => {
    let contenidoSemana = '';
    ['basico', 'alto', 'superior'].forEach(nivel => {
      const isDone = userData.progress[`reto_${sem}_${nivel}`] === true;
      let userCode = (userData.savedCodes && userData.savedCodes[`code_${sem}_${nivel}`]) || (userData.drafts && userData.drafts[`draft_${sem}_${nivel}`]);
      if (isDone || (userCode && userCode.trim().length > 5)) { 
        if (!userCode) userCode = "// Reto superado exitosamente"; codigosEncontrados++;
        contenidoSemana += `<div class="print-code-box"><h4>Nivel ${nivel.toUpperCase()} - Módulo ${sem} ${isDone ? '✅' : '✍️(Borrador)'}</h4><pre><code>${userCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></div>`;
      }
    });
    if (contenidoSemana !== '') htmlContenido += `<div class="print-week"><h3>Semana ${sem}: ${weeks[sem].title}</h3>${contenidoSemana}</div>`;
  });
  if (codigosEncontrados === 0) return alert('Aún no tienes códigos escritos en tu cuenta de la nube.');
  document.getElementById('print-area').innerHTML = htmlContenido; setTimeout(() => { window.print(); }, 300);
};

window.descargarDiploma = function() {
  if(!currentUser) return;
  const totalRetos = Object.keys(weeks).length * 3; let completados = 0; let semanasSuperadas = new Set(); 
  Object.keys(weeks).forEach(sem => { ['basico', 'alto', 'superior'].forEach(n => { if(userData.progress[`reto_${sem}_${n}`] === true) { completados++; semanasSuperadas.add(sem); } }); });
  if(completados === 0) return alert('Debes completar al menos 1 reto.');

  document.getElementById('dip-nombre').textContent = userData.nombres; document.getElementById('dip-grado').textContent = userData.grado; document.getElementById('dip-progreso').textContent = `${Math.round((completados / totalRetos) * 100)}%`;
  let notaFinal = ((completados / totalRetos) * 5).toFixed(1); document.getElementById('dip-nota').textContent = `${notaFinal == "0.0" ? "1.0" : notaFinal} / 5.0`;
  const estadoBadge = document.getElementById('dip-estado');
  if(parseFloat(notaFinal) >= 3.0) { estadoBadge.textContent = "ESTADO: GRADUADO"; estadoBadge.style.background = "#238636"; } else { estadoBadge.textContent = "ESTADO: REPROBADO"; estadoBadge.style.background = "#d73a49"; }

  const ulComps = document.getElementById('dip-competencias'); ulComps.innerHTML = '';
  semanasSuperadas.forEach(sem => { if(competenciasMapa[sem]) ulComps.innerHTML += `<li>✅ ${competenciasMapa[sem]}</li>`; });
  document.getElementById('dip-fecha').textContent = new Date().toLocaleDateString();

  const btn = document.getElementById('btn-diploma'); const originalHTML = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> Generando...`; lucide.createIcons();
  html2canvas(document.getElementById('diploma-wrapper'), { scale: 2 }).then(canvas => {
    const link = document.createElement('a'); link.download = `Diploma_${userData.nombres}.png`; link.href = canvas.toDataURL('image/png'); link.click();
    btn.innerHTML = originalHTML; lucide.createIcons(); confetti(); playCoinSound();
  });
}

window.onload = () => { 
  document.getElementById('screen-login').classList.add('active'); 
  document.getElementById('screen-app').classList.remove('active'); 
  document.getElementById('screen-teacher').classList.remove('active');
  if (window.lucide) lucide.createIcons(); 
};