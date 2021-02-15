import React from 'react'
import { HorizontalBar } from 'react-chartjs-2'
import { strings } from './Locale'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const data = {
    labels: ['kivi', 'magmakivilajit', 'metaforiset kivilajit', 'javascript'],
    datasets: [
        {
            label: '# oikeista vastauksista',
            data: [getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10), getRandomInt(1, 10)],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(255, 206, 86, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
        },
    ],
}

const options = {
    legend: {
      display: true
    },
    scales: {
      xAxes: [{
        display: true,
        ticks: {
          min: 0
        }
      }],
      yAxes: [{
        display: true
      }],
    }
  }

const HorizontalBarChart = () => (
    <>
        <div className='header'>
            <h1 className='title'>1. {strings.esimerkki} {strings.kaavio}</h1>
        </div>
        <HorizontalBar data={data} options={options} />
    </>
)

export default HorizontalBarChart