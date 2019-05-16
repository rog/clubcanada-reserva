<template>
  <div class="BookingForm">
    <div :class="{'BookingForm__Step': true, 'BookingForm__StepLast': testBooking}">
      <div :class="{'BookingForm__Left': true && !testBooking, 'BookingForm__Left__Expanded': step > 1 && !testBooking, 'BookingForm__Top': testBooking}">
        <div v-if="step === 1">
          <label class="BookingForm__Label">
            <span class="BookingForm__LabelTitle">¿Cuál es el nombre del alumno?</span>
            <input
              type="text"
              name="booking-name"
              class="BookingForm__Input"
              v-model="swimmerName"
            />
          </label>
          <label class="BookingForm__Label">
            <span class="BookingForm__LabelTitle">¿Cuál es su fecha de nacimiento?</span>
            <div class="BookingForm__Age">
              <span>{{ birthdayDateFormated || '&nbsp;' }}</span>
            </div>
            <datepicker
              v-model="swimmerBirthday"
              :inline="true"
              :initialView="'year'"
              :language="es"
              :disabledDates="dates"
              @selected="getBirthday"
            />
          </label>
        </div>
        <transition name="fade">
          <div v-if="step === 2" class="BookingForm__Sidebar">
            <span @click="bookingFormBack" class="BookingForm__Sidebar__Reset">&lt; Regresar</span>
            <p><span class="BookingForm__Sidebar__Title">Nombre del alumno</span>{{ swimmerName }}</p>
            <p><span class="BookingForm__Sidebar__Title">Fecha de nacimiento</span>{{ birthdayDateFormated }}</p>
            <p><span class="BookingForm__Sidebar__Title">Sucursal</span>{{ locationsData[swimmerLocation].name }}</p>
            <p v-if="testBooking">
              <span class="BookingForm__Sidebar__Title">Nivel</span>
              <span v-html="result.display_text"></span>
            </p>
          </div>
        </transition>
      </div>
      <div :class="{'BookingForm__Right': true && !testBooking, 'BookingForm__Right__Expanded': step > 1 && !testBooking, 'BookingForm__Bottom': testBooking}">
        <div v-if="step === 1">
          <h4>Elige tu sucursal más cercana</h4>
          <div class="BookingForm__PlaceOptions">
            <div class="BookingForm__Place">
              <div v-for="(location, index) in locationsData" class="BookingForm__Radio" :key="`location-${index}`">
                <input type="radio" :id="`location-${location.code}`" name="swimmerLocation" v-model="swimmerLocation" :value="location.code" @change="checkAvailableClass" />
                <label :for="`location-${location.code}`">{{ location.name }}</label>
              </div>
            </div>
          </div>
          <button
            class="BookingForm__Submit"
            @click="nextStep"
            v-if="noClasses !== -1"
            :disabled="swimmerLocation === null || swimmerName === '' || swimmerBirthday === null">Aceptar</button>
          <div v-if="noClasses === -1" class="BookingForm__NoResults">
            <p>No tenemos clase de tu nivel en esta sucursal por favor selecciona otra.</p>
          </div>
        </div>
        <div v-if="step === 2">
          <transition name="fade-answer">
            <div v-if="testProgress && !testFinished && swimmerCategory !== 'adultos'" class="BookingForm__Question">
              <p class="BookingForm__Answer__Title">{{ questionText }}</p>
              <button @click="checkAnswer('yes')" class="BookingForm__Answer">Sí</button>
              <button @click="checkAnswer('no')" class="BookingForm__Answer">No</button>
            </div>
            <div v-if="testProgress && !testFinished && swimmerCategory === 'adultos'" class="BookingForm__Question">
              <h4 class="BookingForm__Result__Title BookingForm__Answer__Title">¿Que clase te gustaria tomar?</h4>
              <button v-for="(option, index) in questionsData['adultos']" @click="checkAnswerAdult(option.yes)" class="BookingForm__Answer BookingForm__Answer__Adult" :key="`option--${index}`">{{ option.question }}</button>
            </div>
          </transition>
          <transition name="fade">
            <div v-if="testFinished && !testBooking" class="BookingForm__Result">
              <h4 class="BookingForm__Result__Title">¡FELICIDADES!</h4>
              <p class="BookingForm__Result__Text">Tu nivel es: <span v-html="result.display_text"></span></p>
              <div :class="spriteClass"></div>
              <button class="BookingForm__Submit" @click="fillForm">Agendar Clase</button>
            </div>
          </transition>
          <div v-if="calendarLoading" class="BookingForm__Loader">
            <div class="loader-circles"><div></div><div></div><div></div><div></div></div>
          </div>
          <transition name="fade">
            <div v-if="calendarLoaded" class="BookingForm__Loader">
              <div v-show="reservationsNum > 0">
                <p class="BookingForm__Loader__Label">Selecciona un día</p>
                <div class="BookingForm__Days">
                  <button
                    @click="filterDays('Mon')"
                    :disabled="reservationsDay['Mon'] === 0"
                    :class="{
                      'BookingForm__Days__Button': true,
                      'BookingForm__Days__Selected': selectedDay === 'Mon'
                    }"
                  >Lunes</button>
                  <button
                    @click="filterDays('Tue')"
                    :disabled="reservationsDay['Tue'] === 0"
                    :class="{
                      'BookingForm__Days__Button': true,
                      'BookingForm__Days__Selected': selectedDay === 'Tue'
                    }"
                  >Martes</button>
                  <button
                    @click="filterDays('Wed')"
                    :disabled="reservationsDay['Wed'] === 0"
                    :class="{
                      'BookingForm__Days__Button': true,
                      'BookingForm__Days__Selected': selectedDay === 'Wed'
                    }"
                  >Miércoles</button>
                  <button
                    @click="filterDays('Thu')"
                    :disabled="reservationsDay['Thu'] === 0"
                    :class="{
                      'BookingForm__Days__Button': true,
                      'BookingForm__Days__Selected': selectedDay === 'Thu'
                    }"
                  >Jueves</button>
                  <button
                    @click="filterDays('Fri')"
                    :disabled="reservationsDay['Fri'] === 0"
                    :class="{
                      'BookingForm__Days__Button': true,
                      'BookingForm__Days__Selected': selectedDay === 'Fri'
                    }"
                  >Viernes</button>
                  <button
                    @click="filterDays('Sat')"
                    :disabled="reservationsDay['Sat'] === 0"
                    :class="{
                      'BookingForm__Days__Button': true,
                      'BookingForm__Days__Selected': selectedDay === 'Sat'
                    }"
                  >Sábado</button>
                  <button
                    @click="filterDays('Sun')"
                    :disabled="reservationsDay['Sun'] === 0"
                    :class="{
                      'BookingForm__Days__Button': true,
                      'BookingForm__Days__Selected': selectedDay === 'Sun'
                    }"
                  >Domingo</button>
                </div>
                <div class="BookingForm__Calendar" v-html="calendarAjax">
                </div>
              </div>
              <div v-if="reservationsNum === 0" class="BookingForm__NoResults">
                <p class="book-steps-ready"><span class="book-steps-ready-newline">No hay clases disponibles.<br />Por favor selecciona otra sucursal, si tienes dudas</span><br /><span class="book-steps-ready-secondline">¡<span class="book-steps-ready-chat manychatbtn" @click="openChat">chatea con nosotros</span> o <a href="tel:+015555687300" class="book-steps-ready-phone">háblanos por teléfono</a>!</span></p>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker'
