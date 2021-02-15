import React from 'react'

import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Routes } from './components/Routes' // where we are going to specify our routes
import io from 'socket.io-client'
import Swal from 'sweetalert2'

// null
var path = null
var default_error = new Error("Environment not properly set!")
let environment = process.env.NODE_ENV || 'development'

switch (environment) {
    case 'production':
        path = 'https://tentti-fullstack.herokuapp.com'
        break
    case 'development':
        // kuunnellaan serveriä portissa 4000
        path = 'http://localhost:4000'
        break
    case 'test':
        path = 'http://localhost:4000'
        break
    default:
        throw default_error
}

console.log("WebSocket kuuntelee ilmoituksia")
let socket = io(path)
socket.on('connected', function (data) {
  socket.emit('ready for data', {})
});
socket.on('update', function (data) {

  const alert_data = JSON.parse(data.message.payload)
  console.log("Trigger: " + alert_data.trigger)
  switch (alert_data.trigger) {
    case 'insert_tentti':
      console.log('Uusi tentti ' + alert_data.row.nimi + ' lisätty!')
      Swal.fire({
        title: '<strong>Uusi tentti <i>' + alert_data.row.nimi + '</i> lisätty!</strong>',
        html: '<pre style="text-align: left;">' +
          '<b>id:</b>\t\t\t' + alert_data.row.id + '<br/>' +
          '<b>nimi:</b>\t\t\t' + alert_data.row.nimi + '<br/>' +
          '<b>suoritettu:</b>\t\t' + alert_data.row.suoritettu + '<br/>' +
          '<b>aloitus:</b>\t\t' + alert_data.row.aloitus + '<br/>' +
          '<b>lopetus:</b>\t\t' + alert_data.row.lopetus + '<br/>' +
          '<b>minimipisteraja:</b>\t' + alert_data.row.minimipisteraja +
          '</pre>',
        timer: 10000,
        timerProgressBar: true,
        position: 'bottom-end',
        icon: 'success',
      })
      break
    case 'delete_tentti':
      console.log('Tentti ' + alert_data.row.nimi + ' poistettu!')
      Swal.fire({
        title: '<strong>Tentti <i>' + alert_data.row.nimi + '</i> poistettu!</strong>',
        html: '<pre style="text-align: left;">' +
          '<b>id:</b>\t\t\t' + alert_data.row.id + '<br/>' +
          '<b>nimi:</b>\t\t\t' + alert_data.row.nimi + '<br/>' +
          '<b>suoritettu:</b>\t\t' + alert_data.row.suoritettu + '<br/>' +
          '<b>aloitus:</b>\t\t' + alert_data.row.aloitus + '<br/>' +
          '<b>lopetus:</b>\t\t' + alert_data.row.lopetus + '<br/>' +
          '<b>minimipisteraja:</b>\t' + alert_data.row.minimipisteraja +
          '</pre>',
        timer: 10000,
        timerProgressBar: true,
        position: 'bottom-end',
        icon: 'warning',
      })
      break
    case 'insert_kurssi':
      console.log('Uusi kurssi ' + alert_data.row.nimi + ' lisätty!')
      Swal.fire({
        title: '<strong>Uusi kurssi <i>' + alert_data.row.nimi + '</i> lisätty!</strong>',
        html: '<pre style="text-align: left;">' +
          '<b>id:</b>\t\t\t' + alert_data.row.id + '<br/>' +
          '<b>nimi:</b>\t\t\t' + alert_data.row.nimi + '<br/>' +
          '<b>aloitus:</b>\t\t' + alert_data.row.aloitus + '<br/>' +
          '<b>lopetus:</b>\t\t' + alert_data.row.lopetus + '<br/>' +
          '</pre>',
        timer: 10000,
        timerProgressBar: true,
        position: 'bottom-end',
        icon: 'success',
      })
      break
    case 'delete_kurssi':
      console.log('Kurssi ' + alert_data.row.nimi + ' poistettu!')
      Swal.fire({
        title: '<strong>Kurssi <i>' + alert_data.row.nimi + '</i> poistettu!</strong>',
        html: '<pre style="text-align: left;">' +
          '<b>id:</b>\t\t\t' + alert_data.row.id + '<br/>' +
          '<b>nimi:</b>\t\t\t' + alert_data.row.nimi + '<br/>' +
          '<b>aloitus:</b>\t\t' + alert_data.row.aloitus + '<br/>' +
          '<b>lopetus:</b>\t\t' + alert_data.row.lopetus + '<br/>' +
          '</pre>',
        timer: 10000,
        timerProgressBar: true,
        position: 'bottom-end',
        icon: 'warning',
      })
      break
    default:
      console.log("Jotain meni pahasti pieleen...")
      break
  }

})

ReactDOM.render(
  <Router>
    <Routes />
  </Router>,
  document.getElementById('root')
)