import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { strings } from './Locale'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const data = {
  labels: ['kivi', 'magmakivilajit', 'metaforiset kivilajit', 'javascript'],
  datasets: [{
    data: [getRandomInt(1, 3), getRandomInt(3, 5), getRandomInt(5, 7), getRandomInt(7, 10)],
    backgroundColor: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#25CE56'
    ],
    hoverBackgroundColor: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#25CE56'
    ]
  }]
}

const DoughnutChart = () => (
  <>
    <div className='header'>
      <h1 className='title'>2. {strings.esimerkki} {strings.kaavio}</h1>
    </div>
    <Doughnut data={data} />
  </>
)

export default DoughnutChart
