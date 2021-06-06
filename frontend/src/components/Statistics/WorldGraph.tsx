import { setDate } from 'date-fns/esm';
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-charts';
import PersonIcon from '@material-ui/icons/Person';
import Typography from '@material-ui/core/Typography';
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

export const WorldGraph = ({world_id}) => {
  const [data, setData] = useState([
    {
      label: "Users Joined",
      datums: [],
    }
  ])
  const [loading, setLoading] = useState(1)
  const [axes, setAxes] = useState([])
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    startDate.setDate(startDate.getDate() - 7)
  }, [])

  useEffect(() => {
    const datums1 = []
    startDate.setSeconds(0,0)
    endDate.setSeconds(0,0)

    StatisticService.getWorldCharts(world_id, startDate.toISOString(), endDate.toISOString())
        .then((res) =>{
          if (res.status === 200)
            return res.json();
        })
        .then((res) =>{
          if (res){
            for (let i = 0; i < res.length; i++) {
              for (const [key, value] of Object.entries(res[i])) {
                datums1.push({x: new Date(new Date(key).toISOString()), y: value})
              }
            }
            
            setAxes([{ primary: true, type: 'time', position: 'bottom' },{ type: 'linear', position: 'left' }])

            setData([
              {
                label: "Users Joined",
                datums: datums1,
              }
            ])
                
            setLoading(0)
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
            World Activity
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
      </div>
      <br />
    </>
  )
}