import { es } from 'vuejs-datepicker/dist/locale'

import find from 'lodash.find'
import findIndex from 'lodash.findindex'

import locationsData from './locations'
import questionsData from './questions'
import resultsData from './results'

export default {
  name: 'app',
  components: {
    Datepicker
  },
  data () {
    return {
      es,
      calendarWide: window.innerWidth < 650,
      locationsData,
      questionsData,
      resultsData,
      step: 1,
      noClasses: false,
      swimmerName: '',
      swimmerAge: 0,
      swimmerCategory: '',
      swimmerBirthday: null,
      swimmerLocation: null,
      swimmerLevel: null,
      birthdayDateFormated: null,
      birthdayDate: null,
      dates: {},
      currentQuestion: 0,
      questionText: '',
      result: {},
      spriteClass: '',
      spriteSmallClass: '',
      testBooking: false,
      testProgress: true,
      testFinished: false,
      calendarAjax: null,
      calendarLoaded: false,
      calendarLoading: false,
      reservationsNum: null,
      reservationsDay: {
        'Mon': 0,
        'Tue': 0,
        'Wed': 0,
        'Thu': 0,
        'Fri': 0,
        'Sat': 0,
        'Sun': 0
      },
      selectedDay: null
    }
  },
  created () {
    let today = new Date()
    let start = new Date()
    let end = new Date()
    end.setFullYear(today.getFullYear() - 70)
    start.setMonth(today.getMonth() - 3)
    this.dates = {
      from: new Date(start),
      to: new Date(end)
    }
    window.addEventListener('resize', (event) => {
      this.calendarWide = window.innerWidth < 650
    })
  },
  methods: {
    getBirthday (day) {
      let monthsName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      let today = new Date()
      let selectedDate = new Date(day)
      let age = today.getFullYear() - selectedDate.getFullYear()
      let months = today.getMonth() - selectedDate.getMonth()
      this.swimmerBirthday = day
      this.birthdayDateFormated = `${day.getDate()} - ${monthsName[day.getMonth()]} - ${day.getFullYear()}`
      this.birthdayDate = `${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}`
      this.swimmerAge = age * 12 + months

      this.swimmerCategory = this.swimmerAge >= 168 ? 'adultos' : this.swimmerAge >= 36 ? 'mayor3-anos' : 'menor3-anos'
      this.checkAvailableClass(this.swimmerCategory, this.swimmerLocation)
    },
    setAnswer (a) {
      this.swimmerLevel = (a).toLowerCase().replace(/-| |\//g, '_')
      this.result = this.resultsData[this.swimmerCategory][a]
      this.spriteClass = `Sprite Sprite__${this.swimmerLevel}`
      this.spriteSmallClass = `SpriteSmall SpriteSmall__${this.swimmerLevel}`
      this.testFinished = true
    },
    checkAvailableClass () {
      this.noClasses = (this.swimmerCategory && this.swimmerLocation) ? locationsData[this.swimmerLocation].classes.indexOf(this.swimmerCategory) : null
    },
    checkAnswer (answer) {
      let a = questionsData[this.swimmerCategory][this.currentQuestion][answer]
      if (!isNaN(a)) {
        let q = find(questionsData[this.swimmerCategory], { number: a })
        let qIndex = findIndex(questionsData[this.swimmerCategory], { number: a })
        this.questionText = q.question
        this.currentQuestion = qIndex
        this.testProgress = false
        setTimeout(() => {
          this.testProgress = true
        }, 100)
      } else {
        this.setAnswer(a)
      }
    },
    checkAnswerAdult (a) {
      this.setAnswer(a)
    },
    fillForm () {
      let that = this
      this.calendarLoading = true
      this.testBooking = true;
      (function ($) {
        $.ajax({
          url: 'https://www.ccnatacion.com/wp-content/themes/clubcanada/ajax.php',
          type: 'GET',
          data: {
            id: '507873',
            name: that.swimmerName,
            birth: that.birthdayDate,
            loc: that.swimmerLocation,
            cat1: that.result.cat_slug,
            date: new Date().getTime()
          },
          success: function (data) {
            data = data.replace('document.write', '')
            that.calendarAjax = data
            setTimeout(() => {
              that.calendarLoading = false
              that.calendarLoaded = true
              setTimeout(() => {
                that.reservationsNum = $('.responsive-table tbody tr').length
                Object.keys(that.reservationsDay).forEach(function (key) {
                  that.reservationsDay[key] = $('.responsive-table tbody tr td[data-title="Días"]:contains("' + key + '")').length
                })
              }, 500)
            }, 1000)
          }
        }).done(function () {})
      })(jQuery)
    },
    filterDays (day) {
      const that = this;
      (function ($) {
        let i = 0
        let elems = $('.responsive-table tbody tr td[data-title="Días"]:contains("' + day + '")')
        $('.responsive-table tbody tr').hide()
        for (; i < elems.length; i++) {
          $(elems[i].parentElement).fadeIn()
          that.selectedDay = day
        }
      })(jQuery)
    },
    bookingFormBack () {
      if (this.step === 2) {
        this.testBooking = false
        this.testProgress = true
        this.testFinished = false
        this.calendarAjax = null
        this.calendarLoaded = false
        this.calendarLoading = false
        this.noClasses = false
        this.swimmerLevel = null
        this.currentQuestion = 0
        this.questionText = ''
        this.reservationsNum = null
        this.selectedDay = null
        this.reservationsDay = {
          'Mon': 0,
          'Tue': 0,
          'Wed': 0,
          'Thu': 0,
          'Fri': 0,
          'Sat': 0,
          'Sun': 0
        }
        this.step = 1
      }
    },
    nextStep () {
      this.checkAvailableClass(this.swimmerCategory, this.swimmerLocation)
      if (this.noClasses > -1) {
        this.step = this.step + 1
        this.questionText = questionsData[this.swimmerCategory][0].question
      }
    },
    openChat () {
      if (MC) {
        MC.getWidget(5102739).open()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.BookingForm {
  width: 100%;
  background-color: #0d6cbf;
  background-image: url(https://www.ccnatacion.com/wp-content/themes/clubcanada/images/background_quienes-somos-club-canada.jpg);
  background-size: cover;
  background-position: 50%;
  border-radius: 10px;
  font-family: Poppins,-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
  transition: all 1s ease-in;
  h4 {
    color: #fff;
  }
  &__Step {
    display: flex;
    margin: 20px 0;
    padding: 30px 0;
    justify-content: center;
    @media (max-width: 650px) {
      padding: 20px 0;
      flex-wrap: wrap;
    }
    &Last {
      flex-wrap: wrap;
    }
  }
  &__Top {
    width: 100%;
    .BookingForm__Sidebar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
    }
  }
  &__Bottom {
    width: 100%;
  }
  &__Left {
    width: 310px;
    padding: 0 20px;
    @media (max-width: 650px) {
      text-align: center;
      width: 100%;
    }
    label {
      display: block;
      padding: 0 0 20px 0;
    }
    &__Expanded {
      width: 300px;
      @media (max-width: 650px) {
        width: 100%;
      }
    }
  }
  &__Right {
    width: 350px;
    text-align: center;
    &__Expanded {
      width: calc(100% - 300px);
      @media (max-width: 650px) {
        width: 100%;
        margin: 20px 0 0 0;
      }
    }
  }
  &__Sidebar {
    background: #fff;
    margin: 0;
    padding: 0 0 20px 0;
    width: 94%;
    margin: 0 auto;
    border-radius: 5px;
    text-align: left;
    @media (max-width: 650px) {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    p {
      color: #666;
      padding: 0 20px 10px 20px;
      margin: 0;
      @media (max-width: 650px) {
      }
    }
    &__Title {
      color: #0d6cbf;
      font-weight: bold;
      display: block;
      padding: 0;
      margin: 0;
    }
    &__Level {
      display: flex;
      align-items: center;
      p {
        padding: 0 0 0 15px;
        width: calc(100% - 55px);
        font-size: 14px;
      }
    }
    &__Reset {
      background: #12256f;
      color: #fff;
      cursor: pointer;
      width: calc(100% - 20px);
      display: block;
      padding: 10px;
      margin-bottom: 20px;
      word-spacing: 5px;
      &:hover {
        background: #f7e303;
        color: #12256f;
      }
    }
  }
  &__PlaceOptions{
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__Label {
    &Title {
      display: block;
      font-weight: bold;
      padding: 0 0 5px 0;
      color: #fff;
    }
  }
  &__Age {
    color: #f7e303;
    display: block;
    width: 100%;
    text-align: left;
    font-weight: bold;
    padding: 0 0 10px 10px;
    letter-spacing: 2px;
    @media (max-width: 650px) {
      width: auto;
    }
  }
  &__Question {
    width: calc(94% - 40px);
    margin: 0 auto;
    text-align: center;
    background: #fff;
    border-radius: 5px;
    padding: 20px;
    letter-spacing: 1px;
    p {
      color: #666;
      font-weight: bold;
      padding: 0;
      margin: 0 0 20px 0;
    }
  }
  &__Answer {
    width: 100px;
    margin: 0 20px;
    padding: 5px;
    color: #fff;
    border: 2px solid #fff;
    border-radius: 9px;
    background: #ff860e;
    font-size: 24px;
    font-family: Poppins,-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
    cursor: pointer;
    outline: none;
    &:focus {
      background: #ffb000;
      box-shadow: 0 0 8px rgba(255, 0, 10, .5);
    }
    &__Title {
      color: #0d6cbf !important;
      padding: 10px 0 20px 0 !important;
    }
    &__Adult {
      width: auto;
      margin: 5px;
      padding: 15px 20px;
      font-size: 16px;
    }
  }
  &__Result {
    text-align: center;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    &__Title {
      color: #0d6cbf;
      font-size: 24px;
      padding: 0;
      margin: 0;
    }
    &__Text {
      display: block;
      font-size: 20px;
      margin: 5px 0 20px 0;
      color: #fff;
      text-decoration: none;
      text-transform: none;
      span {
        padding: 0 5px;
        background: #f7e303;
        color: #12256f;
      }
    }
  }
  &__Input {
    width: calc(100% - 24px);
    height: 22px;
    padding: 7px 10px;
    border-radius: 4px;
    color: #0d6cbf;
    border: 2px solid #ff860e;
    letter-spacing: 1px;
    font-weight: bold;
    font-size: 17px;
    outline: none;
    &:focus {
      border: 2px solid #ff860e;
      box-shadow: 0 0 8px rgba(255, 0, 10, .5);
    }
  }
  &__Radio {
    display: inline-block;
    input[type="radio"] {
      display: none;
      & + label {
        display: block;
        padding: 10px;
        margin: 5px;
        border-radius: 4px;
        letter-spacing: 1px;
        background: #ff860e;
        border: 1px solid #ff860e;
        color: #fff;
        font-weight: bold;
        font-size: 16px;
      }
      &:checked + label {
        font-weight: bold;
        color: #12256f;
        background: #f7e303;
        border: 1px solid #f7e303;
      }
    }
  }
  &__Submit {
    width: 200px;
    margin: 30px 0 0 0;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #0d6cbf;
    background: #12256f;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    font-family: Poppins,-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
    &:disabled {
      background: #dbdbdb;
      color: #a1a1a1;
      border: 1px solid #a1a1a1;
    }
    &:focus {
      border: 1px solid #ff860e;
      background: #12256f;
      box-shadow: 0 0 8px rgba(255, 0, 10, .5);
    }
  }
  &__Days {
    &__Button {
      border: none;
      border-radius: 5px;
      background: #f7e303;
      color: #12256f;
      font-size: 15px;
      padding: 10px 15px;
      margin: 10px;
      &:disabled{
        background: #dbdbdb !important;
        color: #a1a1a1 !important;
      }
    }
    &__Selected {
      background: #12256f;
      color: #fff;
    }
  }
  &__Calendar {
    color: #666;
    background: #fff;
    max-height: 480px;
    margin: 10px auto 0 auto;
    border-radius: 9px;
    overflow: scroll;
    padding: 0 20px;
    width: calc(94% - 40px);
  }
  &__Loader {
    margin: 0 auto 20px auto;
    text-align: center;
    &__Label {
      color: #fff;
      padding: 0;
      margin: 10px 0 0 0;
    }
  }
  &__NoResults {
    p {
      color: #fff;
    }
  }
}
.Sprite {
  background: url(https://www.ccnatacion.com/wp-content/themes/stockholm-child/img/programas/sprite.png) no-repeat;
  display: inline-block;
  overflow: hidden;
  text-indent: -9999px;
  text-align: left;
  &__individual {
    background-position: -33px -11px;
    width: 247px;
    height: 144px
  }
  &__estrella {
    background-position: -23px -1586px;
    width: 234px;
    height: 219px
  }
  &__tortuga {
    background-position: -33px -11px;
    width: 247px;
    height: 144px
  }
  &__caballo {
    background-position: -81px -197px;
    width: 152px;
    height: 237px
  }
  &__payaso {
    background-position: -35px -464px;
    width: 243px;
    height: 139px
  }
  &__foca {
    background-position: -37px -653px;
    width: 244px;
    height: 238px
  }
  &__delfin {
    background-position: -31px -937px;
    width: 249px;
    height: 192px
  }
  &__mantarraya {
    background-position: -21px -1193px;
    width: 241px;
    height: 143px
  }
  &__espada {
    background-position: -32px -1392px;
    width: 235px;
    height: 126px
  }
  &__adultoind {
    background-position: -38px -2690px;
    width: 249px;
    height: 171px
  }
  &__adultogrp {
    background-position: -11px -2482px;
    width: 273px;
    height: 152px
  }
  &__aquaaerobics {
    background-position: -73px -1869px;
    width: 154px;
    height: 251px
  }
  &__aquayoga {
    background-position: -97px -2207px;
    width: 98px;
    height: 229px
  }
  &__mb_ng {
    background-position: -23px -1586px;
    width: 234px;
    height: 219px
  }
  &__mb_g {
    background-position: -23px -1586px;
    width: 234px;
    height: 219px
  }
  &__mb_c {
    background-position: -23px -1586px;
    width: 234px;
    height: 219px
  }
}

.fade-enter-active {
  transition: opacity .5s;
}
.fade-enter {
  opacity: 0;
}
.fade-answer-enter-active {
  transition: opacity 1s;
}
.fade-answer-enter {
  opacity: 0;
}
.fade-leave-active, .fade-leave-to {
  display: none;
}
</style>
