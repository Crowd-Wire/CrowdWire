import { setDate } from 'date-fns/esm';
import React, { useEffect, useState } from 'react';
//
import { Chart } from 'react-charts';
import PersonIcon from '@material-ui/icons/Person';
import Typography from '@material-ui/core/Typography';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useNavigate } from "react-router-dom";
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import StatisticService from 'services/StatisticService';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'


export const customTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0359ff',
    }
  },
  overrides: {
    MuiInputBase: {
      input: {
        color: 'white'
      },
    },
    MuiFormLabel: {
      root: {
        color: 'white',
      },
    },
  }
})

export const Graph = () => {
  const [data, setData] = useState([
    {
      label: "Active Users",
      datums: [],
    },
    {
      label: "New Users",
      datums: [],
    },
  ])
  const [loading, setLoading] = useState(1)
  const [axes, setAxes] = useState([])
  const navigation = useNavigate();
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    startDate.setDate(startDate.getDate() - 7)
  }, [])

  useEffect(() => {
    const datums1 = []
    const datums2 = []

    StatisticService.getActiveOnlineUsersCharts(startDate.toISOString(), endDate.toISOString())
        .then((res) =>{
          if (res.status === 200)
            return res.json();
        })
        .then((res) =>{
          console.log(res)
          if (res){
            for (let i = 0; i < res.length; i++) {
              for (const [key, value] of Object.entries(res[i])) {
                //@ts-ignore
                let key_final = key.replace(" ", 'T')
                key_final = key_final.substring(0, key_final.length-15)
                key_final += '00.000Z'
                datums1.push({x: new Date(key_final), y: value})
              }
            }
            StatisticService.getNewRegisteredUsersCharts(startDate.toISOString(), endDate.toISOString())
              .then((res) =>{
                if (res.status === 200)
                  return res.json();
              })
              .then((res) =>{
                console.log(res)
                if (res){
                  for (let i = 0; i < res.length; i++) {
                    for (const [key, value] of Object.entries(res[i])) {
                      //@ts-ignore
                      let key_final = key.replace(" ", 'T')
                      key_final = key_final.substring(0, key_final.length-15)
                      key_final += '00.000Z'
                      datums2.push({x: new Date(key_final), y: value})
                    }
                  }
                  setAxes([{ primary: true, type: 'time', position: 'bottom' },{ type: 'linear', position: 'left' }])
            
                  setData([
                    {
                      label: "Active Users",
                      datums: datums1,
                    },
                    {
                      label: "New Users",
                      datums: datums2,
                    }
                  ])
                
                  setLoading(0)
      
                }
              })
          }
        })
    

  }, [startDate, endDate]);

  if (loading) {
    return (
      <div style={{width: '100%', textAlign: 'center'}}>
        <Typography variant="h6" component="h6" gutterBottom  style={{fontWeight: 600, color: 'white', margin: 'auto'}}>
          Loading...
        </Typography>
      </div>
    )
  }

  return (
    <>
    
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '18px',
          height: '100%',
          width: '100%',
          background: 'rgba(0, 27, 45, 0.9)'
        }}
      >
        <div
          style={{
            flex: '0 0 auto',
            padding: '10px',
            paddingBottom: 0
          }}
        >
          <Typography variant="h6" component="h6" gutterBottom  style={{fontWeight: 600, color: 'white'}}>
            Platform Activity
          </Typography>
        </div>
        <div
          style={{
            flex: '0 0 auto',
            margin: 'auto'
          }}>
          <MuiThemeProvider theme={customTheme}>
            <MuiPickersUtilsProvider  utils={DateFnsUtils}>
                <DateTimePicker label="Start Date" value={startDate} onChange={setStartDate} style={{color: 'white'}}/>
                <DateTimePicker label="End Date" value={endDate} onChange={setEndDate} style={{color: 'white'}}/>
            </MuiPickersUtilsProvider>
          </MuiThemeProvider>
        </div>
        <div
          style={{
            flex: 2,
            maxHeight: '400px',
          }}
        >
          <Chart
            data={data}
            series={{showPoints: false}}
            axes={axes}
            tooltip
            dark
            primaryCursor={{
              render: props => (
                <span style={{ fontSize: '1rem' }}>
                  <span role="img" aria-label="icon">
                    🕑
                  </span>{' '}
                  {(props.formattedValue || '').toString()}
                </span>
              )
            }}
            secondaryCursor={{
              render: props => (
                <span style={{ fontSize: '1rem' }}>
                  <span role="img" aria-label="icon">
                    <PersonIcon style={{fontWeight: 600, color: 'white'}}/>
                  </span>{' '}
                  {(props.formattedValue || '').toString()}
                </span>
              )
            }}/>
        </div>
        <div
          style={{
            flex: '0 0 auto',
            padding: '10px',
          }}
        >
          <Typography variant="h6" onClick={() => navigation('/admin/statistics')}  component="h6" gutterBottom 
            style={{cursor: 'pointer', fontWeight: 600, color: '#2b9bfd', float: 'right', paddingTop: 20, marginBottom: -25}}>
            <NavigateNextIcon /> Check Out More Statistics
          </Typography>
        </div>
      </div>
      <br />
    </>
  )
}