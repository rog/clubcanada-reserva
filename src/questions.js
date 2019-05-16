const questionsData = {
  'mayor3-anos': [
    {
      number: 1,
      question: '¿Ha tenido alguna experiencia en el agua?',
      yes: 2,
      no: 'tortuga'
    },
    {
      number: 2,
      question: '¿Sólo nada con flotis?',
      yes: 'tortuga',
      no: 3
    },
    {
      number: 3,
      question: '¿Es capaz de nadar más de 3 metros sin ninguna ayuda, es capaz de meter su cara y flota en posición dorsal?',
      yes: 4,
      no: 'tortuga'
    },
    {
      number: 4,
      question: '¿Es capaz de  nadar más de 5 metros sin ninguna ayuda y flota en posición dorsal independientemente?',
      yes: 5,
      no: 'payaso'
    },
    {
      number: 5,
      question: '¿Es capaz de  nadar más de 10 metros sin ninguna ayuda y gira la cabeza para poder respirar?',
      yes: 6,
      no: 'foca'
    },
    {
      number: 6,
      question: '¿Es capaz de realizar el estilo de crol y dorso de forma continua por 5 minutos?',
      yes: 7,
      no: 'delfin'
    },
    {
      number: 7,
      question: '¿Es capaz de nadar con estilo de crol y dorso por más de 10 minutos?',
      yes: 8,
      no: 'mantarraya'
    },
    {
      number: 8,
      question: '¿Es capaz de nadar todos los estilos crol, dorso, pecho y mariposa?',
      yes: 'espada',
      no: 'mantarraya'
    }
  ],
  'menor3-anos': [
    {
      number: 18,
      question: '¿Quieres clase de papás con bebés?',
      yes: 23,
      no: 'estrella',
      auto: true
    },
    {
      number: 26,
      question: '¿Tú pequeño se acuesta de muertito sin problema?',
      yes: 'estrella',
      no: 'caballo',
      auto: false
    },
    {
      number: 23,
      question: '¿Tu hijo gatea?',
      yes: 'mb-g',
      no: 'mb-ng',
      auto: true
    },
    {
      number: 24,
      question: '¿Tu hijo camina?',
      yes: 'mb-c',
      no: 23,
      auto: true
    }
  ],
  adultos: [
    {
      number: 30,
      question: 'Clase individual',
      yes: 'adultoind',
      no: 31
    },
    {
      number: 31,
      question: 'Clase Grupal',
      yes: 'adultogrp',
      no: 32
    },
    {
      number: 32,
      question: 'Aqua-Aerobics',
      yes: 'aquaaerobics',
      no: 'formulario'
    }
  ]
}

export default questionsData
